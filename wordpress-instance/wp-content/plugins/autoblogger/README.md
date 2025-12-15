# Autoblogger

**Version:** 2.0.1  
**Requires:** WordPress 5.0+ | PHP 7.4+  
**License:** GPLv2 or later  
**License URI:** https://www.gnu.org/licenses/gpl-2.0.html  
**Website:** https://autoblogger.es

Automatically generates WordPress posts with SEO optimizations using AI-powered backend.

## Description

Autoblogger is a powerful WordPress plugin that automates the creation of SEO-optimized blog posts using advanced AI technology. Connect to your backend API and generate high-quality, search-engine-friendly content with just a few clicks.

### Key Features

- **AI-Powered Content Generation**: Leverage advanced AI to create SEO-optimized blog posts automatically
- **License-Based Authentication**: Secure access with license key authentication
- **Easy Script Management**: Create, view, and manage content generation scripts from the WordPress admin
- **SEO Optimization**: Automatically generates content optimized for search engines
- **SEO Plugin Integration**: Automatically fills meta keywords for Yoast SEO, RankMath, and All in One SEO
- **Post Architecture Suggestions**: AI-generated post structure suggestions with reload capability
- **Backend Integration**: Seamlessly connects to your SEO Postifier backend API
- **User-Friendly Interface**: Clean, intuitive admin interface for managing all features
- **Settings Management**: Easy configuration of license keys and backend URLs

## Installation

### Automatic Installation

1. Log in to your WordPress admin panel
2. Navigate to **Plugins > Add New**
3. Search for "Autoblogger"
4. Click **"Install Now"** and then **"Activate"**

### Manual Installation

1. Download the plugin zip file from https://autoblogger.es
2. Extract the files to `/wp-content/plugins/autoblogger/` directory
3. Log in to your WordPress admin panel
4. Navigate to **Plugins**
5. Find "Autoblogger" in the list and click **"Activate"**

### Post-Installation Setup

1. Go to the **Autoblogger** settings page in your WordPress admin
2. Enter your license key in the settings form (available from https://autoblogger.es)
3. (Optional) Configure a custom backend URL if needed
4. Click **"Test License & Connection"** to verify your setup
5. Start creating SEO-optimized posts!

## Usage

### Getting Started

1. **Configure Settings**

   - Navigate to the Autoblogger admin page
   - Enter your license key (available from https://autoblogger.es)
   - Set your backend URL (default provided)
   - Test your connection

2. **Create Scripts**

   - Use the "Create Script" tab to generate new content
   - Fill in the required information
   - Submit to generate your SEO-optimized post

3. **Manage Scripts**
   - View all your scripts in the "Scripts List" tab
   - Click on individual scripts to view details
   - Manage and organize your generated content

### License Tiers

- **BASIC**: Standard access to all post generation features
- **PREMIUM**: Enhanced features with priority support
- **ENTERPRISE**: Full access with dedicated resources

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- Valid license key from Autoblogger service (https://autoblogger.es)
- Active internet connection for backend API access

## Frequently Asked Questions

### Do I need a license key?

Yes, a license key is required to authenticate with the backend API. You can obtain your license key by registering at https://autoblogger.es

### What license tiers are available?

Three tiers are available:

- **BASIC**: Standard features
- **PREMIUM**: Enhanced features with priority support
- **ENTERPRISE**: Full access with dedicated resources

### Can I use a custom backend URL?

Yes, you can configure a custom backend URL in the plugin settings. By default, the plugin uses the official backend server.

### What WordPress version do I need?

Autoblogger requires WordPress 5.0 or higher and PHP 7.4 or higher.

### Is the plugin compatible with other SEO plugins?

Yes, Autoblogger works alongside other SEO plugins and automatically integrates with them. When you create a draft, the plugin automatically fills in:

- **Main keyword/Focus keyword** for Yoast SEO, RankMath, and All in One SEO
- **Meta title** from your post title
- **Meta description** from your post excerpt

Supported SEO plugins:

- Yoast SEO
- RankMath
- All in One SEO

### Can I reload the post architecture suggestions?

Yes! After viewing the AI-generated suggestions for your post structure, you can click the "Reload Suggestions" button to generate new suggestions if you're not satisfied with the initial options.

## File Structure

```
autoblogger/
├── assets/
│   ├── css/
│   │   └── admin.css
│   └── js/
│       └── modules/
├── includes/
│   ├── class-admin-page.php
│   ├── class-ajax-handlers.php
│   ├── class-api-client.php
│   └── class-settings.php
├── templates/
│   ├── admin-page-wrapper.php
│   ├── tab-create-script.php
│   ├── tab-scripts-list.php
│   ├── tab-settings.php
│   └── tab-view-script.php
├── autoblogger.php
├── README.txt
└── README.md
```

## Changelog

### 2.0.1

- **New**: Added reload button for post architecture suggestions
- **New**: Automatic SEO meta keyword integration for Yoast SEO, RankMath, and All in One SEO
- **Enhancement**: Main keyword is now automatically set as focus keyword in supported SEO plugins
- **Enhancement**: Improved suggestion UI with rotating icon animation on reload

### 2.0.0

- Initial release
- License key authentication system
- Backend API integration
- Script creation and management interface
- Settings management page
- AJAX handlers for seamless user experience

## Support

For support, feature requests, or bug reports, please visit https://autoblogger.es or contact the development team.

## Development

### Environment Variables

The plugin uses the following environment variable:

- `SEO_BACKEND_URL`: Custom backend URL (optional, defaults to official server)

### Hooks and Filters

The plugin follows WordPress coding standards and uses standard WordPress hooks and filters for extensibility.

## Credits

Developed with modern WordPress development practices and best security standards.

## License

This plugin is licensed under the GPL v2 or later.

```
Copyright (C) 2024 Autoblogger (https://autoblogger.es)

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
```
