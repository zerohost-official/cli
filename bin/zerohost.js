#!/usr/bin/env node

/**
 * ZeroHost CLI - Ephemeral text sharing from the command line
 *
 * Usage:
 *   zerohost "Hello, world!"
 *   echo "Hello, world!" | zerohost
 *   zerohost --file README.md
 *   zerohost --interactive
 */

const { program } = require('commander');
const pkg = require('../package.json');
const ZeroHostCLI = require('../src/index.js');

async function main() {
  try {
    const cli = new ZeroHostCLI();

    program
      .name('zerohost')
      .description('Share ephemeral text securely from the command line')
      .version(pkg.version)
      .option('-f, --file <path>', 'share content from a file')
      .option('-e, --expires <time>', 'expiry time (1h, 24h, 1w)', '24h')
      .option('-p, --password <password>', 'protect with password')
      .option('-b, --burn', 'burn after reading')
      .option('-r, --reference <ref>', 'reference label for tracking (max 8 chars)')
      .option('-i, --interactive', 'interactive mode')
      .option('-q, --qr', 'show QR code')
      .option('-c, --copy', 'copy URL to clipboard')
      .option('--api-key <key>', 'API key for authenticated requests')
      .option('--config', 'show configuration')
      .option('--login', 'authenticate with ZeroHost')
      .option('--logout', 'remove stored authentication')
      .option('--silent', 'minimal output')
      .argument('[text]', 'text to share')
      .action(async(text, options) => {
        await cli.run(text, options);
      });

    // Parse command line arguments
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error.message);
  process.exit(1);
});

main();
