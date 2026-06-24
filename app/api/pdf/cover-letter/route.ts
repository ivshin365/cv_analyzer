import { NextRequest, NextResponse } from "next/server";
import { renderCoverLetterPdf } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { body, name, contact } = await req.json();
    if (typeof body !== "string" || !body.trim()) {
      return NextResponse.json({ error: "Missing cover letter body." }, { status: 400 });
    }
    const pdf = await renderCoverLetterPdf(
      body,
      typeof name === "string" ? name : "",
      typeof contact === "string" ? contact : "",
    );
    const filename = `${String(name).replace(/[^a-z0-9]+/gi, "_") || "cover"}_Cover_Letter.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("cover letter pdf error", e);
    return NextResponse.json(
      { error: "Could not generate cover letter PDF." },
      { status: 400 },
    );
  }
}
