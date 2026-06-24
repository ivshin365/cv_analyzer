import { NextRequest, NextResponse } from "next/server";
import { cvSchema } from "@/lib/ai/schemas";
import { renderCvPdf } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const cv = cvSchema.parse(json.cv);
    const pdf = await renderCvPdf(cv);
    const filename = `${cv.fullName.replace(/[^a-z0-9]+/gi, "_") || "cv"}_CV.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("cv pdf error", e);
    return NextResponse.json({ error: "Could not generate CV PDF." }, { status: 400 });
  }
}
