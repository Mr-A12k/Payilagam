import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Users,
  Sparkles,
  Play,
  CheckCircle2,
  Terminal,
  Flame,
  Bot,
  Layers,
  Check,
  RotateCcw,
  Star,
  Zap,
  GraduationCap
} from "lucide-react";
import { useAppSelector } from "@/hooks/reduxHooks";
import { Button } from "@/components/ui/Button";
import "./Home.css";

const subjects = [
  { name: "Web development", description: "Build fullstack modern applications from fundamentals to production.", category: "web" },
  { name: "Data science & AI", description: "Master machine learning models, analytics, and intelligent systems.", category: "data" },
  { name: "Cloud computing", description: "Architect and deploy scalable microservices with Kubernetes & AWS.", category: "cloud" },
  { name: "Cybersecurity", description: "Understand defensive security, encryption protocols, and auditing.", category: "security" },
];

const Home = () => {
  const user = useAppSelector((state) => state.auth.user) as { pageAccess?: string[] } | null;
  const navigate = useNavigate();

  const [activeWindowTab, setActiveWindowTab] = useState<"arena" | "ai" | "roadmap">("arena");
  const [isRunningCode, setIsRunningCode] = useState(false);
  

  useEffect(() => {
    if (user) {
      if (user.pageAccess?.includes("PG_ADM")) navigate("/admin", { replace: true });
      else if (user.pageAccess?.includes("PG_MNT")) navigate("/mentor", { replace: true });
      else navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleRunCode = () => {
    setIsRunningCode(true);
    setTimeout(() => {
      setIsRunningCode(false);
      
    }, 700);
  };

  return (
    <div className="payilagam-home">
      {/* ══════════════════════════════════════════════════
         HERO SECTION
         ══════════════════════════════════════════════════ */}
      <section className="home-hero-redesign" aria-labelledby="home-title">
        <div className="home-hero-ambient" aria-hidden="true" />
        
        <div className="home-inner">
          <div className="home-hero-content">
            {/* Announcement Pill */}
            <Link to="/labs" className="home-announcement-pill" aria-label="Explore interactive labs">
              <span className="home-announcement-tag">
                <Sparkles size={12} /> New
              </span>
              <span>Interactive Coding Arenas & AI Mentorship</span>
              <ArrowRight aria-hidden="true" />
            </Link>

            {/* Headline */}
            <h1 id="home-title" className="home-hero-title">
              Where ambitious engineers{" "}
              <span className="home-hero-gradient">learn, code & master</span> technology.
            </h1>

            {/* Subtitle */}
            <p className="home-hero-subtitle">
              Accelerate your software engineering career with hands-on browser labs,
              curated real-world project curriculums, and 1-on-1 industry mentorship.
            </p>

            {/* Action Buttons */}
            <div className="home-hero-cta-group">
              <Link to="/courses" className="home-cta-primary">
                Explore 150+ Courses <ArrowRight />
              </Link>
              <Link to="/labs" className="home-cta-secondary">
                <Play size={14} className="fill-current opacity-80" /> Try Interactive Arena
              </Link>
            </div>

            {/* Micro Trust Signals */}
            <div className="home-hero-trust">
              <span className="home-trust-item">
                <Zap className="text-[var(--accent-primary)]" /> Real-world projects
              </span>
              <span className="home-trust-item">
                <CheckCircle2 className="text-[var(--accent-success)]" /> 50+ In-browser coding labs
              </span>
              <span className="home-trust-item">
                <GraduationCap className="text-[var(--accent-warning)]" /> Verified industry certifications
              </span>
            </div>
          </div>

          {/* ── Interactive Hero Showcase (ClickUp/Linear Style) ── */}
          <div className="home-showcase-container">
            {/* Floating Badge Top Right */}
            <aside className="home-float-badge badge-top-right" aria-label="Learning Streak status">
              <div className="home-float-icon">
                <Flame size={18} />
              </div>
              <div className="home-float-copy">
                <strong>14-Day Streak 🔥</strong>
                <span>Level 6 Software Engineer • +450 XP</span>
              </div>
            </aside>

            {/* Floating Badge Bottom Left */}
            <aside className="home-float-badge badge-bottom-left" aria-label="Mentor Feedback status">
              <div className="home-float-icon">
                <Star size={18} className="fill-current" />
              </div>
              <div className="home-float-copy">
                <strong>Mentor Review Approved</strong>
                <span>“Clean Dijkstra traversal optimization! 5.0 ★”</span>
              </div>
            </aside>

            {/* Main Window */}
            <div className="home-showcase-window">
              {/* Window Titlebar */}
              <div className="home-window-bar">
                <div className="home-window-dots" aria-hidden="true">
                  <span className="home-window-dot dot-red" />
                  <span className="home-window-dot dot-yellow" />
                  <span className="home-window-dot dot-green" />
                </div>

                {/* Tab Switcher */}
                <div className="home-window-tabs" role="tablist" aria-label="Interactive demo modes">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeWindowTab === "arena"}
                    className={`home-window-tab ${activeWindowTab === "arena" ? "is-active" : ""}`}
                    onClick={() => setActiveWindowTab("arena")}
                  >
                    <Terminal /> Coding Arena
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeWindowTab === "ai"}
                    className={`home-window-tab ${activeWindowTab === "ai" ? "is-active" : ""}`}
                    onClick={() => setActiveWindowTab("ai")}
                  >
                    <Bot /> AI Assistant
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeWindowTab === "roadmap"}
                    className={`home-window-tab ${activeWindowTab === "roadmap" ? "is-active" : ""}`}
                    onClick={() => setActiveWindowTab("roadmap")}
                  >
                    <Layers /> Career Roadmap
                  </button>
                </div>

                <div className="home-window-status">
                  <span className="home-status-dot" aria-hidden="true" />
                  <span>Interactive Live</span>
                </div>
              </div>

              {/* Window Body Content */}
              <div className="home-window-body">
                {activeWindowTab === "arena" && (
                  <div className="home-arena-grid">
                    {/* Code Editor Pane */}
                    <div className="home-editor-pane">
                      <div className="home-editor-top">
                        <span className="home-file-breadcrumb">
                          <Code2 size={14} /> src / algorithms / dijkstra_path.py
                        </span>
                        <button
                          type="button"
                          className="home-run-btn"
                          onClick={handleRunCode}
                          disabled={isRunningCode}
                        >
                          {isRunningCode ? <RotateCcw className="animate-spin" /> : <Play className="fill-current" />}
                          {isRunningCode ? "Running tests…" : "Run Code"}
                        </button>
                      </div>
                      <pre className="home-code-content">
                        <code>
                          <span className="code-comment"># Payilagam Learning Arena: Graph Shortest Path</span>{"\n"}
                          <span className="code-kw">import</span> heapq{"\n\n"}
                          <span className="code-kw">def</span> <span className="code-fn">find_optimal_path</span>(graph, start_node, target_node):{"\n"}
                          {"    "}distances = &#123;node: float(<span className="code-str">'inf'</span>) <span className="code-kw">for</span> node <span className="code-kw">in</span> graph&#125;{"\n"}
                          {"    "}distances[start_node] = <span className="code-num">0</span>{"\n"}
                          {"    "}priority_queue = [(<span className="code-num">0</span>, start_node)]{"\n\n"}
                          {"    "}<span className="code-kw">while</span> priority_queue:{"\n"}
                          {"        "}dist, curr = heapq.heappop(priority_queue){"\n"}
                          {"        "}<span className="code-kw">if</span> curr == target_node:{"\n"}
                          {"            "}<span className="code-kw">return</span> distances[target_node]{"\n"}
                          {"    "}<span className="code-kw">return</span> -<span className="code-num">1</span>
                        </code>
                      </pre>
                    </div>

                    {/* Output & Test Suite Pane */}
                    <div className="home-output-pane">
                      <div className="home-output-top">
                        <span>Test Suite Results</span>
                        <span className="home-output-badge">
                          <Check size={12} /> {isRunningCode ? "Executing..." : "All Passing"}
                        </span>
                      </div>
                      <div className="home-test-results">
                        <div className="home-test-item">
                          <CheckCircle2 />
                          <div>
                            <strong>Test Case 1: Standard Directed Graph</strong>
                            <span>Passed • Execution time: 14ms • Memory: 12.1MB</span>
                          </div>
                        </div>
                        <div className="home-test-item">
                          <CheckCircle2 />
                          <div>
                            <strong>Test Case 2: Cyclic & Disconnected Nodes</strong>
                            <span>Passed • Execution time: 18ms • Memory: 14.3MB</span>
                          </div>
                        </div>
                        <div className="home-test-item">
                          <CheckCircle2 />
                          <div>
                            <strong>Test Case 3: Large Dense Cluster (1,000 nodes)</strong>
                            <span>Passed • Execution time: 38ms • Complexity O((V+E)logV)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeWindowTab === "ai" && (
                  <div className="home-ai-view">
                    <div className="home-chat-msg home-chat-user">
                      <div className="home-chat-avatar">
                        <Users size={16} />
                      </div>
                      <div className="home-chat-bubble">
                        How does Dijkstra's algorithm guarantee the shortest path when all weights are non-negative?
                      </div>
                    </div>
                    <div className="home-chat-msg home-chat-ai">
                      <div className="home-chat-avatar">
                        <Bot size={16} />
                      </div>
                      <div className="home-chat-bubble">
                        Because edge weights are non-negative (\(w \ge 0\)), once a node is popped from the priority queue, any alternative path to that node must pass through other unvisited nodes with equal or greater distance. Hence, its calculated distance is permanently optimal! 💡
                      </div>
                    </div>
                  </div>
                )}

                {activeWindowTab === "roadmap" && (
                  <div className="home-roadmap-view">
                    <div className="home-step-card">
                      <span className="home-step-num">Step 01 • Completed</span>
                      <h4>Data Structures & Algorithms</h4>
                      <p>Mastered HashMaps, Binary Trees, and Asymptotic Complexity Analysis.</p>
                    </div>
                    <div className="home-step-card is-current">
                      <span className="home-step-num">Step 02 • In Progress</span>
                      <h4>Cloud Infrastructure & Go APIs</h4>
                      <p>Currently building containerized microservices and resilient message queues.</p>
                    </div>
                    <div className="home-step-card">
                      <span className="home-step-num">Step 03 • Next Up</span>
                      <h4>System Design & Capstone</h4>
                      <p>Architecting distributed database sharding and global caching strategies.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Key Metrics Strip ── */}
          <div className="home-metrics-strip">
            <div className="home-metric-item">
              <span className="home-metric-number">10,000+</span>
              <span className="home-metric-label">Active Learners</span>
            </div>
            <div className="home-metric-item">
              <span className="home-metric-number">150+</span>
              <span className="home-metric-label">Curated Courses & Labs</span>
            </div>
            <div className="home-metric-item">
              <span className="home-metric-number">96%</span>
              <span className="home-metric-label">Hands-on Completion</span>
            </div>
            <div className="home-metric-item">
              <span className="home-metric-number">4.9 / 5.0</span>
              <span className="home-metric-label">Community Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
         FIND YOUR NEXT SUBJECT
         ══════════════════════════════════════════════════ */}
      <section className="home-section" aria-labelledby="subjects-title">
        <div className="home-inner">
          <div className="home-section-heading">
            <div>
              <h2 id="subjects-title">Explore Engineering Paths</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                Curated curriculums structured for modern production standards.
              </p>
            </div>
            <Link to="/courses" className="home-text-link">
              All courses <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-subjects">
            {subjects.map((subject) => (
              <Link key={subject.category} to={`/courses?category=${subject.category}`} className="home-subject">
                <div>
                  <h3>{subject.name}</h3>
                  <p>{subject.description}</p>
                </div>
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
         GO BEYOND THE LESSON
         ══════════════════════════════════════════════════ */}
      <section className="home-section" aria-labelledby="practice-title">
        <div className="home-inner">
          <div className="home-section-heading">
            <div>
              <h2 id="practice-title">Everything you need to level up</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                Practice in isolation or connect with mentors who work at top tech companies.
              </p>
            </div>
          </div>
          <div className="home-support">
            <article className="home-support-card">
              <div className="home-support-icon">
                <Code2 size={22} aria-hidden="true" />
              </div>
              <h3>Hands-On Coding Arenas</h3>
              <p>Solve algorithm challenges, write SQL queries, and build fullstack apps directly in browser sandboxes.</p>
              <Link to="/labs" className="home-text-link">
                Open labs <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>

            <article className="home-support-card">
              <div className="home-support-icon">
                <BookOpen size={22} aria-hidden="true" />
              </div>
              <h3>Knowledge Repository & Docs</h3>
              <p>Explore high-yield cheat sheets, interactive diagrams, and AI-indexed technical documentation.</p>
              <Link to="/resources" className="home-text-link">
                Browse resources <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>

            <article className="home-support-card">
              <div className="home-support-icon">
                <Users size={22} aria-hidden="true" />
              </div>
              <h3>1-on-1 Senior Mentorship</h3>
              <p>Get architectural code reviews, unblock tricky bugs, and conduct realistic mock technical interviews.</p>
              <Link to="/mentors" className="home-text-link">
                Meet the mentors <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
         CALL TO ACTION BANNER
         ══════════════════════════════════════════════════ */}
      <section className="home-section" aria-labelledby="join-title">
        <div className="home-inner">
          <div className="home-join-card">
            <div>
              <h2 id="join-title">Make room for exponential learning.</h2>
              <p>Join thousands of software engineers building production-grade skills today.</p>
            </div>
            <Button size="lg" className="home-cta-primary" asChild>
              <Link to="/signup">
                Create Free Account <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
         FOOTER
         ══════════════════════════════════════════════════ */}
      <footer className="home-inner home-footer">
        <p>Payilagam &copy; {new Date().getFullYear()} • Modern Learning Workspace</p>
        <nav aria-label="Footer">
          <Link to="/about">About</Link>
          <Link to="/enterprise">Enterprise</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </footer>
    </div>
  );
};

export default Home;
