import type { Analysis, Cv } from "@/lib/ai/schemas";

export type { Analysis, Cv } from "@/lib/ai/schemas";

export interface AnalyzeResponse {
  jobSource: "pasted" | "url";
  originalAnalysis: Analysis;
  newAnalysis: Analysis;
  cv: Cv;
  changes: string[];
  coverLetter: string;
}
