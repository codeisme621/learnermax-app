#!/usr/bin/env node

/**
 * Setup script for local development environment
 * Starts both backend and frontend projects for e2e testing
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Check if directory exists
function directoryExists(dir) {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

// Check if package.json exists in directory
function hasPackageJson(dir) {
  return fs.existsSync(path.join(dir, 'package.json'));
}

// Run command in directory
function runCommand(command, args, cwd, label, env = {}) {
  return new Promise((resolve, reject) => {
    log(`Starting ${label}...`, colors.cyan);

    const childProcess = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, ...env }
    });

    // Prefix output with service label
    childProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`${colors.bright}[${label}]${colors.reset} ${line}`);
      });
    });

    childProcess.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`${colors.red}[${label} ERROR]${colors.reset} ${line}`);
      });
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        logSuccess(`${label} started successfully`);
        resolve();
      } else {
        logError(`${label} failed to start (exit code: ${code})`);
        reject(new Error(`${label} failed with exit code: ${code}`));
      }
    });

    childProcess.on('error', (error) => {
      logError(`Failed to start ${label}: ${error.message}`);
      reject(error);
    });
  });
}

// Install dependencies for a project
async function installDependencies(dir, label) {
  log(`Installing dependencies for ${label}...`, colors.yellow);
  try {
    await runCommand('pnpm', ['install'], dir, `${label} Install`);
    logSuccess(`Dependencies installed for ${label}`);
  } catch (error) {
    logError(`Failed to install dependencies for ${label}`);
    throw error;
  }
}

// Main setup function
async function setupLocal() {
  log('🚀 Setting up local development environment for e2e testing', colors.bright);

  // Validate project structure
  logInfo('Validating project structure...');

  if (!directoryExists(BACKEND_DIR)) {
    logError(`Backend directory not found: ${BACKEND_DIR}`);
    process.exit(1);
  }

  if (!directoryExists(FRONTEND_DIR)) {
    logError(`Frontend directory not found: ${FRONTEND_DIR}`);
    process.exit(1);
  }

  if (!hasPackageJson(BACKEND_DIR)) {
    logError(`Backend package.json not found in: ${BACKEND_DIR}`);
    process.exit(1);
  }

  if (!hasPackageJson(FRONTEND_DIR)) {
    logError(`Frontend package.json not found in: ${FRONTEND_DIR}`);
    process.exit(1);
  }

  logSuccess('Project structure validated');

  try {
    // Install dependencies for both projects
    await installDependencies(BACKEND_DIR, 'Backend');
    await installDependencies(FRONTEND_DIR, 'Frontend');

    logInfo('Starting both backend and frontend services...');

    // Start backend and frontend in parallel
    const backendPromise = runCommand('pnpm', ['run', 'dev'], BACKEND_DIR, 'Backend');

    // Small delay to let backend start first
    setTimeout(() => {
      runCommand('pnpm', ['dev'], FRONTEND_DIR, 'Frontend');
    }, 2000);

    // Wait for backend to be ready
    await backendPromise;

    log('🎉 Local development environment is ready!', colors.green);
    log('', colors.reset);
    log('Services running:', colors.bright);
    log('  • Backend API: http://localhost:8080', colors.cyan);
    log('  • Frontend UI: http://localhost:3000', colors.cyan);
    log('', colors.reset);
    log('Ready for e2e testing! Run your Playwright tests now.', colors.green);
    log('', colors.reset);
    log('Press Ctrl+C to stop all services', colors.yellow);

  } catch (error) {
    logError('Failed to setup local environment');
    console.error(error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n🛑 Shutting down local development environment...', colors.yellow);
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n🛑 Shutting down local development environment...', colors.yellow);
  process.exit(0);
});

// Run setup
setupLocal().catch((error) => {
  logError('Setup failed');
  console.error(error);
  process.exit(1);
});