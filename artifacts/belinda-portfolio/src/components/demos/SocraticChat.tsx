import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

type Message = { role: "user" | "ai"; text: string };

type Branch = { keywords: string[]; reply: (name: string) => string };
type Stage = { branches: Branch[]; fallback: (name: string) => string };

const greeting = (name: string) =>
  `Take a seat, ${name}. I'm Dr. Reyes. Before you ask, yes, I've read your file, and no, I'm not here to judge what's in it. I've spent twenty years working between the prison system, law enforcement, and getting people hired after release. My only job today is to find out one thing: whether you're ready.\n\nYou're three weeks out. There's a warehouse job with your name on it if this conversation goes the way it needs to. So let's not waste it.\n\nFirst question, and I want it straight: in your own words, why were you locked up?`;

const stages: Stage[] = [
  // Stage 1: reacts to "why were you locked up", poses the trust question
  {
    branches: [
      {
        keywords: ["my fault", "my mistake", "i made", "i did", "i chose", "i hurt", "i was wrong", "messed up", "my own", "responsible", "i screwed", "own it", "i broke", "i stole", "blame myself", "on me"],
        reply: (n) => `You said "I." You'd be surprised how many people in that chair tell me about everyone except themselves. Hold onto that word, ${n}. It's the most important one you'll use today.\n\nNow picture the warehouse manager. He's taking a risk hiring you over ten people with clean records. Look at me and tell me: why should he trust you?`,
      },
      {
        keywords: ["wasn't me", "set up", "system", "unfair", "not my fault", "framed", "wrong place", "bad luck", "snitched", "everyone else", "they made", "had no choice", "forced"],
        reply: (n) => `Stop right there. I've heard that story a hundred times, and maybe some of it is even true. But the world outside that door does not care whose fault it was, ${n}. It only cares what you do next. Sit with that, because it's the whole game now.\n\nSo here's the real test. Picture the warehouse manager taking a risk on you over ten people with clean records. Why should he trust you?`,
      },
    ],
    fallback: (n) => `However you got there, you're sitting here now, and that's what we work with. ${n}, let me get to what actually matters.\n\nPicture the warehouse manager. He's taking a risk hiring you over ten people with clean records. Why should he trust you?`,
  },
  // Stage 2: reacts to trust answer, poses the temptation question
  {
    branches: [
      {
        keywords: ["work hard", "on time", "show up", "reliable", "prove", "hard work", "loyal", "dedicated", "every day", "won't let", "earn", "best", "committed", "do the work", "first one", "stay late"],
        reply: (n) => `Good. "Show up, work hard" is a real start, even if it's what everyone says in this room. The difference is the ones who make it actually do it.\n\nBut here's where most people fall, ${n}. Six weeks in, money's tight, and someone from the old life shows up offering easy cash for one small favor. Nobody would ever know. What do you do? And don't tell me what you think I want to hear.`,
      },
      {
        keywords: ["don't know", "not sure", "maybe", "i guess", "deserve", "chance", "give me", "second chance", "trust me", "just need", "please", "no idea"],
        reply: (n) => `Don't give me "I deserve a chance." Nobody owes you one, ${n}. You earn it, every single day, and the day you forget that is the day you slip.\n\nSpeaking of slipping, here's where most people fall. Six weeks in, money's tight, and an old friend offers easy cash for one small favor. No one would know. What do you do?`,
      },
    ],
    fallback: (n) => `Hold onto whatever's behind that answer, ${n}. You'll need it. Because here's where most people fall.\n\nSix weeks in, money's tight, and someone from the old life shows up offering easy cash for one small favor. No one would ever know. What do you do?`,
  },
  // Stage 3: reacts to temptation answer, poses the dignity/setback question
  {
    branches: [
      {
        keywords: ["no", "walk away", "say no", "call", "family", "not worth", "won't", "refuse", "leave", "hang up", "never", "ignore", "turn", "decline", "block"],
        reply: (n) => `I believe you mean that, sitting here in the daylight. But temptation doesn't show up when you're strong, ${n}. It shows up at 2am when you're desperate and alone. Willpower alone won't hold.\n\nSo let's test the other thing that breaks people. You do everything right, and then a coworker finds out where you've been and treats you like garbage in front of the whole team. The old you wants to handle it the old way. What does the new ${n} do?`,
      },
      {
        keywords: ["maybe", "depends", "tempting", "hard", "might", "i'd think", "not sure", "tough", "probably", "i'd consider", "struggle"],
        reply: (n) => `At least you're honest, and that honesty might be the very thing that saves you. But "maybe" is what sends people back, ${n}. Temptation doesn't negotiate. You need your answer locked in now, before the moment comes, not in the middle of it.\n\nHere's another thing that breaks people. A coworker finds out where you've been and treats you like garbage in front of the team. The old you wants to handle it the old way. What does the new ${n} do?`,
      },
    ],
    fallback: (n) => `Remember that answer when it stops being a hypothetical, ${n}. Now let's test something else.\n\nA coworker finds out where you've been and treats you like garbage in front of the whole team. The old you wants to handle it the old way. What does the new ${n} do?`,
  },
  // Stage 4: reacts to setback answer, poses the stakes question
  {
    branches: [
      {
        keywords: ["walk", "ignore", "calm", "breathe", "talk", "report", "control", "let it go", "cool", "step away", "boss", "supervisor", "nothing", "keep working", "shrug", "rise above"],
        reply: (n) => `Good. That half-second pause between feeling something and doing something? That's the whole game. That's the thing they couldn't teach you inside, but it's exactly what keeps you out here.\n\nLast hard question, ${n}. If this all falls apart and you go back, who out here loses besides you? Say their name.`,
      },
      {
        keywords: ["fight", "confront", "hit", "lose it", "snap", "handle it", "beat", "show him", "knock", "swing", "deck", "square up", "old way", "violence"],
        reply: (n) => `I hear you. Pride is the one thing they can't take from you in there, so you learn to hold it like a weapon. But out here, ${n}, one fight costs you the job, maybe your freedom. Ask yourself honestly: is your pride worth your freedom? Sit in that discomfort, because that's the choice, every single time.\n\nLast hard question. If this all falls apart and you go back, who out here loses besides you? Say their name.`,
      },
    ],
    fallback: (n) => `That moment will come, and how you handle it is everything, ${n}. Burn that into memory.\n\nLast hard question. If this all falls apart and you go back, who out here loses besides you? Say their name.`,
  },
  // Stage 5: reacts to stakes answer, closes the interview
  {
    branches: [
      {
        keywords: ["no one", "nobody", "myself", "just me", "alone", "none", "no body", "only me"],
        reply: (n) => `If you truly believe no one out here is in your corner, then this matters more than I thought, ${n}, because you'll have to become the person YOU refuse to let down. That's the harder road. But it's yours, and nobody can take it from you.\n\nI've sat across from a lot of people. Some I knew would make it, some I knew wouldn't. You? You're right on the line, which is honestly where most of the ones who make it start. I'm signing off on the warehouse job. Don't make me regret it. Go to work.`,
      },
      {
        keywords: ["mom", "mother", "dad", "father", "son", "daughter", "kid", "kids", "wife", "husband", "family", "brother", "sister", "grandma", "grandmother", "child", "children", "girlfriend", "boyfriend", "partner", "my", "kid's", "loved ones", "everyone"],
        reply: (n) => `Then every morning you don't want to get up, you get up for them. Not for me, not for the parole board. For them. Write that name somewhere you'll see it every single day.\n\n${n}, I've sat across from a lot of people. Some I knew would make it, some I knew wouldn't. You? You're right on the line, which is honestly where most of the ones who make it start. I'm signing off on the warehouse job. Don't make me regret it. Go to work.`,
      },
    ],
    fallback: (n) => `Hold onto that, ${n}. It's your reason, and you're going to need a reason on the hard days.\n\nI've sat across from a lot of people. You're right on the line, which is where most of the ones who make it start. I'm signing off on the warehouse job. Don't make me regret it. Go to work.`,
  },
];

