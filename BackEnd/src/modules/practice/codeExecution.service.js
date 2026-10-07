const { LANGUAGE_IDS, executeAgainstAllTestCases } = require('./judge0.service');

const executeCode = async (code, language, testCases) => {
  if (typeof code !== 'string' || !code.trim()) throw Object.assign(new Error('Code cannot be empty'), { statusCode: 400 });
  if (!LANGUAGE_IDS[language]) throw Object.assign(new Error('Unsupported programming language'), { statusCode: 400 });
  if (!process.env.JUDGE0_API_URL && !process.env.JUDGE0_API_KEY) throw Object.assign(new Error('The code execution service is not configured'), { statusCode: 503 });
  const result = await executeAgainstAllTestCases(code, language, testCases);
  if (result.results.some(test => test.status === 'system_error')) throw Object.assign(new Error('The code execution service is unavailable'), { statusCode: 503 });
  return result;
};

module.exports = { executeCode };
