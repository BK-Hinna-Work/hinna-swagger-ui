#!/usr/bin/env node

/**
 * Fetch OpenAPI specs from local Hinna services
 *
 * This script fetches /v3/api-docs from all configured local services
 * and merges them into the central swagger.yaml
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yaml = require('js-yaml');

async function fetchSpec(service) {
  try {
    console.log(`Fetching ${service.name} from ${service.url}...`);
    const response = await axios.get(service.url, { timeout: 5000 });
    console.log(`✅ ${service.name}: ${Object.keys(response.data.paths || {}).length} paths found`);
    return {
      name: service.name,
      spec: response.data,
      port: service.port,
      description: service.description
    };
  } catch (error) {
    console.log(`⚠️  ${service.name}: ${error.message} (service may not be running)`);
    return null;
  }
}

function mergeSpecs(services) {
  const merged = {
    openapi: '3.0.3',
    info: {
      title: 'Hinna Platform API',
      description: 'Centralized API documentation for all Hinna microservices (Local Development)',
      version: '1.0.0',
      contact: {
        name: 'Hinna Development Team',
        url: 'https://github.com/BK-Hinna-Work'
      },
      'x-lastUpdated': new Date().toISOString()
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'API Gateway (main-interface)'
      }
    ],
    tags: [],
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {}
    }
  };

  for (const service of services) {
    if (!service || !service.spec) continue;

    // Add service tag
    merged.tags.push({
      name: service.name,
      description: `${service.description} (Port ${service.port})`,
      'x-port': service.port,
      'x-url': `http://localhost:${service.port}`
    });

    // Merge paths
    const paths = service.spec.paths || {};
    for (const [pathKey, pathValue] of Object.entries(paths)) {
      // Prefix path with service name to avoid conflicts
      const servicePath = `/api/${service.name}${pathKey}`;

      // Add service tag to all operations
      for (const [method, operation] of Object.entries(pathValue)) {
        if (typeof operation === 'object' && operation !== null) {
          operation.tags = [service.name, ...(operation.tags || [])];
          operation['x-service'] = service.name;
          operation['x-port'] = service.port;
        }
      }

      merged.paths[servicePath] = pathValue;
    }

    // Merge schemas
    if (service.spec.components?.schemas) {
      Object.assign(merged.components.schemas, service.spec.components.schemas);
    }

    // Merge security schemes
    if (service.spec.components?.securitySchemes) {
      Object.assign(merged.components.securitySchemes, service.spec.components.securitySchemes);
    }
  }

  return merged;
}

async function main() {
  const reposFile = path.join(__dirname, '..', 'repos.json');

  if (!fs.existsSync(reposFile)) {
    console.error('❌ repos.json not found');
    process.exit(1);
  }

  const repos = JSON.parse(fs.readFileSync(reposFile, 'utf-8'));
  console.log(`\n📡 Fetching specs from ${repos.length} services...\n`);

  // Fetch all specs in parallel
  const results = await Promise.all(repos.map(fetchSpec));
  const successfulFetches = results.filter(r => r !== null);

  console.log(`\n✅ Successfully fetched ${successfulFetches.length}/${repos.length} services\n`);

  if (successfulFetches.length === 0) {
    console.error('❌ No services were reachable. Make sure services are running.');
    process.exit(1);
  }

  // Merge specs
  const merged = mergeSpecs(successfulFetches);

  // Write to public/swagger.yaml
  const outputPath = path.join(__dirname, '..', 'public', 'swagger.yaml');
  const yamlContent = yaml.dump(merged, {
    indent: 2,
    lineWidth: 120,
    noRefs: true
  });

  fs.writeFileSync(outputPath, yamlContent, 'utf-8');

  console.log(`✅ Merged spec written to ${outputPath}`);
  console.log(`📊 Total paths: ${Object.keys(merged.paths).length}`);
  console.log(`📊 Total schemas: ${Object.keys(merged.components.schemas).length}`);
  console.log(`📊 Total tags: ${merged.tags.length}`);
  console.log('\n🚀 Run "npm run serve" to view in Swagger UI');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
