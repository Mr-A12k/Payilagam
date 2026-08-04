export const API_PATHS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    AVATAR: "/auth/profile/avatar",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  COURSES: {
    BASE: "/courses",
    PUBLISHED: "/courses/published",
    MY_COURSES: "/courses/mentor/my-courses",
  },
  CATEGORIES: {
    BASE: "/categories",
  },
  MODULES: {
    BASE: "/modules",
    COURSE: (courseId: string) => `/modules/course/${courseId}`,
    REORDER: (courseId: string) => `/modules/course/${courseId}/reorder`,
  },
  LESSONS: {
    BASE: "/lessons",
    MODULE: (moduleId: string) => `/lessons/module/${moduleId}`,
  },
  ENROLLMENTS: {
    BASE: "/enrollments",
    ENROLL: (courseId: string) => `/enrollments/${courseId}/enroll`,
    UNENROLL: (courseId: string) => `/enrollments/${courseId}/unenroll`,
    MY_COURSES: "/enrollments/my-courses",
    STUDENTS: (courseId: string) => `/enrollments/course/${courseId}/students`,
    CHECK: (courseId: string) => `/enrollments/check/${courseId}`,
    STATS: (courseId: string) => `/enrollments/stats/${courseId}`,
  },
  PROGRESS: {
    DASHBOARD: "/progress/dashboard",
    COURSE: (courseId: string) => `/progress/course/${courseId}`,
    COMPLETE: (lessonId: string) => `/progress/lesson/${lessonId}/complete`,
    INCOMPLETE: (lessonId: string) => `/progress/lesson/${lessonId}/incomplete`,
    WATCH_TIME: (lessonId: string) => `/progress/lesson/${lessonId}/watch-time`,
  },
  PROBLEMS: {
    BASE: "/problems",
    SLUG: (slug: string) => `/problems/slug/${slug}`,
  },
  CODING_SUBMISSIONS: {
    RUN: (problemId: string) => `/coding-submissions/${problemId}/run`,
    SUBMIT: (problemId: string) => `/coding-submissions/${problemId}/submit`,
  },
  AI: {
    ASK: "/ai/ask",
  },
  RESOURCES: {
    BASE: "/resources",
    DOWNLOAD: (id: string) => `/resources/${id}/download`,
  },
  ADMIN: {
    STATS: "/admin/stats",
    USERS: "/admin/users",
    USER: (id: string) => `/admin/users/${id}`,
    TOGGLE_STATUS: (id: string) => `/admin/users/${id}/toggle-status`,
    ANALYTICS: {
      COURSES: "/admin/analytics/courses",
      ENROLLMENTS: "/admin/analytics/enrollments"
    }
  },
  CHAT: {
    BASE: "/chat",
    MESSAGES: (convId: string) => `/chat/${convId}/messages`,
    WORKSPACES: "/chat/workspaces",
    CHANNEL_MESSAGES: (channelId: string) => `/chat/channels/${channelId}/messages`,
  },
  NETWORK: {
    FOLLOWERS: "/follows/followers",
    FOLLOWING: "/follows/following",
    PENDING_REQUESTS: "/follows/requests/pending",
    REQUEST: "/follows/request",
    REQUEST_ID: (requestId: string) => `/follows/request/${requestId}`,
  },
  REPORTS: {
    CREATE: (resourceId: string) => `/resources/${resourceId}/report`,
    ALL: "/reports",
    UPDATE_STATUS: (id: string) => `/reports/${id}`,
  },
  USERS: {
    MENTORS: "/users/mentors",
    MENTOR: (id: string) => `/users/mentors/${id}`,
    ACTIVITY: "/users/activity",
    SEARCH: "/users/search"
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    READ: (id: string) => `/notifications/${id}/read`
  }
};
