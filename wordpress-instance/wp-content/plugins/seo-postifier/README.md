# SEO Postifier - WordPress Plugin

Automatically generates WordPress posts with SEO optimizations using AI-powered backend.

## Features

- **AI-Powered Content Generation**: Generate SEO-optimized posts automatically
- **Backend Integration**: Connects to NestJS backend for advanced processing
- **WordPress Admin Interface**: Easy-to-use admin panel
- **Real-time Connection Testing**: Test backend connectivity from WordPress admin

## Installation

1. Copy the `seo-postifier` folder to `wp-content/plugins/`
2. Activate the plugin from WordPress admin
3. Navigate to **SEO Postifier** in the admin menu

## Configuration

The plugin connects to the backend at `http://localhost:4000` by default. You can change this by setting the `SEO_BACKEND_URL` environment variable:

```php
define('SEO_POSTIFIER_BACKEND_URL', 'http://your-backend-url:4000');
```

## Development

### Requirements
- WordPress 5.0 or higher
- PHP 7.4 or higher
- NestJS backend running on port 4000

### Backend Connection
The plugin uses WordPress HTTP API to communicate with the backend. Test the connection using the "Test Connection" button in the admin panel.

## API Endpoints Used

- `GET /hello` - Test backend connectivity

## Version
1.0.0

## License
GPL v2 or later
