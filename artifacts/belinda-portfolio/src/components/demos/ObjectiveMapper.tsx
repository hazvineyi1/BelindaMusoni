import { useState } from "react";

type BloomLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
type Objective = {
  id: number;
  text: string;
  bloom: BloomLevel;
  assessment: string;
  activity: string;
  aligned: boolean;
};

const bloomColors: Record<BloomLevel, { bg: string; color: string; bar: string }> = {
  "Remember":  { bg: "#F0F0F0", color: "#888",    bar: "#CFD6CF" },
  "Understand":{ bg: "#E8F4F1", color: "#2E6E64", bar: "#2E6E64" },
  "Apply":     { bg: "#E8F4F1", color: "#1D4A43", bar: "#1D4A43" },
  "Analyze":   { bg: "#FEF3DC", color: "#8A5A00", bar: "#D9920B" },
  "Evaluate":  { bg: "#FDECEA", color: "#C0392B", bar: "#C0392B" },
  "Create":    { bg: "#F0E6FF", color: "#6B21A8", bar: "#7C3AED" },
};

const bloomOrder: BloomLevel[] = ["Remember","Understand","Apply","Analyze","Evaluate","Create"];

const initialObjectives: Objective[] = [
  { id: 1, text: "Recall the six levels of Bloom's Taxonomy in order",           bloom: "Remember",   assessment: "Matching quiz",                   activity: "Flashcard review",                aligned: true  },
  { id: 2, text: "Explain how cognitive load theory affects screen design",       bloom: "Understand", assessment: "Short written explanation",        activity: "Annotated diagram",               aligned: true  },
  { id: 3, text: "Apply backward design to map a unit from outcomes to content",  bloom: "Apply",      assessment: "Unit plan submission",             activity: "Guided template + peer review",   aligned: true  },
  { id: 4, text: "Analyze a poorly designed course and identify QM violations",   bloom: "Analyze",    assessment: "Annotated course audit",           activity: "Live course review session",      aligned: true  },
  { id: 5, text: "Evaluate AI-generated feedback for pedagogical soundness",      bloom: "Evaluate",   assessment: "Critique rubric + written rationale", activity: "AI output comparison lab",     aligned: false },
  { id: 6, text: "Design a branching scenario with adaptive scoring logic",       bloom: "Create",     assessment: "Submitted Storyline prototype",    activity: "Storyboard + build sprint",       aligned: true  },
];

const bloomLevelIndex: Record<BloomLevel, number> = {
  "Remember": 1, "Understand": 2, "Apply": 3, "Analyze": 4, "Evaluate": 5, "Create": 6,
};

