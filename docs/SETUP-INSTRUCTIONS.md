# Detailed Setup Instructions

## Prerequisites

- GitHub account with admin access to ABC-Academy-of-Music organization
- Git installed locally
- Node.js 18+ installed (for local development)
- GitHub CLI (optional, for easier workflow management)

## Step-by-Step Setup

### 1. Create GitHub Repository

```bash
# Via GitHub Web UI
# Go to https://github.com/ABC-Academy-of-Music
# Click "New repository"
# Name: Hinna-API-Management-Swagger
# Visibility: Public (or Private based on preference)
# Initialize with README: No (we have our own)

# Via GitHub CLI
gh repo create ABC-Academy-of-Music/Hinna-API-Management-Swagger \
  --public \
  --description "Centralized API documentation for Hinna microservices"
```

### 2. Push Initial Code

```bash
cd ~/Hinna-API-Management-Swagger

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial setup: SwaggerUI + GitHub Actions automation"

# Add remote
git remote add origin https://github.com/ABC-Academy-of-Music/Hinna-API-Management-Swagger.git

# Push
git push -u origin main
```

### 3. Configure Repository Settings

#### Enable GitHub Pages

1. Go to repository Settings
2. Navigate to "Pages" in the left sidebar
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Save

#### Configure Actions Permissions

1. Go to repository Settings
2. Navigate to "Actions" → "General"
3. Under "Workflow permissions":
   - Select **"Read and write permissions"**
   - Check **"Allow GitHub Actions to create and approve pull requests"**
4. Save

### 4. Create GitHub Token (If Needed)

For cross-repository access:

```bash
# Via GitHub CLI
gh auth token

# Or via GitHub Web UI
# Settings → Developer settings → Personal access tokens → Fine-grained tokens
# Generate new token with:
# - Repository access: All repositories (or select specific ones)
# - Permissions:
#   - Contents: Read and write
#   - Metadata: Read
#   - Workflows: Read and write
```

Add token to repository secrets if needed:
1. Go to repository Settings
2. Navigate to "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `CROSS_REPO_TOKEN`
5. Value: Your token

### 5. Test Initial Setup

#### Trigger Periodic Scan

```bash
# Via GitHub CLI
gh workflow run periodic-scan.yml -R ABC-Academy-of-Music/Hinna-API-Management-Swagger

# Via Web UI
# Go to Actions tab
# Select "Periodic Repository Scan"
# Click "Run workflow"
# Click "Run workflow" button
```

#### Verify GitHub Pages Deployment

1. Go to Actions tab
2. Wait for "Deploy to GitHub Pages" workflow to complete
3. Visit: `https://ABC-Academy-of-Music.github.io/Hinna-API-Management-Swagger/`

### 6. Test Local Viewing

```bash
# Install dependencies
npm install

# View locally
open public/index.html

# Or use a local server
npx http-server public -p 8080
# Visit http://localhost:8080
```

### 7. Configure Other Hinna Repositories

For each Hinna repository, add notification workflow:

```bash
# Example for hinna-booking-service
cd /path/to/hinna-booking-service

# Create workflow directory
mkdir -p .github/workflows

# Create notification workflow
cat > .github/workflows/notify-api-docs.yml << 'EOF'
name: Notify API Documentation

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'api/**'
      - '**/swagger.yaml'
      - '**/openapi.yaml'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger API docs update
        run: |
          curl -X POST \
            -H "Accept: application/vnd.github.v3+json" \
            -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
            https://api.github.com/repos/ABC-Academy-of-Music/Hinna-API-Management-Swagger/dispatches \
            -d '{
              "event_type": "api-updated",
              "client_payload": {
                "repository": "${{ github.event.repository.name }}",
                "repository_url": "${{ github.event.repository.html_url }}",
                "sha": "${{ github.sha }}"
              }
            }'

      - name: Verify notification
        run: |
          echo "✅ API documentation update triggered"
          echo "Repository: ${{ github.event.repository.name }}"
          echo "Commit: ${{ github.sha }}"
EOF

# Commit and push
git add .github/workflows/notify-api-docs.yml
git commit -m "Add API documentation notification workflow"
git push
```

### 8. Verify End-to-End Flow

1. **Make a change in a Hinna repository:**
   ```bash
   cd /path/to/hinna-booking-service
   # Edit a file with API endpoints
   echo "// New endpoint comment" >> src/routes/bookings.js
   git add .
   git commit -m "Update booking routes"
   git push
   ```

2. **Verify notification workflow runs:**
   - Go to the Hinna repository Actions tab
   - Verify "Notify API Documentation" workflow ran

