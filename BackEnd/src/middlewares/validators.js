/**
 * Input validation middleware
 * Lightweight validation without external dependencies
 */

const validate = (rules) => {
  return (request, response, next) => {
    const errors = [];

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = request.body[field];

      if (
        fieldRules.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (fieldRules.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({ field, message: `${field} must be a valid email` });
        }
      }

      if (fieldRules.type === "string" && typeof value !== "string") {
        errors.push({ field, message: `${field} must be a string` });
      }

      if (
        fieldRules.type === "number" &&
        (typeof value !== "number" || isNaN(value))
      ) {
        errors.push({ field, message: `${field} must be a number` });
      }

      if (fieldRules.type === "integer") {
        const intVal = parseInt(value);
        if (isNaN(intVal) || intVal !== Number(value)) {
          errors.push({ field, message: `${field} must be an integer` });
        }
      }

      if (
        fieldRules.minLength &&
        typeof value === "string" &&
        value.length < fieldRules.minLength
      ) {
        errors.push({
          field,
          message: `${field} must be at least ${fieldRules.minLength} characters`,
        });
      }

      if (
        fieldRules.maxLength &&
        typeof value === "string" &&
        value.length > fieldRules.maxLength
      ) {
        errors.push({
          field,
          message: `${field} must be at most ${fieldRules.maxLength} characters`,
        });
      }

      if (fieldRules.min !== undefined && Number(value) < fieldRules.min) {
        errors.push({
          field,
          message: `${field} must be at least ${fieldRules.min}`,
        });
      }

      if (fieldRules.max !== undefined && Number(value) > fieldRules.max) {
        errors.push({
          field,
          message: `${field} must be at most ${fieldRules.max}`,
        });
      }

      if (fieldRules.enum && !fieldRules.enum.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${fieldRules.enum.join(", ")}`,
        });
      }

      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors.push({
          field,
          message: fieldRules.patternMessage || `${field} format is invalid`,
        });
      }
    }

    if (errors.length > 0) {
      return response.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};

// Pre-built validation rules for common operations
const validationRules = {
  register: {
    userName: { required: true, type: "string", minLength: 3, maxLength: 30 },
    fullName: { required: true, type: "string", minLength: 2, maxLength: 100 },
    email: { required: true, type: "email" },
    mobile: { required: true, type: "string", minLength: 10, maxLength: 15 },
    password: { required: true, type: "string", minLength: 6 },
  },
  login: {
    email: { required: true, type: "email" },
    password: { required: true, type: "string" },
  },
  createCourse: {
    courseName: {
      required: true,
      type: "string",
      minLength: 3,
      maxLength: 200,
    },
    courseCode: { required: true, type: "string", minLength: 2, maxLength: 20 },
    description: { type: "string" },
    level: { enum: ["beginner", "intermediate", "advanced"] },
  },
  createModule: {
    title: { required: true, type: "string", minLength: 2, maxLength: 200 },
    orderIndex: { type: "integer", min: 0 },
  },
  createLesson: {
    title: { required: true, type: "string", minLength: 2, maxLength: 200 },
    type: { required: true, enum: ["video", "text", "quiz", "coding"] },
    orderIndex: { type: "integer", min: 0 },
  },
  createAssignment: {
    title: { required: true, type: "string", minLength: 3, maxLength: 200 },
    courseId: { required: true, type: "integer" },
    totalMarks: { type: "integer", min: 1 },
    type: { enum: ["file_upload", "coding_challenge", "quiz", "text"] },
  },
  createProblem: {
    title: { required: true, type: "string", minLength: 3, maxLength: 200 },
    difficulty: { required: true, enum: ["easy", "medium", "hard"] },
  },
  createDiscussion: {
    title: { required: true, type: "string", minLength: 3, maxLength: 300 },
    content: { required: true, type: "string", minLength: 10 },
  },
  submitCode: {
    language: { required: true, type: "string" },
    code: { required: true, type: "string" },
  },
  requestPasswordReset: { email: { required: true, type: "email" } },
  verifyPasswordReset: {
    email: { required: true, type: "email" },
    otp: { required: true, type: "string", minLength: 6, maxLength: 6 },
    newPassword: { required: true, type: "string", minLength: 6 },
  },
  createReview: {
    rating: { required: true, type: "integer", min: 1, max: 5 },
  },
};

module.exports = {
  validate,
  validationRules,
};
