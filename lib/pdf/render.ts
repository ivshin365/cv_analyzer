import { renderToBuffer } from "@react-pdf/renderer";
import { CvDocument } from "./CvDocument";
import { CoverLetterDocument } from "./CoverLetterDocument";
import type { Cv } from "@/lib/ai/schemas";

/** Render a structured CV to a PDF buffer. */
export async function renderCvPdf(cv: Cv): Promise<Buffer> {
  // Call the component directly to produce the <Document> element that
  // renderToBuffer expects (it is a pure component with no hooks).
  return renderToBuffer(CvDocument({ cv }));
}

/** Render a cover letter to a PDF buffer. */
export async function renderCoverLetterPdf(
  body: string,
  name: string,
  contact: string,
): Promise<Buffer> {
  return renderToBuffer(CoverLetterDocument({ body, name, contact }));
}
