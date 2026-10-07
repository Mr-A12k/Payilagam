/**
 * @file judge0.service.js
 * @description Integrates with Judge0 CE API to execute code in multiple languages.
 * Judge0 CE is a free, open-source code execution system.
 * API Docs: https://ce.judge0.com/
 */

const axios = require('axios');

// Judge0 Language IDs
const LANGUAGE_IDS = {
    python: 71,        // Python 3.8.1
    javascript: 63,   // JavaScript (Node.js 12.14.0)
    java: 62,         // Java (OpenJDK 13.0.1)
    c: 50,            // C (GCC 9.2.0)
    cpp: 54,          // C++ (GCC 9.2.0)
    go: 60,           // Go (1.13.5)
    rust: 73,         // Rust (1.40.0)
    php: 68,          // PHP (7.4.1)
    typescript: 74,   // TypeScript (3.7.4)
};

const LANGUAGE_NAMES = {
    python: 'Python 3',
    javascript: 'JavaScript (Node.js)',
    java: 'Java',
    c: 'C (GCC)',
    cpp: 'C++ (GCC)',
    go: 'Go',
    rust: 'Rust',
    php: 'PHP',
    typescript: 'TypeScript',
};

// Status IDs from Judge0
const STATUS = {
    1: 'queued',
    2: 'processing',
    3: 'accepted',
    4: 'wrong_answer',
    5: 'time_limit',
    6: 'compilation_error',
    7: 'runtime_error_sigsegv',
    8: 'runtime_error_sigxfsz',
    9: 'runtime_error_sigfpe',
    10: 'runtime_error_sigabrt',
    11: 'runtime_error_nzec',
    12: 'runtime_error_other',
    13: 'internal_error',
    14: 'exec_format_error',
};

const getJudge0Config = () => {
    const apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    const apiKey = process.env.JUDGE0_API_KEY || '';
    const useRapidApi = process.env.JUDGE0_USE_RAPIDAPI === 'true' || apiKey !== '';

    return { apiUrl, apiKey, useRapidApi };
};

/**
 * Submit code to Judge0 and get back a token
 */
const submitToJudge0 = async (code, languageId, stdin = '') => {
    const { apiUrl, apiKey, useRapidApi } = getJudge0Config();

    const headers = {
        'Content-Type': 'application/json',
    };

    if (useRapidApi) {
        headers['X-RapidAPI-Key'] = apiKey;
        headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }

    const payload = {
        source_code: code,
        language_id: languageId,
        stdin: stdin || '',
        cpu_time_limit: 5,         // 5 seconds
        memory_limit: 128000,      // 128MB in KB
        wall_time_limit: 10,
    };

    const response = await axios.post(
        `${apiUrl}/submissions?base64_encoded=false&wait=false`,
        payload,
        { headers, timeout: 15005 }
    );

    return response.data.token;
};

/**
 * Poll Judge0 for result using the submission token
 */
const getJudge0Result = async (token) => {
    const { apiUrl, apiKey, useRapidApi } = getJudge0Config();

    const headers = {};
    if (useRapidApi) {
        headers['X-RapidAPI-Key'] = apiKey;
        headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }

    const maxAttempts = 15;
    const pollInterval = 800; // ms

    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, pollInterval));

        const response = await axios.get(
            `${apiUrl}/submissions/${token}?base64_encoded=false`,
            { headers, timeout: 10000 }
        );

        const result = response.data;

        // Status 1 = Queued, Status 2 = Processing
        if (result.status.id > 2) {
            return result;
        }
    }

    throw new Error('Execution timed out waiting for Judge0 result');
};

/**
 * Normalize Judge0 result to our standard format
 */
