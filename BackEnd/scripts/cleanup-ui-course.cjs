require('dotenv').config();
const assert = require('node:assert/strict');
const prisma = require('../src/config/prisma');
const code = process.argv[2];
assert.match(code || '', /^QA-UI-\d+$/, 'Only temporary QA-UI courses may be removed');
async function run() {
  const course = await prisma.course.findUnique({ where: { courseCode: code }, include: { modules: { include: { lessons: true } } } });
  if (!course) {
    if (process.argv[3]) {
      const id = Number(process.argv[3]);
      assert.ok(Number.isInteger(id) && id > 0);
      assert.equal(await prisma.course.findUnique({ where: { courseId: id } }), null);
      assert.equal(await prisma.courseModule.count({ where: { courseId: id } }), 0);
      assert.equal(await prisma.enrollment.count({ where: { courseId: id } }), 0);
    }
    console.log('PASS temporary UI course is absent after browser deletion.');
    return;
  }
  assert.equal(course.courseName, `${code} Updated`);
  assert.equal(course.status, 'published');
  assert.equal(course.duration, 35);
  assert.ok(course.categoryId);
  assert.ok(course.modules.some(module => module.title === 'Manual QA Module' && module.lessons.some(lesson => lesson.title === 'Manual QA Lesson')));
  const seed = require('node:fs').readFileSync(require('node:path').join(__dirname, '../seed-users.js'), 'utf8');
  const login = await fetch('http://localhost:5005/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@mail.com', password: seed.match(/Payilagam@\d+/)[0] }) });
  assert.equal(login.status, 200);
  const token = (await login.json()).data.token;
  const deleted = await fetch(`http://localhost:5005/api/courses/${course.uniqueId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  assert.equal(deleted.status, 200, 'Course deletion failed');
  const detail = await fetch(`http://localhost:5005/api/courses/${course.uniqueId}`);
  assert.equal(detail.status, 404);
  assert.equal(await prisma.courseModule.count({ where: { courseId: course.courseId } }), 0);
  console.log('PASS manual course saved fields and curriculum verified; DELETE API passed; course and modules removed; subsequent GET returned 404.');
}
run().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
