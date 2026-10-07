import { executeHttpGetRequest } from "@/api/commonServices";

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex?: number;
  points: number;
}
export interface CourseQuiz {
  assignmentId: number;
  title: string;
  description: string;
  totalMarks: number;
  dueDate: string | null;
  quiz: { questions: QuizQuestion[] } | null;
  _count?: { submissions: number };
}

export async function getCourseQuizzes(courseId: number): Promise<CourseQuiz[]> {
  const quizzes: CourseQuiz[] = [];
  let page = 1;
  let more = true;
  while (more) {
    const response = await executeHttpGetRequest(`/assignments/course/${courseId}?type=quiz&limit=100&page=${page}`);
    quizzes.push(...response.data.data);
    more = !!response.data.pagination?.hasNext;
    page += 1;
  }
  return quizzes;
}
