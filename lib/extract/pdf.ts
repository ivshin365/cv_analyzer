import { extractText, getDocumentProxy } from "unpdf";

/**
 * Extract plain text from a PDF buffer using unpdf (serverless-friendly).
 */
export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return (Array.isArray(text) ? text.join("\n") : text).trim();
}
