import { useState } from "react";

type Question = { text: string; options: string[]; correct: number; difficulty: number; explanation: string };

const questions: Record<number, Question[]> = {
  1: [
    {
      text: "Which of these best describes 'learning objectives'?",
      options: ["What the instructor plans to teach", "What learners will be able to do after instruction", "The topics covered in a course", "The grading criteria for assignments"],
      correct: 1, difficulty: 1,
      explanation: "Learning objectives describe observable learner behaviors, not instructor actions or content topics.",
    },
  ],
  2: [
    {
      text: "Bloom's Taxonomy is primarily used to:",
      options: ["Design classroom furniture layouts", "Classify cognitive complexity of learning goals", "Measure learner satisfaction", "Schedule course delivery timelines"],
      correct: 1, difficulty: 2,
      explanation: "Bloom's Taxonomy provides a framework for categorizing learning objectives from recall to creation, helping designers build appropriate cognitive challenge.",
    },
    {
      text: "The 'forgetting curve' suggests that learners forget most new information:",
      options: ["Within 6 months without review", "Within the first 24-48 hours", "Gradually over a full year", "Only if the material is irrelevant"],
      correct: 1, difficulty: 2,
      explanation: "Ebbinghaus's forgetting curve shows steep memory decay within the first day. Spaced repetition directly counters this.",
    },
  ],
  3: [
    {
      text: "A learner scores 90% on a post-test but only 40% on a knowledge transfer task two weeks later. What does this most likely indicate?",
      options: ["The learner has low ability", "The assessment measured recall, not deep learning", "The transfer task was too difficult", "The course content was irrelevant"],
      correct: 1, difficulty: 3,
      explanation: "High post-test scores with low transfer often signal surface-level encoding. Deep learning requires retrieval practice, elaboration, and application in varied contexts.",
    },
    {
      text: "In a multi-agent AI tutoring system, which agent role most directly prevents hallucination errors from reaching learners?",
      options: ["Content agent", "Verification/grounding agent", "Feedback agent", "Analytics agent"],
      correct: 1, difficulty: 3,
      explanation: "A dedicated grounding agent checks outputs against authoritative sources before they reach learners, serving as a quality gate within the pipeline.",
    },
  ],
  4: [
    {
      text: "An adaptive assessment raises item difficulty after correct responses. What psychometric model underpins this approach?",
      options: ["Classical Test Theory", "Generalizability Theory", "Item Response Theory", "Signal Detection Theory"],
      correct: 2, difficulty: 4,
      explanation: "Item Response Theory (IRT) models the probability of a correct response as a function of learner ability and item characteristics, enabling adaptive item selection.",
    },
  ],
};

const difficultyLabels = ["", "Foundational", "Intermediate", "Advanced", "Expert"];
const difficultyColors = ["", "#2E6E64", "#D9920B", "#C0392B", "#7B2D8B"];

function getNextQuestion(currentDifficulty: number, correct: boolean, used: Set<string>): Question | null {
  const targetDiff = correct ? Math.min(currentDifficulty + 1, 4) : Math.max(currentDifficulty - 1, 1);
  const pool = [...(questions[targetDiff] ?? []), ...(questions[currentDifficulty] ?? [])];
  const available = pool.filter((q) => !used.has(q.text));
  return available[0] ?? null;
}

