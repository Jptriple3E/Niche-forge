const JSON_SYSTEM =
  "You are a senior digital-product strategist who has personally launched and sold ebooks, courses, templates, planners, and checklists. " +
  "You are blunt, specific, and allergic to vague filler ('great opportunity', 'huge potential') — every claim is backed by a concrete, believable reason. " +
  "You respond with ONLY valid JSON. No markdown code fences, no preamble, no trailing commentary — the entire response must be parseable with JSON.parse(). " +
  "Every string value must be real, specific content — never placeholder text like 'TBD' or 'Lorem ipsum'.";

/**
 * Stage 1: the core research — niche scoring, audience, pain points, and the
 * flagship product's full chapter-by-chapter breakdown.
 */
export function buildCorePrompt(niche: string): { system: string; user: string } {
  return {
    system: JSON_SYSTEM,
    user: `Research this niche and design one flagship digital product for it: "${niche}"

Return ONLY a JSON object with this exact shape:

{
  "productTitle": "a real, specific title someone would put on a sales page",
  "productType": "ebook" | "course" | "template" | "planner" | "checklist",
  "price": "e.g. $27",
  "productDescription": "2-3 sentences: what it is, who it's for, the core transformation, why it beats free content",
  "demandScore": <number 0-100, realistic based on search/buying behavior>,
  "competition": "Low" | "Medium" | "High",
  "profitPotential": "Low" | "Medium" | "High" | "Very High",
  "whyThisNiche": "2-3 sentences on why this niche is worth entering right now, grounded in something concrete",
  "audienceSegments": [ { "name": "specific buyer persona name", "description": "1-2 sentences: who they are, what triggers them to buy" } ] (3 segments),
  "painPoints": [
    {
      "point": "the specific pain point, in the audience's own framing",
      "rootCause": "why this actually happens to them",
      "dailyImpact": "a concrete moment in their week where this bites",
      "whyFreeSolutionsFail": "why free YouTube/blog content doesn't fix this",
      "emotionalCost": "how it actually feels for them, specifically",
      "howProductSolves": "the exact mechanism the product uses to fix it"
    }
  ] (8 pain points, each distinct),
  "chapters": [
    {
      "number": <1-based index>,
      "title": "chapter title",
      "whatItCovers": "2-3 sentences describing real content, not generic filler",
      "topics": ["4 specific subtopics"],
      "learningOutcomes": ["5 specific things the reader can do after this chapter"],
      "actionSteps": ["3 concrete actions to take after reading"],
      "commonMistake": "the single most common mistake at this stage, and why it hurts",
      "quickWin": "one small, doable-today action from this chapter"
    }
  ] (10 chapters, sequenced logically from foundation to implementation),
  "transformation": "2-3 sentences describing the before/after transformation a buyer experiences",
  "whyBuyersPay": ["5 specific reasons buyers pay for this over free content"]
}

Make every field specific to "${niche}" — nothing generic enough to paste into a different niche's report.`,
  };
}
/**
 * Stage 2: everything needed to sell and launch the product from stage 1.
 * Takes the stage-1 result as context so the copy is grounded in the real
 * product, audience, and pain points already generated.
 */
export function buildExpansionPrompt(
  niche: string,
  core: { productTitle: string; productDescription: string; audienceSegments: unknown; painPoints: unknown; chapters: unknown }
): { system: string; user: string } {
  return {
    system: JSON_SYSTEM,
    user: `Here is a digital product already designed for the niche "${niche}":

Title: ${core.productTitle}
Description: ${core.productDescription}
Audience segments: ${JSON.stringify(core.audienceSegments)}
Pain points: ${JSON.stringify(core.painPoints)}
Chapter titles: ${JSON.stringify(
      Array.isArray(core.chapters) ? (core.chapters as any[]).map((c) => c.title) : []
    )}

Generate the complete sales, marketing, and launch kit for it. Return ONLY a JSON object with this exact shape:

{
  "salesCopy": {
    "headlines": [ { "headline": "a real sales-page headline", "rationale": "the psychological trigger it uses and why it fits this audience" } ] (3 headlines),
    "subheadline": "one supporting sentence",
    "bullets": ["8 benefit-first bullet points pulled from the real chapters/pain points, each starting with an action verb"],
    "guarantee": "a full money-back guarantee statement in first person, specific to this product"
  },
  "marketingAngles": [ { "title": "SHORT PUNCHY AD HEADLINE IN CAPS", "rationale": "the psychological trigger and why it works for this audience" } ] (6 angles, each genuinely different),
  "socialPosts": [ { "platform": "X/Twitter thread" | "LinkedIn" | "Instagram/TikTok caption" | "Facebook", "content": "the full, ready-to-publish post text" } ] (6 posts, distinct angles: pain point, transformation, behind-the-scenes, social proof, urgency, myth-busting),
  "emailSequence": [ { "day": "Day 0 — Welcome", "subject": "actual subject line", "preview": "actual preview text", "purpose": "one line on the strategic goal of this email" } ] (7 emails covering: welcome, pain/story, solution, proof, offer, objections, long-term nurture),
  "youtubeIdeas": [ { "title": "actual clickable video title", "hookStrategy": "exactly what happens in the first 30 seconds and why it hooks viewers" } ] (5 ideas, each based on a real chapter),
  "launchRoadmap": ["12 sequential, concrete launch steps from finishing the product to first sale, each one sentence"],
  "ninetyDayChecklist": {
    "days1to7": ["7 concrete daily-ish actions for research, creation, and validation"],
    "days8to30": ["7 concrete actions for launch, first sales, and early marketing"],
    "days31to90": ["7 concrete actions for scaling, automating, and growing"]
  }
}

Every piece must reference something specific about this exact product and niche — no generic brand voice, no filler.`,
  };
        }
