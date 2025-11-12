#!/usr/bin/env node

/**
 * Scan all Hinna repositories for API endpoints
 */

const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  const reposFile = 'repos.json';

  if (!fs.existsSync(reposFile)) {
    console.error('repos.json not found');
    process.exit(1);
  }

  const repos = JSON.parse(fs.readFileSync(reposFile, 'utf-8'));
  console.log(`Scanning ${repos.length} repositories`);

  for (const repo of repos) {
    console.log(`\n=== Scanning ${repo.name} ===`);

    try {
      execSync(`REPO_NAME=${repo.name} node scripts/scan-repository.js`, {
        stdio: 'inherit',
        env: process.env,
      });
    } catch (error) {
      console.error(`Failed to scan ${repo.name}:`, error.message);
      continue;
    }
  }

  console.log('\n✅ All repositories scanned');
}

main();
