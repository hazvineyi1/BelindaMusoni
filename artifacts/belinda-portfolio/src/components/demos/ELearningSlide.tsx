import { useState } from "react";

type SlideData = {
  id: number;
  moduleLabel: string;
  title: string;
  body: React.ReactNode;
};

function ChoiceSlide({ question, choices, correct }: { question: string; choices: { text: string; feedback: string }[]; correct: number }) {
  const [chosen, setChosen] = useState<number | null>(null);
  return (
    <div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#16282B", marginBottom: 14, lineHeight: 1.5 }}>{question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {choices.map((c, i) => {
          const isChosen = chosen === i;
          const isCorrect = i === correct;
          let border = "1px solid #CFD6CF";
          let bg = "white";
          if (isChosen) {
            border = `1.5px solid ${isCorrect ? "#2E6E64" : "#C0392B"}`;
            bg = isCorrect ? "#E8F4F1" : "#FDECEA";
          }
          return (
            <div key={i}>
              <button
                onClick={() => setChosen(i)}
                style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 9, border, background: bg, fontSize: 13, color: "#16282B", cursor: "pointer", transition: "all 0.15s" }}
              >
                {c.text}
              </button>
              {isChosen && (
                <div style={{ marginTop: 4, padding: "8px 12px", borderRadius: 7, background: isCorrect ? "#E8F4F1" : "#FDECEA", borderLeft: `3px solid ${isCorrect ? "#2E6E64" : "#C0392B"}`, fontSize: 12, color: "#16282B" }}>
                  {c.feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabSlide({ tabs }: { tabs: { label: string; content: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 14, borderBottom: "2px solid #EEF1EC" }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, border: "none", background: "none", cursor: "pointer", color: active === i ? "#D9920B" : "#888", borderBottom: active === i ? "2px solid #D9920B" : "2px solid transparent", marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "#16282B", lineHeight: 1.65 }}>{tabs[active].content}</p>
    </div>
  );
}

function RevealSlide({ items }: { items: { heading: string; text: string }[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(r => { const n = new Set(r); n.has(i) ? n.delete(i) : n.add(i); return n; });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ border: "1px solid #EEF1EC", borderRadius: 9, overflow: "hidden" }}>
          <button onClick={() => toggle(i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: revealed.has(i) ? "#EEF1EC" : "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#16282B" }}>
            {item.heading}
            <span style={{ color: "#D9920B", fontSize: 16 }}>{revealed.has(i) ? "−" : "+"}</span>
          </button>
          {revealed.has(i) && (
            <div style={{ padding: "10px 14px", fontSize: 13, color: "#16282B", lineHeight: 1.6 }}>{item.text}</div>
          )}
        </div>
      ))}
    </div>
  );
}

const slides: SlideData[] = [
  {
    id: 1,
    moduleLabel: "Module 2 · Lesson 3",
    title: "Why Cognitive Load Matters in eLearning",
    body: (
      <TabSlide tabs={[
        { label: "Intrinsic",  content: "Intrinsic load is the inherent complexity of the material itself. You can't eliminate it, but you can sequence content to build from simpler concepts first, reducing the mental effort of working with new material." },
        { label: "Extraneous", content: "Extraneous load comes from poor design choices: cluttered slides, inconsistent navigation, unclear labels. Every pixel of unnecessary complexity steals cognitive resources from actual learning." },
        { label: "Germane",    content: "Germane load is the productive mental effort of building schema, making sense of new information and connecting it to what the learner already knows. Good instructional design maximises this while minimising the other two." },
      ]} />
    ),
  },
  {
    id: 2,
    moduleLabel: "Module 3 · Lesson 1",
    title: "Scenario: You've Just Received the Draft Content",
    body: (
      <ChoiceSlide
        question="A subject matter expert sends you 47 slides of dense text and says 'just animate this.' What do you do first?"
        choices={[
          { text: "Start animating. The SME knows the content.", feedback: "Animating bad content makes it engaging bad content. You've spent time on polish without addressing the real problem." },
          { text: "Conduct a needs analysis before touching the slides.", feedback: "Correct. Understanding the performance gap, the audience, and the goal will tell you whether this content is even right for the medium." },
          { text: "Condense the 47 slides into 20 slides.", feedback: "Shorter isn't better if the content itself doesn't map to clear objectives. Compression without analysis still produces the wrong course." },
        ]}
        correct={1}
      />
    ),
  },
  {
    id: 3,
    moduleLabel: "Module 4 · Lesson 2",
    title: "The Five Principles of Multimedia Learning",
    body: (
      <RevealSlide items={[
        { heading: "Coherence", text: "Exclude material that doesn't directly support the learning objective. Each word, image, and sound should earn its place." },
        { heading: "Signalling", text: "Use visual cues such as highlights, arrows, and bold text to guide attention to what matters. Learners shouldn't have to guess where to look." },
        { heading: "Redundancy", text: "Don't show the same text on screen that you're narrating word-for-word. People read or listen, and they don't do both well simultaneously." },
        { heading: "Spatial Contiguity", text: "Place related text and images near each other. Learners shouldn't scan across the screen to connect corresponding elements." },
        { heading: "Segmenting", text: "Break content into learner-controlled segments. Let people pause, process, and continue at their own pace." },
      ]} />
    ),
  },
];

export default function ELearningSlide() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const slide = slides[slideIdx];

  const advance = () => {
    setCompleted(c => new Set([...c, slideIdx]));
    if (slideIdx < slides.length - 1) {
      setSlideIdx(s => s + 1);
    } else {
      setDone(true);
    }
  };
  const back = () => { if (slideIdx > 0) setSlideIdx(s => s - 1); };
  const restart = () => { setSlideIdx(0); setCompleted(new Set()); setDone(false); };

  if (done) {
    return (
      <div style={{ background: "#fafafa", minHeight: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#2E6E64", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "#16282B", marginBottom: 8 }}>Module Complete</h3>
        <p style={{ fontSize: 13, color: "#2E6E64", lineHeight: 1.6, maxWidth: 320, marginBottom: 22 }}>
          You worked through all {slides.length} slides, including a branching scenario and the multimedia principles. This is how a finished lesson tracks progress and confirms completion.
        </p>
        <button onClick={restart} data-testid="elearning-restart"
          style={{ background: "#D9920B", color: "white", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Restart module
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#fafafa", minHeight: 360 }}>
      {/* Top bar */}
      <div style={{ background: "#16282B", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{slide.moduleLabel}</span>
        <div style={{ display: "flex", gap: 4 }}>
          {slides.map((_, i) => (
            <div key={i} style={{ width: 28, height: 4, borderRadius: 2, background: completed.has(i) ? "#D9920B" : i === slideIdx ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{slideIdx + 1} / {slides.length}</span>
      </div>

      {/* Content area */}
      <div style={{ padding: "24px 28px" }}>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#16282B", marginBottom: 16, lineHeight: 1.3 }}>
          {slide.title}
        </h3>
        {slide.body}
      </div>

      {/* Nav footer */}
      <div style={{ padding: "12px 24px", borderTop: "1px solid #EEF1EC", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white" }}>
        <button onClick={back} disabled={slideIdx === 0}
          style={{ fontSize: 12, color: slideIdx === 0 ? "#CFD6CF" : "#888", background: "none", border: "none", cursor: slideIdx === 0 ? "default" : "pointer" }}>
          Back
        </button>
        <button onClick={advance} data-testid="elearning-advance"
          style={{ background: "#D9920B", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          {slideIdx === slides.length - 1 ? "Complete" : "Continue"} →
        </button>
      </div>
    </div>
  );
}
