"use client";

import { useEffect, useState } from "react";
import ReportView from "@/components/ReportView";
import { exportReportToPDF } from "@/lib/pdf";
import { Report, ReportSummary } from "@/lib/types";

const LIST_KEY = "niche-forge:reports";
const REPORT_KEY = (id: string) => `niche-forge:report:${id}`;

type View = "dashboard" | "new" | "report";

function loadSummaries(): ReportSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LIST_KEY);
    return raw ? (JSON.parse(raw) as ReportSummary[]) : [];
  } catch {
    return [];
  }
}

function saveSummaries(summaries: ReportSummary[]) {
  window.localStorage.setItem(LIST_KEY, JSON.stringify(summaries));
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [summaries, setSummaries] = useState<ReportSummary[]>([]);
  const [activeReport, setActiveReport] = useState<Report | null>(null);

  const [niche, setNiche] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSummaries(loadSummaries());
  }, []);

  async function handleGenerate() {
    if (!niche.trim() || generating) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      const report: Report = data.report;
      window.localStorage.setItem(REPORT_KEY(report.id), JSON.stringify(report));

      const summary: ReportSummary = {
        id: report.id,
        createdAt: report.createdAt,
        niche: report.niche,
        productTitle: report.productTitle,
        productType: report.productType,
        demandScore: report.demandScore,
        competition: report.competition,
        profitPotential: report.profitPotential,
        status: "completed",
      };
      const nextSummaries = [summary, ...summaries];
      setSummaries(nextSummaries);
      saveSummaries(nextSummaries);

      setActiveReport(report);
      setView("report");
      setNiche("");
    } catch (err: any) {
      setError(err.message || "Research generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function openReport(id: string) {
    const raw = window.localStorage.getItem(REPORT_KEY(id));
    if (!raw) return;
    setActiveReport(JSON.parse(raw) as Report);
    setView("report");
  }

  function deleteReport(id: string) {
    window.localStorage.removeItem(REPORT_KEY(id));
    const next = summaries.filter((s) => s.id !== id);
    setSummaries(next);
    saveSummaries(next);
  }

  const completedCount = summaries.length;

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss">
              Field log for digital-product research
            </p>
            <h1 className="mt-2 font-display text-2xl italic text-ink sm:text-3xl">Niche Forge</h1>
          </div>
          {view !== "dashboard" && (
            <button
              onClick={() => setView("dashboard")}
              className="rounded-md border border-ink px-4 py-2 text-sm text-ink hover:bg-ink hover:text-paper"
            >
              ← Dashboard
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10">
        {view === "dashboard" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-ink">Dashboard</h2>
                <p className="text-sm text-ink/60">Manage and view your product research reports.</p>
              </div>
              <button
                onClick={() => setView("new")}
                className="rounded-md bg-moss px-5 py-2.5 text-sm font-medium text-paper hover:opacity-90"
              >
                + New Research
              </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-white p-4">
                <p className="font-mono text-xs uppercase text-ink/50">Total Reports</p>
                <p className="mt-1 font-display text-2xl text-ink">{completedCount}</p>
              </div>
              <div className="rounded-lg border border-line bg-white p-4">
                <p className="font-mono text-xs uppercase text-ink/50">Avg. Demand Score</p>
                <p className="mt-1 font-display text-2xl text-ink">
                  {completedCount
                    ? Math.round(summaries.reduce((sum, s) => sum + s.demandScore, 0) / completedCount)
                    : 0}
                </p>
              </div>
              <div className="rounded-lg border border-line bg-white p-4">
                <p className="font-mono text-xs uppercase text-ink/50">Last Generated</p>
                <p className="mt-1 font-display text-2xl text-ink">
                  {completedCount ? new Date(summaries[0].createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>

            <h3 className="mb-3 font-display text-lg text-ink">Your Reports</h3>
            {summaries.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line bg-white/40 p-8 text-center text-sm text-ink/60">
                No reports yet. Start with "New Research" to generate your first one.
              </div>
            ) : (
              <div className="space-y-3">
                {summaries.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-line bg-white p-4"
                  >
                    <button className="min-w-0 flex-1 text-left" onClick={() => openReport(s.id)}>
                      <p className="truncate font-display text-base text-ink">{s.productTitle}</p>
                      <p className="mt-0.5 text-xs capitalize text-ink/50">
                        {s.productType} · {s.niche} · {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span className="rounded-full bg-moss/10 px-2 py-0.5 text-xs text-moss">
                          Demand {s.demandScore}
                        </span>
                        <span className="rounded-full bg-line/60 px-2 py-0.5 text-xs text-ink/60">
                          {s.competition} competition
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => deleteReport(s.id)}
                      className="ml-3 shrink-0 rounded-md px-2 py-1 text-xs text-rust hover:bg-rust/10"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "new" && (
          <div>
            <h2 className="mb-1 font-display text-xl text-ink">New Product Research</h2>
            <p className="mb-6 text-sm text-ink/60">
              Tell us your niche, and the AI will generate a complete validation and launch report.
            </p>

            <div className="rounded-lg border border-line bg-white p-5">
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink/60">
                Your niche
              </label>
              <textarea
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. freelancers who struggle with inconsistent income"
                rows={3}
                className="w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-ink/30 focus:border-moss"
              />
              <p className="mt-1.5 text-xs text-ink/50">
                The more specific you are, the better the AI can identify unique pain points and product
                opportunities.
              </p>

              <button
                onClick={handleGenerate}
                disabled={generating || !niche.trim()}
                className="mt-4 rounded-md bg-moss px-5 py-2.5 text-sm font-medium text-paper hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {generating ? "Researching… this can take 30–60s" : "Generate Research"}
              </button>

              {error && (
                <p className="mt-3 rounded-md border border-rust/30 bg-rust/5 px-3 py-2 text-xs text-rust">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}

        {view === "report" && activeReport && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => exportReportToPDF(activeReport)}
                className="rounded-md border border-ink px-4 py-2 text-sm text-ink hover:bg-ink hover:text-paper"
              >
                Download Full PDF Report
              </button>
            </div>
            <ReportView report={activeReport} />
          </div>
        )}
      </div>

      <footer className="border-t border-line px-6 py-6 text-center font-mono text-xs text-ink/40 sm:px-10">
        Niche Forge — powered by Groq &amp; Gemini
      </footer>
    </main>
  );
  }
