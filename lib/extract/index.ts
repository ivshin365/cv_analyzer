import { extractPdfText } from "./pdf";
import { extractDocxText } from "./docx";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Extract CV text from an uploaded file, dispatching on type. Throws a
 * user-facing error for unsupported formats.
 */
export async function extractCvText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return extractPdfText(buffer);
  }
  if (file.type === DOCX_MIME || name.endsWith(".docx")) {
    return extractDocxText(buffer);
  }

  throw new Error(
    "Unsupported file type. Please upload a PDF or Word (.docx) document.",
  );
}
