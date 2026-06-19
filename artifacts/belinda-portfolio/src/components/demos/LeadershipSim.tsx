import { useState } from "react";

type Choice = { text: string; points: number; consequence: string };
type Scenario = { situation: string; context: string; choices: Choice[] };

const scenarios: Scenario[] = [
  {
    situation: "A high performer keeps missing deadlines",
    context: "Jordan has been your best analyst for two years. Over the past month, three deliverables have been late with no explanation offered.",
    choices: [
      { text: "Schedule a private 1:1 to ask what's going on", points: 15, consequence: "Jordan opens up about a family health crisis. You agree on a temporary adjusted workload. Trust deepens significantly." },
      { text: "Send a formal written warning through HR", points: 3, consequence: "Jordan shuts down emotionally. Performance deteriorates further. You lose a strong team member within 60 days." },
      { text: "Redistribute Jordan's projects to other team members", points: 6, consequence: "The team notices and morale dips. Jordan feels sidelined without understanding why. Root cause remains unaddressed." },
    ],
  },
  {
    situation: "Two team members are in open conflict",
    context: "During a product review, Alex and Sam publicly disagreed, and it became personal. The tension is now affecting the whole team's collaboration.",
    choices: [
      { text: "Mediate a structured conversation between them with clear ground rules", points: 14, consequence: "Both parties feel heard. You surface a genuine process disagreement underneath the personal friction. Team dynamic improves." },
      { text: "Tell them to keep it professional and work it out themselves", points: 4, consequence: "The conflict goes underground. Passive friction continues for weeks and pulls others in." },
      { text: "Separate their workstreams so they don't collaborate directly", points: 7, consequence: "Tension eases short-term, but the team loses a valuable collaboration and the root issue is never resolved." },
    ],
  },
  {
    situation: "A new initiative needs a lead, but your best candidate is already stretched",
    context: "Leadership wants this done in 6 weeks. Your only person with the right expertise, Morgan, is already at capacity on a critical project.",
    choices: [
      { text: "Talk with Morgan openly about tradeoffs and ask what they'd deprioritize", points: 15, consequence: "Morgan feels respected. You co-design a feasible plan. One lower-priority project gets paused with stakeholder buy-in." },
      { text: "Assign Morgan anyway and trust them to figure it out", points: 3, consequence: "Morgan burns out and quality drops on both projects. You miss both deadlines." },
      { text: "Take on the coordination yourself to protect Morgan's capacity", points: 8, consequence: "The project moves forward but you become a bottleneck. Morgan feels their judgment wasn't trusted." },
    ],
  },
];

const ratings: Record<string, { label: string; color: string; note: string }> = {
  high: { label: "Transformational Leader", color: "#2E6E64", note: "You consistently prioritized trust, communication, and psychological safety. Your team will follow you into hard projects." },
  mid: { label: "Developing Leader", color: "#D9920B", note: "You balanced short-term efficiency with team health. Push yourself to slow down and dig for root causes before acting." },
  low: { label: "Directive Manager", color: "#C0392B", note: "Your instinct is control over conversation. The best teams are built on psychological safety, not compliance." },
};

