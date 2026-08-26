/**
 * @file useDashboard.js
 * @description React Query hooks for the student dashboard.
 *              Provides aggregated stats and enrollment data.
 *
 * Usage:
 *   import { useDashboardStats, useMyEnrollments } from '@/hooks';
 */

import { useQuery } from "@tanstack/react-query";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";

/** Fetch aggregate dashboard statistics (total courses, completed, streak, etc.) */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => executeHttpGetRequest(API_PATHS.PROGRESS.DASHBOARD),
  });
};

/** Fetch the list of courses the current student is enrolled in */
export const useMyEnrollments = (params = {}) => {
  return useQuery({
    queryKey: ["enrollments", "my", params],
    queryFn: () =>
      executeHttpGetRequest(API_PATHS.ENROLLMENTS.MY_COURSES, params),
  });
};

/** Fetch the user's activity heatmap data */
export const useUserActivity = (days = 365) => {
  return useQuery({
    queryKey: ["user", "activity", days],
    queryFn: () =>
      executeHttpGetRequest(`${API_PATHS.USERS.ACTIVITY}?days=${days}`),
  });
};
