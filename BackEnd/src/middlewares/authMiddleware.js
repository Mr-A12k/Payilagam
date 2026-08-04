const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { error } = require("../utils/responseHelper");

/**
 * JWT authentication middleware
 * Verifies token from Authorization header and attaches user to request
 */
const authenticate = async (request, response, next) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return error(response, "Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      include: { role: true },
    });

    if (!user) {
      return error(response, "User not found.", 401);
    }

    if (!user.isActive) {
      return error(response, "Account has been deactivated.", 403);
    }

    request.user = {
      userId: user.userId,
      userName: user.userName,
      email: user.email,
      fullName: user.fullName,
      role: user.role.roleName,
      roleId: user.roleId,
      profileUrl: user.profileUrl,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return error(response, "Token expired. Please login again.", 401);
    }
    if (err.name === "JsonWebTokenError") {
      return error(response, "Invalid token.", 401);
    }
    return error(response, "Authentication failed.", 401);
  }
};

/**
 * Role-based authorization middleware
 * Usage: authorize('admin', 'mentor')
 */
const authorize = (...roles) => {
  return (request, response, next) => {
    if (!request.user) {
      return error(response, "Authentication required.", 401);
    }

    if (!roles.includes(request.user.role)) {
      return error(
        response,
        `Access denied. Required role: ${roles.join(" or ")}`,
        403,
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
