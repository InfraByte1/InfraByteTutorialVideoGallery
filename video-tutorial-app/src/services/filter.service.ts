import { http } from "./api.service";

class FilterService {
  getBranches() {
    return http.get("/v6/BranchOffices/GetBranches");
  }

  getLeadSource() {
    return http.get("/v6/NewReportingDashboards/GetLeadSource");
  }
}

export default new FilterService();
