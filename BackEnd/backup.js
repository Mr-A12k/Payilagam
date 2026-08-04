const fs = require('fs');
const prisma = require('./src/config/prisma');

async function backup() {
  console.log("Starting backup of Users and dependent tables...");
  try {
    const backupData = {};
    backupData.users = await prisma.user.findMany();
    backupData.messages = await prisma.message.findMany();
    backupData.channelMessages = await prisma.channelMessage.findMany();
    backupData.notifications = await prisma.notification.findMany();
    backupData.enrollments = await prisma.enrollment.findMany();
    backupData.lessonProgress = await prisma.lessonProgress.findMany();
    backupData.assignmentSubmissions = await prisma.assignmentSubmission.findMany();
    backupData.codingSubmissions = await prisma.codingSubmission.findMany();
    backupData.courseReviews = await prisma.courseReview.findMany();
    
    fs.writeFileSync('database-backup.json', JSON.stringify(backupData, null, 2));
    console.log("Backup completed successfully! Saved to database-backup.json");
  } catch (err) {
    console.error("Backup failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
