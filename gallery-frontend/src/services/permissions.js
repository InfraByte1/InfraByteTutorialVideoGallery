import { jwtDecode } from "jwt-decode";

/**
 * Who can do what with tutorial videos - the single place to change it.
 *
 *  - SEE videos: every signed-in user. What a normal user sees is limited by the
 *    permissions on their role. ALL_ACCESS_ROLES see every category.
 *  - ADD / EDIT / DELETE videos (a "video manager"):
 *      - Super Admin (InfraByte platform staff) - always, or
 *      - System Admin of the InfraByte company itself (VIDEO_MANAGER_TENANT_IDS).
 *    "System Admin" is the top role inside EVERY customer company, so the role
 *    alone cannot tell InfraByte's people from a customer's admin - the company
 *    list is what does. Everyone else is blocked.
 *
 * To let another company's admins manage videos, add their tenantId (the
 * ".../claims/tenantId" claim in their access token) to the list below.
 *
 * Note: this only controls what the website shows. The tutorial upload/update/
 * delete API endpoints currently accept any signed-in user, so the API needs
 * its own check for this to be a real restriction.
 */
export const SUPER_ADMIN = "Super Admin";
export const SYSTEM_ADMIN = "System Admin";

export const ALL_ACCESS_ROLES = [SUPER_ADMIN, SYSTEM_ADMIN];

// The InfraByte platform tenant (GlobalConst.TenantId in infrabyte-jobbooking, the
// same check the portal uses for "InfraByte staff"). Empty the list to allow
// Super Admin only.
export const VIDEO_MANAGER_TENANT_IDS = [
  "bc03a759-b676-46de-b398-b2c854070deb",
];

const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const TENANT_CLAIM = "http://schemas.a1gaas.com/identity/claims/tenantId";

const toArray = (value) =>
  value == null ? [] : Array.isArray(value) ? value : [value];

// Role names in the access token (a single role comes back as a string).
export const getTokenRoleNames = (token) => {
  try {
    return toArray(jwtDecode(token)[ROLE_CLAIM])
      .map((r) => String(r).trim())
      .filter(Boolean);
  } catch (err) {
    return [];
  }
};

export const hasAllAccessRole = (roleNames) =>
  roleNames.some((name) => ALL_ACCESS_ROLES.includes(name));

const sameId = (a, b) =>
  String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

// roleNames: the user's role names; tenantId: their company's id (may be empty).
export const isVideoManager = (roleNames, tenantId) => {
  if (roleNames.includes(SUPER_ADMIN)) return true;
  return (
    roleNames.includes(SYSTEM_ADMIN) &&
    !!tenantId &&
    VIDEO_MANAGER_TENANT_IDS.some((id) => sameId(id, tenantId))
  );
};

// Reads the current access token; false when signed out or the token expired.
export const canManageVideos = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return false;
  try {
    const claims = jwtDecode(token);
    if (claims.exp && claims.exp <= Math.floor(Date.now() / 1000)) return false;
    return isVideoManager(getTokenRoleNames(token), claims[TENANT_CLAIM]);
  } catch (err) {
    return false;
  }
};
