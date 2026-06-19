import { useState, useRef } from "react";

type Module = { title: string; objectives: string[]; activities: string[]; assessment: string };
type Curriculum = { title: string; duration: string; audience: string; modules: Module[] };

const templates: Record<string, Curriculum> = {
  "AI literacy for educators": {
    title: "AI Literacy for Educators",
    duration: "6 weeks, 3 hrs/week",
    audience: "Higher education faculty with no prior AI background",
    modules: [
      {
        title: "Week 1: What AI Actually Is (and Isn't)",
        objectives: ["Distinguish AI from automation and magic", "Identify 3 real AI tools in common use"],
        activities: ["Tool audit of current workflow", "Myth-busting discussion board"],
        assessment: "Annotated tool map with AI/non-AI classification",
      },
      {
        title: "Week 2: How Language Models Work",
        objectives: ["Explain prompt-response mechanics at a conceptual level", "Recognize hallucination patterns"],
        activities: ["Prompt comparison lab", "Red-teaming exercise"],
        assessment: "Reflective analysis of 5 AI outputs with failure mode notes",
      },
      {
        title: "Week 3: AI in Course Design",
        objectives: ["Generate a draft lesson plan using AI", "Evaluate AI output for pedagogical soundness"],
        activities: ["Co-design session with Claude or ChatGPT", "Peer review of AI-assisted syllabi"],
        assessment: "AI-assisted module draft with commentary on design decisions",
      },
      {
        title: "Week 4: Assessment in the Age of AI",
        objectives: ["Redesign at least one assessment to be AI-resistant or AI-integrated", "Articulate an academic integrity position"],
        activities: ["Assessment audit workshop", "Policy drafting session"],
        assessment: "Revised assessment with integrity rationale",
      },
    ],
  },
  "onboarding for remote teams": {
    title: "Remote Team Onboarding Program",
    duration: "2 weeks, self-paced",
    audience: "New hires joining distributed teams",
    modules: [
      {
        title: "Day 1-2: Culture and Context",
        objectives: ["Describe the company's operating principles", "Identify communication norms and expectations"],
        activities: ["Async video from team leads", "Culture Q&A Slack thread"],
        assessment: "Team charter comprehension check",
      },
      {
        title: "Day 3-5: Tools and Systems",
        objectives: ["Navigate core platforms independently", "Complete first real task using standard workflow"],
        activities: ["Guided tool walkthroughs", "Shadowing async session via Loom"],
        assessment: "Scavenger hunt: complete 5 tasks using team tools",
      },
      {
        title: "Week 2: Role Integration",
        objectives: ["Contribute to one live workstream", "Establish a 30/60/90 day goal set"],
        activities: ["Paired working session", "Goal-setting 1:1 with manager"],
        assessment: "30/60/90 plan with manager sign-off",
      },
    ],
  },
  "data ethics for analysts": {
    title: "Data Ethics for Analytics Teams",
    duration: "4 weeks, 2 hrs/week",
    audience: "Data analysts and business intelligence teams",
    modules: [
      {
        title: "Week 1: What Makes Data Ethical?",
        objectives: ["Define fairness, privacy, and accountability in data contexts", "Identify ethical blind spots in familiar datasets"],
        activities: ["Bias detection lab using public datasets", "Case study: Cambridge Analytica"],
        assessment: "Annotated dataset audit with ethical flags",
      },
      {
        title: "Week 2: Consent, Privacy, and Regulation",
        objectives: ["Summarize GDPR and CCPA implications for analysts", "Apply data minimization principles to a real project"],
        activities: ["Regulation mapping workshop", "Privacy review of a live dashboard"],
        assessment: "Privacy impact assessment for a current workstream",
      },
      {
        title: "Week 3: Algorithmic Bias",
        objectives: ["Detect proxy variables that encode protected attributes", "Propose a bias audit methodology"],
        activities: ["Fairness metrics comparison lab", "Audit of a hiring algorithm case"],
        assessment: "Bias audit report on a provided model output",
      },
      {
        title: "Week 4: Building Ethical Guardrails",
        objectives: ["Design a lightweight ethical review process for team workflows", "Write an ethics checklist for a specific domain"],
        activities: ["Cross-functional design sprint", "Ethics review simulation"],
        assessment: "Ethics process document + team presentation",
      },
    ],
  },
};

