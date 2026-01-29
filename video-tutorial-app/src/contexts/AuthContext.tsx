import React, { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEY } from "../data/constants";
import { jwtDecode } from "jwt-decode";

// Types
interface User {
  name: string;
  branchName: string;
  branchId: string;
  driverId: string;
  profileImage: string;
  tenantSubscription: string;
  isSuperAdmin: boolean;
  isSystemAdmin: boolean;
}

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  loginUser: () => void;
  logout: () => void;
  isRouteAllowed: (route: string) => boolean;
  checkPermission: (route: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  const normalizeSubscriptions = (
    tenantSubscription: string | string[] | null | undefined,
  ): string[] => {
    return Array.isArray(tenantSubscription)
      ? tenantSubscription
      : tenantSubscription != null
        ? [tenantSubscription.toString()]
        : [];
  };
  const storeUserAndToken = async () => {
    setLoading(true);
    const storedToken = localStorage.getItem(STORAGE_KEY);

    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken);
        const name = `${decoded["http://schemas.a1gaas.com/identity/claims/firstName"]} ${decoded["http://schemas.a1gaas.com/identity/claims/middleName"]} ${decoded["http://schemas.a1gaas.com/identity/claims/lastName"]}`;
        const branchName =
          decoded["http://schemas.a1gaas.com/identity/claims/branchname"];
        const branchId =
          decoded["http://schemas.a1gaas.com/identity/claims/branchid"];
        const profileImage =
          decoded["http://schemas.a1gaas.com/identity/claims/ProfileImage"];
        var tenantSubscription =
          decoded[
            "http://schemas.a1gaas.com/identity/claims/tenantSubscription"
          ];
        const driverId = decoded["sub"];

        setAccessToken(storedToken);

        let isSuperAdmin = false;
        let isSystemAdmin = false;
        let allPermissions: string[] = [];

        try {
          const subs = normalizeSubscriptions(tenantSubscription);

          if (subs.some((s) => s.includes("InfraByte Basic Job Booking"))) {
            tenantSubscription = "InfraByte Basic Job Booking";
          }
        } catch (permErr) {
          console.error("Failed to fetch roles and permissions:", permErr);
        }

        setPermissions(allPermissions);

        setUser({
          name,
          branchName,
          branchId,
          driverId,
          profileImage,
          tenantSubscription,
          isSuperAdmin,
          isSystemAdmin,
        });
      } catch (e) {
        console.error("Failed to decode token", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    storeUserAndToken();
  }, []);

  const loginUser = async () => {
    await storeUserAndToken();
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);

    setAccessToken(null);
    setUser(null);
    setPermissions([]);
  };

  const isRouteAllowed = (): boolean => {
    if (!user) return false;

    if (user.isSuperAdmin) {
      return true;
    }

    return true;
  };

  const checkPermission = (permission: string | string[]): boolean => {
    if (
      user != null &&
      user!.isSuperAdmin
      // ||
      // (typeof user!.tenantSubscription === "string" &&
      //   user!.tenantSubscription.trim() === "InfraByte Basic Job Booking")
    ) {
      return true;
    }
    const permissionList = Array.isArray(permission)
      ? permission
      : [permission];

    return permissionList.some((p) => permissions.includes(p));
  };

  // const isRouteAllowed = (route: string): boolean => {
  //   if (!user) return false;

  //   if (user.isSuperAdmin) {
  //     return true;
  //   }

  //   const subs = Array.isArray(user.tenantSubscription)
  //     ? user.tenantSubscription
  //     : [user.tenantSubscription];

  //   // Merge all allowed routes from all subscriptions
  //   const allowedRoutes = subs.flatMap(
  //     (sub) => subscriptionPermissions[sub] || []
  //   );

  //   return allowedRoutes.includes(route);
  // };

  // const checkPermission = (permission: string): boolean => {
  //   if (user != null && user!.isSuperAdmin) {
  //     return true;
  //   }
  //   return true;
  //   return permissions.includes(permission);
  // };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        loading,
        loginUser,
        logout,
        isRouteAllowed,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