export default function AdaptiveAssessment() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [current, setCurrent] = useState<Question>(questions[2][0]);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<{ q: Question; chosen: number; correct: boolean }[]>([]);
  const [used, setUsed] = useState<Set<string>>(new Set());

  const start = () => {
    setCurrent(questions[2][0]);
    setUsed(new Set([questions[2][0].text]));
    setPhase("quiz");
  };

  const choose = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    const correct = i === current.correct;
    if (correct) setScore((s) => s + 1);
    setTotal((t) => t + 1);
    setHistory((h) => [...h, { q: current, chosen: i, correct }]);
  };

  const next = () => {
    if (total >= 5) { setPhase("result"); return; }
    const correct = selected === current.correct;
    const nextQ = getNextQuestion(current.difficulty, correct, used);
    if (!nextQ) { setPhase("result"); return; }
    setCurrent(nextQ);
    setUsed((u) => new Set([...u, nextQ.text]));
    setSelected(null);
    setAnswered(false);
  };

  const restart = () => {
    setPhase("intro"); setScore(0); setTotal(0);
    setHistory([]); setUsed(new Set()); setSelected(null); setAnswered(false);
  };

  if (phase === "intro") {
    return (
      <div style={{ background: "#fafafa", padding: "24px", minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#D9920B", letterSpacing: "0.10em", marginBottom: 12 }}>ADAPTIVE ASSESSMENT ENGINE</p>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: "#16282B", marginBottom: 10 }}>
          The quiz adjusts to you in real time.
        </p>
        <p style={{ fontSize: 13, color: "#2E6E64", lineHeight: 1.6, marginBottom: 20 }}>
          Answer correctly and difficulty rises. Struggle and it recalibrates. Five questions, personalized to your level, topic: Learning Design.
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {difficultyLabels.slice(1).map((l, i) => (
            <span key={l} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: difficultyColors[i + 1] + "18", color: difficultyColors[i + 1], fontWeight: 600 }}>{l}</span>
          ))}
        </div>
        <button onClick={start} style={{ background: "#D9920B", color: "white", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }} data-testid="assessment-start">
          Start Assessment
        </button>
      </div>
    );
  }

  if (phase === "result") {
    const pct = Math.round((score / total) * 100);
    return (
      <div style={{ background: "#fafafa", padding: "24px", minHeight: 280 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#D9920B", letterSpacing: "0.10em", marginBottom: 10 }}>RESULTS</p>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 14 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 700, color: "#16282B" }}>{pct}%</span>
          <span style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>{score}/{total} correct</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {history.map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12 }}>
              <span style={{ color: h.correct ? "#2E6E64" : "#C0392B", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{h.correct ? "✓" : "✗"}</span>
              <div>
                <p style={{ color: "#16282B", marginBottom: 2 }}>{h.q.text.slice(0, 60)}…</p>
                {!h.correct && <p style={{ color: "#C0392B", fontSize: 11 }}>{h.q.explanation.slice(0, 80)}…</p>}
              </div>
              <span style={{ marginLeft: "auto", flexShrink: 0, fontSize: 10, padding: "2px 8px", borderRadius: 20, background: difficultyColors[h.q.difficulty] + "18", color: difficultyColors[h.q.difficulty], fontWeight: 600 }}>
                {difficultyLabels[h.q.difficulty]}
              </span>
            </div>
          ))}
        </div>
        <button onClick={restart} style={{ background: "#16282B", color: "white", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 12, cursor: "pointer", fontWeight: 600 }} data-testid="assessment-restart">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#fafafa", padding: "20px", minHeight: 280 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: difficultyColors[current.difficulty] + "18", color: difficultyColors[current.difficulty], fontWeight: 600 }}>
          {difficultyLabels[current.difficulty]}
        </span>
        <span style={{ fontSize: 12, color: "#888" }}>Q {total + 1} of 5</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#16282B" }}>{score} correct</span>
      </div>

      {/* Progress */}
      <div style={{ background: "#EEF1EC", borderRadius: 4, height: 4, marginBottom: 16 }}>
        <div style={{ width: `${(total / 5) * 100}%`, height: "100%", background: "#2E6E64", borderRadius: 4, transition: "width 0.4s" }} />
      </div>

      <p style={{ fontSize: 14, color: "#16282B", fontWeight: 500, lineHeight: 1.55, marginBottom: 14 }}>{current.text}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {current.options.map((opt, i) => {
          let border = "1px solid #CFD6CF";
          let bg = "white";
          let color = "#16282B";
          if (answered) {
            if (i === current.correct) { border = "1.5px solid #2E6E64"; bg = "#E8F4F1"; color = "#16282B"; }
            else if (i === selected) { border = "1.5px solid #C0392B"; bg = "#FDECEA"; color = "#16282B"; }
            else { color = "#AAA"; }
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={answered}
              data-testid={`assessment-option-${i}`}
              style={{ border, background: bg, borderRadius: 8, padding: "9px 12px", fontSize: 13, color, textAlign: "left", cursor: answered ? "default" : "pointer" }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div style={{ marginTop: 12, fontSize: 12, color: "#16282B", lineHeight: 1.5, background: "#EEF1EC", borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${selected === current.correct ? "#2E6E64" : "#C0392B"}` }}>
          <strong>{selected === current.correct ? "Correct." : "Not quite."}</strong> {current.explanation}
          <button onClick={next} style={{ display: "block", marginTop: 8, background: "#16282B", color: "white", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 }} data-testid="assessment-next">
            {total >= 4 ? "See Results" : "Next Question"} &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
