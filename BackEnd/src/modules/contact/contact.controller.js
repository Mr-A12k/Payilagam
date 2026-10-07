const catchAsync = require("../../utils/catchAsync");
const contactService = require("./contact.service");
const { success, error } = require("../../utils/responseHelper");

/**
 * POST /api/contact
 * Submit a contact form.
 */
const submitContactForm = catchAsync(async (request, response) => {
  const { fullName, email, subject, message } = request.body;
  if ([fullName, email, subject, message].some(value => typeof value !== 'string')) return error(response, 'Contact fields must be strings', 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return error(response, 'Invalid email address', 400);

  // Validate required fields
  const missingFields = [];
  if (!fullName || !fullName.trim()) missingFields.push("fullName");
  if (!email || !email.trim()) missingFields.push("email");
  if (!subject || !subject.trim()) missingFields.push("subject");
  if (!message || !message.trim()) missingFields.push("message");

  if (missingFields.length > 0) {
    return error(
      response,
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
    );
  }

  const submission = await contactService.createContactSubmission({
    fullName: fullName.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
  });

  return success(
    response,
    submission,
    "Contact form submitted successfully",
    201,
  );
});

/**
 * GET /api/contact
 * Get all contact submissions (admin only, no auth middleware for now).
 */
const getContactSubmissions = catchAsync(async (request, response) => {
  const submissions = await contactService.getAllContactSubmissions();
  return success(
    response,
    submissions,
    "Contact submissions retrieved successfully",
  );
});

module.exports = {
  submitContactForm,
  getContactSubmissions,
};