export default function ObjectiveMapper() {
  const [objectives, setObjectives] = useState<Objective[]>(initialObjectives);
  const [filter, setFilter] = useState<BloomLevel | "All">("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  const visible = filter === "All" ? objectives : objectives.filter(o => o.bloom === filter);
  const avgLevel = objectives.reduce((a, o) => a + bloomLevelIndex[o.bloom], 0) / objectives.length;
  const misaligned = objectives.filter(o => !o.aligned).length;

  const cycleBloom = (id: number) => {
    setObjectives(os => os.map(o => {
      if (o.id !== id) return o;
      const idx = bloomOrder.indexOf(o.bloom);
      return { ...o, bloom: bloomOrder[(idx + 1) % bloomOrder.length] };
    }));
  };

  const toggleAligned = (id: number) => {
    setObjectives(os => os.map(o => o.id === id ? { ...o, aligned: !o.aligned } : o));
  };

  return (
    <div style={{ background: "#fafafa", padding: "18px", minHeight: 360 }}>
      {/* Header stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 100, background: "white", borderRadius: 10, padding: "10px 14px", border: "1px solid #EEF1EC" }}>
          <p style={{ fontSize: 10, color: "#888", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 3 }}>OBJECTIVES</p>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "#16282B" }}>{objectives.length}</p>
        </div>
        <div style={{ flex: 1, minWidth: 100, background: "white", borderRadius: 10, padding: "10px 14px", border: "1px solid #EEF1EC" }}>
          <p style={{ fontSize: 10, color: "#888", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 3 }}>AVG BLOOM LEVEL</p>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "#2E6E64" }}>{avgLevel.toFixed(1)}</p>
        </div>
        <div style={{ flex: 1, minWidth: 100, background: misaligned > 0 ? "#FDECEA" : "#E8F4F1", borderRadius: 10, padding: "10px 14px", border: `1px solid ${misaligned > 0 ? "#F5C6C2" : "#C0D9D5"}` }}>
          <p style={{ fontSize: 10, color: misaligned > 0 ? "#C0392B" : "#2E6E64", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 3 }}>MISALIGNED</p>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: misaligned > 0 ? "#C0392B" : "#2E6E64" }}>{misaligned}</p>
        </div>
        {/* Bloom distribution mini-bar */}
        <div style={{ flex: 2, minWidth: 160, background: "white", borderRadius: 10, padding: "10px 14px", border: "1px solid #EEF1EC" }}>
          <p style={{ fontSize: 10, color: "#888", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6 }}>COGNITIVE DISTRIBUTION</p>
          <div style={{ display: "flex", height: 16, borderRadius: 4, overflow: "hidden", gap: 1 }}>
            {bloomOrder.map(level => {
              const count = objectives.filter(o => o.bloom === level).length;
              if (count === 0) return null;
              return (
                <div key={level} title={`${level}: ${count}`}
                  style={{ flex: count, background: bloomColors[level].bar, opacity: 0.85 }} />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
            {bloomOrder.filter(l => objectives.some(o => o.bloom === l)).map(l => (
              <span key={l} style={{ fontSize: 9, color: bloomColors[l].color, fontWeight: 600 }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
        {(["All", ...bloomOrder] as (BloomLevel | "All")[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              fontSize: 10, padding: "3px 10px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600,
              background: filter === f ? "#16282B" : "#EEF1EC",
              color: filter === f ? "white" : "#16282B",
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Objective rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {visible.map(obj => {
          const bc = bloomColors[obj.bloom];
          const isOpen = expanded === obj.id;
          return (
            <div key={obj.id} style={{ background: "white", borderRadius: 9, border: `1px solid ${obj.aligned ? "#EEF1EC" : "#F5C6C2"}`, overflow: "hidden" }}>
              <div
                style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 12px", cursor: "pointer" }}
                onClick={() => setExpanded(isOpen ? null : obj.id)}
                data-testid={`objective-row-${obj.id}`}
              >
                {/* Bloom badge — click to cycle */}
                <button
                  onClick={e => { e.stopPropagation(); cycleBloom(obj.id); }}
                  title="Click to change Bloom level"
                  style={{ fontSize: 10, padding: "2px 9px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, flexShrink: 0, background: bc.bg, color: bc.color }}
                >
                  {obj.bloom}
                </button>
                <p style={{ flex: 1, fontSize: 12, color: "#16282B", lineHeight: 1.45 }}>{obj.text}</p>
                {/* Alignment toggle */}
                <button
                  onClick={e => { e.stopPropagation(); toggleAligned(obj.id); }}
                  title="Toggle alignment"
                  style={{ fontSize: 10, padding: "2px 9px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600, flexShrink: 0,
                    background: obj.aligned ? "#E8F4F1" : "#FDECEA",
                    color: obj.aligned ? "#2E6E64" : "#C0392B" }}
                >
                  {obj.aligned ? "Aligned" : "Review"}
                </button>
              </div>
              {isOpen && (
                <div style={{ padding: "8px 12px 12px", borderTop: "1px solid #F5F5F3", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#2E6E64", letterSpacing: "0.08em", marginBottom: 4 }}>ASSESSMENT</p>
                    <p style={{ fontSize: 12, color: "#16282B" }}>{obj.assessment}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#D9920B", letterSpacing: "0.08em", marginBottom: 4 }}>ACTIVITY</p>
                    <p style={{ fontSize: 12, color: "#16282B" }}>{obj.activity}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
