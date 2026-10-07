const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const requireBackend = createRequire(path.join(__dirname, 'BackEnd/package.json'));
requireBackend('dotenv').config({ path: path.join(__dirname, 'BackEnd/.env'), quiet: true });
const express = requireBackend('express');
const jwt = requireBackend('jsonwebtoken');
const prisma = requireBackend('./src/config/prisma');
const service = requireBackend('./src/modules/documents/document.service');

function pdf() {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>',
    '<< /Length 0 >>\nstream\n\nendstream',
  ];
  let body = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(body);
  body += 'xref\n0 5\n0000000000 65535 f \n';
  body += offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  body += `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body);
}

(async () => {
  const users = [];
  const files = [];
  let server;
  const originalProcess = service.processDocument;
  // Keep AI indexing outside this API test; all auth, storage and DB calls are real.
  service.processDocument = async () => {};
  try {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    for (const [index, roleName] of ['student', 'student', 'admin', 'mentor'].entries()) {
      const role = await prisma.role.findUniqueOrThrow({ where: { roleName } });
      users.push(await prisma.user.create({ data: {
        userName: `doc_test_${suffix}_${index}`, fullName: 'Document API Test',
        email: `doc_test_${suffix}_${index}@example.invalid`, mobile: `doc${suffix}${index}`,
        password: 'not-a-login-password', roleId: role.roleId,
      } }));
    }
    const app = express();
    app.use('/documents', requireBackend('./src/modules/documents/document.routes'));
    app.use((error, request, response, next) => response.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : error.statusCode || 400).json({ message: error.message }));
    server = await new Promise(resolve => { const listener = app.listen(0, '127.0.0.1', () => resolve(listener)); });
    const base = `http://127.0.0.1:${server.address().port}/documents`;
    const headers = index => ({ Authorization: `Bearer ${jwt.sign({ userId: users[index].userId }, process.env.JWT_SECRET, { expiresIn: '5m' })}` });
    const upload = async (index, title = ' Shared PDF ', data = pdf(), name = 'test.pdf', type = 'application/pdf') => {
      const form = new FormData();
      form.set('title', title);
      form.set('topic', 'general');
      form.set('file', new Blob([data], { type }), name);
      const response = await fetch(base, { method: 'POST', headers: headers(index), body: form });
      const body = await response.json();
      if (response.status === 201) {
        files.push(path.join(__dirname, 'BackEnd', body.data.fileUrl));
      }
      return { response, body };
    };
    assert.equal((await fetch(base)).status, 401);
    const shared = await upload(0);
    assert.equal(shared.response.status, 201, JSON.stringify(shared.body));
    assert.equal(shared.body.data.title, 'Shared PDF');
    assert.equal(shared.body.data.uploaderId, users[0].userId);
    assert.ok(fs.existsSync(files[0]));
    const listing = await (await fetch(base, { headers: headers(1) })).json();
    assert.ok(listing.data.some(doc => doc.id === shared.body.data.id));
    assert.equal((await fetch(`${base}/${shared.body.data.id}`, { method: 'DELETE', headers: headers(1) })).status, 403);
    await assert.rejects(service.deleteDocument(shared.body.data.id, { userId: users[1].userId, role: 'student' }), { statusCode: 403 });
    assert.ok(await prisma.eduDocument.findUnique({ where: { id: shared.body.data.id } }));
    const uploadDirectory = path.join(__dirname, 'BackEnd/uploads/documents');
    const beforeInvalid = fs.readdirSync(uploadDirectory).sort();
    assert.equal((await upload(0, '   ')).response.status, 400);
    assert.equal((await upload(0, 'Fake', Buffer.from('%PDF-1.4\nnot a PDF'))).response.status, 400);
    assert.equal((await upload(0, 'Wrong type', Buffer.from('text'), 'test.txt', 'text/plain')).response.status, 400);
    assert.equal((await upload(0, 'Too large', Buffer.alloc(50 * 1024 * 1024 + 1))).response.status, 413);
    assert.deepEqual(fs.readdirSync(uploadDirectory).sort(), beforeInvalid, 'Invalid uploads must not leave files behind');
    for (const index of [0, 2, 3]) {
      const document = index === 0 ? shared : await upload(0);
      assert.equal(document.response.status, 201);
      assert.equal((await fetch(`${base}/${document.body.data.id}`, { method: 'DELETE', headers: headers(index) })).status, 200);
      assert.equal(fs.existsSync(path.join(__dirname, 'BackEnd', document.body.data.fileUrl)), false);
    }
    for (const index of [2, 3]) assert.equal((await upload(index)).response.status, 201);
    console.log('PASS: shared student publication, authenticated reading, ownership 403, privileged deletion, PDF/title/type/size validation');
  } finally {
    service.processDocument = originalProcess;
    if (server) await new Promise(resolve => server.close(resolve));
    await prisma.eduDocument.deleteMany({ where: { uploaderId: { in: users.map(user => user.userId) } } });
    for (const file of files) await fs.promises.unlink(file).catch(error => { if (error.code !== 'ENOENT') throw error; });
    await prisma.user.deleteMany({ where: { userId: { in: users.map(user => user.userId) } } });
    await prisma.$disconnect();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
