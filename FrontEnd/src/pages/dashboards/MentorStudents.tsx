import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { WorkspacePage, PageHeader, LoadingState, EmptyState } from "@/components/workspace/Workspace";

export default function MentorStudents() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [page, setPage] = useState(1);
  const coursesQuery = useQuery({ queryKey: ["mentorStudentCourses"], queryFn: () => executeHttpGetRequest(API_PATHS.COURSES.MY_COURSES, { limit: 100 }) });
  const courses = Array.isArray(coursesQuery.data?.data?.data) ? coursesQuery.data.data.data : [];
  const courseId = selectedCourse || String(courses[0]?.courseId || "");
  const studentsQuery = useQuery({ queryKey: ["mentorStudents", courseId, page], queryFn: () => executeHttpGetRequest(API_PATHS.ENROLLMENTS.STUDENTS(courseId), { page, limit: 20 }), enabled: !!courseId });
  const students = Array.isArray(studentsQuery.data?.data?.data) ? studentsQuery.data.data.data : [];
  const pagination = studentsQuery.data?.data?.pagination;
  const busy = coursesQuery.isLoading || (!!courseId && studentsQuery.isLoading);
  return <WorkspacePage>
    <PageHeader title="Students" description="Enrollments and progress by course" />
    <div className="w-full max-w-lg"><label htmlFor="student-course" className="mb-2 block text-xs text-[var(--text-secondary)]">Course</label><Select value={courseId} onValueChange={(value: string) => { setSelectedCourse(value); setPage(1); }} disabled={!courses.length}><SelectTrigger id="student-course"><SelectValue placeholder="No courses available" /></SelectTrigger><SelectContent>{courses.map((course: any) => <SelectItem key={course.courseId} value={String(course.courseId)}>{course.courseName || course.courseCode}</SelectItem>)}</SelectContent></Select></div>
    {coursesQuery.isError || studentsQuery.isError ? (
      <div role="alert" className="flex flex-wrap items-center gap-3 text-sm"><p>Could not load students.</p><Button variant="outline" onClick={() => { void coursesQuery.refetch(); if (courseId) void studentsQuery.refetch(); }}>Retry</Button></div>
    ) : busy ? (
      <LoadingState label="Loading students..." />
    ) : !students.length ? (
      <EmptyState title={courseId ? "No enrolled students" : "No courses available"} />
    ) : (
      <div className="table-card-wrapper" role="region" aria-label="Students table">
        <div className="table-scroll-viewport" tabIndex={0}>
          <table className="w-full min-w-[420px] text-left text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-[var(--bg-surface-2)] text-xs text-[var(--text-muted)]">
              <tr>{["Student", "Enrolled", "Progress"].map(label => <th key={label} scope="col" className="px-4 py-3 font-medium border-b border-[var(--border-default)]">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {students.map((enrollment: any) => (
                <tr key={enrollment.enrollmentId} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-4 py-3.5 border-b border-[var(--border-subtle)] font-medium text-[var(--text-heading)]">{enrollment.student?.fullName || enrollment.student?.userName || "Student"}</td>
                  <td className="px-4 py-3.5 text-[var(--text-muted)] border-b border-[var(--border-subtle)]">{enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3.5 tabular-nums border-b border-[var(--border-subtle)]">{Math.round(Math.max(0, Math.min(100, Number(enrollment.progress) || 0)))}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination && (
          <footer className="table-card-footer px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <span>{pagination?.total ?? students.length} student{students.length === 1 ? "" : "s"} enrolled</span>
            <div className="flex items-center gap-3">
              <span>Page {page}</span>
              <Button variant="outline" size="icon-sm" aria-label="Previous page" title="Previous page" disabled={page <= 1 || studentsQuery.isFetching} onClick={() => setPage(value => value - 1)}><ArrowLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon-sm" aria-label="Next page" title="Next page" disabled={page >= pagination.totalPages || studentsQuery.isFetching || studentsQuery.isError} onClick={() => setPage(value => value + 1)}><ArrowRight className="h-4 w-4" /></Button>
            </div>
          </footer>
        )}
      </div>
    )}
  </WorkspacePage>;
}
