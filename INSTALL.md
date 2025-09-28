# ZeroHost CLI - Quick Installation

> Fast setup guide for ZeroHost CLI. For complete documentation, see [README.md](README.md).

## Production Install

```bash
# Install globally (when published to npm)
npm install -g zerohost-cli

# Or use without installing
npx zerohost-cli "Hello, world!"
```

## Development Install

```bash
# Clone and install locally
git clone https://github.com/zerohost-official/cli.git
cd cli
npm install
npm link  # Makes 'zerohost' command available globally
```

## Development Setup

```bash
# Clone the repository
git clone https://github.com/zerohost-official/cli.git
cd cli

# Install dependencies
npm install

# Test the CLI
npm test

# Run locally without installing
node bin/zerohost.js --help
```

## Verify Installation

```bash
# Check version
zerohost --version

# Show help
zerohost --help

# Check configuration
zerohost --config
```

## Authentication Setup

To use premium features:

1. Sign up at [https://zerohost.net/auth](https://zerohost.net/auth)
2. Upgrade to Pro or Developer plan
3. Get your API key from [https://zerohost.net/account](https://zerohost.net/account)
4. Authenticate the CLI:

```bash
zerohost --login
# Enter your API key when prompted
```

## Quick Test

```bash
# Verify installation
zerohost --version
zerohost --help

# First share (requires authentication)
zerohost "Hello, world!"
```

## Troubleshooting

### "Command not found: zerohost"

Make sure you've run `npm link` after installation, or use the full path:
```bash
node /path/to/cli/bin/zerohost.js --help
```

### NPX Alternative

If you don't want to install globally, use npx:
```bash
npx zerohost-cli "Hello, world!"
```

### Environment Variables

```bash
# Custom API endpoint (for development)
export ZEROHOST_BASE_URL=http://localhost:3000

# Default API key
export ZEROHOST_API_KEY=your_api_key_here

# Disable colors
export NO_COLOR=1
```

## Development Commands

```bash
# Run tests
npm test

# Run with nodemon (auto-restart)
npm run dev

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

For more information, see the [README.md](README.md) file.