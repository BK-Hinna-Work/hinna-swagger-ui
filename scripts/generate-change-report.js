#!/usr/bin/env node

/**
 * Generate a change report for the git commit
 */

const { execSync } = require('child_process');

function getChangedEndpoints() {
  try {
    const diff = execSync('git diff HEAD public/swagger.yaml', { encoding: 'utf-8' });

    // Parse the diff to find added/modified endpoints
    const addedLines = diff.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++'));
    const removedLines = diff.split('\n').filter(line => line.startsWith('-') && !line.startsWith('---'));

    return {
      added: addedLines.length,
      removed: removedLines.length,
      modified: Math.min(addedLines.length, removedLines.length),
    };
  } catch (error) {
    return { added: 0, removed: 0, modified: 0 };
  }
}

function main() {
  const changes = getChangedEndpoints();

  console.log('## Changes');
  console.log('');
  console.log(`- ✅ Added: ${changes.added} line(s)`);
  console.log(`- ❌ Removed: ${changes.removed} line(s)`);
  console.log(`- ✏️ Modified: ${changes.modified} line(s)`);
  console.log('');
  console.log('See full diff for details.');
}

main();
