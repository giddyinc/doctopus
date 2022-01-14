"use strict";

module.exports = {
  diff: true,
  require: [
    "source-map-support/register",
    'ts-node/register',
  ],
  extension: ["ts"],
  package: "./package.json",
  reporter: "spec",
  slow: 75,
  timeout: 120000,
  ui: "bdd",
  "watch-files": ["src/**/*.ts"],
  "watch-extensions": ["ts"],
  recursive: true,
  exit: true,
  bail: true,
  // checkLeaks: true,
  // retries: 3,
};
