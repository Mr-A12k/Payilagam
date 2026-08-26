/**
 * @fileoverview Mentors Directory — Pro full-width redesign.
 */
import {
  Users, BookOpen, Search, Star, ArrowRight,
  ChevronRight, GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { toast } from "react-hot-toast";

/* ── gradient accents for mentor cards ── */
const accents = [
  { border: "border-blue-500/20", bg: "from-blue-600/10 to-blue-500/5", ring: "ring-blue-500/15", text: "text-blue-400" },
  { border: "border-violet-500/20", bg: "from-violet-600/10 to-violet-500/5", ring: "ring-violet-500/15", text: "text-violet-400" },
  { border: "border-emerald-500/20", bg: "from-emerald-600/10 to-emerald-500/5", ring: "ring-emerald-500/15", text: "text-emerald-400" },
  { border: "border-amber-500/20", bg: "from-amber-600/10 to-amber-500/5", ring: "ring-amber-500/15", text: "text-amber-400" },
  { border: "border-rose-500/20", bg: "from-rose-600/10 to-rose-500/5", ring: "ring-rose-500/15", text: "text-rose-400" },
  { border: "border-cyan-500/20", bg: "from-cyan-600/10 to-cyan-500/5", ring: "ring-cyan-500/15", text: "text-cyan-400" },
];

const Mentors = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMentors = useCallback(async () => {
    try {
      const response = await executeHttpGetRequest(API_PATHS.USERS.MENTORS);
      if (response.data.success) setMentors(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load mentors");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchMentors(); }, [fetchMentors]);

  const getSkills = (skillsString: any) => {
    try { return skillsString ? JSON.parse(skillsString) : []; }
    catch { return []; }
  };

  const filteredMentors = useMemo(() => {
    if (!searchTerm.trim()) return mentors;
    const q = searchTerm.toLowerCase();
    return mentors.filter((m: any) => {
      const skills = getSkills(m.skills);
      return (
        m.fullName?.toLowerCase().includes(q) ||
        m.userName?.toLowerCase().includes(q) ||
        skills.some((s: string) => s.toLowerCase().includes(q))
      );
    });
  }, [mentors, searchTerm]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-slate-500 font-medium">Loading mentors...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-full w-full bg-[var(--bg-base)] text-slate-100">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden border-b border-slate-800/60">
        <div className="absolute -top-16 left-1/4 w-80 h-56 bg-blue-600/6 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -top-12 right-20 w-64 h-48 bg-violet-600/5 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                Mentor Network
              </div>
              <h1 className="text-[26px] font-extrabold text-slate-100 tracking-tight leading-tight mb-1">
                Expert Mentors
              </h1>
              <p className="text-[13px] text-slate-400 max-w-2xl leading-relaxed">
                Connect with world-class instructors and industry experts to guide your learning journey.
              </p>
            </div>

            {/* Search */}
            <div className="w-full md:w-80 relative group shrink-0">
              <Search className="w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search mentors or skills..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-2xl text-[13px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6 mt-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-400">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-slate-200">{mentors.length}</span> Mentors
            </div>
            {searchTerm && (
              <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-400">
                <Search className="w-3.5 h-3.5" />
                <span className="text-slate-200">{filteredMentors.length}</span> results for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MENTOR GRID ── */}
      <div className="px-8 py-8">

        {filteredMentors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-slate-500" />
            </div>
            <h3 className="text-[16px] font-bold text-slate-300 mb-1">
              {searchTerm ? "No mentors found" : "No mentors available"}
            </h3>
            <p className="text-[13px] text-slate-500 max-w-xs">
              {searchTerm
                ? `We couldn't find any mentors matching "${searchTerm}". Try a different search.`
                : "Mentors will appear here once they join the platform."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredMentors.map((mentor: any, index: number) => {
              const accent = accents[index % accents.length];
              const skills = getSkills(mentor.skills);

              return (
                <div
                  key={mentor.userId}
                  onClick={() => navigate(`/mentors/${mentor.userId}`)}
                  className={`group relative rounded-2xl border ${accent.border} bg-slate-900/40 hover:bg-slate-900/70 p-5 cursor-pointer transition-all duration-300 overflow-hidden hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)]`}
                >
                  {/* Subtle gradient glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${accent.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none`} />

                  {/* Top: Avatar + Identity */}
                  <div className="relative flex items-center gap-4 mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accent.bg} border ${accent.border} flex items-center justify-center text-xl font-bold ${accent.text} shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                      {mentor.profileUrl ? (
                        <img src={mentor.profileUrl} alt={mentor.fullName} className="w-full h-full object-cover" />
                      ) : (
                        mentor.fullName?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-bold text-slate-100 leading-tight group-hover:text-blue-300 transition-colors truncate">
                        {mentor.fullName}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        @{mentor.userName}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>

                  {/* Stats Row */}
                  <div className="relative grid grid-cols-2 gap-3 mb-5">
                    <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[16px] font-bold text-slate-200 mb-0.5">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        {mentor._count?.followers || 0}
                      </div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Followers</div>
                    </div>
                    <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[16px] font-bold text-slate-200 mb-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        {mentor._count?.coursesTaught || 0}
                      </div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Courses</div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="relative">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Expertise</div>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.length > 0 ? (
                        <>
                          {skills.slice(0, 4).map((skill: any, i: number) => (
                            <span
                              key={i}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${accent.border} bg-slate-800/60 text-slate-300`}
                            >
                              {skill}
                            </span>
                          ))}
                          {skills.length > 4 && (
                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800/40 text-slate-500 border border-slate-700/40">
                              +{skills.length - 4}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-600 italic">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* View Profile CTA */}
                  <div className="relative mt-5 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-blue-400 group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                        View Profile <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-slate-300">4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
