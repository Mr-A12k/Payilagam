const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const IMAGES = [
  "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
  "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
  "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80",
  "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=800&q=80",
  "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
  "https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&q=80",
  "https://images.unsplash.com/photo-1496065187959-7f07b8353c55?w=800&q=80",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80"
];

async function main() {
  console.log('Updating courses with real image URLs...');
  
  const courses = await prisma.course.findMany();
  
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    // Pick an image sequentially, wrapping around if needed
    const imageUrl = IMAGES[i % IMAGES.length];
    
    await prisma.course.update({
      where: { courseId: course.courseId },
      data: { thumbnail: imageUrl }
    });
    
    console.log(`Updated ${course.courseName} with image`);
  }
  
  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
