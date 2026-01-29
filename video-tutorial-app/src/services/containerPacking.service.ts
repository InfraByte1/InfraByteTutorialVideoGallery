import type { CommonFilter } from "../redux/interfaces/commonFilter";
import { http } from "./api.service";

class ContainerPackingService {
  getContainerPackingSummary(filterData: CommonFilter) {
    return http.get(
      `/v6/ReportContainerPacking/GetContainerPackingSummary?BranchId=${filterData.branchId}&FromDate=${filterData.fromDate}&ToDate=${filterData.toDate}&CreatedBy=${filterData.createdBy}&LastModifiedBy=${filterData.lastModifiedBy}&CarSource=${filterData.carSource}&LeadSource=${filterData.leadSource}`
    );
  }

  getContainerPackingByBranch(filterData: CommonFilter) {
    return http.get(
      `/v6/ReportContainerPacking/GetContainerPackingByBranch?BranchId=${filterData.branchId}&FromDate=${filterData.fromDate}&ToDate=${filterData.toDate}&CreatedBy=${filterData.createdBy}&LastModifiedBy=${filterData.lastModifiedBy}&CarSource=${filterData.carSource}&LeadSource=${filterData.leadSource}`
    );
  }

  getPendingContainerPackingList(filterData: CommonFilter) {
    return http.get(
      `/v6/ReportContainerPacking/GetPendingContainerPackingList?BranchId=${filterData.branchId}&FromDate=${filterData.fromDate}&ToDate=${filterData.toDate}&CreatedBy=${filterData.createdBy}&LastModifiedBy=${filterData.lastModifiedBy}&CarSource=${filterData.carSource}&LeadSource=${filterData.leadSource}`
    );
  }

  getCompletedContainerPackingList(filterData: CommonFilter) {
    return http.get(
      `/v6/ReportContainerPacking/GetCompletedContainerPackingList?BranchId=${filterData.branchId}&FromDate=${filterData.fromDate}&ToDate=${filterData.toDate}&CreatedBy=${filterData.createdBy}&LastModifiedBy=${filterData.lastModifiedBy}&CarSource=${filterData.carSource}&LeadSource=${filterData.leadSource}`
    );
  }

  getContainerPackingAnalytics(filterData: CommonFilter) {
    return http.get(
      `/v6/ReportContainerPacking/GetContainerPackingAnalytics?BranchId=${filterData.branchId}&FromDate=${filterData.fromDate}&ToDate=${filterData.toDate}&CreatedBy=${filterData.createdBy}&LastModifiedBy=${filterData.lastModifiedBy}&CarSource=${filterData.carSource}&LeadSource=${filterData.leadSource}`
    );
  }

  getStockLevels(filterData: CommonFilter) {
    return http.get(
      `/v6/NewReportingDashboards/GetStockLevels?BranchId=${filterData.branchId}`
    );
  }
}

export default new ContainerPackingService();
