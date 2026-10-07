const AppError = require('../../utils/AppError');

const id = (value) => {
  const number = Number(value);
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(number) || number < 1 || number > 2147483647) {
    throw new AppError('Invalid ID', 400);
  }
  return number;
};
const text = (value) => {
  if (typeof value !== 'string' || !value.trim()) throw new AppError('Text must not be empty', 400);
};
const validateIds = (req, res, next) => {
  try {
    Object.values(req.params).forEach(id);
    for (const key of ['targetUserId', 'workspaceId', 'userId', 'parentReplyId', 'problemId']) {
      if (req.body?.[key] !== undefined && req.body[key] !== null) id(req.body[key]);
    }
    if (req.query.cursor !== undefined) id(req.query.cursor);
    if (req.query.problemId !== undefined) id(req.query.problemId);
    for (const key of ['content', 'title', 'name']) {
      if (req.body?.[key] !== undefined) text(req.body[key]);
    }
    next();
  } catch (error) { next(error); }
};
module.exports = { id, text, validateIds };
