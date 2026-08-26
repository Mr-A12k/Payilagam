/**
 * @file useCourses.js
 * @description React Query hooks for fetching course data from the backend.
 *              Each hook wraps a courseApi method with automatic caching and isLoading states.
 *
 * Usage:
 *   import { usePublishedCourses, useCourseDetail } from '@/hooks';
 *   const { data, isLoading } = usePublishedCourses({ search: 'react' });
 */

import { useQuery } from "@tanstack/react-query";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";

/** Fetch all published courses (public — shown in the course catalog) */
export const usePublishedCourses = (filters = {}) => {
  return useQuery({
    queryKey: ["courses", "published", filters],
    queryFn: () => executeHttpGetRequest(API_PATHS.COURSES.PUBLISHED, filters),
  });
};

/** Fetch all courses including drafts (auth required — admin/mentor view) */
export const useAllCourses = (filters = {}) => {
  return useQuery({
    queryKey: ["courses", "all", filters],
    queryFn: () => executeHttpGetRequest(API_PATHS.COURSES.BASE, filters),
  });
};

/** Fetch a single course's full details by ID (includes modules, mentor info, ratings) */
export const useCourseDetail = (id: string) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => executeHttpGetRequest(`${API_PATHS.COURSES.BASE}/${id}`),
    enabled: !!id /* Only run the query if a valid ID is provided */,
  });
};

/** Fetch courses created by the currently logged-in mentor */
export const useMyMentorCourses = (params = {}) => {
  return useQuery({
    queryKey: ["courses", "mentor", "my", params],
    queryFn: () => executeHttpGetRequest(API_PATHS.COURSES.MY_COURSES, params),
  });
};
