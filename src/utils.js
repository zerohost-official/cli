
/**
 * Utility functions for ZeroHost CLI
 */

/**
 * Validate expiry time format
 * @param {string} expiry - Expiry string like '1h', '24h', '1w'
 * @returns {boolean} - Whether the format is valid
 */
function validateExpiry(expiry) {
  if (!expiry || typeof expiry !== 'string') {
    return false;
  }

  // Match patterns like: 1h, 24h, 1d, 7d, 1w
  const pattern = /^(\d+)(h|d|w)$/;
  const match = expiry.match(pattern);

  if (!match) {
    return false;
  }

  const [, amount, unit] = match;
  const num = parseInt(amount, 10);

  // Validate reasonable limits
  switch (unit) {
  case 'h': // hours
    return num >= 1 && num <= 168; // 1 hour to 7 days
  case 'd': // days
    return num >= 1 && num <= 7;
  case 'w': // weeks
    return num >= 1 && num <= 1;
  default:
    return false;
  }
}

/**
 * Format expiry time for display
 * @param {string} expiresAt - ISO date string
 * @returns {string} - Formatted expiry text
 */
function formatExpiry(expiresAt) {
  if (!expiresAt) {
    return 'Unknown';
  }

  const expiry = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Expired';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  } else {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
  }
}

/**
 * Read from stdin (for piped input)
 * @returns {Promise<string>} - Content from stdin
 */
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data);
    });

    process.stdin.on('error', (error) => {
      reject(error);
    });

    // Handle case where stdin is not piped
    const timeout = setTimeout(() => {
      if (data === '') {
        resolve('');
      }
    }, 100);

    process.stdin.on('data', () => {
      clearTimeout(timeout);
    });
  });
}

/**
 * Detect file type for syntax highlighting hint
 * @param {string} filename - File path
 * @returns {string} - Language identifier
 */
function detectFileType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();

  const extensionMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'fish': 'bash',
    'ps1': 'powershell',
    'sql': 'sql',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'json': 'json',
    'md': 'markdown',
    'markdown': 'markdown',
    'txt': 'text',
    'log': 'text',
    'conf': 'text',
    'config': 'text',
    'ini': 'ini',
    'toml': 'toml',
    'dockerfile': 'dockerfile',
    'makefile': 'makefile',
    'r': 'r',
    'R': 'r',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'clj': 'clojure',
    'elm': 'elm',
    'ex': 'elixir',
    'exs': 'elixir',
    'erl': 'erlang',
    'hrl': 'erlang'
  };

  return extensionMap[ext] || 'text';
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Truncate text for display
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Check if running in CI environment
 * @returns {boolean} - Whether running in CI
 */
function isCI() {
  return !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.BUILD_NUMBER ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.JENKINS_URL
  );
}

/**
 * Get terminal width
 * @returns {number} - Terminal width in characters
 */
function getTerminalWidth() {
  return process.stdout.columns || 80;
}

module.exports = {
  validateExpiry,
  formatExpiry,
  readStdin,
  detectFileType,
  formatFileSize,
  truncateText,
  isCI,
  getTerminalWidth
};