const normalizeResult = (judge0Result) => {
    const statusId = judge0Result.status?.id;
    const statusDesc = STATUS[statusId] || 'unknown';

    const stdout = judge0Result.stdout || '';
    const stderr = judge0Result.stderr || '';
    const compileOutput = judge0Result.compile_output || '';
    const message = judge0Result.message || '';

    let status;
    let errorMessage = null;

    if (statusId === 3) {
        status = 'accepted';
    } else if (statusId === 4) {
        status = 'wrong_answer';
    } else if (statusId === 6) {
        status = 'compilation_error';
        errorMessage = compileOutput || 'Compilation failed';
    } else if (statusId === 5) {
        status = 'time_limit';
        errorMessage = 'Time Limit Exceeded';
    } else if (statusId >= 7 && statusId <= 12) {
        status = 'runtime_error';
        errorMessage = stderr || message || 'Runtime error occurred';
    } else {
        status = 'system_error';
        errorMessage = message || stderr || 'Unknown error';
    }

    return {
        status,
        output: stdout.trim(),
        errorMessage,
        executionTime: judge0Result.time ? parseFloat(judge0Result.time) * 1000 : null, // convert to ms
        memoryUsed: judge0Result.memory || null,
        rawStatus: statusDesc,
    };
};

/**
 * Execute code for Labs (free run, no test cases)
 */
const executeInLab = async (code, language, stdin = '') => {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
        throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_IDS).join(', ')}`);
    }

    const token = await submitToJudge0(code, languageId, stdin);
    const result = await getJudge0Result(token);
    return normalizeResult(result);
};

/**
 * Execute code against a single test case input and check expected output
 */
const executeAgainstTestCase = async (code, language, testCase) => {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const token = await submitToJudge0(code, languageId, testCase.input);
    const result = await getJudge0Result(token);
    const normalized = normalizeResult(result);

    const actualOutput = normalized.output.trim();
    const expectedOutput = testCase.expectedOutput.trim();
    const passed = normalized.status === 'accepted' && actualOutput === expectedOutput;

    return {
        ...normalized,
        passed,
        actualOutput,
        expectedOutput,
        input: testCase.input,
        testCaseId: testCase.testCaseId,
        isHidden: testCase.isHidden || false,
    };
};

/**
 * Execute code against ALL test cases sequentially
 */
const executeAgainstAllTestCases = async (code, language, testCases) => {
    const results = [];
    let passedCount = 0;
    let totalExecutionTime = 0;

    for (const tc of testCases) {
        try {
            const result = await executeAgainstTestCase(code, language, tc);
            results.push(result);

            if (result.passed) passedCount++;
            if (result.executionTime) totalExecutionTime += result.executionTime;

            // Stop on compilation error — no point running more test cases
            if (result.status === 'compilation_error') {
                return {
                    status: 'compilation_error',
                    testCasesPassed: 0,
                    totalTestCases: testCases.length,
                    executionTime: totalExecutionTime,
                    memoryUsed: result.memoryUsed,
                    results,
                    errorMessage: result.errorMessage,
                };
            }
        } catch (error) {
            results.push({
                testCaseId: tc.testCaseId,
                passed: false,
                status: 'system_error',
                errorMessage: error.message,
                isHidden: tc.isHidden || false,
            });
        }
    }

    const failure = ['system_error', 'runtime_error', 'time_limit']
        .map(status => results.find(result => result.status === status))
        .find(Boolean);
    const overallStatus = failure?.status || (passedCount === testCases.length ? 'accepted' : 'wrong_answer');
    const lastError = failure || results.find(r => !r.passed && r.errorMessage);

    return {
        status: overallStatus,
        testCasesPassed: passedCount,
        totalTestCases: testCases.length,
        executionTime: totalExecutionTime,
        memoryUsed: null,
        results,
        errorMessage: lastError?.errorMessage || null,
        output: results[0]?.actualOutput || null,
    };
};

module.exports = {
    LANGUAGE_IDS,
    LANGUAGE_NAMES,
    executeInLab,
    executeAgainstTestCase,
    executeAgainstAllTestCases,
};
