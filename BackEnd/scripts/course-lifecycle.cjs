require('dotenv').config();
const assert = require('node:assert/strict');
const prisma = require('../src/config/prisma');
const base = 'http://localhost:5005/api';
const code = `QA-LIFECYCLE-${Date.now()}`;
let course;
let passed = 0;
const tokens = {};
async function request(role, method, path, body, expected = 200) {
  const response = await fetch(base + path, {
    method,
    headers: { ...(tokens[role] ? { Authorization: `Bearer ${tokens[role]}` } : {}), ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? body instanceof FormData ? body : JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${result.message}`);
  passed++;
  console.log(`PASS ${method} ${path} (${expected})`);
  return result.data;
}
async function run() {
  for (const role of ['mentor', 'student', 'admin', 'mentor1']) {
    const seed = require('node:fs').readFileSync(require('node:path').join(__dirname, '../seed-users.js'), 'utf8');
    const password = seed.match(/Payilagam@\d+/)?.[0];
    assert.ok(password, 'Seed password unavailable');
    const login = await request(null, 'POST', '/auth/login', { email: `${role}@mail.com`, password });
    tokens[role] = login.token;
  }
  await request('mentor', 'POST', '/courses', { courseName: '', courseCode: code }, 400);
  await request('student', 'POST', '/courses', { courseName: code, courseCode: code }, 403);
  const data = new FormData();
  for (const [key, value] of Object.entries({ courseName: code, courseCode: code, description: 'Temporary lifecycle test', categoryId: '', price: '0', duration: '0', level: 'beginner', status: 'draft' })) data.set(key, value);
  data.set('thumbnail', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' }), `${code}.png`);
  course = await request('mentor', 'POST', '/courses', data, 201);
  assert.equal(course.status, 'draft');
  assert.equal(course.duration, 0);
  assert.equal(course.categoryId, null);
  assert.ok(course.thumbnail);
  const draftCatalog = await request(null, 'GET', `/courses/published?search=${code}`);
  assert.equal(draftCatalog.length, 0);
  await request('student', 'PUT', `/courses/${course.uniqueId}`, { courseName: 'Unauthorized change' }, 403);
  await request('mentor1', 'PUT', `/courses/${course.uniqueId}`, { courseName: 'Unauthorized change' }, 403);
  await request('student', 'DELETE', `/courses/${course.uniqueId}`, undefined, 403);
  await request('mentor', 'POST', '/courses', { courseName: code, courseCode: code }, 409);
  await request('mentor', 'PUT', `/courses/${course.uniqueId}`, { price: -1 }, 400);
  await request('mentor', 'PUT', `/courses/${course.uniqueId}`, { duration: 'invalid' }, 400);
  await request('mentor', 'PUT', `/courses/${course.uniqueId}`, { categoryId: 999999 }, 400);
  await request('mentor', 'PUT', `/courses/${course.uniqueId}`, { status: 'invalid' }, 400);
  const categories = await request(null, 'GET', '/categories');
  const updated = await request('mentor', 'PUT', `/courses/${course.uniqueId}`, { courseName: `${code} Updated`, description: 'Updated description', categoryId: categories[0].categoryId, duration: 45, level: 'advanced', status: 'published', price: 0 });
  assert.equal(updated.duration, 45);
  assert.equal(updated.categoryId, categories[0].categoryId);
  const published = await request(null, 'GET', `/courses/published?search=${code}`);
  assert.ok(published.some(item => item.courseId === course.courseId));
  await request('mentor', 'PUT', `/courses/${course.uniqueId}`, { status: 'draft' });
  const hiddenCatalog = await request(null, 'GET', `/courses/published?search=${code}`);
  assert.equal(hiddenCatalog.length, 0);
  await request('mentor', 'PUT', `/courses/${course.uniqueId}`, { status: 'published' });
  const removedImage = await request('mentor', 'PUT', `/courses/${course.courseId}`, { removeThumbnail: true, categoryId: null });
  assert.equal(removedImage.thumbnail, null);
  assert.equal(removedImage.categoryId, null);
  const module = await request('mentor', 'POST', `/modules/course/${course.uniqueId}`, { title: 'QA module' }, 201);
  const lesson = await request('mentor', 'POST', `/lessons/module/${module.moduleId}`, { title: 'QA lesson', type: 'text', content: 'Lesson content', duration: 5 }, 201);
  await request('mentor', 'PUT', `/modules/${module.moduleId}`, { title: 'QA module updated' });
  await request('mentor', 'PUT', `/lessons/${lesson.lessonId}`, { title: 'QA lesson updated', content: 'Updated content' });
  const detail = await request(null, 'GET', `/courses/${course.uniqueId}`);
  assert.equal(detail.courseName, `${code} Updated`);
  assert.equal(detail.modules[0].lessons[0].title, 'QA lesson updated');
  await request('student', 'POST', `/enrollments/${course.courseId}/enroll`, {}, 201);
  await request('mentor', 'DELETE', `/courses/${course.uniqueId}`, undefined, 403);
  await request('mentor', 'POST', `/courses/${course.uniqueId}/request-deletion`, {});
  await request('admin', 'PUT', `/courses/${course.uniqueId}`, { description: 'Admin update' });
  await request('mentor', 'DELETE', `/lessons/${lesson.lessonId}`);
  await request('mentor', 'DELETE', `/modules/${module.moduleId}`);
  const retainedModule = await request('mentor', 'POST', `/modules/course/${course.courseId}`, { title: 'Cascade module' }, 201);
  await request('mentor', 'POST', `/lessons/module/${retainedModule.moduleId}`, { title: 'Cascade lesson', type: 'text' }, 201);
  await request('admin', 'DELETE', `/courses/${course.uniqueId}`);
  await request(null, 'GET', `/courses/${course.uniqueId}`, undefined, 404);
  assert.equal(await prisma.courseModule.count({ where: { courseId: course.courseId } }), 0);
  assert.equal(await prisma.enrollment.count({ where: { courseId: course.courseId } }), 0);
  console.log(`Course lifecycle: ${passed} requests passed; create, validation, update, publication, curriculum, enrollment, deletion request, and cascading delete verified.`);
}
run().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  if (course) {
    const remaining = await prisma.course.findUnique({ where: { courseId: course.courseId } });
    if (remaining && remaining.courseCode === code) {
      await prisma.enrollment.deleteMany({ where: { courseId: course.courseId } });
      await prisma.workspace.deleteMany({ where: { courseId: course.courseId } });
      await prisma.course.delete({ where: { courseId: course.courseId } });
    }
    await prisma.notification.deleteMany({ where: { title: 'Course Deletion Request', message: { contains: code } } });
    if (/^\/uploads\/thumbnail-\d+-\d+\.png$/.test(course.thumbnail || '')) {
      await require('node:fs/promises').unlink(require('node:path').join(__dirname, '..', course.thumbnail)).catch(() => {});
    }
  }
  await prisma.$disconnect();
});
