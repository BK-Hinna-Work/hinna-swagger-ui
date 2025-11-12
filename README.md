# Hinna API Management - Swagger Documentation

Centralized API documentation system that automatically discovers and aggregates API endpoints from all Hinna microservices.

## 🎯 Overview

This repository serves as the single source of truth for all Hinna API documentation. It automatically:
- 📡 Monitors all repositories containing "hinna" or "Hinna" in their names
- 🔍 Discovers API endpoints from code and existing OpenAPI specs
- 📝 Updates the central OpenAPI/Swagger specification
- 🚀 Deploys documentation to GitHub Pages
- ⏰ Runs periodic scans every 6 hours

## 🌐 View Documentation

**Live Documentation:** [https://yourusername.github.io/Hinna-API-Management-Swagger/](https://yourusername.github.io/Hinna-API-Management-Swagger/)

**Local Viewing:**
```bash
# Option 1: Open directly in browser
open public/index.html

# Option 2: Use a local server
npx http-server public
# Then visit http://localhost:8080
```

## 🚀 Quick Start

### Initial Setup

1. **Clone this repository:**
   ```bash
   git clone https://github.com/ABC-Academy-of-Music/Hinna-API-Management-Swagger.git
   cd Hinna-API-Management-Swagger
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   npm install -g @apidevtools/swagger-cli
   npm install js-yaml axios @octokit/rest
   ```

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - The documentation will be automatically deployed on every update

4. **Configure GitHub Actions:**
   - Go to Settings → Actions → General
   - Enable "Read and write permissions" for GITHUB_TOKEN
   - Save

## 📋 How It Works

### Automatic Discovery

The system discovers API endpoints through multiple methods:

1. **Existing OpenAPI Specifications:**
   - Finds `swagger.yaml`, `swagger.json`, `openapi.yaml`, etc.
   - Merges them into the central specification

2. **Code Analysis:**
   - Scans source code for route definitions
   - Supports Express.js, Spring Boot, FastAPI patterns
   - Example patterns detected:
     ```javascript
     router.get('/api/users', ...)
     router.post('/api/bookings', ...)
     ```

3. **Code Annotations:**
   - JSDoc comments with API documentation
   - Decorators and annotations
   - Inline documentation

### Automation Workflows

#### 1. Repository Dispatch (Real-time Updates)
Triggered when other Hinna repos send update notifications.

**Setup in your microservice repository:**
```yaml
# .github/workflows/notify-api-docs.yml
name: Notify API Documentation

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'api/**'

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
```

#### 2. Periodic Scan (Every 6 Hours)
Automatically scans all Hinna repositories every 6 hours.

- **Schedule:** `0 */6 * * *` (every 6 hours)
- **Discovers:** New repositories, changed endpoints
- **Updates:** Central swagger.yaml with all findings

#### 3. GitHub Pages Deployment
Automatically deploys to GitHub Pages when swagger.yaml changes.

## 🛠️ Manual Operations

### Trigger Manual Scan

```bash
# Via GitHub CLI
gh workflow run periodic-scan.yml

# Via GitHub Actions UI
# Go to Actions → Periodic Repository Scan → Run workflow
```

### Scan Specific Repository

```bash
# Via GitHub CLI
gh workflow run monitor-repos.yml -f repo_name=hinna-booking-service

# Via GitHub Actions UI
# Go to Actions → Monitor Hinna Repositories → Run workflow
# Enter repository name
```

### Local Development

```bash
# Scan a specific repository locally
REPO_NAME=hinna-booking-service \
GH_TOKEN=your_token \
node scripts/scan-repository.js

# Update swagger.yaml with scan results
node scripts/update-swagger.js

# Validate the OpenAPI spec
swagger-cli validate public/swagger.yaml

# View locally
open public/index.html
```

## 📝 Annotating Your API Code

To ensure your API endpoints are properly discovered, follow these patterns:

### Express.js / Node.js

```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/api/users', (req, res) => {
  // handler
});

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 */
router.post('/api/bookings', (req, res) => {
  // handler
});
```

### Spring Boot / Java

```java
/**
 * Get all users
 *
 * @return List of users
 */
@GetMapping("/api/users")
@Operation(summary = "Get all users", tags = {"Users"})
public ResponseEntity<List<User>> getAllUsers() {
    // implementation
}

/**
 * Create a booking
 *
 * @param booking Booking details
 * @return Created booking
 */
@PostMapping("/api/bookings")
@Operation(summary = "Create a booking", tags = {"Bookings"})
public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
    // implementation
}
```

### FastAPI / Python

```python
@app.get("/api/users", tags=["Users"], summary="Get all users")
async def get_users():
    """
    Get all users

    Returns:
        List of all users in the system
    """
    pass

@app.post("/api/bookings", tags=["Bookings"], summary="Create a booking")
async def create_booking(booking: BookingCreate):
    """
    Create a new booking

    Args:
        booking: Booking details

    Returns:
        Created booking with ID
    """
    pass
```

## 📊 Monitoring and Reports

### View Scan Results

Scan results are saved as artifacts in GitHub Actions:

1. Go to Actions → Recent workflow run
2. Scroll to "Artifacts" section
3. Download `scan-results-{run-number}`

### Change Reports

Each update includes a change report showing:
- Number of endpoints added
- Number of endpoints modified
- Number of endpoints removed
- Affected repositories

## 🔧 Configuration

### Customize Scan Frequency

Edit `.github/workflows/periodic-scan.yml`:

```yaml
on:
  schedule:
    # Change to desired frequency
    - cron: '0 */6 * * *'  # Every 6 hours
    # - cron: '0 */12 * * *'  # Every 12 hours
    # - cron: '0 0 * * *'     # Daily at midnight
```

### Customize Discovery Patterns

Edit `scripts/scan-repository.js`:

```javascript
const routePatterns = [
  // Add your custom patterns here
  /your_custom_pattern/g,
];
```

### Customize Organization

Edit workflow files to change the organization:

```yaml
env:
  GITHUB_ORG: ABC-Academy-of-Music  # Change to your org
```

## 🤝 Team Access

### For Developers

1. **View Documentation:**
   - Visit the GitHub Pages URL (see above)
   - Or clone repo and open `public/index.html`

2. **Trigger Updates:**
   - Push changes to any Hinna repository (automatic)
   - Or manually trigger workflows from GitHub Actions

3. **Add New Service:**
   - Name your repository with "hinna" or "Hinna"
   - Add API annotations (see above)
   - Push to main branch
   - Documentation updates automatically

### For API Consumers

1. **Explore APIs:**
   - Visit the GitHub Pages URL
   - Use the search and filter features
   - Try out endpoints directly in the UI (if enabled)

2. **Download Specification:**
   - Click "Download" button in SwaggerUI
   - Or download directly: [swagger.yaml](./public/swagger.yaml)

## 🔒 Security

- API keys and secrets should never be committed
- Use GitHub Secrets for sensitive tokens
- The swagger.yaml is public (adjust as needed)
- Audit endpoint discovery to ensure no sensitive info is exposed

## 📚 Additional Resources

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [SwaggerUI Documentation](https://swagger.io/tools/swagger-ui/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🐛 Troubleshooting

### Workflow Fails

1. **Check permissions:**
   - Settings → Actions → General
   - Ensure "Read and write permissions" is enabled

2. **Check token scope:**
   - GITHUB_TOKEN needs repo and workflow access

3. **Check logs:**
   - Go to Actions → Failed workflow
   - Review error messages

### Endpoints Not Discovered

1. **Check route patterns:**
   - Ensure your code matches supported patterns
   - Add custom patterns if needed

2. **Check file locations:**
   - Scanner looks in `src/` directory
   - Add additional directories in `scan-repository.js`

3. **Manual verification:**
   - Run scanner locally with debug output

### GitHub Pages Not Updating

1. **Check workflow:**
   - Ensure deploy-pages.yml workflow succeeded

2. **Check Pages settings:**
   - Settings → Pages
   - Source should be "GitHub Actions"

3. **Wait for deployment:**
   - Can take 1-2 minutes after workflow completes

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues and questions:
- Create an issue in this repository
- Contact the Hinna development team

---

**Last Updated:** Auto-generated by GitHub Actions
