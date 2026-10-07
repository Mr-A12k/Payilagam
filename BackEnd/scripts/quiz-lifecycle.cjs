require('dotenv').config({ path: require('node:path').join(__dirname, '../.env'), quiet: true });
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');
const { validateQuiz, gradeQuiz } = require('../src/modules/learning/quiz');
const marker = `quiz-qa-${randomUUID().slice(0, 8)}`;
const users = [];
const tokens = {};
let course, server, base, passed = 0;
const quiz = { questions: [
  { id: 'one', prompt: 'Which value is a number?', options: ['42', 'Hello'], correctIndex: 0, points: 2 },
  { id: 'two', prompt: 'Which keyword declares a constant?', options: ['let', 'const', 'var'], correctIndex: 1, points: 3 },
] };
async function request(role, method, path, body, expected = 200) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(tokens[role] ? { Authorization: `Bearer ${tokens[role]}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const json = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(json)}`);
  passed++;
  return json.data;
}
async function run() {
  assert.throws(() => validateQuiz({ questions: [] }));
  assert.throws(() => validateQuiz({ questions: [{ ...quiz.questions[0], options: ['same', ' SAME '] }] }));
  assert.throws(() => gradeQuiz(quiz, [{ questionId: 'one', optionIndex: 0 }, { questionId: 'one', optionIndex: 0 }]));
  assert.throws(() => gradeQuiz(quiz, [{ questionId: 'one', optionIndex: 0 }, { questionId: 'two', optionIndex: 4 }]));
  passed += 4;
  const password = await bcrypt.hash('QuizPreview123!', 10);
  for (const [name, roleName] of Object.entries({ mentor: 'mentor', student: 'student', otherMentor: 'mentor', outsider: 'student', admin: 'admin' })) {
    const role = await prisma.role.findUnique({ where: { roleName } });
    const user = await prisma.user.create({ data: { userName: `${marker}-${name}`, fullName: `Quiz QA ${name}`, email: `${marker}-${name}@example.invalid`, mobile: `${marker}-${name}`, password, roleId: role.roleId } });
    users.push(user); tokens[name] = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }
  course = await prisma.course.create({ data: { courseName: 'Quiz QA · JavaScript foundations', courseCode: marker, description: 'Disposable quiz verification course.', mentorId: users[0].userId, status: 'published' } });
  await prisma.enrollment.create({ data: { studentId: users[1].userId, courseId: course.courseId, status: 'active' } });
  server = require('../src/app').listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
  const body = { courseId: course.courseId, title: 'JavaScript basics', description: 'Choose the best answer for each question.', type: 'quiz', quiz };
  await request(null, 'POST', '/assignments', body, 401);
  await request('student', 'POST', '/assignments', body, 403);
  await request('otherMentor', 'POST', '/assignments', body, 403);
  await request('mentor', 'POST', '/assignments', { ...body, quiz: null }, 400);
  const assignment = await request('mentor', 'POST', '/assignments', { ...body, totalMarks: 999 }, 201);
  assert.equal(assignment.totalMarks, 5);
  const id = assignment.assignmentId;
  assert.equal((await request('mentor', 'GET', `/assignments/${id}`)).quiz.questions[0].correctIndex, 0);
  assert.equal((await request('admin', 'GET', `/assignments/${id}`)).quiz.questions[0].correctIndex, 0);
  for (const role of ['student', 'outsider', 'otherMentor']) {
    for (const path of [`/assignments/${id}`, `/assignments/course/${course.courseId}?type=quiz`]) {
      const result = await request(role, 'GET', path);
      assert.ok(!JSON.stringify(result).includes('correctIndex'), `Answer key leak for ${role}: ${path}`);
    }
  }
  const upcoming = await request('student', 'GET', '/assignments/upcoming');
  assert.ok(upcoming.some(item => item.assignmentId === id), 'Undated quizzes must be discoverable');
  assert.ok(!JSON.stringify(upcoming).includes('correctIndex'));
  const answers = [{ questionId: 'one', optionIndex: 0 }, { questionId: 'two', optionIndex: 0 }];
  await request('outsider', 'POST', `/submissions/assignment/${id}`, { answers }, 403);
  await request('student', 'POST', `/submissions/assignment/${id}`, { submissionText: 'Pretend answer' }, 400);
  await request('student', 'POST', `/submissions/assignment/${id}`, { answers: answers.slice(0, 1) }, 400);
  const result = await request('student', 'POST', `/submissions/assignment/${id}`, { answers, marks: 999 }, 201);
  assert.equal(result.marks, 2); assert.equal(result.status, 'graded');
  assert.equal(JSON.parse(result.submissionText).answers[0].answer, '42');
  await request('mentor', 'PUT', `/assignments/${id}`, { quiz: { questions: [quiz.questions[0]] } }, 409);
  await request('mentor', 'PUT', `/assignments/${id}`, { type: 'text' }, 409);
  await request('mentor', 'PUT', `/assignments/${id}`, { title: 'Updated quiz', quiz, totalMarks: 999 });
  assert.equal((await request('student', 'GET', `/assignments/${id}`)).totalMarks, 5);
  const perfect = await request('student', 'POST', `/submissions/assignment/${id}`, { answers: [answers[0], { questionId: 'two', optionIndex: 1 }] }, 201);
  assert.equal(perfect.marks, 5);
  assert.equal((await request('student', 'GET', `/submissions/assignment/${id}/my`)).length, 2);
  await request('otherMentor', 'GET', `/submissions/assignment/${id}`, undefined, 403);
  await request('mentor', 'PUT', `/assignments/${id}`, { dueDate: new Date(Date.now() - 60000).toISOString() });
  await request('student', 'POST', `/submissions/assignment/${id}`, { answers }, 400);
  await request('mentor', 'PUT', `/assignments/${id}`, { dueDate: new Date(Date.now() + 86400000).toISOString() });
  const dashboard = await request('student', 'GET', '/progress/dashboard');
  assert.ok(!JSON.stringify(dashboard).includes('correctIndex'), 'Dashboard leaks answer key');
  await request('mentor', 'PUT', `/assignments/${id}`, { dueDate: null });
  console.log(`PASS: ${passed} quiz lifecycle checks, including grading, persistence, ownership, deadlines, and answer-key privacy.`);
  if (process.argv.includes('--preview')) {
    console.log(JSON.stringify({ api: base, courseId: course.courseId, mentorEmail: users[0].email, studentEmail: users[1].email, password: 'QuizPreview123!' }));
    await new Promise(resolve => { process.once('SIGINT', resolve); process.once('SIGTERM', resolve); });
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (course) await prisma.course.delete({ where: { courseId: course.courseId } });
  if (users.length) await prisma.user.deleteMany({ where: { userId: { in: users.map(user => user.userId) } } });
  await prisma.$disconnect();
  console.log('Disposable quiz fixtures removed.');
});
