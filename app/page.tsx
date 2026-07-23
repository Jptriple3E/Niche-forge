"use client";

import { useState } from "react";
import ResultView from "@/components/ResultView";
import { exportSectionsToPDF } from "@/lib/pdf";

type StageKey =
  | "niche-research"
  | "validation"
  | "pain-points"
  | "product-ideas"
  | "outline"
  | "sales-page"
  | "marketing";

interface Stage {
  key: StageKey;
  number: string;
  label: string;
  blurb: string;
  fields: { name: string; label: string; placeholder: string; rows?: number }[];
}

const STAGES: Stage[] = [
  {
    key: "niche-research",
    number: "01",
    label: "Niche Research",
    blurb: "Turn a broad interest into 6 specific, profitable sub-niches.",
    fields: [
      {
        name: "topic",
        label: "Your broad interest, skill, or audience",
        placeholder: "e.g. productivity tools for freelancers",
        rows: 2,
      },
    ],
  },
  {
    key: "validation",
    number: "02",
    label: "Product Validation",
    blurb: "Score demand, competition, and profit potential for one idea.",
    fields: [
      {
        name: "idea",
        label: "The niche or product idea to score",
        placeholder: "e.g. an AI-powered Notion template for freelance project tracking",
        rows: 2,
      },
    ],
  },
  {
    key: "pain-points",
    number: "03",
    label: "Customer Pain Points",
    blurb: "Surface the specific struggles worth building a product around.",
    fields: [
      {
        name: "niche",
        label: "Niche or audience",
        placeholder: "e.g. freelance designers juggling multiple clients",
        rows: 2,
      },
    ],
  },
  {
    key: "product-ideas",
    number: "04",
    label: "Product Generator",
    blurb: "Generate 10 real, sellable product concepts — ebook, course, template, planner, checklist.",
    fields: [
      {
        name: "niche",
        label: "Niche to generate products for",
        placeholder: "e.g. freelancers who struggle with inconsistent income",
        rows: 2,
      },
    ],
  },
  {
    key: "outline",
    number: "05",
    label: "Outline Generator",
    blurb: "Expand one product idea into a full, writable 20-30 page outline.",
    fields: [
      {
        name: "product",
        label: "The product to outline (paste the title + breakdown from step 4)",
        placeholder: "e.g. \"The Feast-or-Famine Fix\" — a planner for freelancers to smooth out irregular income...",
        rows: 5,
      },
    ],
  },
  {
    key: "sales-page",
    number: "06",
    label: "Sales Page Generator",
    blurb: "Write persuasive, benefit-first sales copy for the product.",
    fields: [
      {
        name: "product",
        label: "The product",
        placeholder: "Product title + short description",
        rows: 3,
      },
      {
        name: "outline",
        label: "Outline (optional, paste from step 5 for better specificity)",
        placeholder: "Paste the outline here if you have it",
        rows: 4,
      },
    ],
  },
  {
    key: "marketing",
    number: "07",
    label: "Marketing Content",
    blurb: "Social posts, launch emails, and ad copy for the launch.",
    fields: [
      {
        name: "product",
        label: "The product",
        placeholder: "Product title + short description",
        rows: 3,
      },
    ],
  },
];

type Inputs = Record<StageKey, Record<string, string>>;
type Results = Record<StageKey, string>;
type Loading = Record<StageKey, boolean>;
type Errors = Record<StageKey, string>;

function emptyRecord<T>(fill: T): Record<StageKey, T> {
  const obj = {} as Record<StageKey, T>;
  for (const s of STAGES) obj[s.key] = fill;
  return obj;
}

