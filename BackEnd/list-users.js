const prisma = require('./src/config/prisma');

async function listUsers() {
  const users = await prisma.user.findMany({
    select: { userId: true, email: true, roleId: true }
  });
  console.log("Users:", users);
  
  const courses = await prisma.course.findMany({
    select: { courseId: true, mentorId: true }
  });
  console.log("Courses:", courses);
  
  process.exit(0);
}
listUsers();
