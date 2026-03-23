module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup.jest.ts"],
  moduleNameMapper: {
    "^@environment$": "<rootDir>/src/environments/environment",
    "^@components/(.*)$": "<rootDir>/src/app/shared/components/$1",
    "^@enums/(.*)$": "<rootDir>/src/app/shared/enums/$1",
    "^@models/(.*)$": "<rootDir>/src/app/shared/models/$1",
    "^@services/(.*)$": "<rootDir>/src/app/shared/services/$1",
    "^@pipes/(.*)$": "<rootDir>/src/app/shared/pipes/$1",
    "^@utils/(.*)$": "<rootDir>/src/app/shared/utils/$1",
    "^@constants/(.*)$": "<rootDir>/src/app/shared/constants/$1",
    "^@core/(.*)$": "<rootDir>/src/app/core/$1",
    "^@features/(.*)$": "<rootDir>/src/app/features/$1",

  },
};
