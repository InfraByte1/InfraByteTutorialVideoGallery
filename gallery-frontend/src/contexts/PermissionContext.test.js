import { category } from "../data/category";
import { filterCategoriesByPermissions, loadRoles } from "./PermissionContext";
import { getRolesPermissionsByUserId } from "../services/auth";
import {
  VIDEO_MANAGER_TENANT_IDS,
  canManageVideos,
  getTokenRoleNames,
  isVideoManager,
} from "../services/permissions";

jest.mock("axios", () => ({ get: jest.fn() }));
jest.mock("../services/auth", () => ({
  getRolesPermissionsByUserId: jest.fn(),
  getHeaders: jest.fn(() => ({})),
}));

const b64 = (o) =>
  Buffer.from(JSON.stringify(o)).toString("base64").replace(/=+$/, "");
const makeToken = (claims) => `${b64({ alg: "none" })}.${b64(claims)}.sig`;
const ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const TENANT = "http://schemas.a1gaas.com/identity/claims/tenantId";
const future = () => Math.floor(Date.now() / 1000) + 3600;

const items = (cats) =>
  cats.flatMap((c) => c.subcategories.flatMap((s) => s.items.map((i) => i.title)));
const allItems = items(category);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("who can see videos", () => {
  test("System Admin with empty permissions sees every category", async () => {
    getRolesPermissionsByUserId.mockResolvedValue([
      { roleId: "r1", roleName: "System Admin", permissions: [] },
    ]);
    const roles = await loadRoles("u1", makeToken({}));
    expect(items(filterCategoriesByPermissions(category, roles))).toEqual(allItems);
  });

  test("Super Admin sees every category", () => {
    const roles = [{ roleId: "r", roleName: "Super Admin", permissions: [] }];
    expect(items(filterCategoriesByPermissions(category, roles))).toEqual(allItems);
  });

  test("an admin role only present in the token still counts", async () => {
    getRolesPermissionsByUserId.mockResolvedValue([]);
    const roles = await loadRoles("u1", makeToken({ [ROLE]: ["System Admin"] }));
    expect(items(filterCategoriesByPermissions(category, roles))).toEqual(allItems);
  });

  test("a role with null permissions is kept and treated as empty", async () => {
    getRolesPermissionsByUserId.mockResolvedValue([
      { roleId: "r1", roleName: "System Admin", permissions: null },
    ]);
    const roles = await loadRoles("u1", makeToken({}));
    expect(roles[0].permissions).toEqual([]);
  });

  test("other roles still only see what they were granted", async () => {
    getRolesPermissionsByUserId.mockResolvedValue([
      {
        roleId: "r2",
        roleName: "Yard Supervisor",
        permissions: ["Permissions.WebPermissions.Inventories.InStock.ListView"],
      },
    ]);
    const roles = await loadRoles("u1", makeToken({ [ROLE]: "Yard Supervisor" }));
    expect(items(filterCategoriesByPermissions(category, roles))).toEqual(["In Stock"]);
  });

  test("a role with no permissions sees nothing", () => {
    const roles = [{ roleId: "r", roleName: "Clerk", permissions: [] }];
    expect(filterCategoriesByPermissions(category, roles)).toEqual([]);
  });

  test("an unreadable role list is returned as-is for the caller to reject", async () => {
    getRolesPermissionsByUserId.mockResolvedValue({ message: "nope" });
    expect(await loadRoles("u1", makeToken({}))).toEqual({ message: "nope" });
  });
});

describe("who can add videos", () => {
  const login = (claims) =>
    localStorage.setItem("access_token", makeToken({ exp: future(), ...claims }));
  const allowedTenant = VIDEO_MANAGER_TENANT_IDS[0];
  const otherTenant = "11111111-2222-3333-4444-555555555555";

  test("Super Admin can, whatever their company", () => {
    login({ [ROLE]: ["Car Inventory", "Super Admin"], [TENANT]: otherTenant });
    expect(canManageVideos()).toBe(true);
    login({ [ROLE]: "Super Admin" }); // no tenant claim at all
    expect(canManageVideos()).toBe(true);
  });

  test("System Admin of an approved company can", () => {
    login({ [ROLE]: "System Admin", [TENANT]: allowedTenant });
    expect(canManageVideos()).toBe(true);
    login({ [ROLE]: "System Admin", [TENANT]: allowedTenant.toUpperCase() });
    expect(canManageVideos()).toBe(true);
  });

  test("System Admin of any other company is blocked", () => {
    login({ [ROLE]: "System Admin", [TENANT]: otherTenant });
    expect(canManageVideos()).toBe(false);
    login({ [ROLE]: "System Admin" });
    expect(canManageVideos()).toBe(false);
  });

  test("a customer's System Admin (e.g. Anna Solomona's company) is blocked", () => {
    login({
      [ROLE]: "System Admin",
      [TENANT]: "96101e37-328f-4cc0-a86c-cd7ab82d6747",
    });
    expect(canManageVideos()).toBe(false);
  });

  test("other roles are blocked even in an approved company", () => {
    login({ [ROLE]: ["Admin", "Car Inventory"], [TENANT]: allowedTenant });
    expect(canManageVideos()).toBe(false);
    expect(isVideoManager(["Yard Supervisor"], allowedTenant)).toBe(false);
  });

  test("signed out, expired or broken tokens cannot", () => {
    expect(canManageVideos()).toBe(false);
    login({
      [ROLE]: "Super Admin",
      exp: Math.floor(Date.now() / 1000) - 10,
    });
    expect(canManageVideos()).toBe(false);
    localStorage.setItem("access_token", "not-a-jwt");
    expect(canManageVideos()).toBe(false);
    expect(getTokenRoleNames("not-a-jwt")).toEqual([]);
  });
});
