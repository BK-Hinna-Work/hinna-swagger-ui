#!/usr/bin/env node

/**
 * Consolidate all scan results into the central swagger.yaml
 */

const { execSync } = require('child_process');

async function main() {
  console.log('Consolidating all scan results...');

  try {
    execSync('node scripts/update-swagger.js', {
      stdio: 'inherit',
    });

    console.log('✅ Consolidation complete');
  } catch (error) {
    console.error('Consolidation failed:', error.message);
    process.exit(1);
  }
}

main();
