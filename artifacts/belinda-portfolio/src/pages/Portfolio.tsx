import { useState, useEffect, useRef } from "react";
import SocraticChat from "@/components/demos/SocraticChat";
import LeadershipSim from "@/components/demos/LeadershipSim";
import AdaptiveAssessment from "@/components/demos/AdaptiveAssessment";
import QADashboard from "@/components/demos/QADashboard";
import CurriculumBuilder from "@/components/demos/CurriculumBuilder";
import AnalyticsDashboard from "@/components/demos/AnalyticsDashboard";
import CoursePlayer from "@/components/demos/CoursePlayer";
import StoryboardEditor from "@/components/demos/StoryboardEditor";
import ObjectiveMapper from "@/components/demos/ObjectiveMapper";
import ELearningSlide from "@/components/demos/ELearningSlide";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Linkedin, Menu, X, ChevronDown, ChevronUp, ExternalLink, Mail } from "lucide-react";

// ─── Scroll Reveal Hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Counter Hook ──────────────────────────────────────────────────────────────
function useCounter(target: number, suffix = "", duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return { ref, display: `${value}${suffix}` };
}

// ─── Section Reveal Wrapper ────────────────────────────────────────────────────
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const links = [
    { label: "Services", id: "services" },
    { label: "Case Studies", id: "case-studies" },
    { label: "Work Examples", id: "work-examples" },
    { label: "Toolkit", id: "toolkit" },
    { label: "Approach", id: "approach" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.96)" : "white",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #CFD6CF",
      }}
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => scrollTo("hero")}
          className="font-fraunces text-xl font-semibold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B] rounded"
          style={{ color: "#16282B" }}
          data-testid="nav-wordmark"
        >
          Belinda Musoni<span style={{ color: "#D9920B" }}>.</span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="text-sm font-medium transition-colors hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B] rounded px-1"
              style={{ color: "#16282B" }}
              data-testid={`nav-link-${l.id}`}
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("contact")}
            className="text-sm font-semibold px-5 py-2 rounded-full transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B]"
            style={{ background: "#D9920B", color: "white" }}
            data-testid="nav-contact-btn"
          >
            Contact
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B]"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          data-testid="nav-hamburger"
        >
          {open ? <X size={22} style={{ color: "#16282B" }} /> : <Menu size={22} style={{ color: "#16282B" }} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t" style={{ borderColor: "#CFD6CF", background: "white" }}>
          <div className="px-6 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-sm font-medium text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B] rounded"
                style={{ color: "#16282B" }}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo("contact")}
              className="text-sm font-semibold px-5 py-2 rounded-full self-start"
              style={{ background: "#D9920B", color: "white" }}
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
const heroQuestions = [
  "What does success actually look like for your learners, not just for your LMS reports?",
  "Where is the gap between what you're teaching and what your learners are doing?",
  "What would change if your learning program were 10x more effective?",
  "Which assumptions about your learners have you never actually tested?",
  "If your current training disappeared tomorrow, what would your organization actually miss?",
];

