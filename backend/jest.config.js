module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.js"],
  collectCoverageFrom: ["server.js", "!**/node_modules/**", "!**/coverage/**"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  verbose: true,
  testTimeout: 5000,
  forceExit: true,
  detectOpenHandles: true,
};
