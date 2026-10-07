require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const prisma = require('../src/config/prisma');
const service = require('../src/modules/community/chat.service');
const jwt = require('jsonwebtoken');
const { io } = require('../../FrontEnd/node_modules/socket.io-client');
const prefix = `qa-replies-${randomUUID()}`;
const users = [], sockets = [];
let server, socketServer, base, checks = 0;
const check = (condition) => { assert.ok(condition); checks++; };
const denied = async (operation, status = 400) => {
  await assert.rejects(operation, error => error.statusCode === status);
  checks++;
};
async function request(user, method, path, body, status = 200) {
  const response = await fetch(base + '/api/chat' + path, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '5m' })}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  assert.equal(response.status, status, JSON.stringify(result)); checks++;
  return result.data;
}
async function connect(user) {
  const socket = io(base, { transports: ['websocket'], auth: { token: jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '5m' }) }, reconnection: false });
  sockets.push(socket);
  await new Promise((resolve, reject) => { socket.once('connect', resolve); socket.once('connect_error', reject); });
  return socket;
}
const emit = async (socket, event, data, success = true) => {
  const result = await socket.timeout(5000).emitWithAck(event, data);
  assert.equal(result.success, success, JSON.stringify(result)); checks++;
  return result;
};
async function run() {
  const role = await prisma.role.findUniqueOrThrow({ where: { roleName: 'student' } });
  for (let index = 0; index < 3; index++) users.push(await prisma.user.create({ data: {
    userName: `${prefix}-${index}`, fullName: `Reply QA ${index}`, email: `${prefix}-${index}@example.com`,
    mobile: `${prefix}-${index}`, password: randomUUID(), roleId: role.roleId,
  } }));
  const [a, b, outsider] = users;
  server = require('../src/app').listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  socketServer = require('../src/config/socket').initializeSocket(server);
  base = `http://127.0.0.1:${server.address().port}`;
  const conversation = await service.getOrCreateConversation(a.userId, b.userId);
  const other = await service.getOrCreateConversation(a.userId, outsider.userId);
  const path = `/${conversation.conversationId}/messages`;
  const target = (await request(a, 'POST', path, { content: 'Quoted DM' })).message;
  const reply = (await request(b, 'POST', path, { content: 'DM reply', replyToId: target.messageId })).message;
  check(reply.replyToId === target.messageId && reply.replyTo.content === 'Quoted DM');
  check((await request(a, 'GET', path)).find(m => m.messageId === reply.messageId).replyTo.sender.userId === a.userId);
  await request(a, 'POST', `/${other.conversationId}/messages`, { content: 'Wrong DM', replyToId: target.messageId }, 400);
  await request(outsider, 'POST', path, { content: 'Intrusion', replyToId: target.messageId }, 403);
  for (const replyToId of ['abc', 0, -1, 1.5, 2147483648, 2147483647]) await request(b, 'POST', path, { content: 'Invalid', replyToId }, 400);
  const sa = await connect(a), sb = await connect(b);
  await emit(sb, 'join_chat', conversation.conversationId);
  const delivered = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Reply broadcast missing')), 5000);
    sb.once('new_message', message => { clearTimeout(timer); resolve(message); });
  });
  const socketReply = (await emit(sa, 'send_message', { conversationId: conversation.conversationId, content: 'Socket DM reply', replyToId: target.messageId })).message;
  check((await delivered).replyTo.messageId === target.messageId);
  await emit(sa, 'send_message', { conversationId: other.conversationId, content: 'Wrong scope', replyToId: target.messageId }, false);
  await emit(sa, 'edit_message', { messageId: socketReply.messageId, content: 'Edited reply' });
  check((await service.getMessages(conversation.conversationId, b.userId)).find(m => m.messageId === socketReply.messageId).replyToId === target.messageId);
  await service.editMessage(target.messageId, a.userId, 'Edited original');
  check((await service.getMessages(conversation.conversationId, b.userId)).find(m => m.messageId === reply.messageId).replyTo.content === 'Edited original');
  await service.clearConversation(conversation.conversationId, a.userId);
  await denied(() => service.sendMessage(conversation.conversationId, a.userId, 'Cleared target', target.messageId));
  const clearedDelivery = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Cleared recipient broadcast missing')), 5000);
    sa.once('new_message', message => { clearTimeout(timer); resolve(message); });
  });
  await emit(sb, 'send_message', { conversationId: conversation.conversationId, content: 'Recipient-specific quote', replyToId: target.messageId });
  check((await clearedDelivery).replyTo.content === null);
  const afterClear = (await service.sendMessage(conversation.conversationId, b.userId, 'After clear', target.messageId)).message;
  check((await service.getMessages(conversation.conversationId, a.userId)).find(m => m.messageId === afterClear.messageId).replyTo.content === null);
  await service.deleteMessage(target.messageId, a.userId);
  await denied(() => service.sendMessage(conversation.conversationId, b.userId, 'Deleted target', target.messageId));
  check((await service.getMessages(conversation.conversationId, b.userId)).find(m => m.messageId === reply.messageId).replyTo.content === null);
  const workspace = await service.createWorkspace(prefix, 'Reply fixtures', a.userId);
  await service.addWorkspaceMember(workspace.workspaceId, b.userId);
  const [channel, second] = workspace.channels;
  const channelPath = `/channels/${channel.channelId}/messages`;
  const channelTarget = await request(a, 'POST', channelPath, { content: 'Quoted channel' });
  const channelReply = await request(b, 'POST', channelPath, { content: 'Channel reply', replyToId: channelTarget.messageId });
  check(channelReply.replyTo.content === 'Quoted channel');
  check((await request(a, 'GET', channelPath)).find(m => m.messageId === channelReply.messageId).replyToId === channelTarget.messageId);
  await request(a, 'POST', `/channels/${second.channelId}/messages`, { content: 'Wrong channel', replyToId: channelTarget.messageId }, 400);
  await request(outsider, 'POST', channelPath, { content: 'Intrusion', replyToId: channelTarget.messageId }, 403);
  await emit(sb, 'join_channel', channel.channelId);
  const channelSocketReply = (await emit(sa, 'send_channel_message', { channelId: channel.channelId, content: 'Socket channel reply', replyToId: channelTarget.messageId })).message;
  check(channelSocketReply.replyTo.content === 'Quoted channel');
  await emit(sa, 'send_channel_message', { channelId: second.channelId, content: 'Wrong channel', replyToId: channelTarget.messageId }, false);
  await service.editChannelMessage(channelReply.messageId, b.userId, 'Edited channel reply');
  check((await service.getChannelMessages(channel.channelId, null, b.userId)).find(m => m.messageId === channelReply.messageId).replyToId === channelTarget.messageId);
  await service.deleteChannelMessage(channelTarget.messageId, a.userId);
  await denied(() => service.sendChannelMessage(channel.channelId, b.userId, 'Deleted', 'TEXT', null, channelTarget.messageId));
  check((await service.getChannelMessages(channel.channelId, null, b.userId)).find(m => m.messageId === channelReply.messageId).replyTo.content === null);
  await prisma.message.delete({ where: { messageId: target.messageId } });
  check((await prisma.message.findUnique({ where: { messageId: reply.messageId } })).replyToId === null);
  console.log(`Chat replies: ${checks} checks passed`);
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  for (const socket of sockets) socket.disconnect();
  if (socketServer) await new Promise(resolve => socketServer.close(resolve));
  if (server?.listening) await new Promise(resolve => server.close(resolve));
  const ids = users.map(user => user.userId);
  await prisma.conversation.deleteMany({ where: { participants: { some: { userId: { in: ids } } } } });
  await prisma.workspace.deleteMany({ where: { ownerId: { in: ids } } });
  await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { userId: { in: ids } } });
  assert.equal(await prisma.user.count({ where: { userName: { startsWith: prefix } } }), 0);
  console.log('Reply fixtures cleaned up');
  await prisma.$disconnect();
});
