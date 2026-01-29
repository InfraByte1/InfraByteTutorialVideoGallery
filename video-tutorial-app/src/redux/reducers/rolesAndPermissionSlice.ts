import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../utils/converters";

import type {
  PermissionsBySubscription,
  RolePermissions,
  RolePermissionsState,
} from "../interfaces/permissions/roleAndPermissions";
import { getPermissionBySubscription, getRolesAndPermissionsByUserId } from "../thunks/roleAndPermissionsThunk";

const initialState: RolePermissionsState = {
  status: "idle",
  error: null,
  loading: false,
  rolePermissions: null,
  permissionsBySubscription: []
};

const roleAndPermissionSlice = createSlice({
  name: "roleAndPermission",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRolesAndPermissionsByUserId.pending, (state) => {
        state.status = "loading";
        state.loading = true;
      })
      .addCase(
        getRolesAndPermissionsByUserId.fulfilled,
        (state, action: PayloadAction<RolePermissions[]>) => {
          state.status = "succeeded";
          state.rolePermissions = action.payload;
          state.loading = false;
        }
      )
      .addCase(getRolesAndPermissionsByUserId.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = getErrorMessage(action.error.message);
      });
    builder
      .addCase(getPermissionBySubscription.pending, (state) => {
        state.status = "loading";
        state.loading = true;
      })
      .addCase(
        getPermissionBySubscription.fulfilled,
        (state, action: PayloadAction<PermissionsBySubscription[] >) => {
          state.status = "succeeded";
          state.permissionsBySubscription = action.payload;
          state.loading = false;
        }
      )
      .addCase(getPermissionBySubscription.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = getErrorMessage(action.error.message);
      });
  },
});

export default roleAndPermissionSlice.reducer;
