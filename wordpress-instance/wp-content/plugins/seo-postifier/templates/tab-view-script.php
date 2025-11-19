<?php
/**
 * View Script Template
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get interview ID from URL parameter
$interview_id = isset($_GET['interviewId']) ? sanitize_text_field($_GET['interviewId']) : '';

if (empty($interview_id)) {
    echo '<div class="notice notice-error"><p>' . __('No interview ID provided.', 'seo-postifier') . '</p></div>';
    return;
}
?>

<div class="seo-postifier-view-script">
    <div class="card">
        <h2><?php _e('View Script', 'seo-postifier'); ?></h2>
        
        <p>
            <a href="?page=seo-postifier&tab=scripts" class="button button-secondary">
                <?php _e('← Back to My Scripts', 'seo-postifier'); ?>
            </a>
        </p>

        <div id="loading-interview" style="margin: 20px 0;">
            <p><?php _e('Loading interview data...', 'seo-postifier'); ?></p>
        </div>

        <div id="interview-container" style="display: none; margin-top: 20px;">
            <h3><?php _e('Interview Data', 'seo-postifier'); ?></h3>
            <div id="interview-json" style="background: #f5f5f5; padding: 15px; border: 1px solid #ddd; border-radius: 4px; max-height: 500px; overflow: auto; font-family: monospace; font-size: 12px; white-space: pre-wrap;"></div>

            <div style="margin-top: 20px;">
                <h3><?php _e('Actions', 'seo-postifier'); ?></h3>
                <p class="submit">
                    <button type="button" id="generate-script-text-btn" class="button button-primary button-large">
                        <?php _e('Generate Script Text', 'seo-postifier'); ?>
                    </button>
                    <button type="button" id="generate-post-btn" class="button button-secondary button-large" disabled title="<?php _e('Coming soon', 'seo-postifier'); ?>">
                        <?php _e('Generate Post (Disabled)', 'seo-postifier'); ?>
                    </button>
                </p>
                <div id="action-status" style="margin-top: 15px;"></div>
            </div>
        </div>

        <div id="interview-error" style="display: none; margin-top: 20px;">
            <!-- Error messages will appear here -->
        </div>
    </div>
</div>

<script type="text/javascript">
jQuery(document).ready(function($) {
    'use strict';

    const interviewId = '<?php echo esc_js($interview_id); ?>';
    const $loading = $('#loading-interview');
    const $container = $('#interview-container');
    const $error = $('#interview-error');
    const $jsonDisplay = $('#interview-json');
    const $actionStatus = $('#action-status');
    const $generateScriptBtn = $('#generate-script-text-btn');
    const $generatePostBtn = $('#generate-post-btn');

    let currentInterview = null;

    // Load interview data
    function loadInterview() {
        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_get_interview',
                nonce: seoPostifierData.nonce,
                interview_id: interviewId
            },
            success: function(response) {
                $loading.hide();
                
                if (response.success) {
                    currentInterview = response.data.interview;
                    displayInterview(currentInterview);
                    $container.show();
                } else {
                    $error.html('<div class="notice notice-error"><p>' + response.data.message + '</p></div>');
                    $error.show();
                }
            },
            error: function() {
                $loading.hide();
                $error.html('<div class="notice notice-error"><p><?php _e('Failed to load interview. Please try again.', 'seo-postifier'); ?></p></div>');
                $error.show();
            }
        });
    }

    // Display interview as formatted JSON
    function displayInterview(interview) {
        const jsonString = JSON.stringify(interview, null, 2);
        $jsonDisplay.text(jsonString);
    }

    // Generate script text
    $generateScriptBtn.on('click', function() {
        const $button = $(this);
        const originalText = $button.text();

        $button.prop('disabled', true).text('<?php _e('Generating...', 'seo-postifier'); ?>');
        $actionStatus.html('<div class="notice notice-info inline"><p><?php _e('Generating script text. This may take a few minutes...', 'seo-postifier'); ?></p></div>');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            timeout: 180000, // 3 minutes
            data: {
                action: 'seo_postifier_generate_script_text',
                nonce: seoPostifierData.nonce,
                interview_id: interviewId
            },
            success: function(response) {
                if (response.success) {
                    currentInterview = response.data.interview;
                    displayInterview(currentInterview);
                    $actionStatus.html('<div class="notice notice-success inline"><p>' + response.data.message + '</p></div>');
                } else {
                    $actionStatus.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                }
            },
            error: function(xhr, status) {
                let errorMsg = '<?php _e('Failed to generate script text. Please try again.', 'seo-postifier'); ?>';
                if (status === 'timeout') {
                    errorMsg = '<?php _e('Request timed out. The script generation may still be processing.', 'seo-postifier'); ?>';
                }
                $actionStatus.html('<div class="notice notice-error inline"><p>' + errorMsg + '</p></div>');
            },
            complete: function() {
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

    // Generate post (disabled for now)
    $generatePostBtn.on('click', function() {
        alert('<?php _e('This feature is coming soon!', 'seo-postifier'); ?>');
    });

    // Load interview on page load
    loadInterview();
});
</script>

