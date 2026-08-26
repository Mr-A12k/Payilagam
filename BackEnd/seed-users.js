const prisma = require('./src/config/prisma');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log("Starting DB clean and seed...");
  try {
    const defaultPassword = "Payilagam@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Get all current users
    const allUsers = await prisma.user.findMany({ select: { userId: true } });
    if (allUsers.length === 0) {
      console.log("No users found.");
      return;
    }

    // Pick one user to be the temporary "owner" of everything so we don't hit foreign key constraints
    const tempOwnerId = allUsers[0].userId;
    const oldUsersCondition = { not: tempOwnerId };

    console.log(`Reassigning core data to temporary owner ID ${tempOwnerId}...`);
    
    await prisma.course.updateMany({ where: { mentorId: oldUsersCondition }, data: { mentorId: tempOwnerId } });
    await prisma.assignment.updateMany({ where: { createdBy: oldUsersCondition }, data: { createdBy: tempOwnerId } });
    await prisma.codingProblem.updateMany({ where: { createdBy: oldUsersCondition }, data: { createdBy: tempOwnerId } });
    await prisma.liveSession.updateMany({ where: { mentorId: oldUsersCondition }, data: { mentorId: tempOwnerId } });
    await prisma.workspace.updateMany({ where: { ownerId: oldUsersCondition }, data: { ownerId: tempOwnerId } });
    await prisma.resource.updateMany({ where: { uploaderId: oldUsersCondition }, data: { uploaderId: tempOwnerId } });
    await prisma.eduDocument.updateMany({ where: { uploaderId: oldUsersCondition }, data: { uploaderId: tempOwnerId } });

    console.log("Deleting interaction data for old users...");
    await prisma.message.deleteMany({ where: { senderId: oldUsersCondition } });
    await prisma.channelMessage.deleteMany({ where: { senderId: oldUsersCondition } });
    await prisma.notification.deleteMany({ where: { userId: oldUsersCondition } });
    await prisma.assignmentSubmission.deleteMany({ where: { studentId: oldUsersCondition } });
    await prisma.codingSubmission.deleteMany({ where: { studentId: oldUsersCondition } });
    await prisma.lessonProgress.deleteMany({ where: { studentId: oldUsersCondition } });
    await prisma.enrollment.deleteMany({ where: { studentId: oldUsersCondition } });
    await prisma.courseReview.deleteMany({ where: { studentId: oldUsersCondition } });
    await prisma.discussionReply.deleteMany({ where: { authorId: oldUsersCondition } });
    await prisma.discussion.deleteMany({ where: { authorId: oldUsersCondition } });
    await prisma.follow.deleteMany({ where: { OR: [{ followerId: oldUsersCondition }, { followingId: oldUsersCondition }] } });
    await prisma.followRequest.deleteMany({ where: { OR: [{ requesterId: oldUsersCondition }, { targetId: oldUsersCondition }] } });
    await prisma.auditLog.deleteMany({ where: { userId: oldUsersCondition } });
    await prisma.passwordResetOTP.deleteMany();
    await prisma.conversationParticipant.deleteMany({ where: { userId: oldUsersCondition } });
    await prisma.workspaceMember.deleteMany({ where: { userId: oldUsersCondition } });
    
    console.log("Deleting old users (except temp owner)...");
    await prisma.user.deleteMany({ where: { userId: oldUsersCondition } });

    // Now we update the temp owner to be the admin
    console.log("Converting temp owner to admin@mail.com...");
    const adminUser = await prisma.user.update({
      where: { userId: tempOwnerId },
      data: {
        email: "admin@mail.com",
        userName: "admin",
        fullName: "Admin User",
        mobile: "0000000000",
        password: hashedPassword,
        roleId: 1
      }
    });

    // Now we create the other 4 users
    console.log("Creating other 4 requested users...");
    const usersToCreate = [
      { email: "mentor@mail.com", roleId: 2, userName: "mentor", fullName: "Mentor User" },
      { email: "mentor1@mail.com", roleId: 2, userName: "mentor1", fullName: "Mentor One" },
      { email: "student@mail.com", roleId: 3, userName: "student", fullName: "Student User" },
      { email: "student1@mail.com", roleId: 3, userName: "student1", fullName: "Student One" }
    ];

    for (const u of usersToCreate) {
      await prisma.user.create({
        data: {
          email: u.email,
          userName: u.userName,
          fullName: u.fullName,
          mobile: Math.random().toString().slice(2, 12),
          password: hashedPassword,
          roleId: u.roleId
        }
      });
      console.log(`Created user: ${u.email}`);
    }

    // Reassign mentor stuff from admin to mentor@mail.com
    const mentorUser = await prisma.user.findUnique({ where: { email: "mentor@mail.com" }});
    console.log(`Reassigning courses to mentor ID ${mentorUser.userId}...`);
    
    await prisma.course.updateMany({ where: { mentorId: adminUser.userId }, data: { mentorId: mentorUser.userId } });
    await prisma.assignment.updateMany({ where: { createdBy: adminUser.userId }, data: { createdBy: mentorUser.userId } });
    await prisma.codingProblem.updateMany({ where: { createdBy: adminUser.userId }, data: { createdBy: mentorUser.userId } });
    await prisma.liveSession.updateMany({ where: { mentorId: adminUser.userId }, data: { mentorId: mentorUser.userId } });
    await prisma.resource.updateMany({ where: { uploaderId: adminUser.userId }, data: { uploaderId: mentorUser.userId } });
    await prisma.eduDocument.updateMany({ where: { uploaderId: adminUser.userId }, data: { uploaderId: mentorUser.userId } });

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
