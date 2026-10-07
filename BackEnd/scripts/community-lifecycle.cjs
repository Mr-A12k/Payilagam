require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const prisma = require('../src/config/prisma');
const jwt = require('jsonwebtoken');
const prefix = `qa-community-${randomUUID()}`;
const users = {}, tokens = {}, conversations = [], workspaces = [];
let server, baseURL, socketServer, passed = 0, socketPassed = 0;
const socketClients = [];

// Minimal Engine.IO/Socket.IO JSON client over the existing ws dependency.
class TestSocket {
  constructor(token) {
    this.ws = new (require('ws'))(baseURL.replace('http:', 'ws:').replace('/api', '/socket.io/?EIO=4&transport=websocket'));
    this.events = []; this.pending = new Map(); this.sequence = 0;
    const connectionTimer = setTimeout(() => this.ws.terminate(), 5000);
    this.connected = new Promise((resolve, reject) => {
      this.ws.on('error', reject);
      this.ws.on('close', () => reject(new Error('Socket closed')));
      this.ws.on('message', raw => {
        const packet = raw.toString();
        if (packet[0] === '0') this.ws.send('40' + JSON.stringify({ token }));
        else if (packet === '2') this.ws.send('3');
        else if (packet.startsWith('40')) { this.namespaceConnected = true; resolve(); }
        else if (packet.startsWith('44')) reject(new Error(packet));
        else if (packet.startsWith('41')) this.disconnected = true;
        else if (packet.startsWith('42')) this.events.push(JSON.parse(packet.slice(2)));
        else if (packet.startsWith('43')) {
          const match = /^43(\d+)(\[.*)$/.exec(packet);
          if (match) this.pending.get(Number(match[1]))?.(JSON.parse(match[2])[0]);
        }
      });
    }).finally(() => clearTimeout(connectionTimer));
    socketClients.push(this);
  }
  async emit(event, data, expected = true) {
    await this.connected;
    const sequence = ++this.sequence;
    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(sequence); reject(new Error(`No acknowledgement: ${event}`)); }, 5000);
      this.pending.set(sequence, value => { clearTimeout(timer); this.pending.delete(sequence); resolve(value); });
      this.ws.send('42' + sequence + JSON.stringify([event, data]));
    });
    assert.equal(result.success, expected, `${event}: ${result.error}`);
    socketPassed++;
    console.log(`PASS socket ${event} (${expected ? 'allowed' : 'denied'})`);
    return result;
  }
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function eventually(predicate) {
  const end = Date.now() + 5000;
  while (!predicate()) { assert.ok(Date.now() < end, 'Socket condition timed out'); await pause(10); }
}
function socketCheck(condition, label) {
  assert.ok(condition, label); socketPassed++; console.log(`PASS socket ${label}`);
}
async function deniedBeforePresence(token, label, observer) {
  const config = require('../src/config/socket');
  const presence = config.getOnlineUserIds();
  const rooms = [...socketServer.sockets.adapter.rooms.keys()].sort();
  const connections = socketServer.sockets.sockets.size;
  const broadcasts = observer?.events.filter(([event]) => event === 'online_users').length;
  const rejected = new TestSocket(token);
  await assert.rejects(rejected.connected, /44/);
  await pause(30);
  assert.equal(rejected.namespaceConnected, undefined);
  assert.deepEqual(config.getOnlineUserIds(), presence);
  assert.deepEqual([...socketServer.sockets.adapter.rooms.keys()].sort(), rooms);
  assert.equal(socketServer.sockets.sockets.size, connections);
  if (observer) assert.equal(observer.events.filter(([event]) => event === 'online_users').length, broadcasts);
  rejected.ws.terminate();
  socketCheck(true, `${label} denied before namespace, presence, rooms or broadcasts`);
}
async function socketChecks() {
  socketServer = require('../src/config/socket').initializeSocket(server);
  for (const token of [undefined, 'invalid', tokens.expired]) {
    await deniedBeforePresence(token, 'invalid handshake');
  }
  const clients = {};
  for (const name of ['a', 'b', 'c', 'mentor', 'admin']) {
    clients[name] = new TestSocket(tokens[name]); await clients[name].connected;
  }
  const { a, b, c, mentor, admin } = clients;
  await eventually(() => a.events.some(([event, ids]) => event === 'online_users' && ids.includes(users.admin.userId)));
  const config = require('../src/config/socket');
  socketCheck(config.getOnlineUserIds().includes(users.a.userId), 'active handshake enters presence');
  socketCheck([...socketServer.sockets.adapter.rooms.get(`user_${users.a.userId}`) || []].length === 1, 'active handshake enters personal room');
  for (const userId of [undefined, null, '123', 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER, 2147483648, 2147483647]) {
    const token = jwt.sign({ ...(userId === undefined ? {} : { userId }) }, process.env.JWT_SECRET, { expiresIn: '10m' });
    await deniedBeforePresence(token, `claim ${String(userId)}`, a);
  }
  const convo = await request('a', 'POST', '/chat', { targetUserId: users.b.userId });
  const conversationId = convo.conversationId;
  conversations.push(conversationId);
  await a.emit('join_chat', String(conversationId));
  await b.emit('join_chat', conversationId);
  await admin.emit('join_chat', conversationId);
  await admin.emit('send_message', { conversationId, content: 'Nonparticipant admin' }, false);
  const spoofed = new TestSocket(jwt.sign({ userId: users.c.userId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '10m' }));
  await spoofed.connected;
  await spoofed.emit('join_chat', conversationId, false);
  await c.emit('join_chat', conversationId, false);
  await c.emit('join_chat', '1abc', false);
  await c.emit('join_chat', 2147483647, false);
  await c.emit('typing', { conversationId, isTyping: true }, false);
  await c.emit('send_message', { conversationId, content: 'Intrusion' }, false);
  await a.emit('typing', null, false);
  await a.emit('typing', { conversationId, isTyping: 'yes' }, false);
  await a.emit('typing', { conversationId, isTyping: true });
  await eventually(() => b.events.some(([event]) => event === 'user_typing'));
  socketCheck(!c.events.some(([event]) => event === 'user_typing'), 'outsider cannot receive typing');
  b.events = [];
  const { message } = await a.emit('send_message', { conversationId, content: 'Socket disposable DM' });
  await eventually(() => b.events.some(([event]) => event === 'new_message'));
  await pause(100);
  socketCheck(b.events.filter(([event, data]) => event === 'new_message' && data.messageId === message.messageId).length === 1, 'room plus personal room delivers once');
  socketCheck(!c.events.some(([event]) => event === 'new_message'), 'outsider cannot receive DM');
  await eventually(() => admin.events.some(([event]) => event === 'new_message'));
  socketCheck(true, 'admin observation matches API read policy');
  await admin.emit('mark_read', { conversationId, messageIds: [message.messageId] }, false);
  await b.emit('edit_message', { messageId: message.messageId, content: 'Hijack' }, false);
  await b.emit('delete_message', { messageId: message.messageId }, false);
  await a.emit('edit_message', { messageId: message.messageId, content: ' ' }, false);
  await a.emit('edit_message', { messageId: message.messageId, content: 'Edited socket DM' });
  await eventually(() => b.events.some(([event]) => event === 'message_edited'));
  await c.emit('mark_read', { conversationId, messageIds: [message.messageId] }, false);
  await a.emit('mark_read', { conversationId, messageIds: [message.messageId] }, false);
  const cross = await prisma.conversation.create({ data: { participants: { create: [{ userId: users.b.userId }, { userId: users.c.userId }] } } });
  conversations.push(cross.conversationId);
  const foreign = await prisma.message.create({ data: { conversationId: cross.conversationId, senderId: users.c.userId, content: 'Other conversation' } });
  await b.emit('mark_read', { conversationId, messageIds: [message.messageId, foreign.messageId] }, false);
  socketCheck(!(await prisma.message.findUniqueOrThrow({ where: { messageId: message.messageId } })).isRead, 'mixed receipt rejects atomically');
  await b.emit('mark_read', { conversationId, messageIds: 'bad' }, false);
  await b.emit('mark_read', { conversationId, messageIds: [message.messageId, message.messageId] });
  socketCheck((await prisma.message.findUniqueOrThrow({ where: { messageId: message.messageId } })).isRead, 'recipient read persisted');
  socketCheck(!(await prisma.message.findUniqueOrThrow({ where: { messageId: foreign.messageId } })).isRead, 'other conversation stays unread');
  await a.emit('delete_message', { messageId: message.messageId });
  await a.emit('edit_message', { messageId: message.messageId, content: 'Resurrect' }, false);
  await b.emit('mark_read', { conversationId, messageIds: [message.messageId] }, false);
  await b.emit('leave_chat', conversationId);
  b.events = [];
  await a.emit('typing', { conversationId, isTyping: false });
  await pause(100);
  socketCheck(!b.events.some(([event]) => event === 'user_typing'), 'leave stops room events');

  const workspace = await request('mentor', 'POST', '/chat/workspaces', { name: prefix + '-socket' });
  const workspaceId = workspace.workspaceId, channelId = workspace.channels[0].channelId;
  workspaces.push(workspaceId);
  const membership = { workspaceId, userId: users.a.userId };
  await Promise.all([1, 2].map(() => require('../src/modules/community/chat.service').addWorkspaceMember(workspaceId, users.a.userId)));
  socketCheck(await prisma.workspaceMember.count({ where: membership }) === 1, 'concurrent membership addition idempotent');
  await require('../src/modules/community/chat.service').addWorkspaceMember(workspaceId, users.b.userId);
  await mentor.emit('join_channel', channelId);
  await a.emit('join_channel', channelId);
  await b.emit('join_channel', channelId);
  await admin.emit('join_channel', channelId);
  await admin.emit('send_channel_message', { channelId, content: 'Nonmember admin' }, false);
  await c.emit('join_channel', channelId, false);
  await c.emit('channel_typing', { channelId, isTyping: true }, false);
  await c.emit('send_channel_message', { channelId, content: 'Intrusion' }, false);
  const sent = await a.emit('send_channel_message', { channelId, content: 'Socket channel', type: 'CODE', metadata: { language: 'js' } });
  await eventually(() => b.events.some(([event]) => event === 'new_channel_message'));
  socketCheck(!c.events.some(([event]) => event === 'new_channel_message'), 'outsider cannot receive channel message');
  await eventually(() => admin.events.some(([event]) => event === 'new_channel_message'));
  socketCheck(true, 'admin can observe channel without write access');
  await prisma.user.update({ where: { userId: users.admin.userId }, data: { roleId: users.a.roleId } });
  admin.events = [];
  await mentor.emit('send_channel_message', { channelId, content: 'After role downgrade' });
  await pause(100);
  socketCheck(!admin.events.some(([event]) => event === 'new_channel_message'), 'live role downgrade revokes observation');
  await admin.emit('join_channel', channelId, false);
  await prisma.user.update({ where: { userId: users.admin.userId }, data: { roleId: users.admin.roleId } });
  await b.emit('edit_channel_message', { messageId: sent.message.messageId, content: 'Hijack' }, false);
  await b.emit('delete_channel_message', { messageId: sent.message.messageId }, false);
  await a.emit('edit_channel_message', { messageId: sent.message.messageId, content: 'Edited channel message' });
  await a.emit('channel_typing', { channelId, isTyping: true });
  await prisma.workspaceMember.delete({ where: { workspaceId_userId: membership } });
  a.events = [];
  await mentor.emit('send_channel_message', { channelId, content: 'After revocation' });
  await pause(100);
  socketCheck(!a.events.some(([event]) => event === 'new_channel_message'), 'revoked member receives no channel broadcast');
  await a.emit('send_channel_message', { channelId, content: 'Revoked' }, false);
  await a.emit('join_channel', channelId, false);
  await a.emit('channel_typing', { channelId, isTyping: true }, false);
  await a.emit('edit_channel_message', { messageId: sent.message.messageId, content: 'Revoked edit' }, false);
  await a.emit('delete_channel_message', { messageId: sent.message.messageId }, false);
  await require('../src/modules/community/chat.service').addWorkspaceMember(workspaceId, users.a.userId);
  await a.emit('join_channel', channelId);
  await a.emit('delete_channel_message', { messageId: sent.message.messageId });
  await a.emit('edit_channel_message', { messageId: sent.message.messageId, content: 'Resurrect' }, false);
  await b.emit('leave_channel', channelId);
  b.events = [];
  await mentor.emit('channel_typing', { channelId, isTyping: false });
  await pause(100);
  socketCheck(!b.events.some(([event]) => event === 'channel_user_typing'), 'channel leave stops events');
  await a.emit('send_channel_message', undefined, false);
  await a.emit('send_message', [], false);
  await prisma.user.update({ where: { userId: users.b.userId }, data: { isActive: false } });
  await b.emit('send_message', { conversationId, content: 'Inactive' }, false);
  b.events = [];
  await a.emit('send_message', { conversationId, content: 'Inactive recipient' });
  await pause(100);
  socketCheck(!b.events.some(([event]) => event === 'new_message'), 'inactive recipient receives no DM');
  await deniedBeforePresence(tokens.b, 'inactive account', a);
  await prisma.user.update({ where: { userId: users.b.userId }, data: { isActive: true } });
  await b.emit('join_chat', conversationId);
  const ownDM = await b.emit('send_message', { conversationId, content: 'Before participant revocation' });
  await prisma.conversationParticipant.delete({ where: { conversationId_userId: { conversationId, userId: users.b.userId } } });
  b.events = [];
  await a.emit('send_message', { conversationId, content: 'After participant revocation' });
  await pause(100);
  socketCheck(!b.events.some(([event]) => event === 'new_message'), 'revoked participant receives no DM');
  await b.emit('join_chat', conversationId, false);
  await b.emit('edit_message', { messageId: ownDM.message.messageId, content: 'Revoked edit' }, false);
  await b.emit('delete_message', { messageId: ownDM.message.messageId }, false);
  await prisma.conversationParticipant.create({ data: { conversationId, userId: users.b.userId } });
  const role = await prisma.role.findUniqueOrThrow({ where: { roleName: 'student' } });
  users.deleted = await prisma.user.create({ data: {
    userName: `${prefix}-deleted`, fullName: 'QA Deleted Socket User', email: `${prefix}-deleted@example.com`,
    mobile: `${prefix}-deleted`, password: await require('bcryptjs').hash(randomUUID(), 4), roleId: role.roleId,
  } });
  const deletedToken = jwt.sign({ userId: users.deleted.userId }, process.env.JWT_SECRET, { expiresIn: '10m' });
  await prisma.user.delete({ where: { userId: users.deleted.userId } });
  await deniedBeforePresence(deletedToken, 'deleted account', a);
  const expiredLater = new TestSocket(jwt.sign({ userId: users.a.userId }, process.env.JWT_SECRET, { expiresIn: 2 }));
  await expiredLater.connected;
  await expiredLater.emit('join_chat', conversationId);
  await pause(2100);
  expiredLater.events = [];
  await a.emit('send_message', { conversationId, content: 'Expired recipient' });
  await pause(100);
  socketCheck(!expiredLater.events.some(([event]) => event === 'new_message'), 'expired recipient receives no DM');
  await expiredLater.emit('send_message', { conversationId, content: 'Expired session' }, false);
  console.log(`Community sockets: ${socketPassed} checks passed`);
}

