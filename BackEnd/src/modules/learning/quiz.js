const { fail, integer, text } = require('./validation');

function validateQuiz(quiz) {
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length < 1 || quiz.questions.length > 50) fail('A quiz needs 1–50 questions');
  const ids = new Set();
  const questions = quiz.questions.map((question, index) => {
    if (!question || typeof question !== 'object') fail('Invalid question');
    text(question.id, 'question id', true);
    if (question.id.length > 80 || ids.has(question.id)) fail('Question IDs must be unique');
    ids.add(question.id);
    text(question.prompt, `Question ${index + 1}`, true);
    if (question.prompt.length > 4000) fail('Question is too long');
    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6) fail('Each question needs 2–6 options');
    const options = question.options.map(option => {
      text(option, 'Answer option', true);
      if (option.length > 1000) fail('Answer option is too long');
      return option.trim();
    });
    if (new Set(options.map(option => option.toLowerCase())).size !== options.length) fail('Answer options must be distinct');
    integer(question.correctIndex, 'Correct answer', 0);
    if (question.correctIndex >= options.length) fail('Choose a valid correct answer');
    integer(question.points, 'Question points');
    if (question.points > 100) fail('Each question can have at most 100 points');
    return { id: question.id, prompt: question.prompt.trim(), options, correctIndex: question.correctIndex, points: question.points };
  });
  return { questions };
}

const quizMarks = quiz => quiz.questions.reduce((total, question) => total + question.points, 0);

// Explicit allowlist so future private fields are not accidentally returned.
function publicAssignment(assignment, canManage = false) {
  if (!assignment?.quiz || canManage) return assignment;
  return { ...assignment, quiz: { questions: assignment.quiz.questions.map(({ id, prompt, options, points }) => ({ id, prompt, options, points })) } };
}

function gradeQuiz(quiz, answers) {
  const valid = validateQuiz(quiz);
  if (!Array.isArray(answers) || answers.length !== valid.questions.length) fail('Answer every question');
  const byId = new Map();
  for (const answer of answers) {
    if (!answer || typeof answer.questionId !== 'string' || byId.has(answer.questionId)) fail('Invalid or duplicate answer');
    byId.set(answer.questionId, answer.optionIndex);
  }
  let marks = 0;
  const saved = valid.questions.map(question => {
    const optionIndex = byId.get(question.id);
    integer(optionIndex, 'Selected answer', 0);
    if (optionIndex >= question.options.length) fail('Selected answer is invalid');
    if (optionIndex === question.correctIndex) marks += question.points;
    return { questionId: question.id, prompt: question.prompt, answer: question.options[optionIndex], optionIndex };
  });
  return { marks, submissionText: JSON.stringify({ answers: saved }), status: 'graded', feedback: `Score: ${marks} / ${quizMarks(valid)}` };
}

module.exports = { validateQuiz, quizMarks, publicAssignment, gradeQuiz };
