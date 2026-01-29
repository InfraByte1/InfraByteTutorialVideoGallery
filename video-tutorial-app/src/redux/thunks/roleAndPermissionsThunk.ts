import { getRolesPermissionsByUserId, getPermissionsBySubscription } from "../../services/auth.service";

import type { PermissionsBySubscription, RolePermissions } from "../interfaces/permissions/roleAndPermissions";

import { createGetThunk } from "../utils/createGetThunk";

export const getRolesAndPermissionsByUserId = createGetThunk<
  RolePermissions[],
  string
>("accounts/getRolesPermissionsByUserId", (userId: string) =>
  getRolesPermissionsByUserId(userId)
);

export const getPermissionBySubscription = createGetThunk<
  PermissionsBySubscription[],
  string
>("accounts/getPermissionsBySubscription", (subscription: string) =>
  getPermissionsBySubscription(subscription)
);