export default function LeadershipSim() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [showConsequence, setShowConsequence] = useState(false);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState<{ scenarioIdx: number; choiceIdx: number; points: number }[]>([]);

  const scenario = scenarios[step];
  const maxScore = scenarios.reduce((a, s) => a + Math.max(...s.choices.map(c => c.points)), 0);

  const choose = (idx: number) => {
    if (chosen !== null) return;
    setChosen(idx);
    setShowConsequence(true);
    setScore((s) => s + scenario.choices[idx].points);
    setHistory((h) => [...h, { scenarioIdx: step, choiceIdx: idx, points: scenario.choices[idx].points }]);
  };

  const next = () => {
    if (step + 1 >= scenarios.length) {
      setDone(true);
    } else {
      setStep((s) => s + 1);
      setChosen(null);
      setShowConsequence(false);
    }
  };

  const restart = () => { setStep(0); setScore(0); setChosen(null); setShowConsequence(false); setDone(false); setHistory([]); };

  const pct = score / maxScore;
  const rating = pct >= 0.75 ? ratings.high : pct >= 0.45 ? ratings.mid : ratings.low;

  if (done) {
    return (
      <div style={{ background: "#fafafa", padding: "24px", minHeight: 280 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#D9920B", letterSpacing: "0.10em", marginBottom: 8 }}>DEBRIEF REPORT</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, color: rating.color }}>{score}</span>
          <span style={{ fontSize: 14, color: "#888" }}>/ {maxScore} pts</span>
        </div>
        <div style={{ display: "inline-block", background: rating.color + "18", color: rating.color, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
          {rating.label}
        </div>
        <p style={{ fontSize: 13, color: "#16282B", lineHeight: 1.6, marginBottom: 16 }}>{rating.note}</p>
        <div style={{ borderTop: "1px solid #EEF1EC", paddingTop: 12, marginBottom: 16 }}>
          {history.map((h, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#2E6E64", marginBottom: 4 }}>
              <span>Scenario {i + 1}: {scenarios[h.scenarioIdx].choices[h.choiceIdx].text.slice(0, 40)}…</span>
              <span style={{ fontWeight: 600, color: h.points >= 12 ? "#2E6E64" : h.points >= 7 ? "#D9920B" : "#C0392B" }}>+{h.points}</span>
            </div>
          ))}
        </div>
        <button onClick={restart} style={{ background: "#16282B", color: "white", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }} data-testid="leadership-restart">
          Replay Simulation
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#fafafa", padding: "20px", minHeight: 280 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#D9920B", letterSpacing: "0.10em" }}>SCENARIO {step + 1} OF {scenarios.length}</span>
        <div style={{ display: "flex", gap: 5 }}>
          {scenarios.map((_, i) => (
            <div key={i} style={{ width: 24, height: 5, borderRadius: 3, background: i <= step ? "#2E6E64" : "#EEF1EC" }} />
          ))}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#16282B" }}>{score} pts</span>
      </div>

      {/* Situation */}
      <div style={{ background: "#16282B", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
        <p style={{ color: "#D9920B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>SITUATION</p>
        <p style={{ color: "white", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{scenario.situation}</p>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.5 }}>{scenario.context}</p>
      </div>

      {/* Choices */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {scenario.choices.map((c, i) => {
          const isChosen = chosen === i;
          const isOther = chosen !== null && !isChosen;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={chosen !== null}
              data-testid={`leadership-choice-${i}`}
              style={{
                border: `1.5px solid ${isChosen ? "#2E6E64" : "#CFD6CF"}`,
                background: isChosen ? "#E8F4F1" : isOther ? "#F8F8F8" : "white",
                borderRadius: 9,
                padding: "10px 12px",
                fontSize: 13,
                color: isOther ? "#AAA" : "#16282B",
                textAlign: "left",
                cursor: chosen !== null ? "default" : "pointer",
                transition: "all 0.15s",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{c.text}</span>
              {isChosen && (
                <span style={{ background: c.points >= 12 ? "#2E6E64" : c.points >= 7 ? "#D9920B" : "#C0392B", color: "white", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, marginLeft: 8, flexShrink: 0 }}>
                  +{c.points} pts
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Consequence */}
      {showConsequence && chosen !== null && (
        <div style={{ marginTop: 12, background: "#EEF1EC", borderRadius: 9, padding: "10px 14px", fontSize: 12, color: "#16282B", lineHeight: 1.55, borderLeft: `3px solid ${scenario.choices[chosen].points >= 12 ? "#2E6E64" : scenario.choices[chosen].points >= 7 ? "#D9920B" : "#C0392B"}` }}>
          <strong>Result:</strong> {scenario.choices[chosen].consequence}
          <button onClick={next} style={{ display: "block", marginTop: 10, background: "#16282B", color: "white", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 }} data-testid="leadership-next">
            {step + 1 >= scenarios.length ? "See Debrief" : "Next Scenario"} &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
