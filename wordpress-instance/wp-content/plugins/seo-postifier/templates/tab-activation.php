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

<div class="seo-postifier-activation">
    <div class="activation-card">
        <div class="activation-logo">
            <span class="dashicons dashicons-edit-large" style="font-size: 64px; width: 64px; height: 64px; color: #2271b1;"></span>
        </div>
        
        <h1 class="activation-title">AutoBlogger AI</h1>
        <p class="activation-subtitle">The most efficient SEO copywriter for your agency</p>
        
        <div class="activation-divider"></div>
        
        <p class="activation-info">
            <?php _e('To get started, you need a license key.', 'seo-postifier'); ?>
        </p>
        
        <p class="activation-get-license">
            <?php _e('To get a license, visit', 'seo-postifier'); ?> 
            <a href="https://autoblogger.es/" target="_blank" rel="noopener noreferrer">
                <strong>https://autoblogger.es/</strong>
            </a>
        </p>
        
        <div class="activation-divider"></div>
        
        <form id="seo-postifier-activation-form">
            <div class="form-group">
                <label for="activation-license-key">
                    <?php _e('Enter your license key:', 'seo-postifier'); ?>
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
                    <?php _e('Activate License', 'seo-postifier'); ?>
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
    $('#seo-postifier-activation-form').on('submit', function(e) {
        e.preventDefault();

        const $status = $('#activation-status');
        const $button = $(this).find('button[type="submit"]');
        const $licenseInput = $('#activation-license-key');
        const originalText = $button.text();
        const licenseKey = $licenseInput.val().trim();

        if (!licenseKey) {
            $status.html('<div class="notice notice-error inline"><p><?php _e('Please enter a license key', 'seo-postifier'); ?></p></div>');
            return;
        }

        $button.prop('disabled', true).text('<?php _e('Activating...', 'seo-postifier'); ?>');
        $status.html('');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_activate_license',
                nonce: seoPostifierData.nonce,
                license_key: licenseKey,
                site_url: window.location.origin
            },
            success: function(response) {
                if (response.success) {
                    $status.html('<div class="notice notice-success inline"><p><strong>✓ Success!</strong> ' + response.data.message + '</p></div>');
                    
                    // Reload page after 1.5 seconds to show the main interface
                    setTimeout(function() {
                        window.location.href = '?page=seo-postifier';
                    }, 1500);
                } else {
                    $status.html('<div class="notice notice-error inline"><p><strong>✗ Error:</strong> ' + response.data.message + '</p></div>');
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function(xhr) {
                let errorMsg = '<?php _e('Failed to connect to activation server', 'seo-postifier'); ?>';
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

