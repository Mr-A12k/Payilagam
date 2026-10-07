import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import type { ALL_LABS } from "@/lib/labsData";
import {
  TechVSCode,
  TechPostgres,
  TechReact,
  TechTerminal,
  TechDocker,
  TechHardware,
  TechMobile,
  TechAI,
  TechCyber,
  TechBlockchain,
  TechNetworking,
  TechGameDev,
} from "@/components/icons";

function getLabCustomIcon(id: string, FallbackIcon: any) {
  switch (id) {
    case "coding":
      return <TechVSCode size={26} />;
    case "database":
    case "data-eng":
      return <TechPostgres size={26} />;
    case "web":
      return <TechReact size={26} />;
    case "os":
      return <TechTerminal size={26} />;
    case "cloud":
    case "devops":
      return <TechDocker size={26} />;
    case "circuit":
    case "iot":
      return <TechHardware size={26} />;
    case "mobile":
      return <TechMobile size={26} />;
    case "ai":
    case "quantum":
      return <TechAI size={26} />;
    case "cyber":
      return <TechCyber size={26} />;
    case "blockchain":
      return <TechBlockchain size={26} />;
    case "networking":
      return <TechNetworking size={26} />;
    case "game":
      return <TechGameDev size={26} />;
    default:
      return <FallbackIcon size={24} />;
  }
}

export const LabCard = ({ lab }: { lab: (typeof ALL_LABS)[number] }) => {
  const isAvailable = Boolean(lab.available);
  const targetRoute =
    isAvailable && lab.route
      ? lab.route
      : `/coming-soon?feature=${encodeURIComponent(lab.name)}`;
  const customIcon = getLabCustomIcon(lab.id, lab.icon);

  return (
    <Link
      to={targetRoute}
      className="lab-card-modern group"
      aria-label={`${lab.name} - ${isAvailable ? "Available sandbox" : "Coming soon"}`}
    >
      {/* Top Header */}
      <div className="lab-card-top">
        <div className="lab-card-icon-wrap" aria-hidden="true">
          {customIcon}
        </div>
        <span
          className={`lab-card-badge ${isAvailable ? "badge-live" : "badge-upcoming"}`}
        >
          {isAvailable ? (
            <>
              <span className="labs-pulse-dot" aria-hidden="true" /> Live
              Sandbox
            </>
          ) : (
            <>
              <Clock size={11} aria-hidden="true" /> Coming Soon
            </>
          )}
        </span>
      </div>

      {/* Title & Category */}
      <div className="lab-card-title-group">
        <div className="lab-card-category">{lab.category}</div>
        <h3 className="lab-card-title">{lab.name}</h3>
      </div>

      {/* Description */}
      <p className="lab-card-desc">{lab.description}</p>

      {/* Tags */}
      <div className="lab-card-tags" aria-label="Supported technologies">
        {lab.tags.map((tag) => {
          const isHighlight = tag.toLowerCase().includes("python");
          return (
            <span
              key={tag}
              className={`lab-card-tag ${isHighlight ? "tag-highlight" : ""}`}
            >
              {tag}
            </span>
          );
        })}
      </div>

      {/* Footer Callout */}
      <div className="lab-card-footer">
        <span className="text-xs text-[var(--text-muted)] font-normal">
          {lab.tagline ||
            (isAvailable ? "Instant execution" : "Roadmap preview")}
        </span>
        <span
          className={`lab-card-action ${isAvailable ? "" : "action-muted"}`}
        >
          {isAvailable ? "Launch Sandbox" : "Join Waitlist"}
          {isAvailable ? <ArrowRight /> : <ArrowUpRight />}
        </span>
      </div>
    </Link>
  );
};
