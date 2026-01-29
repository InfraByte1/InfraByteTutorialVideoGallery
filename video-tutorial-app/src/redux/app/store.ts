import { configureStore } from "@reduxjs/toolkit";
import filterReducer from "../reducers/filterSlice";
 
import roleAndPermissionReducer from "../reducers/rolesAndPermissionSlice";

export const store = configureStore({
  reducer: {
    filters: filterReducer,
 
    rolePermission: roleAndPermissionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
