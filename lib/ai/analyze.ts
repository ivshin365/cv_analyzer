import { generateObject } from "ai";
import { AI_MODEL } from "./model";
import { analysisSchema, type Analysis } from "./schemas";

/**
 * Score a CV (as plain text) against a job description, producing both a
 * job-match score and an ATS-friendliness score with supporting detail.
 */
export async function analyzeCv(
  cvText: string,
  jobDescription: string,
): Promise<Analysis> {
  const { object } = await generateObject({
    model: AI_MODEL,
    schema: analysisSchema,
    system:
      "You are an expert technical recruiter and ATS (Applicant Tracking System) specialist. " +
      "You evaluate CVs objectively and score them honestly. Be specific and concrete; avoid generic advice. " +
      "Base the ATS score on parseability signals visible in the provided text (section headings, dates, contact info, " +
      "evidence of tables/columns/special characters, length). Base the match score on real overlap with the job's " +
      "requirements, not on superficial keyword stuffing.",
    prompt:
      `JOB DESCRIPTION:\n${jobDescription}\n\n` +
      `CANDIDATE CV (extracted text):\n${cvText}\n\n` +
      `Analyze how well this CV matches the job and how ATS-friendly it is.`,
  });

  return object;
}
