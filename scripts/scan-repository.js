#!/usr/bin/env node

/**
 * Scan a repository for API endpoints
 *
 * This script analyzes a repository to discover API endpoints from:
 * - OpenAPI/Swagger specifications
 * - Code annotations (JSDoc, decorators)
 * - Route definitions
 * - Comments with API documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_NAME = process.env.REPO_NAME;
const GH_TOKEN = process.env.GH_TOKEN;
const GITHUB_ORG = process.env.GITHUB_ORG || 'ABC-Academy-of-Music';

async function cloneRepository(repoName) {
  const tempDir = `/tmp/${repoName}-${Date.now()}`;

  try {
    console.log(`Cloning repository: ${repoName}`);
    execSync(
      `git clone https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_ORG}/${repoName}.git ${tempDir}`,
      { stdio: 'inherit' }
    );
    return tempDir;
  } catch (error) {
    console.error(`Failed to clone repository: ${error.message}`);
    return null;
  }
}

function findApiFiles(dir) {
  const apiFiles = [];
  const patterns = [
    'swagger.yaml',
    'swagger.json',
    'openapi.yaml',
    'openapi.json',
    'api-docs.yaml',
    'api-docs.json'
  ];

  function searchDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        searchDir(fullPath);
      } else if (patterns.some(pattern => file.toLowerCase().includes(pattern.toLowerCase()))) {
        apiFiles.push(fullPath);
      }
    }
  }

  searchDir(dir);
  return apiFiles;
}

function extractEndpointsFromCode(dir) {
  const endpoints = [];

  // Patterns to match in code
  const routePatterns = [
    // Express.js routes
    /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g,
    // Spring Boot annotations
    /@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)\(['"]([^'"]+)['"]/g,
    // FastAPI routes
    /@app\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g,
  ];

  function scanFile(filePath) {
    if (!filePath.match(/\.(js|ts|java|py)$/)) return;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      for (const pattern of routePatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          endpoints.push({
            method: match[1].toLowerCase(),
            path: match[2],
            file: filePath.replace(dir, ''),
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  function searchDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        searchDir(fullPath);
      } else {
        scanFile(fullPath);
      }
    }
  }

  searchDir(path.join(dir, 'src'));
  return endpoints;
}

async function main() {
  if (!REPO_NAME) {
    console.log('No repository specified, skipping scan');
    return;
  }

  console.log(`Scanning repository: ${REPO_NAME}`);

  const repoDir = await cloneRepository(REPO_NAME);
  if (!repoDir) {
    console.error('Failed to clone repository');
    process.exit(1);
  }

  try {
    // Find existing API documentation files
    const apiFiles = findApiFiles(repoDir);
    console.log(`Found ${apiFiles.length} API documentation files`);

    // Extract endpoints from code
    const codeEndpoints = extractEndpointsFromCode(repoDir);
    console.log(`Found ${codeEndpoints.length} endpoints in code`);

    // Save results
    const results = {
      repository: REPO_NAME,
      timestamp: new Date().toISOString(),
      apiFiles: apiFiles.map(f => f.replace(repoDir, '')),
      endpoints: codeEndpoints,
    };

    const outputPath = path.join(process.cwd(), 'docs', `${REPO_NAME}-scan.json`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`Scan results saved to: ${outputPath}`);
  } finally {
    // Clean up
    execSync(`rm -rf ${repoDir}`, { stdio: 'inherit' });
  }
}

main().catch(error => {
  console.error('Scan failed:', error);
  process.exit(1);
});
