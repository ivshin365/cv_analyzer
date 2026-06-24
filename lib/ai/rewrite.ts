import { generateObject } from "ai";
import { AI_MODEL } from "./model";
import { rewriteSchema, type RewriteResult, type Analysis } from "./schemas";

/**
 * Rewrite a CV into a structured, ATS-safe, job-tailored form. The model is
 * instructed to stay truthful to the original — it may reframe, reorganise and
 * surface existing experience and keywords, but must never invent employers,
 * dates, titles or qualifications.
 */
export async function rewriteCv(
  cvText: string,
  jobDescription: string,
  analysis: Analysis,
): Promise<RewriteResult> {
  const { object } = await generateObject({
    model: AI_MODEL,
    schema: rewriteSchema,
    system:
      "You are an expert CV writer who produces ATS-friendly, recruiter-tested CVs. " +
      "Rules you must follow strictly:\n" +
      "1. TRUTHFULNESS: Only use facts present in the original CV. Never invent employers, job titles, dates, " +
      "degrees, certifications, metrics or skills the candidate does not demonstrably have. You MAY reword, " +
      "reorganise, and surface relevant existing experience, and you MAY incorporate job-description keywords " +
      "ONLY where they genuinely apply to the candidate's real experience.\n" +
      "2. ATS-SAFE: Use standard section structure, plain text, no tables/columns/graphics. Strong action verbs, " +
      "quantified achievements where the original supports them.\n" +
      "3. TARGETED: Prioritise the skills and experience most relevant to the target job, and naturally include the " +
      "missing keywords that legitimately apply.\n" +
      "Also return a clear list of the key changes you made and why.",
    prompt:
      `JOB DESCRIPTION:\n${jobDescription}\n\n` +
      `ORIGINAL CV (extracted text):\n${cvText}\n\n` +
      `ANALYSIS OF THE ORIGINAL CV:\n` +
      `- Missing keywords: ${analysis.missingKeywords.join(", ") || "none"}\n` +
      `- Gaps: ${analysis.gaps.join("; ") || "none"}\n` +
      `- ATS issues: ${analysis.atsIssues.join("; ") || "none"}\n\n` +
      `Produce an improved, structured, ATS-friendly CV tailored to this job, plus the list of changes.`,
  });

  return object;
}
