const fs = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const clipboardy = require('clipboardy');
const qrcode = require('qrcode-terminal');
const Configstore = require('configstore');
const ora = require('ora');
const boxen = require('boxen');
const updateNotifier = require('update-notifier-cjs');

const ZeroHostAPI = require('./api');
const { validateExpiry, formatExpiry, readStdin } = require('./utils');

class ZeroHostCLI {
  constructor() {
    this.config = new Configstore('zerohost-cli');
    this.api = new ZeroHostAPI();

    // Check for updates
    const pkg = require('../package.json');
    const notifier = updateNotifier({ pkg });
    if (notifier.update) {
      notifier.notify({
        defer: false,
        message: 'Update available {currentVersion} → {latestVersion}\nRun {updateCommand} to update'
      });
    }
  }

  async run(text, options) {
    try {
      // Handle configuration commands
      if (options.config) {
        return this.showConfig();
      }

      if (options.login) {
        return await this.login();
      }

      if (options.logout) {
        return this.logout();
      }

      // Get API key from options or config
      const apiKey = options.apiKey || this.config.get('apiKey');
      if (apiKey) {
        this.api.setApiKey(apiKey);
      }

      // Determine content to share
      const content = await this.getContent(text, options);

      if (!content || content.trim().length === 0) {
        throw new Error('No content to share. Provide text as argument, use --file, or pipe content.');
      }

      // Interactive mode for additional options
      if (options.interactive) {
        const answers = await this.interactiveMode(options);
        Object.assign(options, answers);
      }

      // Validate expiry time
      if (options.expires && !validateExpiry(options.expires)) {
        throw new Error('Invalid expiry time. Use format like: 1h, 24h, 1w, 7d');
      }

      // Create the share
      await this.createShare(content, options);
    } catch (error) {
      if (!options.silent) {
        console.error(chalk.red('✗'), error.message);
      }
      process.exit(1);
    }
  }

