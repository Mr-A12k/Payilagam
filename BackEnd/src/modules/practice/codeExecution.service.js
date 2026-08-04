const { executeJava } = require('./compiler.service');

const executeCode = async (code, language, testCases) => {
    // Validate inputs
    if (!code || !code.trim()) {
        return {
            status: 'compilation_error',
            testCasesPassed: 0,
            totalTestCases: testCases.length,
            executionTime: 0,
            memoryUsed: 0,
            results: [],
            errorMessage: 'Empty code submitted',
        };
    }

    if (!language) {
        return {
            status: 'compilation_error',
            testCasesPassed: 0,
            totalTestCases: testCases.length,
            executionTime: 0,
            memoryUsed: 0,
            results: [],
            errorMessage: 'Language not specified',
        };
    }

    if (language === 'java') {
        const javaResult = await executeJava(code, testCases);
        
        // We need to format the javaResult to match the expected return structure
        return {
            status: javaResult.status,
            testCasesPassed: javaResult.testCasesPassed,
            totalTestCases: javaResult.totalTestCases,
            executionTime: javaResult.executionTime || 0,
            memoryUsed: javaResult.memoryUsed || 0,
            results: testCases.map((tc, index) => ({
                testCaseId: tc.testCaseId || index + 1,
                passed: javaResult.status === 'accepted' || index < javaResult.testCasesPassed,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                actualOutput: (index === javaResult.testCasesPassed && javaResult.output) ? javaResult.output : undefined,
                executionTime: 0,
                memoryUsed: 0,
                isHidden: tc.isHidden || false,
            })),
            errorMessage: javaResult.errorMessage || null,
        };
    }

    // Fallback for other languages (Not implemented yet, return error)
    return {
        status: 'compilation_error',
        testCasesPassed: 0,
        totalTestCases: testCases.length,
        executionTime: 0,
        memoryUsed: 0,
        results: [],
        errorMessage: `Language '${language}' compiler not implemented yet. Only 'java' is supported.`,
    };
};

module.exports = {
    executeCode,
};
