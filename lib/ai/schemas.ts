import { z } from "zod";

/**
 * Structured analysis of a CV against a job description, covering both
 * job-match quality and ATS (Applicant Tracking System) parseability.
 */
export const analysisSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "0-100 score of how well the CV matches the job description: keyword/skill overlap, required-experience coverage, title/seniority alignment, domain relevance.",
    ),
  atsScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "0-100 score of how ATS-friendly the CV is: standard section headings, no tables/columns/graphics, standard fonts, contact info present, well-formed dates, text-extractable, reasonable length.",
    ),
  matchSummary: z
    .string()
    .describe("Two-to-three sentence summary explaining the match score."),
  atsSummary: z
    .string()
    .describe("Two-to-three sentence summary explaining the ATS score."),
  matchedKeywords: z
    .array(z.string())
    .describe("Important keywords/skills from the job description present in the CV."),
  missingKeywords: z
    .array(z.string())
    .describe("Important keywords/skills from the job description absent or weak in the CV."),
  strengths: z
    .array(z.string())
    .describe("Concrete strengths of this CV for this specific role."),
  gaps: z
    .array(z.string())
    .describe("Concrete gaps or weaknesses relative to the role."),
  atsIssues: z
    .array(z.string())
    .describe("Specific ATS/formatting problems detected in the CV text."),
});

export type Analysis = z.infer<typeof analysisSchema>;

const experienceSchema = z.object({
  title: z.string().describe("Job title."),
  company: z.string().describe("Employer name."),
  location: z.string().describe("Location, or empty string if unknown.").default(""),
  startDate: z.string().describe("Start date, e.g. 'Jan 2021'."),
  endDate: z.string().describe("End date or 'Present'."),
  bullets: z
    .array(z.string())
    .describe(
      "Achievement-oriented bullet points, quantified where possible, using keywords from the job description. Must be truthful to the original CV.",
    ),
});

const educationSchema = z.object({
  degree: z.string().describe("Degree / qualification."),
  institution: z.string().describe("School / university."),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  details: z.string().default("").describe("Optional honors, GPA, relevant coursework."),
});

/**
 * A fully structured, ATS-safe CV. This object is rendered directly to a
 * single-column PDF — no tables, columns or graphics.
 */
export const cvSchema = z.object({
  fullName: z.string(),
  headline: z.string().describe("Short professional headline / target title."),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  links: z
    .array(z.string())
    .default([])
    .describe("Plain-text profile links, e.g. LinkedIn / portfolio URLs."),
  summary: z
    .string()
    .describe("3-4 sentence professional summary tailored to the target role."),
  skills: z
    .array(z.string())
    .describe("Relevant skills, prioritising those required by the job description."),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  certifications: z.array(z.string()).default([]),
});

export type Cv = z.infer<typeof cvSchema>;

/**
 * The rewrite result: the new CV plus an explanation of what changed and why,
 * which is surfaced in the report.
 */
export const rewriteSchema = z.object({
  cv: cvSchema,
  changes: z
    .array(z.string())
    .describe(
      "Plain-language list of the most important changes made to the CV and the reason for each (e.g. 'Added \"Kubernetes\" to skills to match a required keyword').",
    ),
});

export type RewriteResult = z.infer<typeof rewriteSchema>;
