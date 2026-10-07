require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const assert = require('node:assert/strict');
const http = require('node:http');
const { randomUUID } = require('node:crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../src/config/prisma');
const marker = `execution-qa-${randomUUID()}`;
const problems = [];
const jobs = new Map();
let api, judge, base, token, passed = 0, submissions = 0, polls = 0;
const payloads = [];
async function listen(server) {
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  return `http://127.0.0.1:${server.address().port}`;
}
async function request(method, path, body, expected = 200, authenticated = true) {
  const response = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000),
  });
  const result = await response.json();
  assert.equal(response.status, expected, JSON.stringify(result));
  assert.equal(result.success, expected < 400);
  console.log(`PASS ${++passed}: ${method} ${path} -> ${expected}`);
  return result.data;
}
async function makeProblem(name, data = {}, cases = []) {
  const problem = await prisma.codingProblem.create({ data: {
    title: marker, slug: `${marker}-${name}`, description: marker, difficulty: 'easy',
    createdBy: user.userId, supportedLanguages: '["javascript"]', ...data,
    testCases: { create: cases },
  } });
  problems.push(problem.problemId);
  return problem.problemId;
}
let user;
async function run() {
  user = await prisma.user.findFirst({ where: { isActive: true, role: { roleName: 'student' } } });
  assert.ok(user, 'An active seeded student is required');
  assert.ok(process.env.JWT_SECRET, 'JWT_SECRET required');
  token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '10m' });
  judge = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      if (req.method === 'POST' && req.url === '/submissions?base64_encoded=false&wait=false') {
        let body = '';
        for await (const chunk of req) body += chunk;
        const payload = JSON.parse(body);
        payloads.push(payload);
        assert.equal(payload.language_id, 63);
        assert.equal(payload.cpu_time_limit, 5);
        assert.equal(payload.wall_time_limit, 10);
        assert.equal(payload.memory_limit, 128000);
        const id = String(++submissions);
        jobs.set(id, { ...payload, polls: 0 });
        res.end(JSON.stringify({ token: id }));
      } else {
        const id = new URL(req.url, 'http://localhost').pathname.split('/').pop();
        const job = jobs.get(id);
        assert.ok(job);
        polls++;
        if (++job.polls === 1) return res.end(JSON.stringify({ status: { id: 2 } }));
        const status = { accepted: 3, wrong: 3, judgewrong: 4, compilation: 6, runtime: 11, timeout: 5, mixed: job.stdin === 'sample' ? 3 : 5 }[job.source_code];
        assert.ok(status, 'Fixture never executes source code');
        res.end(JSON.stringify({ status: { id: status }, stdout: job.source_code === 'wrong' ? 'incorrect' : `${job.stdin}-output\n`,
          stderr: status === 11 ? 'fixture runtime error' : null,
          compile_output: status === 6 ? 'fixture compilation error' : null, time: '0.012', memory: 4096 }));
      }
    } catch (error) { res.statusCode = 500; res.end(JSON.stringify({ error: error.message })); }
  }).listen(0, '127.0.0.1');
  process.env.JUDGE0_API_URL = await listen(judge);
  process.env.JUDGE0_API_KEY = '';
  process.env.JUDGE0_USE_RAPIDAPI = 'false';
  const app = express();
  app.use(express.json());
  app.use('/practice/submissions', require('../src/modules/practice/codingSubmission.routes'));
  app.use((error, req, res, next) => res.status(error.statusCode || 500).json({ success: false, message: error.message }));
  api = app.listen(0, '127.0.0.1');
  base = `${await listen(api)}/practice/submissions`;
  const cases = [
    { input: 'sample', expectedOutput: 'sample-output', orderIndex: 0 },
    { input: 'hidden-secret', expectedOutput: 'hidden-secret-output', isHidden: true, orderIndex: 1 },
  ];
  const id = await makeProblem('active', {}, cases);
  const inactive = await makeProblem('inactive', { isActive: false }, cases);
  const empty = await makeProblem('empty');
  const hidden = await makeProblem('hidden', {}, [cases[1]]);
  const valid = { language: 'javascript', code: 'accepted' };
  const before = await request('GET', '/my-stats');
  await request('POST', `/problem/${id}/run`, valid, 401, false);
  const missing = (await prisma.codingProblem.aggregate({ _max: { problemId: true } }))._max.problemId + 1;
  for (const action of ['run', 'submit']) {
    for (const invalid of ['0', '-1', '12junk', '2147483648']) await request('POST', `/problem/${invalid}/${action}`, valid, 400);
    await request('POST', `/problem/${missing}/${action}`, valid, 404);
    await request('POST', `/problem/${inactive}/${action}`, valid, 400);
    await request('POST', `/problem/${empty}/${action}`, valid, 400);
    for (const change of [{ code: '' }, { code: 7 }, { language: '' }, { language: 7 }, { language: 'python' }, { language: 'invalid' }]) {
      await request('POST', `/problem/${id}/${action}`, { ...valid, ...change }, 400);
    }
  }
  await request('POST', `/problem/${hidden}/run`, valid, 400);
  await request('GET', `/problem/${missing}/leaderboard`, undefined, 404);
  assert.equal(submissions, 0, 'Invalid requests must not reach Judge0');
  for (const [code, status] of Object.entries({ accepted: 'accepted', wrong: 'wrong_answer', judgewrong: 'wrong_answer', compilation: 'compilation_error', runtime: 'runtime_error', timeout: 'time_limit' })) {
    const result = await request('POST', `/problem/${id}/run`, { ...valid, code });
    assert.equal(result.status, status);
    assert.equal(result.totalTestCases, 1);
    assert.equal(result.testCasesPassed, code === 'accepted' ? 1 : 0);
    assert.equal(result.executionTime, 12);
    assert.equal(result.results.length, 1);
  }
  assert.deepEqual(await request('GET', '/my-stats'), before, 'Runs must not change stats');
  for (const [code, status] of Object.entries({ accepted: 'accepted', wrong: 'wrong_answer', compilation: 'compilation_error', runtime: 'runtime_error', timeout: 'time_limit', mixed: 'time_limit' })) {
    const result = await request('POST', `/problem/${id}/submit`, { ...valid, code }, 201);
    assert.equal(result.submission.status, status);
    assert.equal(result.executionResult.status, status);
    assert.equal(result.submission.totalTestCases, 2);
    assert.equal(result.submission.testCasesPassed, code === 'accepted' ? 2 : code === 'mixed' ? 1 : 0);
    const output = JSON.parse(result.submission.output);
    for (const rows of [output, result.executionResult.results]) {
      for (const row of rows.filter(row => row.isHidden)) assert.deepEqual(Object.keys(row).sort(), ['executionTime', 'isHidden', 'memoryUsed', 'passed', 'testCaseId'].sort());
    }
    assert.ok(!JSON.stringify(result).includes('hidden-secret'));
    const detail = await request('GET', `/${result.submission.submissionId}`);
    assert.equal(detail.output, result.submission.output);
    const stored = await prisma.codingSubmission.findUnique({ where: { submissionId: detail.submissionId } });
    if (code !== 'compilation') assert.ok(stored.output.includes('hidden-secret'));
  }
  await request('POST', `/problem/${id}/submit`, valid, 201);
  const after = await request('GET', '/my-stats');
  assert.equal(after.totalSubmissions, before.totalSubmissions + 7);
  assert.equal(after.totalAccepted, before.totalAccepted + 2);
  assert.equal(after.totalSolved, before.totalSolved + 1);
  assert.equal(after.easySolved, before.easySolved + 1);
  assert.equal(after.acceptanceRate, Number(((after.totalAccepted / after.totalSubmissions) * 100).toFixed(1)));
  assert.equal((await request('GET', `/problem/${id}/leaderboard`)).length, 1);
  assert.equal(await prisma.codingSubmission.count({ where: { problemId: { in: problems } } }), 7);
  assert.equal(payloads.filter(payload => payload.stdin === 'hidden-secret').length, 6);
  console.log(JSON.stringify({ passed, failed: 0, persistedSubmissions: 7, judgeSubmissions: submissions, judgePolls: polls,
    limits: { cpuSeconds: 5, wallSeconds: 10, memoryKB: 128000, pollAttempts: 15, pollIntervalMS: 800 },
    coverageLimits: 'Deterministic local HTTP fixture; no compiler execution, installs, external API, or full shared app middleware.' }));
}
async function cleanup() {
  for (const server of [api, judge]) if (server) await new Promise(resolve => server.close(resolve));
  try {
    if (problems.length) {
      await prisma.codingProblem.deleteMany({ where: { problemId: { in: problems } } });
      assert.equal(await prisma.codingProblem.count({ where: { problemId: { in: problems } } }), 0);
      assert.equal(await prisma.codingSubmission.count({ where: { problemId: { in: problems } } }), 0);
      assert.equal(await prisma.testCase.count({ where: { problemId: { in: problems } } }), 0);
    }
    console.log('Cleanup verified: disposable problems, test cases, and submissions removed; seeded users unchanged.');
  } finally { await prisma.$disconnect(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(cleanup).catch(error => { console.error(error); process.exitCode = 1; });
