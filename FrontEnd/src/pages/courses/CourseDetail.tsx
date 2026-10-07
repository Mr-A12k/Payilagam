/**
 * @fileoverview Course Detail page for Payilagam .
 * Course overview, enrollment actions, and expandable lesson syllabus.
 * Handles enrollment checks and the enroll-then-navigate flow.
 */
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui";
import { WorkspacePage, PageHeader, LoadingState, EmptyState } from "@/components/workspace/Workspace";
import "./CourseWorkspace.css";
import CourseQuizTasks from "./CourseQuizTasks";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useSelector } from "react-redux";
import {
  executeHttpGetRequest,
  executeHttpPostRequest,
  executeHttpDeleteRequest,
} from "@/api/commonServices";
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
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Pencil,
  Trash2,
} from "lucide-react";

const CourseDetail = () => {
  const { uniqueId } = useParams();
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const goBack = useBackNavigation("/courses");
  const queryClient = useQueryClient();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      setLoadFailed(false);
      setCourse(null);
      setModules([]);
      setIsEnrolled(false);
      setEnrollmentProgress(0);
      try {
        const courseResponse = await executeHttpGetRequest(
          `${API_PATHS.COURSES.BASE}/${uniqueId}`,
        );
        if (courseResponse.data.success) {
          setCourse(courseResponse.data.data);
          // If the API doesn't return modules directly, fetch them
          if (
            !courseResponse.data.data.modules ||
            courseResponse.data.data.modules.length === 0
          ) {
            const modulesResponse = await executeHttpGetRequest(
              API_PATHS.MODULES.COURSE(uniqueId!),
            );
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
            if (
              enrollCheckResponse.data.success &&
              enrollCheckResponse.data.data.enrolled
            ) {
              setIsEnrolled(true);
              setEnrollmentProgress(
                enrollCheckResponse.data.data.enrollment?.progress || 0,
              );
            }
          } catch {
            // Not enrolled, ignore 404
          }
        }
      } catch (error) {
        setLoadFailed(true);
        console.error("Failed to load course details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseData();
  }, [uniqueId, user, retryCount]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login", {
        state: { from: { pathname: `/courses/${uniqueId}` } },
      });
      return;
    }

    setIsEnrolling(true);
    try {
      const response = await executeHttpPostRequest(
        API_PATHS.ENROLLMENTS.ENROLL(uniqueId!),
        {},
      );
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
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to enroll",
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this course? This action cannot be undone.",
      )
    )
      return;
    try {
      const response = await executeHttpDeleteRequest(
        `${API_PATHS.COURSES.BASE}/${uniqueId}`,
      );
      if (response.data.success) {
        toast.success("Course deleted successfully");
        void queryClient.invalidateQueries({ queryKey: ["courses"] });
        void queryClient.invalidateQueries({ queryKey: ["mentorCourses"] });
        void queryClient.invalidateQueries({ queryKey: ["adminCourseAnalytics"] });
        navigate("/courses");
      }
    } catch (error) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to delete course",
      );
    }
  };

  const handleRequestDeletion = async () => {
    if (
      !window.confirm(
        "Are you sure you want to request deletion for this course? An admin will review your request.",
      )
    )
      return;
    try {
      const response = await executeHttpPostRequest(
        `${API_PATHS.COURSES.BASE}/${uniqueId}/request-deletion`,
      );
      if (response.data.success) {
        toast.success("Deletion request sent to Administrators");
      }
    } catch (error) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to send deletion request",
      );
    }
  };

  if (isLoading) return <WorkspacePage><LoadingState label="Loading course details..." /></WorkspacePage>;

  if (!course) return (
    <WorkspacePage>
      <PageHeader title={loadFailed ? "Course unavailable" : "Course not found"} />
      <EmptyState title={loadFailed ? "Unable to load course details" : "This course is not available"}
        action={<div className="flex flex-wrap justify-center gap-2">{loadFailed && <Button variant="secondary" onClick={() => setRetryCount((count) => count + 1)}><RotateCcw className="h-4 w-4" />Retry</Button>}<Button variant="outline" onClick={goBack}><ArrowLeft className="h-4 w-4" />Go back</Button></div>} />
    </WorkspacePage>
  );

  const totalLessons = modules.reduce((count, moduleItem) => count + (moduleItem.lessons?.length || 0), 0);
  const numericProgress = Number(enrollmentProgress);
  const progress = Number.isFinite(numericProgress) ? Math.min(100, Math.max(0, numericProgress)) : 0;
  const firstModule = modules.find((moduleItem) => moduleItem.lessons?.length > 0);
  const firstLesson = firstModule?.lessons?.[0];
  const canManage = user && (user.roleId === 1 || (user.roleId === 2 && user.userId === course.mentorId));

  return (
    <WorkspacePage className="course-workspace">
      <PageHeader title={course.courseName} actions={<Button variant="ghost" size="sm" onClick={goBack}><ArrowLeft className="h-4 w-4" />Go back</Button>} />
      <div className="course-detail-layout">
        <div className="min-w-0">
          <section className="course-overview" aria-label="Course overview">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
              {course.level && <span className="course-label">{course.level}</span>}
              {course.courseCode && <span>{course.courseCode}</span>}
            </div>
            <p className="course-description">{course.description || "No description provided for this course."}</p>
            <dl className="course-facts">
              <div><dt><Star aria-hidden="true" />Rating</dt><dd>{course.averageRating ?? "No ratings"} <span>({course._count?.reviews ?? 0})</span></dd></div>
              <div><dt><Users aria-hidden="true" />Students</dt><dd>{course._count?.enrollments || 0}</dd></div>
              <div><dt><Clock aria-hidden="true" />Duration</dt><dd>{course.duration != null ? `${course.duration} min` : "Not provided"}</dd></div>
              <div><dt><LayoutList aria-hidden="true" />Lessons</dt><dd>{totalLessons}</dd></div>
            </dl>
            <div className="course-instructor">
              <Avatar src={course.mentor?.profileUrl} fallback={course.mentor?.fullName?.[0] || "?"} className="h-9 w-9" />
              <div><p>Instructor</p><span>{course.mentor?.fullName || "Platform Mentor"}</span></div>
            </div>
          </section>
          <section className="course-syllabus" aria-labelledby="syllabus-heading">
            <div className="course-section-heading"><h2 id="syllabus-heading">Course syllabus</h2><span>{modules.length} modules · {totalLessons} lessons</span></div>
            {modules.length === 0 ? <EmptyState title="Syllabus not available yet" description="The mentor has not published any modules." /> :
              <div>{modules.map((moduleItem, moduleIndex) => (
                <details className="course-module" key={moduleItem.moduleId} open={moduleIndex === 0}>
                  <summary><span className="course-module-number">{String(moduleIndex + 1).padStart(2, "0")}</span><span className="course-module-title">{moduleItem.title}</span><span className="course-module-count">{moduleItem.lessons?.length || 0} lessons</span><ChevronDown aria-hidden="true" className="h-4 w-4" /></summary>
                  {moduleItem.description && <p className="course-module-description">{moduleItem.description}</p>}
                  {moduleItem.lessons?.length ? <ul>{moduleItem.lessons.map((lessonItem: any, lessonIndex: number) => {
                    const accessible = isEnrolled || lessonItem.isFree;
                    const Icon = lessonItem.type === "video" ? PlayCircle : lessonItem.type === "coding" ? Code2 : FileText;
                    const content = <><Icon aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="course-lesson-title">{moduleIndex + 1}.{lessonIndex + 1} {lessonItem.title}</span>{lessonItem.duration > 0 && <span className="course-lesson-duration">{lessonItem.duration} min</span>}{accessible ? <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /> : <><Lock aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="sr-only">Enrollment required</span></>}</>;
                    return <li key={lessonItem.lessonId}>{accessible ? <Link className="course-lesson" to={`/learn/${uniqueId}/module/${moduleItem.moduleId}/lesson/${lessonItem.lessonId}`}>{content}</Link> : <div className="course-lesson course-lesson-locked">{content}</div>}</li>;
                  })}</ul> : <p className="course-module-description">No lessons published yet.</p>}
                </details>
              ))}</div>}
          </section>
          {isEnrolled && user?.role === "student" && <CourseQuizTasks key={course.courseId} courseId={course.courseId} />}
        </div>
        <aside className="course-enrollment" aria-label="Course enrollment">
          <div className="course-cover">{course.thumbnail ? <img src={course.thumbnail} alt="" /> : <BookOpen aria-hidden="true" className="h-8 w-8" />}</div>
          <div className="course-price">{course.price > 0 ? `$${course.price}` : "Free"}<span>Course access</span></div>
          {isEnrolled ? <>
            <div className="course-enrolled-status"><CheckCircle aria-hidden="true" className="h-4 w-4" /><span>Enrolled</span><span>{Math.round(progress)}%</span></div>
            <progress className="course-progress" aria-label="Course progress" value={progress} max={100} />
            {firstLesson ? <Button asChild className="w-full"><Link to={`/learn/${uniqueId}/module/${firstModule.moduleId}/lesson/${firstLesson.lessonId}`}><PlayCircle className="h-4 w-4" />{progress > 0 ? "Continue learning" : "Start learning"}</Link></Button> : <p className="text-sm text-[var(--text-muted)]">Lessons are not available yet.</p>}
          </> : <Button onClick={handleEnroll} disabled={isEnrolling} className="w-full">{isEnrolling ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}{isEnrolling ? "Enrolling..." : "Enroll now"}</Button>}
          <p className="course-includes"><PlayCircle aria-hidden="true" className="h-4 w-4" />{totalLessons} lessons included</p>
          {canManage && <section className="course-management"><h2>Management</h2><Button asChild variant="outline" className="w-full"><Link to={`/mentor/course/edit/${uniqueId}`}><Pencil className="h-4 w-4" />Edit course</Link></Button><Button variant="ghost" onClick={user.roleId === 1 ? handleDeleteCourse : handleRequestDeletion} className="w-full !text-[var(--status-danger)]"><Trash2 className="h-4 w-4" />{user.roleId === 1 ? "Delete course" : "Request deletion"}</Button></section>}
        </aside>
      </div>
    </WorkspacePage>
  );
};

export default CourseDetail;