async function request(who, method, path, body, expected = 200) {
  const response = await fetch(baseURL + path, {
    method, headers: { ...(tokens[who] ? { Authorization: `Bearer ${tokens[who]}` } : {}), 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${result.message}`);
  assert.equal(result.success, expected < 400);
  passed++;
  console.log(`PASS ${method} ${path} (${expected})`);
  return result.data;
}

async function run() {
  server = require('../src/app').listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  baseURL = `http://127.0.0.1:${server.address().port}/api`;
  console.log(`Community lifecycle: ${baseURL}; disposable prefix ${prefix}`);
  for (const [name, roleName] of [['a', 'student'], ['b', 'student'], ['c', 'student'], ['mentor', 'mentor'], ['admin', 'admin']]) {
    const role = await prisma.role.findUniqueOrThrow({ where: { roleName } });
    users[name] = await prisma.user.create({ data: {
      userName: `${prefix}-${name}`, fullName: `QA Community ${name}`, email: `${prefix}-${name}@example.com`,
      mobile: `${prefix}-${name}`, password: await require('bcryptjs').hash(randomUUID(), 4), roleId: role.roleId,
    } });
    tokens[name] = jwt.sign({ userId: users[name].userId }, process.env.JWT_SECRET, { expiresIn: '10m' });
  }
  for (const path of ['/chat', '/chat/workspaces', '/chat/1/messages', '/chat/channels/1/messages', '/discussions', '/notifications']) await request(null, 'GET', path, undefined, 401);
  for (const [method, path] of [
    ['POST', '/chat'], ['POST', '/chat/1/messages'], ['DELETE', '/chat/1'], ['DELETE', '/chat/1/messages'],
    ['POST', '/chat/workspaces'], ['PUT', '/chat/workspaces/1'], ['POST', '/chat/workspaces/1/members'],
    ['POST', '/chat/workspaces/join'], ['POST', '/chat/channels/1/messages'], ['POST', '/discussions'],
    ['PUT', '/discussions/1'], ['DELETE', '/discussions/1'], ['POST', '/discussions/1/replies'],
    ['PUT', '/notifications/read-all'], ['PUT', '/notifications/1/read'], ['DELETE', '/notifications/clear-all'],
  ]) await request(null, method, path, {}, 401);
  tokens.invalid = 'not-a-jwt';
  tokens.expired = jwt.sign({ userId: users.a.userId }, process.env.JWT_SECRET, { expiresIn: -1 });
  await request('invalid', 'GET', '/chat', undefined, 401);
  await request('expired', 'GET', '/notifications', undefined, 401);
  for (const targetUserId of [undefined, 'abc', '1abc', 0, -1, 1.5, 2147483648, users.a.userId]) await request('a', 'POST', '/chat', { targetUserId }, 400);
  await request('a', 'POST', '/chat', { targetUserId: 2147483647 }, 404);
  const convo = await request('a', 'POST', '/chat', { targetUserId: users.b.userId });
  conversations.push(convo.conversationId);
  const cp = `/chat/${convo.conversationId}`;
  assert.equal((await request('b', 'POST', '/chat', { targetUserId: users.a.userId })).conversationId, convo.conversationId);
  assert.ok((await request('a', 'GET', '/chat')).some(c => c.conversationId === convo.conversationId));
  assert.equal((await request('c', 'GET', '/chat')).length, 0);
  for (const [method, suffix, body] of [['GET', '/messages'], ['POST', '/messages', { content: 'Intrusion' }], ['DELETE', '/messages'], ['DELETE', '']]) await request('c', method, cp + suffix, body, 403);
  await request('a', 'POST', cp + '/messages', { content: ' ' }, 400);
  const sent = await request('a', 'POST', cp + '/messages', { content: 'Disposable direct message' });
  assert.equal(sent.message.senderId, users.a.userId);
  assert.equal((await request('b', 'GET', cp + '/messages'))[0].messageId, sent.message.messageId);
  await request('a', 'DELETE', cp + '/messages');
  assert.equal((await request('a', 'GET', cp + '/messages')).length, 0);
  assert.equal((await request('b', 'GET', cp + '/messages')).length, 1);
  await request('a', 'DELETE', cp);
  assert.equal((await request('a', 'GET', '/chat')).length, 0);
  await request('b', 'POST', cp + '/messages', { content: 'Restore conversation' });
  assert.equal((await request('a', 'GET', '/chat')).length, 1);
  await request('a', 'GET', '/chat/abc/messages', undefined, 400);
  await request('a', 'GET', '/chat/2147483647/messages', undefined, 404);

  await request('a', 'POST', '/chat/workspaces', { name: prefix }, 403);
  await request('mentor', 'POST', '/chat/workspaces', { name: ' ' }, 400);
  const workspace = await request('mentor', 'POST', '/chat/workspaces', { name: prefix, description: 'Disposable group' });
  workspaces.push(workspace.workspaceId);
  assert.equal(workspace.channels.length, 2);
  const wp = `/chat/workspaces/${workspace.workspaceId}`;
  const channel = `/chat/channels/${workspace.channels[0].channelId}/messages`;
  assert.ok((await request('mentor', 'GET', '/chat/workspaces')).some(w => w.workspaceId === workspace.workspaceId));
  assert.equal((await request('c', 'GET', '/chat/workspaces')).length, 0);
  await request('c', 'GET', channel, undefined, 403);
  await request('c', 'POST', channel, { content: 'Intrusion' }, 403);
  await request('c', 'PUT', wp, { name: 'Hijack' }, 403);
  await request('c', 'POST', wp + '/members', { userId: users.a.userId }, 403);
  await request('mentor', 'PUT', wp, { name: prefix + '-updated' });
  await request('admin', 'PUT', wp, { description: 'Admin edit' });
  await request('mentor', 'POST', wp + '/members', { userId: users.a.userId });
  await request('mentor', 'POST', wp + '/members', { userId: users.a.userId });
  assert.equal(await prisma.workspaceMember.count({ where: { workspaceId: workspace.workspaceId, userId: users.a.userId } }), 1);
  await request('mentor', 'POST', wp + '/members', { userId: 2147483647 }, 404);
  await request('mentor', 'POST', wp + '/members', {}, 400);
  await request('b', 'POST', '/chat/workspaces/join', { workspaceId: workspace.workspaceId });
  await request('b', 'POST', '/chat/workspaces/join', { workspaceId: workspace.workspaceId });
  await request('b', 'POST', '/chat/workspaces/join', { workspaceId: 2147483647 }, 404);
  await request('b', 'POST', '/chat/workspaces/join', {}, 400);
  await request('a', 'POST', channel, { content: ' ' }, 400);
  const cm = await request('a', 'POST', channel, { content: 'const disposable = true;', type: 'CODE', metadata: { language: 'javascript' } });
  assert.equal(JSON.parse(cm.metadata).language, 'javascript');
  assert.equal((await request('b', 'GET', channel))[0].messageId, cm.messageId);
  assert.equal((await request('b', 'GET', channel + `?cursor=${cm.messageId}`)).length, 0);
  await request('b', 'GET', channel + '?cursor=abc', undefined, 400);
  const otherChannel = `/chat/channels/${workspace.channels[1].channelId}/messages`;
  const otherMessage = await request('mentor', 'POST', otherChannel, { content: 'Other channel message' });
  await request('a', 'GET', channel + `?cursor=${otherMessage.messageId}`, undefined, 400);
  await prisma.channelMessage.createMany({ data: Array.from({ length: 55 }, (_, index) => ({
    channelId: workspace.channels[0].channelId, senderId: users.a.userId, content: `Pagination fixture ${index}`,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  })) });
  const page = await request('a', 'GET', channel);
  assert.equal(page.length, 50);
  const olderPage = await request('a', 'GET', channel + `?cursor=${page[0].messageId}`);
  assert.equal(olderPage.length, 6);
  assert.equal(new Set([...page, ...olderPage].map(message => message.messageId)).size, 56);
  await request('a', 'POST', channel, { content: 'Bad type', type: 'INVALID' }, 400);
  await request('a', 'GET', '/chat/channels/2147483647/messages', undefined, 404);

  const d = await request('a', 'POST', '/discussions', { title: prefix, content: 'Disposable discussion content' }, 201);
  const dp = `/discussions/${d.discussionId}`;
  const other = await request('b', 'POST', '/discussions', { title: prefix + '-other', content: 'Another disposable discussion' }, 201);
  assert.ok((await request('a', 'GET', `/discussions?search=${prefix}`)).some(item => item.discussionId === d.discussionId));
  await request('c', 'PUT', dp, { title: 'Hijack' }, 403);
  await request('c', 'DELETE', dp, undefined, 403);
  await request('c', 'PUT', dp + '/resolve', {}, 403);
  await request('a', 'PUT', dp, { title: prefix + '-edited' });
  assert.equal((await request('a', 'PUT', dp + '/resolve', {})).isResolved, true);
  assert.equal((await request('b', 'POST', dp + '/upvote', {})).upvotes, 1);
  await request('b', 'POST', dp + '/replies', { content: '' }, 400);
  const reply = await request('b', 'POST', dp + '/replies', { content: 'Disposable reply' }, 201);
  const rp = `/discussions/replies/${reply.replyId}`;
  const child = await request('a', 'POST', dp + '/replies', { content: 'Nested reply', parentReplyId: reply.replyId }, 201);
  await request('a', 'POST', `/discussions/${other.discussionId}/replies`, { content: 'Wrong parent', parentReplyId: reply.replyId }, 400);
  assert.equal((await request('a', 'GET', dp)).replies[0].childReplies[0].replyId, child.replyId);
  await request('c', 'PUT', rp, { content: 'Hijack' }, 403);
  await request('c', 'DELETE', rp, undefined, 403);
  await request('b', 'PUT', rp, { content: 'Edited reply' });
  assert.equal((await request('a', 'POST', rp + '/upvote', {})).upvotes, 1);
  await request('admin', 'DELETE', rp);
  const survivingReplies = (await request('a', 'GET', dp)).replies;
  assert.equal(survivingReplies.length, 1);
  assert.equal(survivingReplies[0].replyId, child.replyId);
  assert.equal(survivingReplies[0].parentReplyId, null);
  await request('a', 'GET', '/discussions/abc', undefined, 400);
  await request('a', 'GET', '/discussions?problemId=abc', undefined, 400);
  await request('a', 'PUT', '/discussions/replies/2147483647', { content: 'Missing reply' }, 404);
  await request('a', 'GET', '/discussions/2147483647', undefined, 404);
  await request('a', 'DELETE', dp);
  await request('a', 'GET', dp, undefined, 404);
  await request('admin', 'DELETE', `/discussions/${other.discussionId}`);

  const notes = await request('b', 'GET', '/notifications');
  assert.ok(notes.some(n => n.message === 'Disposable direct message'));
  const np = `/notifications/${notes[0].notificationId}`;
  const isolated = await prisma.notification.create({ data: { userId: users.c.userId, type: 'system', title: prefix, message: 'Isolation fixture' } });
  await request('c', 'PUT', np + '/read', {}, 403);
  await request('c', 'DELETE', np, undefined, 403);
  assert.equal((await request('b', 'GET', '/notifications/unread-count')).unreadCount, 1);
  assert.equal((await request('b', 'PUT', np + '/read', {})).isRead, true);
  await request('b', 'PUT', np + '/read', {});
  assert.equal((await request('b', 'GET', '/notifications/unread-count')).unreadCount, 0);
  await request('a', 'PUT', '/notifications/read-all', {});
  assert.equal((await request('a', 'GET', '/notifications/unread-count')).unreadCount, 0);
  await request('b', 'DELETE', np);
  await request('b', 'DELETE', np, undefined, 404);
  await request('a', 'DELETE', '/notifications/clear-all');
  assert.equal((await request('a', 'GET', '/notifications')).length, 0);
  const untouched = await prisma.notification.findUniqueOrThrow({ where: { notificationId: isolated.notificationId } });
  assert.equal(untouched.isRead, false);
  assert.equal((await request('c', 'GET', '/notifications'))[0].notificationId, isolated.notificationId);
  await request('b', 'PUT', '/notifications/abc/read', {}, 400);
  await request('b', 'PUT', '/notifications/2147483647/read', {}, 404);
  await socketChecks();
  await prisma.user.update({ where: { userId: users.c.userId }, data: { isActive: false } });
  await request('c', 'GET', '/chat', undefined, 403);
  await request('a', 'POST', '/chat', { targetUserId: users.c.userId }, 404);
  console.log(`Community lifecycle: ${passed} API checks passed`);
}

run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  try {
    // Owner-scoped cleanup also covers requests that persisted before an assertion failed.
    const ids = Object.values(users).map(user => user.userId);
    await prisma.conversation.deleteMany({ where: { participants: { some: { userId: { in: ids } } } } });
    await prisma.workspace.deleteMany({ where: { ownerId: { in: ids } } });
    await prisma.discussionReply.deleteMany({ where: { authorId: { in: ids } } });
    await prisma.discussion.deleteMany({ where: { authorId: { in: ids } } });
    await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { userId: { in: ids } } });
    assert.equal(await prisma.user.count({ where: { userName: { startsWith: prefix } } }), 0);
    assert.equal(await prisma.conversation.count({ where: { conversationId: { in: conversations } } }), 0);
    assert.equal(await prisma.workspace.count({ where: { workspaceId: { in: workspaces } } }), 0);
    assert.equal(await prisma.discussion.count({ where: { authorId: { in: ids } } }), 0);
    assert.equal(await prisma.notification.count({ where: { userId: { in: ids } } }), 0);
    console.log('Cleanup verified: disposable users and owned community records removed');
  } finally {
    for (const client of socketClients) client.ws.terminate();
    if (socketServer) await new Promise(resolve => socketServer.close(resolve));
    if (server?.listening) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await prisma.$disconnect();
  }
});
