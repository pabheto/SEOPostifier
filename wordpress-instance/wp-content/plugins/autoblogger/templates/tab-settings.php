<?php
/**
 * Settings Tab Template
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

$autoblogger_settings = Autoblogger_Settings::get_all();
?>

<div class="autoblogger-settings">
    <div class="card">
        <h2><?php esc_html_e('Plugin Settings', 'autoblogger'); ?></h2>
        <p><?php esc_html_e('Configure your Autoblogger plugin settings below.', 'autoblogger'); ?></p>

        <form id="autoblogger-settings-form">
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="license-key"><?php esc_html_e('License Key', 'autoblogger'); ?> *</label>
                    </th>
                    <td>
                        <input type="text" 
                               id="license-key" 
                               name="license_key" 
                               class="large-text code" 
                               value="<?php echo esc_attr($autoblogger_settings['license_key']); ?>" 
                               placeholder="Enter your license key" 
                               readonly />
                        <p class="description">
                            <?php esc_html_e('Your activated license key. To change it, you must first deactivate this license.', 'autoblogger'); ?>
                        </p>
                        <?php if (Autoblogger_Settings::has_license_key()): ?>
                            <p class="description" style="color: #46b450;">
                                ✓ <?php esc_html_e('License key is active', 'autoblogger'); ?>
                            </p>
                        <?php endif; ?>
                        <div style="margin-top: 10px;">
                            <button type="button" id="deactivate-license-btn" class="button">
                                <?php esc_html_e('Deactivate License', 'autoblogger'); ?>
                            </button>
                        </div>
                    </td>
                </tr>
                <?php if (defined('AUTOBLOGGER_DEV_MODE') && AUTOBLOGGER_DEV_MODE): ?>
                <tr>
                    <th scope="row">
                        <label for="backend-url"><?php esc_html_e('Backend URL', 'autoblogger'); ?></label>
                    </th>
                    <td>
                        <input type="url" 
                               id="backend-url" 
                               name="backend_url" 
                               class="large-text code" 
                               value="<?php echo esc_attr($autoblogger_settings['backend_url']); ?>" 
                               placeholder="https://autoblogger-backend-nmb9f.ondigitalocean.app/" />
                        <p class="description">
                            <?php esc_html_e('The URL of your Autoblogger backend server. Leave default unless you have a custom setup.', 'autoblogger'); ?>
                        </p>
                    </td>
                </tr>
                <?php endif; ?>
            </table>

            <?php if (defined('AUTOBLOGGER_DEV_MODE') && AUTOBLOGGER_DEV_MODE): ?>
            <p class="submit">
                <button type="submit" class="button button-primary">
                    <?php esc_html_e('Save Settings', 'autoblogger'); ?>
                </button>
                <button type="button" id="test-license-btn" class="button button-secondary">
                    <?php esc_html_e('Test License & Connection', 'autoblogger'); ?>
                </button>
            </p>
            <?php else: ?>
            <p class="submit">
                <button type="button" id="test-license-btn" class="button button-secondary">
                    <?php esc_html_e('Test License & Connection', 'autoblogger'); ?>
                </button>
            </p>
            <?php endif; ?>

            <div id="settings-status" style="margin-top: 15px;"></div>
        </form>
    </div>

    <?php if (Autoblogger_Settings::has_license_key()): ?>
    <div class="card" style="margin-top: 20px;" id="subscription-usage-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h2 style="margin: 0;"><?php esc_html_e('Subscription & Usage', 'autoblogger'); ?></h2>
            <button type="button" id="refresh-usage-btn" class="button button-secondary">
                <?php esc_html_e('Refresh', 'autoblogger'); ?>
            </button>
        </div>
        <div id="subscription-usage-content">
            <p style="text-align: center; padding: 20px;">
                <span class="spinner is-active" style="float: none; margin: 0 auto;"></span>
                <?php esc_html_e('Loading subscription information...', 'autoblogger'); ?>
            </p>
        </div>
    </div>
    <?php endif; ?>
</div>

<script type="text/javascript">
jQuery(document).ready(function($) {
    'use strict';

    // Deactivate license
    $('#deactivate-license-btn').on('click', function() {
        const confirmed = confirm('<?php echo esc_js(__('Warning: Deactivating your license will close the plugin and you will need to enter a valid license key again to reactivate it.\n\nAre you sure you want to continue?', 'autoblogger')); ?>');
        
        if (!confirmed) {
            return;
        }

        const $button = $(this);
        const originalText = $button.text();
        const $status = $('#settings-status');

        $button.prop('disabled', true).text('<?php echo esc_js(__('Deactivating...', 'autoblogger')); ?>');
        $status.html('');

        $.ajax({
            url: autobloggerData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'autoblogger_deactivate_license',
                nonce: autobloggerData.nonce
            },
            success: function(response) {
                if (response.success) {
                    $status.html('<div class="notice notice-success inline"><p>' + response.data.message + '</p></div>');
                    // Reload page after 1.5 seconds to show activation screen
                    setTimeout(function() {
                        window.location.href = '?page=autoblogger';
                    }, 1500);
                } else {
                    $status.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function() {
                $status.html('<div class="notice notice-error inline"><p><?php echo esc_js(__('Failed to deactivate license', 'autoblogger')); ?></p></div>');
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

    // Save settings (only in dev mode)
    $('#autoblogger-settings-form').on('submit', function(e) {
        e.preventDefault();

        const $status = $('#settings-status');
        const $button = $(this).find('button[type="submit"]');
        const originalText = $button.text();

        $button.prop('disabled', true).text('<?php echo esc_js(__('Saving...', 'autoblogger')); ?>');
        $status.html('');

        var postData = {
            action: 'autoblogger_save_settings',
            nonce: autobloggerData.nonce
        };
        
        // Only include backend_url if the field exists (dev mode)
        if ($('#backend-url').length) {
            postData.backend_url = $('#backend-url').val();
        }

        $.ajax({
            url: autobloggerData.ajaxUrl,
            type: 'POST',
            data: postData,
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
                $status.html('<div class="notice notice-error inline"><p><?php echo esc_js(__('Failed to save settings', 'autoblogger')); ?></p></div>');
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

        $button.prop('disabled', true).text('<?php echo esc_js(__('Testing...', 'autoblogger')); ?>');
        $status.html('');

        $.ajax({
            url: autobloggerData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'autoblogger_test_license',
                nonce: autobloggerData.nonce
            },
            success: function(response) {
                if (response.success) {
                    $status.html('<div class="notice notice-success inline"><p>✓ ' + response.data.message + '</p></div>');
                } else {
                    $status.html('<div class="notice notice-error inline"><p>✗ ' + response.data.message + '</p></div>');
                }
            },
            error: function(xhr) {
                let errorMsg = '<?php echo esc_js(__('Connection test failed', 'autoblogger')); ?>';
                if (xhr.status === 0) {
                    errorMsg = '<?php echo esc_js(__('Cannot connect to backend server. Check your Backend URL.', 'autoblogger')); ?>';
                }
                $status.html('<div class="notice notice-error inline"><p>✗ ' + errorMsg + '</p></div>');
            },
            complete: function() {
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

    <?php if (Autoblogger_Settings::has_license_key()): ?>
    // Load subscription usage on page load
    function loadSubscriptionUsage() {
        const $content = $('#subscription-usage-content');
        $content.html('<p style="text-align: center; padding: 20px;"><span class="spinner is-active" style="float: none; margin: 0 auto;"></span> <?php echo esc_js(__('Loading subscription information...', 'autoblogger')); ?></p>');

        $.ajax({
            url: autobloggerData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'autoblogger_get_subscription',
                nonce: autobloggerData.nonce
            },
            success: function(response) {
                if (response.success && response.data && response.data.data) {
                    const data = response.data.data;
                    let html = '<div class="subscription-info">';
                    
                    // Subscription Plan
                    html += '<div class="usage-section" style="margin-bottom: 20px;">';
                    html += '<h3 style="margin-top: 0;"><?php echo esc_js(__('Current Plan', 'autoblogger')); ?></h3>';
                    html += '<p style="font-size: 16px; margin: 5px 0;"><strong><?php echo esc_js(__('Plan:', 'autoblogger')); ?></strong> <span style="text-transform: uppercase; color: #2271b1;">' + escapeHtml(data.subscription.plan || 'N/A') + '</span></p>';
                    html += '<p style="font-size: 16px; margin: 5px 0;"><strong><?php echo esc_js(__('Status:', 'autoblogger')); ?></strong> <span style="text-transform: capitalize; color: ' + (data.subscription.status === 'active' ? '#46b450' : '#dc3232') + ';">' + escapeHtml(data.subscription.status || 'N/A') + '</span></p>';
                    html += '</div>';
                    
                    // Billing Period
                    if (data.billingPeriod) {
                        html += '<div class="usage-section" style="margin-bottom: 20px;">';
                        html += '<h3><?php echo esc_js(__('Billing Period', 'autoblogger')); ?></h3>';
                        const startDate = new Date(data.billingPeriod.start);
                        const endDate = new Date(data.billingPeriod.end);
                        html += '<p style="margin: 5px 0;"><strong><?php echo esc_js(__('Start:', 'autoblogger')); ?></strong> ' + formatDate(startDate) + '</p>';
                        html += '<p style="margin: 5px 0;"><strong><?php echo esc_js(__('End:', 'autoblogger')); ?></strong> ' + formatDate(endDate) + '</p>';
                        html += '</div>';
                    }
                    
                    // Usage Statistics
                    if (data.usage) {
                        html += '<div class="usage-section">';
                        html += '<h3><?php echo esc_js(__('Usage This Period', 'autoblogger')); ?></h3>';
                        html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">';
                        html += '<div style="background: #f0f0f1; padding: 15px; border-radius: 4px;">';
                        html += '<div style="font-size: 24px; font-weight: bold; color: #2271b1; margin-bottom: 5px;">' + (data.usage.aiGeneratedImages || 0) + '</div>';
                        html += '<div style="color: #646970;"><?php echo esc_js(__('AI Generated Images', 'autoblogger')); ?></div>';
                        html += '</div>';
                        html += '<div style="background: #f0f0f1; padding: 15px; border-radius: 4px;">';
                        html += '<div style="font-size: 24px; font-weight: bold; color: #2271b1; margin-bottom: 5px;">' + formatNumber(data.usage.generatedWords || 0) + '</div>';
                        html += '<div style="color: #646970;"><?php echo esc_js(__('Generated Words', 'autoblogger')); ?></div>';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';
                    }
                    
                    html += '</div>';
                    $content.html(html);
                } else {
                    $content.html('<div class="notice notice-error inline"><p><?php echo esc_js(__('Failed to load subscription information', 'autoblogger')); ?></p></div>');
                }
            },
            error: function(xhr) {
                let errorMsg = '<?php echo esc_js(__('Failed to load subscription information', 'autoblogger')); ?>';
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