function Hero() {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setQuestionIdx((i) => (i + 1) % heroQuestions.length);
        setFading(false);
      }, 350);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center pt-20 pb-16 px-6"
      style={{ background: "#EEF1EC" }}
    >
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: "#2E6E64", letterSpacing: "0.12em" }}
            data-testid="hero-eyebrow"
          >
            AI Learning Experience Architect, AI Product Builder, EdTech Consultant
          </p>
          <h1
            className="font-fraunces text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6"
            style={{ color: "#16282B" }}
            data-testid="hero-headline"
          >
            I build learning systems that{" "}
            <span className="shimmer-text">think with</span> the learner, not at them
          </h1>
          <p
            className="text-lg leading-relaxed mb-8"
            style={{ color: "#2E6E64", fontWeight: 400 }}
            data-testid="hero-subheading"
          >
            Quality Matters certified. Doctoral ML researcher. AI product builder who took a
            learning platform from concept to live production single-handedly: designing the
            architecture, writing the code, and shipping the product.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => scrollTo("work-examples")}
              className="px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B]"
              style={{ background: "#D9920B", color: "white" }}
              data-testid="hero-cta-work"
            >
              See My Work
            </button>
            <button
              onClick={() => scrollTo("case-studies")}
              className="px-6 py-3 rounded-full font-semibold text-sm transition-all hover:bg-[#16282B] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B]"
              style={{ border: "1.5px solid #16282B", color: "#16282B" }}
              data-testid="hero-cta-cases"
            >
              View Case Studies
            </button>
          </div>
        </div>

        {/* Right: Signature Card */}
        <div
          className="rounded-[14px] p-8 relative overflow-hidden"
          style={{ background: "#16282B", minHeight: 320 }}
          data-testid="hero-question-card"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: "#D9920B", letterSpacing: "0.12em" }}
          >
            The First Questions I Ask Every Client
          </p>
          <div
            className="font-fraunces text-xl md:text-2xl font-medium leading-snug transition-opacity duration-300"
            style={{
              color: "white",
              opacity: fading ? 0 : 1,
              minHeight: 120,
            }}
            data-testid="hero-question-text"
          >
            "{heroQuestions[questionIdx]}"
          </div>
          {/* Dot indicators */}
          <div className="flex gap-2 mt-8">
            {heroQuestions.map((_, i) => (
              <button
                key={i}
                onClick={() => setQuestionIdx(i)}
                aria-label={`Question ${i + 1}`}
                className="rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B]"
                style={{
                  width: i === questionIdx ? 24 : 8,
                  height: 8,
                  background: i === questionIdx ? "#D9920B" : "rgba(255,255,255,0.3)",
                }}
                data-testid={`hero-dot-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Metrics Strip ─────────────────────────────────────────────────────────────
function MetricsStrip() {
  const c1 = useCounter(30, "+");
  const c2 = useCounter(98, "%");
  const c3 = useCounter(20, "%");
  const c4 = useCounter(15, "+");

  const metrics = [
    { ref: c1.ref, display: c1.display, label: "Courses Designed" },
    { ref: c2.ref, display: c2.display, label: "On-Time Delivery" },
    { ref: c3.ref, display: c3.display, label: "Engagement Lift" },
    { ref: c4.ref, display: c4.display, label: "Years Experience" },
  ];

  return (
    <div
      className="border-y py-10 px-6"
      style={{ borderColor: "#CFD6CF", background: "white" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {metrics.map((m, i) => (
          <div key={i} className="text-center">
            <span
              ref={m.ref}
              className="counter-num block text-4xl md:text-5xl font-semibold"
              style={{ color: "#D9920B" }}
              data-testid={`metric-value-${i}`}
            >
              {m.display}
            </span>
            <span className="block text-sm mt-1" style={{ color: "#2E6E64" }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Marquee ───────────────────────────────────────────────────────────────────
const capabilities = [
  "AI Product Development",
  "Multi-Agent Orchestration",
  "Vibe Coding",
  "AI Learning Strategy",
  "Socratic Tutoring Systems",
  "Curriculum Architecture",
  "Quality Matters Certified",
  "LLM Prompt Engineering",
  "Game-Based Learning",
  "Learning Analytics",
  "Faculty AI Literacy",
  "WCAG and UDL Design",
];

function Marquee() {
  const items = [...capabilities, ...capabilities];
  return (
    <div
      className="marquee-container overflow-hidden py-4 border-b"
      style={{ borderColor: "#CFD6CF", background: "#EEF1EC" }}
      aria-label="Capabilities"
    >
      <div className="marquee-track flex gap-4 w-max">
        {items.map((cap, i) => (
          <span
            key={i}
            className="whitespace-nowrap text-sm font-medium px-4 py-1.5 rounded-full border"
            style={{
              color: "#16282B",
              borderColor: "#CFD6CF",
              background: "white",
            }}
          >
            {cap}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Services ──────────────────────────────────────────────────────────────────
const services = [
  {
    category: "Strategy",
    title: "AI Learning Strategy and Implementation",
    desc: "Translate AI capabilities into learning ecosystems that actually change behavior. Roadmapping, tool selection, and integration that fits your context, not a vendor's playbook.",
  },
  {
    category: "Design",
    title: "Curriculum and Course Architecture",
    desc: "End-to-end course design grounded in learning science: needs analysis, objectives mapping, content sequencing, and Quality Matters review, built for outcomes, not seat time.",
  },
  {
    category: "Build",
    title: "AI Product Development and Prototyping",
    desc: "Multi-agent system design, Socratic reasoning engines, branching simulations and adaptive assessment, built at startup speed through vibe coding. From concept to live product.",
  },
  {
    category: "Quality",
    title: "QA Systems and Course Review Automation",
    desc: "Automated review pipelines, rubric-driven QA dashboards, and systematic course auditing. Reproducible quality at scale without the bottleneck.",
  },
  {
    category: "Training",
    title: "Faculty Development and AI Literacy",
    desc: "Practical, research-grounded AI upskilling for educators. Not hype, not fear. Concrete skills for integrating AI into teaching, course design, and assessment.",
  },
  {
    category: "Research",
    title: "Learning Analytics and Research",
    desc: "Turning LMS data into insight. Engagement analysis, outcome measurement, and evidence-based iteration. Doctoral-level rigor applied to real institutional problems.",
  },
];

const categoryColors: Record<string, string> = {
  Strategy: "#D9920B",
  Design: "#2E6E64",
  Build: "#16282B",
  Quality: "#2E6E64",
  Training: "#D9920B",
  Research: "#16282B",
};

function Services() {
  const ref = useScrollReveal();
  return (
    <section id="services" className="py-24 px-6" style={{ background: "#EEF1EC" }}>
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className="reveal mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#D9920B", letterSpacing: "0.12em" }}>
            What I Do
          </p>
          <h2 className="font-fraunces text-3xl md:text-4xl font-semibold" style={{ color: "#16282B" }}>
            Services
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                className="rounded-[14px] p-7 h-full flex flex-col transition-shadow hover:shadow-md"
                style={{ background: "white", border: "1px solid #CFD6CF" }}
                data-testid={`service-card-${i}`}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-widest mb-4 self-start px-3 py-1 rounded-full"
                  style={{
                    background: categoryColors[s.category] + "18",
                    color: categoryColors[s.category],
                    letterSpacing: "0.10em",
                  }}
                >
                  {s.category}
                </span>
                <h3 className="font-fraunces text-lg font-semibold mb-3" style={{ color: "#16282B" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#2E6E64" }}>
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Case Studies ──────────────────────────────────────────────────────────────
const caseStudies = [
  {
    title: "AI Socratic Reasoning Platform",
    role: "Founder and AI Product Architect, Synops Advisory",
    narrative: "Built solo from whiteboard to live production. Designed a multi-agent architecture where specialized agents collaborate across content delivery, feedback generation, and learner reasoning analysis. The system guides learners through Socratic questioning rather than answer delivery.",
    bullets: [
      "Architecture: orchestrator agent coordinating four specialist agents (content, feedback, assessment, analytics)",
      "Shipped in under 4 months as a solo builder using vibe coding",
      "Live platform with real learners, not a prototype",
    ],
    stats: ["4-month build", "Solo build", "Live production", "Multi-agent"],
    pills: ["Multi-Agent Design", "Vibe Coding", "LLM Prompt Engineering", "AI Product Development"],
  },
  {
    title: "Quality Matters Course Redesign Initiative",
    role: "Lead Instructional Designer and QA Consultant",
    narrative: "Audited and redesigned a portfolio of 12 online courses against Quality Matters standards. Developed a systematic review framework that became a reusable QA playbook for the institution.",
    bullets: [
      "Redesigned 12 courses across 3 departments",
      "Built a QA rubric automation tool that cut review time by 40%",
      "Trained faculty reviewers using the new framework",
    ],
    stats: ["12 Courses", "40% Faster Reviews", "3 Departments"],
    pills: ["Quality Matters", "Curriculum Architecture", "QA Automation"],
  },
  {
    title: "Faculty AI Literacy Program",
    role: "Lead Instructional Designer and Curriculum Architect",
    narrative: "Designed and delivered a 6-week AI literacy program for 80+ faculty across a higher education institution. Grounded in practical use cases, not theory. Participants left with working AI integrations in their courses.",
    bullets: [
      "6-week cohort-based program, fully remote",
      "80+ faculty participants, 94% completion rate",
      "Practical outcome: every participant shipped at least one AI-enhanced learning activity",
    ],
    stats: ["80+ Faculty", "94% Completion", "6 Weeks"],
    pills: ["Faculty Development", "AI Literacy", "Curriculum Architecture", "Remote Delivery"],
  },
  {
    title: "Game-Based Leadership Simulation",
    role: "Instructional Designer and Developer",
    narrative: "Designed and built a branching leadership simulation for a corporate L&D team. Learners navigate realistic management scenarios with scored decisions and personalized debrief paths. Built in Articulate Storyline with custom JavaScript for adaptive scoring.",
    bullets: [
      "Branching scenario with 40+ decision nodes",
      "Adaptive debrief engine based on decision profile",
      "Reduced onboarding time for managers by 25%",
    ],
    stats: ["40+ Decision Nodes", "25% Faster Onboarding", "Custom JS Scoring"],
    pills: ["Game-Based Learning", "Branching Simulation", "Storyline 360", "Adaptive Assessment"],
  },
  {
    title: "LMS Migration and Learning Analytics Overhaul",
    role: "EdTech Consultant and Learning Analyst",
    narrative: "Led migration from Blackboard to Canvas for a mid-size institution. Rebuilt the reporting infrastructure using LMS data exports and custom dashboards. Delivered actionable engagement analytics to department heads for the first time.",
    bullets: [
      "Migrated 200+ course shells with zero data loss",
      "Built engagement dashboards in under 3 weeks",
      "Analytics adoption by 6 academic departments",
    ],
    stats: ["200+ Courses Migrated", "Zero Data Loss", "6 Departments"],
    pills: ["LMS Migration", "Learning Analytics", "Canvas", "Data Visualization"],
  },
  {
    title: "Adaptive Assessment Engine",
    role: "AI Product Builder and Instructional Designer",
    narrative: "Designed and prototyped an adaptive assessment engine that adjusts question difficulty and topic coverage in real time based on learner response patterns. Uses a lightweight LLM layer to generate contextual feedback.",
    bullets: [
      "Dynamic item selection based on learner performance model",
      "LLM-generated feedback tailored to each response",
      "Piloted with 300 learners across 2 institutions",
    ],
    stats: ["300 Learners", "2 Institutions", "Real-Time Adaptation"],
    pills: ["Adaptive Assessment", "LLM Integration", "AI Product Development"],
  },
];

function CaseStudies() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const titleRef = useScrollReveal();

  const toggle = (i: number) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="case-studies" className="py-24 px-6" style={{ background: "white" }}>
      <div className="max-w-6xl mx-auto">
        <div ref={titleRef} className="reveal mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#D9920B", letterSpacing: "0.12em" }}>
            Proof of Work
          </p>
          <h2 className="font-fraunces text-3xl md:text-4xl font-semibold" style={{ color: "#16282B" }}>
            Case Studies
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {caseStudies.map((cs, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                className="rounded-[14px] overflow-hidden transition-shadow"
                style={{ border: "1px solid #CFD6CF" }}
                data-testid={`case-study-${i}`}
              >
                <button
                  className="w-full flex items-center justify-between px-7 py-5 text-left hover:bg-[#EEF1EC] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B]"
                  onClick={() => toggle(i)}
                  aria-expanded={openIdx === i}
                  data-testid={`case-study-toggle-${i}`}
                >
                  <div>
                    <h3 className="font-fraunces text-lg font-semibold" style={{ color: "#16282B" }}>
                      {cs.title}
                    </h3>
                    <p className="text-sm mt-0.5" style={{ color: "#2E6E64" }}>
                      {cs.role}
                    </p>
                  </div>
                  <span style={{ color: "#D9920B", flexShrink: 0, marginLeft: 16 }}>
                    {openIdx === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                </button>

                {openIdx === i && (
                  <div
                    className="px-7 pb-7 grid grid-cols-1 md:grid-cols-3 gap-8 border-t"
                    style={{ borderColor: "#CFD6CF" }}
                  >
                    {/* Narrative */}
                    <div className="md:col-span-2 pt-6">
                      <p className="text-sm leading-relaxed mb-4" style={{ color: "#16282B" }}>
                        {cs.narrative}
                      </p>
                      <ul className="space-y-2">
                        {cs.bullets.map((b, j) => (
                          <li key={j} className="flex gap-2 text-sm" style={{ color: "#16282B" }}>
                            <span style={{ color: "#D9920B", flexShrink: 0, marginTop: 2 }}>&#8250;</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Stats sidebar */}
                    <div className="pt-6">
                      <div
                        className="rounded-[10px] p-5 mb-4"
                        style={{ background: "#EEF1EC", border: "1px solid #CFD6CF" }}
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#D9920B", letterSpacing: "0.10em" }}>
                          By the Numbers
                        </p>
                        <div className="space-y-2">
                          {cs.stats.map((s, j) => (
                            <div
                              key={j}
                              className="text-sm font-medium"
                              style={{ color: "#16282B" }}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cs.pills.map((p, j) => (
                          <span
                            key={j}
                            className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{ background: "#16282B", color: "white" }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Work Examples ─────────────────────────────────────────────────────────────
type Demo = {
  id: string;
  label: string;
  url: string;
  tag: string;
  description: string;
  component: React.ReactNode;
};

function BrowserMock({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="browser-mock" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #CFD6CF", boxShadow: "0 4px 24px rgba(22,40,43,0.10)" }}>
      <div className="browser-bar">
        <div className="dot" style={{ background: "#FF5F57" }} />
        <div className="dot" style={{ background: "#FFBD2E" }} />
        <div className="dot" style={{ background: "#28C840" }} />
        <div className="url-bar">{url}</div>
      </div>
      {children}
    </div>
  );
}

const tagColors: Record<string, string> = {
  "AI Product": "#D9920B",
  "Simulation": "#2E6E64",
  "Assessment": "#2E6E64",
  "Automation": "#16282B",
  "Learning Analytics": "#16282B",
  "Course Design": "#D9920B",
};

type DemoConfig = {
  num: string;
  tag: string;
  title: string;
  description: string;
  url: string;
  component: React.ReactNode;
};

function DemoCard({ demo, index }: { demo: DemoConfig; index: number }) {
  const ref = useScrollReveal();
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${index * 50}ms` }}>
      <div
        className="rounded-[14px] overflow-hidden"
        style={{ border: "1px solid #CFD6CF", background: "white", boxShadow: "0 2px 16px rgba(22,40,43,0.07)" }}
        data-testid={`demo-card-${demo.num}`}
      >
        {/* Card header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-7 py-5 border-b"
          style={{
            borderColor: "#EEF1EC",
            background: isEven ? "#16282B" : "white",
          }}
        >
          <div className="flex items-center gap-4">
            <span
              className="font-fraunces text-3xl font-semibold leading-none"
              style={{ color: isEven ? "rgba(255,255,255,0.12)" : "#EEF1EC" }}
            >
              {demo.num}
            </span>
            <div>
              <h3
                className="font-fraunces text-lg font-semibold"
                style={{ color: isEven ? "white" : "#16282B" }}
              >
                {demo.title}
              </h3>
            </div>
          </div>
          <p
            className="text-sm leading-relaxed sm:max-w-xs sm:text-right"
            style={{ color: isEven ? "rgba(255,255,255,0.6)" : "#2E6E64" }}
          >
            {demo.description}
          </p>
        </div>

        <div style={{ borderTop: "1px solid #EEF1EC" }}>
          {demo.component}
        </div>
      </div>
    </div>
  );
}

function WorkExamples() {
  const titleRef = useScrollReveal();

  const demos: DemoConfig[] = [
    {
      num: "01",
      tag: "AI Product",
      title: "Socratic Reasoning Engine",
      description: "Pick a topic. Type your thinking. The system responds only with questions, never answers.",
      url: "synops.ai/tutor",
      component: <SocraticChat />,
    },
    {
      num: "02",
      tag: "Simulation",
      title: "Leadership Decision Simulation",
      description: "Three real management scenarios, scored choices, and a full debrief at the end.",
      url: "synops.ai/sim",
      component: <LeadershipSim />,
    },
    {
      num: "03",
      tag: "Assessment",
      title: "Adaptive Assessment Engine",
      description: "Five questions that change difficulty live based on each answer you give.",
      url: "synops.ai/assess",
      component: <AdaptiveAssessment />,
    },
    {
      num: "04",
      tag: "Automation",
      title: "Course QA Review Dashboard",
      description: "Filter by status, expand any module, and approve or flag it. The progress ring updates live.",
      url: "internal.qms/review",
      component: <QADashboard />,
    },
    {
      num: "05",
      tag: "AI Product",
      title: "AI Curriculum Builder",
      description: "Type a learning topic and get a full structured curriculum with objectives, activities, and assessments.",
      url: "synops.ai/build",
      component: <CurriculumBuilder />,
    },
    {
      num: "06",
      tag: "Learning Analytics",
      title: "Cohort Analytics Dashboard",
      description: "Toggle between metrics, click any learner to expand their module-level progress.",
      url: "synops.ai/analytics",
      component: <AnalyticsDashboard />,
    },
    {
      num: "07",
      tag: "Course Design",
      title: "Interactive Course Player",
      description: "A fully playable micro-course. Navigate lessons, complete slides, and track your progress.",
      url: "synops.ai/learn",
      component: <CoursePlayer />,
    },
    {
      num: "08",
      tag: "Instructional Design",
      title: "Course Storyboard",
      description: "A live storyboard for a 6-slide AI literacy module. Click any slide, edit narration and dev notes directly.",
      url: "synops.ai/storyboard",
      component: <StoryboardEditor />,
    },
    {
      num: "09",
      tag: "Instructional Design",
      title: "Learning Objective Mapper",
      description: "Six objectives mapped to Bloom's levels, assessments, and activities. Click the Bloom badge to cycle levels.",
      url: "synops.ai/objectives",
      component: <ObjectiveMapper />,
    },
    {
      num: "10",
      tag: "Instructional Design",
      title: "eLearning Slide Samples",
      description: "Three interactive slide types: tabbed content, a branching scenario, and a progressive reveal. Navigate through them.",
      url: "synops.ai/slides",
      component: <ELearningSlide />,
    },
  ];

  return (
    <section id="work-examples" className="py-24 px-6" style={{ background: "#EEF1EC" }}>
      <div className="max-w-4xl mx-auto">
        <div ref={titleRef} className="reveal mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#D9920B", letterSpacing: "0.12em" }}>
            Live Demos, Not Screenshots
          </p>
          <h2 className="font-fraunces text-3xl md:text-4xl font-semibold" style={{ color: "#16282B" }}>
            Work Examples
          </h2>
          <p className="mt-3 text-base" style={{ color: "#2E6E64", maxWidth: 520 }}>
            Every example below is fully interactive. Scroll through and use them.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {demos.map((demo, i) => (
            <DemoCard key={demo.num} demo={demo} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Toolkit ───────────────────────────────────────────────────────────────────
const toolkitItems = [
  { name: "Canvas", cat: "LMS" },
  { name: "Blackboard", cat: "LMS" },
  { name: "Moodle", cat: "LMS" },
  { name: "Brightspace/D2L", cat: "LMS" },
  { name: "Claude", cat: "AI and LLM" },
  { name: "ChatGPT", cat: "AI and LLM" },
  { name: "Microsoft Copilot", cat: "AI and LLM" },
  { name: "Custom LLM API Integrations", cat: "AI and LLM" },
  { name: "Multi-Agent Orchestration", cat: "AI and LLM" },
  { name: "GitHub Copilot", cat: "AI and LLM" },
  { name: "Cursor", cat: "AI and LLM" },
  { name: "Bolt.new", cat: "AI and LLM" },
  { name: "Articulate Storyline 360", cat: "Authoring" },
  { name: "Rise 360", cat: "Authoring" },
  { name: "Adobe Captivate", cat: "Authoring" },
  { name: "Camtasia", cat: "Authoring" },
  { name: "Vyond", cat: "Authoring" },
  { name: "Adobe Creative Suite", cat: "Authoring" },
  { name: "Canva", cat: "Authoring" },
  { name: "Zapier", cat: "Automation" },
  { name: "Make", cat: "Automation" },
  { name: "API Pipelines", cat: "Automation" },
  { name: "Airtable Automations", cat: "Automation" },
  { name: "Notion", cat: "Project and Collab" },
  { name: "Asana", cat: "Project and Collab" },
  { name: "Trello", cat: "Project and Collab" },
  { name: "Slack", cat: "Project and Collab" },
  { name: "Microsoft Teams", cat: "Project and Collab" },
  { name: "Google Workspace", cat: "Project and Collab" },
  { name: "Quality Matters", cat: "Standards" },
  { name: "WCAG 2.1", cat: "Standards" },
  { name: "UDL Guidelines", cat: "Standards" },
  { name: "SCORM/xAPI", cat: "Standards" },
];

const filters = ["All", "LMS", "AI and LLM", "Authoring", "Automation", "Project and Collab", "Standards"];

function Toolkit() {
  const [active, setActive] = useState("All");
  const titleRef = useScrollReveal();

  const visible = active === "All" ? toolkitItems : toolkitItems.filter((t) => t.cat === active);

  return (
    <section id="toolkit" className="py-24 px-6" style={{ background: "white" }}>
      <div className="max-w-6xl mx-auto">
        <div ref={titleRef} className="reveal mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#D9920B", letterSpacing: "0.12em" }}>
            Tools of the Trade
          </p>
          <h2 className="font-fraunces text-3xl md:text-4xl font-semibold" style={{ color: "#16282B" }}>
            Toolkit
          </h2>
        </div>
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className="text-sm px-4 py-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B]"
              style={{
                background: active === f ? "#D9920B" : "#EEF1EC",
                color: active === f ? "white" : "#16282B",
                border: `1px solid ${active === f ? "#D9920B" : "#CFD6CF"}`,
                fontWeight: active === f ? 600 : 400,
              }}
              data-testid={`toolkit-filter-${f.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {f}
            </button>
          ))}
        </div>
        {/* Tag grid */}
        <div className="flex flex-wrap gap-3">
          {visible.map((t, i) => (
            <span
              key={`${t.name}-${i}`}
              className="text-sm px-4 py-2 rounded-full font-medium transition-all"
              style={{
                border: "1px solid #CFD6CF",
                color: "#16282B",
                background: "white",
              }}
              data-testid={`toolkit-tag-${t.name.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Approach ──────────────────────────────────────────────────────────────────
const steps = [
  {
    num: "01",
    title: "Diagnose",
    desc: "Understand the actual gap between current learning and desired performance. Stakeholder interviews, learner research, and system analysis before a single slide is made.",
  },
  {
    num: "02",
    title: "Design",
    desc: "Architecture before aesthetics. Map objectives to outcomes, sequence content for cognitive load, and build the assessment strategy before content creation begins.",
  },
  {
    num: "03",
    title: "Build and Pilot",
    desc: "Rapid prototyping with real learners in the loop. Iterative builds, feedback cycles, and data-informed refinement. Shipping speed without sacrificing rigor.",
  },
  {
    num: "04",
    title: "Measure and Hand Off",
    desc: "Analytics setup, success metric definition, and a hand-off package your team can actually use. Learning doesn't end at launch.",
  },
];

function Approach() {
  const titleRef = useScrollReveal();
  return (
    <section id="approach" className="py-24 px-6" style={{ background: "#EEF1EC" }}>
      <div className="max-w-6xl mx-auto">
        <div ref={titleRef} className="reveal mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#D9920B", letterSpacing: "0.12em" }}>
            How It Works
          </p>
          <h2 className="font-fraunces text-3xl md:text-4xl font-semibold" style={{ color: "#16282B" }}>
            The Approach
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                className="rounded-[14px] p-7 h-full relative overflow-hidden transition-shadow hover:shadow-md"
                style={{ background: "white", border: "1px solid #CFD6CF" }}
                data-testid={`approach-step-${i}`}
              >
                <div
                  className="font-fraunces text-6xl font-semibold leading-none mb-4"
                  style={{ color: "#EEF1EC" }}
                >
                  {s.num}
                </div>
                <h3 className="font-fraunces text-xl font-semibold mb-3" style={{ color: "#16282B" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#2E6E64" }}>
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Credentials ───────────────────────────────────────────────────────────────
const credentials = [
  {
    title: "PhD in Machine Learning (in progress)",
    sub: "Research focus: AI systems for education and adaptive learning",
    icon: "PhD",
  },
  {
    title: "M.Ed. E-Learning and Instructional Design",
    sub: "Northeastern University",
    icon: "MEd",
  },
  {
    title: "Quality Matters Certified",
    sub: "Course Design and Peer Review",
    icon: "QM",
  },
  {
    title: "Professional Memberships",
    sub: "AECT (Association for Educational Communications and Technology), ISTE (International Society for Technology in Education)",
    icon: "AECT",
  },
];

function Credentials() {
  const titleRef = useScrollReveal();
  return (
    <section className="py-24 px-6" style={{ background: "white" }}>
      <div className="max-w-6xl mx-auto">
        <div ref={titleRef} className="reveal mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#D9920B", letterSpacing: "0.12em" }}>
            Background
          </p>
          <h2 className="font-fraunces text-3xl md:text-4xl font-semibold" style={{ color: "#16282B" }}>
            Credentials
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {credentials.map((c, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                className="rounded-[14px] p-7 flex gap-5 transition-shadow hover:shadow-sm"
                style={{ border: "1px solid #CFD6CF" }}
                data-testid={`credential-${i}`}
              >
                <div
                  className="rounded-xl flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{
                    width: 52,
                    height: 52,
                    background: "#EEF1EC",
                    color: "#2E6E64",
                    border: "1px solid #CFD6CF",
                    fontFamily: "'Fraunces', serif",
                    fontSize: 11,
                  }}
                >
                  {c.icon}
                </div>
                <div>
                  <h3 className="font-fraunces text-base font-semibold mb-1" style={{ color: "#16282B" }}>
                    {c.title}
                  </h3>
                  <p className="text-sm" style={{ color: "#2E6E64" }}>
                    {c.sub}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ───────────────────────────────────────────────────────────────────
const timezones = [
  { city: "Dallas", tz: "America/Chicago" },
  { city: "New York", tz: "America/New_York" },
  { city: "London", tz: "Europe/London" },
  { city: "Dubai", tz: "Asia/Dubai" },
  { city: "Singapore", tz: "Asia/Singapore" },
  { city: "Sydney", tz: "Australia/Sydney" },
];

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

function Contact() {
  const { toast } = useToast();
  const [tzIdx, setTzIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const tz = timezones[tzIdx];
      const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: tz.tz,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime(`${tz.city}: ${fmt.format(new Date())}`);
    };
    updateTime();
    const tick = setInterval(updateTime, 1000);
    return () => clearInterval(tick);
  }, [tzIdx]);

  useEffect(() => {
    const cycle = setInterval(() => {
      setTzIdx((i) => (i + 1) % timezones.length);
    }, 3000);
    return () => clearInterval(cycle);
  }, []);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = (_data: ContactForm) => {
    toast({ title: "Message sent", description: "Thank you. I'll be in touch shortly." });
    form.reset();
  };

  const titleRef = useScrollReveal();

  return (
    <section id="contact" className="py-24 px-6" style={{ background: "#EEF1EC" }}>
      <div className="max-w-6xl mx-auto">
        <div ref={titleRef} className="reveal mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#D9920B", letterSpacing: "0.12em" }}>
            Get in Touch
          </p>
          <h2 className="font-fraunces text-3xl md:text-4xl font-semibold" style={{ color: "#16282B" }}>
            Contact
          </h2>
        </div>
        <Reveal>
          <div
            className="rounded-[14px] overflow-hidden grid grid-cols-1 md:grid-cols-2"
            style={{ border: "1px solid #CFD6CF", boxShadow: "0 8px 32px rgba(22,40,43,0.10)" }}
          >
            {/* Left — dark ambient */}
            <div className="ambient-bg p-10 flex flex-col justify-between" style={{ minHeight: 380 }}>
              <div>
                <h3 className="font-fraunces text-2xl font-semibold text-white mb-6">
                  Let's Build Something That Actually Works
                </h3>
                <div className="space-y-5">
                  <a
                    href="mailto:hazvimusoni@gmail.com"
                    className="flex items-center gap-3 text-sm text-white hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B] rounded"
                    data-testid="contact-email"
                  >
                    <Mail size={18} style={{ color: "#D9920B" }} />
                    hazvimusoni@gmail.com
                  </a>
                  <a
                    href="https://www.linkedin.com/in/belinda-musoni-80b460183"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-white hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B] rounded"
                    data-testid="contact-linkedin"
                  >
                    <Linkedin size={18} style={{ color: "#D9920B" }} />
                    linkedin.com/in/belinda-musoni
                    <ExternalLink size={13} style={{ opacity: 0.6 }} />
                  </a>
                </div>
              </div>
              <div
                className="mt-8 px-4 py-3 rounded-lg text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.9)", borderLeft: "3px solid #D9920B" }}
                data-testid="contact-clock"
              >
                {currentTime}
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-white p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" data-testid="contact-form">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "#16282B" }}>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "#16282B" }}>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "#16282B" }}>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-subject">
                              <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ai-learning-strategy">AI Learning Strategy</SelectItem>
                            <SelectItem value="curriculum-design">Curriculum Design</SelectItem>
                            <SelectItem value="ai-product-development">AI Product Development</SelectItem>
                            <SelectItem value="qa-review">QA and Review</SelectItem>
                            <SelectItem value="faculty-development">Faculty Development</SelectItem>
                            <SelectItem value="general-inquiry">General Inquiry</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "#16282B" }}>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell me about your project or challenge..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B]"
                    style={{ background: "#D9920B", color: "white" }}
                    data-testid="button-submit"
                  >
                    Send Message
                  </button>
                </form>
              </Form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="py-10 px-6 border-t"
      style={{ background: "#16282B", borderColor: "#1D4A43" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-fraunces text-lg font-semibold" style={{ color: "white" }}>
            Belinda Musoni<span style={{ color: "#D9920B" }}>.</span>
          </p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            2026 Belinda Musoni, Synops Advisory
          </p>
        </div>
        <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.6)" }}>
          Learning design, grounded in evidence. Delivered worldwide.
        </p>
        <a
          href="https://www.linkedin.com/in/belinda-musoni-80b460183"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9920B]"
          aria-label="LinkedIn"
          data-testid="footer-linkedin"
        >
          <Linkedin size={20} style={{ color: "white" }} />
        </a>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  return (
    <div style={{ fontFamily: "'Archivo', sans-serif" }}>
      <Nav />
      <Hero />
      <MetricsStrip />
      <Marquee />
      <Services />
      <CaseStudies />
      <WorkExamples />
      <Toolkit />
      <Approach />
      <Credentials />
      <Contact />
      <Footer />
    </div>
  );
}
