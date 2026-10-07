import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, ListChecks, Save, Loader2 } from "lucide-react";
import { Button, Input, Label, ConfirmDialog } from "@/components/ui";
import { executeHttpPostRequest, executeHttpPutRequest, executeHttpDeleteRequest } from "@/api/commonServices";
import { getCourseQuizzes, type CourseQuiz, type QuizQuestion } from "@/features/quizzes/api";
import toast from "react-hot-toast";
import "./CourseQuizzes.css";

const newQuestion = (): QuizQuestion => ({ id: crypto.randomUUID(), prompt: "", options: ["", "", "", ""], correctIndex: 0, points: 1 });
const localDate = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function CourseQuizBuilder({ courseId }: { courseId: number }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["course-quizzes", courseId, "manage"], queryFn: () => getCourseQuizzes(courseId) });
  const [editing, setEditing] = useState<CourseQuiz | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [remove, setRemove] = useState<CourseQuiz | null>(null);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [cancel, setCancel] = useState(false);
  const locked = editing !== null && editing !== "new" && !!editing._count?.submissions;
  const total = questions.reduce((sum, question) => sum + (Number(question.points) || 0), 0);
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
    void client.invalidateQueries({ queryKey: ["assignments"] });
  };
  const save = useMutation({
    mutationFn: () => {
      const body = { courseId, type: "quiz", title: title.trim(), description: description.trim(), dueDate: dueDate ? new Date(dueDate).toISOString() : null, quiz: { questions } };
      return editing === "new" ? executeHttpPostRequest("/assignments", body) : executeHttpPutRequest(`/assignments/${editing?.assignmentId}`, body);
    },
    onSuccess: () => { refresh(); setEditing(null); setDirty(false); toast.success("Quiz saved"); },
    onError: (err: any) => setError(err.response?.data?.message || "Unable to save quiz. Your questions are still here."),
  });
  const deletion = useMutation({
    mutationFn: () => executeHttpDeleteRequest(`/assignments/${remove?.assignmentId}`),
    onSuccess: () => { refresh(); setRemove(null); toast.success("Quiz deleted"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Unable to delete quiz"),
  });
  const start = (quiz: CourseQuiz | "new") => {
    setEditing(quiz); setError(""); setDirty(false);
    setTitle(quiz === "new" ? "" : quiz.title);
    setDescription(quiz === "new" ? "" : quiz.description || "");
    setDueDate(quiz === "new" ? "" : localDate(quiz.dueDate));
    setQuestions(quiz === "new" ? [newQuestion()] : structuredClone(quiz.quiz?.questions || [newQuestion()]));
  };
  const update = (id: string, patch: Partial<QuizQuestion>) => {
    setDirty(true); setQuestions(previous => previous.map(question => question.id === id ? { ...question, ...patch } : question));
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) { setError("Add a quiz title."); return; }
    if (!questions.length || questions.some(question => !question.prompt.trim() || question.options.some(option => !option.trim()) || new Set(question.options.map(option => option.trim().toLowerCase())).size !== question.options.length || !Number.isInteger(question.points) || question.points < 1 || question.points > 100 || question.correctIndex == null || question.correctIndex < 0 || question.correctIndex >= question.options.length)) {
      setError("Complete each question, add distinct answer options, choose a correct answer, and set 1–100 points."); return;
    }
    setError(""); save.mutate();
  };

  return <div className="course-quizzes">
    <p className="quiz-intro">Turn course tasks into short quizzes. Students choose one answer per question and receive an automatic score. Saved quizzes appear in the course and student assignments.</p>
    {editing ? <form onSubmit={submit} onChange={() => setDirty(true)} className="quiz-editor">
      <fieldset disabled={save.isPending} className="space-y-5 min-w-0">
        <div className="quiz-toolbar"><h3>{editing === "new" ? "New quiz" : "Edit quiz"}</h3><span>{questions.length} questions · {total} points</span></div>
        <div className="course-field"><Label htmlFor="quiz-title">Quiz title</Label><Input id="quiz-title" maxLength={200} required value={title} onChange={e => setTitle(e.target.value)} placeholder="Check your understanding: Getting started" /></div>
        <div className="course-field"><Label htmlFor="quiz-description">Instructions (optional)</Label><textarea id="quiz-description" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell students what this quiz covers." /></div>
        <div className="course-field"><Label htmlFor="quiz-due">Deadline (optional, your local time)</Label><Input id="quiz-due" type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} /><p className="quiz-hint">Leave blank to let students complete it anytime. Retakes are allowed.</p></div>
        {locked && <p className="quiz-notice">Students have already submitted this quiz. You can update its title, instructions, and deadline. Create a new quiz to change questions.</p>}
        <fieldset disabled={locked} className="space-y-4 min-w-0">
          {questions.map((question, index) => <section key={question.id} className="quiz-question">
            <div className="quiz-toolbar"><h4>Question {index + 1}</h4><Button type="button" variant="ghost" size="icon" disabled={questions.length === 1} aria-label={`Remove question ${index + 1}`} onClick={() => { setQuestions(questions.filter(item => item.id !== question.id)); setDirty(true); }}><Trash2 className="h-4 w-4" /></Button></div>
            <Label htmlFor={`prompt-${question.id}`}>Question or task</Label><textarea id={`prompt-${question.id}`} required maxLength={4000} rows={2} value={question.prompt} onChange={e => update(question.id, { prompt: e.target.value })} placeholder="What should the student solve?" />
            <fieldset className="quiz-options"><legend>Answer options · Select the correct answer</legend>
              {question.options.map((option, optionIndex) => <div className={`quiz-option ${question.correctIndex === optionIndex ? "is-correct" : ""}`} key={optionIndex}>
                <input type="radio" name={`correct-${question.id}`} aria-label={`Option ${optionIndex + 1} is correct for question ${index + 1}`} checked={question.correctIndex === optionIndex} onChange={() => update(question.id, { correctIndex: optionIndex })} />
                <Input required maxLength={1000} aria-label={`Question ${index + 1}, option ${optionIndex + 1}`} value={option} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} onChange={e => update(question.id, { options: question.options.map((value, i) => i === optionIndex ? e.target.value : value) })} />
                <Button type="button" variant="ghost" size="icon" disabled={question.options.length <= 2} aria-label={`Remove option ${optionIndex + 1} from question ${index + 1}`} onClick={() => update(question.id, { options: question.options.filter((_, i) => i !== optionIndex), correctIndex: question.correctIndex === optionIndex ? 0 : (question.correctIndex ?? 0) > optionIndex ? question.correctIndex! - 1 : question.correctIndex })}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>)}
            </fieldset>
            <div className="quiz-toolbar"><Button type="button" variant="ghost" disabled={question.options.length >= 6} onClick={() => update(question.id, { options: [...question.options, ""] })}><Plus className="h-4 w-4" />Add option</Button><label className="quiz-points">Points<Input type="number" min={1} max={100} required value={question.points} onChange={e => update(question.id, { points: Number(e.target.value) })} /></label></div>
          </section>)}
          <Button type="button" variant="outline" disabled={questions.length >= 50} onClick={() => { setQuestions([...questions, newQuestion()]); setDirty(true); }}><Plus className="h-4 w-4" />Add question</Button>
        </fieldset>
        {error && <p role="alert" className="text-sm text-[var(--accent-danger)]">{error}</p>}
        <div className="quiz-toolbar"><Button type="button" variant="ghost" onClick={() => dirty ? setCancel(true) : setEditing(null)}>Cancel</Button><Button type="submit">{save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{save.isPending ? "Saving…" : "Save quiz"}</Button></div>
      </fieldset>
    </form> : query.isLoading ? <p role="status">Loading quizzes…</p> : query.isError ? <div role="alert"><p>Unable to load quizzes.</p><Button variant="outline" onClick={() => query.refetch()}>Retry</Button></div> : <>
      {!query.data?.length && <div className="quiz-empty"><ListChecks className="h-7 w-7 text-[var(--accent-primary)]" /><h3>Add your first quiz</h3><p>Check understanding with a few focused questions after students finish the lessons.</p></div>}
      <div className="space-y-3">{query.data?.map(quiz => <article key={quiz.assignmentId} className="quiz-list-item"><div className="min-w-0"><h3>{quiz.title}</h3><p>{quiz.quiz?.questions.length || 0} questions · {quiz.totalMarks} points · {quiz.dueDate ? `Due ${new Date(quiz.dueDate).toLocaleString()}` : "No deadline"}</p><p>{quiz._count?.submissions || 0} submissions</p></div><div className="flex shrink-0"><Button variant="ghost" size="icon" aria-label={`Edit ${quiz.title}`} onClick={() => start(quiz)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${quiz.title}`} onClick={() => setRemove(quiz)}><Trash2 className="h-4 w-4" /></Button></div></article>)}</div>
      <Button onClick={() => start("new")}><Plus className="h-4 w-4" />Add quiz</Button>
    </>}
    <ConfirmDialog isOpen={cancel} onClose={() => setCancel(false)} onConfirm={() => { setEditing(null); setDirty(false); setCancel(false); }} title="Discard quiz changes?" description="Your unsaved questions and changes will be lost." confirmText="Discard changes" destructive />
    <ConfirmDialog isOpen={!!remove} onClose={() => setRemove(null)} onConfirm={() => deletion.mutate()} title="Delete quiz?" description="This removes the quiz and all its student submissions." confirmText="Delete quiz" destructive isLoading={deletion.isPending} />
  </div>;
}
