import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Loader2, Plus, Search } from "lucide-react";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { Button } from "@/components/ui";
import { PageHeader, WorkspacePage } from "@/components/workspace/Workspace";

const MentorDashboard = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["mentorCourses", search, page],
    queryFn: () => executeHttpGetRequest(API_PATHS.COURSES.MY_COURSES, { search, page, limit: 10 }),
  });
  const courses = Array.isArray(data?.data?.data) ? data.data.data : [];
  const pagination = data?.data?.pagination;

  return (
    <WorkspacePage>
      <PageHeader title="Courses" description="Your teaching workspace" actions={<Button asChild><Link to="/mentor/course/create"><Plus className="h-4 w-4" />Create course</Link></Button>} />
      <section className="min-w-0 border-t border-[var(--border-default)] pt-4" aria-label="Your courses">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--text-secondary)]">{pagination?.total ?? courses.length} courses</p>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
            <input aria-label="Search courses" type="search" placeholder="Search courses" value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              className="h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] pl-9 pr-3 text-sm" />
          </div>
        </div>
        {isLoading ? (
          <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--text-muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading courses...</div>
        ) : isError ? (
          <div role="alert" className="flex flex-wrap items-center gap-3 py-8 text-sm"><p>Could not load courses.</p><Button variant="outline" onClick={() => refetch()}>Retry</Button></div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-muted)]"><BookOpen className="mx-auto mb-3 h-7 w-7" /><p>{search ? "No courses match your search." : "No courses yet."}</p></div>
        ) : (
          <div className="table-card-wrapper" role="region" aria-label="Courses table">
            <div className="table-scroll-viewport" tabIndex={0}>
              <table className="w-full min-w-[620px] text-left text-sm border-separate border-spacing-0">
                <thead className="sticky top-0 z-20 bg-[var(--bg-surface-2)] text-xs text-[var(--text-muted)]">
                  <tr>{["Course", "Status", "Enrolled", "Modules", "Updated"].map((heading) => <th key={heading} scope="col" className="px-4 py-3 font-medium border-b border-[var(--border-default)]">{heading}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {courses.map((course: any) => (
                    <tr key={course.courseId} className="hover:bg-[var(--bg-surface-2)] transition-colors">
                      <td className="max-w-sm px-4 py-3 border-b border-[var(--border-subtle)]"><Link to={`/mentor/course/edit/${course.courseId}`} className="font-medium text-[var(--accent-primary)] hover:underline">{course.courseName}</Link><p className="mt-1 text-xs text-[var(--text-muted)]">{course.category?.name}</p></td>
                      <td className="px-4 py-3 capitalize border-b border-[var(--border-subtle)]">{course.status || "Unknown"}</td>
                      <td className="px-4 py-3 tabular-nums border-b border-[var(--border-subtle)]">{(course._count?.enrollments ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 tabular-nums border-b border-[var(--border-subtle)]">{course._count?.modules ?? 0}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-[var(--text-muted)] border-b border-[var(--border-subtle)]">{course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "Not available"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="table-card-footer px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
              <span>{courses.length} course{courses.length === 1 ? "" : "s"} listed</span>
              <div className="flex items-center gap-3">
                <span>Page {page}</span>
                <Button variant="outline" size="icon-sm" aria-label="Previous page" title="Previous page" disabled={page === 1 || isLoading} onClick={() => setPage((value) => value - 1)}><ArrowLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon-sm" aria-label="Next page" title="Next page" disabled={isLoading || isError || !pagination?.hasNext} onClick={() => setPage((value) => value + 1)}><ArrowRight className="h-4 w-4" /></Button>
              </div>
            </footer>
          </div>
        )}
      </section>
    </WorkspacePage>
  );
};

export default MentorDashboard;


