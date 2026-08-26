/**
 * @fileoverview Mentor Dashboard — Pro full-width redesign.
 */
import { useState, useEffect } from "react";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { useSelector } from "react-redux";
import {
  Users, TrendingUp, Star, DollarSign, UploadCloud,
  CheckCircle2, VideoOff, Copy, Eye, EyeOff,
  MessageSquare, Radio, Calendar, BookOpen,
  ChevronRight, PlusCircle, Mic,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useNavigate } from "react-router-dom";

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, trend, accent = "blue" }: any) => {
  const map: Record<string, string> = {
    blue:    "from-blue-500/15 to-blue-600/5 border-blue-500/20 text-blue-400",
    sky:     "from-sky-500/15 to-sky-600/5 border-sky-500/20 text-sky-400",
    amber:   "from-amber-500/15 to-amber-600/5 border-amber-500/20 text-amber-400",
    emerald: "from-emerald-500/15 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
  };
  const cls = map[accent] || map.blue;
  const iconColor = cls.split(" ").find((c) => c.startsWith("text-")) || "text-blue-400";
  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${cls} border p-5 flex items-center gap-4 overflow-hidden group hover:scale-[1.01] transition-transform`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/10 shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
        <h3 className="text-[22px] font-extrabold text-slate-100 leading-none tracking-tight">{value}</h3>
        {trend && (
          <span className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${iconColor}`}>
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
    </div>
  );
};

