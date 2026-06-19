import { useState } from "react";

type ContentType = "Title" | "Text + Image" | "Scenario" | "Interaction" | "Knowledge Check" | "Summary";
type Slide = {
  id: number;
  type: ContentType;
  title: string;
  narration: string;
  notes: string;
  duration: string;
};

const typeColors: Record<ContentType, { bg: string; color: string }> = {
  "Title":          { bg: "#EEF1EC", color: "#16282B" },
  "Text + Image":   { bg: "#E8F4F1", color: "#1D4A43" },
  "Scenario":       { bg: "#FEF3DC", color: "#8A5A00" },
  "Interaction":    { bg: "#E8F4F1", color: "#2E6E64" },
  "Knowledge Check":{ bg: "#FDECEA", color: "#C0392B" },
  "Summary":        { bg: "#EEF1EC", color: "#16282B" },
};

const initialSlides: Slide[] = [
  { id: 1, type: "Title",          title: "AI in the Classroom",           narration: "Welcome to this module on practical AI integration for educators. By the end, you'll have a working AI tool in your course.",           notes: "Display for 8s. Auto-advance.",                          duration: "0:08" },
  { id: 2, type: "Text + Image",   title: "What Learners Need From You",   narration: "Your learners don't need you to be an AI expert. They need you to model thoughtful, critical use of the tools they'll encounter in their careers.", notes: "Image: educator at laptop with students.",                duration: "0:45" },
  { id: 3, type: "Scenario",       title: "Jordan's Dilemma",              narration: "Jordan, a history instructor, gets an essay that reads suspiciously well. She doesn't know if it's AI-written. What does she do?",           notes: "Pause for reflection. Branching follows.",               duration: "0:30" },
  { id: 4, type: "Interaction",    title: "Choose Jordan's Response",      narration: "Select the response that best reflects your institution's values and your own teaching philosophy.",                                           notes: "3-choice branch. Track selection for debrief.",          duration: "1:00" },
  { id: 5, type: "Knowledge Check","title": "Check Your Understanding",    narration: "Before we move on, let's make sure the key ideas are landing.",                                                                               notes: "3 questions. Requires 2/3 correct to advance.",          duration: "2:00" },
  { id: 6, type: "Summary",        title: "What You'll Apply This Week",   narration: "Pick one AI tool and integrate it into one activity before next week's cohort session. Bring your experience to share.",                     notes: "Downloadable action card. Link to community thread.",    duration: "0:30" },
];

const types: ContentType[] = ["Title","Text + Image","Scenario","Interaction","Knowledge Check","Summary"];

