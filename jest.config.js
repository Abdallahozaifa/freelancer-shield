/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages', '<rootDir>/apps'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '@freelancer-shield/database': '<rootDir>/packages/database/src',
    '@freelancer-shield/shared': '<rootDir>/packages/shared/src',
    '@freelancer-shield/auth': '<rootDir>/packages/auth/src',
    '@freelancer-shield/scope-analyzer': '<rootDir>/packages/scope-analyzer/src',
  },
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
};