  async getContent(text, options) {
    // Priority: direct text > file > stdin
    if (text) {
      return text;
    }

    if (options.file) {
      if (!fs.existsSync(options.file)) {
        throw new Error(`File not found: ${options.file}`);
      }
      return fs.readFileSync(options.file, 'utf8');
    }

    // Check for piped input
    if (!process.stdin.isTTY) {
      return await readStdin();
    }

    // No content provided and no interactive mode
    if (!options.interactive) {
      throw new Error('No content provided');
    }

    // Interactive content input
    const { content } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'content',
        message: 'Enter content to share (opens editor):',
        validate: (input) => input.trim().length > 0 || 'Content cannot be empty'
      }
    ]);

    return content;
  }

  async interactiveMode(currentOptions) {
    const questions = [];

    if (!currentOptions.expires) {
      questions.push({
        type: 'list',
        name: 'expires',
        message: 'Select expiry time:',
        choices: [
          { name: '1 hour', value: '1h' },
          { name: '24 hours', value: '24h' },
          { name: '7 days', value: '1w' },
          { name: 'Custom', value: 'custom' }
        ],
        default: '24h'
      });
    }

    if (!currentOptions.password) {
      questions.push({
        type: 'password',
        name: 'password',
        message: 'Password protect? (leave empty for none):',
        mask: '*'
      });
    }

    if (!currentOptions.burn) {
      questions.push({
        type: 'confirm',
        name: 'burn',
        message: 'Burn after reading?',
        default: false
      });
    }

    if (!currentOptions.reference) {
      questions.push({
        type: 'input',
        name: 'reference',
        message: 'Reference label for tracking? (max 8 chars, leave empty for none):',
        validate: (input) => {
          if (!input) return true; // Empty is valid
          if (input.length > 8) return 'Reference must be 8 characters or less';
          if (!/^[a-zA-Z0-9\-_.]+$/.test(input)) return 'Only letters, numbers, hyphens, underscores, and periods allowed';
          return true;
        }
      });
    }

    questions.push({
      type: 'confirm',
      name: 'qr',
      message: 'Show QR code?',
      default: false
    });

    questions.push({
      type: 'confirm',
      name: 'copy',
      message: 'Copy URL to clipboard?',
      default: true
    });

    const answers = await inquirer.prompt(questions);

    // Handle custom expiry
    if (answers.expires === 'custom') {
      const { customExpiry } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customExpiry',
          message: 'Enter custom expiry (e.g., 2h, 3d, 1w):',
          validate: (input) => validateExpiry(input) || 'Invalid expiry format'
        }
      ]);
      answers.expires = customExpiry;
    }

    // Clean up empty password and reference
    if (answers.password === '') {
      delete answers.password;
    }
    if (answers.reference === '') {
      delete answers.reference;
    }

    return answers;
  }

  async createShare(content, options) {
    const spinner = options.silent ? null : ora('Creating share...').start();

    try {
      const shareData = {
        text: content,
        expires_in: options.expires || '24h',
        password: options.password,
        burn_after_reading: options.burn || false,
        reference: options.reference || null
      };

      const result = await this.api.createShare(shareData);

      if (spinner) spinner.succeed('Share created successfully!');

      await this.displayResult(result, options);
    } catch (error) {
      if (spinner) spinner.fail('Failed to create share');
      throw error;
    }
  }

  async displayResult(result, options) {
    if (options.silent) {
      console.log(result.url);
      return;
    }

    const info = [
      `${chalk.green('✓')} Share URL: ${chalk.blue(result.url)}`,
      `${chalk.gray('•')} Expires: ${formatExpiry(result.expires_at)}`,
      `${chalk.gray('•')} Share ID: ${result.id}`
    ];

    if (result.password) {
      info.push(`${chalk.gray('•')} Password protected: ${chalk.yellow('Yes')}`);
    }

    if (result.burn_after_reading) {
      info.push(`${chalk.gray('•')} Burn after reading: ${chalk.red('Yes')}`);
    }

    if (result.usage) {
      info.push(`${chalk.gray('•')} Usage: ${result.usage.current}/${result.usage.limit}`);
    }

    console.log(boxen(info.join('\n'), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'green'
    }));

    // Copy to clipboard
    if (options.copy !== false) {
      try {
        await clipboardy.write(result.url);
        console.log(chalk.gray('📋 URL copied to clipboard'));
      } catch (error) {
        console.log(chalk.gray('Failed to copy to clipboard'));
      }
    }

    // Show QR code
    if (options.qr) {
      console.log(`\n${chalk.gray('QR Code:')}`);
      qrcode.generate(result.url, { small: true });
    }
  }

  async login() {
    console.log(chalk.blue('🔑 ZeroHost CLI Authentication\n'));

    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your API key:',
        mask: '*',
        validate: (input) => input.trim().length > 0 || 'API key cannot be empty'
      }
    ]);

    const spinner = ora('Validating API key...').start();

    try {
      // Test the API key
      this.api.setApiKey(apiKey);
      await this.api.testConnection();

      this.config.set('apiKey', apiKey);
      spinner.succeed('Authentication successful!');

      console.log(chalk.green('\n✓ API key saved. You can now use premium features.'));
    } catch (error) {
      spinner.fail('Authentication failed');
      throw new Error('Invalid API key or connection failed');
    }
  }

  logout() {
    this.config.delete('apiKey');
    console.log(chalk.green('✓ Logged out successfully'));
  }

  showConfig() {
    const config = this.config.all;
    const hasApiKey = !!config.apiKey;

    console.log(chalk.blue('ZeroHost CLI Configuration\n'));

    console.log(`${chalk.gray('Config file:')} ${this.config.path}`);
    console.log(`${chalk.gray('Authenticated:')} ${hasApiKey ? chalk.green('Yes') : chalk.red('No')}`);

    if (hasApiKey) {
      const maskedKey = `${config.apiKey.substring(0, 8)}...`;
      console.log(`${chalk.gray('API Key:')} ${maskedKey}`);
    }

    console.log(`\n${chalk.gray('Available commands:')}`);
    console.log('  zerohost --login     Authenticate with API key');
    console.log('  zerohost --logout    Remove stored authentication');
    console.log('  zerohost --help      Show all available options');
  }
}

module.exports = ZeroHostCLI;
