#!/usr/bin/env node

/**
 * Attempt to auto-fix common OpenAPI validation errors
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function fixCommonIssues(spec) {
  let fixed = { ...spec };
  let changes = [];

  // Ensure required fields exist
  if (!fixed.openapi && !fixed.swagger) {
    fixed.openapi = '3.0.3';
    changes.push('Added missing openapi version');
  }

  if (!fixed.info) {
    fixed.info = {
      title: 'Hinna API',
      version: '1.0.0',
    };
    changes.push('Added missing info object');
  }

  if (!fixed.paths) {
    fixed.paths = {};
    changes.push('Added missing paths object');
  }

  // Fix invalid operation IDs (must be unique)
  const operationIds = new Set();
  for (const [pathKey, pathItem] of Object.entries(fixed.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation === 'object' && operation.operationId) {
        if (operationIds.has(operation.operationId)) {
          const newId = `${operation.operationId}_${Math.random().toString(36).substr(2, 9)}`;
          operation.operationId = newId;
          changes.push(`Fixed duplicate operationId: ${newId}`);
        }
        operationIds.add(operation.operationId);
      }
    }
  }

  // Remove invalid fields
  for (const [pathKey, pathItem] of Object.entries(fixed.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (operation && operation['x-source']) {
        // Keep x-source as vendor extension
      }
    }
  }

  if (changes.length > 0) {
    console.log('Applied fixes:');
    changes.forEach(change => console.log(`  - ${change}`));
  }

  return fixed;
}

function main() {
  const swaggerPath = path.join(process.cwd(), 'public', 'swagger.yaml');

  const content = fs.readFileSync(swaggerPath, 'utf-8');
  const spec = yaml.load(content);

  const fixed = fixCommonIssues(spec);

  const fixedContent = yaml.dump(fixed, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });

  fs.writeFileSync(swaggerPath, fixedContent, 'utf-8');
  console.log('✅ Attempted auto-fix of swagger.yaml');
}

main();
