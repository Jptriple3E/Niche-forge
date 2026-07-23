import { NextRequest, NextResponse } from "next/server";
import { generate } from "@/lib/ai";
import { buildPrompt, Task } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_TASKS: Task[] = [
  "niche-research",
  "validation",
  "pain-points",
  "product-ideas",
  "outline",
  "sales-page",
  "marketing",
];

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { task, input } = body || {};

  if (!task || !VALID_TASKS.includes(task)) {
    return NextResponse.json(
      { error: `task must be one of: ${VALID_TASKS.join(", ")}` },
      { status: 400 }
    );
  }

  if (!input || typeof input !== "object") {
    return NextResponse.json({ error: "input object is required" }, { status: 400 });
  }

  try {
    const { system, user } = buildPrompt(task as Task, input);
    const { text, provider } = await generate(system, user);
    return NextResponse.json({ result: text, provider });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 502 });
  }
}
