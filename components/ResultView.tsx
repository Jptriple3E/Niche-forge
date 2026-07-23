"use client";

import ReactMarkdown from "react-markdown";

export default function ResultView({ text }: { text: string }) {
  return (
    <div className="prose-field font-body text-sm text-ink">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
