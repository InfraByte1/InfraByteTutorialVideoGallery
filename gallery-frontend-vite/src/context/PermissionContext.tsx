import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface PermissionContextValue {
  permissions: unknown;
  // TODO: stubbed — no real backend call has been specified for this yet.
  // Wire this up to the actual permissions endpoint once you have it; until
  // then this just clears any stale cached value so nothing reads
  // last-user's permissions for a new sign-in.
  fetchPermissions: (userId: string) => Promise<void>;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const [permissions, setPermissions] = useState<unknown>(null);

  const fetchPermissions = useCallback(async (_userId: string) => {
    setPermissions(null);
  }, []);

  const value = useMemo(() => ({ permissions, fetchPermissions }), [permissions, fetchPermissions]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export const usePermissions = (): PermissionContextValue => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};
