require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../src/config/prisma');
const email = require('../src/utils/email');
const originalSend = email.sendMail;
const mails = [];
email.sendMail = async (...args) => { mails.push(args); return { success: true }; };
const marker = `learning-qa-${randomUUID()}`;
const users = [];
const tokens = {};
let course, server, base, passed = 0;
async function request(role, method, path, body, expected = 200) {
  const response = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(tokens[role] ? { Authorization: `Bearer ${tokens[role]}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(result)}`);
  assert.equal(result.success, expected < 400);
  console.log(`PASS ${++passed}: ${method} ${path} -> ${expected}`);
  return result.data;
}
async function run() {
  assert.ok(process.env.JWT_SECRET, 'JWT_SECRET required');
  for (const [name, roleName] of Object.entries({ student: 'student', outsider: 'student', mentor: 'mentor', otherMentor: 'mentor', admin: 'admin' })) {
    const role = await prisma.role.findUnique({ where: { roleName } });
    assert.ok(role, `Existing role ${roleName} required; no seed is run`);
    const user = await prisma.user.create({ data: { userName: `${marker}-${name}`, fullName: `${marker} ${name}`, email: `${marker}-${name}@example.invalid`, mobile: `${marker}-${name}`, password: 'unusable-test-password', roleId: role.roleId } });
    users.push(user.userId);
    tokens[name] = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '10m' });
  }
  course = await prisma.course.create({ data: { courseName: marker, courseCode: marker, mentorId: users[2], status: 'draft', totalLessons: 2, modules: { create: { title: marker, lessons: { create: [{ title: 'One', type: 'text', orderIndex: 0 }, { title: 'Two', type: 'text', orderIndex: 1 }] } } } }, include: { modules: { include: { lessons: { orderBy: { orderIndex: 'asc' } } } } } });
  server = require('../src/app').listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  base = `http://127.0.0.1:${server.address().port}/api`;
  console.log(`Isolated API: ${base}; fixture: ${marker}`);
  const cid = course.courseId, cuid = course.uniqueId;
  const [one, two] = course.modules[0].lessons.map(l => l.lessonId);
  await request(null, 'GET', '/assignments/upcoming', undefined, 401);
  await request(null, 'GET', '/submissions/my-submissions', undefined, 401);
  await request(null, 'GET', '/progress/dashboard', undefined, 401);
  await request(null, 'POST', `/reviews/course/${cid}`, { rating: 4 }, 401);
  await request(null, 'GET', `/enrollments/check/${cid}`, undefined, 401);
  await request('student', 'POST', `/enrollments/${cid}/enroll`, {}, 400);
  await prisma.course.update({ where: { courseId: cid }, data: { status: 'published' } });
  assert.equal((await request('student', 'GET', `/enrollments/check/${cuid}`)).enrolled, false);
  await request('student', 'POST', `/enrollments/${cuid}/enroll`, {}, 201);
  assert.equal(mails.length, 1);
  assert.ok(mails[0][0].endsWith('@example.invalid'));
  await request('student', 'POST', `/enrollments/${cid}/enroll`, {}, 409);
  assert.equal((await request('student', 'GET', '/enrollments/my-courses')).length, 1);
  await request('otherMentor', 'GET', `/enrollments/course/${cid}/students`, undefined, 403);
  await request('otherMentor', 'GET', `/enrollments/stats/${cid}`, undefined, 403);
  assert.equal((await request('mentor', 'GET', `/enrollments/course/${cuid}/students`)).length, 1);
  assert.equal((await request('admin', 'GET', `/enrollments/stats/${cid}`)).active, 1);
  for (const invalid of ['12junk', 'not-a-uuid', 'cshort', '0', '-1', '2147483648']) {
    await request('student', 'GET', `/enrollments/check/${invalid}`, undefined, 400);
  }
  // Exercise seeded-style UUID identifiers without reading or mutating seeded courses.
  const uuid = randomUUID();
  await prisma.course.update({ where: { courseId: cid }, data: { uniqueId: uuid } });
  assert.equal((await request('student', 'GET', `/enrollments/check/${uuid}`)).enrolled, true);
  assert.equal((await request('outsider', 'GET', `/enrollments/check/${uuid}`)).enrolled, false);
  await request('outsider', 'POST', `/enrollments/${uuid}/enroll`, {}, 201);
  await request('outsider', 'POST', `/enrollments/${uuid}/enroll`, {}, 409);
  assert.equal((await request('mentor', 'GET', `/enrollments/course/${uuid}/students`)).length, 2);
  await request('otherMentor', 'GET', `/enrollments/course/${uuid}/students`, undefined, 403);
  assert.equal((await request('admin', 'GET', `/enrollments/stats/${uuid}`)).active, 2);
  await request('outsider', 'DELETE', `/enrollments/${uuid}/unenroll`);
  assert.equal((await request('outsider', 'GET', `/enrollments/check/${uuid}`)).enrolled, false);
  await prisma.course.update({ where: { courseId: cid }, data: { uniqueId: cuid } });
  const payload = { courseId: cid, title: 'Disposable assignment', type: 'text', totalMarks: 20, dueDate: new Date(Date.now() + 86400000).toISOString() };
  await request('student', 'POST', '/assignments', payload, 403);
  await request('otherMentor', 'POST', '/assignments', payload, 403);
  for (const invalid of [{ title: '' }, { type: 'invalid' }, { totalMarks: -1 }, { totalMarks: 1.5 }, { dueDate: 'invalid' }]) await request('mentor', 'POST', '/assignments', { ...payload, ...invalid }, 400);
  const assignment = await request('mentor', 'POST', '/assignments', payload, 201);
  const aid = assignment.assignmentId;
  assert.equal((await request('student', 'GET', `/assignments/course/${cid}?limit=1`)).length, 1);
  assert.equal((await request('student', 'GET', '/assignments/upcoming')).length, 1);
  await request('student', 'GET', '/assignments/12junk', undefined, 400);
  await request('otherMentor', 'PUT', `/assignments/${aid}`, { title: 'Forbidden' }, 403);
  await request('mentor', 'PUT', `/assignments/${aid}`, { title: 'Updated', totalMarks: 20 });
  await request('outsider', 'POST', `/submissions/assignment/${aid}`, { submissionText: 'Answer' }, 403);
  await request('student', 'POST', `/submissions/assignment/${aid}`, {}, 400);
  const submission = await request('student', 'POST', `/submissions/assignment/${aid}`, { submissionText: 'Answer' }, 201);
  const sid = submission.submissionId;
  await request('outsider', 'GET', `/submissions/${sid}`, undefined, 403);
  await request('otherMentor', 'GET', `/submissions/${sid}`, undefined, 403);
  await request('otherMentor', 'GET', `/submissions/assignment/${aid}`, undefined, 403);
  assert.equal((await request('mentor', 'GET', `/submissions/assignment/${aid}`)).length, 1);
  await request('student', 'GET', `/submissions/${sid}`);
  assert.equal((await request('outsider', 'GET', '/submissions/my-submissions')).length, 0);
  assert.equal((await request('student', 'GET', `/submissions/assignment/${aid}/my`)).length, 1);
  await request('otherMentor', 'PUT', `/submissions/${sid}/grade`, { marks: 10 }, 403);
  for (const invalid of [{ marks: -1 }, { marks: 21 }, { marks: 1.5 }, { status: 'invalid' }]) await request('mentor', 'PUT', `/submissions/${sid}/grade`, invalid, 400);
  assert.equal((await request('mentor', 'PUT', `/submissions/${sid}/grade`, { marks: 0, status: 'graded', feedback: 'Reviewed' })).marks, 0);
  await request('mentor', 'PUT', `/assignments/${aid}`, { dueDate: '2000-01-01T00:00:00Z' });
  await request('student', 'POST', `/submissions/assignment/${aid}`, { submissionText: 'Late' }, 400);
  await request('outsider', 'PUT', `/progress/lesson/${one}/watch-time`, { watchTime: 5 }, 403);
  await request('outsider', 'POST', `/progress/lesson/${one}/complete`, {}, 403);
  for (const watchTime of [-1, 1.5, '', '12', null]) await request('student', 'PUT', `/progress/lesson/${one}/watch-time`, { watchTime }, 400);
  assert.equal((await request('student', 'PUT', `/progress/lesson/${one}/watch-time`, { watchTime: 30 })).watchTime, 30);
  assert.equal((await request('student', 'POST', `/progress/lesson/${one}/complete`, {})).courseProgress, 50);
  assert.equal((await request('student', 'POST', `/progress/lesson/${one}/complete`, {})).courseProgress, 50);
  assert.equal((await request('student', 'POST', `/progress/lesson/${two}/complete`, {})).courseProgress, 100);
  const completed = await request('student', 'GET', `/progress/course/${cid}`);
  assert.equal(completed.status, 'completed'); assert.ok(completed.completedAt);
  assert.equal((await request('student', 'GET', '/progress/dashboard')).completedCourses, 1);
  assert.equal((await request('student', 'POST', `/progress/lesson/${two}/incomplete`, {})).courseProgress, 50);
  const reopened = await request('student', 'GET', `/progress/course/${cid}`);
  assert.equal(reopened.status, 'active'); assert.equal(reopened.completedAt, null);
  await prisma.enrollment.update({ where: { studentId_courseId: { studentId: users[0], courseId: cid } }, data: { status: 'dropped' } });
  await request('student', 'POST', `/progress/lesson/${one}/complete`, {}, 403);
  await request('student', 'POST', `/progress/lesson/${one}/incomplete`, {}, 403);
  await request('student', 'PUT', `/progress/lesson/${one}/watch-time`, { watchTime: 10 }, 403);
  await request('student', 'GET', `/progress/course/${cid}`, undefined, 403);
  await request('student', 'POST', `/reviews/course/${cid}`, { rating: 4 }, 403);
  await prisma.enrollment.update({ where: { studentId_courseId: { studentId: users[0], courseId: cid } }, data: { status: 'active' } });
  await request('outsider', 'POST', `/reviews/course/${cid}`, { rating: 4 }, 403);
  for (const rating of [0, 6, 2.5, '4']) await request('student', 'POST', `/reviews/course/${cid}`, { rating }, 400);
  const review = await request('student', 'POST', `/reviews/course/${cid}`, { rating: 4, comment: 'Good' }, 201);
  await request('student', 'POST', `/reviews/course/${cid}`, { rating: 4 }, 409);
  await request('outsider', 'PUT', `/reviews/${review.reviewId}`, { rating: 1 }, 403);
  await request('outsider', 'DELETE', `/reviews/${review.reviewId}`, undefined, 403);
  await request('student', 'PUT', `/reviews/${review.reviewId}`, { rating: 2.5 }, 400);
  await request('student', 'PUT', `/reviews/${review.reviewId}`, { rating: 5, comment: 'Updated' });
  assert.equal((await request(null, 'GET', `/reviews/course/${cid}`)).length, 1);
  assert.equal((await request(null, 'GET', `/reviews/course/${cid}/rating`)).averageRating, 5);
  await request('admin', 'DELETE', `/reviews/${review.reviewId}`);
  assert.equal((await request(null, 'GET', `/reviews/course/${cid}/rating`)).totalReviews, 0);
  await request('student', 'DELETE', `/enrollments/${cuid}/unenroll`);
  assert.equal(await prisma.lessonProgress.count({ where: { studentId: users[0] } }), 0);
  await request('student', 'POST', `/progress/lesson/${one}/incomplete`, {}, 403);
  await request('student', 'GET', `/progress/course/${cid}`, undefined, 403);
  await request('student', 'POST', `/enrollments/${cid}/enroll`, {}, 201);
  assert.equal((await request('student', 'GET', `/progress/course/${cid}`)).overallProgress, 0);
  await request('otherMentor', 'DELETE', `/assignments/${aid}`, undefined, 403);
  await request('mentor', 'DELETE', `/assignments/${aid}`);
  assert.equal(await prisma.assignmentSubmission.count({ where: { assignmentId: aid } }), 0);
  await request('student', 'GET', `/assignments/${aid}`, undefined, 404);
  console.log(`Learning lifecycle: ${passed} API checks passed.`);
}
async function cleanup() {
  if (server) await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  email.sendMail = originalSend;
  try {
    await prisma.$transaction(async tx => {
      if (course) {
        const current = await tx.course.findUnique({ where: { courseId: course.courseId } });
        assert.ok(!current || current.courseCode === marker, 'Cleanup fixture ownership');
        await tx.enrollment.deleteMany({ where: { courseId: course.courseId } });
        await tx.course.deleteMany({ where: { courseId: course.courseId, courseCode: marker } });
      }
      await tx.notification.deleteMany({ where: { userId: { in: users } } });
      await tx.auditLog.deleteMany({ where: { userId: { in: users } } });
      await tx.user.deleteMany({ where: { userId: { in: users }, userName: { startsWith: marker } } });
    });
    assert.equal(await prisma.user.count({ where: { userId: { in: users } } }), 0);
    assert.equal(await prisma.course.count({ where: { courseCode: marker } }), 0);
    for (const model of ['enrollment', 'assignmentSubmission', 'lessonProgress', 'courseReview']) {
      assert.equal(await prisma[model].count({ where: { studentId: { in: users } } }), 0, `${model} cleanup`);
    }
    if (course) {
      assert.equal(await prisma.assignment.count({ where: { courseId: course.courseId } }), 0);
      assert.equal(await prisma.courseModule.count({ where: { courseId: course.courseId } }), 0);
      assert.equal(await prisma.lesson.count({ where: { moduleId: { in: course.modules.map(m => m.moduleId) } } }), 0);
    }
    console.log('CLEANUP PASS: disposable course, curriculum, learning records, users, notifications and audit rows removed; server closed.');
  } finally { await prisma.$disconnect(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  try { await cleanup(); } catch (error) { console.error('CLEANUP FAILED', error); process.exitCode = 1; }
});
