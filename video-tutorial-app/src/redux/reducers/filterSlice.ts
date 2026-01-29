import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchBranches, getLeadSource } from "../thunks/filterThunk";
import type { Branch, FilterState } from "../interfaces/branch";
import type { LeadSource } from "../interfaces/leadSource";

const initialState: FilterState = {
  branches: [],
  status: "idle",
  error: null,
  loading: false,
  leadSource: []
};
const filterSlice = createSlice({
  name: "filters",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.status = "loading";
        state.loading = true;
      })
      .addCase(
        fetchBranches.fulfilled,
        (state, action: PayloadAction<Branch[]>) => {
          state.status = "succeeded";
          state.branches = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchBranches.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      });
    builder
      .addCase(getLeadSource.pending, (state) => {
        state.status = "loading";
        state.loading = true;
      })
      .addCase(
        getLeadSource.fulfilled,
        (state, action: PayloadAction<LeadSource[]>) => {
          state.status = "succeeded";
          state.leadSource = action.payload;
          state.loading = false;
        }
      )
      .addCase(getLeadSource.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

export default filterSlice.reducer;
