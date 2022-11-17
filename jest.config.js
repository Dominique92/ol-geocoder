module.exports = {
  setupFiles: ['<rootDir>/test/env-setup.js'],
  testRegex: '/test/unit/.*\\.test\\.js$',
  transformIgnorePatterns: ['/node_modules/(?!(ol)/)'],
};
