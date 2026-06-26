"use client";

import { useState } from "react";
import type { AnalyzeResponse, Cv } from "@/lib/types";
import { ScoreDial, ScoreDelta } from "./score-dial";

async function downloadPdf(url: string, payload: unknown, fallbackName: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    alert("Sorry — the PDF could not be generated.");
    return;
  }
  const blob = await res.blob();
  if (blob.size === 0) {
    alert("The PDF came back empty — please try again.");
    return;
  }
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  const cd = res.headers.get("Content-Disposition") ?? "";
  a.download = /filename="(.+?)"/.exec(cd)?.[1] ?? fallbackName;
  document.body.appendChild(a);
  a.click();
  // Defer cleanup: revoking the object URL synchronously after click() races
  // the browser's file write and can produce a 0-byte / corrupt download.
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(href);
  }, 4000);
}

function KeywordChips({
  items,
  tone,
}: {
  items: string[];
  tone: "good" | "bad";
}) {
  if (!items.length) return <p className="text-ink-faint text-sm">None.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((k) => (
        <span
          key={k}
          className="rounded-full border px-2.5 py-1 font-mono text-xs"
          style={{
            borderColor:
              tone === "good" ? "rgba(31,138,88,0.35)" : "rgba(180,71,31,0.35)",
            color: tone === "good" ? "var(--color-signal)" : "var(--color-clay)",
            background:
              tone === "good" ? "rgba(31,138,88,0.06)" : "rgba(180,71,31,0.06)",
          }}
        >
          {k}
        </span>
      ))}
    </div>
  );
}

function Panel({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="border-line bg-paper-card animate-fade-up rounded-2xl border p-6 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="font-display mb-4 text-xl">{title}</h3>
      {children}
    </section>
  );
}

