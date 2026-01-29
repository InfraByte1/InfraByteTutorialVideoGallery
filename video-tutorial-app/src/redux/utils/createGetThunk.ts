import { createAsyncThunk } from "@reduxjs/toolkit";

export const createGetThunk = <Returned, Arg = void>(
  type: string,
  serviceMethod: (arg: Arg) => Promise<{ data: Returned }>
) => {
  return createAsyncThunk<Returned, Arg, { rejectValue: string }>(
    type,
    async (params, { rejectWithValue }) => {
      try {
        const response = await serviceMethod(params);
        return response.data;
      } catch (error: any) {
        return rejectWithValue(
          error.response?.data?.message || error.message || "Unexpected error"
        );
      }
    }
  );
};