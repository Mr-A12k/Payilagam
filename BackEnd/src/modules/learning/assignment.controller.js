const catchAsync = require("../../utils/catchAsync");
const assignmentService = require("./assignment.service");
const { success, error, paginated } = require("../../utils/responseHelper");

const createAssignment = catchAsync(async (request, response) => {
  const assignment = await assignmentService.createAssignment(
    request.user.userId,
    request.user.role,
    request.body,
  );
  return success(response, assignment, "Assignment created successfully", 201);
});

const getAssignmentsByCourse = catchAsync(async (request, response) => {
  const { assignments, pagination } =
    await assignmentService.getAssignmentsByCourse(
      request.params.courseId,
      request.query,
    );
  return paginated(
    response,
    assignments,
    pagination,
    "Assignments retrieved successfully",
  );
});

const getAssignmentById = catchAsync(async (request, response) => {
  const assignment = await assignmentService.getAssignmentById(
    request.params.id,
  );
  return success(response, assignment, "Assignment retrieved successfully");
});

const updateAssignment = catchAsync(async (request, response) => {
  const assignment = await assignmentService.updateAssignment(
    request.params.id,
    request.user.userId,
    request.user.role,
    request.body,
  );
  return success(response, assignment, "Assignment updated successfully");
});

const deleteAssignment = catchAsync(async (request, response) => {
  const result = await assignmentService.deleteAssignment(
    request.params.id,
    request.user.userId,
    request.user.role,
  );
  return success(response, result, "Assignment deleted successfully");
});

const getUpcomingAssignments = catchAsync(async (request, response) => {
  const assignments = await assignmentService.getUpcomingAssignments(
    request.user.userId,
  );
  return success(
    response,
    assignments,
    "Upcoming assignments retrieved successfully",
  );
});

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getUpcomingAssignments,
};
