/**
 * @file Labs.tsx
 * @description Labs Hub — a fully searchable and filterable grid of all available and upcoming lab environments.
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowUpRight, Beaker, Code2 } from "lucide-react";
import { ALL_LABS } from "@/lib/labsData";
import { LabCard } from "@/components/LabCard";
import "./Labs.css";

const CATEGORIES = [
  "All",
  "Software Development",
  "Data & Analytics",
  "Infrastructure",
  "Hardware",
  "Security",
  "Emerging Tech"
];

// ─────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────

export default function Labs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredLabs = useMemo(() => {
    return ALL_LABS.filter((lab: any) => {
      const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            lab.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lab.tags.some((t: any) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = activeCategory === "All" || lab.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ALL_LABS.length };
    ALL_LABS.forEach((lab: any) => {
      counts[lab.category] = (counts[lab.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="labs-page-wrap">
      {/* Featured Spotlight — Coding Lab (the only live one) */}
      <div className="labs-spotlight-card">
        <div className="labs-spotlight-left">
          <div className="labs-spotlight-pill">
            <span className="labs-pulse-dot" aria-hidden="true" />
            Live Sandbox
          </div>
          <h1 className="labs-spotlight-title">
            Payilagam Coding Lab
          </h1>
          <p className="labs-spotlight-desc">
            A full online compiler supporting Python, JavaScript, Java, C, C++ and more — powered by Judge0. 
            Write, run and share code instantly from your browser.
          </p>
          <div className="labs-spotlight-chips">
            <span className="labs-chip chip-gold">
              <Code2 size={13} /> Multi-Language
            </span>
            <span className="labs-chip chip-blue">
              <ArrowUpRight size={13} /> Instant Execution
            </span>
            <span className="labs-chip chip-cyan">
              <Beaker size={13} /> Share Links
            </span>
          </div>
        </div>
        <div className="labs-spotlight-right">
          <Link to="/labs/code" className="labs-spotlight-btn">
            Launch Sandbox <ArrowUpRight />
          </Link>
          <div className="labs-live-indicator">
            <span className="labs-pulse-dot" aria-hidden="true" />
            Live & Ready
          </div>
        </div>
      </div>

      {/* Toolbar: Search + Category Pills */}
      <div className="labs-toolbar-row">
        <div className="labs-search-bar">
          <Search />
          <input
            type="text"
            placeholder="Search labs, technologies..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="labs-search-input"
          />
        </div>
        <div className="labs-category-pills">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`labs-cat-pill ${activeCategory === category ? "is-active" : ""}`}
            >
              {category}
              <span className="labs-cat-count">({categoryCounts[category] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {filteredLabs.length > 0 ? (
        <div className="labs-grid">
          {filteredLabs.map((lab: any) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 14,
              background: "var(--bg-surface-2)", border: "1px solid var(--border-default)",
              display: "grid", placeItems: "center", margin: "0 auto 16px",
            }}
          >
            <Search size={24} style={{ color: "var(--text-muted)" }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-heading)", marginBottom: 6 }}>
            No labs found
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 400, margin: "0 auto 16px" }}>
            We couldn't find any labs matching "{searchTerm}" in the {activeCategory} category.
          </p>
          <button
            onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
            className="labs-cat-pill"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
