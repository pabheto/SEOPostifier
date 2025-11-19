# SEO Postifier WordPress Plugin

A WordPress plugin that generates SEO-optimized content using AI-powered backend services.

## Overview

SEO Postifier streamlines the content creation process by:

1. Creating structured post interviews with SEO specifications
2. Generating SEO-optimized script text
3. Formatting content into structured definitions
4. Creating complete WordPress posts with proper formatting

## Features

- **SEO Optimization**: Target main and secondary keywords with density control
- **Multi-Language Support**: Create content in multiple languages
- **Search Intent Targeting**: Optimize for informational, transactional, commercial, or navigational intent
- **Flexible Tone**: Professional, friendly, technical, educational, casual, or formal
- **Brand Integration**: Optionally mention and describe your brand
- **Link Management**: Include internal and external links strategically
- **FAQ Sections**: Automatically generate FAQ sections
- **WordPress Integration**: Create drafts directly in WordPress

## Installation

1. Copy the `seo-postifier` directory to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Configure the backend URL in your environment or the plugin settings

## Configuration

### Backend URL

Set the backend URL using the `SEO_BACKEND_URL` environment variable:

```php
define('SEO_BACKEND_URL', 'http://localhost:4000');
```

Or it defaults to `http://localhost:4000`.

## Architecture

### Modular JavaScript Design

The plugin uses a clean, modular JavaScript architecture:

- **StateManager**: Centralized state management
- **APIHandler**: AJAX communication with WordPress backend
- **UIController**: UI updates and user interactions
- **WorkflowOrchestrator**: Multi-step workflow coordination
- **admin.js**: Entry point and event binding

See `assets/js/modules/README.md` for detailed architecture documentation.

### PHP Structure

- **seo-postifier.php**: Main plugin file, AJAX handlers, WordPress integration
- **templates/admin-page.php**: Admin interface template
- **assets/css/admin.css**: Admin interface styles
- **assets/js/modules/**: JavaScript modules

## Workflow

1. **Create Interview**: Define SEO parameters, target audience, tone, etc.
2. **Generate Script**: AI generates initial script text based on specifications
3. **Review & Edit**: Review and optionally edit the generated script
4. **Approve Script**: Approve the script to continue
5. **Generate Definition**: Format script into structured JSON definition
6. **Generate Post**: Create complete post with all content blocks
7. **Create Draft**: Save as WordPress draft for final editing

## API Endpoints

The plugin communicates with these backend endpoints:

- `POST /posts-interviews/create` - Create new interview
- `POST /posts-interviews/generate-script-text` - Generate script text
- `POST /posts-interviews/update-script-text` - Update edited script
- `POST /posts-interviews/generate-script-definition` - Generate JSON definition
- `POST /posts-interviews/generate-post` - Generate complete post

## WordPress AJAX Actions

- `seo_postifier_test_connection` - Test backend connectivity
- `seo_postifier_create_interview` - Create interview
- `seo_postifier_generate_script_text` - Generate script text
- `seo_postifier_update_script_text` - Update script text
- `seo_postifier_generate_script_definition` - Generate script definition
- `seo_postifier_generate_post` - Generate post
- `seo_postifier_create_wp_draft` - Create WordPress draft

## Security

- All AJAX requests use WordPress nonces for CSRF protection
- User capabilities are checked (`manage_options`, `edit_posts`)
- All output is properly escaped
- Input is sanitized before processing

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- Active backend API service
- jQuery (included with WordPress)

## Development

### File Structure

```
seo-postifier/
├── assets/
│   ├── css/
│   │   └── admin.css
│   └── js/
│       ├── admin.js
│       └── modules/
│           ├── README.md
│           ├── state-manager.js
│           ├── api-handler.js
│           ├── ui-controller.js
│           └── workflow-orchestrator.js
├── templates/
│   └── admin-page.php
├── README.md
└── seo-postifier.php
```

### Adding New Features

1. **Backend**: Add endpoint to NestJS backend
2. **PHP**: Add AJAX handler in `seo-postifier.php`
3. **API Handler**: Add method to `APIHandler` module
4. **Workflow**: Add logic to `WorkflowOrchestrator`
5. **UI**: Add UI updates to `UIController`
6. **Events**: Bind events in `admin.js`

### Debugging

Enable WordPress debug mode:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

Check browser console for JavaScript errors and state changes.

## Troubleshooting

### Connection Issues

- Verify backend URL is correct
- Check backend service is running
- Test connection using "Test Connection" button
- Check browser console for network errors

### Script Generation Fails

- Verify interview was created successfully
- Check backend logs for errors
- Ensure adequate timeout settings
- Check interview data is complete

### Post Not Displaying Correctly

- Verify post data structure
- Check HTML escaping
- Review browser console for errors
- Test with different post content

## Performance

- DOM elements are cached for efficiency
- AJAX requests use appropriate timeouts
- Long operations show loading indicators
- State changes trigger targeted UI updates

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- [ ] Multiple post templates
- [ ] Image upload and management
- [ ] Scheduling post generation
- [ ] Bulk post creation
- [ ] Analytics integration
- [ ] Multi-user workflows
- [ ] Post versioning
- [ ] A/B testing support

## License

GPL v2 or later

## Support

For issues and questions, please contact the development team.

## Changelog

### 1.0.0

- Initial release
- Core workflow implementation
- Modular JavaScript architecture
- WordPress integration
- SEO optimization features
