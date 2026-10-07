import { ArrowUpRight, BookOpen, Search, Users, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import "./CommunityPages.css";
import { WorkspacePage, PageHeader, LoadingState, EmptyState } from "@/components/workspace/Workspace";

const getSkills = (value: unknown): string[] => {
  try {
    const skills = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(skills) ? skills.filter((skill): skill is string => typeof skill === "string") : [];
  } catch { return []; }
};

const Mentors = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const fetchMentors = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const response = await executeHttpGetRequest(API_PATHS.USERS.MENTORS);
      if (!response.data.success) throw new Error("Unable to load mentors");
      setMentors(response.data.data || []);
    } catch { setLoadError(true); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { fetchMentors(); }, [fetchMentors]);
  const filtered = mentors.filter(mentor =>
    [mentor.fullName, mentor.userName, ...getSkills(mentor.skills)]
      .join(" ").toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <WorkspacePage className="community-page mentors-page">
      <PageHeader title="Mentors" actions={
        <label className="community-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Search mentors by name or expertise</span>
          <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name or expertise" />
        </label>
      } />
      <div className="community-summary" role="status">
        {isLoading ? "Loading mentors" : loadError ? "Directory unavailable" : `${filtered.length} ${filtered.length === 1 ? "mentor" : "mentors"}`}
      </div>
      {isLoading ? <LoadingState label="Loading mentors..." />
        : loadError ? <div className="community-state" role="alert"><Users /><h2>Mentors could not be loaded</h2><button className="community-button" onClick={fetchMentors}><RefreshCw />Retry</button></div>
        : filtered.length === 0 ? <EmptyState title={search ? "No matching mentors" : "No mentors available"} action={search ? <button className="community-button" onClick={() => setSearch("")}>Clear search</button> : undefined} />
        : <div className="mentor-directory">{filtered.map(mentor => {
          const skills = getSkills(mentor.skills);
          return <article key={mentor.userId} className="mentor-entry">
            <div className="mentor-identity">
              <div className="mentor-avatar">
                {mentor.profileUrl ? <img src={mentor.profileUrl} alt="" loading="lazy" /> : mentor.fullName?.[0]?.toUpperCase() || "M"}
              </div>
              <div><h2>{mentor.fullName}</h2><p>@{mentor.userName}</p></div>
            </div>
            <div className="mentor-metrics">
              <span><Users aria-hidden="true" />{mentor._count?.followers || 0} followers</span>
              <span><BookOpen aria-hidden="true" />{mentor._count?.coursesTaught || 0} courses</span>
            </div>
            <div className="mentor-expertise">
              {skills.length ? skills.slice(0, 4).map((skill, index) => <span key={index}>{skill}</span>) : <p>No expertise listed</p>}
              {skills.length > 4 && <span>+{skills.length - 4}</span>}
            </div>
            <Link className="community-button mentor-profile-link" to={`/mentors/${mentor.userId}`} aria-label={`View profile of ${mentor.fullName}`}>
              View profile<ArrowUpRight aria-hidden="true" />
            </Link>
          </article>;
        })}</div>}
    </WorkspacePage>
  );
};
export default Mentors;
