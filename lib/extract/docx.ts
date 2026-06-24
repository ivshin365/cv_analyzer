import mammoth from "mammoth";

/**
 * Extract plain text from a .docx buffer using mammoth.
 */
export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const { value } = await mammoth.extractRawText({
    buffer: Buffer.from(buffer),
  });
  return value.trim();
}
