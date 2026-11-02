"use client";

import { FormEvent, useEffect, useState } from "react";

type Student = {
  id: string;
  name: string;
  email: string;
  branch: string;
  year: number;
  team: string;
  reason: string;
  createdAt?: string;
};

type ApiResult = {
  success: boolean;
  message?: string;
  token?: string;
  student?: Student;
};

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const branches = [
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Metallurgical and Materials Engineering",
  "Biotechnology and Medical Engineering",
];

const teamData = {
  "Web Dev": {
    name: "Web Development",
    tagline: "Building resilient web applications, design systems, and backend platforms.",
    number: "01",
    techStack: ["Next.js", "React 19", "Node.js", "TypeScript", "Tailwind CSS", "MongoDB", "Express", "REST APIs"],
    projects: [
      {
        title: "Campus Hub & Events Portal",
        desc: "A centralized real-time platform serving 5,000+ students for event registrations and club updates.",
      },
      {
        title: "Club Recruitment Engine",
        desc: "The very portal you are exploring right now, designed for speed, security, and fluid usability.",
      },
      {
        title: "Open Source Resource Index",
        desc: "Curated student roadmaps, exam archives, and project starter kits built by members.",
      },
    ],
    lookingFor: [
      "Curiosity to learn modern frontend and backend web frameworks.",
      "Understanding of HTML, CSS, JavaScript or TypeScript basics.",
      "Eagerness to solve real student problems through clean, functional design.",
    ],
  },
  "AI/ML": {
    name: "Artificial Intelligence & ML",
    tagline: "Exploring neural architectures, LLMs, computer vision, and applied intelligence.",
    number: "02",
    techStack: ["Python", "PyTorch", "Transformers", "LangChain", "OpenCV", "FastAPI", "Scikit-Learn", "HuggingFace"],
    projects: [
      {
        title: "Campus AI Research & Query Assistant",
        desc: "Context-aware conversational assistant trained on campus regulations, syllabi, and FAQs.",
      },
      {
        title: "Smart Document & ID Parser",
        desc: "Computer vision pipeline that digitizes handwritten notes and student submissions with high accuracy.",
      },
      {
        title: "Predictive Academic Scheduler",
        desc: "Optimizes study schedules and predicts exam bottlenecks using workload modeling.",
      },
    ],
    lookingFor: [
      "Interest in machine learning, mathematics, or data modeling.",
      "Basic familiarity with Python or numerical computing concepts.",
      "Curiosity about generative AI, computer vision, or NLP advancements.",
    ],
  },
};

const faqItems = [
  {
    q: "Do I need previous coding experience to join?",
    a: "Not at all. We value curiosity, problem-solving mindset, and consistency over an exhaustive resume. Our onboarding program pairs you with experienced seniors who guide you through hands-on bootcamps.",
  },
  {
    q: "Can first-year students apply?",
    a: "Absolutely! 1st and 2nd year students form the heartbeat of our recruitment drive. Joining early gives you the best opportunity to build impactful projects throughout your college journey.",
  },
  {
    q: "How does the interview and recruitment timeline work?",
    a: "After you submit your application online, our core team reviews your response within 48–72 hours. Shortlisted applicants are invited for an informal technical and behavioral conversation where you can talk about your interests.",
  },
  {
    q: "Can I collaborate across both Web Dev and AI/ML teams?",
    a: "Yes! While you pick a primary domain to focus your core mentorship, many of our flagship projects (such as intelligent web apps and AI-powered portals) feature cross-functional collaboration between both teams.",
  },
  {
    q: "What is the expected weekly time commitment?",
    a: "Members typically invest 3–5 hours per week for team syncs, hack sessions, and project sprints. We are mindful of exam schedules and project deadlines so college academics always take priority.",
  },
];

