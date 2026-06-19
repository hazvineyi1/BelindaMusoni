import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

type Message = { role: "user" | "ai"; text: string };
type Stage = "opening" | "probing" | "challenging" | "synthesizing";
type TraceStep = { label: string; value: string; color: string };

const starterTopics = [
  { label: "Critical Thinking",  value: "critical thinking" },
  { label: "Data Literacy",      value: "data literacy" },
  { label: "Ethical AI Use",     value: "ethical AI use" },
];

function extractClaim(text: string): string {
  const stripped = text
    .replace(/^(i think that?|i believe that?|i feel like|well,?\s*|so,?\s*|actually,?\s*|basically,?\s*|i mean,?\s*|maybe,?\s*|perhaps,?\s*|honestly,?\s*|i guess,?\s*|right,?\s*|look,?\s*|yeah,?\s*|yes,?\s*|no,?\s*)/i, "")
    .replace(/[.!?]+$/, "")
    .trim();
  const firstClause = stripped.split(/,?\s+(but|and so|because of that|which means|so therefore)/i)[0].trim();
  const out = firstClause.length > 58 ? firstClause.slice(0, 55) + "..." : firstClause;
  return out || stripped.slice(0, 55) || text.slice(0, 55);
}

function getStage(userTurnCount: number): Stage {
  if (userTurnCount === 1) return "opening";
  if (userTurnCount <= 3) return "probing";
  if (userTurnCount <= 5) return "challenging";
  return "synthesizing";
}

const stageLabels: Record<Stage, string> = {
  opening:      "Surface the belief",
  probing:      "Test the assumption",
  challenging:  "Stress-test the claim",
  synthesizing: "Build toward insight",
};

type TemplateFn = (claim: string, prevClaim: string) => string;

const templates: Record<string, Record<Stage, TemplateFn[]>> = {
  "critical thinking": {
    opening: [
      (c) => `You're working from the idea that ${c}. What convinced you of that, and when did you first form that view?`,
      (c) => `You said "${c}." Before we go further — is that something you've always believed, or did something shift your thinking recently?`,
    ],
    probing: [
      (c) => `You mentioned "${c}." What's the assumption sitting underneath that? If that assumption were wrong, does your conclusion still hold?`,
      (c) => `"${c}" — who would push back on that most strongly, and what would they say? Do they have a point?`,
      (c, p) => `Earlier you said "${p}", and now "${c}." Are those two ideas consistent, or is there a tension worth examining?`,
      (c) => `If you were advising someone else who believed "${c}", what question would you ask them to make sure they'd really thought it through?`,
    ],
    challenging: [
      (c) => `Let's stress-test "${c}." What's the best counter-argument you haven't been able to dismiss yet?`,
      (c) => `You've held onto "${c}" through this conversation. What evidence would actually change your mind — not just challenge it, but genuinely shift your position?`,
      (c, p) => `You moved from "${p}" to "${c}." Is that a refinement of the same belief, or have you discovered something that surprised you?`,
    ],
    synthesizing: [
      (c) => `Given everything you've worked through, how would you now explain "${c}" to a skeptic in three sentences?`,
      (c) => `You've interrogated your own thinking carefully. How confident are you in "${c}" right now, and what's still unresolved for you?`,
    ],
  },
  "data literacy": {
    opening: [
      (c) => `You're starting with "${c}." Who produced that data, and what were they trying to measure?`,
      (c) => `"${c}" — is that a pattern you found in the data, or a lens you brought to it before you looked?`,
    ],
    probing: [
      (c) => `You said "${c}." What's the denominator here? Who or what isn't being counted, and does that matter?`,
      (c) => `If you visualized "${c}" three different ways, would each one tell the same story — or would some make it look like the opposite?`,
      (c, p) => `You've moved from "${p}" to "${c}." Did the data lead you there, or did your interpretation shift?`,
      (c) => `"${c}" might be correlation. What would you need to see to establish that it's actually causation?`,
    ],
    challenging: [
      (c) => `Who benefits if people accept that "${c}"? Does knowing that change how much weight you give it?`,
      (c) => `You've been consistent about "${c}." What's missing from the dataset that could completely undermine that conclusion?`,
    ],
    synthesizing: [
      (c) => `Given everything you've probed, what decision would you make differently because of "${c}" — and what caveats would you attach?`,
      (c) => `If you had to explain the limits of "${c}" to a decision-maker in one paragraph, what would you say?`,
    ],
  },
  "ethical AI use": {
    opening: [
      (c) => `You're starting with "${c}." Who bears the risk if that assumption turns out to be wrong?`,
      (c) => `"${c}" — does that hold for everyone the system touches, or just the people who chose to use it?`,
    ],
    probing: [
      (c) => `If the system gets "${c}" wrong 5% of the time, which 5% of cases would be most harmful, and to whom?`,
      (c) => `You raised "${c}." What would informed consent actually look like for the people who never agreed to be part of this?`,
      (c, p) => `You've gone from "${p}" to "${c}." Has your sense of who's responsible shifted, or stayed the same?`,
      (c) => `"${c}" sounds reasonable from the developer's side. How would you explain it to someone the system harmed?`,
    ],
    challenging: [
      (c) => `At what scale does "${c}" become ethically untenable? Is there a number — users, decisions, errors — that changes your answer?`,
      (c) => `You've defended "${c}" consistently. What human judgment is this system replacing, and should that replacement ever be made?`,
    ],
    synthesizing: [
      (c) => `Given the tensions we've surfaced, how would you redesign this so "${c}" actually holds up under pressure?`,
      (c) => `If you were writing the governance policy for this AI, how would you encode "${c}" into a rule that couldn't be gamed?`,
    ],
  },
};

