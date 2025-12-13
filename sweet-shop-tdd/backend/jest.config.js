const path = require('path');

module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  rootDir: path.resolve(__dirname, '..'),
  testMatch: ['<rootDir>/tests/backend/**/*.test.js'],
  collectCoverageFrom: [
    'backend/src/**/*.js',
    '!backend/src/server.js'
  ],
  testTimeout: 10000
};