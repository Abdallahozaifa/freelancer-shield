// Jest setup file - runs before each test file

// Extend Jest matchers if needed
// import '@testing-library/jest-dom';

// Set test timeout
jest.setTimeout(10000);

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_ROUNDS = '4'; // Lower for faster tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/freelancer_shield_test';

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless DEBUG=true
  log: process.env.DEBUG ? console.log : jest.fn(),
  debug: process.env.DEBUG ? console.debug : jest.fn(),
  info: process.env.DEBUG ? console.info : jest.fn(),
  // Keep error and warn visible
  warn: console.warn,
  error: console.error,
};
