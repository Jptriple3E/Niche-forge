import jsPDF from "jspdf";
import { Report } from "./types";

const W = 595.28; // A4 pt
const H = 841.89;
const M = 56;
const CW = W - M * 2;

const INK: [number, number, number] = [28, 43, 34];
const SIGNAL: [number, number, number] = [192, 138, 46];
const MOSS: [number, number, number] = [46, 110, 94];
const BODY: [number, number, number] = [50, 50, 50];
const MUTED: [number, number, number] = [130, 130, 130];
const PAPER: [number, number, number] = [241, 240, 234];
const WHITE: [number, number, number] = [255, 255, 255];
const LINE: [number, number, number] = [216, 213, 200];

function bg(doc: jsPDF, color: [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(0, 0, W, H, "F");
}

function wrap(doc: jsPDF, text: string, width: number): string[] {
  return doc.splitTextToSize(text || "", width);
}

interface Ctx {
  doc: jsPDF;
  y: number;
  page: number;
}

function ensure(ctx: Ctx, needed: number) {
  if (ctx.y + needed > H - M - 30) {
    ctx.doc.addPage();
    ctx.page += 1;
    bg(ctx.doc, WHITE);
    ctx.y = M;
  }
}

function h1(ctx: Ctx, text: string) {
  ensure(ctx, 40);
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(19);
  ctx.doc.setTextColor(...SIGNAL);
  const lines = wrap(ctx.doc, text, CW);
  ctx.doc.text(lines, M, ctx.y + 18);
  ctx.y += 18 + lines.length * 22 + 6;
  ctx.doc.setDrawColor(...LINE);
  ctx.doc.line(M, ctx.y, W - M, ctx.y);
  ctx.y += 20;
}

function h2(ctx: Ctx, text: string) {
  ensure(ctx, 30);
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(13);
  ctx.doc.setTextColor(...INK);
  const lines = wrap(ctx.doc, text, CW);
  ctx.doc.text(lines, M, ctx.y);
  ctx.y += lines.length * 16 + 8;
}

function p(ctx: Ctx, text: string, opts: { italic?: boolean; muted?: boolean } = {}) {
  ctx.doc.setFont("helvetica", opts.italic ? "italic" : "normal");
  ctx.doc.setFontSize(10.3);
  const color = opts.muted ? MUTED : BODY;
  ctx.doc.setTextColor(...color);
  const lines = wrap(ctx.doc, text, CW);
  ensure(ctx, lines.length * 13.5 + 8);
  ctx.doc.text(lines, M, ctx.y);
  ctx.y += lines.length * 13.5 + 10;
}

function label(ctx: Ctx, text: string) {
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(8.5);
  ctx.doc.setTextColor(...MOSS);
  ensure(ctx, 14);
  ctx.doc.text(text.toUpperCase(), M, ctx.y);
  ctx.y += 13;
}

function bullets(ctx: Ctx, items: string[]) {
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(10.3);
  ctx.doc.setTextColor(...BODY);
  for (const item of items) {
    const lines = wrap(ctx.doc, item, CW - 14);
    ensure(ctx, lines.length * 13.5 + 4);
    ctx.doc.text("•", M, ctx.y);
    ctx.doc.text(lines, M + 12, ctx.y);
    ctx.y += lines.length * 13.5 + 6;
  }
  ctx.y += 4;
}

function numbered(ctx: Ctx, items: string[]) {
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(10.3);
  ctx.doc.setTextColor(...BODY);
  items.forEach((item, i) => {
    const prefix = `${i + 1}.`;
    const lines = wrap(ctx.doc, item, CW - 18);
    ensure(ctx, lines.length * 13.5 + 4);
    ctx.doc.text(prefix, M, ctx.y);
    ctx.doc.text(lines, M + 18, ctx.y);
    ctx.y += lines.length * 13.5 + 6;
  });
  ctx.y += 4;
}

function checklist(ctx: Ctx, items: string[]) {
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(10.3);
  ctx.doc.setTextColor(...BODY);
  for (const item of items) {
    const lines = wrap(ctx.doc, item, CW - 16);
    ensure(ctx, lines.length * 13.5 + 4);
    ctx.doc.text("☐", M, ctx.y);
    ctx.doc.text(lines, M + 16, ctx.y);
    ctx.y += lines.length * 13.5 + 6;
  }
  ctx.y += 4;
}

function card(ctx: Ctx, render: (ctx: Ctx) => void) {
  ctx.y += 4;
  render(ctx);
  ensure(ctx, 14);
  ctx.doc.setDrawColor(...LINE);
  ctx.doc.line(M, ctx.y, W - M, ctx.y);
  ctx.y += 16;
}

function sectionStart(ctx: Ctx, title: string, tocEntries: { title: string; page: number }[]) {
  ctx.doc.addPage();
  ctx.page += 1;
  bg(ctx.doc, WHITE);
  ctx.y = M;
  tocEntries.push({ title, page: ctx.page });
  h1(ctx, title);
}

export function exportReportToPDF(report: Report) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const ctx: Ctx = { doc, y: M, page: 1 };
  const toc: { title: string; page: number }[] = [];

  // ---- Cover page ----
  bg(doc, PAPER);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...MOSS);
  doc.text("NICHE FORGE · PRODUCT RESEARCH REPORT", M, 140);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...INK);
  const titleLines = wrap(doc, report.productTitle, CW);
  doc.text(titleLines, M, 200);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...MOSS);
  doc.text(`${report.productType.toUpperCase()} · ${report.niche}`, M, 200 + titleLines.length * 36 + 10);

  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  doc.text(
    `Generated ${new Date(report.createdAt).toLocaleDateString()}`,
    M,
    200 + titleLines.length * 36 + 34
  );

  // score badges on cover
  const badgeY = 420;
  const badges: [string, string][] = [
    ["Demand", `${report.demandScore}/100`],
    ["Competition", report.competition],
    ["Profit Potential", report.profitPotential],
    ["Price", report.price],
  ];
  let bx = M;
  for (const [lbl, val] of badges) {
    doc.setDrawColor(...LINE);
    doc.setFillColor(...WHITE);
    doc.roundedRect(bx, badgeY, 110, 56, 6, 6, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...MOSS);
    doc.text(lbl.toUpperCase(), bx + 12, badgeY + 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text(val, bx + 12, badgeY + 40);
    bx += 122;
  }

  // ---- Table of contents (placeholder page, filled in after content) ----
  doc.addPage();
  ctx.page = 2;
  bg(doc, WHITE);
  const tocPageIndex = 2;

  // ---- Content sections ----
  ctx.y = M;
  sectionStart(ctx, "Executive Summary", toc);
  p(ctx, report.productDescription);
  label(ctx, "Why this niche, right now");
  p(ctx, report.whyThisNiche);
  label(ctx, "The transformation");
  p(ctx, report.transformation);
  label(ctx, "Why buyers pay for this over free content");
  bullets(ctx, report.whyBuyersPay);

  sectionStart(ctx, "Market Intelligence Dashboard", toc);
  h2(ctx, `Demand score: ${report.demandScore}/100`);
  ctx.doc.setDrawColor(...LINE);
  ctx.doc.setFillColor(...PAPER);
  ctx.doc.roundedRect(M, ctx.y, CW, 10, 5, 5, "F");
  ctx.doc.setFillColor(...MOSS);
  ctx.doc.roundedRect(M, ctx.y, (CW * Math.min(report.demandScore, 100)) / 100, 10, 5, 5, "F");
  ctx.y += 26;
  h2(ctx, `Competition: ${report.competition}`);
  h2(ctx, `Profit potential: ${report.profitPotential}`);
  h2(ctx, `Suggested price: ${report.price}`);

  sectionStart(ctx, "Target Audience Profiles", toc);
  for (const seg of report.audienceSegments) {
    card(ctx, (c) => {
      h2(c, seg.name);
      p(c, seg.description);
    });
  }

  sectionStart(ctx, "Customer Pain Point Deep-Dive", toc);
  report.painPoints.forEach((pp, i) => {
    card(ctx, (c) => {
      h2(c, `${i + 1}. ${pp.point}`);
      label(c, "Root cause");
      p(c, pp.rootCause);
      label(c, "Where it shows up");
      p(c, pp.dailyImpact);
      label(c, "Why free solutions fail");
      p(c, pp.whyFreeSolutionsFail);
      label(c, "Emotional cost");
      p(c, pp.emotionalCost);
      label(c, "How this product solves it");
      p(c, pp.howProductSolves);
    });
  });

  sectionStart(ctx, "Product Overview", toc);
  p(ctx, report.productDescription);
  label(ctx, "Format & price");
  p(ctx, `${report.productType} · ${report.price}`);
  label(ctx, `Total chapters: ${report.chapters.length}`);

  sectionStart(ctx, "Chapter-by-Chapter Breakdown", toc);
  report.chapters.forEach((chap) => {
    card(ctx, (c) => {
      h2(c, `Chapter ${chap.number}: ${chap.title}`);
      p(c, chap.whatItCovers);
      label(c, "Topics covered");
      bullets(c, chap.topics);
      label(c, "Reader will be able to");
      bullets(c, chap.learningOutcomes);
      label(c, "Action steps");
      numbered(c, chap.actionSteps);
      label(c, "Common mistake");
      p(c, chap.commonMistake);
      label(c, "Quick win");
      p(c, chap.quickWin);
    });
  });

  sectionStart(ctx, "Sales Copy Templates", toc);
  label(ctx, "Headline options");
  report.salesCopy.headlines.forEach((hl) => {
    h2(ctx, hl.headline);
    p(ctx, hl.rationale, { muted: true, italic: true });
  });
  label(ctx, "Subheadline");
  p(ctx, report.salesCopy.subheadline);
  label(ctx, "Bullet points");
  bullets(ctx, report.salesCopy.bullets);
  label(ctx, "Guarantee");
  p(ctx, report.salesCopy.guarantee, { italic: true });

  sectionStart(ctx, "Marketing Strategy & Ad Arsenal", toc);
  report.marketingAngles.forEach((ma) => {
    card(ctx, (c) => {
      h2(c, ma.title);
      p(c, ma.rationale);
    });
  });

  sectionStart(ctx, "Social Media Content Plan", toc);
  report.socialPosts.forEach((sp) => {
    card(ctx, (c) => {
      label(c, sp.platform);
      p(c, sp.content);
    });
  });

  sectionStart(ctx, "Email Marketing Sequence", toc);
  report.emailSequence.forEach((em) => {
    card(ctx, (c) => {
      label(c, em.day);
      h2(c, em.subject);
      p(c, em.preview, { muted: true });
      p(c, em.purpose, { italic: true });
    });
  });

  sectionStart(ctx, "YouTube Video Strategy", toc);
  report.youtubeIdeas.forEach((yt) => {
    card(ctx, (c) => {
      h2(c, yt.title);
      p(c, yt.hookStrategy);
    });
  });

  sectionStart(ctx, "Launch Roadmap", toc);
  numbered(ctx, report.launchRoadmap);

  sectionStart(ctx, "90-Day Action Checklist", toc);
  h2(ctx, "Days 1-7 · Research, create & validate");
  checklist(ctx, report.ninetyDayChecklist.days1to7);
  h2(ctx, "Days 8-30 · Launch, sell & market");
  checklist(ctx, report.ninetyDayChecklist.days8to30);
  h2(ctx, "Days 31-90 · Scale, automate & grow");
  checklist(ctx, report.ninetyDayChecklist.days31to90);

  // ---- Go back and fill in the table of contents ----
  doc.setPage(tocPageIndex);
  let ty = M;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...SIGNAL);
  doc.text("Table of Contents", M, ty + 18);
  ty += 46;
  doc.setDrawColor(...LINE);
  doc.line(M, ty, W - M, ty);
  ty += 26;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  for (const entry of toc) {
    doc.setTextColor(...INK);
    doc.text(entry.title, M, ty);
    doc.setTextColor(...MUTED);
    const pageLabel = String(entry.page);
    const pageWidth = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, W - M - pageWidth, ty);
    // dotted leader
    const startX = M + doc.getTextWidth(entry.title) + 8;
    const endX = W - M - pageWidth - 8;
    if (endX > startX) {
      doc.setLineDashPattern([1, 2], 0);
      doc.setDrawColor(...LINE);
      doc.line(startX, ty - 3, endX, ty - 3);
      doc.setLineDashPattern([], 0);
    }
    ty += 24;
  }

  // Total page count footer note on TOC
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`${doc.getNumberOfPages()} pages total`, M, H - M);

  const filename = `${report.productTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-report.pdf`;
  doc.save(filename || "niche-forge-report.pdf");
            }