export default function StoryboardEditor() {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [selected, setSelected] = useState<number>(1);
  const [editing, setEditing] = useState<"narration" | "notes" | null>(null);

  const current = slides.find(s => s.id === selected)!;

  const updateSlide = (field: keyof Slide, value: string) => {
    setSlides(ss => ss.map(s => s.id === selected ? { ...s, [field]: value } : s));
  };

  const totalTime = slides.reduce((acc, s) => {
    const [m, sec] = s.duration.split(":").map(Number);
    return acc + m * 60 + sec;
  }, 0);
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{ display: "flex", minHeight: 360, maxHeight: 420, overflow: "hidden", background: "#fafafa" }}>
      {/* Slide reel */}
      <div style={{ width: 200, borderRight: "1px solid #EEF1EC", overflowY: "auto", background: "white", flexShrink: 0 }}>
        <div style={{ padding: "10px 12px", borderBottom: "1px solid #EEF1EC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#D9920B", letterSpacing: "0.10em" }}>STORYBOARD</span>
          <span style={{ fontSize: 10, color: "#888" }}>{fmt(totalTime)} total</span>
        </div>
        {slides.map((s, i) => {
          const tc = typeColors[s.type];
          const isActive = s.id === selected;
          return (
            <button
              key={s.id}
              onClick={() => { setSelected(s.id); setEditing(null); }}
              data-testid={`storyboard-slide-${s.id}`}
              style={{
                width: "100%", textAlign: "left", padding: "10px 12px", border: "none", cursor: "pointer",
                background: isActive ? "#EEF1EC" : "white",
                borderLeft: `3px solid ${isActive ? "#D9920B" : "transparent"}`,
                borderBottom: "1px solid #F5F5F3",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#888" }}>SLIDE {String(i+1).padStart(2,"0")}</span>
                <span style={{ fontSize: 10, color: "#888" }}>{s.duration}</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#16282B", marginBottom: 4, lineHeight: 1.3 }}>{s.title}</p>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 20, background: tc.bg, color: tc.color }}>{s.type}</span>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #EEF1EC", display: "flex", gap: 10, alignItems: "center", background: "white" }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#EEF1EC" }}>
            {String(slides.findIndex(s => s.id === selected) + 1).padStart(2,"0")}
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#16282B" }}>{current.title}</p>
            <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => updateSlide("type", t)}
                  style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600,
                    background: current.type === t ? typeColors[t].bg : "#F5F5F3",
                    color: current.type === t ? typeColors[t].color : "#AAA",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <span style={{ fontSize: 11, color: "#888" }}>{current.duration}</span>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Narration */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#2E6E64", letterSpacing: "0.10em" }}>NARRATION SCRIPT</span>
              <button onClick={() => setEditing(editing === "narration" ? null : "narration")}
                style={{ fontSize: 10, color: "#D9920B", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                {editing === "narration" ? "Done" : "Edit"}
              </button>
            </div>
            {editing === "narration" ? (
              <textarea
                value={current.narration}
                onChange={e => updateSlide("narration", e.target.value)}
                rows={3}
                style={{ width: "100%", border: "1px solid #CFD6CF", borderRadius: 8, padding: "8px 10px", fontSize: 12, resize: "none", outline: "none", background: "white", lineHeight: 1.6, boxSizing: "border-box" }}
              />
            ) : (
              <p style={{ fontSize: 12, color: "#16282B", lineHeight: 1.65, background: "#F9F9F7", borderRadius: 8, padding: "10px 12px", fontStyle: "italic" }}>
                "{current.narration}"
              </p>
            )}
          </div>

          {/* Dev notes */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#D9920B", letterSpacing: "0.10em" }}>DEV NOTES</span>
              <button onClick={() => setEditing(editing === "notes" ? null : "notes")}
                style={{ fontSize: 10, color: "#D9920B", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                {editing === "notes" ? "Done" : "Edit"}
              </button>
            </div>
            {editing === "notes" ? (
              <textarea
                value={current.notes}
                onChange={e => updateSlide("notes", e.target.value)}
                rows={2}
                style={{ width: "100%", border: "1px solid #CFD6CF", borderRadius: 8, padding: "8px 10px", fontSize: 12, resize: "none", outline: "none", background: "white", boxSizing: "border-box" }}
              />
            ) : (
              <p style={{ fontSize: 12, color: "#888", lineHeight: 1.55, background: "#F9F9F7", borderRadius: 8, padding: "8px 12px", borderLeft: "3px solid #D9920B" }}>
                {current.notes}
              </p>
            )}
          </div>

          {/* Slide progress map */}
          <div>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#2E6E64", letterSpacing: "0.10em", display: "block", marginBottom: 6 }}>MODULE FLOW</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {slides.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div
                    onClick={() => setSelected(s.id)}
                    style={{
                      width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 10, fontWeight: 700,
                      background: s.id === selected ? "#D9920B" : typeColors[s.type].bg,
                      color: s.id === selected ? "white" : typeColors[s.type].color,
                      border: s.id === selected ? "2px solid #D9920B" : "1px solid transparent",
                    }}
                    title={s.title}
                  >
                    {i+1}
                  </div>
                  {i < slides.length - 1 && <div style={{ width: 12, height: 1, background: "#CFD6CF" }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
