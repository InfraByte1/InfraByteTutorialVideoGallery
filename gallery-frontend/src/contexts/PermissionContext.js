import React, { createContext, useContext, useState, useEffect } from "react";
import { getRolesPermissionsByUserId } from "../services/auth";
import {
  ALL_ACCESS_ROLES,
  getTokenRoleNames,
  hasAllAccessRole,
} from "../services/permissions";
import { category } from "../data/category";
import { mobileCategory } from "../data/mobile_category";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";
import { oidcConfig } from "../config/config";

// Create context
const PermissionContext = createContext(undefined);

const CACHE_KEY = "globalPermissions";

/**
 * Roles for the user, ready for filtering.
 *
 * Roles in ALL_ACCESS_ROLES (Super Admin, System Admin) see every video
 * category. Everyone else only sees what their role permissions allow. The role
 * list from the API is normally enough, but the access token carries the same
 * role names, so an all-access role found only there still counts.
 */
export const loadRoles = async (userId, token) => {
  const apiRoles = await getRolesPermissionsByUserId(userId);
  if (!Array.isArray(apiRoles)) return apiRoles; // caller reports bad format

  // A role without a permissions list must stay visible so its name still counts.
  const roles = apiRoles.map((role) =>
    role && typeof role === "object"
      ? { ...role, permissions: Array.isArray(role.permissions) ? role.permissions : [] }
      : role
  );

  const known = new Set(roles.map((role) => role && role.roleName));
  getTokenRoleNames(token)
    .filter((name) => ALL_ACCESS_ROLES.includes(name) && !known.has(name))
    .forEach((name) =>
      roles.push({ roleId: `token-${name}`, roleName: name, permissions: [] })
    );

  return roles;
};

// The cache is tied to the user so one person's permissions are never reused
// for another account signed in on the same tab.
const readCache = (userId) => {
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(cached, oidcConfig.secretCrypt);
    const parsed = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    if (parsed && parsed.userId === userId && Array.isArray(parsed.roles)) {
      return parsed.roles;
    }
  } catch (err) {
    console.error("Failed to decrypt cached permissions:", err);
  }
  // Old format, other user or unreadable: drop it and fetch fresh.
  sessionStorage.removeItem(CACHE_KEY);
  return null;
};

const writeCache = (userId, roles) => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify({ userId, roles }),
    oidcConfig.secretCrypt
  ).toString();
  sessionStorage.setItem(CACHE_KEY, encrypted);
};

// Utility function to check if user has any permission for an item
const hasItemPermission = (roles, categoryKey, categoryKey2) => {
  if (hasAllAccessRole(roles.map((role) => role.roleName))) return true;

  return roles.some(
    (role) =>
      Array.isArray(role?.permissions) &&
      (role.permissions.some((perm) => perm.startsWith(categoryKey)) ||
        (categoryKey2 &&
          role.permissions.some((perm) => perm === categoryKey2)))
  );
};

// Utility function to filter categories based on permissions
export const filterCategoriesByPermissions = (categories, roles) => {
  return categories
    .map((cat) => ({
      ...cat,
      subcategories: cat.subcategories
        .map((subcat) => ({
          ...subcat,
          items: subcat.items.filter((item) =>
            hasItemPermission(roles, item.categoryKey, item.categoryKey2)
          ),
        }))
        .filter((subcat) => subcat.items.length > 0),
    }))
    .filter((cat) => cat.subcategories.length > 0);
};

export const PermissionProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [filteredWebCategories, setFilteredWebCategories] = useState([]);
  const [filteredMobileCategories, setFilteredMobileCategories] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const fetchPermissions = async (userId) => {
    setIsLoaded(false);
    setError(null);

    try {
      let data;
      // Check sessionStorage and JWT expiration
      const token = localStorage.getItem("access_token");
      let isTokenValid = false;

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
          isTokenValid = decodedToken.exp > currentTime; // Check if token is still valid
        } catch (err) {
          console.error("Failed to decode token for expiration check:", err);
        }
      }

      if (isTokenValid) {
        data = readCache(userId);
      }

      const fetchedFresh = !data;
      if (fetchedFresh) {
        // Fetch permissions from the API; only cache them once we know
        // the shape is valid, so a malformed/error response never gets
        // persisted as if it were a good cache entry.
        data = await loadRoles(userId, token);
      }

      // Validate data is an array
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format: Expected an array of roles");
      }

      if (fetchedFresh) {
        writeCache(userId, data);
      }

      // Validate each role has a permissions array
      const validRoles = data.filter(
        (role) =>
          role &&
          typeof role === "object" &&
          Array.isArray(role.permissions) &&
          typeof role.roleId === "string" &&
          typeof role.roleName === "string"
      );
      setRoles(validRoles);
      // Filter web and mobile categories based on permissions
      const filteredWeb = filterCategoriesByPermissions(category, validRoles);
      const filteredMobile = filterCategoriesByPermissions(
        mobileCategory,
        validRoles
      );
      setFilteredWebCategories(filteredWeb);
      setFilteredMobileCategories(filteredMobile);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      setError(error.message || "Unknown error occurred");
    } finally {
      // Always resolve the loading state, even on failure — otherwise
      // isLoaded gets stuck false forever and consumers (e.g.
      // VideoListsPage's effect) never re-run to show the error or retry.
      setIsLoaded(true);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken["sub"];
        if (userId) {
          fetchPermissions(userId);
        }
      } catch (err) {
        console.error("Failed to decode token:", err);
        setError("Invalid token");
        setIsLoaded(true);
      }
    } else {
      setIsLoaded(true); // No token, allow UI to proceed
    }
  }, []);

  const hasPermission = (permission) => {
    // Check for Super Admin role to grant full access
    if (hasAllAccessRole(roles.map((role) => role.roleName))) return true;

    return roles.some(
      (role) =>
        Array.isArray(role?.permissions) &&
        role.permissions.includes(permission)
    );
  };

  return (
    <PermissionContext.Provider
      value={{
        roles,
        hasPermission,
        isLoaded,
        error,
        filteredWebCategories,
        filteredMobileCategories,
        fetchPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};
