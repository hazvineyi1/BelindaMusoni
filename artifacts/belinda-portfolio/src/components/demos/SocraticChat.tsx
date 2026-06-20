import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

type Message = { role: "user" | "ai"; text: string };

type Stance = {
  keywords: string[];
  pill: string;
  probes: string[];
};

type Topic = {
  id: string;
  label: string;
  question: string;
  opener: string;
  order: string[];
  stances: Record<string, Stance>;
  clarify: string;
  closing: string;
  reflect: string[];
};

const topics: Topic[] = [
  {
    id: "grades",
    label: "Should grades be abolished?",
    question: "Should schools abolish grades entirely?",
    opener: "Real debate in education right now: should we abolish grades entirely? No A's, no F's, no GPA, just feedback. What's your gut take, and why?",
    order: ["mixed", "abolish", "keep"],
    stances: {
      abolish: {
        pill: "Leaning: abolish grades",
        keywords: ["abolish", "get rid", "remove", "scrap", "yes", "agree", "should go", "no grades", "harmful", "stressful", "stress", "pressure", "anxiety", "hate", "useless", "arbitrary", "toxic", "remove them"],
        probes: [
          "Alright. Without grades, how does a student tell the difference between actually understanding something and just feeling like they do? That feeling is famously unreliable.",
          "Picture a hospital hiring nurses. No grades, no class rank, nothing to compare. How should it decide who is safe to trust with patients? Walk me through it.",
          "Here is the catch: plenty of students only do the hard work because of the grade. Remove it and they coast. Are you okay with that trade, or is there a way to keep the effort without the letter?",
          "You have argued the case well. If you could keep just ONE job that grades currently do, which would you keep, and what replaces everything else?",
          "Last one: you are the person who has to sell this to anxious parents. What is the single sentence that convinces them their kid will not fall behind?",
        ],
      },
      keep: {
        pill: "Leaning: keep grades",
        keywords: ["keep", "need", "necessary", "important", "useful", "no", "disagree", "motivate", "fair", "standard", "measure", "required", "helpful", "structure", "accountability", "essential", "have to"],
        probes: [
          "Fair. But here is a wrinkle: two kids both get a B. One understood it all and got lazy. The other fought for every point and barely passed. The grade calls them equal. So what is a grade actually measuring?",
          "Research keeps finding that grades nudge students toward the easy A instead of the hard class where they would learn more. If grades quietly steer kids away from real challenge, are they still doing their job?",
          "Think of a curious kid who asks brilliant questions but freezes on tests. The system stamps them average. What does that label do to how they see themselves as a learner?",
          "You want to keep grades. Name the single biggest flaw in them, the one you would fix tomorrow if you could. Why do you think no one has?",
          "Final push: if grades are really about motivation, what happens to the kid who has given up on ever getting an A? What is motivating them now?",
        ],
      },
      mixed: {
        pill: "Leaning: it depends",
        keywords: ["depends", "both", "mixed", "some", "partly", "complicated", "not sure", "maybe", "kind of", "in between", "balance"],
        probes: [
          "You are holding both sides, good. So get specific: are there subjects where grades make sense and others where they do not? Give me the dividing line you would draw.",
          "Say you keep grades for some things. The moment you grade ONE class, students optimize for the grade there and neglect the ungraded ones. Does a partial system just move the problem? How do you stop that?",
          "Imagine you are handed the keys to redesign report cards from scratch. What is the first thing you put on them, and the first thing you delete?",
          "You are designing the compromise. Who is going to be unhappy with it, and are you okay with that?",
        ],
      },
    },
    clarify: "Before I push back, which way do you actually lean? Should grades mostly stay, or mostly go?",
    closing: "We have gone deep. Notice I never told you the answer, that was the point. So where do you land now, and is it different from where you started?",
    reflect: [
      "Has your position actually shifted, or just gotten more nuanced?",
      "What would you need to see to believe the opposite?",
      "If you taught this to someone, what is the one question you would leave them with?",
    ],
  },
  {
    id: "ai-essays",
    label: "Should students use AI to write essays?",
    question: "Should students be allowed to use AI to write essays?",
    opener: "Here is a live one for any classroom today: should students be allowed to use AI like ChatGPT to write their essays? Where do you land, and why?",
    order: ["mixed", "allow", "ban"],
    stances: {
      allow: {
        pill: "Leaning: allow it",
        keywords: ["allow", "yes", "should", "fine", "okay", "ok", "agree", "let them", "tool", "calculator", "embrace", "future", "why not", "helpful", "of course", "use it"],
        probes: [
          "Okay. Writing is often how people figure out what they actually think. If AI does the writing, what happens to the thinking that used to happen along the way?",
          "We once said the same about calculators, just a tool. But we still make kids learn arithmetic first. So should there be a learn-it-yourself-first stage before AI is allowed? Where is the line?",
          "A teacher gets two flawless essays. One student wrote it, one prompted it. The teacher cannot tell. What is the grade even rewarding at that point?",
          "You would allow it. Design the rule: what is the one thing a student must still do themselves, no matter what, for it to count as their work?",
          "Last one: in ten years your AI-assisted student needs to write something with no AI, a heartfelt apology, a closing argument. Did we prepare them, or not?",
        ],
      },
      ban: {
        pill: "Leaning: ban it",
        keywords: ["ban", "no", "shouldn't", "should not", "not allow", "cheating", "cheat", "against", "disagree", "lazy", "prohibit", "forbid", "dishonest", "never", "wrong"],
        probes: [
          "I get the instinct. But these students will enter workplaces where NOT using AI is like refusing to use email. Are we preparing them for the world they will live in, or the one we grew up in?",
          "Banning it assumes you can detect it. You mostly cannot, detectors are wrong all the time and falsely accuse real writers. If the ban is unenforceable, what is it actually achieving?",
          "Flip it: what if AI lets a dyslexic kid finally get their brilliant ideas onto the page? Does the ban protect learning, or just protect the old way of proving it?",
          "You would ban it. So redesign the assignment instead: what kind of essay question would make AI useless and force real thinking? Can you even write one?",
          "Final: if the goal is original thinking, is the essay still the right tool to measure it, or are we defending the test instead of the skill?",
        ],
      },
      mixed: {
        pill: "Leaning: it depends",
        keywords: ["depends", "both", "some", "partly", "brainstorm", "draft", "certain", "mixed", "maybe", "kind of", "research only", "ideas"],
        probes: [
          "Sensible. So draw the line precisely: AI for brainstorming yes, final draft no? The second you allow it for ideas, how does anyone prove where the ideas stopped and the writing started?",
          "Say it is allowed for research but not writing. A student pastes AI text and lightly rewords it. Did they break your rule? How would you even know?",
          "You are the teacher now. Write the one-sentence AI policy you would put on your syllabus. Read it back, can a clever 16-year-old find the loophole?",
          "Who does your compromise fail, the honest kid or the strategic one?",
        ],
      },
    },
    clarify: "Quick check so I can push properly: mostly allow it, or mostly ban it?",
    closing: "We have circled this from a few angles, and I never handed you a verdict, on purpose. So what is your actual policy now, and could a clever student beat it?",
    reflect: [
      "Where exactly is your line between help and cheating now?",
      "What would change your mind on this?",
      "If you wrote the school policy, what is the first sentence?",
    ],
  },
  {
    id: "struggle",
    label: "Is struggle necessary for learning?",
    question: "Is struggle necessary for real learning?",
    opener: "Big one in learning science: do people actually need to struggle to learn, or is struggle just inefficient suffering we should design away? What is your instinct?",
    order: ["mixed", "needed", "optional"],
    stances: {
      needed: {
        pill: "Leaning: struggle is necessary",
        keywords: ["yes", "necessary", "need", "struggle", "important", "grow", "growth", "builds", "character", "resilience", "agree", "essential", "productive", "no pain", "have to", "must"],
        probes: [
          "Okay, but be careful: a kid drowning in a problem they have zero tools for is not learning, they are just failing. So what separates struggle that teaches from struggle that just breaks someone?",
          "If struggle is so valuable, should a teacher ever just give the answer? Or is every hint a little theft of learning? Where is your line?",
          "Two students. One struggles for an hour and gets it. One is shown it clearly and gets it in five minutes. A week later they remember it equally. Did the first student's extra 55 minutes buy anything?",
          "You believe struggle matters. Design it: how would you build a lesson hard enough to stick but not so hard a kid quits? What is the dial you are turning?",
        ],
      },
      optional: {
        pill: "Leaning: design struggle away",
        keywords: ["no", "unnecessary", "avoid", "design away", "suffering", "inefficient", "bad", "frustrating", "disagree", "smooth", "easy", "shouldn't", "should not", "remove", "pointless"],
        probes: [
          "Tempting, but think about the last thing you truly mastered. Did it come from something easy, or something you had to wrestle with? What does that tell you?",
          "If we smooth away all the difficulty, students breeze through and feel great. Then the test comes and nothing stuck. Why do feeling easy and actually learning come apart so often?",
          "There is a finding called desirable difficulties: making learning slightly harder improves long-term memory. If that is true, is a frictionless lesson quietly doing students a disservice?",
          "You would design struggle out. So where is the floor, is there ANY difficulty worth keeping? If yes, you have just admitted some struggle helps. Which kind?",
        ],
      },
      mixed: {
        pill: "Leaning: the right dose",
        keywords: ["depends", "both", "some", "right amount", "balance", "sweet spot", "kind of", "maybe", "certain", "dose", "moderate"],
        probes: [
          "Right, it is probably about the dose. So get concrete: how would a teacher actually KNOW when a student has hit productive struggle versus when they have tipped into just being stuck?",
          "Say you aim for the sweet spot. Every kid's sweet spot is different, what is brutal for one is boring for another. In a class of 30, how do you possibly hit all of them at once?",
          "You are designing the lesson. What is the signal you would watch for to know it is time to step in with a hint, and the signal to hold back?",
          "If you step in too early you steal the learning, too late and you lose the kid. Which mistake would you rather make, and why?",
        ],
      },
    },
    clarify: "So I can push the right way: do you think struggle is mostly necessary, or mostly something to design away?",
    closing: "We have pulled this apart without me ever settling it for you, that was deliberate. So what do you actually believe now about struggle and learning?",
    reflect: [
      "How would you spot the line between productive struggle and just being stuck?",
      "What would convince you of the opposite?",
      "If you designed one lesson tomorrow, how hard would you make it?",
    ],
  },
];