export default function Home() {
  const [active, setActive] = useState<StageKey>("niche-research");
  const [inputs, setInputs] = useState<Inputs>(() => {
    const obj = {} as Inputs;
    for (const s of STAGES) {
      const fieldObj: Record<string, string> = {};
      for (const f of s.fields) fieldObj[f.name] = "";
      obj[s.key] = fieldObj;
    }
    return obj;
  });
  const [results, setResults] = useState<Results>(() => emptyRecord(""));
  const [loading, setLoading] = useState<Loading>(() => emptyRecord(false));
  const [errors, setErrors] = useState<Errors>(() => emptyRecord(""));

  const stage = STAGES.find((s) => s.key === active)!;

  function setField(stageKey: StageKey, fieldName: string, value: string) {
    setInputs((prev) => ({
      ...prev,
      [stageKey]: { ...prev[stageKey], [fieldName]: value },
    }));
  }

  async function runStage(stageKey: StageKey) {
    setLoading((p) => ({ ...p, [stageKey]: true }));
    setErrors((p) => ({ ...p, [stageKey]: "" }));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: stageKey, input: inputs[stageKey] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResults((p) => ({ ...p, [stageKey]: data.result }));
    } catch (err: any) {
      setErrors((p) => ({ ...p, [stageKey]: err.message || "Generation failed" }));
    } finally {
      setLoading((p) => ({ ...p, [stageKey]: false }));
    }
  }

  function handleExport() {
    const sections = STAGES.filter((s) => results[s.key]?.trim()).map((s) => ({
      heading: `${s.number} · ${s.label}`,
      body: results[s.key],
    }));
    if (sections.length === 0) return;
    exportSectionsToPDF("Niche Forge — Research & Product Log", sections, "niche-forge-log.pdf");
  }

  const filledCount = STAGES.filter((s) => results[s.key]?.trim()).length;

  return (
    <main className="min-h-screen bg-paper">
      {/* Hero */}
      <header className="border-b border-line px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss">
            Field log for digital-product research
          </p>
          <h1 className="mt-3 font-display text-3xl italic text-ink sm:text-4xl">
            Niche Forge
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ink/70">
            Work the log in order: find a niche, prove it's worth building, name the exact
            pain, then generate the product, its outline, the pitch, and the launch content —
            end to end, entry by entry.
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8 sm:px-10 lg:flex-row">
        {/* Stepper / nav */}
        <nav className="lg:w-64 lg:shrink-0">
          <ol className="space-y-1">
            {STAGES.map((s) => {
              const done = !!results[s.key]?.trim();
              const isActive = s.key === active;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => setActive(s.key)}
                    className={`flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                      isActive ? "bg-ink text-paper" : "hover:bg-black/5"
                    }`}
                  >
                    <span
                      className={`font-mono text-xs mt-0.5 ${
                        isActive ? "text-signal" : done ? "text-moss" : "text-ink/40"
                      }`}
                    >
                      {done ? "✓" : s.number}
                    </span>
                    <span className="flex-1">
                      <span className={`block text-sm font-medium ${isActive ? "text-paper" : "text-ink"}`}>
                        {s.label}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <button
            onClick={handleExport}
            disabled={filledCount === 0}
            className="mt-6 w-full rounded-md border border-ink px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
          >
            Export log to PDF ({filledCount}/{STAGES.length})
          </button>
        </nav>

        {/* Active stage panel */}
        <section className="flex-1 min-w-0">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-mono text-xs text-signal">{stage.number}</span>
            <h2 className="font-display text-xl text-ink">{stage.label}</h2>
          </div>
          <p className="mb-5 text-sm text-ink/60">{stage.blurb}</p>

          <div className="space-y-4 rounded-lg border border-line bg-white/40 p-5">
            {stage.fields.map((f) => (
              <div key={f.name}>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink/60">
                  {f.label}
                </label>
                <textarea
                  value={inputs[stage.key][f.name]}
                  onChange={(e) => setField(stage.key, f.name, e.target.value)}
                  placeholder={f.placeholder}
                  rows={f.rows ?? 3}
                  className="w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-ink/30 focus:border-moss"
                />
              </div>
            ))}

            <button
              onClick={() => runStage(stage.key)}
              disabled={loading[stage.key] || Object.values(inputs[stage.key]).every((v) => !v.trim())}
              className="rounded-md bg-moss px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading[stage.key] ? "Generating…" : `Generate ${stage.label}`}
            </button>

            {errors[stage.key] && (
              <p className="rounded-md border border-rust/30 bg-rust/5 px-3 py-2 text-xs text-rust">
                {errors[stage.key]}
              </p>
            )}
          </div>

          {results[stage.key] && (
            <div className="mt-6 rounded-lg border border-line bg-white p-6">
              <ResultView text={results[stage.key]} />
            </div>
          )}
        </section>
      </div>

      <footer className="border-t border-line px-6 py-6 text-center font-mono text-xs text-ink/40 sm:px-10">
        Niche Forge — powered by Groq &amp; Gemini
      </footer>
    </main>
  );
          }
