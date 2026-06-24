"use client";

import { useState } from "react";
import { UploadForm } from "@/components/upload-form";
import { Results } from "@/components/results";
import type { AnalyzeResponse } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
      {/* Masthead */}
      <header className="border-line flex items-center justify-between border-b pb-5">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight">Tailfit</span>
          <span className="bg-signal h-1.5 w-1.5 rounded-full" />
        </div>
        <span className="eyebrow text-ink-faint hidden sm:block">
          ATS CV Optimizer
        </span>
      </header>

      {!result ? (
        <div className="grid items-start gap-10 pt-12 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:pt-20">
          {/* Editorial hero */}
          <div className="animate-fade-up">
            <p className="eyebrow text-signal">Score · Rewrite · Land it</p>
            <h1 className="font-display mt-4 text-5xl leading-[0.98] tracking-tight sm:text-6xl">
              Make your CV
              <br />
              <span className="text-signal italic">fit the job</span>
              <br />
              you actually want.
            </h1>
            <p className="text-ink-soft mt-6 max-w-md text-lg leading-relaxed">
              Upload your CV and drop in a job link. We score how well you match,
              then hand back a rewritten, ATS-friendly CV and a tailored cover
              letter — with a clear report of every change.
            </p>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                ["0–100", "Match & ATS scoring"],
                ["PDF", "Recruiter-tested layout"],
                ["Truthful", "No invented experience"],
              ].map(([big, small]) => (
                <div key={small}>
                  <dt className="font-display text-signal text-2xl">{big}</dt>
                  <dd className="text-ink-faint mt-1 text-xs leading-snug">
                    {small}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Form */}
          <div className="animate-fade-up md:pt-2" style={{ animationDelay: "120ms" }}>
            <UploadForm onResult={setResult} />
          </div>
        </div>
      ) : (
        <div className="pt-10">
          <Results result={result} onReset={() => setResult(null)} />
        </div>
      )}

      <footer className="border-line text-ink-faint mt-16 border-t pt-6 text-center text-xs">
        Processed in memory · nothing stored · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
