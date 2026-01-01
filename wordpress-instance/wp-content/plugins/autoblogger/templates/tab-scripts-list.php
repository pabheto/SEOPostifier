<?php
/**
 * My Drafts List Template
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="autoblogger-drafts-list">
    <div class="card">
        <h2><?php esc_html_e('My Drafts', 'autoblogger'); ?></h2>
        <p><?php esc_html_e('View and manage your post drafts.', 'autoblogger'); ?></p>

        <p class="submit" style="margin: 15px 0;">
            <a href="?page=autoblogger&tab=create-script" class="button button-primary button-large">
                <?php esc_html_e('+ Create New Draft', 'autoblogger'); ?>
            </a>
        </p>

        <div id="scripts-loading" style="margin: 20px 0;">
            <p><?php esc_html_e('Loading drafts...', 'autoblogger'); ?></p>
        </div>

        <div id="scripts-list-container" style="display: none; margin-top: 20px;">
            <!-- Drafts will be loaded here by JavaScript -->
        </div>

        <div id="scripts-error" style="display: none; margin-top: 20px;">
            <!-- Error messages will appear here -->
        </div>
    </div>
</div>

<script type="text/javascript">
jQuery(document).ready(function($) {
    'use strict';

    const $loading = $('#scripts-loading');
    const $container = $('#scripts-list-container');
    const $error = $('#scripts-error');

    // Load scripts list
    function loadScripts() {
        $.ajax({
            url: autobloggerData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'autoblogger_get_interviews_list',
                nonce: autobloggerData.nonce
            },
            success: function(response) {
                $loading.hide();
                
                if (response.success) {
                    const interviews = response.data.interviews || [];
                    
                    if (interviews.length === 0) {
                        $container.html('<p><?php echo esc_js(__('No drafts yet. Create your first draft to get started!', 'autoblogger')); ?></p>');
                    } else {
                        let html = '<table class="wp-list-table widefat fixed striped">';
                        html += '<thead><tr>';
                        html += '<th><?php echo esc_js(__('Created', 'autoblogger')); ?></th>';
                        html += '<th><?php echo esc_js(__('Main Keyword', 'autoblogger')); ?></th>';
                        html += '<th><?php echo esc_js(__('Language', 'autoblogger')); ?></th>';
                        html += '<th><?php echo esc_js(__('Status', 'autoblogger')); ?></th>';
                        html += '<th><?php echo esc_js(__('Actions', 'autoblogger')); ?></th>';
                        html += '</tr></thead><tbody>';
                        
                        interviews.forEach(function(interview) {
                            const date = new Date(interview.createdAt);
                            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                            
                            let status = '<?php echo esc_js(__('Draft', 'autoblogger')); ?>';
                            if (interview.scriptText) {
                                status = '<?php echo esc_js(__('Script Generated', 'autoblogger')); ?>';
                            }
                            if (interview.scriptDefinition) {
                                status = '<?php echo esc_js(__('Definition Ready', 'autoblogger')); ?>';
                            }
                            if (interview.associatedPostId) {
                                status = '<?php echo esc_js(__('Post Generated', 'autoblogger')); ?>';
                            }
                            
                            // Get post ID - could be _id, id, or associatedPostId
                            const postId = interview.associatedPostId?._id || interview.associatedPostId?.id || interview.associatedPostId || null;
                            const hasPost = !!postId;
                            
                            html += '<tr>';
                            html += '<td>' + dateStr + '</td>';
                            html += '<td><strong>' + (interview.mainKeyword || '-') + '</strong></td>';
                            html += '<td>' + (interview.language || '-') + '</td>';
                            html += '<td>' + status + '</td>';
                            html += '<td>';
                            html += '<a href="?page=autoblogger&tab=edit-script&interviewId=' + interview.interviewId + '" class="button button-small"><?php echo esc_js(__('Edit & Generate', 'autoblogger')); ?></a>';
                            if (hasPost) {
                                html += ' <button type="button" class="button button-small button-primary create-wp-draft-btn" data-post-id="' + postId + '" style="margin-left: 5px;"><?php echo esc_js(__('Create WP Draft', 'autoblogger')); ?></button>';
                            }
                            html += '</td>';
                            html += '</tr>';
                        });
                        
                        html += '</tbody></table>';
                        $container.html(html);
                    }
                    
                    $container.show();
                } else {
                    $error.html('<div class="notice notice-error"><p>' + response.data.message + '</p></div>');
                    $error.show();
                }
            },
            error: function() {
                $loading.hide();
                $error.html('<div class="notice notice-error"><p><?php echo esc_js(__('Failed to load drafts. Please try again.', 'autoblogger')); ?></p></div>');
                $error.show();
            }
        });
    }

    // Handle Create WordPress Draft button clicks
    $(document).on('click', '.create-wp-draft-btn', function() {
        const $button = $(this);
        const postId = $button.data('post-id');
        const originalText = $button.text();
        
        if (!postId) {
            alert('<?php echo esc_js(__('Post ID not found', 'autoblogger')); ?>');
            return;
        }
        
        $button.prop('disabled', true).text('<?php echo esc_js(__('Creating...', 'autoblogger')); ?>');
        
        $.ajax({
            url: autobloggerData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'autoblogger_create_wp_draft',
                nonce: autobloggerData.nonce,
                post_id: postId
            },
            success: function(response) {
                if (response.success) {
                    alert('<?php echo esc_js(__('WordPress draft created successfully!', 'autoblogger')); ?>');
                    if (response.data.edit_url) {
                        window.location.href = response.data.edit_url;
                    }
                } else {
                    alert('<?php echo esc_js(__('Failed to create WordPress draft: ', 'autoblogger')); ?>' + (response.data.message || '<?php echo esc_js(__('Unknown error', 'autoblogger')); ?>'));
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function() {
                alert('<?php echo esc_js(__('Failed to create WordPress draft. Please try again.', 'autoblogger')); ?>');
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

    // Load scripts on page load
    loadScripts();
});
</script>

