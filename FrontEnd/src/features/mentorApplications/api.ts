import {
  executeHttpGetRequest,
  executeHttpPutRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type MentorApplication = {
  id: number;
  status: ApplicationStatus;
  bio?: string | null;
  skills?: string | string[] | null;
  experience?: string | number | null;
  createdAt?: string;
  user?: { fullName?: string; userName?: string; email?: string };
};
type QueueResponse = {
  data: MentorApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
  };
};

export async function getMentorApplications(filters: {
  page: number;
  status: ApplicationStatus | "ALL";
  search: string;
}) {
  return (
    await executeHttpGetRequest<QueueResponse>(
      API_PATHS.USERS.MENTOR_APPLICATIONS,
      { ...filters, limit: 20 },
    )
  ).data;
}

export function reviewMentorApplication(
  id: number,
  status: Exclude<ApplicationStatus, "PENDING">,
) {
  return executeHttpPutRequest(
    API_PATHS.USERS.MENTOR_APPLICATION_STATUS(String(id)),
    { status },
  );
}
