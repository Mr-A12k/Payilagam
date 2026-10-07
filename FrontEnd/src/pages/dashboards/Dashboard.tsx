import { useSelector } from "react-redux";
import { useMyEnrollments, useUserActivity } from "@/hooks";
import { format, subDays } from "date-fns";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { PageHeader, WorkspacePage } from "@/components/workspace/Workspace";

const progress = (value: unknown) => Math.min(100, Math.max(0, Number(value) || 0));

const Dashboard = () => {
  const { user } = useSelector((state: any) => state.auth);
  const enrollments = useMyEnrollments();
  const activity = useUserActivity(90);
  const myCourses = Array.isArray(enrollments.data?.data?.data) ? enrollments.data.data.data : [];
  const activityData = activity.data?.data?.data || {};
  const currentCourse = myCourses.find((course: any) => progress(course.progressPercentage) < 100);
  const otherCourses = myCourses.filter((course: any) => course !== currentCourse);
  const today = new Date();
  const days = Array.from({ length: 84 }, (_, index) => {
    const date = subDays(today, 83 - index);
    const count = Number(activityData[format(date, "yyyy-MM-dd")]) || 0;
    return { date, count };
  });
  let currentStreak = 0;
  for (let index = 0; index < 90; index++) {
    if (Number(activityData[format(subDays(today, index), "yyyy-MM-dd")]) > 0) currentStreak++;
    else if (index > 0) break;
  }
  const completedCourses = myCourses.filter((course: any) => progress(course.progressPercentage) === 100).length;

  return (
    <WorkspacePage>
      <PageHeader title="Dashboard" description={`Welcome back, ${user?.fullName?.split(" ")[0] || user?.userName || "Student"}.`} actions={<Button variant="outline" asChild><Link to="/courses">Browse courses <ArrowRight className="h-4 w-4" /></Link></Button>} />
      <dl className="grid grid-cols-2 gap-4 border-y border-[var(--border-default)] py-4 sm:grid-cols-3">
        {[{ label: "Enrolled", value: enrollments.isLoading || enrollments.isError ? "-" : myCourses.length }, { label: "Completed", value: enrollments.isLoading || enrollments.isError ? "-" : completedCourses }, { label: "Day streak", value: activity.isLoading || activity.isError ? "-" : currentStreak }].map(({ label, value }) => <div key={label}><dt className="text-xs text-[var(--text-muted)]">{label}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd></div>)}
      </dl>
      {enrollments.isLoading ? <p role="status" className="flex items-center gap-2 py-6 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading courses...</p> : enrollments.isError ? <div role="alert" className="flex flex-wrap items-center gap-3 text-sm"><p>Could not load your courses.</p><Button variant="outline" onClick={() => enrollments.refetch()}>Retry</Button></div> : (
        <section className="border-b border-[var(--border-default)] pb-5">
          <h2 className="mb-3 text-base font-semibold">Continue learning</h2>
          {currentCourse ? <div className="flex flex-wrap items-center justify-between gap-4"><div className="min-w-0 flex-1 basis-60"><Link to={`/courses/${currentCourse.courseId}`} className="font-medium hover:text-[var(--accent-primary)]">{currentCourse.course?.courseName || "Course"}</Link><div className="mt-3 flex items-center gap-3"><div className="h-1.5 max-w-md flex-1 overflow-hidden rounded-full bg-[var(--bg-surface-3)]"><div className="h-full bg-[var(--accent-primary)]" style={{ width: `${progress(currentCourse.progressPercentage)}%` }} /></div><span className="text-xs text-[var(--text-muted)]">{progress(currentCourse.progressPercentage)}%</span></div></div><Button asChild><Link to={`/courses/${currentCourse.courseId}`}>Resume <ArrowRight className="h-4 w-4" /></Link></Button></div> : <p className="text-sm text-[var(--text-muted)]">{myCourses.length ? "All your current courses are complete." : "You have not enrolled in a course yet."}</p>}
        </section>
      )}
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">Learning activity</h2><span className="text-xs text-[var(--text-muted)]">Last 12 weeks</span></div>
          {activity.isLoading ? <p role="status" className="py-6 text-sm text-[var(--text-muted)]">Loading activity...</p> : activity.isError ? <div role="alert" className="flex flex-wrap items-center gap-3 text-sm"><p>Could not load activity.</p><Button variant="outline" onClick={() => activity.refetch()}>Retry</Button></div> : <div className="max-w-full overflow-x-auto pb-2"><div className="grid w-full min-w-[250px] grid-flow-col grid-rows-7 gap-1.5">{days.map(({ date, count }) => <div key={format(date, "yyyy-MM-dd")} className="aspect-square max-h-5 rounded-sm" style={{ background: count ? "var(--accent-primary)" : "var(--bg-surface-3)", opacity: count ? Math.min(1, 0.35 + count * 0.2) : 1 }} title={`${count} activity points on ${format(date, "MMM d, yyyy")}`} />)}</div><div className="mt-3 flex items-center justify-end gap-2 text-xs text-[var(--text-muted)]"><span>Less</span>{[0, 1, 2, 3].map((level) => <span key={level} className="h-3 w-3 rounded-sm" style={{ background: level ? "var(--accent-primary)" : "var(--bg-surface-3)", opacity: level ? 0.35 + level * 0.2 : 1 }} />)}<span>More</span></div></div>}
        </section>
        {!enrollments.isLoading && !enrollments.isError && otherCourses.length > 0 && <section className="min-w-0"><h2 className="mb-3 text-base font-semibold">Your courses</h2><ul className="divide-y divide-[var(--border-default)]">{otherCourses.map((course: any) => <li key={course.enrollmentId || course.courseId}><Link to={`/courses/${course.courseId}`} className="flex items-center gap-3 py-3 hover:text-[var(--accent-primary)]"><BookOpen className="h-4 w-4 shrink-0 text-[var(--text-muted)]" /><span className="min-w-0 flex-1 break-words text-sm">{course.course?.courseName || "Course"}</span><span className="shrink-0 text-xs text-[var(--text-muted)]">{progress(course.progressPercentage)}%</span></Link></li>)}</ul></section>}
      </div>
    </WorkspacePage>
  );
};

export default Dashboard;
