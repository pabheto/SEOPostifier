<?php
/**
 * My Drafts List Template
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="seo-postifier-drafts-list">
    <div class="card">
        <h2><?php _e('My Drafts', 'seo-postifier'); ?></h2>
        <p><?php _e('View and manage your post drafts.', 'seo-postifier'); ?></p>

        <p class="submit" style="margin: 15px 0;">
            <a href="?page=seo-postifier&tab=create-script" class="button button-primary button-large">
                <?php _e('+ Create New Draft', 'seo-postifier'); ?>
            </a>
        </p>

        <div id="scripts-loading" style="margin: 20px 0;">
            <p><?php _e('Loading drafts...', 'seo-postifier'); ?></p>
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
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_get_interviews_list',
                nonce: seoPostifierData.nonce
            },
            success: function(response) {
                $loading.hide();
                
                if (response.success) {
                    const interviews = response.data.interviews || [];
                    
                    if (interviews.length === 0) {
                        $container.html('<p><?php _e('No drafts yet. Create your first draft to get started!', 'seo-postifier'); ?></p>');
                    } else {
                        let html = '<table class="wp-list-table widefat fixed striped">';
                        html += '<thead><tr>';
                        html += '<th><?php _e('Created', 'seo-postifier'); ?></th>';
                        html += '<th><?php _e('Main Keyword', 'seo-postifier'); ?></th>';
                        html += '<th><?php _e('Language', 'seo-postifier'); ?></th>';
                        html += '<th><?php _e('Status', 'seo-postifier'); ?></th>';
                        html += '<th><?php _e('Actions', 'seo-postifier'); ?></th>';
                        html += '</tr></thead><tbody>';
                        
                        interviews.forEach(function(interview) {
                            const date = new Date(interview.createdAt);
                            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                            
                            let status = '<?php _e('Draft', 'seo-postifier'); ?>';
                            if (interview.scriptText) {
                                status = '<?php _e('Script Generated', 'seo-postifier'); ?>';
                            }
                            if (interview.scriptDefinition) {
                                status = '<?php _e('Definition Ready', 'seo-postifier'); ?>';
                            }
                            if (interview.associatedPostId) {
                                status = '<?php _e('Post Generated', 'seo-postifier'); ?>';
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
                            html += '<a href="?page=seo-postifier&tab=view-script&interviewId=' + interview.interviewId + '" class="button button-small"><?php _e('View', 'seo-postifier'); ?></a>';
                            if (hasPost) {
                                html += ' <button type="button" class="button button-small button-primary create-wp-draft-btn" data-post-id="' + postId + '" style="margin-left: 5px;"><?php _e('Create WP Draft', 'seo-postifier'); ?></button>';
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
                $error.html('<div class="notice notice-error"><p><?php _e('Failed to load drafts. Please try again.', 'seo-postifier'); ?></p></div>');
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
            alert('<?php _e('Post ID not found', 'seo-postifier'); ?>');
            return;
        }
        
        $button.prop('disabled', true).text('<?php _e('Creating...', 'seo-postifier'); ?>');
        
        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_create_wp_draft',
                nonce: seoPostifierData.nonce,
                post_id: postId
            },
            success: function(response) {
                if (response.success) {
                    alert('<?php _e('WordPress draft created successfully!', 'seo-postifier'); ?>');
                    if (response.data.edit_url) {
                        window.location.href = response.data.edit_url;
                    }
                } else {
                    alert('<?php _e('Failed to create WordPress draft: ', 'seo-postifier'); ?>' + (response.data.message || '<?php _e('Unknown error', 'seo-postifier'); ?>'));
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function() {
                alert('<?php _e('Failed to create WordPress draft. Please try again.', 'seo-postifier'); ?>');
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

    // Load scripts on page load
    loadScripts();
});
</script>