3. **Verify API docs update:**
   - Go to Hinna-API-Management-Swagger Actions tab
   - Verify "Monitor Hinna Repositories" workflow triggered
   - Check for commit updating swagger.yaml

4. **Verify deployment:**
   - Verify "Deploy to GitHub Pages" workflow ran
   - Visit GitHub Pages URL
   - Verify new endpoints appear

## Advanced Configuration

### Custom Scan Patterns

Edit `scripts/scan-repository.js` to add custom patterns:

```javascript
const routePatterns = [
  // Existing patterns...

  // Add custom patterns for your frameworks
  /app\.route\(['"]([^'"]+)['"]\)\.(\w+)\(/g,  // Flask
  /Route\(['"]([^'"]+)['"]\)\.Method\(['"](\w+)['"]\)/g,  // ASP.NET
];
```

### Exclude Repositories

Edit workflows to exclude specific repositories:

```yaml
# In .github/workflows/periodic-scan.yml
- name: List all Hinna repositories
  run: |
    node scripts/list-hinna-repos.js | \
      jq 'map(select(.name != "hinna-private-repo"))' > repos.json
```

### Custom Tags and Categories

Edit `public/swagger.yaml` to add custom organization:

```yaml
tags:
  - name: Authentication
    description: Auth-related endpoints
  - name: Bookings
    description: Booking management
  # Add your custom tags...
```

### Notification Filters

Customize which changes trigger notifications:

```yaml
# In other repos' .github/workflows/notify-api-docs.yml
on:
  push:
    branches: [main, develop]  # Add branches
    paths:
      - 'src/**/*.js'          # Specific file types
      - 'api/**'
      - '!**/*.test.js'        # Exclude test files
```

## Monitoring and Maintenance

### Check System Health

```bash
# Via GitHub CLI
gh run list -R ABC-Academy-of-Music/Hinna-API-Management-Swagger

# Check latest periodic scan
gh run view --repo ABC-Academy-of-Music/Hinna-API-Management-Swagger

# Download scan artifacts
gh run download <run-id> -R ABC-Academy-of-Music/Hinna-API-Management-Swagger
```

### Review Scan Results

```bash
# Clone repository
git clone https://github.com/ABC-Academy-of-Music/Hinna-API-Management-Swagger.git
cd Hinna-API-Management-Swagger

# View scan results
ls -la docs/*-scan.json
cat docs/hinna-booking-service-scan.json | jq
```

### Update Dependencies

```bash
# Update swagger-cli
npm update -g @apidevtools/swagger-cli

# Update Node.js packages
npm update

# Test after updates
swagger-cli validate public/swagger.yaml
```

## Troubleshooting

### Workflows Not Running

**Problem:** Workflows don't trigger automatically

**Solution:**
1. Check Actions permissions (step 3 above)
2. Verify workflow files are in `.github/workflows/`
3. Check workflow syntax with GitHub Actions validator

### Cross-Repo Notifications Failing

**Problem:** repository_dispatch events not received

**Solution:**
1. Verify GITHUB_TOKEN has correct permissions
2. Check organization settings allow Actions
3. Use fine-grained token with explicit permissions
4. Verify workflow event type matches: `api-updated`

### GitHub Pages 404 Error

**Problem:** GitHub Pages URL returns 404

**Solution:**
1. Wait 2-3 minutes after first deployment
2. Verify Settings → Pages shows deployment
3. Check Actions → "Deploy to GitHub Pages" succeeded
4. Try force refresh (Cmd+Shift+R)

### Scanner Not Finding Endpoints

**Problem:** Known endpoints not appearing in swagger.yaml

**Solution:**
1. Verify route patterns match your code style
2. Run scanner locally with debug output
3. Check file paths (scanner looks in `src/` by default)
4. Add logging to `scan-repository.js`

### OpenAPI Validation Errors

**Problem:** swagger-cli validate fails

**Solution:**
1. Check `fix-swagger.js` ran successfully
2. Manually review swagger.yaml structure
3. Use online validator: https://editor.swagger.io/
4. Check for duplicate operationIds

## Next Steps

1. ✅ Verify all Hinna repositories have notification workflows
2. ✅ Test end-to-end flow with a real change
3. ✅ Share GitHub Pages URL with team
4. ✅ Add custom tags and organization
5. ✅ Configure monitoring and alerts
6. ✅ Document API annotation standards for team

## Support

For issues:
1. Check GitHub Actions logs
2. Review troubleshooting section
3. Create issue in repository
4. Contact DevOps team

---

**Setup completed!** Your centralized API documentation system is now running.
