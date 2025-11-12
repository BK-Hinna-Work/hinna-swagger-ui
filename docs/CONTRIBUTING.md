# Contributing to Hinna API Management

Thank you for contributing to the Hinna API documentation system!

## How to Contribute

### Improving Documentation

1. **Fix errors in swagger.yaml:**
   - Edit `public/swagger.yaml` directly
   - Validate with `swagger-cli validate public/swagger.yaml`
   - Submit pull request

2. **Update README:**
   - Edit `README.md` or documentation files
   - Follow existing format and style
   - Submit pull request

### Enhancing Scanner

1. **Add new route patterns:**
   - Edit `scripts/scan-repository.js`
   - Add patterns to `routePatterns` array
   - Test with existing repositories
   - Submit pull request with examples

2. **Support new frameworks:**
   - Research framework's routing syntax
   - Add detection patterns
   - Add documentation for the framework
   - Test thoroughly
   - Submit pull request

### Improving Workflows

1. **Optimize scan performance:**
   - Profile current performance
   - Identify bottlenecks
   - Implement improvements
   - Test with large repositories
   - Submit pull request with benchmarks

2. **Add new automation:**
   - Create new workflow file
   - Document purpose and triggers
   - Test in fork first
   - Submit pull request with documentation

## Development Setup

```bash
# Clone repository
git clone https://github.com/ABC-Academy-of-Music/Hinna-API-Management-Swagger.git
cd Hinna-API-Management-Swagger

# Install dependencies
npm install

# Run tests (if you add them)
npm test

# Validate swagger.yaml
swagger-cli validate public/swagger.yaml
```

## Testing Changes

### Test Scanner Locally

```bash
# Set environment variables
export GH_TOKEN=your_token
export GITHUB_ORG=ABC-Academy-of-Music
export REPO_NAME=hinna-booking-service

# Run scanner
node scripts/scan-repository.js

# Check output
cat docs/hinna-booking-service-scan.json
```

### Test Swagger Update

```bash
# Run update script
node scripts/update-swagger.js

# Validate result
swagger-cli validate public/swagger.yaml

# View changes
git diff public/swagger.yaml
```

### Test Locally

```bash
# View in browser
open public/index.html

# Or use local server
npx http-server public
```

## Code Style

### JavaScript

- Use ES6+ features
- Use async/await for asynchronous code
- Add JSDoc comments for functions
- Use meaningful variable names
- Keep functions small and focused

```javascript
/**
 * Scan a repository for API endpoints
 *
 * @param {string} repoName - Name of the repository
 * @returns {Promise<Object>} Scan results
 */
async function scanRepository(repoName) {
  // Implementation
}
```

### YAML

- Use 2-space indentation
- Keep lines under 120 characters
- Group related fields together
- Add comments for complex sections

```yaml
# Authentication endpoints
paths:
  /api/auth/login:
    post:
      summary: User login
      # Additional details...
```

### GitHub Actions

- Use descriptive job and step names
- Add comments for complex logic
- Use checkout@v4 (latest versions)
- Use environment variables for configuration

```yaml
- name: Scan repository for API endpoints
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    # Scan the repository
    node scripts/scan-repository.js
```

## Pull Request Process

1. **Fork the repository**

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes:**
   - Follow code style guidelines
   - Add tests if applicable
   - Update documentation

4. **Test thoroughly:**
   - Validate swagger.yaml
   - Test scanner with multiple repositories
   - Test workflows in your fork

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: Add support for Flask route patterns"
   ```

6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Submit pull request:**
   - Clear title and description
   - Reference related issues
   - Include testing evidence
   - Add screenshots if applicable

## Commit Message Format

Use conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(scanner): Add support for Flask route patterns

- Added regex pattern for Flask routes
- Updated scanner tests
- Added Flask example to documentation

feat(workflow): Add retry logic for failed scans

fix(scanner): Fix duplicate endpoint detection

docs(readme): Update setup instructions for Windows
```

## Reporting Issues

When reporting issues, include:

1. **Clear description** of the problem
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** (if applicable)
6. **Environment details:**
   - Node.js version
   - Operating system
   - Repository being scanned

**Example:**

```markdown
## Issue: Scanner not detecting Spring Boot endpoints

**Description:**
Scanner fails to detect Spring Boot @GetMapping annotations

**Steps to Reproduce:**
1. Run scanner on hinna-java-service
2. Check scan results
3. No endpoints found

**Expected:**
Should find @GetMapping("/api/users")

**Actual:**
No endpoints detected

**Environment:**
- Node.js: 20.5.0
- OS: macOS 14.0
- Repository: hinna-java-service

**Code Sample:**
```java
@GetMapping("/api/users")
public List<User> getUsers() { ... }
```
```

## Feature Requests

When requesting features, include:

1. **Clear description** of the feature
2. **Use case** explaining why it's needed
3. **Proposed solution** (if you have one)
4. **Alternatives considered**

## Security Issues

**Do not open public issues for security vulnerabilities.**

Instead:
1. Email security@hinnaapp.com
2. Include detailed description
3. Include steps to reproduce
4. Wait for response before public disclosure

## Code Review Process

All submissions require review:

1. **Automated checks:**
   - Linting passes
   - Tests pass (if applicable)
   - OpenAPI validation passes

2. **Manual review:**
   - Code quality
   - Documentation completeness
   - Test coverage
   - Performance impact

3. **Approval:**
   - At least one maintainer approval required
   - Address all review comments
   - Rebase on main if needed

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

## Questions?

- Create a discussion in the repository
- Ask in the team Slack channel
- Email the maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping improve Hinna API Management! 🎉
