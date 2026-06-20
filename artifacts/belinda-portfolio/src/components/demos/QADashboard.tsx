import { useState } from "react";

type Status = "Approved" | "In Review" | "Flagged" | "Pending";
type Module = { id: number; name: string; criteria: number; met: number; status: Status; reviewer: string };

const initialModules: Module[] = [
  { id: 1, name: "Module 1: Learning Objectives and Alignment", criteria: 8, met: 8, status: "Approved", reviewer: "B. Musoni" },
  { id: 2, name: "Module 2: Instructional Materials", criteria: 8, met: 5, status: "In Review", reviewer: "B. Musoni" },
  { id: 3, name: "Module 3: Assessment and Measurement", criteria: 8, met: 3, status: "Flagged", reviewer: "-" },
  { id: 4, name: "Module 4: Course Activities and Engagement", criteria: 8, met: 8, status: "Approved", reviewer: "B. Musoni" },
  { id: 5, name: "Module 5: Learner Support", criteria: 8, met: 7, status: "Pending", reviewer: "-" },
  { id: 6, name: "Module 6: Course Technology", criteria: 8, met: 2, status: "Flagged", reviewer: "-" },
];

const statusColors: Record<Status, { bg: string; color: string }> = {
  Approved: { bg: "#E8F4F1", color: "#2E6E64" },
  "In Review": { bg: "#FEF3DC", color: "#D9920B" },
  Flagged: { bg: "#FDECEA", color: "#C0392B" },
  Pending: { bg: "#F0F0F0", color: "#888" },
};

const filterOptions: (Status | "All")[] = ["All", "Approved", "In Review", "Flagged", "Pending"];

export default function QADashboard() {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [filter, setFilter] = useState<Status | "All">("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  const approve = (id: number) => setModules((m) => m.map((mod) => mod.id === id ? { ...mod, status: "Approved", reviewer: "B. Musoni", met: mod.criteria } : mod));
  const flag = (id: number) => setModules((m) => m.map((mod) => mod.id === id ? { ...mod, status: "Flagged", reviewer: "B. Musoni" } : mod));
  const reset = () => setModules(initialModules);

  const visible = filter === "All" ? modules : modules.filter((m) => m.status === filter);
  const approved = modules.filter((m) => m.status === "Approved").length;
  const pct = Math.round((approved / modules.length) * 100);

  const circumference = 2 * Math.PI * 22;
  const dash = (pct / 100) * circumference;

  return (
    <div style={{ background: "#fafafa", padding: "18px", minHeight: 280 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#D9920B", letterSpacing: "0.10em", marginBottom: 2 }}>COURSE QA REVIEW</p>
          <p style={{ fontSize: 12, color: "#888" }}>Quality Matters Standard Audit</p>
        </div>
        <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
          <svg viewBox="0 0 52 52" style={{ width: 52, height: 52, transform: "rotate(-90deg)" }}>
            <circle cx="26" cy="26" r="22" fill="none" stroke="#EEF1EC" strokeWidth="5" />
            <circle cx="26" cy="26" r="22" fill="none" stroke="#D9920B" strokeWidth="5"
              strokeDasharray={`${dash} ${circumference}`}
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          </svg>
          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#16282B" }}>{pct}%</span>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`qa-filter-${f.replace(/\s+/g, '-').toLowerCase()}`}
            style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600,
              background: filter === f ? "#16282B" : "#EEF1EC",
              color: filter === f ? "white" : "#16282B",
              transition: "all 0.15s",
            }}
          >
            {f}
          </button>
        ))}
        <button onClick={reset} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid #CFD6CF", background: "white", color: "#888", cursor: "pointer", marginLeft: "auto" }}>
          Reset
        </button>
      </div>

      {/* Module rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {visible.map((mod) => (
          <div key={mod.id}>
            <div
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #EEF1EC", background: "white", cursor: "pointer" }}
              onClick={() => setExpanded(expanded === mod.id ? null : mod.id)}
            >
              {/* Progress bar micro */}
              <div style={{ width: 28, flexShrink: 0 }}>
                <div style={{ background: "#EEF1EC", borderRadius: 3, height: 5 }}>
                  <div style={{ width: `${(mod.met / mod.criteria) * 100}%`, height: "100%", background: statusColors[mod.status].color, borderRadius: 3, transition: "width 0.4s" }} />
                </div>
              </div>
              <span style={{ flex: 1, fontSize: 12, color: "#16282B", fontWeight: 500 }}>{mod.name}</span>
              <span style={{ fontSize: 11, color: "#888", flexShrink: 0, marginRight: 6 }}>{mod.met}/{mod.criteria}</span>
              <span style={{
                fontSize: 11, padding: "2px 9px", borderRadius: 20, fontWeight: 600, flexShrink: 0,
                background: statusColors[mod.status].bg, color: statusColors[mod.status].color,
              }}>
                {mod.status}
              </span>
            </div>

            {expanded === mod.id && (
              <div style={{ background: "#EEF1EC", borderRadius: "0 0 8px 8px", padding: "10px 12px", fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "#16282B", flex: 1 }}>Reviewer: {mod.reviewer} &nbsp;|&nbsp; Standards met: {mod.met}/{mod.criteria}</span>
                {mod.status !== "Approved" && (
                  <button onClick={() => approve(mod.id)} data-testid={`qa-approve-${mod.id}`} style={{ background: "#2E6E64", color: "white", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                    Approve
                  </button>
                )}
                {mod.status !== "Flagged" && (
                  <button onClick={() => flag(mod.id)} data-testid={`qa-flag-${mod.id}`} style={{ background: "#C0392B", color: "white", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                    Flag
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