function pickResponse(topic: string, stage: Stage, claim: string, prevClaim: string, used: Set<string>): string {
  const pool = templates[topic]?.[stage] ?? templates["critical thinking"][stage];
  const unused = pool.filter((_, i) => !used.has(`${stage}:${i}`));
  const chosen = unused.length > 0 ? unused[0] : pool[0];
  return chosen(claim, prevClaim);
}

function pickResponseIdx(topic: string, stage: Stage, used: Set<string>): number {
  const pool = templates[topic]?.[stage] ?? templates["critical thinking"][stage];
  for (let i = 0; i < pool.length; i++) {
    if (!used.has(`${stage}:${i}`)) return i;
  }
  return 0;
}

export default function SocraticChat() {
  const [topic, setTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [userTurns, setUserTurns] = useState(0);
  const [lastClaim, setLastClaim] = useState("");
  const [prevClaim, setPrevClaim] = useState("");
  const [usedKeys, setUsedKeys] = useState<Set<string>>(new Set());
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const selectTopic = (t: string) => {
    setTopic(t);
    setMessages([{
      role: "ai",
      text: `Let's explore ${t}. Tell me: what do you currently believe about it, and where does that belief come from?`,
    }]);
    setUserTurns(0);
    setLastClaim("");
    setPrevClaim("");
    setUsedKeys(new Set());
    setTrace([{ label: "Topic selected", value: t, color: "#D9920B" }]);
  };

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");

    const turn = userTurns + 1;
    const claim = extractClaim(text);
    const stage = getStage(turn);
    const idx = pickResponseIdx(topic!, stage, usedKeys);
    const responseText = pickResponse(topic!, stage, claim, lastClaim || claim, usedKeys);
    const newKey = `${stage}:${idx}`;

    setUserTurns(turn);
    setPrevClaim(lastClaim);
    setLastClaim(claim);
    setUsedKeys(u => new Set([...u, newKey]));
    setMessages(m => [...m, { role: "user", text }]);

    setTrace([
      { label: "Claim extracted",   value: `"${claim}"`,        color: "#2E6E64" },
      { label: "Turn",              value: `${turn}`,            color: "#888"    },
      { label: "Stage",             value: stageLabels[stage],   color: "#D9920B" },
      { label: "Strategy",          value: stage,                color: "#16282B" },
    ]);

    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: "ai", text: responseText }]);
      setTyping(false);
    }, 800 + Math.random() * 700);
  };

  const reset = () => {
    setTopic(null);
    setMessages([]);
    setInput("");
    setUserTurns(0);
    setLastClaim("");
    setPrevClaim("");
    setUsedKeys(new Set());
    setTrace([]);
  };

  if (!topic) {
    return (
      <div style={{ background: "#16282B", padding: "28px", minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p style={{ color: "#D9920B", fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", marginBottom: 10 }}>CHOOSE A TOPIC TO EXPLORE</p>
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 13, marginBottom: 22, lineHeight: 1.65, maxWidth: 420 }}>
          The system reads what you write and adapts its questions to your specific reasoning. It won't give you answers. It'll reflect your thinking back at you until you find them yourself.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {starterTopics.map(t => (
            <button
              key={t.value}
              onClick={() => selectTopic(t.value)}
              data-testid={`socratic-topic-${t.value.replace(/\s+/g, '-')}`}
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "12px 16px", color: "white", fontSize: 13, textAlign: "left", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
            >
              {t.label} &rarr;
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentStage = getStage(userTurns);

  return (
    <div style={{ background: "#16282B", display: "flex", minHeight: 320 }}>
      {/* Chat column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 10px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 280 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: m.role === "user" ? "#2E6E64" : "rgba(255,255,255,0.10)",
                color: m.role === "user" ? "white" : "rgba(255,255,255,0.92)",
                fontSize: 13,
                lineHeight: 1.6,
              }}>
                {m.role === "ai" && (
                  <span style={{ color: "#D9920B", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 4, letterSpacing: "0.08em" }}>SYNOPS</span>
                )}
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: "flex" }}>
              <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "rgba(255,255,255,0.10)" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#D9920B", animation: "typingDot 1s infinite", animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Share your thinking..."
            data-testid="socratic-chat-input"
            style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: 13, outline: "none" }}
          />
          <button onClick={send} data-testid="socratic-chat-send"
            style={{ background: "#D9920B", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}>
            <Send size={14} />
          </button>
          <button onClick={reset} data-testid="socratic-chat-reset"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
            Reset
          </button>
        </div>
      </div>

      {/* Reasoning trace panel */}
      <div style={{ width: 160, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.08)", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: "#D9920B", letterSpacing: "0.12em", marginBottom: 2 }}>REASONING TRACE</p>

        {/* Stage progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {(["opening","probing","challenging","synthesizing"] as Stage[]).map(s => {
            const stageOrder = { opening: 0, probing: 1, challenging: 2, synthesizing: 3 };
            const past = stageOrder[currentStage] > stageOrder[s];
            const active = s === currentStage && userTurns > 0;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: active ? "#D9920B" : past ? "#2E6E64" : "rgba(255,255,255,0.15)" }} />
                <span style={{ fontSize: 10, color: active ? "#D9920B" : past ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", fontWeight: active ? 600 : 400 }}>
                  {stageLabels[s]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live trace */}
        {trace.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {trace.map((step, i) => (
              <div key={i}>
                <p style={{ fontSize: 9, fontWeight: 600, color: step.color, letterSpacing: "0.08em", marginBottom: 2 }}>{step.label.toUpperCase()}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.4, wordBreak: "break-word" }}>{step.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Hint */}
        {userTurns === 0 && (
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginTop: 4 }}>
            The system will extract your claim and adapt each question to your exact wording.
          </p>
        )}
      </div>
      <style>{`
        @keyframes typingDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
