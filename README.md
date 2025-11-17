# SEO CopyWriter WP

An automated WordPress post generation system with SEO optimizations, powered by AI and NestJS backend.

## Project Structure

```
SEOCopyWriterWP/
├── wordpress-instance/          # WordPress installation
│   └── wp-content/
│       └── plugins/
│           └── seo-postifier/   # WordPress plugin
├── seo-backend/                 # NestJS backend API
├── docker/                      # Docker configuration
└── docker-compose.yml           # Docker Compose setup
```

## Components

### 1. WordPress Plugin (seo-postifier)
Located in `wordpress-instance/wp-content/plugins/seo-postifier/`

A WordPress plugin that provides:
- Admin interface for post generation
- Backend API integration
- SEO optimization features

### 2. NestJS Backend (seo-backend)
Located in `seo-backend/`

A NestJS backend that handles:
- AI-powered content generation
- SEO optimization logic
- API endpoints for WordPress integration

**Default Port**: 4000

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local backend development)
- pnpm (for backend dependencies)

### Development Setup

#### Option 1: Using Docker (Recommended)

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Access WordPress**:
   - WordPress: http://localhost:8000
   - phpMyAdmin: http://localhost:8080
   - Backend API: http://localhost:4000

3. **Activate the plugin**:
   - Login to WordPress admin
   - Navigate to Plugins → Installed Plugins
   - Activate "SEO Postifier"

#### Option 2: Local Backend Development

1. **Install backend dependencies**:
   ```bash
   cd seo-backend
   pnpm install
   ```

2. **Start the backend**:
   ```bash
   pnpm run start:dev
   ```
   The backend will run on http://localhost:4000

3. **Set up WordPress** (if not using Docker):
   - Configure your local WordPress installation
   - Copy the plugin to `wp-content/plugins/seo-postifier/`
   - Activate the plugin

## Backend API Endpoints

### Test Endpoint
- **GET** `/hello` - Test backend connectivity
  ```json
  {
    "message": "Hello from SEO Backend!",
    "status": "connected",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
  ```

## Plugin Usage

1. Navigate to **SEO Postifier** in WordPress admin menu
2. Click **Test Connection** to verify backend connectivity
3. Use the form to generate SEO-optimized posts (coming soon)

## Environment Variables

### Backend
- `PORT` - Backend server port (default: 4000)
- `NODE_ENV` - Environment mode (development/production)

### WordPress Plugin
The plugin automatically detects the backend at `http://localhost:4000`. You can override this by defining:

```php
// In wp-config.php or plugin configuration
define('SEO_POSTIFIER_BACKEND_URL', 'http://your-backend-url:4000');
```

Or set environment variable:
```bash
export SEO_BACKEND_URL=http://your-backend-url:4000
```

## Development Commands

### Backend (seo-backend/)
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run start:dev

# Build for production
pnpm run build

# Run tests
pnpm run test
```

### Docker
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f seo-backend

# Rebuild backend container
docker-compose up -d --build seo-backend
```

## Troubleshooting

### Plugin can't connect to backend
1. Ensure the backend is running on port 4000
2. Check CORS settings in `seo-backend/src/main.ts`
3. Verify the backend URL in WordPress admin

### Backend not starting
1. Check if port 4000 is available
2. Verify Node.js version (20+)
3. Run `pnpm install` to ensure dependencies are installed

## Next Steps

- [ ] Implement AI content generation
- [ ] Add SEO analysis features
- [ ] Create post templates
- [ ] Add keyword research integration
- [ ] Implement batch post generation

## License

GPL v2 or later

## Support

For issues and questions, please open an issue on the project repository.
