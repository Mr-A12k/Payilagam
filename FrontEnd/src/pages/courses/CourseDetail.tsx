/**
 * @fileoverview Course Detail page for Payilagam .
 * Renders the full course overview: hero header with stats,
 * enrollment action card, and expandable module/lesson syllabus.
 * Handles enrollment checks and the enroll-then-navigate flow.
 */
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { executeHttpGetRequest, executeHttpPostRequest, executeHttpDeleteRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { toast } from "react-hot-toast";
import {
  BookOpen,
  Star,
  Clock,
  Users,
  PlayCircle,
  FileText,
  CheckCircle,
  Lock,
  Loader2,
  LayoutList,
  Code2,
  Trophy,
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

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseResponse = await executeHttpGetRequest(`${API_PATHS.COURSES.BASE}/${uniqueId}`);
        if (courseResponse.data.success) {
          setCourse(courseResponse.data.data);
          // If the API doesn't return modules directly, fetch them
          if (
            !courseResponse.data.data.modules ||
            courseResponse.data.data.modules.length === 0
          ) {
            const modulesResponse = await executeHttpGetRequest(API_PATHS.MODULES.COURSE(uniqueId!));
            if (modulesResponse.data.success) {
              setModules(modulesResponse.data.data);
            }
          } else {
            setModules(courseResponse.data.data.modules);
          }
        }

        // Check if enrolled (only if logged in)
        if (user) {
          try {
            const enrollCheckResponse = await executeHttpGetRequest(
              API_PATHS.ENROLLMENTS.CHECK(uniqueId!),
            );
            if (enrollCheckResponse.data.success && enrollCheckResponse.data.data.enrolled) {
              setIsEnrolled(true);
              setEnrollmentProgress(enrollCheckResponse.data.data.enrollment?.progress || 0);
            }
          } catch {
                        // Not enrolled, ignore 404
          }
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
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/courses/${uniqueId}` } } });
      return;
    }

    setIsEnrolling(true);
    try {
      const response = await executeHttpPostRequest(API_PATHS.ENROLLMENTS.ENROLL(uniqueId!), {});
      if (response.data.success) {
        setIsEnrolled(true);
        toast.success("Successfully enrolled in the course!");
        // Navigate to the first lesson if modules exist
        if (modules.length > 0 && modules[0].lessons?.length > 0) {
          navigate(
            `/learn/${uniqueId}/module/${modules[0].moduleId}/lesson/${modules[0].lessons[0].lessonId}`,
          );
        }
      }
    } catch (error) {
      console.error("Enrollment failed", error);
      alert((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to enroll");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this course? This action cannot be undone.")) return;
    try {
      const response = await executeHttpDeleteRequest(`${API_PATHS.COURSES.BASE}/${uniqueId}`);
      if (response.data.success) {
        toast.success("Course deleted successfully");
        navigate("/courses");
      }
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to delete course");
    }
  };

  const handleRequestDeletion = async () => {
    if (!window.confirm("Are you sure you want to request deletion for this course? An admin will review your request.")) return;
    try {
      const response = await executeHttpPostRequest(`${API_PATHS.COURSES.BASE}/${uniqueId}/request-deletion`);
      if (response.data.success) {
        toast.success("Deletion request sent to Administrators");
      }
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to send deletion request");
    }
  };

  if (isLoading)
    return (
      <div className="flex-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );

  if (!course)
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Course not found</h1>
        <Link to="/courses" className="">
          Back to Catalog
        </Link>
      </div>
    );

  const totalLessons = modules.reduce(
    (accumulator: any, moduleItem: any) => accumulator + (moduleItem.lessons?.length || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      {/* Hero Header */}
      <div className="bg-slate-950 border-b border-slate-900/50 pt-16 pb-20 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {/* Glowing Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt=""
              className="w-full h-full object-cover blur-3xl scale-110"
            />
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {course.level}
                </span>
                <span className="text-slate-400 text-sm font-medium">
                  {course.courseCode}
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 mb-6 leading-tight drop-shadow-sm tracking-tight">
                {course.courseName}
              </h1>

              <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
                {course.description ||
                  "No description provided for this course."}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-8">
                <div className="flex items-center gap-2">
                  <Star className="icon-md text-yellow-500 fill-yellow-500" />
                  <span className="text-white font-medium">4.8</span> (124
                  ratings)
                </div>
                <div className="flex items-center gap-2">
                  <Users className="icon-md text-blue-400" />
                  <span className="text-white font-medium">
                    {course._count?.enrollments || 0}
                  </span>{" "}
                  students
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="icon-md text-blue-400" />
                  <span className="text-white font-medium">
                    {course.duration || 0} mins
                  </span>{" "}
                  total
                </div>
                <div className="flex items-center gap-2">
                  <LayoutList className="icon-md text-purple-400" />
                  <span className="text-white font-medium">
                    {totalLessons}
                  </span>{" "}
                  lessons
                </div>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={
                    course.mentor?.profileUrl ||
                    `https://ui-avatars.com/api/?name=${course.mentor?.fullName}&background=4f46e5&color=fff`
                  }
                  alt={course.mentor?.fullName}
                  className="w-12 h-12 rounded-full border-2 border-slate-700"
                />
                <div>
                  <p className="text-sm text-slate-400">Created by</p>
                  <p className="text-white font-medium">
                    {course.mentor?.fullName || "Platform Mentor"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="lg:col-span-1">
              <Card  className="!rounded-3xl !bg-slate-900/80 backdrop-blur-md sticky top-24 shadow-2xl shadow-blue-900/20 hover:border-blue-500/30 transition-all">
                <div className="aspect-video w-full bg-slate-950 rounded-xl overflow-hidden mb-8 relative group cursor-pointer border border-slate-800 shadow-inner">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex-center bg-blue-900/10">
                      <BookOpen className="w-16 h-16 text-blue-500/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex-center">
                    <div className="w-16 h-16 bg-slate-950/40 backdrop-blur-md rounded-full flex-center group-hover:bg-blue-600/80 transition-all border border-white/10 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                      <PlayCircle className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  {course.price > 0 ? (
                    <div className="text-4xl font-extrabold text-white tracking-tight">
                      ${course.price}
                    </div>
                  ) : (
                    <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 tracking-tight">
                      Free
                    </div>
                  )}
                </div>

                {isEnrolled ? (
                  <div className="space-y-5">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-start gap-3 shadow-inner shadow-emerald-500/5">
                      <CheckCircle className="icon-md text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-emerald-400">
                          You are enrolled in this course.
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                          Progress: {Math.round(enrollmentProgress)}%
                        </p>
                      </div>
                    </div>
                    {modules.length > 0 && modules[0].lessons?.length > 0 ? (
                      <Link
                        to={`/learn/${uniqueId}/module/${modules[0].moduleId}/lesson/${modules[0].lessons[0].lessonId}`}
                        className="w-full flex justify-center py-4 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all bg-blue-600 text-white"
                      >
                        {enrollmentProgress > 0 ? "Resume Course" : "Start Learning"}
                      </Link>
                    ) : (
                      <button
                        onClick={() => toast("This course doesn't have any lessons yet. Check back later!", { icon: "🚧" })}
                        className="w-full flex justify-center py-4 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all bg-blue-600 text-white opacity-80"
                      >
                        Start Learning
                      </button>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                     className="w-full py-4 text-lg font-bold rounded-xl flex-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isEnrolling ? (
                      <Loader2 className="icon-md animate-spin" />
                    ) : (
                      "Enroll Now"
                    )}
                  </Button>
                )}

                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-medium text-white">
                    This course includes:
                  </h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li className="flex items-center gap-2">
                      <PlayCircle className="icon-base" /> {totalLessons}{" "}
                      on-demand video lessons
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="icon-base" /> Downloadable resources
                    </li>
                    <li className="flex items-center gap-2">
                      <Code2 className="icon-base" /> Coding practice problems
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="icon-base" /> Certificate of completion
                    </li>
                  </ul>
                </div>

                {/* Admin / Mentor Actions */}
                {user && (user.roleId === 1 || (user.roleId === 2 && user.userId === course.mentorId)) && (
                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <h4 className="text-sm font-bold text-white mb-3">Management</h4>
                    <div className="flex flex-col gap-2">
                      <Link 
                        to={`/mentor/course/edit/${uniqueId}`}
                        className="w-full py-2.5 text-sm font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-center transition-colors"
                      >
                        Edit Course
                      </Link>
                      
                      {user.roleId === 1 ? (
                        <button 
                          onClick={handleDeleteCourse}
                          className="w-full py-2.5 text-sm font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-colors"
                        >
                          Delete Course
                        </button>
                      ) : (
                        <button 
                          onClick={handleRequestDeletion}
                          className="w-full py-2.5 text-sm font-semibold rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/20 transition-colors"
                        >
                          Request Deletion
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-white mb-8">
            Course Syllabus
          </h2>

          {modules.length === 0 ? (
            <p className="text-slate-400">
              The syllabus is currently being updated by the mentor.
            </p>
          ) : (
            <div className="space-y-5">
              {modules.map((moduleItem: any, moduleIndex: any) => (
                <Card
                  key={moduleItem.moduleId}
                   className="!p-0 !bg-slate-900/50 overflow-hidden shadow-lg hover:border-slate-700 transition-colors"
                >
                  <div className="p-6 flex-between bg-slate-900 border-b border-slate-800/50">
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">
                        <span className="text-blue-400 mr-3">
                          Module {moduleIndex + 1}:
                        </span>
                        {moduleItem.title}
                      </h3>
                      {moduleItem.description && (
                        <p className="text-sm text-slate-400 mt-2 max-w-xl">
                          {moduleItem.description}
                        </p>
                      )}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 whitespace-nowrap">
                      {moduleItem.lessons?.length || 0} lessons
                    </div>
                  </div>

                  {moduleItem.lessons && moduleItem.lessons.length > 0 && (
                    <div className="divide-y divide-slate-800/50">
                      {moduleItem.lessons.map((lessonItem: any, lessonIndex: any) => (
                        <div
                          key={lessonItem.lessonId}
                          className="p-5 pl-8 flex-between hover:bg-slate-800/40 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            {lessonItem.type === "video" ? (
                              <PlayCircle className="icon-md text-sky-400 group-hover:scale-110 transition-transform" />
                            ) : lessonItem.type === "coding" ? (
                              <Code2 className="icon-md text-blue-400 group-hover:scale-110 transition-transform" />
                            ) : (
                              <FileText className="icon-md text-slate-400 group-hover:scale-110 transition-transform" />
                            )}
                            <span className="text-slate-300 font-semibold text-sm group-hover:text-blue-300 transition-colors">
                              {moduleIndex + 1}.{lessonIndex + 1} {lessonItem.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-5">
                            {lessonItem.duration > 0 && (
                              <span className="text-xs font-medium text-slate-500 bg-slate-950 px-2 py-1 rounded-md">
                                {lessonItem.duration} min
                              </span>
                            )}
                            {!isEnrolled && !lessonItem.isFree ? (
                              <Lock className="icon-base text-slate-600" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-700 bg-slate-900 group-hover:border-blue-500/50 transition-colors"></div> // Placeholder for completion circle
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;