const suggestions = Object.keys(templates);

export default function CurriculumBuilder() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(false);
  const [openModule, setOpenModule] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const build = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    const key = suggestions.find((s) => input.toLowerCase().includes(s.toLowerCase())) ?? suggestions[Math.floor(Math.random() * suggestions.length)];
    setTimeout(() => {
      setResult(templates[key]);
      setLoading(false);
      setOpenModule(0);
    }, 1400);
  };

  const useSuggestion = (s: string) => {
    setInput(s);
    inputRef.current?.focus();
  };

  return (
    <div style={{ background: "#fafafa", padding: "20px", minHeight: 280 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#D9920B", letterSpacing: "0.10em", marginBottom: 8 }}>AI CURRICULUM BUILDER</p>

      {!result && !loading && (
        <>
          <p style={{ fontSize: 13, color: "#16282B", marginBottom: 12, lineHeight: 1.5 }}>
            Describe your audience and learning goal. The engine scaffolds a structured curriculum with objectives, activities, and assessments.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {suggestions.map((s) => (
              <button key={s} onClick={() => useSuggestion(s)}
                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: "1px solid #CFD6CF", background: "white", color: "#2E6E64", cursor: "pointer", fontWeight: 500 }}>
                {s}
              </button>
            ))}
          </div>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. AI literacy for educators, onboarding for remote teams..."
            rows={2}
            data-testid="curriculum-input"
            style={{ width: "100%", border: "1px solid #CFD6CF", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#16282B", background: "white", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 10 }}
          />
          <button
            onClick={build}
            disabled={!input.trim()}
            data-testid="curriculum-build"
            style={{ background: input.trim() ? "#D9920B" : "#EEF1EC", color: input.trim() ? "white" : "#AAA", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: input.trim() ? "pointer" : "default" }}
          >
            Generate Curriculum
          </button>
        </>
      )}

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 14 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#D9920B", animation: "typingDot 0.8s infinite", animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p style={{ fontSize: 13, color: "#2E6E64" }}>Scaffolding curriculum structure...</p>
          <style>{`@keyframes typingDot { 0%,80%,100% { opacity:0.2; transform:scale(0.8); } 40% { opacity:1; transform:scale(1); } }`}</style>
        </div>
      )}

      {result && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "#16282B", marginBottom: 2 }}>{result.title}</p>
            <p style={{ fontSize: 12, color: "#2E6E64", marginBottom: 1 }}>{result.duration}</p>
            <p style={{ fontSize: 12, color: "#888" }}>{result.audience}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.modules.map((mod, i) => (
              <div key={i} style={{ border: "1px solid #EEF1EC", borderRadius: 9, overflow: "hidden" }}>
                <button
                  onClick={() => setOpenModule(openModule === i ? -1 : i)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: openModule === i ? "#EEF1EC" : "white", border: "none", cursor: "pointer", textAlign: "left" }}
                  data-testid={`curriculum-module-${i}`}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#16282B" }}>{mod.title}</span>
                  <span style={{ color: "#D9920B", fontSize: 14 }}>{openModule === i ? "−" : "+"}</span>
                </button>
                {openModule === i && (
                  <div style={{ padding: "10px 12px", background: "white", borderTop: "1px solid #EEF1EC" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#2E6E64", marginBottom: 4, letterSpacing: "0.08em" }}>OBJECTIVES</p>
                    {mod.objectives.map((o, j) => <p key={j} style={{ fontSize: 12, color: "#16282B", marginBottom: 3 }}>• {o}</p>)}
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#2E6E64", marginTop: 8, marginBottom: 4, letterSpacing: "0.08em" }}>ACTIVITIES</p>
                    {mod.activities.map((a, j) => <p key={j} style={{ fontSize: 12, color: "#16282B", marginBottom: 3 }}>• {a}</p>)}
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#D9920B", marginTop: 8, marginBottom: 4, letterSpacing: "0.08em" }}>ASSESSMENT</p>
                    <p style={{ fontSize: 12, color: "#16282B" }}>{mod.assessment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={() => { setResult(null); setInput(""); }}
            style={{ marginTop: 12, background: "none", border: "1px solid #CFD6CF", borderRadius: 7, padding: "6px 14px", fontSize: 12, color: "#888", cursor: "pointer" }}>
            Build another
          </button>
        </div>
      )}
    </div>
  );
}
