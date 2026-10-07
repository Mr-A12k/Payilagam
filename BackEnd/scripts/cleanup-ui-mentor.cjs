require('dotenv').config();
const assert = require('node:assert/strict');
const prisma = require('../src/config/prisma');
async function run() {
  const userName = process.argv[2];
  assert.match(userName, /^qa-mentor-ui-\d+$/);
  const user = await prisma.user.findUnique({ where: { userName } });
  assert.ok(user);
  assert.equal(user.fullName, 'QA UI Mentor Updated');
  assert.equal(user.isActive, true);
  await prisma.user.delete({ where: { userId: user.userId } });
  console.log('PASS browser mentor persistence, reactivation, and cleanup');
}
run().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
