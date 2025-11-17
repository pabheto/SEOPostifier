# Quick Setup Guide

## What Was Created

### 1. WordPress Plugin: `seo-postifier`
Location: `wordpress-instance/wp-content/plugins/seo-postifier/`

**Structure:**
```
seo-postifier/
├── seo-postifier.php      # Main plugin file
├── templates/
│   └── admin-page.php     # Admin interface
├── assets/
│   ├── css/
│   │   └── admin.css      # Admin styles
│   └── js/
│       └── admin.js       # Admin JavaScript (AJAX handlers)
└── README.md              # Plugin documentation
```

**Features:**
- WordPress admin menu integration
- Backend connection testing
- AJAX-powered UI
- Environment-based backend URL configuration

### 2. NestJS Backend Configuration
Location: `seo-backend/`

**Changes Made:**
- ✅ Configured to run on port 4000 (main.ts:13)
- ✅ Added CORS support for WordPress (main.ts:8-11)
- ✅ Created `/hello` endpoint (app.controller.ts:13-21)
- ✅ Added Dockerfile for containerization
- ✅ Added .dockerignore
- ✅ Added .env.example

### 3. Docker Configuration
Updated `docker-compose.yml` to include the backend service.

## Quick Start

### Option 1: Local Development (Backend Only)

1. **Start the backend:**
   ```bash
   cd seo-backend
   pnpm run start:dev
   ```

2. **Verify it's running:**
   ```bash
   curl http://localhost:4000/hello
   ```

   Expected response:
   ```json
   {
     "message": "Hello from SEO Backend!",
     "status": "connected",
     "timestamp": "2025-11-17T...",
     "version": "1.0.0"
   }
   ```

3. **Activate WordPress plugin:**
   - Go to WordPress Admin → Plugins
   - Activate "SEO Postifier"
   - Navigate to "SEO Postifier" menu
   - Click "Test Connection" button

### Option 2: Using Docker

```bash
# Start all services (MySQL, phpMyAdmin, WordPress, Backend)
docker-compose up -d

# View backend logs
docker-compose logs -f seo-backend

# Stop all services
docker-compose down
```

## Testing the Connection

### From Command Line:
```bash
curl http://localhost:4000/hello
```

### From WordPress:
1. Login to WordPress admin
2. Go to "SEO Postifier" menu
3. Click "Test Connection" button
4. You should see: "Connected successfully!"

## Backend Endpoints

### Current Endpoints:
- `GET /` - Root endpoint (Hello World)
- `GET /hello` - Connection test endpoint

### Response Format:
```json
{
  "message": "Hello from SEO Backend!",
  "status": "connected",
  "timestamp": "2025-11-17T15:21:49.766Z",
  "version": "1.0.0"
}
```

## Configuration

### Backend URL
The plugin defaults to `http://localhost:4000`. To change:

**Method 1:** Environment variable
```bash
export SEO_BACKEND_URL=http://your-url:4000
```

**Method 2:** WordPress wp-config.php
```php
define('SEO_POSTIFIER_BACKEND_URL', 'http://your-url:4000');
```

### Backend Port
To change the backend port, edit `seo-backend/src/main.ts:13`:
```typescript
const port = process.env.PORT ?? 4000;
```

Or set the `PORT` environment variable:
```bash
PORT=5000 pnpm run start:dev
```

## Plugin Architecture

### Main Plugin Class
Located in `seo-postifier.php:32`

Key methods:
- `add_admin_menu()` - Registers WordPress admin menu
- `enqueue_admin_scripts()` - Loads CSS/JS assets
- `test_backend_connection()` - AJAX handler for connection test
- `make_backend_request()` - Generic API request method

### Admin Interface
Located in `templates/admin-page.php`

Features:
- Connection status display
- Backend URL configuration display
- Post generation form (ready for implementation)

### JavaScript Integration
Located in `assets/js/admin.js`

Uses WordPress AJAX API with:
- Nonce verification
- Error handling
- Success/error UI feedback

## Next Steps

### Immediate:
1. Test the connection from WordPress admin
2. Verify both endpoints work correctly
3. Check CORS is properly configured

### Future Development:
1. Implement AI content generation endpoint
2. Add SEO analysis features
3. Create post generation logic in WordPress
4. Add configuration settings page
5. Implement keyword research integration

## Troubleshooting

### Backend won't start:
```bash
# Check if port 4000 is in use
lsof -i :4000

# Kill the process if needed
kill -9 <PID>
```

### CORS errors:
Check `seo-backend/src/main.ts:8-11` for CORS configuration.

### Plugin not visible in WordPress:
```bash
# Verify plugin directory exists
ls -la wordpress-instance/wp-content/plugins/seo-postifier/
```

### Connection test fails:
1. Ensure backend is running: `curl http://localhost:4000/hello`
2. Check browser console for errors
3. Verify AJAX URL in WordPress admin

## Verified Working ✅

- ✅ Backend starts successfully on port 4000
- ✅ `/hello` endpoint returns correct JSON response
- ✅ CORS is enabled for WordPress integration
- ✅ Plugin structure is complete and ready to activate
- ✅ Docker configuration is ready to use

## Support Files Created

1. `README.md` - Main project documentation
2. `SETUP.md` - This setup guide (you're reading it!)
3. `seo-backend/Dockerfile` - Docker container definition
4. `seo-backend/.dockerignore` - Docker ignore rules
5. `seo-backend/.env.example` - Environment variable template
6. `wordpress-instance/wp-content/plugins/seo-postifier/README.md` - Plugin docs
