const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with mock data...');

  // 1. Roles
  const roles = [
    { roleId: 1, roleName: 'admin' },
    { roleId: 2, roleName: 'mentor' },
    { roleId: 3, roleName: 'student' }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { roleName: role.roleName },
      update: {},
      create: role,
    });
  }
  console.log('Roles seeded.');

  // 2. Users (Mentors & Students)
  const defaultPassword = await bcrypt.hash('TaskPro@2026', 10);
  
  const users = [
    // Admins
    { userName: 'admin1', fullName: 'Super Admin', email: 'admin@taskpro.com', mobile: '1000000001', password: defaultPassword, roleId: 1 },
    // Mentors
    { userName: 'drsimon', fullName: 'Dr. Simon K.', email: 'simon@example.com', mobile: '2000000001', password: defaultPassword, roleId: 2, profileUrl: 'https://i.pravatar.cc/150?u=1' },
    { userName: 'ariachen', fullName: 'Aria Chen', email: 'aria@example.com', mobile: '2000000002', password: defaultPassword, roleId: 2, profileUrl: 'https://i.pravatar.cc/150?u=2' },
    { userName: 'rajivmehta', fullName: 'Rajiv Mehta', email: 'rajiv@example.com', mobile: '2000000003', password: defaultPassword, roleId: 2, profileUrl: 'https://i.pravatar.cc/150?u=3' },
    { userName: 'sjenkins', fullName: 'Sarah Jenkins', email: 'sarah@example.com', mobile: '2000000004', password: defaultPassword, roleId: 2 },
    { userName: 'evance', fullName: 'Elena Vance', email: 'elena@example.com', mobile: '2000000005', password: defaultPassword, roleId: 2, profileUrl: 'https://i.pravatar.cc/150?u=e' },
    { userName: 'mthorne', fullName: 'Marcus Thorne', email: 'marcus@example.com', mobile: '2000000006', password: defaultPassword, roleId: 2 },
    { userName: 'jmiller', fullName: 'Prof. James Miller', email: 'james@example.com', mobile: '2000000007', password: defaultPassword, roleId: 2 },
    // Students
    { userName: 'alicef', fullName: 'Alice Freeman', email: 'alice.f@example.com', mobile: '3000000001', password: defaultPassword, roleId: 3, profileUrl: 'https://i.pravatar.cc/150?u=a' },
    { userName: 'davids', fullName: 'David Smith', email: 'david.smith@example.com', mobile: '3000000002', password: defaultPassword, roleId: 3, profileUrl: 'https://i.pravatar.cc/150?u=d' },
    { userName: 'jwilson', fullName: 'James Wilson', email: 'j.wilson@example.com', mobile: '3000000003', password: defaultPassword, roleId: 3, profileUrl: 'https://i.pravatar.cc/150?u=j' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { profileUrl: user.profileUrl },
      create: user,
    });
  }
  console.log('Users seeded.');

  // Fetch mentors for course association
  const simon = await prisma.user.findUnique({ where: { email: 'simon@example.com' } });
  const aria = await prisma.user.findUnique({ where: { email: 'aria@example.com' } });
  const rajiv = await prisma.user.findUnique({ where: { email: 'rajiv@example.com' } });
  const sarah = await prisma.user.findUnique({ where: { email: 'sarah@example.com' } });
  const elena = await prisma.user.findUnique({ where: { email: 'elena@example.com' } });
  const marcus = await prisma.user.findUnique({ where: { email: 'marcus@example.com' } });
  const james = await prisma.user.findUnique({ where: { email: 'james@example.com' } });

  // 3. Courses
  const courses = [
    // Web Courses
    { courseName: 'Advanced React Patterns', courseCode: 'WEB101', mentorId: sarah.userId, duration: 16, price: 0, status: 'published' },
    { courseName: 'Fullstack Next.js & Node', courseCode: 'WEB102', mentorId: rajiv.userId, duration: 24, price: 0, status: 'published' },
    { courseName: 'CSS Architecture Mastery', courseCode: 'WEB103', mentorId: elena.userId, duration: 8, price: 0, status: 'published' },
    { courseName: 'Web Performance Optimization', courseCode: 'WEB104', mentorId: marcus.userId, duration: 12, price: 0, status: 'published' },
    // Data Courses
    { courseName: 'Applied Deep Learning', courseCode: 'DAT201', mentorId: simon.userId, duration: 32, price: 0, status: 'published' },
    { courseName: 'Data Engineering with Spark', courseCode: 'DAT202', mentorId: aria.userId, duration: 18, price: 0, status: 'published' },
    { courseName: 'Statistical ML Modeling', courseCode: 'DAT203', mentorId: elena.userId, duration: 14, price: 0, status: 'published' },
    { courseName: 'NLP with Transformers', courseCode: 'DAT204', mentorId: sarah.userId, duration: 20, price: 0, status: 'published' },
    // Cloud Courses
    { courseName: 'AWS Solutions Architect', courseCode: 'CLD301', mentorId: rajiv.userId, duration: 40, price: 0, status: 'published' },
    { courseName: 'Kubernetes In Production', courseCode: 'CLD302', mentorId: marcus.userId, duration: 16, price: 0, status: 'published' },
    { courseName: 'GCP Data Pipelines', courseCode: 'CLD303', mentorId: simon.userId, duration: 12, price: 0, status: 'published' },
    { courseName: 'Serverless Infrastructure', courseCode: 'CLD304', mentorId: aria.userId, duration: 10, price: 0, status: 'published' },
    // Trending
    { courseName: 'Advanced ML Frameworks', courseCode: 'TRD001', mentorId: elena.userId, duration: 12, price: 0, status: 'published' },
    { courseName: 'Modern Power Systems', courseCode: 'TRD002', mentorId: james.userId, duration: 18, price: 0, status: 'published' },
    { courseName: 'Applied CRISPR Genomics', courseCode: 'TRD003', mentorId: marcus.userId, duration: 8, price: 0, status: 'published' },
    { courseName: 'Distributed Cloud Security', courseCode: 'TRD004', mentorId: sarah.userId, duration: 22, price: 0, status: 'published' },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { courseCode: course.courseCode },
      update: {},
      create: course,
    });
  }
  console.log('Courses seeded.');

  // 4. Resources
  const admin = await prisma.user.findUnique({ where: { userName: 'admin1' } });
  if (admin) {
    const resources = [
      { title: 'React 19 Cheat Sheet', description: 'Quick reference for the newest hooks and concurrent features.', type: 'pdf', category: 'Documents', sizeBytes: 2516582, fileUrl: '/uploads/react-19.pdf', uploaderId: admin.userId },
      { title: 'System Design Interview Prep', description: 'Comprehensive guide to mastering system design rounds.', type: 'pdf', category: 'Documents', sizeBytes: 5347737, fileUrl: '/uploads/system-design.pdf', uploaderId: admin.userId },
      { title: 'Docker Starter Kit', description: 'Essential docker-compose templates for node and python.', type: 'zip', category: 'Code', sizeBytes: 1258291, fileUrl: '/uploads/docker-kit.zip', uploaderId: admin.userId },
      { title: 'Advanced GraphQL Workshop', description: 'Full 2-hour recording of the GraphQL advanced queries workshop.', type: 'video', category: 'Videos', sizeBytes: 471859200, fileUrl: '/uploads/graphql.mp4', uploaderId: admin.userId },
    ];

    for (const res of resources) {
      // Prevent duplicates by checking if it exists
      const existing = await prisma.resource.findFirst({ where: { title: res.title } });
      if (!existing) {
        await prisma.resource.create({
          data: res
        });
      }
    }
    console.log('Resources seeded.');
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
