module.exports = {
  video: true,
  screenshotOnRunFailure: true,
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
    supportFile: false,
    defaultCommandTimeout: 10000,
  },
};
