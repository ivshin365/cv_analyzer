import { NextRequest, NextResponse } from "next/server";
import { extractCvText } from "@/lib/extract";
import { fetchJobFromUrl } from "@/lib/job/fetch-job";
import { analyzeCv } from "@/lib/ai/analyze";
import { rewriteCv } from "@/lib/ai/rewrite";
import { generateCoverLetter } from "@/lib/ai/cover-letter";
import type { Cv } from "@/lib/ai/schemas";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Serialise a structured CV back to plain text so the analyzer can re-score it. */
function cvToText(cv: Cv): string {
  const lines: string[] = [
    cv.fullName,
    cv.headline,
    [cv.email, cv.phone, cv.location, ...cv.links].filter(Boolean).join(" | "),
    "",
    "SUMMARY",
    cv.summary,
    "",
    "SKILLS",
    cv.skills.join(", "),
    "",
    "EXPERIENCE",
  ];
  for (const e of cv.experience) {
    lines.push(
      `${e.title} — ${e.company}${e.location ? `, ${e.location}` : ""} (${e.startDate} – ${e.endDate})`,
    );
    for (const b of e.bullets) lines.push(`- ${b}`);
  }
  lines.push("", "EDUCATION");
  for (const ed of cv.education) {
    lines.push(
      `${ed.degree} — ${ed.institution}${ed.location ? `, ${ed.location}` : ""} (${ed.startDate} – ${ed.endDate})`,
    );
    if (ed.details) lines.push(ed.details);
  }
  if (cv.certifications.length) {
    lines.push("", "CERTIFICATIONS", ...cv.certifications.map((c) => `- ${c}`));
  }
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("cv");
    const jobUrl = (form.get("jobUrl") as string | null)?.trim() || "";
    const jobText = (form.get("jobText") as string | null)?.trim() || "";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload your CV file." },
        { status: 400 },
      );
    }

    // [2] Resolve the job description: prefer pasted text; otherwise fetch URL.
    let jobDescription = jobText;
    let jobSource: "pasted" | "url" = "pasted";
    if (!jobDescription && jobUrl) {
      const fetched = await fetchJobFromUrl(jobUrl);
      if (!fetched.ok) {
        return NextResponse.json(
          { error: fetched.reason, needsPaste: true },
          { status: 422 },
        );
      }
      jobDescription = fetched.text;
      jobSource = "url";
    }
    if (!jobDescription) {
      return NextResponse.json(
        { error: "Provide a job URL or paste the job description." },
        { status: 400 },
      );
    }

    // [1] Extract CV text.
    let cvText: string;
    try {
      cvText = await extractCvText(file);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Could not read the CV." },
        { status: 400 },
      );
    }
    if (cvText.length < 50) {
      return NextResponse.json(
        {
          error:
            "Couldn't extract enough text from the CV. If it's a scanned image, please upload a text-based PDF or .docx.",
        },
        { status: 400 },
      );
    }

    // [3] Analyse original CV.
    const originalAnalysis = await analyzeCv(cvText, jobDescription);

    // [4] Rewrite CV tailored to the job.
    const { cv, changes } = await rewriteCv(cvText, jobDescription, originalAnalysis);

    // [5] + [6] in parallel: cover letter and re-score of the new CV.
    const [coverLetter, newAnalysis] = await Promise.all([
      generateCoverLetter(cv, jobDescription),
      analyzeCv(cvToText(cv), jobDescription),
    ]);

    return NextResponse.json({
      jobSource,
      originalAnalysis,
      newAnalysis,
      cv,
      changes,
      coverLetter,
    });
  } catch (e) {
    console.error("analyze error", e);
    return NextResponse.json(
      {
        error:
          "Something went wrong while analysing. Check the AI Gateway key is configured and try again.",
      },
      { status: 500 },
    );
  }
}
