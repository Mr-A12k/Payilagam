import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { useParams, Link } from "react-router-dom";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { useCourseDetail, useLessonDetail, useModulesByCourse } from "@/hooks";
import { ArrowLeft, ArrowRight, Bot, Check, List, Maximize, Minimize, Play } from "lucide-react";
import { Button } from "@/components/ui";

const LearningArena = () => {
  const { courseId = "", moduleId = "", lessonId = "" } = useParams();
  const goBack = useBackNavigation(`/courses/${courseId}`);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const courseQuery = useCourseDetail(courseId);
  const modulesQuery = useModulesByCourse(courseId);
  const lessonQuery = useLessonDetail(lessonId);
  const progressQuery = useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => executeHttpGetRequest(API_PATHS.PROGRESS.COURSE(courseId)),
    enabled: !!courseId,
    retry: false,
  });
  const course = courseQuery.data?.data?.data;
  const lesson = lessonQuery.data?.data?.data;
  const progressData = progressQuery.data?.data?.data;
  const modules = progressData?.modules ?? modulesQuery.data?.data?.data ?? [];
  const flatLessons = modules.flatMap((module: any) => (module.lessons ?? []).map((item: any) => ({ ...item, moduleId: module.moduleId })));
  const currentIndex = flatLessons.findIndex((item: any) => String(item.lessonId) === lessonId);
  const nextLesson = currentIndex >= 0 ? flatLessons[currentIndex + 1] : null;
  const progress = progressData?.overallProgress != null && Number.isFinite(Number(progressData.overallProgress))
    ? Math.max(0, Math.min(100, Number(progressData.overallProgress))) : null;

  return (
    <div className="flex h-dvh min-w-0 flex-col overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--border-default)] bg-[var(--bg-surface)] p-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button size="icon" variant="ghost" onClick={goBack} aria-label="Go back" title="Go back"><ArrowLeft className="h-4 w-4" /></Button>
          <span className="truncate text-sm font-semibold">{course?.courseName || "Course"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" title={isFocusMode ? "Exit focus mode" : "Focus mode"} aria-label={isFocusMode ? "Exit focus mode" : "Focus mode"} aria-pressed={isFocusMode} onClick={() => { setIsFocusMode(!isFocusMode); setCurriculumOpen(false); }}>
            {isFocusMode ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button variant="secondary" aria-expanded={curriculumOpen} aria-controls="lesson-curriculum" className={isFocusMode ? "" : "lg:hidden"} onClick={() => setCurriculumOpen(!curriculumOpen)}><List className="h-4 w-4" /><span className="hidden sm:inline">Curriculum</span><span className="sr-only sm:hidden">Curriculum</span></Button>
          <Button asChild size="icon" variant="secondary">
            <Link aria-label={nextLesson ? "Next lesson" : "Back to course"} title={nextLesson ? "Next lesson" : "Back to course"} to={nextLesson ? `/learn/${courseId}/module/${nextLesson.moduleId}/lesson/${nextLesson.lessonId}` : `/courses/${courseId}`} onClick={() => setCurriculumOpen(false)}><ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside id="lesson-curriculum" aria-label="Course curriculum" className={`${curriculumOpen ? "flex" : isFocusMode ? "hidden" : "hidden lg:flex"} max-h-[45dvh] w-full shrink-0 flex-col overflow-y-auto border-b border-[var(--border-default)] bg-[var(--bg-surface)] lg:order-last lg:max-h-none lg:w-72 lg:border-b-0 lg:border-l`}>
          <div className="border-b border-[var(--border-default)] p-4">
            <h2 className="text-sm font-semibold">Course Content</h2>
            {progress !== null && <div className="mt-3"><div className="mb-1 flex justify-between text-xs text-[var(--text-muted)]"><span>Completed</span><span>{progress}%</span></div><progress aria-label="Course progress" value={progress} max={100} className="h-1.5 w-full accent-[var(--accent-primary)]" /></div>}
          </div>
          {modulesQuery.isLoading && !progressData ? <p role="status" className="p-4 text-sm">Loading curriculum...</p> : modulesQuery.isError && !progressData ? <div className="p-4"><p className="mb-2 text-sm">Unable to load curriculum.</p><Button variant="secondary" onClick={() => modulesQuery.refetch()}>Retry</Button></div> : modules.length === 0 ? <p className="p-4 text-sm text-[var(--text-muted)]">No lessons available.</p> : modules.map((module: any, index: number) => (
            <section key={module.moduleId}>
              <h3 className="break-words bg-[var(--bg-surface-2)] px-4 py-3 text-xs font-semibold">{index + 1}. {module.title}</h3>
              {(module.lessons ?? []).map((item: any, lessonIndex: number) => {
                const active = String(item.lessonId) === lessonId;
                return <Link key={item.lessonId} aria-current={active ? "page" : undefined} to={`/learn/${courseId}/module/${module.moduleId}/lesson/${item.lessonId}`} onClick={() => setCurriculumOpen(false)} className={`flex items-start gap-2 border-l-2 px-4 py-3 text-sm ${active ? "border-[var(--accent-primary)] bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)]" : "border-transparent hover:bg-[var(--bg-hover)]"}`}>
                  {item.completed ? <Check aria-label="Completed" className="mt-0.5 h-4 w-4 shrink-0" /> : <Play className="mt-0.5 h-4 w-4 shrink-0" />}<span className="min-w-0 break-words">{lessonIndex + 1}. {item.title}</span>
                </Link>;
              })}
            </section>
          ))}
        </aside>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-4 sm:p-6">
            {lessonQuery.isLoading ? <p role="status">Loading lesson...</p> : lessonQuery.isError || !lesson ? <div role="alert"><p className="mb-3">Unable to load this lesson.</p><Button variant="secondary" onClick={() => lessonQuery.refetch()}>Retry</Button></div> : <>
              {lesson.videoUrl && <div className="aspect-video overflow-hidden rounded-lg border border-[var(--border-default)] bg-black"><iframe key={lessonId} title={lesson.title || "Lesson video"} src={lesson.videoUrl} className="h-full w-full border-0" allowFullScreen /></div>}
              <div className="mt-5 mb-2 text-xs text-[var(--text-muted)]">{modules.find((module: any) => String(module.moduleId) === moduleId)?.title}</div>
              <h1 className="mb-4 break-words text-xl font-semibold sm:text-2xl">{lesson.title}</h1>
              <Button asChild variant="ghost" className="mb-4"><Link to="/ai-assistant" state={{ prompt: `Explain the lesson "${lesson.title}" from "${course?.courseName || "this course"}".`, topic: "all" }}><Bot className="h-4 w-4" />Ask AI</Link></Button>
              {lesson.content ? <div className="max-w-full break-words text-sm leading-7 text-[var(--text-secondary)] [&_pre]:overflow-x-auto [&_img]:max-w-full [&_table]:block [&_table]:overflow-x-auto" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content) }} /> : <p className="text-sm text-[var(--text-muted)]">No lesson notes available.</p>}
            </>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LearningArena;
