/**
 * @fileoverview Course Detail — Pro full-width redesign.
 */
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { executeHttpGetRequest, executeHttpPostRequest, executeHttpDeleteRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { toast } from "react-hot-toast";
import {
  BookOpen, Star, Clock, Users, PlayCircle, FileText, CheckCircle,
  Lock, Loader2, LayoutList, Code2, Trophy, ArrowLeft, ChevronDown,
  ChevronRight, Edit, Trash2, AlertTriangle, Zap,
} from "lucide-react";

const CourseDetail = () => {
  const { uniqueId } = useParams();
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseResponse = await executeHttpGetRequest(`${API_PATHS.COURSES.BASE}/${uniqueId}`);
        if (courseResponse.data.success) {
          setCourse(courseResponse.data.data);
          if (!courseResponse.data.data.modules || courseResponse.data.data.modules.length === 0) {
            const modulesResponse = await executeHttpGetRequest(API_PATHS.MODULES.COURSE(uniqueId!));
            if (modulesResponse.data.success) setModules(modulesResponse.data.data);
          } else {
            setModules(courseResponse.data.data.modules);
          }
        }
        if (user) {
          try {
            const enrollCheckResponse = await executeHttpGetRequest(API_PATHS.ENROLLMENTS.CHECK(uniqueId!));
            if (enrollCheckResponse.data.success && enrollCheckResponse.data.data.enrolled) {
              setIsEnrolled(true);
              setEnrollmentProgress(enrollCheckResponse.data.data.enrollment?.progress || 0);
            }
          } catch { /* Not enrolled */ }
        }
      } catch (error) {
        console.error("Failed to load course details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseData();
  }, [uniqueId, user]);

  const handleEnroll = async () => {
    if (!user) { navigate("/login", { state: { from: { pathname: `/courses/${uniqueId}` } } }); return; }
    setIsEnrolling(true);
    try {
      const response = await executeHttpPostRequest(API_PATHS.ENROLLMENTS.ENROLL(uniqueId!), {});
      if (response.data.success) {
        setIsEnrolled(true);
        toast.success("Successfully enrolled in the course!");
        if (modules.length > 0 && modules[0].lessons?.length > 0) {
          navigate(`/learn/${uniqueId}/module/${modules[0].moduleId}/lesson/${modules[0].lessons[0].lessonId}`);
        }
      }
    } catch (error) {
      toast.error((error as import("axios").AxiosError<{ message?: string }>)?.response?.data?.message || "Failed to enroll");
    } finally { setIsEnrolling(false); }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this course?")) return;
    try {
      const response = await executeHttpDeleteRequest(`${API_PATHS.COURSES.BASE}/${uniqueId}`);
      if (response.data.success) { toast.success("Course deleted successfully"); navigate("/courses"); }
    } catch (error) {
      toast.error((error as import("axios").AxiosError<{ message?: string }>)?.response?.data?.message || "Failed to delete course");
    }
  };

  const handleRequestDeletion = async () => {
    if (!window.confirm("Are you sure you want to request deletion for this course?")) return;
    try {
      const response = await executeHttpPostRequest(`${API_PATHS.COURSES.BASE}/${uniqueId}/request-deletion`);
      if (response.data.success) toast.success("Deletion request sent to Administrators");
    } catch (error) {
      toast.error((error as import("axios").AxiosError<{ message?: string }>)?.response?.data?.message || "Failed to send deletion request");
    }
  };

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-slate-500 font-medium">Loading course...</p>
      </div>
    </div>
  );

  if (!course) return (
    <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4 px-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
        <BookOpen className="w-7 h-7 text-slate-500" />
      </div>
      <h1 className="text-[20px] font-bold text-slate-200">Course not found</h1>
      <Link to="/courses" className="flex items-center gap-2 text-[13px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>
    </div>
  );

  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);

  const levelColors: Record<string, string> = {
    Beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    Advanced: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  };
  const levelClass = levelColors[course.level] || "bg-blue-500/15 text-blue-400 border-blue-500/25";

  return (
    <div className="min-h-full w-full bg-[var(--bg-base)] text-slate-100">

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden border-b border-slate-800/60">
        {/* Background blur from thumbnail */}
        {course.thumbnail && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            <img src={course.thumbnail} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
          </div>
        )}
        <div className="absolute -top-20 -left-10 w-96 h-72 bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-10 right-20 w-64 h-48 bg-indigo-600/6 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative px-8 pt-7 pb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mb-6">
            <Link to="/courses" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Courses
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-400 truncate max-w-[200px]">{course.courseName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course Info */}
            <div className="lg:col-span-2">
              {/* Level + Code badges */}
              <div className="flex items-center gap-2.5 mb-5 flex-wrap">
                {course.level && (
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${levelClass}`}>
                    {course.level}
                  </span>
                )}
                {course.courseCode && (
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/60">
                    {course.courseCode}
                  </span>
                )}
                {course.category?.name && (
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                    {course.category.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-[28px] md:text-[36px] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 leading-tight tracking-tight mb-4">
                {course.courseName}
              </h1>

              {/* Description */}
              <p className="text-[14px] text-slate-400 leading-relaxed max-w-2xl mb-7">
                {course.description || "No description provided for this course."}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 mb-7">
                {[
                  { icon: Star, label: "4.8 (124 ratings)", color: "text-amber-400", fill: true },
                  { icon: Users, label: `${course._count?.enrollments || 0} students`, color: "text-blue-400" },
                  { icon: Clock, label: `${course.duration || 0} mins`, color: "text-blue-400" },
                  { icon: LayoutList, label: `${totalLessons} lessons`, color: "text-violet-400" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-300">
                    <stat.icon className={`w-4 h-4 ${stat.color} ${stat.fill ? "fill-amber-400" : ""}`} />
                    {stat.label}
                  </div>
                ))}
              </div>

              {/* Mentor */}
              <div className="flex items-center gap-3">
                <img
                  src={course.mentor?.profileUrl || `https://ui-avatars.com/api/?name=${course.mentor?.fullName}&background=1e40af&color=fff`}
                  alt={course.mentor?.fullName}
                  className="w-11 h-11 rounded-xl border border-slate-700 object-cover"
                />
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Created by</p>
                  <p className="text-[13px] font-bold text-slate-200">{course.mentor?.fullName || "Platform Mentor"}</p>
                </div>
              </div>
            </div>

            {/* Right: Action Card */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-md p-5 sticky top-4 shadow-2xl shadow-blue-900/10">
                {/* Thumbnail Preview */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-5 bg-slate-950 border border-slate-800 group cursor-pointer shadow-inner">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-950/60 to-slate-900">
                      <BookOpen className="w-12 h-12 text-blue-500/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-slate-950/50 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-blue-600/80 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                      <PlayCircle className="w-7 h-7 text-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  {course.price > 0 ? (
                    <div className="text-[32px] font-extrabold text-white tracking-tight">₹{course.price}</div>
                  ) : (
                    <div className="text-[32px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight">Free</div>
                  )}
                </div>

                {/* CTA */}
                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-500/8 border border-emerald-500/25 p-4 rounded-xl flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[13px] font-bold text-emerald-400">You're enrolled!</p>
                        <div className="mt-2 mb-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all" style={{ width: `${Math.round(enrollmentProgress)}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{Math.round(enrollmentProgress)}% complete</p>
                      </div>
                    </div>
                    {modules.length > 0 && modules[0].lessons?.length > 0 ? (
                      <Link
                        to={`/learn/${uniqueId}/module/${modules[0].moduleId}/lesson/${modules[0].lessons[0].lessonId}`}
                        className="w-full flex items-center justify-center gap-2 py-3.5 text-[14px] font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-95"
                      >
                        <PlayCircle className="w-4.5 h-4.5" />
                        {enrollmentProgress > 0 ? "Resume Course" : "Start Learning"}
                      </Link>
                    ) : (
                      <button
                        onClick={() => toast("This course doesn't have any lessons yet. Check back later!", { icon: "🚧" })}
                        className="w-full flex items-center justify-center gap-2 py-3.5 text-[14px] font-bold rounded-xl bg-blue-600/60 text-white/60 cursor-not-allowed"
                      >
                        Start Learning
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-[14px] font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                  >
                    {isEnrolling ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Zap className="w-4.5 h-4.5" />}
                    {isEnrolling ? "Enrolling..." : "Enroll Now — It's Free"}
                  </button>
                )}

                {/* Course includes */}
                <div className="mt-5 pt-5 border-t border-slate-800/60">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">This course includes</p>
                  <ul className="space-y-2.5">
                    {[
                      { icon: PlayCircle, label: `${totalLessons} on-demand video lessons`, color: "text-blue-400" },
                      { icon: FileText, label: "Downloadable resources", color: "text-violet-400" },
                      { icon: Code2, label: "Coding practice problems", color: "text-emerald-400" },
                      { icon: Trophy, label: "Certificate of completion", color: "text-amber-400" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-[12.5px] text-slate-400">
                        <item.icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Management (Admin/Mentor) */}
                {user && (user.roleId === 1 || (user.roleId === 2 && user.userId === course.mentorId)) && (
                  <div className="mt-5 pt-5 border-t border-slate-800/60">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Management</p>
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/mentor/course/edit/${uniqueId}`}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[12.5px] font-semibold text-white transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Course
                      </Link>
                      {user.roleId === 1 ? (
                        <button
                          onClick={handleDeleteCourse}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-[12.5px] font-semibold border border-red-500/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Course
                        </button>
                      ) : (
                        <button
                          onClick={handleRequestDeletion}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white text-[12.5px] font-semibold border border-amber-500/20 transition-all cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Request Deletion
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SYLLABUS SECTION ── */}
      <div className="px-8 py-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-7">
            <h2 className="text-[20px] font-extrabold text-slate-100">Course Syllabus</h2>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">
              {modules.length} modules · {totalLessons} lessons
            </span>
          </div>

          {modules.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 p-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                <LayoutList className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-[14px] font-bold text-slate-300">Syllabus coming soon</p>
              <p className="text-[12px] text-slate-500 mt-1">The mentor is currently building this course.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((moduleItem: any, moduleIndex: number) => {
                const isExpanded = expandedModules.has(moduleIndex);
                return (
                  <div key={moduleItem.moduleId} className="rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(moduleIndex)}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-800/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-extrabold text-blue-400">{moduleIndex + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-[14px] font-bold text-slate-100 leading-tight">{moduleItem.title}</h3>
                          {moduleItem.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{moduleItem.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                          {moduleItem.lessons?.length || 0} lessons
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {/* Lesson List */}
                    {isExpanded && moduleItem.lessons && moduleItem.lessons.length > 0 && (
                      <div className="border-t border-slate-800/60 divide-y divide-slate-800/40">
                        {moduleItem.lessons.map((lesson: any, lessonIndex: number) => (
                          <div
                            key={lesson.lessonId}
                            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/30 transition-colors group"
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Icon */}
                              <div className="shrink-0">
                                {lesson.type === "video" ? (
                                  <PlayCircle className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                                ) : lesson.type === "coding" ? (
                                  <Code2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                                ) : (
                                  <FileText className="w-4 h-4 text-slate-500 group-hover:scale-110 transition-transform" />
                                )}
                              </div>
                              <span className="text-[12.5px] font-semibold text-slate-300 group-hover:text-blue-300 transition-colors">
                                {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                              </span>
                              {lesson.isFree && (
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Free</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                              {lesson.duration > 0 && (
                                <span className="text-[10px] font-semibold text-slate-600 bg-slate-800/60 px-2 py-0.5 rounded-lg">
                                  {lesson.duration} min
                                </span>
                              )}
                              {!isEnrolled && !lesson.isFree ? (
                                <Lock className="w-3.5 h-3.5 text-slate-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-700 bg-slate-900 group-hover:border-blue-500/50 transition-colors" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
