// export type RolePermissions = Root2[]

export interface RolePermissions {
  roleId: string;
  tenantId: string;
  roleName: string;
  permissions: string[];
}

export type PermissionsBySubscription = string[];

export interface RolePermissionsState {
  rolePermissions: RolePermissions[] | null;
  permissionsBySubscription: PermissionsBySubscription[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  loading: boolean;
}
