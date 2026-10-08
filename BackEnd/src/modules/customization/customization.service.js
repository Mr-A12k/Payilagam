const prisma = require('../../config/prisma');
const definitions = require('./defaults');
const fail = (message, statusCode = 400) => { throw Object.assign(new Error(message), { statusCode }); };

async function getSettings() {
  const rows = await prisma.uiCustomization.findMany();
  const saved = Object.fromEntries(rows.map(row => [row.key, row]));
  return {
    groups: Object.fromEntries(Object.entries(definitions).map(([key, definition]) => [key, { ...definition, options: saved[key]?.value || definition.options, revision: saved[key]?.revision || 0 }])),
    labels: saved.labels?.value || {},
    labelsRevision: saved.labels?.revision || 0,
  };
}

async function saveSettings(key, value, revision) {
  if (!Number.isInteger(revision) || revision < 0) fail('A valid revision is required');
  if (key === 'labels') {
    if (!value || Array.isArray(value) || typeof value !== 'object' || Object.keys(value).length > 300) fail('Invalid form labels');
    for (const [original, replacement] of Object.entries(value)) {
      if (!original.trim() || original.length > 200 || typeof replacement !== 'string' || !replacement.trim() || replacement.length > 200) fail('Labels must contain 1–200 characters');
    }
    value = Object.fromEntries(Object.entries(value).map(([key, label]) => [key, label.trim()]));
  } else {
    const definition = definitions[key];
    if (!definition) fail('Unknown dropdown', 404);
    if (!Array.isArray(value) || value.length < 1 || value.length > 100) fail('Provide 1–100 options');
    const values = new Set();
    const labels = new Set();
    value = value.map(option => {
      if (!option || typeof option.value !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(option.value) || typeof option.label !== 'string' || !option.label.trim() || option.label.length > 100 || typeof option.enabled !== 'boolean') fail('Each option needs a unique value, label, and enabled state');
      const label = option.label.trim();
      if (values.has(option.value) || labels.has(label.toLowerCase())) fail('Duplicate option value or label');
      values.add(option.value); labels.add(label.toLowerCase());
      return { value: option.value, label, enabled: option.enabled };
    });
    if (!value.some(option => option.enabled)) fail('Keep at least one option enabled');
    if (!definition.addable && (value.length !== definition.options.length || definition.options.some(option => !values.has(option.value)) || value.some(option => !option.enabled))) fail('Built-in behavior options can be renamed, but not added, removed, or disabled');
    // Keep saved values resolvable for records that already reference them.
    const previous = await prisma.uiCustomization.findUnique({ where: { key } });
    const previousOptions = previous?.value || definition.options;
    if (previousOptions.some(option => !values.has(option.value))) fail('Disable an option instead of removing it, so existing records remain readable');
  }
  try {
    if (revision === 0) return await prisma.uiCustomization.create({ data: { key, value } });
    const result = await prisma.uiCustomization.updateMany({ where: { key, revision }, data: { value, revision: { increment: 1 } } });
    if (!result.count) fail('Another admin changed these settings. Reload before saving.', 409);
    return await prisma.uiCustomization.findUnique({ where: { key } });
  } catch (error) {
    if (error.code === 'P2002') fail('Another admin changed these settings. Reload before saving.', 409);
    throw error;
  }
}

async function validateOption(key, value, currentValue) {
  if (value === undefined || value === currentValue) return;
  const row = await prisma.uiCustomization.findUnique({ where: { key } });
  const options = row?.value || definitions[key]?.options || [];
  if (!options.some(option => option.value === value && option.enabled)) fail(`Choose an enabled ${definitions[key]?.title || key} option`);
}
module.exports = { getSettings, saveSettings, validateOption };
