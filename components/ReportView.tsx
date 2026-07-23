"use client";

import { useState } from "react";
import { Report } from "@/lib/types";

type Tab = "overview" | "pain-points" | "products" | "marketing" | "landing" | "launch";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "pain-points", label: "Pain Points" },
  { key: "products", label: "Chapters" },
  { key: "marketing", label: "Marketing" },
  { key: "landing", label: "Landing" },
  { key: "launch", label: "Launch Plan" },
];

function ScoreBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-line bg-white px-3 py-1.5 text-xs">
      <span className="text-ink/50">{label}: </span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 font-display text-base text-ink">{title}</h3>
      {children}
    </div>
  );
}

export default function ReportView({ report }: { report: Report }) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div>
      {/* Header card */}
      <div className="rounded-lg border border-line bg-white p-6">
        <span className="inline-block rounded-full bg-moss/10 px-3 py-1 font-mono text-xs uppercase tracking-wide text-moss">
          Research Complete
        </span>
        <h2 className="mt-3 font-display text-2xl text-ink">{report.productTitle}</h2>
        <p className="mt-1 text-sm capitalize text-ink/60">
          {report.productType} · {report.niche} · {report.price}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">{report.productDescription}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ScoreBadge label="Demand" value={`${report.demandScore}/100`} />
          <ScoreBadge label="Competition" value={report.competition} />
          <ScoreBadge label="Profit" value={report.profitPotential} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key ? "border-signal text-ink" : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div>
            <Section title="Market demand">
              <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                <div className="h-full bg-moss" style={{ width: `${report.demandScore}%` }} />
              </div>
              <p className="mt-1 font-mono text-xs text-ink/50">{report.demandScore}/100</p>
            </Section>
            <Section title="Why this niche">
              <p className="text-sm leading-relaxed text-ink/80">{report.whyThisNiche}</p>
            </Section>
            <Section title="The transformation">
              <p className="text-sm leading-relaxed text-ink/80">{report.transformation}</p>
            </Section>
            <Section title="Target audience">
              <div className="space-y-2">
                {report.audienceSegments.map((a, i) => (
                  <div key={i} className="rounded-md border border-line bg-white p-3">
                    <p className="text-sm font-semibold text-ink">{a.name}</p>
                    <p className="mt-0.5 text-sm text-ink/70">{a.description}</p>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Why buyers pay">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/80">
                {report.whyBuyersPay.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </Section>
          </div>
        )}

        {tab === "pain-points" && (
          <div className="space-y-4">
            {report.painPoints.map((p, i) => (
              <div key={i} className="rounded-lg border border-line bg-white p-4">
                <p className="font-display text-base text-ink">{p.point}</p>
                <dl className="mt-2 space-y-1.5 text-sm">
                  <div>
                    <dt className="font-mono text-xs uppercase text-ink/40">Root cause</dt>
                    <dd className="text-ink/80">{p.rootCause}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs uppercase text-ink/40">Shows up when</dt>
                    <dd className="text-ink/80">{p.dailyImpact}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs uppercase text-ink/40">Why free content fails</dt>
                    <dd className="text-ink/80">{p.whyFreeSolutionsFail}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs uppercase text-ink/40">How this product solves it</dt>
                    <dd className="text-ink/80">{p.howProductSolves}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}

        {tab === "products" && (
          <div className="space-y-4">
            {report.chapters.map((c) => (
              <div key={c.number} className="rounded-lg border border-line bg-white p-4">
                <p className="font-mono text-xs text-signal">
                  Chapter {c.number} of {report.chapters.length}
                </p>
                <p className="mt-0.5 font-display text-base text-ink">{c.title}</p>
                <p className="mt-2 text-sm text-ink/80">{c.whatItCovers}</p>
                <p className="mt-3 font-mono text-xs uppercase text-ink/40">Topics</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink/80">
                  {c.topics.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
                <p className="mt-3 rounded-md bg-signal/10 p-2.5 text-sm text-ink/80">
                  <span className="font-semibold">Quick win: </span>
                  {c.quickWin}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "marketing" && (
          <div>
            <Section title="Ad angles">
              <div className="space-y-2">
                {report.marketingAngles.map((m, i) => (
                  <div key={i} className="rounded-md border border-line bg-white p-3">
                    <p className="text-sm font-semibold text-ink">{m.title}</p>
                    <p className="mt-0.5 text-sm text-ink/70">{m.rationale}</p>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Social posts">
              <div className="space-y-2">
                {report.socialPosts.map((s, i) => (
                  <div key={i} className="rounded-md border border-line bg-white p-3">
                    <p className="font-mono text-xs uppercase text-ink/40">{s.platform}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">{s.content}</p>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Email sequence">
              <div className="space-y-2">
                {report.emailSequence.map((e, i) => (
                  <div key={i} className="rounded-md border border-line bg-white p-3">
                    <p className="font-mono text-xs uppercase text-ink/40">{e.day}</p>
                    <p className="mt-0.5 text-sm font-semibold text-ink">{e.subject}</p>
                    <p className="text-sm text-ink/70">{e.preview}</p>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="YouTube ideas">
              <div className="space-y-2">
                {report.youtubeIdeas.map((y, i) => (
                  <div key={i} className="rounded-md border border-line bg-white p-3">
                    <p className="text-sm font-semibold text-ink">{y.title}</p>
                    <p className="mt-0.5 text-sm text-ink/70">{y.hookStrategy}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {tab === "landing" && (
          <div>
            <Section title="Headline options">
              <div className="space-y-2">
                {report.salesCopy.headlines.map((h, i) => (
                  <div key={i} className="rounded-md border border-line bg-white p-3">
                    <p className="font-display text-base text-ink">{h.headline}</p>
                    <p className="mt-0.5 text-sm text-ink/60">{h.rationale}</p>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Subheadline">
              <p className="text-sm text-ink/80">{report.salesCopy.subheadline}</p>
            </Section>
            <Section title="Bullet points">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/80">
                {report.salesCopy.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </Section>
            <Section title="Guarantee">
              <p className="rounded-md bg-signal/10 p-3 text-sm italic text-ink/80">{report.salesCopy.guarantee}</p>
            </Section>
          </div>
        )}

        {tab === "launch" && (
          <div>
            <Section title="Launch roadmap">
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink/80">
                {report.launchRoadmap.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </Section>
            <Section title="Days 1-7 · Research, create & validate">
              <ul className="space-y-1.5 text-sm text-ink/80">
                {report.ninetyDayChecklist.days1to7.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-moss">☐</span> {s}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Days 8-30 · Launch, sell & market">
              <ul className="space-y-1.5 text-sm text-ink/80">
                {report.ninetyDayChecklist.days8to30.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-moss">☐</span> {s}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Days 31-90 · Scale, automate & grow">
              <ul className="space-y-1.5 text-sm text-ink/80">
                {report.ninetyDayChecklist.days31to90.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-moss">☐</span> {s}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
