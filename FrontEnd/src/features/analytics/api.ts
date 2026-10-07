import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";

export interface AnalyticsCourse {
  courseId: number;
  uniqueId?: string;
  courseName: string;
  courseCode?: string;
  status?: string;
  level?: string;
  _count?: { enrollments?: number; assignments?: number; reviews?: number };
}

export interface EnrollmentActivity {
  period: string;
  totalEnrollments: number;
  dailyBreakdown: Record<string, number>;
}

export async function getAnalyticsCourses(
  admin: boolean,
): Promise<AnalyticsCourse[]> {
  const response = await executeHttpGetRequest<{ data: AnalyticsCourse[] }>(
    admin ? API_PATHS.ADMIN.ANALYTICS.COURSES : API_PATHS.COURSES.MY_COURSES,
    admin ? {} : { limit: 100 },
  );
  if (!Array.isArray(response.data.data))
    throw new Error("Invalid course analytics response");
  return response.data.data.map((course) => ({
    ...course,
    status: course.status?.toLowerCase(),
    level: course.level?.toLowerCase(),
  }));
}

export async function getEnrollmentActivity(
  days: number,
): Promise<EnrollmentActivity> {
  const response = await executeHttpGetRequest<{ data: EnrollmentActivity }>(
    API_PATHS.ADMIN.ANALYTICS.ENROLLMENTS,
    { days },
  );
  const data = response.data.data;
  if (
    !data ||
    typeof data.totalEnrollments !== "number" ||
    !data.dailyBreakdown
  )
    throw new Error("Invalid enrollment analytics response");
  return data;
}
