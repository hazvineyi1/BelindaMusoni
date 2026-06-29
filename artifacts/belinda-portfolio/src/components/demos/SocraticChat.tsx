import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";

type Message = { role: "user" | "ai"; text: string };

type Reflection = {
  summary: string;
  strengths: string[];
  growthAreas: string[];
  suggestions: string[];
  encouragement: string;
};

const TOTAL_QUESTIONS = 5;

const greeting = (name: string) =>
  `Take a seat, ${name}. I'm Dr. Reyes. I've read your file, and I'm not here to judge what's in it. I've spent twenty years between the prison system, law enforcement, and getting people hired after release. Today is a practice run, a chance to think out loud before the conversation that counts.\n\nYou're three weeks out, and there's a warehouse job like the one we'll talk through. So let's not waste it.\n\nFirst question, and I want it straight: in your own words, why were you locked up?`;

export default function SocraticChat() {
  const [phase, setPhase] = useState<"name" | "chat" | "result">("name");
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [concluded, setConcluded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reflection, setReflection] = useState<Reflection | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const begin = () => {
    const n = nameInput.trim();
    if (!n) return;
    const clean = n.split(/\s+/)[0].replace(/[^a-zA-Z'-]/g, "") || "there";
    const display = clean.charAt(0).toUpperCase() + clean.slice(1);
    runIdRef.current += 1;
    setName(display);
    setPhase("chat");
    setMessages([{ role: "ai", text: greeting(display) }]);
    setAnswered(0);
    setConcluded(false);
    setError(null);
    setReflection(null);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy || concluded) return;
    const runId = runIdRef.current;
    const history = messages;
    const qn = answered + 1;

    setInput("");
    setError(null);
    setMessages(m => [...m, { role: "user", text }]);
    setBusy(true);

    try {
      const res = await fetch(`${API_BASE}/api/socratic/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, questionNumber: qn, history, userMessage: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (runId !== runIdRef.current) return;
      setMessages(m => [...m, { role: "ai", text: data.reply }]);
      setAnswered(qn);
      if (qn >= TOTAL_QUESTIONS) setConcluded(true);
    } catch {
      if (runId !== runIdRef.current) return;
      setError("Dr. Reyes lost her train of thought. Try sending that again.");
    } finally {
      if (runId === runIdRef.current) setBusy(false);
    }
  };

  const getReflection = async () => {
    if (busy) return;
    const runId = runIdRef.current;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/socratic/determination`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, history: messages }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Reflection;
      if (runId !== runIdRef.current) return;
      setReflection(data);
      setPhase("result");
    } catch {
      if (runId !== runIdRef.current) return;
      setError("Could not pull the reflection together. Try again.");
    } finally {
      if (runId === runIdRef.current) setBusy(false);
    }
  };

  const reset = () => {
    runIdRef.current += 1;
    setPhase("name");
    setName("");
    setNameInput("");
    setMessages([]);
    setInput("");
    setBusy(false);
    setAnswered(0);
    setConcluded(false);
    setError(null);
    setReflection(null);
  };

  // Name entry screen
  if (phase === "name") {
    return (
      <div style={{ background: "#16282B", padding: "32px 26px", minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p style={{ color: "#D9920B", fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", marginBottom: 12 }}>WORK RELEASE ASSESSMENT</p>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "white", marginBottom: 12, lineHeight: 1.25 }}>
          Your reentry interview is about to begin.
        </h3>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5, marginBottom: 22, lineHeight: 1.7, maxWidth: 460 }}>
          This is a practice interview to help you prepare. Across the table is Dr. Reyes, a coach who has spent two decades between corrections, law enforcement, and reentry hiring. She responds to what you actually say and never hands you the answer. At the end you can pull up a supportive reflection with suggestions you can act on. It is a tool to help you grow, not a decision about you, and it never replaces a real coach.
        </p>
        <label style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 8, display: "block" }}>ENTER YOUR NAME TO BEGIN</label>
        <div style={{ display: "flex", gap: 8, maxWidth: 420 }}>
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && begin()}
            placeholder="Your name"
            data-testid="socratic-name-input"
            style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, padding: "11px 14px", color: "white", fontSize: 14, outline: "none" }}
          />
          <button
            onClick={begin}
            data-testid="socratic-begin"
            style={{ background: "#D9920B", border: "none", borderRadius: 8, padding: "11px 22px", cursor: "pointer", color: "white", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Begin
          </button>
        </div>
      </div>
    );
  }

  // Reflection + transcript screen
  if (phase === "result" && reflection) {
    const r = reflection;
    return (
      <div style={{ background: "#16282B", padding: "22px 20px", minHeight: 360 }} data-testid="socratic-reflection-view">
        <p style={{ color: "#D9920B", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", marginBottom: 10 }}>REFLECTION &amp; SUGGESTIONS</p>

        <div style={{ background: "rgba(46,110,100,0.16)", border: "1px solid rgba(46,110,100,0.4)", borderRadius: 10, padding: "10px 13px", marginBottom: 16 }}>
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
            A tool to help you grow, not a verdict. This reflection is here to support your own preparation. It is not a decision about you and does not replace a real coach.
          </p>
        </div>

        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "white", lineHeight: 1.4, marginBottom: 18 }}>
          {r.summary}
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          <DetSection title="What you showed" items={r.strengths} dot="#2E6E64" />
          <DetSection title="Areas to keep working on" items={r.growthAreas} dot="#D9920B" />
          <DetSection title="Suggestions to help you" items={r.suggestions} dot="#D9920B" />
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", marginBottom: 6 }}>A NOTE FROM DR. REYES</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.65 }}>{r.encouragement}</p>
        </div>

        <details style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <summary style={{ fontSize: 11, fontWeight: 600, color: "#D9920B", letterSpacing: "0.06em", cursor: "pointer" }}>VIEW FULL TRANSCRIPT</summary>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: m.role === "ai" ? "#D9920B" : "rgba(255,255,255,0.5)" }}>
                  {m.role === "ai" ? "DR. REYES" : name.toUpperCase()}
                </span>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, whiteSpace: "pre-wrap", marginTop: 2 }}>{m.text}</p>
              </div>
            ))}
          </div>
        </details>

        <button onClick={reset} data-testid="socratic-chat-reset"
          style={{ marginTop: 18, background: "#D9920B", border: "none", borderRadius: 8, padding: "9px 20px", cursor: "pointer", color: "white", fontSize: 13, fontWeight: 600 }}>
          Start a new interview
        </button>
      </div>
    );
  }

  // Chat screen
  return (
    <div style={{ background: "#16282B", display: "flex", flexDirection: "column", minHeight: 360 }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#2E6E64", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Fraunces', serif", fontWeight: 700, color: "white", fontSize: 14 }}>
          DR
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, color: "white", fontWeight: 600, lineHeight: 1.2 }}>Dr. Reyes</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.2 }}>Reentry &amp; Work Release Coach</p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: concluded ? "#2E6E64" : "#D9920B", background: concluded ? "rgba(46,110,100,0.18)" : "rgba(217,146,11,0.14)", border: `1px solid ${concluded ? "rgba(46,110,100,0.4)" : "rgba(217,146,11,0.3)"}`, borderRadius: 20, padding: "2px 9px", flexShrink: 0, whiteSpace: "nowrap" }}>
          {concluded ? "Interview complete" : `Question ${Math.min(answered + 1, TOTAL_QUESTIONS)} of ${TOTAL_QUESTIONS}`}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "18px 16px 12px", display: "flex", flexDirection: "column", gap: 11, maxHeight: 300 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "84%",
              padding: "10px 14px",
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role === "user" ? "#2E6E64" : "rgba(255,255,255,0.10)",
              color: m.role === "user" ? "white" : "rgba(255,255,255,0.92)",
              fontSize: 13,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}>
              {m.role === "ai" && (
                <span style={{ color: "#D9920B", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 4, letterSpacing: "0.08em" }}>DR. REYES</span>
              )}
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
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
        {error && (
          <p style={{ fontSize: 11.5, color: "#E8A87C", textAlign: "center", padding: "2px 8px" }}>{error}</p>
        )}
      </div>

      {/* Input / conclusion bar */}
      {concluded ? (
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
          <button onClick={getReflection} disabled={busy} data-testid="socratic-determination"
            style={{ flex: 1, background: "#D9920B", border: "none", borderRadius: 8, padding: "11px 14px", cursor: busy ? "default" : "pointer", color: "white", fontSize: 13, fontWeight: 600, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Putting together your reflection..." : "View reflection & suggestions"}
          </button>
          <button onClick={reset} data-testid="socratic-chat-reset"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "11px 12px", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            Restart
          </button>
        </div>
      ) : (
        <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Answer honestly..."
            disabled={busy}
            data-testid="socratic-chat-input"
            style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 12px", color: "white", fontSize: 13, outline: "none" }}
          />
          <button onClick={send} disabled={busy} data-testid="socratic-chat-send"
            style={{ background: "#D9920B", border: "none", borderRadius: 8, padding: "9px 13px", cursor: busy ? "default" : "pointer", color: "white", display: "flex", alignItems: "center", opacity: busy ? 0.6 : 1 }}>
            <Send size={14} />
          </button>
          <button onClick={reset} data-testid="socratic-chat-reset"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 10px", cursor: "pointer", color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
            Restart
          </button>
        </div>
      )}
      <style>{`
        @keyframes typingDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function DetSection({ title, items, dot }: { title: string; items: string[]; dot: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", marginBottom: 6 }}>{title.toUpperCase()}</p>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
        {items.map((it, i) => (
          <li key={i} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, marginTop: 6, flexShrink: 0 }} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