const reflections = [
  "The interview's over. But that voice asking you the hard questions? That's the one you carry out the door with you.",
  "Go on. You've got a shift to make. Everything you needed, you already said in this room.",
  "We're done here. Prove me right.",
];

function pickBranch(stage: Stage, text: string, name: string): string {
  // Normalize to space-delimited words so keywords match on word boundaries,
  // e.g. "no" won't match inside "know" and "me" won't match inside "someone".
  const t = " " + text.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  let best: Branch | null = null;
  let bestScore = 0;
  for (const b of stage.branches) {
    let score = 0;
    for (const kw of b.keywords) {
      if (t.includes(" " + kw + " ")) score += kw.includes(" ") || kw.length > 4 ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = b;
    }
  }
  return best && bestScore > 0 ? best.reply(name) : stage.fallback(name);
}

export default function SocraticChat() {
  const [phase, setPhase] = useState<"name" | "chat">("name");
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [reflectIdx, setReflectIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const begin = () => {
    const n = nameInput.trim();
    if (!n) return;
    const clean = n.split(/\s+/)[0].replace(/[^a-zA-Z'-]/g, "") || "there";
    const display = clean.charAt(0).toUpperCase() + clean.slice(1);
    setName(display);
    setPhase("chat");
    setMessages([{ role: "ai", text: greeting(display) }]);
  };

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text }]);

    let reply: string;
    if (stageIdx < stages.length) {
      reply = pickBranch(stages[stageIdx], text, name);
    } else {
      reply = reflections[reflectIdx % reflections.length];
      setReflectIdx(i => i + 1);
    }
    setStageIdx(i => i + 1);

    setTyping(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setMessages(m => [...m, { role: "ai", text: reply }]);
      setTyping(false);
      timerRef.current = null;
    }, 800 + Math.random() * 700);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPhase("name");
    setName("");
    setNameInput("");
    setMessages([]);
    setInput("");
    setTyping(false);
    setStageIdx(0);
    setReflectIdx(0);
  };

  const concluded = stageIdx >= stages.length;

  if (phase === "name") {
    return (
      <div style={{ background: "#16282B", padding: "32px 26px", minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p style={{ color: "#D9920B", fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", marginBottom: 12 }}>WORK RELEASE ASSESSMENT</p>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "white", marginBottom: 12, lineHeight: 1.25 }}>
          Your reentry interview is about to begin.
        </h3>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5, marginBottom: 22, lineHeight: 1.7, maxWidth: 460 }}>
          You've been granted work release after time served. Across the table is Dr. Reyes, a coach who has spent two decades between corrections, law enforcement, and reentry hiring. This conversation decides whether you're cleared for the job. Expect it to be tough. It is meant to be.
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
          {concluded ? "Cleared" : `Question ${Math.min(stageIdx + 1, stages.length)} of ${stages.length}`}
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
      </div>

      {/* Input */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={concluded ? "The interview is over..." : "Answer honestly..."}
          data-testid="socratic-chat-input"
          style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 12px", color: "white", fontSize: 13, outline: "none" }}
        />
        <button onClick={send} data-testid="socratic-chat-send"
          style={{ background: "#D9920B", border: "none", borderRadius: 8, padding: "9px 13px", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}>
          <Send size={14} />
        </button>
        <button onClick={reset} data-testid="socratic-chat-reset"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 10px", cursor: "pointer", color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
          Restart
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
