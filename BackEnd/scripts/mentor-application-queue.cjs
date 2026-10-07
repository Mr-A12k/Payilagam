require('dotenv').config();
const assert = require('node:assert/strict');
const prisma = require('../src/config/prisma');
const service = require('../src/modules/users/user.service');
const jwt = require('jsonwebtoken');
const marker = `qa-application-queue-${Date.now()}`;
const ids = [];
let server, base, checks = 0;
async function request(token, path, expected = 200, method = 'GET', body) {
  const response = await fetch(base + path, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  assert.equal(response.status, expected, result.message);
  checks++;
  return result;
}
async function run() {
  for (const roleName of ['admin', 'student', 'student', 'student']) {
    const role = await prisma.role.findUniqueOrThrow({ where: { roleName } });
    const user = await prisma.user.create({ data: { userName: `${marker}-${ids.length}`, email: `${marker}-${ids.length}@example.invalid`, fullName: `${marker} applicant`, mobile: `${marker}-${ids.length}`, password: 'not-a-login-password', roleId: role.roleId } });
    ids.push(user.userId);
  }
  const token = id => jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '10m' });
  server = require('../src/app').listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/users`;
  const admin = token(ids[0]), student = token(ids[1]);
  await request(null, '/mentor-applications', 401);
  await request(student, '/mentor-applications', 403);
  const concurrent = await Promise.allSettled([service.applyAsMentor(ids[1], 'Bio', 'React', 'Experience'), service.applyAsMentor(ids[1], 'Bio', 'React', 'Experience')]);
  assert.equal(concurrent.filter(item => item.status === 'fulfilled').length, 1); checks++;
  const application = concurrent.find(item => item.status === 'fulfilled').value;
  await service.applyAsMentor(ids[2], 'Bio 2', 'TypeScript', 'Experience 2');
  const first = await request(admin, `/mentor-applications?search=${marker}&status=PENDING&limit=1`);
  assert.equal(first.data.length, 1); assert.equal(first.pagination.total, 2); assert.equal(first.pagination.hasNext, true); checks++;
  const second = await request(admin, `/mentor-applications?search=${marker}&status=PENDING&limit=1&page=2`);
  assert.notEqual(first.data[0].id, second.data[0].id); assert.equal(second.pagination.hasNext, false); checks++;
  assert.equal(first.data[0].user.password, undefined); checks++;
  for (const query of ['page=0', 'page=1.5', 'limit=101', 'status=INVALID', `search=${'a'.repeat(201)}`]) await request(admin, `/mentor-applications?${query}`, 400);
  await request(student, `/mentor-applications/${application.id}/status`, 403, 'PUT', { status: 'APPROVED' });
  await request(admin, '/mentor-applications/invalid/status', 400, 'PUT', { status: 'APPROVED' });
  await request(admin, '/mentor-applications/2147483647/status', 404, 'PUT', { status: 'APPROVED' });
  const reviews = await Promise.allSettled([service.updateMentorApplicationStatus(application.id, 'APPROVED'), service.updateMentorApplicationStatus(application.id, 'REJECTED')]);
  assert.equal(reviews.filter(item => item.status === 'fulfilled').length, 1);
  assert.equal(reviews.find(item => item.status === 'rejected').reason.statusCode, 409); checks++;
  const stored = await prisma.mentorApplication.findUnique({ where: { id: application.id } });
  const user = await prisma.user.findUnique({ where: { userId: ids[1] }, include: { role: true } });
  assert.equal(user.role.roleName, stored.status === 'APPROVED' ? 'mentor' : 'student'); checks++;
  await request(admin, `/mentor-applications/${application.id}/status`, 409, 'PUT', { status: 'REJECTED' });
  const rejected = await service.applyAsMentor(ids[3], 'Bio', 'JavaScript', 'Experience');
  await request(admin, `/mentor-applications/${rejected.id}/status`, 200, 'PUT', { status: 'REJECTED' });
  const reapplied = await service.applyAsMentor(ids[3], 'Updated bio', 'JavaScript', 'Experience');
  assert.equal(reapplied.status, 'PENDING'); checks++;
  console.log(`Mentor application queue: ${checks} checks passed`);
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await prisma.mentorApplication.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { userId: { in: ids } } });
  await prisma.$disconnect();
});
