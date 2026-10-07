import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Activity, ArrowUpRight, BookOpen, ListChecks, RefreshCw, Search, Users } from "lucide-react";
import { Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { WorkspacePage, PageHeader, LoadingState, EmptyState } from "@/components/workspace/Workspace";
import { getAnalyticsCourses, getEnrollmentActivity } from "@/features/analytics/api";
import "./Analytics.css";

const count = (value?: number) => typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "-";

export default function StaffAnalytics({ admin }: { admin: boolean }) {
  const userId = useSelector((state: { auth: { user: { userId: number } | null } }) => state.auth.user?.userId);
  const [days, setDays] = useState("30");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("enrollments");
  const courses = useQuery({ queryKey: [admin ? "adminCourseAnalytics" : "mentorCourses", "report", userId], queryFn: () => getAnalyticsCourses(admin), enabled: !!userId });
  const activity = useQuery({ queryKey: ["enrollmentActivity", userId, days], queryFn: () => getEnrollmentActivity(Number(days)), enabled: admin && !!userId });
  const records = courses.data || [];
  const statuses = [...new Set(records.map(course => course.status?.toLowerCase()).filter((value): value is string => !!value))].sort();
  const visible = useMemo(() => records.filter(course => `${course.courseName || "Untitled course"} ${course.courseCode || ""}`.toLowerCase().includes(search.toLowerCase()) && (status === "all" || course.status?.toLowerCase() === status)).sort((a, b) => sort === "name" ? (a.courseName || "Untitled course").localeCompare(b.courseName || "Untitled course") : (b._count?.enrollments ?? -1) - (a._count?.enrollments ?? -1)), [records, search, status, sort]);
  const total = (key: "enrollments" | "assignments" | "reviews") => records.every(course => typeof course._count?.[key] === "number") ? records.reduce((sum, course) => sum + (course._count?.[key] || 0), 0) : undefined;
  const entries = Object.entries(activity.data?.dailyBreakdown || {}).sort(([a], [b]) => a.localeCompare(b));
  const peak = Math.max(1, ...entries.map(([, value]) => value));
  const refreshing = courses.isFetching || (admin && activity.isFetching);
  const refresh = () => { void courses.refetch(); if (admin) void activity.refetch(); };
  const scope = admin ? "Top 20 courses by enrollment" : "Up to 100 of your courses";
  const metrics = [
    { label: "Courses", value: courses.data ? records.length : undefined, icon: BookOpen },
    { label: "Enrollments", value: courses.data ? total("enrollments") : undefined, icon: Users },
    { label: "Assignments", value: courses.data ? total("assignments") : undefined, icon: ListChecks },
    { label: "Reviews", value: courses.data ? total("reviews") : undefined, icon: Activity },
  ];

  return <WorkspacePage className="analytics-workspace">
    <PageHeader title="Analytics" description={admin ? "Platform enrollment activity and course performance" : "Performance across your courses"} actions={<Button variant="outline" size="icon" title="Refresh analytics" aria-label="Refresh analytics" disabled={refreshing} onClick={refresh}><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /></Button>} />

    {/* ── Stat cards ──────────────────────────────── */}
    <section aria-label="Course report summary">
      <p className="anl-scope">{scope}</p>
      <div className="anl-stats">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="anl-stat-card">
            <span className="anl-stat-label"><Icon aria-hidden="true" />{label}</span>
            <span className="anl-stat-value">{count(value)}</span>
          </div>
        ))}
      </div>
    </section>

    {/* ── Enrollment activity chart ───────────────── */}
    {admin && <section className="anl-section" aria-labelledby="activity-heading">
      <div className="anl-section-head">
        <div>
          <h2 id="activity-heading">Enrollment activity</h2>
          <p>{activity.data?.period || `Last ${days} days`} <span className="anl-divider">/</span> All platform courses</p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger aria-label="Activity period" className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activity.isLoading ? <LoadingState label="Loading enrollment activity..." /> : activity.isError ? (
        <div role="alert" className="anl-error">
          <p>Enrollment activity could not be loaded.</p>
          <Button variant="outline" size="sm" onClick={() => activity.refetch()}>Retry</Button>
        </div>
      ) : <>
        <div className="anl-activity-total">
          <strong>{count(activity.data?.totalEnrollments)}</strong>
          <span>{activity.data?.totalEnrollments === 1 ? "enrollment" : "enrollments"} in this period</span>
        </div>
        {!entries.length ? <EmptyState title="No enrollments in this period" /> : (
          <div role="region" aria-label="Daily enrollment counts" tabIndex={0} className="anl-chart-scroll">
            <ol className="anl-bars">
              {entries.map(([date, value]) => (
                <li key={date}>
                  <span className="anl-bar-count">{count(value)}</span>
                  <div className="anl-bar-track"><div style={{ height: `${value / peak * 100}%` }} /></div>
                  <time dateTime={date}>{new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" })}</time>
                </li>
              ))}
            </ol>
          </div>
        )}
      </>}
    </section>}

    {/* ── Course performance table ────────────────── */}
    <section className="anl-section" aria-labelledby="courses-heading">
      <div className="anl-section-head">
        <div>
          <h2 id="courses-heading">Course performance</h2>
          <p>{scope}</p>
        </div>
        <span className="anl-result-count" role="status">{courses.data ? `${visible.length} of ${records.length} courses` : ""}</span>
      </div>

      <div className="anl-filters">
        <div className="anl-search">
          <Search aria-hidden="true" />
          <Input aria-label="Search course report" placeholder="Search courses or codes" value={search} onChange={event => setSearch(event.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Course status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statuses.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger aria-label="Sort courses"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="enrollments">Most enrolled</SelectItem>
            <SelectItem value="name">Course name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {courses.isLoading ? <LoadingState label="Loading course performance..." /> : courses.isError ? (
        <div role="alert" className="anl-error">
          <p>Course performance could not be loaded.</p>
          <Button variant="outline" onClick={() => courses.refetch()}>Retry</Button>
        </div>
      ) : !visible.length ? (
        <EmptyState title={records.length ? "No matching courses" : "No courses in this report"} action={records.length ? <Button variant="outline" onClick={() => { setSearch(""); setStatus("all"); }}>Clear filters</Button> : undefined} />
      ) : (
        <div className="anl-table-scroll" role="region" aria-label="Course performance table" tabIndex={0}>
          <table className="anl-table">
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Status</th>
                <th scope="col">Level</th>
                <th scope="col" className="numeric">Enrollments</th>
                <th scope="col" className="numeric">Assignments</th>
                <th scope="col" className="numeric">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(course => (
                <tr key={course.courseId}>
                  <td>
                    <Link to={`/courses/${course.uniqueId || course.courseId}`}>
                      <span>{course.courseName || "Untitled course"}</span>
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                    <small>{course.courseCode || `Course ${course.courseId}`}</small>
                  </td>
                  <td><span className={`anl-status ${course.status === "published" ? "is-published" : ""}`}>{course.status || "Unavailable"}</span></td>
                  <td className="capitalize">{course.level || "-"}</td>
                  <td className="numeric">{count(course._count?.enrollments)}</td>
                  <td className="numeric">{count(course._count?.assignments)}</td>
                  <td className="numeric">{count(course._count?.reviews)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  </WorkspacePage>;
}
