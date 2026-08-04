/**
 * @file seed.js
 * @description Massive database seed script to populate realistic data for the entire platform.
 * Populates Users, Categories, Courses, Modules, Lessons, Coding Problems, Enrollments, and Progress.
 */

require("dotenv").config();
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const seed = async () => {
  console.log("🌱 Starting massive database seed...\n");

  try {
    // 1. Roles
    console.log("1. Creating Roles...");
    const roles = ["admin", "mentor", "student"];
    for (const roleName of roles) {
      await prisma.role.upsert({
        where: { roleName },
        update: {},
        create: { roleName },
      });
    }

    // 2. Users
    console.log("2. Creating Users...");
    const adminRole = await prisma.role.findUnique({
      where: { roleName: "admin" },
    });
    const mentorRole = await prisma.role.findUnique({
      where: { roleName: "mentor" },
    });
    const studentRole = await prisma.role.findUnique({
      where: { roleName: "student" },
    });
    const hash = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.upsert({
      where: { email: "admin@taskpro.com" },
      update: {},
      create: {
        userName: "admin",
        fullName: "System Admin",
        email: "admin@taskpro.com",
        mobile: "9999999999",
        password: hash,
        roleId: adminRole.roleId,
      },
    });

    const mentor = await prisma.user.upsert({
      where: { email: "mentor@taskpro.com" },
      update: {},
      create: {
        userName: "mentor",
        fullName: "Jane Doe (Mentor)",
        email: "mentor@taskpro.com",
        mobile: "9999999998",
        password: hash,
        roleId: mentorRole.roleId,
        bio: "Expert Full Stack Developer",
      },
    });

    const student = await prisma.user.upsert({
      where: { email: "student@taskpro.com" },
      update: {},
      create: {
        userName: "student",
        fullName: "John Smith (Student)",
        email: "student@taskpro.com",
        mobile: "9999999997",
        password: hash,
        roleId: studentRole.roleId,
      },
    });

    // 3. Categories
    console.log("3. Creating Categories...");
    const categoriesData = [
      {
        name: "Web Development",
        slug: "web-development",
        description: "Master modern web technologies.",
        icon: "🌐",
      },
      {
        name: "Data Science",
        slug: "data-science",
        description: "Learn AI and Machine Learning.",
        icon: "📊",
      },
      {
        name: "Mobile App Dev",
        slug: "mobile-app-dev",
        description: "Build iOS and Android apps.",
        icon: "📱",
      },
    ];

    const createdCategories = [];
    for (const cat of categoriesData) {
      createdCategories.push(
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: cat,
        }),
      );
    }

    // 4. Courses
    console.log("4. Creating Courses...");
    const courseData = [
      {
        courseName: "Complete React Developer in 2024",
        courseCode: "WEB-101",
        description:
          "Learn React JS from scratch to advanced. Build real-world projects.",
        price: 49.99,
        level: "BEGINNER",
        status: "PUBLISHED",
        categoryId: createdCategories[0].categoryId,
        mentorId: mentor.userId,
        thumbnail:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000",
      },
      {
        courseName: "Python for Data Science and Machine Learning",
        courseCode: "DS-201",
        description: "Master Python, Pandas, NumPy, Scikit-Learn, and more.",
        price: 89.99,
        level: "INTERMEDIATE",
        status: "PUBLISHED",
        categoryId: createdCategories[1].categoryId,
        mentorId: mentor.userId,
        thumbnail:
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1000",
      },
    ];

    const createdCourses = [];
    for (const c of courseData) {
      let course = await prisma.course.findFirst({
        where: { courseCode: c.courseCode },
      });
      if (!course) course = await prisma.course.create({ data: c });
      createdCourses.push(course);
    }

    // 5. Modules & Lessons
    console.log("5. Creating Modules & Lessons...");
    for (const course of createdCourses) {
      // Module 1
      const m1 = await prisma.courseModule.create({
        data: {
          courseId: course.courseId,
          title: "Getting Started",
          description: "Introduction to the course",
          orderIndex: 1,
        },
      });
      await prisma.lesson.createMany({
        data: [
          {
            moduleId: m1.moduleId,
            title: "Welcome to the Course",
            type: "video",
            content: "Introductory video.",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration: 300,
            orderIndex: 1,
            isFree: true,
          },
          {
            moduleId: m1.moduleId,
            title: "Environment Setup",
            type: "text",
            content: "Install Node.js and VS Code.",
            duration: 600,
            orderIndex: 2,
          },
        ],
      });

      // Module 2
      const m2 = await prisma.courseModule.create({
        data: {
          courseId: course.courseId,
          title: "Core Concepts",
          description: "Deep dive into fundamentals",
          orderIndex: 2,
        },
      });
      await prisma.lesson.createMany({
        data: [
          {
            moduleId: m2.moduleId,
            title: "Fundamentals Overview",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration: 1200,
            orderIndex: 1,
          },
          {
            moduleId: m2.moduleId,
            title: "Quiz 1: Core Concepts",
            type: "quiz",
            content:
              '{"questions": [{"q": "Is React a library?", "options": ["Yes", "No"], "answer": 0}]}',
            duration: 300,
            orderIndex: 2,
          },
        ],
      });
    }

    // 6. Enrollments & Progress
    console.log("6. Enrolling Student & Adding Progress...");
    const firstCourse = createdCourses[0];

    // Ensure no duplicate enrollment
    let enroll = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.userId,
          courseId: firstCourse.courseId,
        },
      },
    });

    if (!enroll) {
      enroll = await prisma.enrollment.create({
        data: {
          studentId: student.userId,
          courseId: firstCourse.courseId,
          status: "active",
          progress: 25.0,
        },
      });

      // Mark a lesson as completed
      const firstLesson = await prisma.lesson.findFirst({
        where: { module: { courseId: firstCourse.courseId } },
        orderBy: { orderIndex: "asc" },
      });
      if (firstLesson) {
        await prisma.lessonProgress.create({
          data: {
            studentId: student.userId,
            lessonId: firstLesson.lessonId,
            completed: true,
            completedAt: new Date(),
            watchTime: 300,
          },
        });
      }
    }

    // 7. Coding Problems
    console.log("7. Creating Coding Problems...");
    const tag = await prisma.problemTag.upsert({
      where: { slug: "arrays" },
      update: {},
      create: { name: "Arrays", slug: "arrays" },
    });

    await prisma.codingProblem.upsert({
      where: { slug: "two-sum" },
      update: {},
      create: {
        title: "Two Sum",
        slug: "two-sum",
        description:
          "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "EASY",
        isActive: true,
        createdBy: admin.userId,
        testCases: {
          create: [
            {
              input: "[2,7,11,15]\n9",
              expectedOutput: "[0,1]",
              isHidden: false,
            },
            { input: "[3,2,4]\n6", expectedOutput: "[1,2]", isHidden: true },
          ],
        },
      },
    });

    console.log("🎉 Massive database seed completed successfully!");
    console.log("\n📝 Test Accounts:");
    console.log("   admin@taskpro.com   | password123");
    console.log("   mentor@taskpro.com  | password123");
    console.log("   student@taskpro.com | password123\n");
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
