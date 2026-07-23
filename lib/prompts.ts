export type Task =
  | "niche-research"
  | "validation"
  | "pain-points"
  | "product-ideas"
  | "outline"
  | "sales-page"
  | "marketing";

const BASE_SYSTEM =
  "You are a senior digital-product strategist who has personally launched and sold ebooks, courses, templates, planners, and checklists. " +
  "You are blunt, specific, and allergic to vague filler ('great opportunity', 'huge potential') — every claim you make is backed by a concrete reason. " +
  "You always respond in clean Markdown with real headings, bullet lists, and bold key terms. Never wrap your answer in a code block.";

export function buildPrompt(task: Task, input: Record<string, string>): { system: string; user: string } {
  switch (task) {
    case "niche-research":
      return {
        system: BASE_SYSTEM,
        user: `The user's broad interest, skill, or audience is: "${input.topic}".

Find 6 profitable, specific sub-niches within or adjacent to this space. A "specific" niche names an audience AND a problem — not just a topic.

For each niche give:
- **Niche name**
- **Who it's for** (specific role/identity, not "people interested in X")
- **The core problem** they'd pay to solve
- **Why it's profitable right now** (buying behavior, willingness to pay, urgency)
- **Rough monetization angle** (ebook / course / template / planner / checklist — pick the one that fits best and say why)

Order the list from most immediately actionable (low competition, clear pain, easy to serve solo) to more ambitious.`,
      };

    case "validation":
      return {
        system: BASE_SYSTEM,
        user: `Score this niche/product idea: "${input.idea}"

Score each dimension out of 10 with a one-line justification grounded in something concrete (search behavior, existing competitors, typical price points, audience's ability to pay):
- **Demand** (/10)
- **Competition** (/10, where 10 = wide open, 1 = saturated by big players)
- **Profit potential** (/10, considering realistic price point and repeat/upsell potential)

Then give:
- **Overall verdict score** (/10, weighted average) as a single bold number at the top
- **Biggest risk** — the one thing most likely to sink this idea
- **Biggest edge** — the one thing that would make this idea win despite the risk
- **Go / Modify / Skip** recommendation with a one-sentence reason

Be specific to this idea — no generic scoring rubric filler.`,
      };

    case "pain-points":
      return {
        system: BASE_SYSTEM,
        user: `List the real, specific pain points of this audience/niche: "${input.niche}"

Give 8 pain points. For each one:
- **The pain point** (specific, in the audience's own words/framing — not a category)
- **Where it shows up** (a moment or trigger in their week/workflow when this bites)
- **What they currently do about it** (the clumsy workaround, if any)
- **What a good product would need to actually fix it** (not just "address" — fix)

Group them at the end into 2-3 clusters that could each anchor a single product, and name each cluster.`,
      };

    case "product-ideas":
      return {
        system: BASE_SYSTEM,
        user: `For this niche: "${input.niche}", generate 10 digital product ideas covering a mix of ebook, planner, course, template, and checklist formats (don't do all one type — mix them based on what actually fits the problem).

Each idea must be scoped as a real, sellable, 20-30 page (or equivalent depth) product — not a vague concept. For each of the 10 ideas give:

1. **Title** (a real title someone would put on a sales page, not "Idea #1")
2. **Format** (ebook / course / template / planner / checklist)
3. **Who it's for** (specific)
4. **The exact problem it solves** and why existing free content doesn't solve it
5. **What's actually inside** — a concrete breakdown of sections/modules/pages showing real problem-solving substance (e.g. not "tips for X" but "a 12-step troubleshooting framework for X with decision tree")
6. **Unique value / angle** — the thing that makes this not-generic
7. **Suggested price** (realistic for format and depth)

Number them 1-10. Make each one genuinely different in angle, not variations on the same idea.`,
      };

    case "outline":
      return {
        system: BASE_SYSTEM,
        user: `Build a complete, ready-to-write outline for this digital product:

"${input.product}"

Produce a full chapter/module-by-module (or section-by-section for a template/checklist) outline scoped to 20-30 pages of real content. For each chapter/section give:
- **Title**
- **What it covers** (2-4 bullet points of actual content, specific enough that a writer could draft from it directly — not "discuss the basics")
- **The one problem this section solves** for the reader
- **Estimated page count**

Start with a short intro section (hook + what the reader will walk away with) and end with an action-oriented closing section (implementation plan / next steps / quick-start checklist). Total the estimated pages at the end and confirm it lands in the 20-30 page range.`,
      };

    case "sales-page":
      return {
        system: BASE_SYSTEM,
        user: `Write a complete, persuasive sales page for this product:

"${input.product}"

${input.outline ? `Here is the product's outline/contents to draw specifics from:\n${input.outline}\n` : ""}

Structure it with these sections, in Markdown with clear headings:
- **Headline** (specific outcome, not generic hype)
- **Subheadline**
- **The problem** (agitate the real pain, 2-3 short paragraphs, no clichés)
- **The solution** (introduce the product as the bridge)
- **What's inside** (bullet list pulled from the real content, benefit-first phrasing)
- **Who this is for / not for**
- **Social proof placeholder** (a labeled placeholder block the user can swap in real testimonials)
- **Pricing + guarantee**
- **FAQ** (4-5 real objections, specific to this product)
- **Final call to action**

Keep the tone confident and specific — sell the transformation, not the file format.`,
      };

    case "marketing":
      return {
        system: BASE_SYSTEM,
        user: `Create a launch marketing content kit for this product:

"${input.product}"

Produce, in clearly labeled Markdown sections:
1. **5 social media posts** (mix of platforms — at least one X/Twitter thread starter, one LinkedIn post, one Instagram/TikTok caption), each with a distinct angle (pain point, transformation, behind-the-scenes, social proof, urgency)
2. **3 launch emails** (subject line + body): a "doors open" email, a "value/story" email, and a "last chance" urgency email
3. **3 ad copy variants** (short-form, for paid social) each with headline + primary text, testing a different hook

Every piece must reference something specific about this exact product — no placeholder brand voice.`,
      };

    default:
      throw new Error(`Unknown task: ${task}`);
  }
   }
