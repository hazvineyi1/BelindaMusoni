import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

type Message = { role: "user" | "ai"; text: string };

const starterTopics = [
  { label: "Critical Thinking", value: "critical thinking" },
  { label: "Data Literacy", value: "data literacy" },
  { label: "Ethical AI Use", value: "ethical AI use" },
];

const socraticResponses: Record<string, string[]> = {
  "critical thinking": [
    "Interesting. What makes you confident that source is trustworthy in this context?",
    "If someone who disagreed with you read the same evidence, what would they highlight?",
    "What would you need to see to change your mind on this?",
    "How do you distinguish between a strong argument and one that just feels compelling?",
    "If that assumption turned out to be false, how would your conclusion change?",
  ],
  "data literacy": [
    "What does that percentage actually represent, and who defined the denominator?",
    "If the same data were visualized differently, would it still support that claim?",
    "What's missing from this dataset that would matter for a real decision?",
    "Correlation shows up in the chart, but what would prove causation?",
    "Who collected this data, and what were they incentivized to find?",
  ],
  "ethical AI use": [
    "Who benefits from this AI system, and who bears the risk if it fails?",
    "If the model is wrong 5% of the time, which 5% would be most harmful?",
    "What would informed consent look like for the people whose data trained this?",
    "How would you explain this AI's decision to someone it affected negatively?",
    "What human judgment is this system replacing, and should it be?",
  ],
};

const fallbackResponses = [
  "That's a start. What's the assumption underneath that reasoning?",
  "Interesting framing. What would the person most affected by this say?",
  "You've described what you observe. What do you think is causing it?",
  "If you're right, what else would have to be true for that to hold?",
  "What evidence would change your view here?",
];

export default function SocraticChat() {
  const [topic, setTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [responseIdx, setResponseIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const selectTopic = (t: string) => {
    setTopic(t);
    setMessages([{
      role: "ai",
      text: `Let's explore ${t}. Start by telling me: what do you currently believe about it, and where does that belief come from?`,
    }]);
    setResponseIdx(0);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userMsg: Message = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);
    setTimeout(() => {
      const pool = topic ? socraticResponses[topic] ?? fallbackResponses : fallbackResponses;
      const response = pool[responseIdx % pool.length];
      setResponseIdx((i) => i + 1);
      setMessages((m) => [...m, { role: "ai", text: response }]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  const reset = () => { setTopic(null); setMessages([]); setInput(""); setResponseIdx(0); };

  if (!topic) {
    return (
      <div style={{ background: "#16282B", padding: "28px", minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p style={{ color: "#D9920B", fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", marginBottom: 12 }}>SELECT A TOPIC TO EXPLORE</p>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
          The system won't give you answers. It'll ask questions until you find them yourself.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {starterTopics.map((t) => (
            <button
              key={t.value}
              onClick={() => selectTopic(t.value)}
              data-testid={`socratic-topic-${t.value.replace(/\s+/g, '-')}`}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: "12px 16px",
                color: "white",
                fontSize: 14,
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
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

  return (
    <div style={{ background: "#16282B", display: "flex", flexDirection: "column", minHeight: 280 }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 12px", display: "flex", flexDirection: "column", gap: 12, maxHeight: 260 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%",
              padding: "10px 14px",
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role === "user" ? "#2E6E64" : "rgba(255,255,255,0.10)",
              color: m.role === "user" ? "white" : "rgba(255,255,255,0.92)",
              fontSize: 13,
              lineHeight: 1.55,
            }}>
              {m.role === "ai" && (
                <span style={{ color: "#D9920B", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 4 }}>SYNOPS</span>
              )}
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "rgba(255,255,255,0.10)" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#D9920B",
                    animation: "typingDot 1s infinite",
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Share your thinking..."
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "8px 12px",
            color: "white",
            fontSize: 13,
            outline: "none",
          }}
          data-testid="socratic-chat-input"
        />
        <button
          onClick={send}
          style={{ background: "#D9920B", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}
          data-testid="socratic-chat-send"
        >
          <Send size={14} />
        </button>
        <button
          onClick={reset}
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 11 }}
          data-testid="socratic-chat-reset"
        >
          Reset
        </button>
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
