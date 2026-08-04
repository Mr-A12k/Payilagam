/**
 * @file index.js (Hooks Barrel)
 * @description Central export hub for all custom React hooks.
 *
 * Usage:
 *   import { usePublishedCourses, useEnrollCourse, useMyEnrollments } from '@/hooks';
 */

/* ── Query Hooks (read data from the backend) ──────────────────────── */
export {
  usePublishedCourses,
  useAllCourses,
  useCourseDetail,
  useMyMentorCourses,
} from "./queries/useCourses";

export { useDashboardStats, useMyEnrollments, useUserActivity } from "./queries/useDashboard";

export { useModulesByCourse, useLessonDetail } from "./queries/useModules";

/* ── Mutation Hooks (write data to the backend) ────────────────────── */
export { useEnrollCourse } from "./mutations/useEnrollment";
