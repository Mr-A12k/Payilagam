import { useDashboardStats } from "@/hooks";
import { Button } from "@/components/ui";
import { BookOpen, CheckCircle2, ListChecks, Flame, RotateCcw } from "lucide-react";
import { WorkspacePage, PageHeader, LoadingState } from "@/components/workspace/Workspace";
import "./Analytics.css";
import { useSelector } from "react-redux";
import StaffAnalytics from "./StaffAnalytics";

const StudentAnalytics = () => {
  const { data, isLoading, isError, refetch } = useDashboardStats();
  const stats = data?.data?.data;
  const total = Number(stats?.totalCourses);
  const completed = Number(stats?.completedCourses);
  const completionRate = Number.isFinite(total) && total > 0 && Number.isFinite(completed) ? Math.min(100, Math.max(0, Math.round(completed / total * 100))) : null;

  const metrics = [
    { label: "Enrolled", value: stats?.totalCourses, icon: BookOpen },
    { label: "Completed", value: stats?.completedCourses, icon: CheckCircle2 },
    { label: "Lessons done", value: stats?.totalLessonsCompleted, icon: ListChecks },
    { label: "Current streak", value: stats?.currentStreak != null ? `${stats.currentStreak} days` : undefined, icon: Flame },
  ];

  return (
    <WorkspacePage className="analytics-workspace">
      <PageHeader title="Learning Analytics" description="Course completion, lesson activity, and your current streak." />

      {isLoading ? <LoadingState label="Loading learning statistics..." /> : isError || !stats ? (
        <div role="alert" className="anl-error">
          <p>Unable to load learning statistics.</p>
          <Button variant="secondary" onClick={() => refetch()}><RotateCcw className="h-4 w-4" />Retry</Button>
        </div>
      ) : <>
        {/* ── Stat cards ─────────────────────────── */}
        <section aria-label="Learning metrics">
          <div className="anl-stats">
            {metrics.map(({ label, value, icon: Icon }) => (
              <div key={label} className="anl-stat-card">
                <span className="anl-stat-label"><Icon aria-hidden="true" />{label}</span>
                <span className="anl-stat-value">{value ?? "—"}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Completion card ────────────────────── */}
        <section className="anl-section" aria-labelledby="completion-heading">
          <div className="anl-completion">
            <div>
              <h2 id="completion-heading">Course completion</h2>
              <p>{completionRate === null ? "No enrolled course activity yet." : `${stats.completedCourses} of ${stats.totalCourses} enrolled courses completed`}</p>
            </div>
            <div>
              <span className="anl-completion-pct">{completionRate === null ? "—" : `${completionRate}%`}</span>
              <progress className="anl-progress" aria-label="Enrolled courses completed" max={100} value={completionRate ?? 0} />
            </div>
          </div>
        </section>
      </>}
    </WorkspacePage>
  );
};

const Analytics = () => {
  const user = useSelector((state: any) => state.auth.user);
  return user?.role === "admin" || user?.role === "mentor" ? <StaffAnalytics admin={user.role === "admin"} /> : <StudentAnalytics />;
};

export default Analytics;
