const catchAsync = require("../../utils/catchAsync");
const adminService = require("./admin.service");
const { success, error, paginated } = require("../../utils/responseHelper");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../../utils/pagination");

// Dashboard
const getDashboard = catchAsync(async (request, response) => {
  const stats = await adminService.getDashboardStats();
  return success(response, stats, "Dashboard stats retrieved");
});

// User management
const getAllUsers = catchAsync(async (request, response) => {
  const pagination = getPaginationParams(request.query);
  const filters = {
    search: request.query.search,
    role: request.query.role,
    isActive: request.query.isActive,
  };
  const { users, total } = await adminService.getAllUsers(filters, pagination);
  const paginationMetadata = getPaginationMeta(
    total,
    pagination.page,
    pagination.limit,
  );
  return paginated(response, users, paginationMetadata, "Users retrieved");
});

const getUserById = catchAsync(async (request, response) => {
  const user = await adminService.getUserById(request.params.id);
  return success(response, user, "User retrieved");
});

const createUser = catchAsync(async (request, response) => {
  const user = await adminService.createUser(request.body);
  return success(response, user, "User created", 201);
});

const updateUser = catchAsync(async (request, response) => {
  const user = await adminService.updateUser(request.params.id, request.body);
  return success(response, user, "User updated");
});

const deleteUser = catchAsync(async (request, response) => {
  const result = await adminService.deleteUser(request.params.id);
  return success(response, result, "User deactivated");
});

const toggleUserStatus = catchAsync(async (request, response) => {
  const user = await adminService.toggleUserStatus(request.params.id);
  return success(
    response,
    user,
    `User ${user.isActive ? "activated" : "deactivated"}`,
  );
});

const resetPassword = catchAsync(async (request, response) => {
  const { newPassword } = request.body;
  if (!newPassword || newPassword.length < 6) {
    return error(response, "New password must be at least 6 characters", 400);
  }
  const result = await adminService.resetUserPassword(
    request.params.id,
    newPassword,
  );
  return success(response, result, "Password reset successfully");
});

// Role management
const getAllRoles = catchAsync(async (request, response) => {
  const roles = await adminService.getAllRoles();
  return success(response, roles, "Roles retrieved");
});

const createRole = catchAsync(async (request, response) => {
  const { roleName } = request.body;
  if (!roleName) {
    return error(response, "Role name is required", 400);
  }
  const role = await adminService.createRole(roleName);
  return success(response, role, "Role created", 201);
});

// Analytics
const getEnrollmentAnalytics = catchAsync(async (request, response) => {
  const days = parseInt(request.query.days) || 30;
  const analytics = await adminService.getEnrollmentAnalytics(days);
  return success(response, analytics, "Enrollment analytics retrieved");
});

const getCourseAnalytics = catchAsync(async (request, response) => {
  const analytics = await adminService.getCourseAnalytics();
  return success(response, analytics, "Course analytics retrieved");
});

const getSystemLogs = catchAsync(async (request, response) => {
  const logs = await adminService.getAuditLogs();
  return success(response, logs, "System logs retrieved");
});

module.exports = {
  getDashboard,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword,
  getAllRoles,
  createRole,
  getEnrollmentAnalytics,
  getCourseAnalytics,
  getSystemLogs,
};
