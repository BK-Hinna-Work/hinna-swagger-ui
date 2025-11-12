#!/usr/bin/env node

/**
 * Update central swagger.yaml with discovered endpoints
 *
 * This script merges discovered API endpoints into the central OpenAPI specification
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function loadScanResults() {
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    return [];
  }

  const scanFiles = fs.readdirSync(docsDir)
    .filter(f => f.endsWith('-scan.json'));

  return scanFiles.map(file => {
    const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
    return JSON.parse(content);
  });
}

function mergeEndpoints(currentSpec, scanResults) {
  const updatedSpec = { ...currentSpec };

  for (const scan of scanResults) {
    console.log(`Processing scan results from: ${scan.repository}`);

    // Add tag for this repository if it doesn't exist
    const repoTag = scan.repository.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (!updatedSpec.tags.find(t => t.name === repoTag)) {
      updatedSpec.tags.push({
        name: repoTag,
        description: `Endpoints from ${scan.repository} repository`,
      });
    }

    // Merge endpoints
    for (const endpoint of scan.endpoints) {
      const path = endpoint.path;
      const method = endpoint.method.toLowerCase();

      // Initialize path if it doesn't exist
      if (!updatedSpec.paths[path]) {
        updatedSpec.paths[path] = {};
      }

      // Add or update endpoint
      if (!updatedSpec.paths[path][method]) {
        updatedSpec.paths[path][method] = {
          tags: [repoTag],
          summary: `${method.toUpperCase()} ${path}`,
          description: `Auto-discovered endpoint from ${scan.repository}`,
          operationId: `${method}${path.replace(/[^a-zA-Z0-9]/g, '')}`,
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
          },
          'x-source': {
            repository: scan.repository,
            file: endpoint.file,
            discoveredAt: scan.timestamp,
          },
        };

        console.log(`  Added: ${method.toUpperCase()} ${path}`);
      }
    }
  }

  return updatedSpec;
}

function main() {
  const swaggerPath = path.join(process.cwd(), 'public', 'swagger.yaml');

  // Load current swagger.yaml
  const currentContent = fs.readFileSync(swaggerPath, 'utf-8');
  const currentSpec = yaml.load(currentContent);

  // Load scan results
  const scanResults = loadScanResults();
  console.log(`Loaded ${scanResults.length} scan result(s)`);

  if (scanResults.length === 0) {
    console.log('No scan results found, skipping update');
    return;
  }

  // Merge endpoints
  const updatedSpec = mergeEndpoints(currentSpec, scanResults);

  // Update version and timestamp
  updatedSpec.info.version = incrementVersion(currentSpec.info.version);
  updatedSpec.info['x-lastUpdated'] = new Date().toISOString();

  // Write updated swagger.yaml
  const updatedContent = yaml.dump(updatedSpec, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });

  fs.writeFileSync(swaggerPath, updatedContent, 'utf-8');
  console.log('✅ swagger.yaml updated successfully');
}

function incrementVersion(version) {
  const parts = version.split('.');
  parts[parts.length - 1] = parseInt(parts[parts.length - 1]) + 1;
  return parts.join('.');
}

main();
