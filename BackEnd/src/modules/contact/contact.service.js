const prisma = require("../../config/prisma");

/**
 * Save a new contact form submission to the database.
 */
const createContactSubmission = async (data) => {
  const { fullName, email, subject, message } = data;

  const submission = await prisma.contactSubmission.create({
    data: {
      fullName,
      email,
      subject,
      message,
    },
  });

  return submission;
};

/**
 * Get all contact submissions ordered by newest first.
 */
const getAllContactSubmissions = async () => {
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return submissions;
};

module.exports = {
  createContactSubmission,
  getAllContactSubmissions,
};
