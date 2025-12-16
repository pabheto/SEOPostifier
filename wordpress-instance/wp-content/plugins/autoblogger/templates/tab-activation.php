<?php
/**
 * Activation Screen Template
 * Displays when plugin is not yet activated
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="autoblogger-activation">
    <div class="activation-card">
        <div class="activation-logo">
            <span class="dashicons dashicons-edit-large" style="font-size: 64px; width: 64px; height: 64px; color: #2271b1;"></span>
        </div>
        
        <h1 class="activation-title">AutoBlogger AI</h1>
        <p class="activation-subtitle">The most efficient SEO copywriter for your agency</p>
        
        <div class="activation-divider"></div>
        
        <p class="activation-info">
            <?php esc_html_e('To get started, you need a license key.', 'autoblogger'); ?>
        </p>
        
        <p class="activation-get-license">
            <?php esc_html_e('To get a license, visit', 'autoblogger'); ?> 
            <a href="https://autoblogger.es/" target="_blank" rel="noopener noreferrer">
                <strong>https://autoblogger.es/</strong>
            </a>
        </p>
        
        <div class="activation-divider"></div>
        
        <form id="autoblogger-activation-form">
            <div class="form-group">
                <label for="activation-license-key">
                    <?php esc_html_e('Enter your license key:', 'autoblogger'); ?>
                </label>
                <input type="text" 
                       id="activation-license-key" 
                       name="license_key" 
                       class="large-text code" 
                       placeholder="" 
                       required />
            </div>
            
            <p class="submit">
                <button type="submit" class="button button-primary button-hero">
                    <?php esc_html_e('Activate License', 'autoblogger'); ?>
                </button>
            </p>
            
            <div id="activation-status"></div>
        </form>
    </div>
</div>

<script type="text/javascript">
jQuery(document).ready(function($) {
    'use strict';

    // Handle activation form submission
    $('#autoblogger-activation-form').on('submit', function(e) {
        e.preventDefault();

        const $status = $('#activation-status');
        const $button = $(this).find('button[type="submit"]');
        const $licenseInput = $('#activation-license-key');
        const originalText = $button.text();
        const licenseKey = $licenseInput.val().trim();

        if (!licenseKey) {
            $status.html('<div class="notice notice-error inline"><p><?php echo esc_js(__('Please enter a license key', 'autoblogger')); ?></p></div>');
            return;
        }

        $button.prop('disabled', true).text('<?php echo esc_js(__('Activating...', 'autoblogger')); ?>');
        $status.html('');

        $.ajax({
            url: autobloggerData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'autoblogger_activate_license',
                nonce: autobloggerData.nonce,
                license_key: licenseKey,
                site_url: window.location.origin
            },
            success: function(response) {
                if (response.success) {
                    $status.html('<div class="notice notice-success inline"><p><strong>✓ Success!</strong> ' + response.data.message + '</p></div>');
                    
                    // Reload page after 1.5 seconds to show the main interface
                    setTimeout(function() {
                        window.location.href = '?page=autoblogger';
                    }, 1500);
                } else {
                    $status.html('<div class="notice notice-error inline"><p><strong>✗ Error:</strong> ' + response.data.message + '</p></div>');
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function(xhr) {
                let errorMsg = '<?php echo esc_js(__('Failed to connect to activation server', 'autoblogger')); ?>';
                if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                    errorMsg = xhr.responseJSON.data.message;
                }
                $status.html('<div class="notice notice-error inline"><p><strong>✗ Error:</strong> ' + errorMsg + '</p></div>');
                $button.prop('disabled', false).text(originalText);
            }
        });
    });
});
</script>

