const catchAsync = require("../../utils/catchAsync");
const courseService = require("./course.service");
const { success, error, paginated } = require("../../utils/responseHelper");

const validateCourseBody = (body, creating = false) => {
  const invalid = (message) => { const issue = new Error(message); issue.statusCode = 400; throw issue; };
  for (const field of ["courseName", "courseCode"]) {
    if (creating || body[field] !== undefined) {
      if (typeof body[field] !== "string" || !body[field].trim()) invalid(`${field} is required`);
      body[field] = body[field].trim();
    }
  }
  for (const field of ["price", "duration", "categoryId"]) {
    if (body[field] === undefined) continue;
    if (field === "categoryId" && (body[field] === "" || body[field] === null)) { body[field] = null; continue; }
    const value = Number(body[field]);
    if (!Number.isFinite(value) || value < 0 || (field !== "price" && !Number.isInteger(value)) || (field === "categoryId" && value === 0)) invalid(`Invalid ${field}`);
    body[field] = value;
  }
  if (body.level !== undefined) {
    body.level = String(body.level).toLowerCase();
    if (!["beginner", "intermediate", "advanced"].includes(body.level)) invalid("Invalid difficulty level");
  }
  if (body.status !== undefined) {
    body.status = String(body.status).toLowerCase();
    if (!["draft", "published"].includes(body.status)) invalid("Invalid publication status");
  }
  if (body.removeThumbnail === "true" || body.removeThumbnail === true) body.thumbnail = null;
};

const create = catchAsync(async (request, response) => {
  validateCourseBody(request.body, true);
  if (request.file) {
    request.body.thumbnail = `/uploads/${request.file.filename}`;
  }

  const course = await courseService.createCourse(
    request.user.userId,
    request.body,
  );
  return success(response, course, "Course created successfully", 201);
});

const getAll = catchAsync(async (request, response) => {
  const { courses, pagination } = await courseService.getAllCourses(
    request.query,
  );
  return paginated(
    response,
    courses,
    pagination,
    "Courses retrieved successfully",
  );
});

const getById = catchAsync(async (request, response) => {
  const identifier = request.params.uniqueId;
  if (!identifier) {
    return error(response, "Invalid course identifier", 400);
  }
  const course = await courseService.getCourseById(identifier);
  return success(response, course, "Course retrieved successfully");
});

const update = catchAsync(async (request, response) => {
  validateCourseBody(request.body);
  const identifier = request.params.uniqueId;
  if (!identifier) {
    return error(response, "Invalid course identifier", 400);
  }
  // Admin can update any course; mentor can only update own courses
  const mentorId = request.user.role === "admin" ? null : request.user.userId;
  if (request.file) {
    request.body.thumbnail = `/uploads/${request.file.filename}`;
  }

  const course = await courseService.updateCourse(
    identifier,
    mentorId,
    request.body,
  );
  return success(response, course, "Course updated successfully");
});

const remove = catchAsync(async (request, response) => {
  const identifier = request.params.uniqueId;
  if (!identifier) {
    return error(response, "Invalid course identifier", 400);
  }
  const result = await courseService.deleteCourse(
    identifier,
    request.user.userId,
    request.user.role,
  );
  return success(response, result, "Course deleted successfully");
});

const requestDeletion = catchAsync(async (request, response) => {
  const identifier = request.params.uniqueId;
  const result = await courseService.requestCourseDeletion(
    identifier,
    request.user.userId,
  );
  return success(response, result, "Deletion request sent to Admin");
});

const getMyCourses = catchAsync(async (request, response) => {
  const { courses, pagination } = await courseService.getMentorCourses(
    request.user.userId,
    request.query,
  );
  return paginated(
    response,
    courses,
    pagination,
    "Your courses retrieved successfully",
  );
});

const getPublished = catchAsync(async (request, response) => {
  const { courses, pagination } = await courseService.getPublishedCourses(
    request.query,
  );
  return paginated(
    response,
    courses,
    pagination,
    "Published courses retrieved successfully",
  );
});

const getMentorStats = catchAsync(async (request, response) => {
  const stats = await courseService.getMentorStats(request.user.userId);
  return success(response, stats, "Mentor stats retrieved successfully");
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  requestDeletion,
  getMyCourses,
  getPublished,
  getMentorStats,
};
