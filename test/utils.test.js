const {
  validateExpiry,
  formatExpiry,
  detectFileType,
  formatFileSize,
  truncateText
} = require('../src/utils');

describe('Utils', () => {
  describe('validateExpiry', () => {
    test('should validate valid expiry formats', () => {
      expect(validateExpiry('1h')).toBe(true);
      expect(validateExpiry('24h')).toBe(true);
      expect(validateExpiry('1d')).toBe(true);
      expect(validateExpiry('7d')).toBe(true);
      expect(validateExpiry('1w')).toBe(true);
    });

    test('should reject invalid expiry formats', () => {
      expect(validateExpiry('invalid')).toBe(false);
      expect(validateExpiry('1x')).toBe(false);
      expect(validateExpiry('0h')).toBe(false);
      expect(validateExpiry('169h')).toBe(false); // More than 7 days
      expect(validateExpiry('8d')).toBe(false);
      expect(validateExpiry('2w')).toBe(false);
      expect(validateExpiry('')).toBe(false);
      expect(validateExpiry(null)).toBe(false);
      expect(validateExpiry(undefined)).toBe(false);
    });
  });

  describe('formatExpiry', () => {
    test('should format future dates correctly', () => {
      const now = new Date();

      // 1 hour from now
      const oneHour = new Date(now.getTime() + 60 * 60 * 1000);
      expect(formatExpiry(oneHour.toISOString())).toBe('1 hour');

      // 2 hours from now
      const twoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      expect(formatExpiry(twoHours.toISOString())).toBe('2 hours');

      // 1 day from now
      const oneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      expect(formatExpiry(oneDay.toISOString())).toBe('1 day');

      // 3 days from now
      const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      expect(formatExpiry(threeDays.toISOString())).toBe('3 days');
    });

    test('should handle expired dates', () => {
      const past = new Date(Date.now() - 1000);
      expect(formatExpiry(past.toISOString())).toBe('Expired');
    });

    test('should handle invalid input', () => {
      expect(formatExpiry(null)).toBe('Unknown');
      expect(formatExpiry(undefined)).toBe('Unknown');
      expect(formatExpiry('')).toBe('Unknown');
    });

    test('should format minutes correctly', () => {
      const now = new Date();
      const tenMinutes = new Date(now.getTime() + 10 * 60 * 1000);
      expect(formatExpiry(tenMinutes.toISOString())).toBe('10 minutes');

      const oneMinute = new Date(now.getTime() + 1 * 60 * 1000);
      expect(formatExpiry(oneMinute.toISOString())).toBe('1 minute');
    });
  });

  describe('detectFileType', () => {
    test('should detect common programming languages', () => {
      expect(detectFileType('script.js')).toBe('javascript');
      expect(detectFileType('component.jsx')).toBe('javascript');
      expect(detectFileType('app.ts')).toBe('typescript');
      expect(detectFileType('component.tsx')).toBe('typescript');
      expect(detectFileType('script.py')).toBe('python');
      expect(detectFileType('app.rb')).toBe('ruby');
      expect(detectFileType('main.go')).toBe('go');
      expect(detectFileType('lib.rs')).toBe('rust');
      expect(detectFileType('App.java')).toBe('java');
    });

    test('should detect C/C++ files', () => {
      expect(detectFileType('main.c')).toBe('c');
      expect(detectFileType('app.cpp')).toBe('cpp');
      expect(detectFileType('app.cc')).toBe('cpp');
      expect(detectFileType('app.cxx')).toBe('cpp');
      expect(detectFileType('header.h')).toBe('c');
      expect(detectFileType('header.hpp')).toBe('cpp');
    });

    test('should detect web technologies', () => {
      expect(detectFileType('index.html')).toBe('html');
      expect(detectFileType('page.htm')).toBe('html');
      expect(detectFileType('style.css')).toBe('css');
      expect(detectFileType('style.scss')).toBe('scss');
      expect(detectFileType('style.sass')).toBe('sass');
      expect(detectFileType('style.less')).toBe('less');
    });

    test('should detect data formats', () => {
      expect(detectFileType('data.json')).toBe('json');
      expect(detectFileType('config.yaml')).toBe('yaml');
      expect(detectFileType('config.yml')).toBe('yaml');
      expect(detectFileType('config.xml')).toBe('xml');
      expect(detectFileType('config.toml')).toBe('toml');
      expect(detectFileType('config.ini')).toBe('ini');
    });

    test('should detect shell scripts', () => {
      expect(detectFileType('script.sh')).toBe('bash');
      expect(detectFileType('script.bash')).toBe('bash');
      expect(detectFileType('script.zsh')).toBe('bash');
      expect(detectFileType('script.fish')).toBe('bash');
      expect(detectFileType('script.ps1')).toBe('powershell');
    });

    test('should detect other common file types', () => {
      expect(detectFileType('README.md')).toBe('markdown');
      expect(detectFileType('README.markdown')).toBe('markdown');
      expect(detectFileType('query.sql')).toBe('sql');
      expect(detectFileType('Dockerfile')).toBe('dockerfile');
      expect(detectFileType('Makefile')).toBe('makefile');
    });

    test('should default to text for unknown extensions', () => {
      expect(detectFileType('file.unknown')).toBe('text');
      expect(detectFileType('file.xyz')).toBe('text');
      expect(detectFileType('README.txt')).toBe('text');
      expect(detectFileType('app.log')).toBe('text');
    });

    test('should handle files without extensions', () => {
      expect(detectFileType('README')).toBe('text');
      expect(detectFileType('Dockerfile')).toBe('dockerfile');
      expect(detectFileType('Makefile')).toBe('makefile');
    });
  });

  describe('formatFileSize', () => {
    test('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    test('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(102400)).toBe('100 KB');
    });

    test('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
      expect(formatFileSize(104857600)).toBe('100 MB');
    });

    test('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1610612736)).toBe('1.5 GB');
    });
  });

  describe('truncateText', () => {
    test('should not truncate short text', () => {
      const shortText = 'This is short';
      expect(truncateText(shortText, 50)).toBe(shortText);
    });

    test('should truncate long text with ellipsis', () => {
      const longText = 'This is a very long text that should be truncated';
      const result = truncateText(longText, 20);
      expect(result).toBe('This is a very lo...');
      expect(result.length).toBe(20);
    });

    test('should use default max length', () => {
      const longText = 'a'.repeat(150);
      const result = truncateText(longText);
      expect(result.length).toBe(100);
      expect(result.endsWith('...')).toBe(true);
    });

    test('should handle edge cases', () => {
      expect(truncateText('', 10)).toBe('');
      expect(truncateText('abc', 3)).toBe('abc');
      expect(truncateText('abcd', 3)).toBe('...');
    });
  });
});
