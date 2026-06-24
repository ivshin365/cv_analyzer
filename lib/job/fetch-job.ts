import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export type JobFetchResult =
  | { ok: true; text: string; title: string }
  | { ok: false; reason: string };

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

/**
 * Attempt to fetch a job posting from a URL and extract its readable text.
 *
 * Many job boards (notably LinkedIn) block server-side fetches or render the
 * posting client-side, so failure is expected and handled gracefully — the
 * caller falls back to asking the user to paste the description.
 */
export async function fetchJobFromUrl(url: string): Promise<JobFetchResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) {
      return { ok: false, reason: "Only http(s) URLs are supported." };
    }
  } catch {
    return { ok: false, reason: "That doesn't look like a valid URL." };
  }

  let html: string;
  try {
    const res = await fetch(parsed.toString(), {
      headers: { "user-agent": UA, accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return { ok: false, reason: `The page returned status ${res.status}.` };
    }
    html = await res.text();
  } catch {
    return { ok: false, reason: "Couldn't reach that URL." };
  }

  try {
    const { document } = parseHTML(html);
    const article = new Readability(document as unknown as Document).parse();
    const text = (article?.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();

    // Too little usable text usually means a JS-rendered / gated page.
    if (text.length < 200) {
      return {
        ok: false,
        reason:
          "The job description couldn't be read automatically (the site may block bots or load content with JavaScript).",
      };
    }
    return { ok: true, text, title: article?.title ?? parsed.hostname };
  } catch {
    return {
      ok: false,
      reason: "Couldn't extract the job description from that page.",
    };
  }
}
