// Mock for update-notifier (ESM module)
// This allows Jest to test the CLI without importing the ESM version

module.exports = function updateNotifier() {
  return {
    update: null,
    notify: jest.fn()
  };
};
