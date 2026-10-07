import { useState } from "react";
import { BookMarked, ChevronLeft, ChevronRight, PlayCircle, Search, RotateCcw } from "lucide-react";
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { Link } from "react-router-dom";
import { useMyEnrollments } from "@/hooks";
import { WorkspacePage, PageHeader, LoadingState, EmptyState } from "@/components/workspace/Workspace";
import "./LearningWorkspace.css";

const Learning = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { data, isLoading, isError, refetch } = useMyEnrollments({ page, limit: 12 });
  const enrollments = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const visibleEnrollments = enrollments.filter((enrollment: any) => {
    const matchesSearch = `${enrollment.course?.courseName ?? ""} ${enrollment.course?.courseCode ?? ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === "all" || (status === "active" ? !["completed", "dropped"].includes(enrollment.status) : enrollment.status === status));
  });

  return (
    <WorkspacePage className="learning-workspace">
      <PageHeader title="My Learning" description="Your enrolled courses and lesson progress." actions={<Button asChild variant="outline" size="sm"><Link to="/courses"><BookMarked className="h-4 w-4" />Browse courses</Link></Button>} />
      <div className="learning-toolbar">
        <label className="learning-search"><Search aria-hidden="true" className="h-4 w-4" /><input aria-label="Search courses on this page" placeholder="Search this page" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <div className="learning-select"><label htmlFor="learning-status">Status</label><Select value={status} onValueChange={setStatus}><SelectTrigger id="learning-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All courses</SelectItem><SelectItem value="active">In progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="dropped">Dropped</SelectItem></SelectContent></Select></div>
      </div>
      {isLoading ? <LoadingState label="Loading courses..." /> : isError ? (
        <div role="alert" className="learning-error">
          <p>Unable to load your courses.</p>
          <Button variant="secondary" onClick={() => refetch()}><RotateCcw className="h-4 w-4" />Retry</Button>
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState title="No enrolled courses" description="Courses you enroll in will appear here." action={<Button asChild><Link to="/courses">Browse courses</Link></Button>} />
      ) : visibleEnrollments.length === 0 ? (
        <EmptyState title="No matching courses on this page" action={<Button variant="secondary" onClick={() => { setSearch(""); setStatus("all"); }}>Clear filters</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleEnrollments.map((enrollment: any) => {
            const numericProgress = Number(enrollment.progress);
            const progress = Number.isFinite(numericProgress) ? Math.min(100, Math.max(0, numericProgress)) : 0;
            return (
              <article key={enrollment.enrollmentId ?? enrollment.courseId} className="learning-course">
                <div className="learning-course-media">{enrollment.course?.thumbnail ? <img src={enrollment.course.thumbnail} alt="" loading="lazy" /> : <BookMarked aria-hidden="true" className="h-6 w-6" />}</div>
                <div className="learning-course-body">
                  <p className="mb-1 text-xs text-[var(--text-muted)]">{enrollment.course?.courseCode}</p>
                  <h2 className="mb-4 break-words text-base font-semibold">{enrollment.course?.courseName || "Untitled Course"}</h2>
                  <div className="mb-2 flex justify-between gap-2 text-xs text-[var(--text-secondary)]">
                    <span>{enrollment.status === "completed" ? "Completed" : enrollment.status === "dropped" ? "Dropped" : "In progress"}</span>
                    <span>{progress}%</span>
                  </div>
                  <progress aria-label={`${enrollment.course?.courseName || "Course"} progress`} value={progress} max={100} className="learning-progress" />
                  <Button asChild variant="ghost" className="mt-3 w-full">
                    <Link to={`/courses/${enrollment.courseId}`}><PlayCircle className="h-4 w-4" />{enrollment.status === "completed" ? "Review Course" : "Continue Learning"}</Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {(page > 1 || pagination?.totalPages > 1) && (
        <nav aria-label="Course pages" className="mt-5 flex items-center justify-end gap-3">
          <Button size="icon" variant="secondary" aria-label="Previous page" title="Previous page" disabled={page === 1 || isLoading} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span aria-live="polite" className="text-sm">Page {page}{pagination?.totalPages ? ` of ${pagination.totalPages}` : ""}</span>
          <Button size="icon" variant="secondary" aria-label="Next page" title="Next page" disabled={isLoading || !pagination || page >= pagination.totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </nav>
      )}
    </WorkspacePage>
  );
};

export default Learning;
