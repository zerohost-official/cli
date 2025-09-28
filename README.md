# ZeroHost CLI

> Command-line interface for ZeroHost ephemeral text sharing

Share text, code, and files securely from your terminal. All shares are automatically deleted after expiry with zero data retention.

## Installation

```bash
# Install globally with npm
npm install -g @zerohost/cli

# Install globally with yarn
yarn global add @zerohost/cli

# Or use npx (no installation required)
npx @zerohost/cli "Hello, world!"
```

## Quick Start

```bash
# Share text directly
zerohost "Hello, world!"

# Share from file
zerohost --file README.md

# Share from stdin (pipe)
echo "Hello, world!" | zerohost
cat file.txt | zerohost

# Interactive mode
zerohost --interactive
```

## Features

- 🔒 **Privacy-first**: No permanent storage, automatic deletion
- ⚡ **Fast**: Share in seconds from any terminal
- 🔑 **API Key Support**: Premium features for PRO users
- 📱 **QR Codes**: Share links via QR code
- 📋 **Clipboard**: Auto-copy URLs to clipboard
- 🔥 **Burn After Reading**: Self-destruct after first view
- 🛡️ **Password Protection**: Secure sensitive content
- 🎯 **Smart Detection**: Auto-detect file types for syntax highlighting

## Usage

### Basic Commands

```bash
# Share text
zerohost "Your text here"

# Share with custom expiry
zerohost "Expires in 1 hour" --expires 1h

# Password protect
zerohost "Secret content" --password mypassword

# Burn after reading
zerohost "Self-destruct message" --burn

# Combine options
zerohost "Secret code" --expires 2h --password secret --burn --qr
```

### File Sharing

```bash
# Share a file
zerohost --file script.py

# Share with custom expiry
zerohost --file config.json --expires 1d

# Share and show QR code
zerohost --file README.md --qr
```

### Piping Content

```bash
# From command output
ls -la | zerohost
ps aux | zerohost --expires 1h

# From file
cat /var/log/nginx/access.log | zerohost

# From curl response
curl -s https://api.github.com/user | zerohost --expires 2h
```

### Interactive Mode

```bash
zerohost --interactive
```

Interactive mode allows you to:
- Enter content in your default editor
- Choose expiry time from a menu
- Set password protection
- Enable burn after reading
- Generate QR codes

## Authentication

For premium features, authenticate with your API key:

```bash
# Login (saves API key locally)
zerohost --login

# Use API key for single command
zerohost "text" --api-key YOUR_API_KEY

# Check authentication status
zerohost --config

# Logout
zerohost --logout
```

## Premium Features (PRO Plan)

- Unlimited shares (vs 2/day free limit)
- Custom expiry times up to 7 days
- Password protection
- API key authentication
- Priority support

Get your API key from your [ZeroHost account dashboard](https://zerohost.net/account).

## Options

| Option | Alias | Description | Example |
|--------|-------|-------------|---------|
| `--file <path>` | `-f` | Share content from file | `--file script.py` |
| `--expires <time>` | `-e` | Expiry time (1h, 24h, 1w) | `--expires 2h` |
| `--password <pwd>` | `-p` | Password protect | `--password secret` |
| `--burn` | `-b` | Burn after reading | `--burn` |
| `--interactive` | `-i` | Interactive mode | `--interactive` |
| `--qr` | `-q` | Show QR code | `--qr` |
| `--copy` | `-c` | Copy to clipboard | `--copy` |
| `--api-key <key>` | | Use API key | `--api-key abc123` |
| `--silent` | | Minimal output | `--silent` |
| `--config` | | Show configuration | `--config` |
| `--login` | | Authenticate | `--login` |
| `--logout` | | Remove auth | `--logout` |

## Examples

### Development Workflow

```bash
# Share build logs
npm run build 2>&1 | zerohost --expires 1d

# Share git diff
git diff | zerohost --password review --expires 2h

# Share error logs
tail -100 /var/log/app.log | zerohost --burn

# Share configuration
zerohost --file .env.example --expires 1h --qr
```

### System Administration

```bash
# Share system info
uname -a | zerohost
df -h | zerohost --expires 1h

# Share process list
ps aux | grep nginx | zerohost

# Share network configuration
ifconfig | zerohost --password sysadmin
```

### Code Sharing

```bash
# Share code snippets
zerohost --file function.js --expires 1d --copy

# Share with syntax highlighting hint
zerohost --file script.py  # Auto-detected as Python

# Share repository state
git log --oneline -10 | zerohost
```

## Configuration

The CLI stores configuration in your system's config directory:

- **macOS**: `~/Library/Preferences/zerohost-cli/config.json`
- **Linux**: `~/.config/zerohost-cli/config.json`
- **Windows**: `%APPDATA%/zerohost-cli/config.json`

Configuration includes:
- Stored API key (encrypted)
- Default preferences
- Usage statistics

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ZEROHOST_API_KEY` | Default API key | `export ZEROHOST_API_KEY=abc123` |
| `ZEROHOST_BASE_URL` | Custom API endpoint | For development only |
| `NO_COLOR` | Disable colored output | `export NO_COLOR=1` |

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Authentication error |
| 3 | Network error |
| 4 | File not found |
| 5 | Invalid input |

## Troubleshooting

### Common Issues

**"Command not found"**
```bash
# Make sure it's installed globally
npm list -g @zerohost/cli

# Or use npx
npx @zerohost/cli --version
```

**"API key invalid"**
```bash
# Re-authenticate
zerohost --logout
zerohost --login

# Or check your account dashboard for the correct key
```

**"Network error"**
```bash
# Check internet connection
curl -I https://zerohost.net

# Try with verbose output
zerohost "test" --verbose
```

**"Rate limit exceeded"**
- Free users: Wait for daily limit reset
- Or upgrade to PRO for unlimited shares

### Debug Mode

```bash
# Enable debug output
DEBUG=zerohost* zerohost "test content"

# Check configuration
zerohost --config

# Test API connection
zerohost --login
```

## Development

```bash
# Clone repository
git clone https://github.com/zerohost-official/cli.git
cd cli

# Install dependencies
npm install

# Run in development
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -am 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit a pull request

## Security

Report security vulnerabilities to [security@zerohost.net](mailto:security@zerohost.net).

## License

MIT © [ZeroHost](https://zerohost.net)

## Links

- [ZeroHost Website](https://zerohost.net)
- [API Documentation](https://zerohost.net/api-docs)
- [Account Dashboard](https://zerohost.net/account)
- [Support](mailto:support@zerohost.net)