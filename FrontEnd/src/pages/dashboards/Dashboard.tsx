/**
 * @fileoverview Student Dashboard — Pro redesign, full-width, edge-to-edge.
 */
import { useSelector } from "react-redux";
import { useMyEnrollments, useUserActivity } from "@/hooks";
import { format, subDays } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import {
  Flame, Clock, BookOpen, ArrowRight, PlayCircle,
  Award, TrendingUp, Zap, Trophy, Target, ChevronRight,
  GraduationCap, Star, Activity,
} from "lucide-react";
import { Avatar } from "@/components/ui";

/* ── tiny helpers ───────────────────────────────────────────────── */
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/* ── Stat card ──────────────────────────────────────────────────── */
const StatCard = ({
  icon: Icon, label, value, sub, accent = "blue",
}: {
  icon: any; label: string; value: any; sub: string; accent?: string;
}) => {
  const colors: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    violet: "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400",
  };
  const cls = colors[accent] || colors.blue;
  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${cls} border p-5 flex flex-col gap-3 overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/10`}>
          <Icon className={`w-5 h-5 ${cls.split(" ").find(c => c.startsWith("text-"))}`} />
        </div>
        <TrendingUp className="w-4 h-4 text-white/20" />
      </div>
      <div>
        <div className="text-[28px] font-extrabold text-slate-100 leading-none tracking-tight">{value}</div>
        <div className="text-[12px] font-semibold text-slate-300 mt-1">{label}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
      </div>
    </div>
  );
};

/* ── Course progress card ───────────────────────────────────────── */
const CourseCard = ({ course, onClick }: { course: any; onClick: () => void }) => {
  const pct = course.progressPercentage || 0;
  return (
    <div
      onClick={onClick}
      className="group relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 cursor-pointer hover:border-blue-500/30 hover:bg-slate-900/90 transition-all duration-200 overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-transparent transition-all duration-500 rounded-2xl pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
          pct === 100
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
        }`}>
          {pct === 100 ? "Completed" : course.course?.level || "Active"}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
      </div>

      <h4 className="text-[14px] font-bold text-slate-100 leading-snug mb-4 line-clamp-2 group-hover:text-blue-300 transition-colors">
        {course.course?.courseName || "Course"}
      </h4>

      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {course.course?.duration || 0}h total
        </span>
        <span className="font-semibold text-slate-300">{pct}%</span>
      </div>

      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-sky-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/* ── Main Dashboard ─────────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useSelector((state: any) => state.auth);
  const { data: myCoursesData } = useMyEnrollments();
  const myCourses = myCoursesData?.data?.data || [];
  const navigate = useNavigate();

  const currentCourse = myCourses.length > 0 ? myCourses[0] : null;
  const { data: activityDataObj } = useUserActivity(90);
  const activityData = activityDataObj?.data || {};

  // Heatmap — 15 weeks x 7 days
  const totalDays = 105;
  const today = new Date();
  const heatmapGrid: any[][] = [];
  for (let col = 0; col < 15; col++) {
    const column: any[] = [];
    for (let row = 0; row < 7; row++) {
      const daysAgo = totalDays - 1 - (col * 7 + row);
      const date = subDays(today, daysAgo);
      const dateStr = format(date, "yyyy-MM-dd");
      const count = activityData[dateStr] || 0;
      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count >= 3) level = 3;
      column.push({ date, dateStr, count, level });
    }
    heatmapGrid.push(column);
  }

  // Stats
  let currentStreak = 0;
  for (let i = 0; i < totalDays; i++) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    if (activityData[dateStr] > 0) currentStreak++;
    else if (i > 0) break;
  }
  const completedCourses = myCourses.filter((c: any) => c.progressPercentage === 100).length;
  const totalLessons = Object.values(activityData).reduce((a: any, b: any) => a + b, 0);

  const firstName = user?.fullName?.split(" ")[0] || user?.userName || "Learner";

  return (
    <div className="min-h-full w-full bg-[var(--bg-base)] text-slate-100">

      {/* ══════ TOP HERO BANNER ════════════════════════════════════ */}
      <div className="relative overflow-hidden border-b border-slate-800/60">
        {/* Background glow blobs */}
        <div className="absolute -top-20 -left-20 w-[500px] h-[300px] bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-10 right-40 w-[300px] h-[200px] bg-indigo-600/6 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative px-8 pt-8 pb-6">
          {/* Greeting row */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar
                  src={user?.profileUrl}
                  fallback={user?.fullName?.[0] || "A"}
                  size="lg"
                  className="w-14 h-14 rounded-2xl ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--bg-base)] shadow-sm" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                  {greeting()}
                </p>
                <h1 className="text-[26px] font-extrabold text-slate-100 tracking-tight leading-tight">
                  {firstName} <span className="animate-pulse">👋</span>
                </h1>
                <p className="text-[13px] text-slate-400 mt-1">
                  {currentCourse
                    ? `Continue where you left off — you're ${currentCourse.progressPercentage || 0}% through your course.`
                    : "Ready to start learning? Explore courses and level up your skills today."}
                </p>
              </div>
            </div>

            {/* Quick CTA */}
            <div className="shrink-0 hidden md:flex">
              <button
                onClick={() => currentCourse ? navigate(`/courses/${currentCourse.courseId}`) : navigate("/courses")}
                className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[13px] font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <PlayCircle className="w-4.5 h-4.5" />
                {currentCourse ? "Resume Lesson" : "Browse Courses"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stat pills row */}
          <div className="flex items-center gap-3 mt-5 flex-wrap">
            <StatPill icon={Flame} value={`${currentStreak}d`} label="Streak" color="amber" />
            <StatPill icon={Trophy} value={completedCourses} label="Completed" color="emerald" />
            <StatPill icon={BookOpen} value={myCourses.length} label="Enrolled" color="blue" />
            <StatPill icon={Zap} value={`${totalLessons}`} label="Lessons Done" color="violet" />
          </div>
        </div>
      </div>

      {/* ══════ BODY ════════════════════════════════════════════════ */}
      <div className="px-8 py-7 grid grid-cols-1 xl:grid-cols-3 gap-7">

        {/* LEFT COLUMN: Continue + Courses + Heatmap */}
        <div className="xl:col-span-2 space-y-7">

          {/* Continue Learning Hero Card */}
          {currentCourse && (
            <div className="relative rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/50 via-slate-900/80 to-slate-900/60 p-7 overflow-hidden group cursor-pointer"
              onClick={() => navigate(`/courses/${currentCourse.courseId}`)}>
              {/* Glow */}
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-400/15 transition-all duration-700 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-4">
                    <PlayCircle className="w-3.5 h-3.5" />
                    Continue Learning
                  </div>
                  <h2 className="text-[22px] font-extrabold text-slate-100 leading-tight tracking-tight mb-1.5 line-clamp-2 group-hover:text-blue-200 transition-colors">
                    {currentCourse.course?.courseName}
                  </h2>
                  <p className="text-[13px] text-slate-400 mb-5">
                    You're on a roll! Pick up right where you left off.
                  </p>

                  {/* Progress */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)] transition-all duration-700"
                        style={{ width: `${currentCourse.progressPercentage || 0}%` }}
                      />
                    </div>
                    <span className="text-[13px] font-bold text-sky-300 shrink-0">
                      {currentCourse.progressPercentage || 0}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/courses/${currentCourse.courseId}`); }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold shadow-lg shadow-blue-500/20 transition-all hover:gap-3 active:scale-95 cursor-pointer"
                    >
                      Resume Lesson
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="text-[12px] text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {currentCourse.course?.duration || 0}h total
                    </span>
                  </div>
                </div>

                {/* Right icon */}
                <div className="hidden md:flex w-32 h-32 rounded-2xl bg-slate-950/80 border border-slate-800 items-center justify-center shrink-0 shadow-inner">
                  <GraduationCap className="w-14 h-14 text-blue-400/40" strokeWidth={1} />
                </div>
              </div>
            </div>
          )}

          {/* All enrolled courses grid */}
          {myCourses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-blue-400" />
                  My Courses
                </h3>
                <Link to="/courses" className="text-[12px] font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myCourses.slice(0, 4).map((course: any, i: number) => (
                  <CourseCard
                    key={course.courseId || i}
                    course={course}
                    onClick={() => navigate(`/courses/${course.courseId}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {myCourses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 p-10 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-200 mb-1">No courses yet</h3>
                <p className="text-[12.5px] text-slate-500">Explore our course catalog and start learning today.</p>
              </div>
              <button
                onClick={() => navigate("/courses")}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold transition-all cursor-pointer"
              >
                Browse Courses
              </button>
            </div>
          )}

          {/* Activity Heatmap */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-blue-400" />
                Learning Activity
                <span className="text-[11px] font-normal text-slate-500 ml-1">Last 15 weeks</span>
              </h3>
              <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-slate-800/80" />
                <div className="w-3 h-3 rounded-sm bg-blue-900/70" />
                <div className="w-3 h-3 rounded-sm bg-blue-600/80" />
                <div className="w-3 h-3 rounded-sm bg-sky-400" />
                <span>More</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="flex gap-[5px] min-w-0">
                {heatmapGrid.map((column: any, colIdx: number) => (
                  <div key={colIdx} className="flex flex-col gap-[5px]">
                    {column.map((cell: any, rowIdx: number) => (
                      <div
                        key={rowIdx}
                        title={`${cell.count} lesson${cell.count !== 1 ? "s" : ""} · ${format(cell.date, "MMM d, yyyy")}`}
                        className={`w-[15px] h-[15px] rounded-[3px] transition-all cursor-pointer hover:scale-125 hover:ring-1 hover:ring-slate-400 ${
                          cell.level === 0 ? "bg-slate-800/60"
                          : cell.level === 1 ? "bg-blue-900/70"
                          : cell.level === 2 ? "bg-blue-600/80"
                          : "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.5)]"
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Stats + Quick Actions */}
        <div className="space-y-5">
          {/* Stats grid */}
          <div>
            <h3 className="text-[14px] font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Your Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Flame} label="Day Streak" value={currentStreak} sub={currentStreak > 0 ? "Keep it up! 🔥" : "Start today"} accent="amber" />
              <StatCard icon={Trophy} label="Completed" value={completedCourses} sub={completedCourses > 0 ? "Certificates" : "Earn yours"} accent="emerald" />
              <StatCard icon={Target} label="Enrolled" value={myCourses.length} sub="Total courses" accent="blue" />
              <StatCard icon={Zap} label="Lessons" value={totalLessons as number} sub="Done so far" accent="violet" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
            <h3 className="text-[13px] font-bold text-slate-300 mb-4 uppercase tracking-widest">Quick Access</h3>
            <div className="space-y-1">
              {[
                { label: "Browse Courses", path: "/courses", icon: BookOpen, color: "text-blue-400" },
                { label: "My Learning", path: "/learning", icon: GraduationCap, color: "text-emerald-400" },
                { label: "AI Assistant", path: "/ai-assistant", icon: Zap, color: "text-violet-400" },
                { label: "Assignments", path: "/assignments", icon: Target, color: "text-amber-400" },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left hover:bg-slate-800/60 transition-all group cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center group-hover:border-slate-600 transition-colors`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-[13px] font-medium text-slate-300 group-hover:text-slate-100 transition-colors">{item.label}</span>
                  <ChevronRight className="ml-auto w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Level Up Card */}
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-slate-900/40 p-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
                <Award className="w-5 h-5 text-violet-400" />
              </div>
              <h4 className="text-[14px] font-bold text-slate-100 mb-1">Level Up Your Skills</h4>
              <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
                Complete courses to earn certificates and showcase your expertise.
              </p>
              <button
                onClick={() => navigate("/courses")}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/25 text-violet-300 text-[12.5px] font-bold transition-all cursor-pointer"
              >
                Explore Courses
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Tiny stat pill for hero section ───────────────────────────── */
const StatPill = ({ icon: Icon, value, label, color = "blue" }: any) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-semibold ${colors[color]}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-slate-100 font-bold">{value}</span>
      <span className="text-slate-500">{label}</span>
    </div>
  );
};

export default Dashboard;
