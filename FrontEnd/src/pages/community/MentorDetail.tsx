/**
 * @fileoverview Mentor Profile Detail — Pro full-width redesign.
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { executeHttpGetRequest, executeHttpPostRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { toast } from "react-hot-toast";
import {
  Users, UserPlus, UserMinus, MessageSquare, BookOpen, Star,
  Loader2, PlayCircle, ArrowLeft, ChevronRight, Clock, Briefcase,
  GraduationCap, Award,
} from "lucide-react";

const MentorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const [mentor, setMentor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const fetchMentorDetails = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await executeHttpGetRequest(API_PATHS.USERS.MENTOR(id!));
      if (response.data.success) {
        setMentor(response.data.data);
        setIsFollowing(response.data.data.isFollowing);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load mentor profile");
      navigate("/mentors");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchMentorDetails(); }, [fetchMentorDetails, user]);

  const handleToggleFollow = async () => {
    if (!user) { navigate("/login", { state: { from: { pathname: `/mentors/${id}` } } }); return; }
    try {
      setFollowLoading(true);
      const response = await executeHttpPostRequest("/follows/toggle", { targetId: id });
      if (response.data.success) {
        setIsFollowing(response.data.data.following);
        setMentor((prev: any) => ({
          ...prev,
          _count: { ...prev._count, followers: response.data.data.following ? prev._count.followers + 1 : prev._count.followers - 1 },
        }));
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error((error as import("axios").AxiosError<{ message?: string }>)?.response?.data?.message || "Failed to update follow status");
    } finally { setFollowLoading(false); }
  };

  const handleMessage = async () => {
    if (!user) { navigate("/login", { state: { from: { pathname: `/mentors/${id}` } } }); return; }
    try {
      setChatLoading(true);
      const response = await executeHttpPostRequest(API_PATHS.CHAT.BASE!, { targetUserId: parseInt(id!) });
      if (response.data.success) navigate(`/chat?conversationId=${response.data.data.conversationId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start conversation");
    } finally { setChatLoading(false); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-slate-500 font-medium">Loading profile...</p>
      </div>
    </div>
  );

  if (!mentor) return null;

  let parsedSkills: string[] = [];
  try { if (mentor.skills) parsedSkills = JSON.parse(mentor.skills); }
  catch { parsedSkills = []; }

  return (
    <div className="min-h-full w-full bg-[var(--bg-base)] text-slate-100">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden border-b border-slate-800/60">
        {/* Background orbs */}
        <div className="absolute -top-20 left-10 w-96 h-72 bg-blue-600/6 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-10 right-20 w-64 h-48 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative px-8 pt-7 pb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mb-6">
            <Link to="/mentors" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Mentors
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-400 truncate max-w-[200px]">{mentor.fullName}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-7 items-start">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-600/15 to-violet-600/10 border border-blue-500/25 flex items-center justify-center text-4xl font-bold text-blue-400 shrink-0 overflow-hidden shadow-xl shadow-blue-500/10 group">
              {mentor.profileUrl ? (
                <img src={mentor.profileUrl} alt={mentor.fullName} className="w-full h-full object-cover" />
              ) : (
                mentor.fullName?.charAt(0).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <h1 className="text-[26px] font-extrabold text-slate-100 tracking-tight leading-tight">
                  {mentor.fullName}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                  Mentor
                </span>
              </div>
              <p className="text-[13px] text-slate-500 font-semibold mb-5">@{mentor.userName}</p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-5">
                {[
                  { icon: Users, value: mentor._count?.followers || 0, label: "Followers", color: "text-blue-400" },
                  { icon: BookOpen, value: mentor._count?.coursesTaught || 0, label: "Courses", color: "text-emerald-400" },
                  { icon: PlayCircle, value: mentor._count?.enrollments || 0, label: "Students", color: "text-violet-400" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-300">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-white font-bold">{stat.value}</span>
                    <span className="text-slate-500">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 shrink-0 flex-wrap md:flex-nowrap">
              <button
                onClick={handleToggleFollow}
                disabled={followLoading || (user && user.userId === mentor.userId)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFollowing
                    ? "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95"
                }`}
              >
                {followLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <><UserMinus className="w-4 h-4" /> Unfollow</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Follow</>
                )}
              </button>

              <button
                onClick={handleMessage}
                disabled={chatLoading || (user && user.userId === mentor.userId)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[13px] font-bold text-slate-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquare className="w-4 h-4 text-slate-400" /> Message</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY: 1/3 + 2/3 grid ── */}
      <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: About, Experience, Skills */}
        <div className="space-y-5">

          {/* About */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
            <h3 className="text-[14px] font-bold text-slate-100 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" /> About
            </h3>
            <p className="text-[13px] text-slate-400 leading-relaxed whitespace-pre-wrap">
              {mentor.bio || "This mentor hasn't written a bio yet."}
            </p>
          </div>

          {/* Experience */}
          {mentor.experience && (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
              <h3 className="text-[14px] font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" /> Experience
              </h3>
              <p className="text-[13px] text-slate-400 leading-relaxed whitespace-pre-wrap">
                {mentor.experience}
              </p>
            </div>
          )}

          {/* Expertise / Skills */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
            <h3 className="text-[14px] font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" /> Expertise
            </h3>
            {parsedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {parsedSkills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-blue-500/8 text-blue-300 border border-blue-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-slate-500 italic">No skills listed.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[17px] font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-blue-400" />
              Courses by {mentor.fullName?.split(" ")[0]}
            </h2>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">
              {mentor.coursesTaught?.length || 0} courses
            </span>
          </div>

          {mentor.coursesTaught?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 p-14 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-slate-500" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-300 mb-1">No published courses yet</h3>
              <p className="text-[12px] text-slate-500 max-w-xs">This mentor hasn't published any courses. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mentor.coursesTaught.map((course: any) => (
                <div
                  key={course.courseId}
                  onClick={() => navigate(`/courses/${course.uniqueId}`)}
                  className="group rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:border-blue-500/25 hover:bg-slate-900/70 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)]"
                >
                  {/* Thumbnail */}
                  <div className="h-40 relative overflow-hidden bg-slate-800">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-950/60 to-slate-900">
                        <BookOpen className="w-10 h-10 text-blue-500/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                    {course.level && (
                      <div className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-blue-400 border border-blue-500/20 shadow-lg">
                        {course.level}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-[14px] font-bold text-slate-100 mb-2 line-clamp-2 leading-snug group-hover:text-blue-300 transition-colors">
                      {course.courseName}
                    </h3>
                    <p className="text-[12px] text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {course.description || "No description available."}
                    </p>
                    <div className="flex items-center gap-4 pt-3.5 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        {course._count?.enrollments || 0} Students
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        4.8
                      </div>
                      {course.duration && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 ml-auto">
                          <Clock className="w-3.5 h-3.5" />
                          {course.duration}h
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDetail;
