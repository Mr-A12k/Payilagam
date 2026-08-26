/**
 * @fileoverview Admin Dashboard — Pro full-width redesign.
 */
import { useEffect, useState } from "react";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import {
  DollarSign, Users, CheckCircle, Activity,
  UserPlus, BookOpen, TrendingUp, Shield, ChevronRight,
} from "lucide-react";

/* ──────────────── Stat Card ──────────────── */
const StatCard = ({
  icon: Icon, label, value, sub, accent = "blue", trend,
}: {
  icon: any; label: string; value: any; sub?: string; accent?: string; trend?: string;
}) => {
  const map: Record<string, { card: string; icon: string; badge: string }> = {
    blue:    { card: "from-blue-500/15 to-blue-600/5 border-blue-500/20",    icon: "text-blue-400 bg-blue-500/10 border-blue-500/20",    badge: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    emerald: { card: "from-emerald-500/15 to-emerald-600/5 border-emerald-500/20", icon: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    amber:   { card: "from-amber-500/15 to-amber-600/5 border-amber-500/20",   icon: "text-amber-400 bg-amber-500/10 border-amber-500/20",   badge: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    sky:     { card: "from-sky-500/15 to-sky-600/5 border-sky-500/20",        icon: "text-sky-400 bg-sky-500/10 border-sky-500/20",        badge: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  };
  const c = map[accent] || map.blue;
  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${c.card} border p-5 flex flex-col gap-4 overflow-hidden group hover:scale-[1.01] transition-transform`}>
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${c.badge}`}>
            <TrendingUp className="w-3 h-3" />{trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-[28px] font-extrabold text-slate-100 leading-none tracking-tight">{value}</div>
        <div className="text-[12px] font-semibold text-slate-300 mt-1">{label}</div>
        {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    overview: {
      totalRevenue: 0, newUsers: 0, completionRate: 0,
      systemHealth: { serverLoad: 0, status: "Loading..." },
    },
    recentUsers: [] as any[],
    recentEnrollments: [] as any[],
  });
  const [courseAnalytics, setCourseAnalytics] = useState<any[]>([]);
  const [enrollmentAnalytics, setEnrollmentAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [sR, cR, eR] = await Promise.all([
        executeHttpGetRequest(API_PATHS.ADMIN.STATS),
        executeHttpGetRequest(API_PATHS.ADMIN.ANALYTICS.COURSES),
        executeHttpGetRequest(API_PATHS.ADMIN.ANALYTICS.ENROLLMENTS),
      ]);
      if (sR.data?.success) setStats(sR.data.data);
      if (cR.data?.success) setCourseAnalytics(cR.data.data);
      if (eR.data?.success) setEnrollmentAnalytics(eR.data.data);
    } catch (e) {
      console.error("Failed to load admin stats", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const getLinePath = () => {
    if (!enrollmentAnalytics?.dailyBreakdown) return "M 0,100 L 100,100 Z";
    const dates = Object.keys(enrollmentAnalytics.dailyBreakdown).sort();
    if (!dates.length) return "M 0,100 L 100,100 Z";
    const counts = dates.map((d) => enrollmentAnalytics.dailyBreakdown[d]);
    const max = Math.max(...counts, 1);
    const sx = 100 / Math.max(counts.length - 1, 1);
    const pts = counts.map((c, i) => `${(i * sx).toFixed(1)},${(90 - (c / max) * 80).toFixed(1)}`);
    return `M 0,100 L 0,${pts[0].split(",")[1]} L ${pts.join(" L ")} L 100,100 Z`;
  };
  const getLineStroke = () => {
    if (!enrollmentAnalytics?.dailyBreakdown) return "M 0,100 L 100,100";
    const dates = Object.keys(enrollmentAnalytics.dailyBreakdown).sort();
    if (!dates.length) return "M 0,100 L 100,100";
    const counts = dates.map((d) => enrollmentAnalytics.dailyBreakdown[d]);
    const max = Math.max(...counts, 1);
    const sx = 100 / Math.max(counts.length - 1, 1);
    const pts = counts.map((c, i) => `${(i * sx).toFixed(1)},${(90 - (c / max) * 80).toFixed(1)}`);
    return `M 0,${pts[0].split(",")[1]} L ${pts.join(" L ")}`;
  };
  const getXLabels = () => {
    if (!enrollmentAnalytics?.dailyBreakdown) return [];
    const dates = Object.keys(enrollmentAnalytics.dailyBreakdown).sort();
    const step = Math.max(1, Math.floor(dates.length / 5));
    return dates.filter((_, i) => i % step === 0).map((d) =>
      new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    );
  };

  const serverLoad = stats.overview?.systemHealth?.serverLoad || 0;
  const loadColor = serverLoad > 80 ? "from-red-500 to-rose-400" : serverLoad > 50 ? "from-amber-500 to-yellow-400" : "from-emerald-500 to-teal-400";

  return (
    <div className="min-h-full w-full bg-[var(--bg-base)] text-slate-100">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden border-b border-slate-800/60">
        <div className="absolute -top-20 -left-10 w-96 h-64 bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative px-8 py-7 flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Admin Panel</span>
            </div>
            <h1 className="text-[26px] font-extrabold text-slate-100 tracking-tight leading-tight">System Overview</h1>
            <p className="text-[13px] text-slate-400 mt-1">Real-time statistics & platform activity</p>
          </div>

          {/* System health pill */}
          <div className="hidden md:flex items-center gap-3 bg-slate-900/70 border border-slate-800/60 rounded-2xl px-5 py-3 shrink-0">
            <div className={`w-2.5 h-2.5 rounded-full ${serverLoad > 80 ? "bg-red-400" : serverLoad > 50 ? "bg-amber-400" : "bg-emerald-400"} shadow-[0_0_8px_currentColor] animate-pulse`} />
            <div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">System Health</div>
              <div className="text-[13px] font-bold text-slate-200">{stats.overview?.systemHealth?.status || "Operational"}</div>
            </div>
            <div className="ml-4 w-24">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>Load</span>
                <span className="text-slate-300 font-bold">{serverLoad}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${loadColor} transition-all duration-1000`} style={{ width: `${serverLoad}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="px-8 py-7 space-y-7">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Total Revenue" value={`₹${(stats.overview?.totalRevenue || 0).toLocaleString()}`} sub="Platform earnings" accent="emerald" />
          <StatCard icon={Users} label="Total Users" value={(stats.overview?.newUsers || 0).toLocaleString()} sub="All registered" accent="blue" />
          <StatCard icon={CheckCircle} label="Completion Rate" value={`${stats.overview?.completionRate || 0}%`} sub="Course completions" accent="sky" trend="+2.4%" />
          <StatCard icon={Activity} label="Server Load" value={`${serverLoad}%`} sub={stats.overview?.systemHealth?.status} accent="amber" />
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Enrollment Chart */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[15px] font-bold text-slate-100">Enrollment Activity</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">{enrollmentAnalytics?.period || "Last 30 days"}</p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                Daily Enrollments
              </span>
            </div>

            <div className="h-44 relative w-full">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={getLinePath()} fill="url(#aGrad)" />
                    <path d={getLineStroke()} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between transform translate-y-5">
                    {getXLabels().map((l, i) => (
                      <span key={i} className="text-[10px] font-semibold text-slate-600">{l}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Top Courses */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 flex flex-col">
            <div className="mb-5">
              <h2 className="text-[15px] font-bold text-slate-100">Top Courses</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">By total enrollments</p>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : courseAnalytics.length > 0 ? (
                courseAnalytics.slice(0, 5).map((c, i) => {
                  const max = Math.max(...courseAnalytics.map((x) => x._count.enrollments), 1);
                  const pct = (c._count.enrollments / max) * 100;
                  return (
                    <div key={c.courseId} className="group">
                      <div className="flex justify-between text-[12px] mb-1.5">
                        <span className="text-slate-400 truncate mr-2 group-hover:text-slate-200 transition-colors">{c.courseName}</span>
                        <span className="font-bold text-sky-400 shrink-0">{c._count.enrollments}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-700"
                          style={{ width: `${Math.max(pct, 4)}%`, opacity: 1 - i * 0.12 }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[13px] text-slate-500 text-center mt-8">No course data yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── LOGS ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Recent Enrollments */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
              <h2 className="text-[14px] font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Recent Enrollments
              </h2>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1 overflow-y-auto max-h-72">
              {(stats.recentEnrollments?.length || 0) > 0 ? (
                <ul className="divide-y divide-slate-800/40">
                  {stats.recentEnrollments.map((e: any) => (
                    <li key={e.enrollmentId} className="px-6 py-3.5 hover:bg-slate-800/40 transition-colors flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-bold text-slate-200">{e.student?.fullName || e.student?.userName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[180px] mt-0.5">{e.course?.courseName}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {e.status}
                        </span>
                        <p className="text-[10px] text-slate-600 mt-1">{e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-slate-500 text-center py-10">No recent enrollments.</p>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
              <h2 className="text-[14px] font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-400" />
                New Users
              </h2>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1 overflow-y-auto max-h-72">
              {(stats.recentUsers?.length || 0) > 0 ? (
                <ul className="divide-y divide-slate-800/40">
                  {stats.recentUsers.map((u: any) => (
                    <li key={u.userId} className="px-6 py-3.5 hover:bg-slate-800/40 transition-colors flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-bold text-slate-200">{u.fullName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{u.email}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          u.role?.roleName === "mentor" ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                          : u.role?.roleName === "admin" ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                          {u.role?.roleName || "User"}
                        </span>
                        <p className="text-[10px] text-slate-600 mt-1">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-slate-500 text-center py-10">No recent users.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
