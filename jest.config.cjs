module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    // Let ts-jest handle both TypeScript and JavaScript files (including JSX/TSX)
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  testMatch: ['<rootDir>/tests/**/*.test.(ts|tsx)'],
};
