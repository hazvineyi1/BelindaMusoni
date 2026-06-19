import { useState } from "react";

type Metric = "completion" | "engagement" | "scores";

const cohortData = [
  { name: "Jordan T.", completion: 100, engagement: 92, score: 88, status: "Completed", lastActive: "Today", modules: [100, 100, 100, 100] },
  { name: "Alex R.", completion: 87, engagement: 78, score: 74, status: "On Track", lastActive: "Yesterday", modules: [100, 100, 100, 25] },
  { name: "Morgan K.", completion: 62, engagement: 45, score: 61, status: "At Risk", lastActive: "4 days ago", modules: [100, 100, 25, 0] },
  { name: "Sam L.", completion: 100, engagement: 88, score: 95, status: "Completed", lastActive: "Today", modules: [100, 100, 100, 100] },
  { name: "Casey W.", completion: 25, engagement: 22, score: 48, status: "At Risk", lastActive: "8 days ago", modules: [100, 0, 0, 0] },
  { name: "Riley M.", completion: 75, engagement: 81, score: 79, status: "On Track", lastActive: "2 days ago", modules: [100, 100, 100, 0] },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  Completed: { bg: "#E8F4F1", color: "#2E6E64" },
  "On Track": { bg: "#FEF3DC", color: "#D9920B" },
  "At Risk": { bg: "#FDECEA", color: "#C0392B" },
};

const metricLabels: Record<Metric, string> = {
  completion: "Completion %",
  engagement: "Engagement Score",
  scores: "Assessment Score",
};

const metricKey: Record<Metric, keyof typeof cohortData[0]> = {
  completion: "completion",
  engagement: "engagement",
  scores: "score",
};

export default function AnalyticsDashboard() {
  const [metric, setMetric] = useState<Metric>("completion");
  const [expanded, setExpanded] = useState<string | null>(null);

  const avg = Math.round(cohortData.reduce((a, d) => a + (d[metricKey[metric]] as number), 0) / cohortData.length);
  const atRisk = cohortData.filter((d) => d.status === "At Risk").length;
  const completed = cohortData.filter((d) => d.status === "Completed").length;

  return (
    <div style={{ background: "#fafafa", padding: "18px", minHeight: 280 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#D9920B", letterSpacing: "0.10em" }}>COHORT ANALYTICS</p>
          <p style={{ fontSize: 12, color: "#888" }}>AI Literacy Program, Cohort 3</p>
        </div>
        {/* Summary pills */}
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: "#E8F4F1", color: "#2E6E64", fontWeight: 600 }}>
            {completed} done
          </span>
          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: "#FDECEA", color: "#C0392B", fontWeight: 600 }}>
            {atRisk} at risk
          </span>
        </div>
      </div>

      {/* Metric toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {(["completion", "engagement", "scores"] as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            data-testid={`analytics-metric-${m}`}
            style={{
              fontSize: 11, padding: "4px 11px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600,
              background: metric === m ? "#16282B" : "#EEF1EC",
              color: metric === m ? "white" : "#16282B",
              transition: "all 0.15s",
            }}
          >
            {metricLabels[m]}
          </button>
        ))}
      </div>

      {/* Average bar */}
      <div style={{ marginBottom: 12, padding: "8px 12px", background: "#16282B", borderRadius: 9, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>Cohort avg</span>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 6 }}>
          <div style={{ width: `${avg}%`, height: "100%", background: "#D9920B", borderRadius: 4, transition: "width 0.5s" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0 }}>{avg}%</span>
      </div>

      {/* Learner rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {cohortData.map((d) => {
          const val = d[metricKey[metric]] as number;
          const isOpen = expanded === d.name;
          return (
            <div key={d.name}>
              <div
                onClick={() => setExpanded(isOpen ? null : d.name)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid #EEF1EC", background: "white", cursor: "pointer" }}
                data-testid={`analytics-learner-${d.name.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EEF1EC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#16282B", flexShrink: 0 }}>
                  {d.name[0]}
                </div>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "#16282B" }}>{d.name}</span>
                {/* Mini bar */}
                <div style={{ width: 60, background: "#EEF1EC", borderRadius: 3, height: 5 }}>
                  <div style={{ width: `${val}%`, height: "100%", background: val >= 80 ? "#2E6E64" : val >= 60 ? "#D9920B" : "#C0392B", borderRadius: 3, transition: "width 0.4s" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#16282B", width: 30, textAlign: "right" }}>{val}%</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, ...statusStyle[d.status] }}>
                  {d.status}
                </span>
              </div>

              {isOpen && (
                <div style={{ background: "#EEF1EC", borderRadius: "0 0 8px 8px", padding: "10px 12px", fontSize: 12 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "#888" }}>Last active: {d.lastActive}</span>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#2E6E64", marginBottom: 5, letterSpacing: "0.08em" }}>MODULE PROGRESS</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {d.modules.map((m, i) => (
                      <div key={i} style={{ flex: 1 }}>
                        <div style={{ background: "#CFD6CF", borderRadius: 3, height: 5 }}>
                          <div style={{ width: `${m}%`, height: "100%", background: m === 100 ? "#2E6E64" : m > 0 ? "#D9920B" : "transparent", borderRadius: 3 }} />
                        </div>
                        <p style={{ fontSize: 10, color: "#888", marginTop: 3, textAlign: "center" }}>M{i + 1}</p>
                      </div>
                    ))}
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
