import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { executeHttpGetRequest } from "@/api/commonServices";
import { WorkspacePage, PageHeader, LoadingState, EmptyState } from "@/components/workspace/Workspace";
import "./LearningWorkspace.css";
import { useSelector } from "react-redux";

const Assignments = () => {
  const student = useSelector((state: any) => state.auth.user?.role === "student");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["assignments", "upcoming"],
    queryFn: () => executeHttpGetRequest("/assignments/upcoming"),
    enabled: student,
  });
  const assignments = data?.data?.data ?? [];
  return (
    <WorkspacePage className="learning-workspace">
      <PageHeader title="Upcoming Assignments" description="Course assignments and submission deadlines." actions={!isLoading && !isError ? <span className="text-sm text-[var(--text-muted)]">{assignments.length} upcoming</span> : undefined} />
      {!student ? <EmptyState title="Student assignments" description="Upcoming deadlines are available for student accounts." action={<Button asChild variant="outline"><Link to="/courses">Browse courses</Link></Button>} /> : isLoading ? <LoadingState label="Loading assignments..." /> : isError ? <div role="alert" className="learning-error"><p>Unable to load assignments.</p><Button variant="secondary" onClick={() => refetch()}><RotateCcw className="h-4 w-4" />Retry</Button></div> : assignments.length === 0 ? (
        <EmptyState title="No upcoming assignments" description="New assignments from your courses will appear here." action={<Button asChild variant="outline"><Link to="/learning">My learning<ArrowRight className="h-4 w-4" /></Link></Button>} />
      ) : <ul className="assignment-list">
        {assignments.map((assignment: any) => {
          const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
          const validDate = dueDate && !Number.isNaN(dueDate.getTime());
          const overdue = validDate && dueDate.getTime() < Date.now();
          return <li key={assignment.assignmentId} className="assignment-row">
            <div className="assignment-title"><h2>{assignment.title}</h2><p>{assignment.course?.courseName || "Course not provided"}</p></div>
            <div className="assignment-deadline"><CalendarClock aria-hidden="true" className="h-4 w-4" /><div><span className={overdue ? "text-[var(--status-danger)]" : ""}>{overdue ? "Overdue" : "Due date"}</span><p>{validDate ? <time dateTime={dueDate.toISOString()}>{dueDate.toLocaleString()}</time> : "Not scheduled"}</p></div></div>
            <Button asChild variant="outline" size="sm"><Link to={`/courses/${assignment.courseId}${assignment.type === "quiz" ? "#course-quizzes" : ""}`}>{assignment.type === "quiz" ? "Open quiz tasks" : "View course"}<ArrowRight className="h-4 w-4" /></Link></Button>
          </li>;
        })}
      </ul>}
    </WorkspacePage>
  );
};

export default Assignments;
