const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // 1. Ensure Roles Exist
    const roles = ['admin', 'mentor', 'student'];
    for (let i = 0; i < roles.length; i++) {
        await prisma.role.upsert({
            where: { roleName: roles[i] },
            update: {},
            create: { roleId: i + 1, roleName: roles[i] },
        });
    }

    const defaultPassword = await bcrypt.hash('TaskPro@2026', 10);

    // 2. Create Admin: kabix
    const adminUser = await prisma.user.upsert({
        where: { userName: 'kabix' },
        update: {},
        create: {
            userName: 'kabix',
            fullName: 'Kabix Admin',
            email: 'admin@lumina.com',
            mobile: '9876543210',
            password: defaultPassword,
            roleId: 1, // admin
            mustChangePassword: false,
        },
    });
    console.log(`Created admin: ${adminUser.userName}`);

    // 3. Create Mentors: prakash, saranya
    const mentor1 = await prisma.user.upsert({
        where: { userName: 'prakash' },
        update: {},
        create: {
            userName: 'prakash',
            fullName: 'Prakash Raj',
            email: 'prakash@lumina.com',
            mobile: '9876543211',
            password: defaultPassword,
            roleId: 2, // mentor
            mustChangePassword: false,
        },
    });
    
    const mentor2 = await prisma.user.upsert({
        where: { userName: 'saranya' },
        update: {},
        create: {
            userName: 'saranya',
            fullName: 'Saranya Mohan',
            email: 'saranya@lumina.com',
            mobile: '9876543212',
            password: defaultPassword,
            roleId: 2, // mentor
            mustChangePassword: false,
        },
    });
    console.log(`Created mentors: ${mentor1.userName}, ${mentor2.userName}`);

    // 4. Create Students: arun, kabil
    const student1 = await prisma.user.upsert({
        where: { userName: 'arun' },
        update: {},
        create: {
            userName: 'arun',
            fullName: 'Arun Kumar',
            email: 'arun@lumina.com',
            mobile: '9876543213',
            password: defaultPassword,
            roleId: 3, // student
            mustChangePassword: false,
        },
    });

    const student2 = await prisma.user.upsert({
        where: { userName: 'kabil' },
        update: {},
        create: {
            userName: 'kabil',
            fullName: 'Kabilan V',
            email: 'kabil@lumina.com',
            mobile: '9876543214',
            password: defaultPassword,
            roleId: 3, // student
            mustChangePassword: false,
        },
    });
    console.log(`Created students: ${student1.userName}, ${student2.userName}`);

    // 5. Create Sample Categories
    const cat1 = await prisma.category.upsert({
        where: { slug: 'web-development' },
        update: {},
        create: {
            name: 'Web Development',
            slug: 'web-development',
            description: 'Learn to build modern web applications',
            icon: 'Code',
        },
    });

    const cat2 = await prisma.category.upsert({
        where: { slug: 'data-science' },
        update: {},
        create: {
            name: 'Data Science',
            slug: 'data-science',
            description: 'Master data analysis and machine learning',
            icon: 'Database',
        },
    });

    // 6. Create Sample Courses
    const course1 = await prisma.course.upsert({
        where: { courseCode: 'WD101' },
        update: {},
        create: {
            courseName: 'Full Stack Web Development',
            courseCode: 'WD101',
            description: 'A comprehensive guide to full stack development using MERN.',
            price: 49.99,
            level: 'intermediate',
            status: 'published',
            categoryId: cat1.categoryId,
            mentorId: mentor1.userId,
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
        },
    });

    const course2 = await prisma.course.upsert({
        where: { courseCode: 'DS201' },
        update: {},
        create: {
            courseName: 'Machine Learning Fundamentals',
            courseCode: 'DS201',
            description: 'Learn the core concepts of ML and AI.',
            price: 59.99,
            level: 'advanced',
            status: 'published',
            categoryId: cat2.categoryId,
            mentorId: mentor2.userId,
            thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        },
    });
    console.log('Created sample courses.');

    // 7. Create Sample Enrollments
    await prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId: student1.userId, courseId: course1.courseId } },
        update: {},
        create: { studentId: student1.userId, courseId: course1.courseId, status: 'active', progress: 25 },
    });

    await prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId: student2.userId, courseId: course2.courseId } },
        update: {},
        create: { studentId: student2.userId, courseId: course2.courseId, status: 'active', progress: 10 },
    });
    console.log('Created sample enrollments.');

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
