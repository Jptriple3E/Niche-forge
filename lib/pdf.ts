import jsPDF from "jspdf";

const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

interface Section {
  heading: string;
  body: string; // markdown-ish
}

function stripInlineMarkdown(line: string): string {
  return line
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1");
}

function renderBody(doc: jsPDF, text: string, startY: number): number {
  let y = startY;
  const lines = text.split("\n");

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === "") {
      y += 8;
      continue;
    }

    // Headings
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);

    if (h1 || h2 || h3) {
      const content = stripInlineMarkdown((h1 || h2 || h3)![1]);
      const size = h1 ? 16 : h2 ? 14 : 12;
      ensureSpace(size + 14);
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(28, 43, 34);
      const wrapped = doc.splitTextToSize(content, CONTENT_WIDTH);
      doc.text(wrapped, MARGIN, y);
      y += wrapped.length * (size * 1.25) + 4;
      continue;
    }

    // Bullets
    const bullet = line.match(/^[-*]\s+(.*)/);
    if (bullet) {
      const content = stripInlineMarkdown(bullet[1]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(40, 40, 40);
      const wrapped = doc.splitTextToSize("•  " + content, CONTENT_WIDTH - 12);
      ensureSpace(wrapped.length * 14 + 4);
      doc.text(wrapped, MARGIN + 8, y);
      y += wrapped.length * 14 + 2;
      continue;
    }

    // Numbered list
    const numbered = line.match(/^(\d+)\.\s+(.*)/);
    if (numbered) {
      const content = stripInlineMarkdown(numbered[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(40, 40, 40);
      const wrapped = doc.splitTextToSize(`${numbered[1]}.  ${content}`, CONTENT_WIDTH - 12);
      ensureSpace(wrapped.length * 14 + 4);
      doc.text(wrapped, MARGIN + 8, y);
      y += wrapped.length * 14 + 2;
      continue;
    }

    // Regular paragraph
    const content = stripInlineMarkdown(line);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(40, 40, 40);
    const wrapped = doc.splitTextToSize(content, CONTENT_WIDTH);
    ensureSpace(wrapped.length * 14 + 4);
    doc.text(wrapped, MARGIN, y);
    y += wrapped.length * 14 + 2;
  }

  return y;
}

/**
 * Exports a set of {heading, body} sections as a single polished PDF.
 */
export function exportSectionsToPDF(title: string, sections: Section[], filename: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Cover
  doc.setFillColor(241, 240, 234);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
  doc.setTextColor(28, 43, 34);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  const titleLines = doc.splitTextToSize(title, CONTENT_WIDTH);
  doc.text(titleLines, MARGIN, 300);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text(`Generated ${new Date().toLocaleDateString()} · Niche Forge`, MARGIN, 300 + titleLines.length * 34 + 16);

  for (const section of sections) {
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
    let y = MARGIN;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(192, 138, 46);
    const headingLines = doc.splitTextToSize(section.heading, CONTENT_WIDTH);
    doc.text(headingLines, MARGIN, y + 20);
    y += 20 + headingLines.length * 24 + 10;
    doc.setDrawColor(216, 213, 200);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 20;
    renderBody(doc, section.body, y);
  }

  doc.save(filename);
        }
