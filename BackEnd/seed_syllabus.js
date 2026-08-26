const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SAMPLE_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

async function main() {
  console.log("Starting syllabus seeding...");
  
  // Find courses that don't have modules
  const coursesWithoutModules = await prisma.course.findMany({
    where: {
      modules: {
        none: {}
      }
    }
  });

  console.log(`Found ${coursesWithoutModules.length} courses without modules.`);

  for (const course of coursesWithoutModules) {
    console.log(`Seeding syllabus for course: ${course.courseName} (ID: ${course.courseId})`);
    
    // Create Module 1: Introduction
    const module1 = await prisma.courseModule.create({
      data: {
        courseId: course.courseId,
        title: 'Introduction to the Course',
        description: 'Get started with the basics.',
        orderIndex: 1,
        lessons: {
          create: [
            {
              title: 'Welcome & Overview',
              type: 'video',
              videoUrl: SAMPLE_VIDEO_URL,
              duration: 10,
              orderIndex: 1,
              isFree: true
            },
            {
              title: 'Setting up the Environment',
              type: 'text',
              content: 'Follow these steps to set up your environment...',
              orderIndex: 2,
              isFree: false
            }
          ]
        }
      }
    });

    // Create Module 2: Core Concepts
    const module2 = await prisma.courseModule.create({
      data: {
        courseId: course.courseId,
        title: 'Core Concepts',
        description: 'Dive deep into the main topics.',
        orderIndex: 2,
        lessons: {
          create: [
            {
              title: 'Deep Dive Part 1',
              type: 'video',
              videoUrl: SAMPLE_VIDEO_URL,
              duration: 25,
              orderIndex: 1,
              isFree: false
            },
            {
              title: 'Practice Challenge',
              type: 'coding',
              content: 'Solve this challenge to test your understanding.',
              orderIndex: 2,
              isFree: false
            }
          ]
        }
      }
    });

    // Update the course's totalLessons count
    await prisma.course.update({
      where: { courseId: course.courseId },
      data: { totalLessons: 4 }
    });

    console.log(`Successfully added modules & lessons for course ${course.courseId}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
