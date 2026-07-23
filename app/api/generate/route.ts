import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai";
import { buildCorePrompt, buildExpansionPrompt } from "@/lib/prompts";
import { Report } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type CorePart = Omit<
  Report,
  | "id"
  | "createdAt"
  | "niche"
  | "salesCopy"
  | "marketingAngles"
  | "socialPosts"
  | "emailSequence"
  | "youtubeIdeas"
  | "launchRoadmap"
  | "ninetyDayChecklist"
>;

type ExpansionPart = Pick<
  Report,
  "salesCopy" | "marketingAngles" | "socialPosts" | "emailSequence" | "youtubeIdeas" | "launchRoadmap" | "ninetyDayChecklist"
>;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const niche: string = body?.niche;
  if (!niche || typeof niche !== "string" || !niche.trim()) {
    return NextResponse.json({ error: "A niche is required" }, { status: 400 });
  }

  try {
    const corePrompt = buildCorePrompt(niche);
    const core = await generateJSON<CorePart>(corePrompt.system, corePrompt.user);

    const expansionPrompt = buildExpansionPrompt(niche, {
      productTitle: core.productTitle,
      productDescription: core.productDescription,
      audienceSegments: core.audienceSegments,
      painPoints: core.painPoints,
      chapters: core.chapters,
    });
    const expansion = await generateJSON<ExpansionPart>(expansionPrompt.system, expansionPrompt.user);

    const report: Report = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      niche,
      ...core,
      ...expansion,
    };

    return NextResponse.json({ report });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Research generation failed" }, { status: 502 });
  }
      }
