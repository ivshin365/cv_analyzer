import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { CvDocument } from "./CvDocument";
import { CoverLetterDocument } from "./CoverLetterDocument";
import type { Cv } from "@/lib/ai/schemas";

/** Render a structured CV to a PDF buffer. */
export async function renderCvPdf(cv: Cv): Promise<Buffer> {
  return renderToBuffer(createElement(CvDocument, { cv }));
}

/** Render a cover letter to a PDF buffer. */
export async function renderCoverLetterPdf(
  body: string,
  name: string,
  contact: string,
): Promise<Buffer> {
  return renderToBuffer(
    createElement(CoverLetterDocument, { body, name, contact }),
  );
}
