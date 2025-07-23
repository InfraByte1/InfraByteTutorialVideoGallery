import React, { createContext, useContext, useState, useEffect } from "react";
import { getRolesPermissionsByUserId } from "../services/auth";
import { category } from "../data/category";
import { mobileCategory } from "../data/mobile_category";
import { jwtDecode } from "jwt-decode";

// Create context
const PermissionContext = createContext(undefined);

// Utility function to check if user has any permission for an item 
const hasItemPermission = (roles, categoryKey, categoryKey2) => {
  const isSuperAdmin = roles.some((role) => role.roleName === "Super Admin");
  if (isSuperAdmin) return true;

  return roles.some(
    (role) =>
      Array.isArray(role?.permissions) &&
      (role.permissions.some((perm) => perm.startsWith(categoryKey)) ||
        (categoryKey2 && role.permissions.some((perm) => perm === categoryKey2)))
  );
};

// Utility function to filter categories based on permissions
const filterCategoriesByPermissions = (categories, roles) => {
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
      const data = await getRolesPermissionsByUserId(userId);
      //   if (!response.ok) {
      //     throw new Error(`HTTP error! Status: ${response.status}`);
      //   }
    //   console.log(data);
      //   const data = await response.json();
      // Validate data is an array
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format: Expected an array of roles");
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
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      setError(error.message || "Unknown error occurred");
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
    const isSuperAdmin = roles.some((role) => role.roleName === "Super Admin");
    if (isSuperAdmin) return true;

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