const concessionSignals = ["good point", "fair point", "fair enough", "true", "you're right", "youre right", "i see", "hadn't", "hadnt", "didn't think", "didnt think", "makes sense", "i guess", "huh", "interesting", "never thought", "that's fair", "thats fair", "ok yeah", "okay yeah", "valid", "hmm", "good question"];

const concessionAcks = [
  "Right, so notice you are moving.",
  "Good. That hesitation is the thinking.",
  "See, now you are actually wrestling with it.",
  "That crack in the certainty is exactly the point. Keep going.",
];

function detectStance(topic: Topic, text: string): string | null {
  const t = " " + text.toLowerCase() + " ";
  let best: string | null = null;
  let bestScore = 0;
  for (const key of topic.order) {
    let score = 0;
    for (const kw of topic.stances[key].keywords) {
      if (t.includes(kw)) score += kw.length > 4 ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return bestScore > 0 ? best : null;
}

function isConcession(text: string): boolean {
  const t = text.toLowerCase();
  return concessionSignals.some(s => t.includes(s));
}

export default function SocraticChat() {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [stance, setStance] = useState<string | null>(null);
  const [probeIdx, setProbeIdx] = useState(0);
  const [reflectIdx, setReflectIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const selectTopic = (t: Topic) => {
    setTopic(t);
    setMessages([{ role: "ai", text: t.opener }]);
    setStance(null);
    setProbeIdx(0);
    setReflectIdx(0);
  };

  const respond = (userText: string) => {
    if (!topic) return;
    let resolvedStance = stance;

    if (!resolvedStance) {
      const detected = detectStance(topic, userText);
      if (!detected) {
        return topic.clarify;
      }
      resolvedStance = detected;
      setStance(detected);
    }

    const probes = topic.stances[resolvedStance].probes;

    if (probeIdx >= probes.length) {
      const reflect = topic.reflect[reflectIdx % topic.reflect.length];
      setReflectIdx(i => i + 1);
      return reflect;
    }

    const probe = probes[probeIdx];
    setProbeIdx(i => i + 1);
    const ack = (probeIdx > 0 && isConcession(userText))
      ? concessionAcks[probeIdx % concessionAcks.length] + " "
      : "";

    const isLast = probeIdx === probes.length - 1;
    return ack + probe + (isLast ? "\n\n" + topic.closing : "");
  };

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text }]);
    const reply = respond(text);
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: "ai", text: reply }]);
      setTyping(false);
    }, 750 + Math.random() * 650);
  };

  const reset = () => {
    setTopic(null);
    setMessages([]);
    setInput("");
    setStance(null);
    setProbeIdx(0);
    setReflectIdx(0);
  };

  if (!topic) {
    return (
      <div style={{ background: "#16282B", padding: "26px 24px", minHeight: 300 }}>
        <p style={{ color: "#D9920B", fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", marginBottom: 10 }}>PICK A DILEMMA TO THINK THROUGH</p>
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 13, marginBottom: 20, lineHeight: 1.65, maxWidth: 440 }}>
          Each of these has no clean answer. Take a side, and the system will push back with the strongest case against you, one scenario at a time. It never tells you what to think. It just keeps asking.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {topics.map(t => (
            <button
              key={t.id}
              onClick={() => selectTopic(t)}
              data-testid={`socratic-topic-${t.id}`}
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "13px 16px", color: "white", fontSize: 14, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
            >
              <span>{t.label}</span>
              <span style={{ color: "#D9920B", flexShrink: 0 }}>&rarr;</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#16282B", display: "flex", flexDirection: "column", minHeight: 340 }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={reset} data-testid="socratic-chat-back"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 7, padding: "5px 10px", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 11, flexShrink: 0 }}>
          &larr; Topics
        </button>
        <p style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600, lineHeight: 1.3, minWidth: 0 }}>
          {topic.question}
        </p>
        {stance && (
          <span style={{ fontSize: 10, fontWeight: 600, color: "#D9920B", background: "rgba(217,146,11,0.14)", border: "1px solid rgba(217,146,11,0.3)", borderRadius: 20, padding: "2px 9px", flexShrink: 0, whiteSpace: "nowrap" }}>
            {topic.stances[stance].pill}
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "18px 16px 12px", display: "flex", flexDirection: "column", gap: 11, maxHeight: 300 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%",
              padding: "10px 14px",
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role === "user" ? "#2E6E64" : "rgba(255,255,255,0.10)",
              color: m.role === "user" ? "white" : "rgba(255,255,255,0.92)",
              fontSize: 13,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
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
      </div>

      {/* Input */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Make your case..."
          data-testid="socratic-chat-input"
          style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 12px", color: "white", fontSize: 13, outline: "none" }}
        />
        <button onClick={send} data-testid="socratic-chat-send"
          style={{ background: "#D9920B", border: "none", borderRadius: 8, padding: "9px 13px", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}>
          <Send size={14} />
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
