const catchAsync = require("../../utils/catchAsync");
const lessonService = require("./lesson.service");
const { success, error } = require("../../utils/responseHelper");

const createLesson = catchAsync(async (request, response) => {
  const moduleId = parseInt(request.params.moduleId);
  const lesson = await lessonService.createLesson(
    moduleId,
    request.user.userId,
    request.body,
    request.user.role,
  );
  return success(response, lesson, "Lesson created successfully", 201);
});

const getLessonsByModule = catchAsync(async (request, response) => {
  const moduleId = parseInt(request.params.moduleId);
  const lessons = await lessonService.getLessonsByModule(moduleId);
  return success(response, lessons, "Lessons retrieved successfully");
});

const getLessonById = catchAsync(async (request, response) => {
  const lessonId = parseInt(request.params.id);
  const lesson = await lessonService.getLessonById(
    lessonId,
    request.user.userId,
    request.user.role,
  );
  return success(response, lesson, "Lesson retrieved successfully");
});

const updateLesson = catchAsync(async (request, response) => {
  const lessonId = parseInt(request.params.id);
  const lesson = await lessonService.updateLesson(
    lessonId,
    request.user.userId,
    request.body,
    request.user.role,
  );
  return success(response, lesson, "Lesson updated successfully");
});

const deleteLesson = catchAsync(async (request, response) => {
  const lessonId = parseInt(request.params.id);
  const result = await lessonService.deleteLesson(
    lessonId,
    request.user.userId,
    request.user.role,
  );
  return success(response, result, "Lesson deleted successfully");
});

module.exports = {
  createLesson,
  getLessonsByModule,
  getLessonById,
  updateLesson,
  deleteLesson,
};
