const fail = (message, statusCode = 400) => {
  throw Object.assign(new Error(message), { statusCode });
};

const integer = (value, name, minimum = 1) => {
  if (!Number.isSafeInteger(value) || value < minimum || value > 2147483647) {
    fail(`${name} must be an integer >= ${minimum}`);
  }
};

const text = (value, name, required = false) => {
  if (value === undefined && !required || value === null && !required) return;
  if (typeof value !== 'string' || required && !value.trim()) fail(`${name} must be a non-empty string`);
};

// Keep expected domain failures out of the global handler's generic 500 path.
const services = (methods) => Object.fromEntries(Object.entries(methods).map(([name, method]) => [name, async (...args) => {
  try { return await method(...args); } catch (error) {
    if (!error.statusCode && !error.code) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      else if (/already/i.test(error.message)) error.statusCode = 409;
      else if (/not authorized|only .*own|not enrolled|must be enrolled/i.test(error.message)) error.statusCode = 403;
      else if (/Rating must|Marks cannot|due date|not available/i.test(error.message)) error.statusCode = 400;
    }
    throw error;
  }
}]));

const params = (request, response, next) => {
  for (const [key, value] of Object.entries(request.params)) {
    const enrollmentIdentifier = key === 'courseId' && request.baseUrl.endsWith('/enrollments');
    if (enrollmentIdentifier && (/^c[a-z0-9]{24}$/i.test(value) || /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value))) continue;
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > 2147483647) {
      return response.status(400).json({ success: false, message: enrollmentIdentifier ? 'courseId must be a positive integer, UUID or CUID' : `${key} must be a positive integer` });
    }
  }
  next();
};

module.exports = { fail, integer, text, services, params };
