// Thin wrappers around Groq and Gemini's chat completion APIs.
// Groq is tried first (fast + generous free tier), Gemini is the fallback
// if Groq fails or GROQ_API_KEY isn't set.

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GEMINI_MODEL = "gemini-2.0-flash";
const MAX_TOKENS = 8000;

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned no content");
  return content as string;
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: MAX_TOKENS,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Gemini returned no content");
  return content as string;
}

/**
 * Generates a completion, trying Groq first and falling back to Gemini.
 * Throws only if both providers fail (or neither key is configured).
 */
export async function generate(
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; provider: "groq" | "gemini" }> {
  const errors: string[] = [];

  try {
    const text = await callGroq(systemPrompt, userPrompt);
    return { text, provider: "groq" };
  } catch (err: any) {
    errors.push(`Groq: ${err.message}`);
  }

  try {
    const text = await callGemini(systemPrompt, userPrompt);
    return { text, provider: "gemini" };
  } catch (err: any) {
    errors.push(`Gemini: ${err.message}`);
  }

  throw new Error(
    `Both AI providers failed.\n${errors.join(
      "\n"
    )}\n\nMake sure GROQ_API_KEY and/or GEMINI_API_KEY are set in your environment variables.`
  );
}

/**
 * Generates a completion and parses it as JSON, stripping stray code fences
 * or leading/trailing text some models add despite instructions not to.
 */
export async function generateJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const { text } = await generate(systemPrompt, userPrompt);
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "");

  // If the model wrapped the JSON in extra prose, extract the outermost braces.
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const jsonSlice =
    firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned;

  try {
    return JSON.parse(jsonSlice) as T;
  } catch (err) {
    throw new Error(
      `Failed to parse AI response as JSON. The model may have returned malformed output — try again.`
    );
  }
}
