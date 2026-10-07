require('dotenv').config();
const assert = require('node:assert/strict');
const prisma = require('../src/config/prisma');
const prefix = `qa-mentor-${Date.now()}`;
const tokens = {};
const created = [];
let passed = 0;
async function request(role, method, path, body, expected = 200) {
  const response = await fetch('http://localhost:5005/api' + path, { method, headers: { ...(tokens[role] ? { Authorization: `Bearer ${tokens[role]}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${result.message}`);
  passed++;
  console.log(`PASS ${method} ${path} (${expected})`);
  return result.data;
}
async function run() {
  const password = require('node:fs').readFileSync(require('node:path').join(__dirname, '../seed-users.js'), 'utf8').match(/Payilagam@\d+/)[0];
  const tokenFor = id => require('jsonwebtoken').sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '10m' });
  for (const role of ['admin', 'student', 'mentor']) {
    const user = await prisma.user.findUnique({ where: { email: `${role}@mail.com` } });
    assert.ok(await require('bcryptjs').compare(password, user.password));
    tokens[role] = tokenFor(user.userId);
  }
  const roles = await request('admin', 'GET', '/admin/roles');
  const mentorRole = roles.find(role => role.roleName === 'mentor').roleId;
  const studentRole = roles.find(role => role.roleName === 'student').roleId;
  const data = { userName: prefix, fullName: 'QA Temporary Mentor', email: `${prefix}@example.com`, mobile: `9${String(Date.now()).slice(-9)}`, roleId: mentorRole };
  await request(null, 'POST', '/admin/users', data, 401);
  for (const role of ['student', 'mentor']) await request(role, 'POST', '/admin/users', data, 403);
  await request('admin', 'POST', '/admin/users', { ...data, fullName: ' ' }, 400);
  await request('admin', 'POST', '/admin/users', { ...data, email: 'bad' }, 400);
  await request('admin', 'POST', '/admin/users', { ...data, roleId: 999999 }, 400);
  const mentor = await request('admin', 'POST', '/admin/users', data, 201);
  created.push(mentor.userId);
  assert.equal(mentor.password, undefined);
  assert.ok(await require('bcryptjs').compare(password, (await prisma.user.findUnique({ where: { userId: mentor.userId } })).password));
  tokens.temp = tokenFor(mentor.userId);
  await request('admin', 'POST', '/admin/users', data, 409);
  assert.ok((await request(null, 'GET', '/users/mentors')).some(user => user.userId === mentor.userId));
  const profile = await request(null, 'GET', `/users/mentors/${mentor.userId}`);
  assert.equal(profile.password, undefined);
  for (const role of ['student', 'mentor']) {
    await request(role, 'PUT', `/admin/users/${mentor.userId}`, { fullName: 'Denied' }, 403);
    await request(role, 'DELETE', `/admin/users/${mentor.userId}`, undefined, 403);
  }
  await request('admin', 'PUT', `/admin/users/${mentor.userId}`, { fullName: '' }, 400);
  await request('admin', 'PUT', `/admin/users/${mentor.userId}`, { email: 'admin@mail.com' }, 409);
  await request('admin', 'PUT', `/admin/users/${mentor.userId}`, { isActive: 'false' }, 400);
  const updated = await request('admin', 'PUT', `/admin/users/${mentor.userId}`, { fullName: 'QA Updated Mentor', bio: 'Updated bio' });
  assert.equal(updated.fullName, 'QA Updated Mentor');
  assert.equal((await request(null, 'GET', `/users/mentors/${mentor.userId}`)).bio, 'Updated bio');
  await request('admin', 'DELETE', `/admin/users/${mentor.userId}`);
  assert.ok(!(await request(null, 'GET', '/users/mentors')).some(user => user.userId === mentor.userId));
  await request(null, 'GET', `/users/mentors/${mentor.userId}`, undefined, 404);
  await request('temp', 'GET', '/users/my-mentor-application', undefined, 403);
  await request('admin', 'PUT', `/admin/users/${mentor.userId}/toggle-status`, {});
  await request(null, 'GET', `/users/mentors/${mentor.userId}`);
  await request(null, 'GET', '/users/mentors/invalid', undefined, 400);
  await request(null, 'GET', '/users/mentors/99999999', undefined, 404);
  await request('admin', 'PUT', '/admin/users/99999999', { fullName: 'Missing' }, 404);
  await request('admin', 'DELETE', '/admin/users/99999999', undefined, 404);
  const applicantData = { ...data, userName: `${prefix}-app`, email: `${prefix}-app@example.com`, mobile: `8${String(Date.now()).slice(-9)}`, roleId: studentRole };
  const applicant = await request('admin', 'POST', '/admin/users', applicantData, 201);
  created.push(applicant.userId);
  tokens.applicant = tokenFor(applicant.userId);
  await request('applicant', 'POST', '/users/apply-mentor', { bio: '', skills: '', experience: '' }, 400);
  const application = await request('applicant', 'POST', '/users/apply-mentor', { bio: 'QA bio', skills: 'React, JavaScript', experience: 'QA experience' });
  await request('applicant', 'POST', '/users/apply-mentor', { bio: 'QA bio', skills: 'React', experience: 'QA experience' }, 400);
  await request('applicant', 'PUT', `/users/mentor-applications/${application.id}/status`, { status: 'APPROVED' }, 403);
  await request('admin', 'PUT', `/users/mentor-applications/${application.id}/status`, { status: 'INVALID' }, 400);
  await request('admin', 'PUT', `/users/mentor-applications/${application.id}/status`, { status: 'APPROVED' });
  const approved = await request(null, 'GET', `/users/mentors/${applicant.userId}`);
  assert.equal(approved.bio, 'QA bio');
  assert.deepEqual(JSON.parse(approved.skills), ['React', 'JavaScript']);
  assert.equal(approved.experience, 'QA experience');
  await request('admin', 'PUT', `/users/mentor-applications/${application.id}/status`, { status: 'REJECTED' }, 409);
  await request('admin', 'DELETE', `/admin/users/${applicant.userId}`);
  await request(null, 'GET', `/users/mentors/${applicant.userId}`, undefined, 404);
  const reapplyUser = await request('admin', 'POST', '/admin/users', { ...applicantData, userName: `${prefix}-reapply`, email: `${prefix}-reapply@example.com`, mobile: `6${String(Date.now()).slice(-9)}` }, 201);
  tokens.reapply = tokenFor(reapplyUser.userId);
  const rejected = await request('reapply', 'POST', '/users/apply-mentor', { bio: 'QA bio', skills: 'React', experience: 'QA experience' });
  await request('admin', 'PUT', `/users/mentor-applications/${rejected.id}/status`, { status: 'REJECTED' });
  await request(null, 'GET', `/users/mentors/${reapplyUser.userId}`, undefined, 404);
  await request('reapply', 'POST', '/users/apply-mentor', { bio: 'QA new bio', skills: 'React', experience: 'QA experience' });
  const existingCourse = await prisma.course.findFirst({ where: { mentor: { email: 'mentor@mail.com' } } });
  if (existingCourse) {
    await request('mentor', 'GET', `/enrollments/course/${existingCourse.courseId}/students`);
    await request('temp', 'GET', `/enrollments/course/${existingCourse.courseId}/students`, undefined, 403);
    await request('student', 'GET', `/enrollments/course/${existingCourse.courseId}/students`, undefined, 403);
  }
  console.log(`Mentor lifecycle: ${passed} checks passed`);
}
run().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  const users = await prisma.user.findMany({ where: { userName: { startsWith: prefix } }, select: { userId: true } });
  const ids = users.map(user => user.userId);
  await prisma.mentorApplication.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { userId: { in: ids } } });
  await prisma.$disconnect();
});
