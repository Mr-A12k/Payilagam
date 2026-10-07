require('dotenv').config();
const assert = require('node:assert/strict');
const prisma = require('../src/config/prisma');
const service = require('../src/modules/users/mentorApplication.service');
const legacy = require('../src/modules/users/user.service');
const marker = `qa-application-service-${Date.now()}`;
const ids = [];
let checks = 0;

async function run() {
  for (const name of Object.keys(service)) {
    assert.equal(legacy[name], service[name]);
  }
  checks++;
  for (const query of [{ page: '1e3' }, { page: '9007199254740992' }, { page: ['1', '2'] }, { limit: '1.5' }, { search: ['React'] }, { status: ['PENDING'] }]) {
    await assert.rejects(service.getMentorApplications(query), { statusCode: 400 });
    checks++;
  }
  const roles = {};
  for (const roleName of ['student', 'admin']) {
    roles[roleName] = (await prisma.role.findUniqueOrThrow({ where: { roleName } })).roleId;
  }
  const user = await prisma.user.create({ data: {
    userName: marker, email: `${marker}@example.invalid`, fullName: marker,
    mobile: marker, password: 'not-a-login-password', roleId: roles.student,
  } });
  ids.push(user.userId);
  const application = await service.applyAsMentor(user.userId, 'Bio', 'React, JavaScript', 'Experience');
  await prisma.user.update({ where: { userId: user.userId }, data: { roleId: roles.admin } });
  await assert.rejects(service.updateMentorApplicationStatus(application.id, 'APPROVED'), { statusCode: 409 });
  assert.equal((await prisma.user.findUnique({ where: { userId: user.userId } })).roleId, roles.admin);
  assert.equal((await prisma.mentorApplication.findUnique({ where: { id: application.id } })).status, 'PENDING');
  checks++;

  // Pause promotion after the review reads an active student, then deactivate it.
  await prisma.user.update({ where: { userId: user.userId }, data: { roleId: roles.student } });
  const transaction = prisma.$transaction.bind(prisma);
  let reachedPromotion, resumePromotion;
  const reached = new Promise(resolve => { reachedPromotion = resolve; });
  const resume = new Promise(resolve => { resumePromotion = resolve; });
  const originalTransaction = prisma.$transaction;
  prisma.$transaction = (callback, options) => transaction(async tx => callback({
    ...tx,
    user: { ...tx.user, updateMany: async args => {
      reachedPromotion();
      await resume;
      return tx.user.updateMany(args);
    } },
  }), options);
  try {
    const review = service.updateMentorApplicationStatus(application.id, 'APPROVED');
    const rejected = assert.rejects(review, { statusCode: 409 });
    try {
      await Promise.race([reached, review]);
      await prisma.user.update({ where: { userId: user.userId }, data: { isActive: false } });
    } finally {
      resumePromotion();
    }
    await rejected;
  } finally {
    prisma.$transaction = originalTransaction;
  }
  const storedUser = await prisma.user.findUnique({ where: { userId: user.userId } });
  assert.equal(storedUser.roleId, roles.student);
  assert.equal(storedUser.isActive, false);
  assert.equal((await prisma.mentorApplication.findUnique({ where: { id: application.id } })).status, 'PENDING');
  checks++;

  const timestamp = new Date();
  await prisma.mentorApplication.update({ where: { id: application.id }, data: { status: 'REJECTED', createdAt: timestamp } });
  const latest = await prisma.mentorApplication.create({ data: {
    userId: user.userId, bio: 'New bio', skills: 'React', experience: 'Experience', createdAt: timestamp,
  } });
  assert.equal((await service.getMyMentorApplication(user.userId)).id, latest.id);
  checks++;
  console.log(`Mentor application service: ${checks} checks passed`);
}

run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await prisma.mentorApplication.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { userId: { in: ids } } });
  await prisma.$disconnect();
});
