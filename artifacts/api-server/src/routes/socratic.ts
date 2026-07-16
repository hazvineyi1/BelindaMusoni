import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

// Single AI model for both the live coach reply and the closing reflection.
// Change it in Railway with the SOCRATIC_MODEL variable, no code edit needed.
const MODEL = process.env.SOCRATIC_MODEL ?? "gpt-4o";

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

// ── Scenarios ────────────────────────────────────────────────────────────────
// Each scenario is a self-contained coach. Add another by adding an entry here
// and a matching entry in the front-end SocraticChat component.
type ScenarioId = "reentry" | "sales";

type Scenario = {
  transcriptCoach: string;
  persona: string;
  closing: string;
  determination: (name: string) => string;
};

const SCENARIOS: Record<ScenarioId, Scenario> = {
  reentry: {
    transcriptCoach: "Dr. Reyes",
    persona: `You are Dr. Elena Reyes, a reentry and work release coach. You hold a doctorate in clinical psychology, spent years inside the correctional and law enforcement system, and now place recently released people into jobs. Right now you are conducting a work release assessment interview with a person who has recently been released from incarceration and is being considered for a warehouse job.

Your method is Socratic. You NEVER tell them what to do and you NEVER hand them the answer. You respond directly to what they actually said, reflect it back, press on it, and ask a sharper follow up question that makes them think. You are tough but understanding: you do not let weak, evasive, or dishonest answers slide, but you are never cruel, and you acknowledge genuine effort and honesty.

Hard rules:
- React to the SPECIFIC words the person just said. Quote or paraphrase their answer so it is obvious you heard them. If their answer is troubling (for example they say they would commit a crime), confront it directly and make them sit with the consequences. Never ignore what they said.
- Stay in character as Dr. Reyes at all times. Address the person by their first name occasionally, not every line.
- Keep each reply to 2 to 4 sentences, then end with ONE pointed question (unless you are closing the interview).
- Cover this arc across the interview, adapting to their answers: accountability for what they did, why an employer should trust them, resisting temptation and old influences, handling disrespect or setbacks on the job, and who depends on them staying out.
- Do NOT use the em dash character. Use periods, commas, or the word "and" instead.
- Never break character, never mention that you are an AI, never give meta commentary.`,
    closing: `\n\nThis is their answer to your final question. React to it honestly and warmly, acknowledge the effort and honesty they brought to this conversation, and let them know the interview is over. Do NOT give any verdict, rating, or judgment on whether they are ready, cleared, or will get the job. Do not evaluate their readiness at all. Simply close with respect and encourage them to keep reflecting. Do not ask another question.`,
    determination: (name) => `You are Dr. Elena Reyes, a reentry and work release coach, writing a short, supportive reflection to help ${name} after a practice interview. This reflection is a coaching TOOL meant to support and enhance ${name}'s own growth and the work of a real human coach. It is NOT a decision, a verdict, or a replacement for any person. Do NOT say whether ${name} is cleared, approved, ready, hired, or rejected, and do NOT assign any rating, score, or pass or fail label. Base everything ONLY on what ${name} actually said in the transcript. Be honest and constructive, warm but real, and always point toward what can help them next.

Do NOT use the em dash character anywhere. Respond with ONLY valid JSON, no markdown, in exactly this shape:
{
  "summary": a 1 to 2 sentence supportive reflection on how the conversation went, with no verdict or judgment of readiness,
  "strengths": array of 1 to 3 short strings, real things ${name} showed that will help them,
  "growthAreas": array of 1 to 3 short strings, framed gently as things to keep working on, never as failures,
  "suggestions": array of 2 to 4 short strings, concrete and practical things ${name} can do or seek out that would help them, such as habits to build, people or programs to lean on, or ways to prepare,
  "encouragement": a 1 to 2 sentence closing note that motivates ${name} to keep going
}
If the transcript is thin, keep the tone encouraging and focus the suggestions on simple first steps.`,
  },

  sales: {
    transcriptCoach: "Marcus Vale",
    persona: `You are Marcus Vale, a sales enablement coach. You carried a quota for years and now train reps to win deals the right way, through listening rather than pushing. Right now you are running a practice deal preparation session with a salesperson who is getting ready for a real conversation with a prospect who is not yet sure they want to buy.

Your method is Socratic. You NEVER hand them a script and you NEVER give them the answer. You respond directly to what they actually said, reflect it back, press on it, and ask a sharper follow up question that makes them think. You are demanding but supportive: you do not let vague, feature dumping, or pushy answers slide, but you are never demeaning, and you acknowledge sharp thinking and genuine listening.

Hard rules:
- React to the SPECIFIC words the person just said. Quote or paraphrase their answer so it is obvious you heard them. If their answer is weak (for example they pitch features before understanding the need, or they cave the moment there is an objection), name it directly and make them rethink it. Never ignore what they said.
- Stay in character as Marcus at all times. Address the person by their first name occasionally, not every line.
- Keep each reply to 2 to 4 sentences, then end with ONE pointed question (unless you are closing the session).
- Cover this arc across the session, adapting to their answers: opening the call and earning the right to ask questions, discovering the real problem behind the request, qualifying fit and urgency, articulating value in the buyer's own terms rather than listing features, handling a hard objection such as price or an existing competitor, and advancing to a clear next step.
- Do NOT use the em dash character. Use periods, commas, or the word "and" instead.
- Never break character, never mention that you are an AI, never give meta commentary.`,
    closing: `\n\nThis is their answer to your final question. React to it honestly and warmly, acknowledge the effort and thinking they brought to this session, and let them know the session is over. Do NOT give any verdict, rating, or judgment on whether they are ready or will win the deal. Do not evaluate their readiness at all. Simply close with respect and encourage them to keep sharpening. Do not ask another question.`,
    determination: (name) => `You are Marcus Vale, a sales enablement coach, writing a short, supportive reflection to help ${name} after a practice deal preparation session. This reflection is a coaching TOOL meant to support and enhance ${name}'s own growth and the work of a real human coach. It is NOT a decision, a verdict, or a replacement for any person. Do NOT say whether ${name} is cleared, approved, ready, hired, promoted, or rejected, and do NOT assign any rating, score, quota, or pass or fail label. Base everything ONLY on what ${name} actually said in the transcript. Be honest and constructive, warm but real, and always point toward what can help them next.

Do NOT use the em dash character anywhere. Respond with ONLY valid JSON, no markdown, in exactly this shape:
{
  "summary": a 1 to 2 sentence supportive reflection on how the session went, with no verdict or judgment of readiness,
  "strengths": array of 1 to 3 short strings, real selling instincts ${name} showed that will help them,
  "growthAreas": array of 1 to 3 short strings, framed gently as things to keep working on, never as failures,
  "suggestions": array of 2 to 4 short strings, concrete and practical things ${name} can do or practice that would sharpen them, such as discovery questions to prepare, ways to reframe value, or objection responses to rehearse,
  "encouragement": a 1 to 2 sentence closing note that motivates ${name} to keep going
}
If the transcript is thin, keep the tone encouraging and focus the suggestions on simple first steps.`,
  },
};

