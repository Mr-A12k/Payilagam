require('dotenv').config();
const prisma = require('../src/config/prisma');
const followService = require('../src/modules/community/follow.service');
async function run() {
  const prefix = 'qa-network-ui-';
  const admin = await prisma.user.findUnique({ where: { email: 'admin@mail.com' } });
  if (process.argv[2] === 'cleanup') {
    await prisma.user.deleteMany({ where: { userName: { startsWith: prefix } } });
    return console.log('PASS UI fixtures cleaned up');
  }
  if (process.argv[2] === 'approve-sent') {
    const user = await prisma.user.findUnique({ where: { userName: `${prefix}c` } });
    const request = await prisma.followRequest.findUnique({ where: { requesterId_targetId: { requesterId: admin.userId, targetId: user.userId } } });
    await followService.respondToRequest(request.id, user.userId, 'approved');
    return console.log('PASS disposable target approved browser request');
  }
  const role = await prisma.role.findUnique({ where: { roleName: 'student' } });
  for (const letter of ['a', 'b', 'c']) {
    const user = await prisma.user.create({ data: { userName: `${prefix}${letter}`, fullName: `QA Network UI ${letter.toUpperCase()}`, email: `${prefix}${letter}@example.com`, mobile: `${prefix}${letter}`, password: await require('bcryptjs').hash('QA-network-ui-password', 10), roleId: role.roleId } });
    if (letter !== 'c') await followService.sendFollowRequest(user.userId, admin.userId);
    console.log(`${letter}: userId=${user.userId}`);
  }
}
run().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
