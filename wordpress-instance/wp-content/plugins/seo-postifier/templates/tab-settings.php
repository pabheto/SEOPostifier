<?php
/**
 * Settings Tab Template
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

$settings = SEO_Postifier_Settings::get_all();
?>

<div class="seo-postifier-settings">
    <div class="card">
        <h2><?php _e('Plugin Settings', 'seo-postifier'); ?></h2>
        <p><?php _e('Configure your SEO Postifier plugin settings below.', 'seo-postifier'); ?></p>

        <form id="seo-postifier-settings-form">
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="license-key"><?php _e('License Key', 'seo-postifier'); ?> *</label>
                    </th>
                    <td>
                        <input type="text" 
                               id="license-key" 
                               name="license_key" 
                               class="large-text code" 
                               value="<?php echo esc_attr($settings['license_key']); ?>" 
                               placeholder="BASIC-xxxxxxxxx-XXXXXXXXX" />
                        <p class="description">
                            <?php _e('Enter your license key to authenticate with the backend API. You should have received this key when you registered.', 'seo-postifier'); ?>
                        </p>
                        <?php if (SEO_Postifier_Settings::has_license_key()): ?>
                            <p class="description" style="color: #46b450;">
                                ✓ <?php _e('License key is configured', 'seo-postifier'); ?>
                            </p>
                        <?php endif; ?>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="backend-url"><?php _e('Backend URL', 'seo-postifier'); ?></label>
                    </th>
                    <td>
                        <input type="url" 
                               id="backend-url" 
                               name="backend_url" 
                               class="large-text code" 
                               value="<?php echo esc_attr($settings['backend_url']); ?>" 
                               placeholder="https://seo-postifier-backend-nmb9f.ondigitalocean.app/" />
                        <p class="description">
                            <?php _e('The URL of your SEO Postifier backend server. Leave default unless you have a custom setup.', 'seo-postifier'); ?>
                        </p>
                    </td>
                </tr>
            </table>

            <p class="submit">
                <button type="submit" class="button button-primary">
                    <?php _e('Save Settings', 'seo-postifier'); ?>
                </button>
                <button type="button" id="test-license-btn" class="button button-secondary">
                    <?php _e('Test License & Connection', 'seo-postifier'); ?>
                </button>
            </p>

            <div id="settings-status" style="margin-top: 15px;"></div>
        </form>
    </div>

    <div class="card" style="margin-top: 20px;">
        <h2><?php _e('About Your License', 'seo-postifier'); ?></h2>
        <p><?php _e('Your license key is used to authenticate all requests to the backend API. Different license tiers may have different features and usage limits:', 'seo-postifier'); ?></p>
        <ul style="list-style: disc; margin-left: 20px;">
            <li><strong>BASIC:</strong> <?php _e('Standard access to all post generation features', 'seo-postifier'); ?></li>
            <li><strong>PREMIUM:</strong> <?php _e('Enhanced features with priority support', 'seo-postifier'); ?></li>
            <li><strong>ENTERPRISE:</strong> <?php _e('Full access with dedicated resources', 'seo-postifier'); ?></li>
        </ul>
        <p>
            <?php _e('Current status:', 'seo-postifier'); ?>
            <?php if (SEO_Postifier_Settings::has_license_key()): ?>
                <span style="color: #46b450; font-weight: bold;"><?php _e('Active', 'seo-postifier'); ?></span>
            <?php else: ?>
                <span style="color: #dc3232; font-weight: bold;"><?php _e('Not Configured', 'seo-postifier'); ?></span>
            <?php endif; ?>
        </p>
    </div>
</div>

<script type="text/javascript">
jQuery(document).ready(function($) {
    'use strict';

    // Save settings
    $('#seo-postifier-settings-form').on('submit', function(e) {
        e.preventDefault();

        const $status = $('#settings-status');
        const $button = $(this).find('button[type="submit"]');
        const originalText = $button.text();

        $button.prop('disabled', true).text('<?php _e('Saving...', 'seo-postifier'); ?>');
        $status.html('');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_save_settings',
                nonce: seoPostifierData.nonce,
                license_key: $('#license-key').val(),
                backend_url: $('#backend-url').val()
            },
            success: function(response) {
                if (response.success) {
                    $status.html('<div class="notice notice-success inline"><p>' + response.data.message + '</p></div>');
                    // Reload page after 1 second to update nav
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                } else {
                    $status.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                }
            },
            error: function() {
                $status.html('<div class="notice notice-error inline"><p><?php _e('Failed to save settings', 'seo-postifier'); ?></p></div>');
            },
            complete: function() {
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

    // Test license
    $('#test-license-btn').on('click', function() {
        const $status = $('#settings-status');
        const $button = $(this);
        const originalText = $button.text();
        const licenseKey = $('#license-key').val();

        if (!licenseKey) {
            $status.html('<div class="notice notice-warning inline"><p><?php _e('Please enter a license key first', 'seo-postifier'); ?></p></div>');
            return;
        }

        $button.prop('disabled', true).text('<?php _e('Testing...', 'seo-postifier'); ?>');
        $status.html('');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_test_license',
                nonce: seoPostifierData.nonce,
                license_key: licenseKey
            },
            success: function(response) {
                if (response.success) {
                    $status.html('<div class="notice notice-success inline"><p>✓ ' + response.data.message + '</p></div>');
                } else {
                    $status.html('<div class="notice notice-error inline"><p>✗ ' + response.data.message + '</p></div>');
                }
            },
            error: function(xhr) {
                let errorMsg = '<?php _e('Connection test failed', 'seo-postifier'); ?>';
                if (xhr.status === 0) {
                    errorMsg = '<?php _e('Cannot connect to backend server. Check your Backend URL.', 'seo-postifier'); ?>';
                }
                $status.html('<div class="notice notice-error inline"><p>✗ ' + errorMsg + '</p></div>');
            },
            complete: function() {
                $button.prop('disabled', false).text(originalText);
            }
        });
    });
});
</script>