function CvPreview({ cv }: { cv: Cv }) {
  return (
    <div className="border-line rounded-xl border bg-white p-7 text-[13px] leading-relaxed text-ink shadow-inner">
      <h4 className="font-display text-2xl">{cv.fullName}</h4>
      {cv.headline && <p className="text-ink-soft">{cv.headline}</p>}
      <p className="text-ink-faint mt-1 text-xs">
        {[cv.email, cv.phone, cv.location, ...cv.links].filter(Boolean).join("  •  ")}
      </p>

      {cv.summary && (
        <>
          <PreviewHeading>Summary</PreviewHeading>
          <p>{cv.summary}</p>
        </>
      )}

      {cv.skills.length > 0 && (
        <>
          <PreviewHeading>Skills</PreviewHeading>
          <p>{cv.skills.join(", ")}</p>
        </>
      )}

      {cv.experience.length > 0 && (
        <>
          <PreviewHeading>Experience</PreviewHeading>
          {cv.experience.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <span className="font-semibold">{e.title}</span>
                <span className="text-ink-faint text-xs">
                  {e.startDate}
                  {e.endDate ? ` – ${e.endDate}` : ""}
                </span>
              </div>
              <p className="text-ink-soft">
                {[e.company, e.location].filter(Boolean).join(", ")}
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {e.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {cv.education.length > 0 && (
        <>
          <PreviewHeading>Education</PreviewHeading>
          {cv.education.map((ed, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{ed.degree}</span>
                <span className="text-ink-faint text-xs">
                  {[ed.startDate, ed.endDate].filter(Boolean).join(" – ")}
                </span>
              </div>
              <p className="text-ink-soft">
                {[ed.institution, ed.location].filter(Boolean).join(", ")}
              </p>
              {ed.details && <p className="text-ink-soft text-xs">{ed.details}</p>}
            </div>
          ))}
        </>
      )}

      {cv.certifications.length > 0 && (
        <>
          <PreviewHeading>Certifications</PreviewHeading>
          <ul className="list-disc space-y-0.5 pl-5">
            {cv.certifications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function PreviewHeading({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="border-line mt-4 mb-1.5 border-b pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
      {children}
    </h5>
  );
}

export function Results({
  result,
  onReset,
}: {
  result: AnalyzeResponse;
  onReset: () => void;
}) {
  const { originalAnalysis: o, newAnalysis: n, cv, changes, coverLetter } = result;
  const [dl, setDl] = useState<"cv" | "cover" | null>(null);
  const contact = [cv.email, cv.phone, cv.location].filter(Boolean).join("  •  ");

  const handle = async (which: "cv" | "cover") => {
    setDl(which);
    try {
      if (which === "cv") {
        await downloadPdf("/api/pdf/cv", { cv }, "CV.pdf");
      } else {
        await downloadPdf(
          "/api/pdf/cover-letter",
          { body: coverLetter, name: cv.fullName, contact },
          "Cover_Letter.pdf",
        );
      }
    } finally {
      setDl(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Score comparison */}
      <section className="border-line bg-paper-card animate-fade-up rounded-2xl border p-6 shadow-sm sm:p-8">
        <p className="eyebrow text-signal">Before → After</p>
        <h2 className="font-display mt-1 text-2xl sm:text-3xl">Your scores</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <ScoreGroup label="Job match" before={o.matchScore} after={n.matchScore} />
          <ScoreGroup label="ATS friendliness" before={o.atsScore} after={n.atsScore} />
        </div>
        <div className="mt-7">
          <ScoreDelta label="Job match score" before={o.matchScore} after={n.matchScore} />
          <ScoreDelta label="ATS friendliness score" before={o.atsScore} after={n.atsScore} />
        </div>
      </section>

      {/* Downloads */}
      <section className="animate-fade-up grid gap-4 sm:grid-cols-2" style={{ animationDelay: "80ms" }}>
        <DownloadCard
          title="Optimized CV"
          sub="ATS-friendly · selectable text · single column"
          busy={dl === "cv"}
          onClick={() => handle("cv")}
        />
        <DownloadCard
          title="Cover letter"
          sub="Tailored to this role · ready to send"
          busy={dl === "cover"}
          onClick={() => handle("cover")}
        />
      </section>

      {/* What changed */}
      <Panel title="What we changed" delay={120}>
        <ul className="space-y-2.5">
          {changes.map((c, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-signal mt-0.5">→</span>
              <span className="text-ink-soft">{c}</span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Keyword coverage */}
      <Panel title="Keyword coverage" delay={160}>
        <p className="eyebrow text-ink-faint mb-2">Now matched</p>
        <KeywordChips items={n.matchedKeywords} tone="good" />
        <p className="eyebrow text-ink-faint mt-5 mb-2">Still missing</p>
        <KeywordChips items={n.missingKeywords} tone="bad" />
      </Panel>

      {/* Assessment */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Strengths" delay={180}>
          <BulletList items={n.strengths} tone="good" />
        </Panel>
        <Panel title="Remaining gaps" delay={200}>
          <BulletList items={n.gaps} tone="bad" />
          {n.atsIssues.length > 0 && (
            <>
              <p className="eyebrow text-ink-faint mt-5 mb-2">ATS notes</p>
              <BulletList items={n.atsIssues} tone="bad" />
            </>
          )}
        </Panel>
      </div>

      {/* New CV preview */}
      <Panel title="Your new CV" delay={220}>
        <CvPreview cv={cv} />
      </Panel>

      {/* Cover letter preview */}
      <Panel title="Your cover letter" delay={240}>
        <div className="border-line whitespace-pre-line rounded-xl border bg-white p-7 text-[13px] leading-relaxed text-ink shadow-inner">
          {coverLetter}
        </div>
      </Panel>

      <div className="flex justify-center pt-2 pb-10">
        <button
          onClick={onReset}
          className="border-line text-ink-soft hover:border-ink hover:text-ink rounded-full border px-6 py-2.5 text-sm transition-colors"
        >
          Start over with another job
        </button>
      </div>
    </div>
  );
}

function ScoreGroup({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-5">
        <ScoreDial score={before} label="before" size={96} />
        <span className="text-ink-faint pb-10 font-display text-2xl">→</span>
        <ScoreDial score={after} label="after" size={132} delay={250} />
      </div>
      <p className="font-display text-ink mt-3 text-lg">{label}</p>
    </div>
  );
}

function BulletList({ items, tone }: { items: string[]; tone: "good" | "bad" }) {
  if (!items.length) return <p className="text-ink-faint text-sm">None noted.</p>;
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 text-sm">
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              background:
                tone === "good" ? "var(--color-signal-bright)" : "var(--color-clay)",
            }}
          />
          <span className="text-ink-soft">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function DownloadCard({
  title,
  sub,
  busy,
  onClick,
}: {
  title: string;
  sub: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="group border-line bg-paper-card hover:border-signal flex items-center justify-between rounded-2xl border p-5 text-left shadow-sm transition-colors disabled:opacity-60"
    >
      <div>
        <p className="font-display text-lg">{title}</p>
        <p className="text-ink-faint mt-0.5 text-xs">{sub}</p>
      </div>
      <span className="bg-ink group-hover:bg-signal flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors">
        {busy ? "…" : "↓"}
      </span>
    </button>
  );
}
