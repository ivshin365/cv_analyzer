"use client";

import { useRef, useState } from "react";
import type { AnalyzeResponse } from "@/lib/types";

const STEPS = [
  "Reading your CV",
  "Pulling the job description",
  "Scoring the match & ATS",
  "Rewriting your CV",
  "Writing the cover letter",
  "Re-scoring the new CV",
];

export function UploadForm({
  onResult,
}: {
  onResult: (r: AnalyzeResponse) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    if (!f) return;
    const ok = /\.(pdf|docx)$/i.test(f.name);
    if (!ok) {
      setError("Please choose a PDF or Word (.docx) file.");
      return;
    }
    setError(null);
    setFile(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Upload your CV first.");
    if (!jobUrl.trim() && !jobText.trim())
      return setError("Add the job link or paste the description.");

    setLoading(true);
    setStep(0);
    const ticker = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      4500,
    );

    try {
      const fd = new FormData();
      fd.set("cv", file);
      fd.set("jobUrl", jobUrl.trim());
      fd.set("jobText", jobText.trim());
      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        if (data.needsPaste) {
          setShowPaste(true);
          setError(
            `${data.error} Paste the job description below and try again.`,
          );
        } else {
          setError(data.error ?? "Something went wrong.");
        }
        return;
      }
      onResult(data as AnalyzeResponse);
    } catch {
      setError("Network error — please try again.");
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="border-line bg-paper-card animate-fade-in rounded-2xl border p-8 shadow-sm">
        <p className="eyebrow text-signal">Working</p>
        <ul className="mt-5 space-y-3">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className="flex items-center gap-3 text-sm transition-opacity"
              style={{ opacity: i <= step ? 1 : 0.35 }}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full border text-[10px]"
                style={{
                  borderColor:
                    i < step
                      ? "var(--color-signal)"
                      : i === step
                        ? "var(--color-gold)"
                        : "var(--color-line-strong)",
                  background: i < step ? "var(--color-signal)" : "transparent",
                  color: i < step ? "#fff" : "var(--color-ink-faint)",
                }}
              >
                {i < step ? "✓" : i === step ? "•" : ""}
              </span>
              <span className={i === step ? "text-ink" : "text-ink-soft"}>
                {s}
                {i === step ? "…" : ""}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-ink-faint mt-6 text-xs">
          This usually takes 30–60 seconds. Hang tight.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="border-line bg-paper-card rounded-2xl border p-6 shadow-sm sm:p-8"
    >
      {/* CV upload */}
      <label className="eyebrow text-ink-soft">Your CV</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pickFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        className="mt-2 cursor-pointer rounded-xl border border-dashed px-5 py-7 text-center transition-colors"
        style={{
          borderColor: dragOver ? "var(--color-signal)" : "var(--color-line-strong)",
          background: dragOver ? "rgba(22,99,63,0.04)" : "transparent",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <p className="text-ink text-sm">
            <span className="font-semibold">{file.name}</span>
            <span className="text-ink-faint"> · click to replace</span>
          </p>
        ) : (
          <p className="text-ink-soft text-sm">
            Drop your <span className="text-ink font-medium">PDF</span> or{" "}
            <span className="text-ink font-medium">.docx</span> here, or click to
            browse
          </p>
        )}
      </div>

      {/* Job link */}
      <label className="eyebrow text-ink-soft mt-6 block">Job link</label>
      <input
        type="url"
        value={jobUrl}
        onChange={(e) => setJobUrl(e.target.value)}
        placeholder="https://www.linkedin.com/jobs/view/…"
        className="border-line focus:border-signal mt-2 w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition-colors"
      />

      <button
        type="button"
        onClick={() => setShowPaste((v) => !v)}
        className="text-ink-faint hover:text-signal mt-3 text-xs underline underline-offset-2"
      >
        {showPaste
          ? "Hide pasted description"
          : "LinkedIn blocking it? Paste the description instead"}
      </button>

      {showPaste && (
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          rows={6}
          placeholder="Paste the full job description here…"
          className="border-line focus:border-signal mt-3 w-full resize-y rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition-colors"
        />
      )}

      {error && (
        <p className="text-clay mt-4 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="bg-ink hover:bg-signal mt-6 w-full rounded-xl px-6 py-3.5 font-medium text-white transition-colors"
      >
        Optimize my CV
      </button>
      <p className="text-ink-faint mt-3 text-center text-xs">
        Your CV is processed in memory and never stored.
      </p>
    </form>
  );
}
