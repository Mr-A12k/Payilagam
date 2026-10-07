const prisma = require('../../config/prisma');
const failure = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const parseId = value => {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1 || Number(value) > 2147483647) throw failure('Invalid ID');
  return Number(value);
};
const ownProblem = async (id, user) => {
  const problem = await prisma.codingProblem.findUnique({ where: { problemId: parseId(id) } });
  if (!problem) throw failure('Problem not found', 404);
  if (user.role !== 'admin' && problem.createdBy !== user.userId) throw failure('Only the problem creator or admin can make this change', 403);
  return problem;
};
const ownTestCase = async (id, user) => {
  const testCase = await prisma.testCase.findUnique({ where: { testCaseId: parseId(id) } });
  if (!testCase) throw failure('Test case not found', 404);
  return ownProblem(testCase.problemId, user);
};
const validateProblem = (body, creating = false) => {
  for (const field of ['title', 'description', 'difficulty']) {
    if ((creating || body[field] !== undefined) && (typeof body[field] !== 'string' || !body[field].trim())) throw failure(`${field} is required`);
  }
  if (body.difficulty !== undefined && !['easy', 'medium', 'hard'].includes(body.difficulty)) throw failure('Invalid difficulty');
  if (body.supportedLanguages !== undefined) {
    let languages = body.supportedLanguages;
    if (typeof languages === 'string') { try { languages = JSON.parse(languages); } catch { throw failure('Invalid supported languages'); } }
    if (!Array.isArray(languages) || !languages.length || languages.some(language => !require('./judge0.service').LANGUAGE_IDS[language])) throw failure('Invalid supported languages');
    body.supportedLanguages = languages;
  }
  if (body.tags !== undefined && (!Array.isArray(body.tags) || body.tags.some(tag => typeof tag !== 'string' || !tag.trim()))) throw failure('Tags must be nonempty strings');
  if (body.tags) body.tags = [...new Set(body.tags.map(tag => tag.trim()))];
};
const validateTestCase = (body, creating = false) => {
  for (const field of ['input', 'expectedOutput']) if ((creating || body[field] !== undefined) && typeof body[field] !== 'string') throw failure(`${field} must be a string`);
  if (body.isHidden !== undefined && typeof body.isHidden !== 'boolean') throw failure('isHidden must be boolean');
  if (body.orderIndex !== undefined && (!Number.isInteger(body.orderIndex) || body.orderIndex < 0)) throw failure('Invalid test case order');
};
module.exports = { parseId, failure, ownProblem, ownTestCase, validateProblem, validateTestCase };
