// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// tslib's package "exports" map resolves ESM importers to tslib/modules/index.js,
// which does `import tslib from '../tslib.js'` (a default import of its own CJS
// sibling). Metro's CJS interop resolves that default import to `undefined`,
// so `const { __extends } = tslib` inside tslib itself throws:
// "Cannot destructure property '__extends' of 'tslib.default' as it is undefined."
// This is hit by any real ESM source that imports from "tslib" (e.g. @apollo/client's
// internal ESM files). Force "tslib" to always resolve to its plain CJS build,
// which doesn't have this problem.
const tslibCjsPath = require.resolve("tslib/tslib.js");

// zustand's package "exports" map resolves ESM importers of "zustand/middleware"
// to esm/middleware.mjs, which contains raw `import.meta.env` (valid in a real ES
// module, used there for Vite's devtools-only dead code path). Metro concatenates
// everything into one non-module <script>, so that token becomes a hard
// SyntaxError ("Cannot use 'import.meta' outside a module") that kills the whole
// web bundle before any code runs. Force it to the plain CJS build instead, which
// has no import.meta and is what native (react-native condition) already resolves to.
const zustandMiddlewareCjsPath = require.resolve("zustand/middleware");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "tslib" || moduleName === "tslib/") {
    return { type: "sourceFile", filePath: tslibCjsPath };
  }
  if (moduleName === "zustand/middleware" || moduleName === "zustand/middleware/") {
    return { type: "sourceFile", filePath: zustandMiddlewareCjsPath };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
