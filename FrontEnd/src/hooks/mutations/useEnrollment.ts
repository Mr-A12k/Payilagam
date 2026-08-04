/**
 * @file useEnrollment.js
 * @description React Query mutation hook for isEnrolling a student in a course.
 * On success it invalidates related queries so that the UI reflects the new enrollment.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { executeHttpPostRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import toast from "react-hot-toast";

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      executeHttpPostRequest(API_PATHS.ENROLLMENTS.ENROLL(courseId!)),
    onSuccess: (_data: any, courseId: string) => {
      toast.success("Successfully enrolled in the course!");
      // Invalidate related queries so lists and detail pages refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
    },
    onError: (error: unknown) => {
      toast.error(
        (error as any).response?.data?.message ||
          "Failed to enroll. Please try again.",
      );
    },
  });
};
