/**
 * @file useModules.js
 * @description React Query hooks for course modules and lesson details.
 * Provides data-fetching hooks consumed by the course viewer and lesson pages.
 */
import { useQuery } from "@tanstack/react-query";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";

export const useModulesByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["modules", "course", courseId],
    queryFn: () => executeHttpGetRequest(API_PATHS.MODULES.COURSE(courseId!)),
    enabled: !!courseId, // Defer fetch until courseId is available
  });
};

export const useLessonDetail = (lessonId: string) => {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () =>
      executeHttpGetRequest(`${API_PATHS.LESSONS.BASE}/${lessonId}`),
    enabled: !!lessonId, // Defer fetch until lessonId is available
  });
};
