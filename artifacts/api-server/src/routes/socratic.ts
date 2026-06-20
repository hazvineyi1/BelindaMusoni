import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

// ── Rate limiting ────────────────────────────────────────────────────────────
// These endpoints call a paid LLM, so they are throttled to bound cost/abuse on
// a public portfolio. A global cap bounds total spend even if client IPs are
// spoofed; a per-IP cap keeps any single visitor from monopolizing the demo.
const WINDOW_MS = 60_000;
const PER_IP_MAX = 12;
const GLOBAL_MAX = 40;

const ipHits = new Map<string, number[]>();
let globalHits: number[] = [];

function prune(times: number[], now: number): number[] {
  const cutoff = now - WINDOW_MS;
  return times.filter((t) => t > cutoff);
}

function clientIp(req: Request): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0]!.trim();
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0]!.trim();
  return req.ip ?? "unknown";
}

function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();

  globalHits = prune(globalHits, now);
  if (globalHits.length >= GLOBAL_MAX) {
    res.status(429).json({ error: "The coach is busy right now. Give it a minute and try again." });
    return;
  }

  const ip = clientIp(req);
  const hits = prune(ipHits.get(ip) ?? [], now);
  if (hits.length >= PER_IP_MAX) {
    res.status(429).json({ error: "You are sending answers a little too fast. Take a breath and try again shortly." });
    return;
  }

  hits.push(now);
  ipHits.set(ip, hits);
  globalHits.push(now);

  if (ipHits.size > 5000) {
    for (const [key, times] of ipHits) {
      const kept = prune(times, now);
      if (kept.length === 0) ipHits.delete(key);
      else ipHits.set(key, kept);
    }
  }

  next();
}

const TurnSchema = z.object({
  role: z.enum(["user", "ai"]),
  text: z.string().max(4000),
});

const ReplyBody = z.object({
  name: z.string().min(1).max(60),
  questionNumber: z.number().int().min(1).max(20),
  history: z.array(TurnSchema).max(60),
  userMessage: z.string().min(1).max(4000),
});

const DeterminationBody = z.object({
  name: z.string().min(1).max(60),
  history: z.array(TurnSchema).max(60),
});

const DeterminationResult = z.object({
  recommendation: z.enum(["Cleared for placement", "Conditional placement", "Not yet ready"]),
  headline: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1),
  concerns: z.array(z.string().min(1)).min(1),
  conditions: z.array(z.string().min(1)).min(1),
  rationale: z.string().min(1),
});

const PERSONA = `You are Dr. Elena Reyes, a reentry and work release coach. You hold a doctorate in clinical psychology, spent years inside the correctional and law enforcement system, and now place recently released people into jobs. Right now you are conducting a work release assessment interview with a person who has recently been released from incarceration and is being considered for a warehouse job.

Your method is Socratic. You NEVER tell them what to do and you NEVER hand them the answer. You respond directly to what they actually said, reflect it back, press on it, and ask a sharper follow up question that makes them think. You are tough but understanding: you do not let weak, evasive, or dishonest answers slide, but you are never cruel, and you acknowledge genuine effort and honesty.

Hard rules:
- React to the SPECIFIC words the person just said. Quote or paraphrase their answer so it is obvious you heard them. If their answer is troubling (for example they say they would commit a crime), confront it directly and make them sit with the consequences. Never ignore what they said.
- Stay in character as Dr. Reyes at all times. Address the person by their first name occasionally, not every line.
- Keep each reply to 2 to 4 sentences, then end with ONE pointed question (unless you are closing the interview).
- Cover this arc across the interview, adapting to their answers: accountability for what they did, why an employer should trust them, resisting temptation and old influences, handling disrespect or setbacks on the job, and who depends on them staying out.
- Do NOT use the em dash character. Use periods, commas, or the word "and" instead.
- Never break character, never mention that you are an AI, never give meta commentary.`;

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

function toChatMessages(history: { role: "user" | "ai"; text: string }[]): ChatMsg[] {
  return history.map((m) => ({
    role: m.role === "ai" ? "assistant" : "user",
    content: m.text,
  }));
}

router.post("/socratic/reply", rateLimit, async (req, res) => {
  const parsed = ReplyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }
  const { name, questionNumber, history, userMessage } = parsed.data;

  const totalQuestions = 5;
  const closing =
    questionNumber >= totalQuestions
      ? `\n\nThis is their answer to your final question. React to it honestly, then CLOSE the interview: give a brief, candid read on where they stand and tell them the interview is over. Do not ask another question.`
      : `\n\nThis is question ${questionNumber} of ${totalQuestions}. After reacting to their answer, ask your next question to move the interview forward.`;

  const messages: ChatMsg[] = [
    { role: "system", content: PERSONA + `\n\nThe person's name is ${name}.` + closing },
    ...toChatMessages(history),
    { role: "user", content: userMessage },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages,
    });
    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!reply) {
      res.status(502).json({ error: "Empty response from model" });
      return;
    }
    res.json({ reply });
  } catch (err) {
    req.log?.error({ err }, "socratic reply failed");
    res.status(500).json({ error: "Coach is unavailable right now." });
  }
});

router.post("/socratic/determination", rateLimit, async (req, res) => {
  const parsed = DeterminationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }
  const { name, history } = parsed.data;

  const transcript = history
    .map((m) => `${m.role === "ai" ? "Dr. Reyes" : name}: ${m.text}`)
    .join("\n\n");

  const sys = `You are Dr. Elena Reyes, a reentry and work release coach, writing your private assessment after a work release interview with ${name}, who is being considered for a warehouse job. Base your judgment ONLY on what ${name} actually said in the transcript. Be tough but fair, like a clinician who has seen this go both ways.

Do NOT use the em dash character anywhere. Respond with ONLY valid JSON, no markdown, in exactly this shape:
{
  "recommendation": one of "Cleared for placement", "Conditional placement", or "Not yet ready",
  "headline": a one sentence summary of your read on ${name},
  "strengths": array of 1 to 3 short strings, things ${name} showed that support reentry,
  "concerns": array of 1 to 3 short strings, real risks based on what they said,
  "conditions": array of 1 to 3 short strings, concrete next steps or conditions you would attach,
  "rationale": 2 to 3 sentences explaining the recommendation, referencing specific things ${name} said
}
If the transcript is too thin to judge, weight toward "Not yet ready" or "Conditional placement" and say so in the rationale.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: `Interview transcript:\n\n${transcript}` },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      res.status(502).json({ error: "Could not parse determination." });
      return;
    }
    const validated = DeterminationResult.safeParse(data);
    if (!validated.success) {
      req.log?.warn({ issues: validated.error.flatten() }, "determination shape invalid");
      res.status(502).json({ error: "The assessment came back incomplete. Try again." });
      return;
    }
    res.json(validated.data);
  } catch (err) {
    req.log?.error({ err }, "socratic determination failed");
    res.status(500).json({ error: "Could not generate determination right now." });
  }
});

export default router;
