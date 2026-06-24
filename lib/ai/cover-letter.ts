import { generateText } from "ai";
import { AI_MODEL } from "./model";
import type { Cv } from "./schemas";

/**
 * Generate a tailored cover letter for the job, grounded in the (rewritten) CV.
 * Returns plain text with paragraphs separated by blank lines.
 */
export async function generateCoverLetter(
  cv: Cv,
  jobDescription: string,
): Promise<string> {
  const cvSummary =
    `Name: ${cv.fullName}\nHeadline: ${cv.headline}\nSummary: ${cv.summary}\n` +
    `Skills: ${cv.skills.join(", ")}\n` +
    `Experience: ${cv.experience
      .map((e) => `${e.title} at ${e.company} (${e.startDate}-${e.endDate})`)
      .join("; ")}`;

  const { text } = await generateText({
    model: AI_MODEL,
    system:
      "You are an expert career writer. Write a concise, professional, genuinely persuasive cover letter " +
      "(3-4 short paragraphs, under ~350 words). Ground every claim in the candidate's real experience as " +
      "summarised — never invent facts. Connect the candidate's strengths to the job's needs. " +
      "Use a confident, human tone; avoid clichés and filler. Output ONLY the body of the letter as plain text " +
      "with paragraphs separated by blank lines — no placeholders like [Company] or [Date], no markdown.",
    prompt:
      `JOB DESCRIPTION:\n${jobDescription}\n\n` +
      `CANDIDATE PROFILE:\n${cvSummary}\n\n` +
      `Write the cover letter.`,
  });

  return text.trim();
}
