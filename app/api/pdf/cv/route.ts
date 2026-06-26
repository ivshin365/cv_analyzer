import { NextRequest, NextResponse } from "next/server";
import { cvSchema, type Cv } from "@/lib/ai/schemas";
import { renderCvPdf } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const maxDuration = 60;

function pdfResponse(pdf: Buffer, filename: string) {
  const body = new Uint8Array(pdf);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Explicit length avoids chunked transfer encoding, which some
      // intercepting proxies mishandle for binary downloads.
      "Content-Length": String(body.byteLength),
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const cv = cvSchema.parse(json.cv);
    const pdf = await renderCvPdf(cv);
    console.error(`[pdf/cv] generated ${pdf.length} bytes for ${cv.fullName}`);
    const filename = `${cv.fullName.replace(/[^a-z0-9]+/gi, "_") || "cv"}_CV.pdf`;
    return pdfResponse(pdf, filename);
  } catch (e) {
    console.error("cv pdf error", e);
    return NextResponse.json({ error: "Could not generate CV PDF." }, { status: 400 });
  }
}

// Temporary diagnostic: open /api/pdf/cv in the browser to test the binary
// download path directly (no analysis needed).
const SAMPLE_CV: Cv = {
  fullName: "Sample Candidate",
  headline: "Diagnostic PDF",
  email: "sample@example.com",
  phone: "",
  location: "",
  links: [],
  summary: "If you can open this PDF, binary downloads from the server work.",
  skills: ["Test"],
  experience: [],
  education: [],
  certifications: [],
};

export async function GET() {
  try {
    const pdf = await renderCvPdf(SAMPLE_CV);
    console.error(`[pdf/cv GET] generated ${pdf.length} bytes`);
    return pdfResponse(pdf, "sample_CV.pdf");
  } catch (e) {
    console.error("cv pdf GET error", e);
    return NextResponse.json({ error: "render failed" }, { status: 500 });
  }
}