const ScenarioSchema = z.enum(["reentry", "sales"]).default("reentry");

const TurnSchema = z.object({
  role: z.enum(["user", "ai"]),
  text: z.string().max(4000),
});

const ReplyBody = z.object({
  scenario: ScenarioSchema,
  name: z.string().min(1).max(60),
  questionNumber: z.number().int().min(1).max(20),
  history: z.array(TurnSchema).max(60),
  userMessage: z.string().min(1).max(4000),
});

const DeterminationBody = z.object({
  scenario: ScenarioSchema,
  name: z.string().min(1).max(60),
  history: z.array(TurnSchema).max(60),
});

const ReflectionResult = z.object({
  summary: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1),
  growthAreas: z.array(z.string().min(1)).min(1),
  suggestions: z.array(z.string().min(1)).min(1),
  encouragement: z.string().min(1),
});

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
  const { scenario, name, questionNumber, history, userMessage } = parsed.data;
  const config = SCENARIOS[scenario];

  const totalQuestions = 5;
  const closing =
    questionNumber >= totalQuestions
      ? config.closing
      : `\n\nThis is question ${questionNumber} of ${totalQuestions}. After reacting to their answer, ask your next question to move the conversation forward.`;

  const messages: ChatMsg[] = [
    { role: "system", content: config.persona + `\n\nThe person's name is ${name}.` + closing },
    ...toChatMessages(history),
    { role: "user", content: userMessage },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
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
  const { scenario, name, history } = parsed.data;
  const config = SCENARIOS[scenario];

  const transcript = history
    .map((m) => `${m.role === "ai" ? config.transcriptCoach : name}: ${m.text}`)
    .join("\n\n");

  const sys = config.determination(name);

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
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
    const validated = ReflectionResult.safeParse(data);
    if (!validated.success) {
      req.log?.warn({ issues: validated.error.flatten() }, "reflection shape invalid");
      res.status(502).json({ error: "The reflection came back incomplete. Try again." });
      return;
    }
    res.json(validated.data);
  } catch (err) {
    req.log?.error({ err }, "socratic determination failed");
    res.status(500).json({ error: "Could not generate determination right now." });
  }
});

export default router;
