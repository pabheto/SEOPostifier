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

    <?php if (SEO_Postifier_Settings::has_license_key()): ?>
    <div class="card" style="margin-top: 20px;" id="subscription-usage-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h2 style="margin: 0;"><?php _e('Subscription & Usage', 'seo-postifier'); ?></h2>
            <button type="button" id="refresh-usage-btn" class="button button-secondary">
                <?php _e('Refresh', 'seo-postifier'); ?>
            </button>
        </div>
        <div id="subscription-usage-content">
            <p style="text-align: center; padding: 20px;">
                <span class="spinner is-active" style="float: none; margin: 0 auto;"></span>
                <?php _e('Loading subscription information...', 'seo-postifier'); ?>
            </p>
        </div>
    </div>
    <?php endif; ?>
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

    <?php if (SEO_Postifier_Settings::has_license_key()): ?>
    // Load subscription usage on page load
    function loadSubscriptionUsage() {
        const $content = $('#subscription-usage-content');
        $content.html('<p style="text-align: center; padding: 20px;"><span class="spinner is-active" style="float: none; margin: 0 auto;"></span> <?php _e('Loading subscription information...', 'seo-postifier'); ?></p>');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_get_subscription',
                nonce: seoPostifierData.nonce
            },
            success: function(response) {
                if (response.success && response.data && response.data.data) {
                    const data = response.data.data;
                    let html = '<div class="subscription-info">';
                    
                    // Subscription Plan
                    html += '<div class="usage-section" style="margin-bottom: 20px;">';
                    html += '<h3 style="margin-top: 0;"><?php _e('Current Plan', 'seo-postifier'); ?></h3>';
                    html += '<p style="font-size: 16px; margin: 5px 0;"><strong><?php _e('Plan:', 'seo-postifier'); ?></strong> <span style="text-transform: uppercase; color: #2271b1;">' + escapeHtml(data.subscription.plan || 'N/A') + '</span></p>';
                    html += '<p style="font-size: 16px; margin: 5px 0;"><strong><?php _e('Status:', 'seo-postifier'); ?></strong> <span style="text-transform: capitalize; color: ' + (data.subscription.status === 'active' ? '#46b450' : '#dc3232') + ';">' + escapeHtml(data.subscription.status || 'N/A') + '</span></p>';
                    html += '</div>';
                    
                    // Billing Period
                    if (data.billingPeriod) {
                        html += '<div class="usage-section" style="margin-bottom: 20px;">';
                        html += '<h3><?php _e('Billing Period', 'seo-postifier'); ?></h3>';
                        const startDate = new Date(data.billingPeriod.start);
                        const endDate = new Date(data.billingPeriod.end);
                        html += '<p style="margin: 5px 0;"><strong><?php _e('Start:', 'seo-postifier'); ?></strong> ' + formatDate(startDate) + '</p>';
                        html += '<p style="margin: 5px 0;"><strong><?php _e('End:', 'seo-postifier'); ?></strong> ' + formatDate(endDate) + '</p>';
                        html += '</div>';
                    }
                    
                    // Usage Statistics
                    if (data.usage) {
                        html += '<div class="usage-section">';
                        html += '<h3><?php _e('Usage This Period', 'seo-postifier'); ?></h3>';
                        html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">';
                        html += '<div style="background: #f0f0f1; padding: 15px; border-radius: 4px;">';
                        html += '<div style="font-size: 24px; font-weight: bold; color: #2271b1; margin-bottom: 5px;">' + (data.usage.aiGeneratedImages || 0) + '</div>';
                        html += '<div style="color: #646970;"><?php _e('AI Generated Images', 'seo-postifier'); ?></div>';
                        html += '</div>';
                        html += '<div style="background: #f0f0f1; padding: 15px; border-radius: 4px;">';
                        html += '<div style="font-size: 24px; font-weight: bold; color: #2271b1; margin-bottom: 5px;">' + formatNumber(data.usage.generatedWords || 0) + '</div>';
                        html += '<div style="color: #646970;"><?php _e('Generated Words', 'seo-postifier'); ?></div>';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';
                    }
                    
                    html += '</div>';
                    $content.html(html);
                } else {
                    $content.html('<div class="notice notice-error inline"><p><?php _e('Failed to load subscription information', 'seo-postifier'); ?></p></div>');
                }
            },
            error: function(xhr) {
                let errorMsg = '<?php _e('Failed to load subscription information', 'seo-postifier'); ?>';
                if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                    errorMsg = xhr.responseJSON.data.message;
                }
                $content.html('<div class="notice notice-error inline"><p>' + errorMsg + '</p></div>');
            }
        });
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Helper function to format date
    function formatDate(date) {
        if (!date || isNaN(date.getTime())) {
            return 'N/A';
        }
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // Helper function to format numbers with commas
    function formatNumber(num) {
        return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Load usage on page load
    loadSubscriptionUsage();

    // Refresh button
    $('#refresh-usage-btn').on('click', function() {
        loadSubscriptionUsage();
    });
    <?php endif; ?>
});
</script>

