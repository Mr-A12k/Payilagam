const catchAsync = require("../../utils/catchAsync");
const submissionService = require("./submission.service");
const { success, error, paginated } = require("../../utils/responseHelper");

const submitAssignment = catchAsync(async (request, response) => {
  const submission = await submissionService.submitAssignment(
    request.user.userId,
    request.params.assignmentId,
    request.body,
  );
  return success(
    response,
    submission,
    "Assignment submitted successfully",
    201,
  );
});

const getSubmissionsByAssignment = catchAsync(async (request, response) => {
  const { submissions, pagination } =
    await submissionService.getSubmissionsByAssignment(
      request.params.assignmentId,
      request.query,
      request.user,
    );
  return paginated(
    response,
    submissions,
    pagination,
    "Submissions retrieved successfully",
  );
});

const getStudentSubmissions = catchAsync(async (request, response) => {
  const submissions = await submissionService.getStudentSubmissions(
    request.user.userId,
    request.params.assignmentId,
  );
  return success(response, submissions, "Submissions retrieved successfully");
});

const getMySubmissions = catchAsync(async (request, response) => {
  const { submissions, pagination } = await submissionService.getMySubmissions(
    request.user.userId,
    request.query,
  );
  return paginated(
    response,
    submissions,
    pagination,
    "Submissions retrieved successfully",
  );
});

const gradeSubmission = catchAsync(async (request, response) => {
  const submission = await submissionService.gradeSubmission(
    request.params.id,
    request.user.userId,
    request.user.role,
    request.body,
  );
  return success(response, submission, "Submission graded successfully");
});

const getSubmissionById = catchAsync(async (request, response) => {
  const submission = await submissionService.getSubmissionById(
    request.params.id,
    request.user,
  );
  return success(response, submission, "Submission retrieved successfully");
});

module.exports = {
  submitAssignment,
  getSubmissionsByAssignment,
  getStudentSubmissions,
  getMySubmissions,
  gradeSubmission,
  getSubmissionById,
};
