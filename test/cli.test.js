const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const ZeroHostCLI = require('../src/index');
const ZeroHostAPI = require('../src/api');

// Mock the API module
jest.mock('../src/api');

describe('ZeroHost CLI', () => {
  let cli;
  let mockAPI;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock API instance
    mockAPI = {
      createShare: jest.fn(),
      getShare: jest.fn(),
      testConnection: jest.fn(),
      setApiKey: jest.fn()
    };

    ZeroHostAPI.mockImplementation(() => mockAPI);

    cli = new ZeroHostCLI();
  });

  describe('Content Input', () => {
    test('should accept text as direct argument', async() => {
      const mockResponse = {
        id: 'test123',
        url: 'https://zerohost.net/share/test123',
        expires_at: '2024-01-01T12:00:00Z'
      };

      mockAPI.createShare.mockResolvedValue(mockResponse);

      // Mock console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run('Hello, world!', { silent: true });

      expect(mockAPI.createShare).toHaveBeenCalledWith({
        text: 'Hello, world!',
        expires_in: '24h',
        burn_after_reading: false
      });

      consoleSpy.mockRestore();
    });

    test('should read content from file', async() => {
      // Create temporary test file
      const testFile = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFile, 'File content test');

      const mockResponse = {
        id: 'test123',
        url: 'https://zerohost.net/share/test123',
        expires_at: '2024-01-01T12:00:00Z'
      };

      mockAPI.createShare.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run(null, { file: testFile, silent: true });

      expect(mockAPI.createShare).toHaveBeenCalledWith({
        text: 'File content test',
        expires_in: '24h',
        burn_after_reading: false
      });

      // Clean up
      fs.unlinkSync(testFile);
      consoleSpy.mockRestore();
    });

    test('should handle file not found error', async() => {
      await expect(
        cli.run(null, { file: 'nonexistent-file.txt' })
      ).rejects.toThrow('File not found: nonexistent-file.txt');
    });

    test('should handle empty content error', async() => {
      await expect(
        cli.run('', {})
      ).rejects.toThrow('No content to share');
    });
  });

  describe('Share Options', () => {
    test('should handle expiry time option', async() => {
      const mockResponse = {
        id: 'test123',
        url: 'https://zerohost.net/share/test123',
        expires_at: '2024-01-01T12:00:00Z'
      };

      mockAPI.createShare.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run('Test content', { expires: '2h', silent: true });

      expect(mockAPI.createShare).toHaveBeenCalledWith({
        text: 'Test content',
        expires_in: '2h',
        burn_after_reading: false
      });

      consoleSpy.mockRestore();
    });

    test('should handle password protection', async() => {
      const mockResponse = {
        id: 'test123',
        url: 'https://zerohost.net/share/test123',
        expires_at: '2024-01-01T12:00:00Z'
      };

      mockAPI.createShare.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run('Secret content', {
        password: 'mypassword',
        silent: true
      });

      expect(mockAPI.createShare).toHaveBeenCalledWith({
        text: 'Secret content',
        expires_in: '24h',
        password: 'mypassword',
        burn_after_reading: false
      });

      consoleSpy.mockRestore();
    });

    test('should handle burn after reading', async() => {
      const mockResponse = {
        id: 'test123',
        url: 'https://zerohost.net/share/test123',
        expires_at: '2024-01-01T12:00:00Z'
      };

      mockAPI.createShare.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run('Burn content', { burn: true, silent: true });

      expect(mockAPI.createShare).toHaveBeenCalledWith({
        text: 'Burn content',
        expires_in: '24h',
        burn_after_reading: true
      });

      consoleSpy.mockRestore();
    });

    test('should validate expiry format', async() => {
      await expect(
        cli.run('Test', { expires: 'invalid' })
      ).rejects.toThrow('Invalid expiry time');
    });
  });

  describe('Authentication', () => {
    test('should use API key from options', async() => {
      const mockResponse = {
        id: 'test123',
        url: 'https://zerohost.net/share/test123',
        expires_at: '2024-01-01T12:00:00Z'
      };

      mockAPI.createShare.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run('Test content', {
        apiKey: 'test-api-key',
        silent: true
      });

      expect(mockAPI.setApiKey).toHaveBeenCalledWith('test-api-key');

      consoleSpy.mockRestore();
    });

    test('should handle login process', async() => {
      // Mock inquirer prompt
      const inquirer = require('inquirer');
      jest.mock('inquirer', () => ({
        prompt: jest.fn()
      }));

      inquirer.prompt.mockResolvedValue({ apiKey: 'new-api-key' });
      mockAPI.testConnection.mockResolvedValue(true);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run(null, { login: true });

      expect(mockAPI.setApiKey).toHaveBeenCalledWith('new-api-key');
      expect(mockAPI.testConnection).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async() => {
      mockAPI.createShare.mockRejectedValue(new Error('API Error'));

      await expect(
        cli.run('Test content', {})
      ).rejects.toThrow();
    });

    test('should handle network errors', async() => {
      mockAPI.createShare.mockRejectedValue(
        new Error('Network error - check your internet connection')
      );

      await expect(
        cli.run('Test content', {})
      ).rejects.toThrow('Network error');
    });
  });

  describe('Configuration', () => {
    test('should show configuration', async() => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run(null, { config: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ZeroHost CLI Configuration')
      );

      consoleSpy.mockRestore();
    });

    test('should handle logout', async() => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run(null, { logout: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Logged out successfully')
      );

      consoleSpy.mockRestore();
    });
  });
});

describe('CLI Binary', () => {
  const cliPath = path.join(__dirname, '..', 'bin', 'zerohost.js');

  test('should show version', (done) => {
    const child = spawn('node', [cliPath, '--version'], {
      stdio: 'pipe'
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      expect(code).toBe(0);
      expect(output.trim()).toMatch(/\d+\.\d+\.\d+/);
      done();
    });
  });

  test('should show help', (done) => {
    const child = spawn('node', [cliPath, '--help'], {
      stdio: 'pipe'
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      expect(code).toBe(0);
      expect(output).toContain('Share ephemeral text securely');
      done();
    });
  });
});
