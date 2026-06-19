import { useState } from "react";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";

type Slide = { type: "text" | "checklist" | "prompt"; heading: string; content: string; items?: string[] };
type Lesson = { title: string; duration: string; slides: Slide[] };
type Unit = { title: string; lessons: Lesson[] };

const course: Unit[] = [
  {
    title: "Unit 1: Foundations of Learning Design",
    lessons: [
      {
        title: "Why Most eLearning Fails",
        duration: "4 min",
        slides: [
          { type: "text", heading: "The click-next problem", content: "Most eLearning is a PDF that learned to click. Fifty screens of bullet points followed by a five-question quiz is not learning, it's information delivery theatre." },
          { type: "checklist", heading: "Signs your course has this problem", content: "", items: ["Learners skim every screen", "Quiz answers can be guessed without reading", "Completion rate is the only metric tracked", "Nobody talks about the course after launch"] },
          { type: "prompt", heading: "Reflect", content: "Think of a course you've taken recently. How much of the content do you actually remember? What did you DO with it?" },
        ],
      },
      {
        title: "Learning vs. Performance",
        duration: "5 min",
        slides: [
          { type: "text", heading: "The real goal is behavior change", content: "Learning objectives are a means to an end. The end is a person doing something differently or better in their actual work context. Design backward from that." },
          { type: "checklist", heading: "Performance-centered design starts with:", content: "", items: ["What will learners do, not what will they know?", "What does the environment look like when they apply it?", "What gets in the way of doing it today?", "How will we know if it worked?"] },
        ],
      },
    ],
  },
  {
    title: "Unit 2: Writing Learning Objectives",
    lessons: [
      {
        title: "Bloom's Taxonomy in Practice",
        duration: "6 min",
        slides: [
          { type: "text", heading: "Cognitive levels shape assessment design", content: "An objective at the 'remember' level should never be assessed with a complex case study. An objective at the 'evaluate' level should never be assessed with a true/false quiz. Match the verb to the assessment." },
          { type: "checklist", heading: "The ABCD formula", content: "", items: ["Audience: who is the learner?", "Behavior: what observable action?", "Condition: in what context?", "Degree: to what standard?"] },
        ],
      },
    ],
  },
];

