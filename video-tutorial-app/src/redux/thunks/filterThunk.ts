import filterService from "../../services/filter.service";
import type { Branch } from "../interfaces/branch";
import type { LeadSource } from "../interfaces/leadSource";
import { createGetThunk } from "../utils/createGetThunk";

export const fetchBranches = createGetThunk<Branch[]>(
  "branches/fetchBranches",
  () => filterService.getBranches()
);

export const getLeadSource = createGetThunk<LeadSource[]>(
  "NewReportingDashboards/getLeadSource",
  () => filterService.getLeadSource()
);
