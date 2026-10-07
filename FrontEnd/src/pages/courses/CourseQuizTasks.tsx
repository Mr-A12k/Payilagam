import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { ListChecks, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { getCourseQuizzes, type CourseQuiz } from "@/features/quizzes/api";
import { executeHttpGetRequest, executeHttpPostRequest } from "@/api/commonServices";
import "./CourseQuizzes.css";

function QuizAttempt({ quiz }: { quiz: CourseQuiz }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const client = useQueryClient();
  const history = useQuery({ queryKey: ["quiz-attempts", quiz.assignmentId], queryFn: () => executeHttpGetRequest(`/submissions/assignment/${quiz.assignmentId}/my`).then(response => response.data.data), enabled: open });
  const submit = useMutation({
    mutationFn: () => executeHttpPostRequest(`/submissions/assignment/${quiz.assignmentId}`, { answers: Object.entries(answers).map(([questionId, optionIndex]) => ({ questionId, optionIndex })) }),
    onSuccess: response => { setResult(response.data.data); setOpen(false); void client.invalidateQueries({ queryKey: ["quiz-attempts", quiz.assignmentId] }); },
    onError: (err: any) => setError(err.response?.data?.message || "Unable to submit. Your answers have been kept; please try again."),
  });
  const questions = quiz.quiz?.questions || [];
  const closed = !!quiz.dueDate && new Date(quiz.dueDate).getTime() < Date.now();
  return <article className="quiz-question">
    <div className="quiz-toolbar"><div className="min-w-0"><h3>{quiz.title}</h3><p className="quiz-hint">{questions.length} questions · {quiz.totalMarks} points · {quiz.dueDate ? `${closed ? "Closed" : "Due"} ${new Date(quiz.dueDate).toLocaleString()}` : "No deadline"}</p></div><ListChecks className="w-5 h-5 text-[var(--accent-primary)] shrink-0" /></div>
    {quiz.description && <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap [overflow-wrap:anywhere]">{quiz.description}</p>}
    {result && <p role="status" className="quiz-notice flex items-center gap-2"><CheckCircle className="w-5 h-5 shrink-0" />Submitted · Score {result.marks} / {result.assignment.totalMarks}</p>}
    {!questions.length ? <p className="quiz-hint">This quiz is not ready yet.</p> : !open ? <Button variant="outline" onClick={() => setOpen(true)}>{closed ? "View previous attempts" : result ? "Try again" : "Open quiz"}<ArrowRight className="w-4 h-4" /></Button> : <>
      {history.isLoading ? <p role="status" className="quiz-hint">Loading previous attempts…</p> : history.isError ? <div role="alert"><p className="quiz-hint">Could not load previous attempts.</p><Button variant="ghost" onClick={() => history.refetch()}>Retry</Button></div> : history.data?.length > 0 ? <p className="quiz-hint">Latest score: {history.data[0].marks ?? "Pending"} / {history.data[0].assignment.totalMarks} · {history.data.length} attempts</p> : <p className="quiz-hint">No previous attempts.</p>}
      {closed ? <p className="quiz-notice">The deadline has passed. New attempts are closed.</p> : <form onSubmit={event => { event.preventDefault(); if (questions.some(question => answers[question.id] === undefined)) { setError("Choose an answer for every question."); return; } setError(""); submit.mutate(); }}>
        <fieldset disabled={submit.isPending} className="space-y-6 min-w-0">
          {questions.map((question, index) => <fieldset key={question.id} className="quiz-options"><legend className="!text-sm !text-[var(--text-primary)] [overflow-wrap:anywhere]">{index + 1}. {question.prompt} <span className="text-[var(--text-muted)]">({question.points} points)</span></legend>
            {question.options.map((option, optionIndex) => <label className="quiz-option cursor-pointer min-h-11" key={optionIndex}><input type="radio" required name={`answer-${quiz.assignmentId}-${question.id}`} checked={answers[question.id] === optionIndex} onChange={() => setAnswers(previous => ({ ...previous, [question.id]: optionIndex }))} /><span className="text-sm [overflow-wrap:anywhere] min-w-0">{option}</span></label>)}
          </fieldset>)}
          <p className="quiz-hint">{Object.keys(answers).length} of {questions.length} answered · Retakes allowed</p>
          {error && <p role="alert" className="text-sm text-[var(--accent-danger)]">{error}</p>}
          <Button type="submit">{submit.isPending && <Loader2 className="w-4 h-4 animate-spin" />}{submit.isPending ? "Submitting…" : "Submit quiz"}</Button>
        </fieldset>
      </form>}
      <Button variant="ghost" disabled={submit.isPending} onClick={() => setOpen(false)}>Close quiz</Button>
    </>}
  </article>;
}

export default function CourseQuizTasks({ courseId }: { courseId: number }) {
  const query = useQuery({ queryKey: ["course-quizzes", courseId, "student"], queryFn: () => getCourseQuizzes(courseId) });
  return <section id="course-quizzes" className="course-quizzes mt-8" aria-labelledby="course-quizzes-heading">
    <h2 id="course-quizzes-heading" className="text-lg font-semibold">Quizzes & tasks</h2>
    <p className="quiz-intro">Practice what you’ve learned and check your understanding.</p>
    {query.isLoading ? <p role="status">Loading quizzes…</p> : query.isError ? <div role="alert"><p>Unable to load quizzes.</p><Button variant="outline" onClick={() => query.refetch()}>Retry</Button></div> : !query.data?.length ? <p className="quiz-hint">Your instructor hasn’t added quizzes yet.</p> : query.data.map(quiz => <QuizAttempt key={quiz.assignmentId} quiz={quiz} />)}
  </section>;
}
