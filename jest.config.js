module.exports = {
  collectCoverage: true,
  coverageReporters: ["json-summary", "text", "lcov"],
  collectCoverageFrom: ["managers/entities/**/*.manager.js"],
  coveragePathIgnorePatterns: ["node_modules", ".test.js"],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
