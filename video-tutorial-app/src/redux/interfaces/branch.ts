import type { LeadSource } from "./leadSource";

export interface Branch {
  id: string;
  name: string;
  branchName: string;
  branchCode: string;
}

export interface FilterState {
  branches: Branch[];
  leadSource: LeadSource[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  loading: boolean;
}