async function apiRequest(path: string, options: RequestInit = {}): Promise<ApiResult> {
  const token = typeof window !== "undefined" ? localStorage.getItem("club_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Primary URL attempt
  let activeUrl = DEFAULT_API_URL;
  try {
    const res = await fetch(`${activeUrl}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
    const data = (await res.json()) as ApiResult;
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  } catch (err: any) {
    // If primary failed due to network / wrong port, attempt fallback to port 5000 if different
    if (activeUrl.includes(":5001")) {
      const fallbackUrl = activeUrl.replace(":5001", ":5000");
      try {
        const fallbackRes = await fetch(`${fallbackUrl}${path}`, {
          ...options,
          credentials: "include",
          headers,
        });
        const fallbackData = (await fallbackRes.json()) as ApiResult;
        if (fallbackRes.ok && fallbackData.success) {
          return fallbackData;
        }
      } catch {
        // Fallback also failed, bubble original error
      }
    }
    throw err;
  }
}

export default function Home() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  // Interactive Form State
  const [selectedTeam, setSelectedTeam] = useState<"Web Dev" | "AI/ML">("Web Dev");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedYear, setSelectedYear] = useState("1");
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  // Interactive Modals and Views
  const [activeTeamModal, setActiveTeamModal] = useState<"Web Dev" | "AI/ML" | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Theme State
  const [currentTheme, setCurrentTheme] = useState<"midnight" | "violet" | "light">("midnight");

  useEffect(() => {
    const saved = (localStorage.getItem("club_theme") as "midnight" | "violet" | "light") || "midnight";
    setCurrentTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function switchTheme(newTheme: "midnight" | "violet" | "light") {
    setCurrentTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("club_theme", newTheme);
    const names = {
      midnight: "Midnight Tech (Dark)",
      violet: "Cyber Violet (Futurist)",
      light: "Minimal Studio (Light)",
    };
    showToast(`Theme changed to ${names[newTheme]} ✨`);
  }

  // Backend Health State
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [backendLatency, setBackendLatency] = useState<number | null>(null);

  // Calculate Password Strength (0-4)
  const calculateStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const passwordStrength = calculateStrength(password);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return { label: "Weak (needs 8+ chars & numbers)", class: "weak" };
      case 2:
        return { label: "Fair", class: "fair" };
      case 3:
        return { label: "Good", class: "good" };
      case 4:
        return { label: "Strong & secure", class: "strong" };
      default:
        return { label: "", class: "" };
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Check Backend Connectivity
  async function checkBackend() {
    setBackendStatus("checking");
    const start = performance.now();
    try {
      const res = await apiRequest("/health");
      const latency = Math.round(performance.now() - start);
      if (res.success) {
        setBackendStatus("connected");
        setBackendLatency(latency);
      } else {
        setBackendStatus("disconnected");
      }
    } catch {
      setBackendStatus("disconnected");
      setBackendLatency(null);
    }
  }

  // Initial Load: Check Auth & Backend Health
  useEffect(() => {
    checkBackend();

    apiRequest("/auth/me")
      .then((result) => {
        if (result.student) {
          setStudent(result.student);
        }
      })
      .catch(() => {
        // Not logged in or expired token
      })
      .finally(() => setLoading(false));
  }, []);

  // Form Submit Handler
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    if (mode === "register") {
      if (password.length < 8) {
        setMessage("Password must be at least 8 characters long.");
        setMessageType("error");
        setSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        setMessageType("error");
        setSubmitting(false);
        return;
      }
      if (reason.trim().length < 20) {
        setMessage("Please provide at least 20 characters for Why CLUB.");
        setMessageType("error");
        setSubmitting(false);
        return;
      }
    }

    try {
      const payload =
        mode === "register"
          ? {
              name: studentName.trim(),
              email: studentEmail.trim().toLowerCase(),
              branch: selectedBranch,
              year: Number(selectedYear),
              team: selectedTeam,
              reason: reason.trim(),
              password,
              confirmPassword,
            }
          : {
              email: studentEmail.trim().toLowerCase(),
              password,
            };

      const result = await apiRequest(`/auth/${mode === "register" ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (result.token) {
        localStorage.setItem("club_token", result.token);
      }

      setStudent(result.student || null);
      setMessageType("success");
      setMessage(
        mode === "register"
          ? "Your application has been successfully submitted!"
          : "Welcome back to your recruitment portal."
      );
      showToast(mode === "register" ? "Application received! 🎉" : "Signed in successfully!");
      setBackendStatus("connected");
    } catch (error: any) {
      setMessageType("error");
      setMessage(error?.message || "Unable to connect to the backend server. Please verify it is running.");
    } finally {
      setSubmitting(false);
    }
  }

  // Logout Handler
  async function handleLogout() {
    try {
      await apiRequest("/auth/logout", { method: "POST", body: "{}" });
    } catch {
      // Local clean-up
    }
    localStorage.removeItem("club_token");
    setStudent(null);
    setPassword("");
    setConfirmPassword("");
    setMessageType("success");
    setMessage("You have been signed out successfully.");
    setMode("login");
    showToast("Signed out.");
  }

  // Insert Prompt Helper
  function appendPrompt(text: string) {
    setReason((prev) => (prev ? `${prev.trim()} ${text}` : text));
  }

  // Select Team from Modal
  function handleSelectTeamAndApply(teamName: "Web Dev" | "AI/ML") {
    setSelectedTeam(teamName);
    setMode("register");
    setActiveTeamModal(null);
    showToast(`Selected ${teamName}! Fill out the form below.`);
    const el = document.getElementById("apply");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Copy Application ID
  function copyApplicationId() {
    if (student?.id) {
      navigator.clipboard.writeText(student.id);
      showToast("Application ID copied to clipboard! 📋");
    }
  }

  // Download Application Slip
  function downloadApplicationSlip() {
    if (!student) return;
    const slip = `================================================
CLUB RECRUITMENT APPLICATION CONFIRMATION
================================================
Application ID : ${student.id}
Applicant Name : ${student.name}
Email Address  : ${student.email}
Domain / Team  : ${student.team}
Year of Study  : Year ${student.year}
Department     : ${student.branch}
Date Submitted : ${student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "2026-27 Session"}
Status         : Under Active Review

APPLICATION STATEMENT:
${student.reason}
================================================
Questions? Reach us at hello@axiom.club
================================================`;

    const blob = new Blob([slip], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CLUB_Application_${student.name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Application receipt downloaded! 📄");
  }

  if (loading) {
    return (
      <main className="loading-screen">
        <span className="loader" />
        <div>Connecting to CLUB Recruitment Portal…</div>
      </main>
    );
  }

  return (
    <main className="site-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice" role="alert">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Team Details Interactive Modal */}
      {activeTeamModal && (
        <div className="modal-overlay" onClick={() => setActiveTeamModal(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setActiveTeamModal(null)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="modal-tag">TEAM {teamData[activeTeamModal].number} / DOMAIN BRIEF</div>
            <h2 className="modal-title">{teamData[activeTeamModal].name}</h2>
            <p className="modal-desc">{teamData[activeTeamModal].tagline}</p>

            <div className="modal-section-title">Core Technologies & Tools</div>
            <div className="tech-pill-list">
              {teamData[activeTeamModal].techStack.map((tech) => (
                <span key={tech} className="tech-pill">
                  {tech}
                </span>
              ))}
            </div>

            <div className="modal-section-title">Current & Upcoming Projects</div>
            {teamData[activeTeamModal].projects.map((proj) => (
              <div key={proj.title} className="project-card-mini">
                <strong>{proj.title}</strong>
                <p>{proj.desc}</p>
              </div>
            ))}

            <div className="modal-section-title">What We Value In Candidates</div>
            <ul style={{ paddingLeft: "18px", fontSize: "12px", color: "#5a6860", lineHeight: "1.7", margin: "0 0 20px" }}>
              {teamData[activeTeamModal].lookingFor.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <div className="modal-actions">
              <button
                className="btn-primary-modal"
                onClick={() => handleSelectTeamAndApply(activeTeamModal)}
              >
                Apply for {teamData[activeTeamModal].name} <span>↗</span>
              </button>
              <button className="btn-secondary-modal" onClick={() => setActiveTeamModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topbar Navigation */}
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CLUB home">
          <span className="brand-mark">C</span>
          <span>
            CLUB<span className="brand-dot">.</span>
          </span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#about">About us</a>
          <a href="#teams">Teams</a>
          <a href="#apply">Recruitment</a>
          <a href="#faq">FAQ</a>
        </nav>

        {/* Live Controls: Theme Switcher & Backend Health */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Theme Selector Toggle */}
          <button
            className="theme-switch-btn"
            onClick={() => {
              const nextTheme =
                currentTheme === "midnight"
                  ? "violet"
                  : currentTheme === "violet"
                  ? "light"
                  : "midnight";
              switchTheme(nextTheme);
            }}
            title="Click to cycle themes (Midnight Tech / Cyber Violet / Minimal Light)"
            aria-label="Switch Theme"
          >
            <span>
              {currentTheme === "midnight"
                ? "🌙 Midnight"
                : currentTheme === "violet"
                ? "⚡ Violet"
                : "☀️ Light"}
            </span>
            <span style={{ fontSize: "10px", opacity: 0.7 }}>⇄</span>
          </button>

          <button
            className={`backend-badge ${backendStatus}`}
            onClick={checkBackend}
            title={`Click to re-ping backend server at ${DEFAULT_API_URL}`}
          >
            <span
              className={`status-dot ${
                backendStatus === "connected"
                  ? "online"
                  : backendStatus === "checking"
                  ? "checking"
                  : "offline"
              }`}
            />
            {backendStatus === "connected"
              ? `Backend Connected${backendLatency ? ` (${backendLatency}ms)` : ""}`
              : backendStatus === "checking"
              ? "Checking Server…"
              : "Backend Offline (Retry)"}
          </button>

          {student ? (
            <button className="nav-action" onClick={handleLogout}>
              Sign out <span>↗</span>
            </button>
          ) : (
            <a className="nav-action" href="#apply">
              {mode === "register" ? "Member login" : "Apply now"} <span>↗</span>
            </a>
          )}

          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>
            About us ↗
          </a>
          <a href="#teams" onClick={() => setMobileMenuOpen(false)}>
            Teams & Domains ↗
          </a>
          <a href="#apply" onClick={() => setMobileMenuOpen(false)}>
            Recruitment Application ↗
          </a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)}>
            Frequently Asked Questions ↗
          </a>
          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Theme:</span>
            <button onClick={() => switchTheme("midnight")} className="theme-switch-btn">🌙 Midnight</button>
            <button onClick={() => switchTheme("violet")} className="theme-switch-btn">⚡ Violet</button>
            <button onClick={() => switchTheme("light")} className="theme-switch-btn">☀️ Light</button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            STUDENT INNOVATION, TOGETHER
          </p>
          <h1>
            Make room
            <br />
            for <span>what’s next.</span>
          </h1>
          <p className="hero-description">
            A community of curious minds building useful things, asking better questions, and making
            the future a little less theoretical.
          </p>

          <a href="#apply" className="primary-button">
            {student ? "View Your Application" : "Find your place"}
            <span>↗</span>
          </a>

          <div className="hero-note">
            <span className="note-dot" /> Applications open for 2026–27{" "}
            <span className="note-divider">/</span> <a href="#teams">Explore teams ↓</a>
          </div>
        </div>

        <div className="hero-art" aria-label="Abstract illustration of connected ideas">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-orbit orbit-three" />
          <div className="art-core">
            a<span>.</span>
          </div>
          <div className="art-tag tag-one">IDEAS → IMPACT</div>
          <div className="art-tag tag-two">EST. 2018</div>
          <div className="art-star">✳</div>
          <div className="art-cross">＋</div>
          <div className="art-caption">
            Curiosity is a<br />
            team sport.
          </div>
        </div>
        <div className="hero-index">
          01 <span>—</span> 04
        </div>
      </section>

      {/* Ticker */}
      <section className="ticker" aria-label="Club values">
        <div className="ticker-track">
          <span>THINK BRAVELY</span>
          <b>✳</b>
          <span>BUILD TOGETHER</span>
          <b>✳</b>
          <span>STAY CURIOUS</span>
          <b>✳</b>
          <span>SHIP REAL CODE</span>
          <b>✳</b>
          <span>THINK BRAVELY</span>
          <b>✳</b>
          <span>BUILD TOGETHER</span>
          <b>✳</b>
          <span>STAY CURIOUS</span>
        </div>
      </section>

      {/* About Section */}
      <section className="intro-section" id="about">
        <div className="section-kicker">01 / WHO WE ARE</div>
        <div>
          <h2>
            Big ideas need
            <br />
            <em>good people.</em>
          </h2>
          <p className="intro-copy">
            CLUB is a student-led community for people who want to make things that matter. We bring
            different disciplines into the same room, then give them the tools and trust to build
            something real.
          </p>
          <a href="#teams" className="text-link">
            A little more about us <span>↗</span>
          </a>
        </div>

        <div className="intro-stats">
          <div>
            <strong>08</strong>
            <span>
              engineering
              <br />
              disciplines
            </span>
          </div>
          <div>
            <strong>02</strong>
            <span>
              focused
              <br />
              build teams
            </span>
          </div>
          <div>
            <strong>∞</strong>
            <span>
              ways to
              <br />
              get involved
            </span>
          </div>
        </div>
      </section>

      {/* Teams Section with Interactive Modals */}
      <section className="teams-section" id="teams">
        <div className="section-heading">
          <div>
            <div className="section-kicker">02 / FIND YOUR PEOPLE</div>
            <h2>
              Pick a direction.
              <br />
              <em>Then make it yours.</em>
            </h2>
          </div>
          <p>Click on any card to explore curriculum, active projects, and expectations.</p>
        </div>

        <div className="team-grid">
          {/* Team 01: Web Dev */}
          <article
            className="team-card team-web"
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTeamModal("Web Dev")}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === "Enter" && setActiveTeamModal("Web Dev")}
          >
            <div className="team-number">
              TEAM 01 <span>↗ Click to inspect</span>
            </div>
            <div className="team-graphic web-graphic">
              <span className="bracket">{`{ }`}</span>
              <span className="graphic-label">01—WEB</span>
              <span className="graphic-grid" />
            </div>
            <h3>Web development</h3>
            <p>Shape digital experiences from the first sketch to the final line of production code.</p>
            <div className="team-tags">
              <span>FRONTEND</span>
              <span>BACKEND</span>
              <span>FULL-STACK</span>
            </div>
          </article>

          {/* Team 02: AI/ML */}
          <article
            className="team-card team-ai"
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTeamModal("AI/ML")}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === "Enter" && setActiveTeamModal("AI/ML")}
          >
            <div className="team-number">
              TEAM 02 <span>↗ Click to inspect</span>
            </div>
            <div className="team-graphic ai-graphic">
              <div className="ai-sun">✳</div>
              <span className="graphic-label">02—AI/ML</span>
              <div className="ai-ring ring-a" />
              <div className="ai-ring ring-b" />
            </div>
            <h3>Artificial intelligence</h3>
            <p>Explore machine learning models, computer vision, and neural possibilities.</p>
            <div className="team-tags">
              <span>DEEP LEARNING</span>
              <span>LLMS</span>
              <span>DATA SCIENCE</span>
            </div>
          </article>
        </div>
      </section>

      {/* Recruitment Form & Interactive Applicant Profile */}
      <section className="apply-section" id="apply">
        <div className="apply-aside">
          <div className="section-kicker">03 / YOUR NEXT CHAPTER</div>
          <h2>
            {student ? (
              <>
                You’re
                <br />
                <em>on the list.</em>
              </>
            ) : (
              <>
                There’s room
                <br />
                for <em>you here.</em>
              </>
            )}
          </h2>
          <p>
            {student
              ? "Your application is safely in our database. We are currently screening candidates and will reach out with the interview details."
              : "No perfect portfolio required. Just a little curiosity, the willingness to learn, and something you’d love to make."}
          </p>

          <div className="apply-contact">
            QUESTIONS? <a href="mailto:hello@axiom.club">hello@axiom.club ↗</a>
          </div>
        </div>

        <div className="form-card">
          {student ? (
            /* Logged-In Student Dashboard */
            <div className="profile-view">
              <div className="profile-icon">
                {student.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="form-eyebrow">APPLICATION RECEIVED & VERIFIED</div>
              <h3>Welcome, {student.name.split(" ")[0]}.</h3>
              <p className="form-subtitle">
                You are registered for the 2026–2027 Club Recruitment Cycle.
              </p>

              {/* Status Timeline */}
              <div className="status-timeline">
                <div className="timeline-step completed">
                  <div className="timeline-step-indicator">✓</div>
                  <div className="timeline-step-label">Submitted</div>
                </div>
                <div className="timeline-step active">
                  <div className="timeline-step-indicator">2</div>
                  <div className="timeline-step-label">Under Review</div>
                </div>
                <div className="timeline-step upcoming">
                  <div className="timeline-step-indicator">3</div>
                  <div className="timeline-step-label">Interview</div>
                </div>
                <div className="timeline-step upcoming">
                  <div className="timeline-step-indicator">4</div>
                  <div className="timeline-step-label">Decision</div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="profile-details">
                <div>
                  <span>APPLICANT ID</span>
                  <strong>{student.id}</strong>
                </div>
                <div>
                  <span>FULL NAME</span>
                  <strong>{student.name}</strong>
                </div>
                <div>
                  <span>EMAIL ADDRESS</span>
                  <strong>{student.email}</strong>
                </div>
                <div>
                  <span>CHOSEN DOMAIN</span>
                  <strong>{student.team}</strong>
                </div>
                <div>
                  <span>ACADEMIC DETAILS</span>
                  <strong>
                    Year {student.year} · {student.branch}
                  </strong>
                </div>
              </div>

              {/* Expandable Application Statement */}
              <button
                className="accordion-toggle"
                onClick={() => setShowStatement(!showStatement)}
              >
                <span>View your application statement</span>
                <span>{showStatement ? "▲" : "▼"}</span>
              </button>
              {showStatement && (
                <div className="accordion-content">
                  <em>&ldquo;{student.reason}&rdquo;</em>
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className="applicant-actions-row">
                <button className="btn-icon-action" onClick={copyApplicationId}>
                  📋 Copy ID
                </button>
                <button className="btn-icon-action" onClick={downloadApplicationSlip}>
                  📄 Download Slip
                </button>
              </div>

              <button
                className="form-submit"
                onClick={handleLogout}
                style={{ marginTop: "20px" }}
              >
                Sign out of portal <span>↗</span>
              </button>
            </div>
          ) : (
            /* Register / Login Interactive Form */
            <>
              <div className="form-eyebrow">
                {mode === "register" ? "TAKE THE FIRST STEP" : "GOOD TO HAVE YOU BACK"}
              </div>
              <h3>{mode === "register" ? "Let’s get to know you." : "Welcome back."}</h3>
              <p className="form-subtitle">
                {mode === "register"
                  ? "A few details, and you’re on your way to joining the team."
                  : "Sign in to check your application status."}
              </p>

              <div className="form-tabs">
                <button
                  className={mode === "register" ? "active" : ""}
                  onClick={() => {
                    setMode("register");
                    setMessage("");
                  }}
                >
                  New application
                </button>
                <button
                  className={mode === "login" ? "active" : ""}
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                >
                  Member sign in
                </button>
              </div>

              <form onSubmit={handleSubmit} className="application-form">
                {/* Full Name (Register only) */}
                {mode === "register" && (
                  <label>
                    Full name
                    <input
                      required
                      name="name"
                      placeholder="e.g. Alex Sharma"
                      autoComplete="name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </label>
                )}

                {/* Email Address */}
                <label>
                  Email address
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="you@university.edu"
                    autoComplete="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                  />
                </label>

                {/* Domain & Year Row (Register only) */}
                {mode === "register" && (
                  <>
                    <div className="form-row">
                      <label>
                        Year of study
                        <select
                          name="year"
                          required
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                        >
                          <option value="1">1st year</option>
                          <option value="2">2nd year</option>
                          <option value="3">3rd year</option>
                          <option value="4">4th year</option>
                        </select>
                      </label>

                      <label>
                        Chosen Team
                        <select
                          name="team"
                          required
                          value={selectedTeam}
                          onChange={(e) => setSelectedTeam(e.target.value as "Web Dev" | "AI/ML")}
                        >
                          <option value="Web Dev">Web development</option>
                          <option value="AI/ML">AI / ML</option>
                        </select>
                      </label>
                    </div>

                    {/* Branch */}
                    <label>
                      Branch / Department
                      <select
                        name="branch"
                        required
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                      >
                        {branches.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Why CLUB with Live Character Counter & Prompt Chips */}
                    <label>
                      Why CLUB? (Statement of interest)
                      <textarea
                        name="reason"
                        required
                        minLength={20}
                        maxLength={500}
                        placeholder="Tell us what you are curious about, what you want to learn, or projects you would love to build…"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </label>

                    {/* Character counter row */}
                    <div
                      className={`char-count-row ${
                        reason.length >= 20 ? "valid" : reason.length > 0 ? "invalid" : ""
                      }`}
                    >
                      <span>
                        {reason.length < 20
                          ? `At least 20 characters required (${20 - reason.length} more)`
                          : "Minimum length reached ✓"}
                      </span>
                      <span>{reason.length} / 500</span>
                    </div>

                    {/* Helpful Prompt Chips */}
                    <div>
                      <span style={{ fontSize: "10px", color: "#69766d", fontWeight: "600" }}>
                        Need inspiration? Click to add:
                      </span>
                      <div className="prompt-chips-wrap">
                        <button
                          type="button"
                          className="prompt-chip"
                          onClick={() =>
                            appendPrompt(
                              "I want to build real-world software and collaborate with ambitious peers."
                            )
                          }
                        >
                          + Building real apps
                        </button>
                        <button
                          type="button"
                          className="prompt-chip"
                          onClick={() =>
                            appendPrompt(
                              "I am eager to learn modern frameworks, receive mentorship, and ship open source."
                            )
                          }
                        >
                          + Mentorship & growth
                        </button>
                        <button
                          type="button"
                          className="prompt-chip"
                          onClick={() =>
                            appendPrompt(
                              "I value teamwork, curiosity, and turning theoretical ideas into reality."
                            )
                          }
                        >
                          + Team curiosity
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Password Field with Eye Toggle */}
                <label>
                  Password
                  <div className="password-field-container">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      name="password"
                      minLength={8}
                      placeholder="At least 8 characters"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "👁" : "👁‍🗨"}
                    </button>
                  </div>
                </label>

                {/* Password Strength Meter (Register mode) */}
                {mode === "register" && password.length > 0 && (
                  <div className="strength-meter-wrap">
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`strength-bar ${
                            passwordStrength >= step
                              ? getStrengthLabel(passwordStrength).class
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                    <div className="strength-label">
                      <span>Strength: {getStrengthLabel(passwordStrength).label}</span>
                      <span>{password.length} chars</span>
                    </div>
                  </div>
                )}

                {/* Confirm Password (Register mode) */}
                {mode === "register" && (
                  <label>
                    Confirm password
                    <div className="password-field-container">
                      <input
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        minLength={8}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="eye-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? "👁" : "👁‍🗨"}
                      </button>
                    </div>
                  </label>
                )}

                {/* Password Match Notice */}
                {mode === "register" && confirmPassword.length > 0 && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: password === confirmPassword ? "#306e4a" : "#c24940",
                      marginTop: "-6px",
                    }}
                  >
                    {password === confirmPassword ? "✓ Passwords match" : "✕ Passwords do not match"}
                  </div>
                )}

                {/* Feedback Message */}
                {message && (
                  <div
                    className={`form-message ${messageType === "success" ? "success" : ""}`}
                    role="status"
                  >
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <button className="form-submit" disabled={submitting}>
                  {submitting ? (
                    "Connecting & transmitting…"
                  ) : mode === "register" ? (
                    "Send my application"
                  ) : (
                    "Sign into my portal"
                  )}
                  <span>↗</span>
                </button>
              </form>

              <p className="form-legal">
                By submitting, your data is securely stored in the recruitment database. You will
                receive updates directly regarding interviews and onboarding.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="faq-section" id="faq">
        <div style={{ textAlign: "center" }}>
          <div className="section-kicker">04 / CLEAR ANSWERS</div>
          <h2 style={{ fontSize: "clamp(36px, 4vw, 54px)", margin: "14px 0 10px" }}>
            Frequently Asked <em>Questions.</em>
          </h2>
          <p style={{ color: "#6c7970", fontSize: "14px", maxWidth: "480px", margin: "auto" }}>
            Everything you need to know about the recruitment process, expectations, and culture.
          </p>
        </div>

        <div className="faq-grid">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`faq-card ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-header"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="faq-chevron">{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && <div className="faq-body">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">C</span>
          <span>
            CLUB<span className="brand-dot">.</span>
          </span>
        </a>
        <span>Curious minds, building what’s next.</span>
        <span>© CLUB 2026–2027</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
