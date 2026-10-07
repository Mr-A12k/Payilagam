const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { ts } = require("ts-morph");

const source = fs.readFileSync(path.join(__dirname, "../src/hooks/useBackNavigation.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const calls = [];
const context = {
  exports: {},
  window: { history: { state: null } },
  require(name) {
    if (name === "react") return { useCallback: (callback) => callback };
    if (name === "react-router-dom") return { useNavigate: () => (...args) => calls.push(args) };
    throw new Error(`Unexpected dependency: ${name}`);
  },
};
vm.runInNewContext(compiled, context);
const { hasPreviousAppEntry, useBackNavigation } = context.exports;
for (const state of [null, undefined, {}, { idx: 0 }, { idx: -1 }, { idx: "2" }, { idx: NaN }, { idx: 0.5 }, { idx: Infinity }]) {
  assert.equal(hasPreviousAppEntry(state), false);
  context.window.history.state = state;
  useBackNavigation("/courses")();
  const [target, options] = calls.pop();
  assert.equal(target, "/courses");
  assert.equal(options.replace, true);
}
for (const idx of [1, 2, 50]) {
  context.window.history.state = { idx };
  assert.equal(hasPreviousAppEntry({ idx }), true);
  useBackNavigation("/admin")();
  assert.deepEqual(calls.pop(), [-1]);
}
context.window.history.state = null;
useBackNavigation()();
assert.equal(calls.pop()[0], "/");
console.log("Passed: history navigation, direct-entry fallbacks, malformed state, and default fallback.");
