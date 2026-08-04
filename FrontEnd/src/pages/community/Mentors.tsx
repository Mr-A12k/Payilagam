import { Users, UserPlus, BookOpen, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { toast } from "react-hot-toast";

const bgColors = [
  "from-indigo-500/20 to-blue-500/10 text-indigo-400",
  "from-emerald-500/20 to-teal-500/10 text-emerald-400",
  "from-orange-500/20 to-amber-500/10 text-orange-400",
  "from-purple-500/20 to-pink-500/10 text-purple-400",
  "from-rose-500/20 to-red-500/10 text-rose-400",
  "from-cyan-500/20 to-blue-500/10 text-cyan-400",
];

const Mentors = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMentors = useCallback(async () => {
    try {
      const response = await executeHttpGetRequest(API_PATHS.USERS.MENTORS);
      if (response.data.success) {
        setMentors(response.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load mentors");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const getSkills = (skillsString: any) => {
    try {
      return skillsString ? JSON.parse(skillsString) : [];
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="flex-center min-h-screen bg-slate-950">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center mb-12 mt-4">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_-5px_rgba(37,99,235,0.3)]">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-100 mb-4 tracking-tight">
            Expert Mentors
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            Connect with world-class instructors and industry experts to guide
            your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor: any, index: any) => {
            const bgClass = bgColors[index % bgColors.length];
            const skills = getSkills(mentor.skills);

            return (
              <div
                key={mentor.userId}
                className="bg-slate-900 border border-slate-800/50 rounded-md p-4 flex flex-col gap-4 group hover:border-blue-500/50 transition-all duration-500 cursor-pointer"
              >
                {/* Top Bento Row */}
                <div className="flex gap-4">
                  <div
                    className={`w-24 h-24 rounded-md flex items-center justify-center text-3xl font-bold bg-gradient-to-br ${bgClass} transition-transform duration-700 group-hover:scale-105 overflow-hidden shrink-0`}
                  >
                    {mentor.profileUrl ? (
                      <img
                        src={mentor.profileUrl}
                        alt={mentor.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      mentor.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 bg-slate-950/40 backdrop-blur-md rounded-md p-4 flex flex-col justify-center border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                    <h3 className="font-bold text-slate-100 text-lg leading-tight mb-1 relative z-10 group-hover:text-blue-400 transition-colors">
                      {mentor.fullName}
                    </h3>
                    <p className="text-blue-400 text-xs font-medium uppercase tracking-wide relative z-10">
                      @{mentor.userName}
                    </p>
                  </div>
                </div>

                {/* Middle Bento Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/40 backdrop-blur-sm rounded-md p-4 flex flex-col items-center justify-center border border-white/5">
                    <div className="flex items-center gap-2 text-xl font-bold text-slate-200 mb-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      {mentor._count?.followers || 0}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      Followers
                    </div>
                  </div>
                  <div className="bg-slate-950/40 backdrop-blur-sm rounded-md p-4 flex flex-col items-center justify-center border border-white/5">
                    <div className="flex items-center gap-2 text-xl font-bold text-slate-200 mb-1">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      {mentor._count?.coursesTaught || 0}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      Courses
                    </div>
                  </div>
                </div>

                {/* Bottom Bento Row - Skills */}
                <div className="bg-slate-950/40 backdrop-blur-sm rounded-md p-4 border border-white/5 flex-grow">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">
                    Expertise
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.length > 0 ? (
                      skills.slice(0, 4).map((skill: any, index: any) => (
                        <span
                          key={index}
                          className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-medium border border-slate-700/50"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">
                        No specific skills listed
                      </span>
                    )}
                    {skills.length > 4 && (
                      <span className="bg-slate-800/50 text-slate-400 px-2 py-0.5 rounded-md text-[10px] font-medium border border-slate-700/30">
                        +{skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Fitts's Law Optimized CTA */}
                <button
                  onClick={() => navigate(`/mentors/${mentor.userId}`)}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  View Profile
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Mentors;
