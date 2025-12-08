# Hinna SwaggerUI - Local Development Setup

**Purpose:** Centralized API documentation aggregator for all 19 Hinna microservices

**Repository:** https://github.com/BK-Hinna-Work/Hinna-API-Management-Swagger

---

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/barnabykerekes/Desktop/BK-Hinna-Work/hinna-swagger-ui
npm install
```

### 2. Start Your Microservices

Each service must have `springdoc-openapi-starter-webmvc-api` dependency and expose `/v3/api-docs`:

```bash
# Example: Start hinna-users-login
cd ../hinna-users-login
./gradlew bootRun

# Verify OpenAPI spec is available
curl http://localhost:8081/v3/api-docs
```

### 3. Fetch Specs from Running Services

```bash
npm run fetch-local
```

This will:
- Connect to all 19 services listed in `repos.json`
- Fetch their OpenAPI specs from `/v3/api-docs` endpoints
- Merge them into `public/swagger.yaml`
- Report which services are running vs. not reachable

### 4. View Aggregated Documentation

```bash
npm run serve
```

Then open: http://localhost:8080

---

## Configuration

### repos.json

List of all 19 Hinna services with their localhost URLs:

```json
[
  {
    "name": "hinna-users-login",
    "port": 8081,
    "url": "http://localhost:8081/v3/api-docs",
    "description": "Authentication & Users"
  },
  ...
]
```

To add/modify a service:
1. Edit `repos.json`
2. Run `npm run fetch-local` to update the aggregated spec

---

## Service Requirements

For a service to appear in the centralized SwaggerUI:

1. **Dependency:** Must have `springdoc-openapi-starter-webmvc-api` (spec only, NO UI)

**Maven:**
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-api</artifactId>
    <version>2.3.0</version>
</dependency>
```

**Gradle:**
```gradle
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-api:2.3.0'
```

2. **Annotations:** Controllers annotated with @Tag, @Operation, @ApiResponse

3. **Running:** Service must be running on its configured port

---

## Architecture

### Centralized UI Approach

- **ONE Swagger UI** (this repo) - aggregates all service specs
- **19 microservices** - each generates OpenAPI spec only (NO UI overhead)
- **Localhost URLs** - all services run on configured ports (8080-8096, 3000-3001)

### Workflow

```
┌─────────────────┐
│ hinna-users    │ :8081/v3/api-docs ─┐
├─────────────────┤                     │
│ hinna-payments │ :8082/v3/api-docs ─┤
├─────────────────┤                     │
│ hinna-booking  │ :8083/v3/api-docs ─┤
├─────────────────┤                     ├──> fetch-local-specs.js
│ ... (16 more)  │                     │         │
└─────────────────┘                     │         ▼
                                        │   public/swagger.yaml
                                        │         │
                                        └─────────┤
                                                  ▼
                                            Swagger UI
                                         (localhost:8080)
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run fetch-local` | Fetch specs from all running services |
| `npm run serve` | Start Swagger UI on port 8080 |
| `npm run validate` | Validate merged swagger.yaml |
| `npm test` | Run validation tests |

---

## Troubleshooting

### "Service not reachable" Errors

If `npm run fetch-local` shows warnings like "⚠️ hinna-chat: connect ECONNREFUSED":

1. **Check if service is running:**
   ```bash
   lsof -i :8084  # Check if port 8084 is in use
   ```

2. **Start the service:**
   ```bash
   cd ../hinna-chat
   ./gradlew bootRun
   ```

3. **Verify OpenAPI endpoint:**
   ```bash
   curl http://localhost:8084/v3/api-docs
   ```

### "No springdoc-openapi dependency" Error

Add the dependency to the service's build file:

```gradle
// build.gradle
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-api:2.3.0'
```

Then restart the service.

### Swagger UI Shows Old Data

Re-fetch the specs:
```bash
npm run fetch-local && npm run serve
```

---

## Development Workflow

### When Adding a New Endpoint

1. Annotate the new endpoint in your service:
   ```java
   @Tag(name = "Users")
   @Operation(summary = "Create user")
   @ApiResponse(responseCode = "201", description = "User created")
   @PostMapping("/api/users")
   public ResponseEntity<User> createUser(@RequestBody User user) {
       // ...
   }
   ```

2. Restart your service

3. Re-fetch specs:
   ```bash
   cd ../hinna-swagger-ui
   npm run fetch-local
   ```

4. Refresh Swagger UI (http://localhost:8080)

### When Adding a New Service

1. Add entry to `repos.json`:
   ```json
   {
     "name": "hinna-new-service",
     "port": 8097,
     "url": "http://localhost:8097/v3/api-docs",
     "description": "New Service Description"
   }
   ```

2. Run fetch:
   ```bash
   npm run fetch-local
   ```

---

## Differences from ABC-Academy Version

| Feature | ABC-Academy (Production) | BK-Hinna-Work (Local) |
|---------|--------------------------|------------------------|
| **Deployment** | GitHub Pages + AWS | Local only |
| **Auto-Discovery** | GitHub API scanning | Manual localhost fetch |
| **Service URLs** | api.hinna.dev | localhost:8080-8096 |
| **CI/CD** | GitHub Actions workflows | None (local development) |
| **Authentication** | Production auth | None |

---

## No Synchronization

**IMPORTANT:** This local setup does NOT synchronize with:
- ABC-Academy-of-Music GitHub workspace
- AWS deployments
- Production APIs

This is intentional - it's for local development only.

---

## Files Modified for Local Use

1. **repos.json** - Created with 19 localhost service URLs
2. **scripts/fetch-local-specs.js** - New script for localhost fetching
3. **package.json** - Updated repository URLs to BK-Hinna-Work
4. **git remote** - Changed from ABC-Academy to BK-Hinna-Work
5. **.github/workflows/** - Can be deleted (not needed for local use)

---

## Next Steps

1. ✅ SwaggerUI repo configured for local use
2. ⏳ Add `-api` dependency to all 19 services
3. ⏳ Annotate all controllers with Swagger annotations
4. ⏳ Test fetch-local with all running services
5. ⏳ Verify aggregated documentation in Swagger UI

See: `/Users/barnabykerekes/Desktop/BK-Hinna-Work/docs/SWAGGER-ROLLOUT-PLAN.md`

---

**Last Updated:** 2025-12-08
**Status:** Configured for local development
**Repository:** https://github.com/BK-Hinna-Work/Hinna-API-Management-Swagger
