/**
 * API Documentation Endpoint
 *
 * Serves interactive Swagger UI for MetaBuilder API
 * Visit: http://localhost:3000/api/docs
 *
 * Features:
 * - Interactive API exploration
 * - Request/response examples
 * - Parameter validation
 * - Authentication support
 */

/**
 * Generate Swagger UI HTML
 */
function generateSwaggerHTML(specUrl: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>MetaBuilder API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
    <style>
      html {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *, *:before, *:after {
        box-sizing: inherit;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .topbar {
        background-color: #1e1e1e;
        padding: 10px 0;
        text-align: center;
        border-bottom: 1px solid #ccc;
      }
      .topbar h1 {
        margin: 0;
        color: #fff;
        font-size: 24px;
        font-weight: 500;
      }
      .topbar a {
        color: #61affe;
        text-decoration: none;
        margin-left: 20px;
      }
    </style>
  </head>
  <body>
    <div class="topbar">
      <h1>🔨 MetaBuilder API Documentation</h1>
      <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">
        RESTful API for multi-tenant no-code platform
      </p>
    </div>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.js"></script>
    <script>
      window.onload = function() {
        SwaggerUIBundle({
          url: "${specUrl}",
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
          ],
          layout: "BaseLayout",
          requestInterceptor: (request) => {
            // Automatically include session cookie in requests
            request.credentials = 'include'
            return request
          }
        })
      }
    </script>
  </body>
</html>
`
}


/**
 * GET /api/docs - Swagger UI
 *
 * Returns interactive API documentation
 */
export async function GET() {
  const html = generateSwaggerHTML('/api/docs/openapi.json')

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  })
}

/**
 * This endpoint is also registered at:
 * POST /api/docs/openapi.json - Returns raw OpenAPI specification
 *
 * Note: openapi.json is a static file served directly
 */

/**
 * API Documentation Quick Reference
 *
 * Base URL:
 *   http://localhost:3000
 *   https://metabuilder.example.com (production)
 *
 * Main Routes:
 *   GET  /api/v1/{tenant}/{package}/{entity}              List entities
 *   POST /api/v1/{tenant}/{package}/{entity}              Create entity
 *   GET  /api/v1/{tenant}/{package}/{entity}/{id}         Get entity
 *   PUT  /api/v1/{tenant}/{package}/{entity}/{id}         Update entity
 *   DELETE /api/v1/{tenant}/{package}/{entity}/{id}       Delete entity
 *   POST /api/v1/{tenant}/{package}/{entity}/{id}/{action} Custom action
 *
 * System Routes:
 *   POST /api/bootstrap                                   Bootstrap system
 *   GET  /api/health                                      Health check
 *
 * Authentication:
 *   Cookie: mb_session (set by login endpoint)
 *
 * Rate Limiting:
 *   Login:      5 attempts/minute per IP
 *   Register:   3 attempts/minute per IP
 *   List:       100 requests/minute per IP
 *   Mutation:   50 requests/minute per IP
 *   Bootstrap:  1 attempt/hour per IP
 *
 * Response Codes:
 *   200  - Success
 *   201  - Created
 *   400  - Bad Request
 *   401  - Unauthorized
 *   403  - Forbidden
 *   404  - Not Found
 *   429  - Too Many Requests (rate limited)
 *   500  - Internal Server Error
 *
 * Examples:
 *
 *   1. List posts from forum_forge package
 *      GET /api/v1/acme/forum_forge/posts
 *
 *   2. Create a new post
 *      POST /api/v1/acme/forum_forge/posts
 *      Content-Type: application/json
 *      {
 *        "title": "Hello World",
 *        "content": "Welcome to MetaBuilder"
 *      }
 *
 *   3. Get specific post
 *      GET /api/v1/acme/forum_forge/posts/post_123
 *
 *   4. Update post
 *      PUT /api/v1/acme/forum_forge/posts/post_123
 *      {
 *        "title": "Updated Title"
 *      }
 *
 *   5. Delete post
 *      DELETE /api/v1/acme/forum_forge/posts/post_123
 *
 *   6. Execute custom action (like/publish/archive)
 *      POST /api/v1/acme/forum_forge/posts/post_123/like
 *
 * Multi-Tenant:
 *   All operations are isolated by tenant (organization).
 *   Users can only access their own tenant unless they are admin/god.
 *
 * Security:
 *   - All endpoints require authentication (except public pages)
 *   - Rate limiting prevents brute-force and DoS attacks
 *   - Multi-tenant isolation ensures data privacy
 *   - CORS policy prevents unauthorized access
 */
