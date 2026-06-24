"use client";

import { useEffect, useState } from "react";

function scoreColor(score: number): string {
  if (score >= 80) return "var(--color-signal-bright)";
  if (score >= 60) return "var(--color-signal)";
  if (score >= 40) return "var(--color-gold)";
  return "var(--color-clay)";
}

export function ScoreDial({
  score,
  label,
  size = 132,
  delay = 0,
}: {
  score: number;
  label: string;
  size?: number;
  delay?: number;
}) {
  const [shown, setShown] = useState(0);
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);
  const color = scoreColor(clamped);

  useEffect(() => {
    const start = performance.now();
    const duration = 1100;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start - delay) / duration);
      const eased = t < 0 ? 0 : 1 - Math.pow(1 - t, 3);
      setShown(Math.round(eased * clamped));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clamped, delay]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-line-strong)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: offset,
              transition: `stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display tabular-nums leading-none"
            style={{ fontSize: size * 0.34, color }}
          >
            {shown}
          </span>
          <span className="text-ink-faint text-[0.6rem]">/ 100</span>
        </div>
      </div>
      <span className="eyebrow text-ink-soft mt-3">{label}</span>
    </div>
  );
}

/** Compact before→after comparison for a single metric. */
export function ScoreDelta({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  const diff = after - before;
  const up = diff > 0;
  return (
    <div className="border-line flex items-center justify-between border-b py-3 last:border-b-0">
      <span className="font-sans text-sm">{label}</span>
      <div className="flex items-center gap-2 font-mono text-sm">
        <span className="text-ink-faint tabular-nums">{before}</span>
        <span className="text-ink-faint">→</span>
        <span className="tabular-nums font-semibold" style={{ color: "var(--color-ink)" }}>
          {after}
        </span>
        <span
          className="tabular-nums rounded px-1.5 py-0.5 text-xs"
          style={{
            color: up ? "var(--color-signal-bright)" : diff < 0 ? "var(--color-clay)" : "var(--color-ink-faint)",
            background: up ? "rgba(31,138,88,0.1)" : diff < 0 ? "rgba(180,71,31,0.1)" : "transparent",
          }}
        >
          {up ? "+" : ""}
          {diff}
        </span>
      </div>
    </div>
  );
}