export default function CoursePlayer() {
  const [unitIdx, setUnitIdx] = useState(0);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const unit = course[unitIdx];
  const lesson = unit.lessons[lessonIdx];
  const slide = lesson.slides[slideIdx];
  const lessonKey = `${unitIdx}-${lessonIdx}`;

  const isLast = slideIdx === lesson.slides.length - 1;

  const advance = () => {
    if (!isLast) {
      setSlideIdx((s) => s + 1);
      return;
    }
    setCompleted((c) => new Set([...c, lessonKey]));
    // Next lesson
    if (lessonIdx + 1 < unit.lessons.length) {
      setLessonIdx((l) => l + 1);
      setSlideIdx(0);
    } else if (unitIdx + 1 < course.length) {
      setUnitIdx((u) => u + 1);
      setLessonIdx(0);
      setSlideIdx(0);
    }
  };

  const goToLesson = (ui: number, li: number) => {
    const key = `${ui}-${li}`;
    if (ui > unitIdx || (ui === unitIdx && li > lessonIdx)) {
      const prevKey = `${ui === 0 ? 0 : ui}-${li === 0 ? 0 : li - 1}`;
      if (!completed.has(prevKey) && !(ui === 0 && li === 0)) return;
    }
    setUnitIdx(ui); setLessonIdx(li); setSlideIdx(0);
  };

  const totalLessons = course.reduce((a, u) => a + u.lessons.length, 0);
  const doneCount = completed.size;
  const pct = Math.round((doneCount / totalLessons) * 100);

  return (
    <div style={{ background: "#fafafa", display: "flex", minHeight: 280, maxHeight: 340, overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 170, borderRight: "1px solid #EEF1EC", background: "white", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid #EEF1EC" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#D9920B", letterSpacing: "0.10em", marginBottom: 4 }}>PROGRESS</p>
          <div style={{ background: "#EEF1EC", borderRadius: 3, height: 4, marginBottom: 3 }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "#2E6E64", borderRadius: 3 }} />
          </div>
          <p style={{ fontSize: 10, color: "#888" }}>{doneCount}/{totalLessons} lessons</p>
        </div>
        {course.map((u, ui) => (
          <div key={ui}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#16282B", padding: "8px 12px 4px", letterSpacing: "0.06em", lineHeight: 1.3 }}>{u.title}</p>
            {u.lessons.map((l, li) => {
              const key = `${ui}-${li}`;
              const isActive = ui === unitIdx && li === lessonIdx;
              const isDone = completed.has(key);
              const isLocked = (ui > 0 || li > 0) && !isDone && !isActive && !completed.has(`${ui}-${li - 1}`) && !completed.has(`${ui - 1}-${course[ui - 1]?.lessons.length - 1}`);
              return (
                <button
                  key={li}
                  onClick={() => goToLesson(ui, li)}
                  data-testid={`course-lesson-${ui}-${li}`}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: isActive ? "#EEF1EC" : "none", border: "none", cursor: isLocked ? "default" : "pointer", textAlign: "left" }}
                >
                  {isDone ? <CheckCircle size={12} style={{ color: "#2E6E64", flexShrink: 0 }} /> : isActive ? <PlayCircle size={12} style={{ color: "#D9920B", flexShrink: 0 }} /> : <Lock size={12} style={{ color: isLocked ? "#CFD6CF" : "#888", flexShrink: 0 }} />}
                  <span style={{ fontSize: 11, color: isLocked ? "#CFD6CF" : isActive ? "#16282B" : "#888", lineHeight: 1.3 }}>{l.title}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 10, color: "#D9920B", fontWeight: 600, letterSpacing: "0.10em", marginBottom: 2 }}>{lesson.title.toUpperCase()} · {lesson.duration}</p>
          <div style={{ display: "flex", gap: 4 }}>
            {lesson.slides.map((_, i) => <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= slideIdx ? "#D9920B" : "#EEF1EC" }} />)}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "#16282B", marginBottom: 10 }}>{slide.heading}</h3>
          {slide.type === "text" && <p style={{ fontSize: 13, color: "#16282B", lineHeight: 1.65 }}>{slide.content}</p>}
          {slide.type === "checklist" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {(slide.items ?? []).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#16282B" }}>
                  <span style={{ color: "#D9920B", marginTop: 1, flexShrink: 0 }}>&#8250;</span>
                  {item}
                </div>
              ))}
            </div>
          )}
          {slide.type === "prompt" && (
            <div style={{ background: "#EEF1EC", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #D9920B" }}>
              <p style={{ fontSize: 13, color: "#16282B", lineHeight: 1.65, fontStyle: "italic" }}>{slide.content}</p>
              <textarea placeholder="Type your reflection here..." rows={2} style={{ width: "100%", marginTop: 10, border: "1px solid #CFD6CF", borderRadius: 7, padding: "8px 10px", fontSize: 12, resize: "none", outline: "none", background: "white", boxSizing: "border-box" }} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: "1px solid #EEF1EC" }}>
          <button
            onClick={() => slideIdx > 0 && setSlideIdx((s) => s - 1)}
            disabled={slideIdx === 0}
            style={{ fontSize: 12, color: slideIdx === 0 ? "#CFD6CF" : "#888", background: "none", border: "none", cursor: slideIdx === 0 ? "default" : "pointer" }}
          >
            Back
          </button>
          <span style={{ fontSize: 11, color: "#888" }}>{slideIdx + 1} / {lesson.slides.length}</span>
          <button
            onClick={advance}
            data-testid="course-advance"
            style={{ background: "#D9920B", color: "white", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            {isLast ? "Complete Lesson" : "Continue"} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