const MentorDashboard = () => {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [isStreamKeyVisible, setIsStreamKeyVisible] = useState(false);

  const fetchMyCourses = async () => {
    try {
      const response = await executeHttpGetRequest(API_PATHS.COURSES.MY_COURSES);
      if (response.data.success) setCourses(response.data.data.courses || []);
    } catch (e) {
      console.error("Failed to load mentor courses", e);
    }
  };

  useEffect(() => { fetchMyCourses(); }, []);

  const placeholderCourses = courses.length > 0 ? courses : [
    { courseId: 1, courseName: "UI/UX Psychology", status: "ACTIVE", _count: { enrollments: 4203 }, rating: 4.8, updated: "2 days ago", color: "from-blue-600 to-blue-400" },
    { courseId: 2, courseName: "Data Structures Mastery", status: "DRAFT", _count: { enrollments: 0 }, rating: null, updated: "1 week ago", color: "from-sky-600 to-sky-400" },
    { courseId: 3, courseName: "Cybersecurity Ethics", status: "ACTIVE", _count: { enrollments: 8192 }, rating: 4.9, updated: "1 month ago", color: "from-indigo-600 to-indigo-400" },
  ];

  const firstName = user?.fullName?.split(" ")[0] || user?.userName || "Mentor";
  const draftCount = placeholderCourses.filter((c) => c.status === "DRAFT").length;

  return (
    <div className="min-h-full w-full bg-[var(--bg-base)] text-slate-100">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden border-b border-slate-800/60">
        <div className="absolute -top-16 left-20 w-80 h-56 bg-blue-600/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Mentor Studio</p>
            <h1 className="text-[26px] font-extrabold text-slate-100 tracking-tight leading-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-[13px] text-slate-400 mt-1">
              {draftCount > 0
                ? `You have ${draftCount} draft course${draftCount > 1 ? "s" : ""} to finalize.`
                : "All your courses are live. Keep up the great work!"}
            </p>
          </div>
          <button
            onClick={() => navigate("/mentor/course/create")}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[13px] font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Course
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="px-8 py-7 space-y-7">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Enrollment" value="12,840" accent="blue" />
          <StatCard icon={TrendingUp} label="Avg. Completion" value="78.2%" trend="+12.4%" accent="sky" />
          <StatCard icon={Star} label="Platform Rating" value="4.92" trend="+2.1%" accent="amber" />
          <StatCard icon={DollarSign} label="Total Revenue" value="₹42.4K" accent="emerald" />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Course Builder + Your Courses */}
          <div className="lg:col-span-2 space-y-6">

            {/* Course Builder */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[15px] font-bold text-slate-100">Course Builder</h2>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  In Progress
                </span>
              </div>

              {/* Stepper */}
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-6 right-6 top-5 h-0.5 bg-slate-800 z-0" />
                <div className="absolute left-6 w-[33%] top-5 h-0.5 bg-gradient-to-r from-blue-500 to-sky-400 z-0" />
                {[
                  { n: "✓", label: "Curriculum", done: true },
                  { n: "2", label: "Media Assets", active: true },
                  { n: "3", label: "Pricing", done: false },
                  { n: "4", label: "Review", done: false },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      s.active ? "bg-blue-500 text-white ring-4 ring-blue-500/20 shadow-lg shadow-blue-500/30"
                      : s.done ? "bg-blue-500 text-white"
                      : "bg-slate-900 border-2 border-slate-700 text-slate-500"
                    }`}>
                      {s.n}
                    </div>
                    <span className={`text-[11px] font-bold ${s.done || s.active ? "text-blue-400" : "text-slate-600"}`}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Module Title</label>
                    <input
                      type="text" readOnly
                      defaultValue="Advanced Machine Learning Algorithms"
                      className="w-full p-3 border border-slate-700/60 rounded-xl bg-slate-900/60 text-slate-300 text-[13px] focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      rows={4} readOnly
                      defaultValue="Deep dive into neural network architectures and backpropagation logic..."
                      className="w-full p-3 border border-slate-700/60 rounded-xl bg-slate-900/60 text-slate-300 text-[13px] resize-none focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Module Assets</label>
                  <div className="border-2 border-dashed border-slate-700/60 hover:border-blue-500/40 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group h-[120px] mb-4">
                    <UploadCloud className="w-7 h-7 text-slate-600 group-hover:text-blue-400 mb-2 transition-colors" />
                    <p className="text-[13px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors">Drop video or slides</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Max 2GB (MP4, PDF)</p>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500/8 border border-blue-500/20 p-3 rounded-xl text-[12px] font-medium text-blue-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate">Lecture_01_Introduction.mp4 uploaded</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" className="px-6 rounded-xl font-semibold border-slate-700 text-slate-300 hover:bg-slate-800">
                  Save Draft
                </Button>
                <Button className="px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/20">
                  Continue to Pricing
                </Button>
              </div>
            </div>

            {/* Your Courses Table */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                <h2 className="text-[15px] font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Your Courses
                </h2>
                <button
                  onClick={() => navigate("/courses")}
                  className="text-[12px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Header row */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-800/40">
                <div className="col-span-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Course Name</div>
                <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</div>
                <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Enrolled</div>
                <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Rating</div>
              </div>

              {/* Rows */}
              {placeholderCourses.map((course, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/mentor/course/edit/${course.courseId}`)}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-800/40 transition-colors cursor-pointer border-b border-slate-800/30 last:border-0 group"
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${course.color || "from-blue-600 to-blue-400"} shrink-0 flex items-center justify-center shadow`}>
                      <div className="w-4 h-4 bg-white/20 rounded" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-blue-300 transition-colors leading-tight">{course.courseName}</h4>
                      <p className="text-[10px] text-slate-600 mt-0.5">Updated {course.updated || "recently"}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      course.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-center text-[13px] font-semibold text-slate-300 group-hover:text-white transition-colors">
                    {course.status === "ACTIVE" ? course._count.enrollments.toLocaleString() : "—"}
                  </div>
                  <div className="col-span-2 flex justify-center items-center gap-1 text-[13px] font-semibold text-slate-300 group-hover:text-white transition-colors">
                    {course.rating ? (
                      <>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {course.rating}
                      </>
                    ) : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Live Session + Upcoming */}
          <div className="space-y-5">

            {/* Live Session Panel */}
            <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-slate-900/40 p-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

              <div className="relative flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
                  <h2 className="text-[15px] font-bold text-slate-100">Live Session</h2>
                </div>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">Ready</span>
              </div>

              {/* Preview */}
              <div className="relative bg-slate-950 rounded-xl aspect-video mb-5 flex flex-col items-center justify-center overflow-hidden border border-slate-800">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)", backgroundSize: "15px 15px" }} />
                <VideoOff className="w-8 h-8 text-slate-700 mb-2 relative z-10" />
                <p className="text-[12px] text-slate-600 font-medium relative z-10">Stream Preview Offline</p>
              </div>

              <div className="space-y-3 relative">
                {/* Stream URL */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stream URL</label>
                  <div className="flex items-center gap-2">
                    <input readOnly type="text" defaultValue="rtmp://live.payilagam.ed"
                      className="flex-1 p-2.5 text-[12px] border border-slate-700/60 rounded-lg bg-slate-950/60 text-slate-400 font-mono focus:outline-none" />
                    <button className="p-2.5 border border-slate-700 rounded-lg bg-slate-900 text-blue-400 hover:bg-slate-800 transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stream Key */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stream Key</label>
                  <div className="flex items-center gap-2">
                    <input readOnly type={isStreamKeyVisible ? "text" : "password"} defaultValue="1234567890123456"
                      className="flex-1 p-2.5 text-[12px] border border-blue-500/30 rounded-lg bg-blue-500/8 text-blue-300 font-mono focus:outline-none" />
                    <button onClick={() => setIsStreamKeyVisible(!isStreamKeyVisible)}
                      className="p-2.5 border border-blue-500/25 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                      {isStreamKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between p-3 border border-slate-700/60 bg-slate-900/50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    <span className="text-[13px] font-semibold text-slate-300">Enable Chat</span>
                  </div>
                  <div className="w-9 h-5 bg-blue-500 rounded-full relative cursor-pointer shadow-[0_0_6px_rgba(59,130,246,0.5)]">
                    <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-0.5 top-0.5" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-700/60 bg-slate-900/50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-slate-500" />
                    <span className="text-[13px] font-semibold text-slate-500">Auto Recording</span>
                  </div>
                  <div className="w-9 h-5 bg-slate-800 rounded-full relative cursor-pointer border border-slate-700">
                    <div className="w-3.5 h-3.5 bg-slate-600 rounded-full absolute left-0.5 top-0.5" />
                  </div>
                </div>

                <Button className="w-full py-3 font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                  <Mic className="w-4 h-4" /> GO LIVE NOW
                </Button>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
              <h2 className="text-[15px] font-bold text-slate-100 mb-5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                Upcoming Sessions
              </h2>
              <div className="space-y-3">
                {[
                  { month: "Aug", day: "14", title: "Q&A: Neural Networks", time: "04:00 PM", reg: 42, color: "sky" },
                  { month: "Aug", day: "17", title: "Guest Lecture: AI Ethics", time: "10:30 AM", reg: 156, color: "blue" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 -mx-1 hover:bg-slate-800/40 rounded-xl transition-colors group cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                      s.color === "sky" ? "bg-sky-500/10 border-sky-500/20" : "bg-blue-500/10 border-blue-500/20"
                    }`}>
                      <span className={`text-[9px] font-bold uppercase ${s.color === "sky" ? "text-sky-500" : "text-blue-500"}`}>{s.month}</span>
                      <span className={`text-[18px] font-bold leading-none ${s.color === "sky" ? "text-sky-300" : "text-blue-300"}`}>{s.day}</span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-sky-300 transition-colors leading-tight">{s.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.time} · {s.reg} registered</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2.5 border border-sky-500/30 text-sky-400 font-bold text-[12.5px] rounded-xl hover:bg-sky-500/8 transition-colors">
                Schedule New Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
