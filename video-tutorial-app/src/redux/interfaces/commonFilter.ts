export interface CommonFilter {
  tenantId?: string;
  // filterBy?: "CreatedOn" | "ResolvedDate"; // explicit options
  branchId?: string;
  fromDate?: string;
  toDate?: string;
  resolvedFromDate?: string;
  resolvedToDate?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  resolvedBy?: string;
  carSource?: string;
  leadSource?: string;
  purchaseType?: string;
  jobStatus?: string;
  clientType?: string;
  driverId?: string;
  dateRangeBy?: string; // Pick-up Date, Resolved Date
  createdFromDate?: string;
  createdToDate?: string;

  dismantledBy?: string;
  dismantledType?: string;
}

export interface Filter {
  createdBy?: string;
  lastModifiedBy?: string;
}
