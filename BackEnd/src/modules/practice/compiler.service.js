/**
 * @fileoverview Compiler Service Mock
 * Securely simulates Java compilation and execution against test cases 
 * instead of running un-sandboxed child processes (which is an RCE risk).
 * Note: For production, this should be integrated with a secure execution API like Judge0.
 */

/**
 * Simulates executing Java code against a list of test cases.
 * @param {string} code The complete Java code.
 * @param {Array} testCases Array of test case objects { input, expectedOutput }.
 * @returns {Object} Result indicating pass/fail, execution time, etc.
 */
const executeJava = async (code, testCases) => {
    // 1. Simulate compilation delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

    // Basic syntax check simulation
    if (code.includes("System.out.println") === false && code.includes("return") === false) {
        return {
            status: 'compilation_error',
            errorMessage: "Error: No output or return statement found in the code."
        };
    }

    if (!code.includes("class Solution") && !code.includes("class Main")) {
        return {
            status: 'compilation_error',
            errorMessage: "Error: Public class Solution or Main not found."
        };
    }

    // 2. Simulate running against test cases
    let passedCount = 0;
    let totalTime = 0;

    for (const tc of testCases) {
        // Simulate execution time per test case (20ms to 120ms)
        const execTime = 20 + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, execTime));
        totalTime += execTime;

        // Naive mock validation: if the code contains the word 'fail', fail the test cases.
        // Otherwise, assume the user wrote correct code for the sake of the simulation.
        if (code.toLowerCase().includes("fail")) {
             return {
                status: 'wrong_answer',
                testCasesPassed: passedCount,
                totalTestCases: testCases.length,
                output: "Output simulated as incorrect due to 'fail' keyword.",
                errorMessage: `Expected '${tc.expectedOutput}' but got incorrect simulated output`,
                executionTime: totalTime
            };
        } else if (code.toLowerCase().includes("timeout")) {
             return {
                status: 'time_limit',
                testCasesPassed: passedCount,
                totalTestCases: testCases.length,
                errorMessage: "Time Limit Exceeded",
                executionTime: 3000
            };
        }

        // Pass the test case
        passedCount++;
    }

    // All passed
    return {
        status: 'accepted',
        testCasesPassed: passedCount,
        totalTestCases: testCases.length,
        executionTime: totalTime
    };
};

module.exports = {
    executeJava
};
