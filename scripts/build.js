#!/usr/bin/env node

/**
 * Build script for ZeroHost CLI
 * Prepares the package for distribution
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building ZeroHost CLI...\n');

// Clean previous builds
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true });
  console.log('✓ Cleaned previous build');
}

// Run linting
try {
  console.log('📋 Running linter...');
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✓ Linting passed');
} catch (error) {
  console.error('❌ Linting failed');
  process.exit(1);
}

// Run tests
try {
  console.log('🧪 Running tests...');
  execSync('npm test', { stdio: 'inherit' });
  console.log('✓ Tests passed');
} catch (error) {
  console.error('❌ Tests failed');
  process.exit(1);
}

// Ensure bin files are executable
const binPath = path.join(__dirname, '..', 'bin', 'zerohost.js');
if (fs.existsSync(binPath)) {
  fs.chmodSync(binPath, '755');
  console.log('✓ Made bin/zerohost.js executable');
}

// Validate package.json
const pkg = require('../package.json');
const requiredFields = ['name', 'version', 'description', 'main', 'bin', 'author', 'license'];

for (const field of requiredFields) {
  if (!pkg[field]) {
    console.error(`❌ Missing required field in package.json: ${field}`);
    process.exit(1);
  }
}

console.log('✓ Package.json validated');

// Check file sizes
const srcDir = path.join(__dirname, '..', 'src');
const binDir = path.join(__dirname, '..', 'bin');

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function getSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      const items = fs.readdirSync(itemPath);
      items.forEach(item => {
        getSize(path.join(itemPath, item));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  getSize(dirPath);
  return totalSize;
}

const srcSize = getDirectorySize(srcDir);
const binSize = getDirectorySize(binDir);
const totalSize = srcSize + binSize;

console.log(`📦 Package size: ${Math.round(totalSize / 1024)}KB`);

if (totalSize > 1024 * 1024) { // 1MB
  console.warn('⚠️  Package size is over 1MB, consider optimization');
}

// Generate build info
const buildInfo = {
  version: pkg.version,
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch
};

fs.writeFileSync(
  path.join(__dirname, '..', 'build-info.json'),
  JSON.stringify(buildInfo, null, 2)
);

console.log('✓ Generated build info');

// Check for security issues (basic)
try {
  console.log('🔒 Running security audit...');
  execSync('npm audit --audit-level high', { stdio: 'inherit' });
  console.log('✓ Security audit passed');
} catch (error) {
  console.warn('⚠️  Security audit found issues, review before publishing');
}

console.log('\n✅ Build completed successfully!');
console.log('\nNext steps:');
console.log('  • Test installation: npm pack && npm install -g zerohost-cli-*.tgz');
console.log('  • Test functionality: zerohost --help');
console.log('  • Publish: npm publish');