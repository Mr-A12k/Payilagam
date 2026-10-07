import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, RefreshCw, Users, GraduationCap, Activity, Wallet, ArrowUpRight, BookOpen, TrendingUp, Clock, UserPlus } from "lucide-react";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { Button } from "@/components/ui";
import { PageHeader, WorkspacePage } from "@/components/workspace/Workspace";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  // KEEP EXACT SAME data fetching as original:
  const overview = useQuery({ queryKey: ["adminOverview"], queryFn: () => executeHttpGetRequest(API_PATHS.ADMIN.STATS) });
  const courses = useQuery({ queryKey: ["adminCourseAnalytics"], queryFn: () => executeHttpGetRequest(API_PATHS.ADMIN.ANALYTICS.COURSES) });
  const enrollments = useQuery({ queryKey: ["adminEnrollmentAnalytics"], queryFn: () => executeHttpGetRequest(API_PATHS.ADMIN.ANALYTICS.ENROLLMENTS) });
  const stats = overview.data?.data?.data;
  const courseAnalytics = Array.isArray(courses.data?.data?.data) ? courses.data.data.data : [];
  const enrollmentAnalytics = enrollments.data?.data?.data;
  const daily = Object.entries(enrollmentAnalytics?.dailyBreakdown || {}).sort(([a], [b]) => a.localeCompare(b));
  const maxCount = Math.max(1, ...daily.map(([, count]) => Number(count) || 0));
  const topCourses = [...courseAnalytics].sort((a: any, b: any) => (b._count?.enrollments || 0) - (a._count?.enrollments || 0)).slice(0, 5);
  const maxEnrollments = Math.max(1, ...topCourses.map((course: any) => course._count?.enrollments || 0));
  const busy = overview.isFetching || courses.isFetching || enrollments.isFetching;
  const refresh = () => { void overview.refetch(); void courses.refetch(); void enrollments.refetch(); };

  const metrics = [
    { label: "Revenue", icon: Wallet, value: stats?.overview?.totalRevenue == null ? "-" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(stats.overview.totalRevenue) },
    { label: "New users", icon: Users, value: stats?.overview?.newUsers?.toLocaleString() ?? "-" },
    { label: "Completion rate", icon: GraduationCap, value: stats?.overview?.completionRate == null ? "-" : `${stats.overview.completionRate}%` },
    { label: "System health", icon: Activity, value: stats?.overview?.systemHealth?.status || "Unavailable" },
  ];

  const totalEnrollments = daily.reduce((sum, [, count]) => sum + (Number(count) || 0), 0);

  return (
    <WorkspacePage className="admin-workspace">
      <PageHeader
        title="Overview"
        description="Administration and learning activity"
        actions={
          <>
            <Button variant="outline" onClick={refresh} disabled={busy} aria-label="Refresh dashboard" title="Refresh dashboard" size="icon">
              <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/mentor-applications"><GraduationCap className="h-4 w-4" />Applications</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/users"><Users className="h-4 w-4" />Manage users</Link>
            </Button>
          </>
        }
      />

      {/* Error banner */}
      {(overview.isError || courses.isError || enrollments.isError) && (
        <p role="alert" className="border-l-2 border-[var(--accent-primary)] pl-3 text-sm">
          Some dashboard data could not be loaded. Refresh to try again.
        </p>
      )}

      {/* ── Stat Cards ─────────────────────────── */}
      <div className="adm-stats">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="adm-stat-card">
            <dt className="adm-stat-label">
              <Icon strokeWidth={1.75} />
              {label}
            </dt>
            <dd className="adm-stat-value">
              {overview.isLoading ? <span className="adm-skeleton" style={{ width: 80 }} /> : value}
            </dd>
          </div>
        ))}
      </div>

      {/* ── Enrollment Activity + Top Courses ──── */}
      <div className="adm-grid-2">
        {/* Enrollment Activity Chart */}
        <section className="adm-section">
          <div className="adm-section-head">
            <div>
              <h2>Enrollment Activity</h2>
              <p>{enrollmentAnalytics?.period || "Last 30 days"}</p>
            </div>
            {totalEnrollments > 0 && (
              <span className="adm-stat-label" style={{ textTransform: 'none', fontSize: 13 }}>
                <TrendingUp className="h-4 w-4" style={{ opacity: 1 }} />
                <strong style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{totalEnrollments}</strong> total
              </span>
            )}
          </div>

          {enrollments.isLoading ? (
            <div className="adm-empty">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="sr-only">Loading enrollments</span>
            </div>
          ) : daily.length ? (
            <>
              <div className="adm-chart-scroll">
                <div className="adm-bars">
                  {daily.map(([date, count]) => (
                    <div key={date} className="adm-bar-item" title={`${date}: ${count} enrollments`}>
                      <div className="adm-bar-track">
                        <div style={{ height: `${(Math.max(0, Number(count) || 0) / maxCount) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="adm-date-range">
                <span>{daily[0]?.[0]}</span>
                <span>{daily[daily.length - 1]?.[0]}</span>
              </div>
            </>
          ) : (
            <div className="adm-empty">
              <Activity className="h-6 w-6" strokeWidth={1.5} />
              <p>{enrollments.isError ? "Enrollment data unavailable." : "No enrollments in this period."}</p>
              <Link to="/courses" className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                Browse courses <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* Top Courses Ranked List */}
        <section className="adm-section">
          <div className="adm-section-head">
            <div>
              <h2>Top Courses</h2>
              <p>By enrollment count</p>
            </div>
            <Link to="/courses" className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>View all</Link>
          </div>

          {courses.isLoading ? (
            <div className="adm-empty">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : topCourses.length ? (
            <div className="adm-ranked-list">
              {topCourses.map((course: any, index: number) => (
                <div key={course.courseId} className="adm-ranked-item">
                  <span className={`adm-rank-num ${index < 3 ? 'top' : ''}`}>{index + 1}</span>
                  <div className="adm-rank-info">
                    <Link
                      to={`/courses/${course.uniqueId || course.courseId}`}
                      className="adm-rank-name"
                    >
                      {course.courseName}
                    </Link>
                    <div className="adm-rank-bar">
                      <div style={{ width: `${((course._count?.enrollments || 0) / maxEnrollments) * 100}%` }} />
                    </div>
                  </div>
                  <span className="adm-rank-count">{course._count?.enrollments ?? 0}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="adm-empty">
              <BookOpen className="h-6 w-6" />
              <p>{courses.isError ? "Course data unavailable." : "No courses yet."}</p>
            </div>
          )}
        </section>
      </div>

      {/* ── Recent Enrollments + New Users ──────── */}
      <div className="adm-grid-2 equal">
        {/* Recent Enrollments */}
        <section className="adm-section">
          <div className="adm-section-head">
            <div>
              <h2>Recent Enrollments</h2>
              <p>Latest course enrollments</p>
            </div>
            <Clock className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          </div>

          {stats?.recentEnrollments?.length ? (
            <div className="adm-activity-list">
              {stats.recentEnrollments.map((enrollment: any) => {
                const name = enrollment.student?.fullName || enrollment.student?.userName || "Student";
                const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2);
                return (
                  <div key={enrollment.enrollmentId} className="adm-activity-item">
                    <span className="adm-activity-avatar">{initials}</span>
                    <div className="adm-activity-info">
                      <p className="adm-activity-name">{name}</p>
                      <p className="adm-activity-detail">{enrollment.course?.courseName}</p>
                    </div>
                    <div className="adm-activity-meta">
                      <span className={`adm-activity-status ${enrollment.status === 'active' ? 'is-active' : 'is-pending'}`}>
                        {enrollment.status}
                      </span>
                      {enrollment.enrolledAt && (
                        <p className="adm-activity-date">{new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="adm-empty">
              <GraduationCap className="h-6 w-6" />
              <p>{overview.isLoading ? "Loading enrollments..." : overview.isError ? "Enrollment data unavailable." : "No recent enrollments."}</p>
            </div>
          )}
        </section>

        {/* New Users */}
        <section className="adm-section">
          <div className="adm-section-head">
            <div>
              <h2>New Users</h2>
              <p>Recently joined members</p>
            </div>
            <Link to="/admin/users" className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>Manage users</Link>
          </div>

          {stats?.recentUsers?.length ? (
            <div className="adm-activity-list">
              {stats.recentUsers.map((user: any) => {
                const name = user.fullName || user.userName;
                const initials = name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2) || 'U';
                return (
                  <div key={user.userId} className="adm-activity-item">
                    <span className="adm-activity-avatar">{initials}</span>
                    <div className="adm-activity-info">
                      <p className="adm-activity-name">{name}</p>
                      <p className="adm-activity-detail">{user.email}</p>
                    </div>
                    <div className="adm-activity-meta">
                      <span className="adm-activity-status is-active">{user.role?.roleName || "User"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="adm-empty">
              <UserPlus className="h-6 w-6" />
              <p>{overview.isLoading ? "Loading users..." : overview.isError ? "User data unavailable." : "No recent users."}</p>
            </div>
          )}
        </section>
      </div>
    </WorkspacePage>
  );
};

export default AdminDashboard;
