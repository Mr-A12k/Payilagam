const fs = require('node:fs');
const path = require('node:path');

const base = 'http://localhost:5005/api';
const results = [];
let skipped = 0;
const isObject = (value) => value !== null && typeof value === 'object';
const collection = (value) => Array.isArray(value) ||
  (isObject(value) && Object.values(value).some(Array.isArray));
const stats = (value) => isObject(value) &&
  ['totalEnrollment', 'avgCompletion', 'platformRating', 'totalRevenue']
    .every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]));

// Read only literal credentials; never require or evaluate the destructive seed script.
function readAccounts() {
  const source = fs.readFileSync(path.join(__dirname, '../seed-users.js'), 'utf8');
  const password = source.match(/const defaultPassword\s*=\s*"([^"\r\n]+)";/)?.[1];
  const accounts = ['student', 'mentor', 'admin'].map((role) => {
    const email = source.match(new RegExp('email:\\s*"(' + role + '@[^"\\r\\n]+)"'))?.[1];
    if (!email || !password) throw new Error('Credential literals unavailable');
    return { role, email, password };
  });
  return accounts;
}

async function request(role, endpoint, { token, credentials, expected = 200, validate = isObject, label = endpoint } = {}) {
  const method = credentials ? 'POST' : 'GET';
  if (method === 'POST' && endpoint !== '/auth/login') throw new Error('Write request blocked');
  let status = 'NETWORK';
  let reason = '';
  let data;
  try {
    const response = await fetch(base + endpoint, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(credentials ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(credentials ? { body: JSON.stringify(credentials) } : {}),
    });
    status = response.status;
    const body = await response.json();
    if (status !== expected) reason = `expected HTTP ${expected}`;
    else if (expected === 200 && (body.success !== true || !validate(body.data, body))) reason = 'invalid success payload';
    else if (expected >= 400 && body.success === true) reason = 'invalid error payload';
    if (body.message === 'courseItem is not defined') reason += ' (courseItem is not defined)';
    data = body.data;
  } catch {
    reason = status === 'NETWORK' ? 'connection, timeout, or redirect failure' : 'invalid JSON';
  }
  const passed = !reason;
  results.push({ role, passed, method, endpoint, status });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${role.padEnd(7)} ${method} /api${endpoint}${label !== endpoint ? ` (${label})` : ''} HTTP ${status}${reason ? `: ${reason}` : ''}`);
  return passed ? data : undefined;
}

async function main() {
  const accounts = readAccounts();
  const published = await request('public', '/courses/published', { validate: collection });
  await request('public', '/categories', { validate: collection });
  await request('public', '/auth/profile', { expected: 401 });
  for (const { role, email, password } of accounts) {
    const login = await request(role, '/auth/login', {
      credentials: { email, password },
      validate: (data) => typeof data?.token === 'string' && data.token.length > 0 && data.user?.role === role,
    });
    if (!login) {
      skipped += role === 'admin' ? 28 : role === 'student' ? 23 : 22;
      console.log(`SKIP ${role}: authenticated checks unavailable after failed login`);
      continue;
    }
    const token = login.token;
    await request(role, '/auth/profile', { token, validate: (data) => data?.userId === login.user.userId });
    for (const endpoint of ['/courses', '/enrollments/my-courses', '/notifications', '/chat', '/chat/workspaces', '/resources', '/documents', '/problems', '/users/mentors']) {
      await request(role, endpoint, { token, validate: collection });
    }
    await request(role, '/discussions', {
      token,
      validate: (data, body) => Array.isArray(data) &&
        Number.isInteger(body.pagination?.total) && body.pagination.total >= data.length &&
        body.pagination.page === 1 && body.pagination.limit === 10 &&
        body.pagination.totalPages === Math.ceil(body.pagination.total / 10) &&
        body.pagination.hasPrev === false &&
        body.pagination.hasNext === (body.pagination.totalPages > 1),
    });
    await request(role, '/notifications/unread-count', { token });
    await request(role, '/coding-submissions/my-stats', { token });
    await request(role, '/users/activity', { token });
    if (role === 'student') {
      await request(role, '/assignments/upcoming', { token, validate: collection });
      await request(role, '/submissions/my-submissions', { token, validate: collection });
      await request(role, '/courses/mentor/stats', { token, expected: 403 });
    } else {
      await request(role, '/courses/mentor/my-courses', { token, validate: collection });
      await request(role, '/courses/mentor/stats', { token, validate: stats });
    }
    if (role === 'admin') {
      for (const endpoint of ['/admin/dashboard', '/admin/stats', '/admin/users', '/admin/roles', '/admin/analytics/enrollments', '/admin/analytics/courses', '/admin/logs']) {
        await request(role, endpoint, { token });
      }
    } else {
      await request(role, '/admin/dashboard', { token, expected: 403 });
    }
    const courses = Array.isArray(published) ? published : published?.courses;
    const course = courses?.[0];
    if (course?.uniqueId && Number.isInteger(course.courseId)) {
      await request(role, `/courses/${encodeURIComponent(course.uniqueId)}`, { token, label: '/courses/:uniqueId' });
      for (const template of ['/modules/course/:courseId', '/reviews/course/:courseId', '/reviews/course/:courseId/rating', '/enrollments/check/:courseId']) {
        await request(role, template.replace(':courseId', course.courseId), { token, label: template });
      }
    } else {
      skipped += 5;
      console.log(`SKIP ${role}: course detail checks require an existing published course`);
    }
  }
  console.log('\nEndpoint summary:');
  for (const role of ['public', 'student', 'mentor', 'admin']) {
    const rows = results.filter((row) => row.role === role);
    console.log(`${role}: ${rows.filter((row) => row.passed).length} passed, ${rows.filter((row) => !row.passed).length} failed`);
  }
  const failed = results.filter((row) => !row.passed).length;
  console.log(`TOTAL: ${results.length - failed} passed, ${failed} failed, ${skipped} skipped`);
  process.exitCode = failed || skipped ? 1 : 0;
}

main().catch(() => {
  console.error('FAIL smoke setup: unable to read credential literals or initialize checks');
  process.exitCode = 1;
});
