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
            <div class="seo-postifier-two-column-layout">
                <div class="seo-postifier-left-column">
                    <h3><?php _e('Interview Data', 'seo-postifier'); ?></h3>
                    <div id="interview-json" class="seo-postifier-json-display"></div>

                    <div style="margin-top: 20px;">
                        <h3><?php _e('Actions', 'seo-postifier'); ?></h3>
                        <p class="submit">
                            <button type="button" id="generate-script-text-btn" class="button button-primary button-large">
                                <?php _e('Generate Script Text', 'seo-postifier'); ?>
                            </button>
                            <button type="button" id="generate-script-definition-btn" class="button button-primary button-large">
                                <?php _e('Generate Script Definition', 'seo-postifier'); ?>
                            </button>
                            <button type="button" id="generate-post-btn" class="button button-primary button-large">
                                <?php _e('Generate Post', 'seo-postifier'); ?>
                            </button>
                        </p>
                        <div id="action-status" style="margin-top: 15px;"></div>
                    </div>
                </div>

                <div class="seo-postifier-right-column">
                    <div id="post-container" style="display: none;">
                        <h3><?php _e('Generated Post Preview', 'seo-postifier'); ?></h3>
                        <div id="post-markdown" class="seo-postifier-markdown-display"></div>
                        <div style="margin-top: 20px;">
                            <button type="button" id="create-wp-draft-btn" class="button button-primary button-large">
                                <?php _e('Create WordPress Draft', 'seo-postifier'); ?>
                            </button>
                            <div id="wp-draft-status" style="margin-top: 15px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="interview-error" style="display: none; margin-top: 20px;">
            <!-- Error messages will appear here -->
        </div>
    </div>
</div>

<!-- Marked.js for Markdown rendering -->
<script src="https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js"></script>
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
    const $generateScriptDefinitionBtn = $('#generate-script-definition-btn');
    const $generatePostBtn = $('#generate-post-btn');
    const $createWpDraftBtn = $('#create-wp-draft-btn');
    const $wpDraftStatus = $('#wp-draft-status');

    let currentInterview = null;
    let currentPost = null;
    let currentPostId = null;

    // Convert post blocks to markdown
    function blocksToMarkdown(blocks) {
        if (!blocks || !Array.isArray(blocks)) {
            return '';
        }

        let markdown = '';

        blocks.forEach(function(block) {
            switch(block.type) {
                case 'heading':
                    const level = block.level || 'h2';
                    const headingLevel = level.replace('h', '');
                    const hashes = '#'.repeat(parseInt(headingLevel));
                    markdown += hashes + ' ' + (block.title || '') + '\n\n';
                    break;

                case 'paragraph':
                    markdown += (block.content || '') + '\n\n';
                    break;

                case 'image':
                    if (block.image) {
                        const alt = block.image.alt || '';
                        const url = block.image.url || '';
                        markdown += '![' + alt + '](' + url + ')\n\n';
                    }
                    break;

                case 'faq':
                    if (block.questions && block.answers) {
                        markdown += '## FAQ\n\n';
                        for (let i = 0; i < block.questions.length; i++) {
                            markdown += '### ' + (block.questions[i] || '') + '\n\n';
                            if (block.answers[i]) {
                                markdown += block.answers[i] + '\n\n';
                            }
                        }
                    }
                    break;
            }
        });

        return markdown.trim();
    }

    // Load post if associated
    function loadPost(postId) {
        if (!postId) {
            return;
        }

        currentPostId = postId;

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_get_post',
                nonce: seoPostifierData.nonce,
                post_id: postId
            },
            success: function(response) {
                if (response.success) {
                    currentPost = response.data.post;
                    // Ensure we have the correct post ID
                    currentPostId = response.data.post._id || response.data.post.id || postId;
                    displayPost(currentPost);
                }
            },
            error: function() {
                console.error('Failed to load post');
            }
        });
    }

    // Display post markdown
    function displayPost(post) {
        if (!post || !post.blocks) {
            return;
        }

        const markdown = blocksToMarkdown(post.blocks);
        
        // Check if marked is available
        if (typeof marked !== 'undefined') {
            // Render markdown to HTML
            const html = marked.parse(markdown);
            $('#post-markdown').html(html);
        } else {
            // Fallback to plain text if marked is not available
            $('#post-markdown').text(markdown);
        }
        
        $('#post-container').show();
    }

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

                    // Load post if associated
                    if (currentInterview.associatedPostId) {
                        loadPost(currentInterview.associatedPostId);
                    }

                    // Update all button states
                    updateButtonStates();
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
                    updateButtonStates();
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
                updateButtonStates();
            }
        });
    });

    // Generate script definition
    $generateScriptDefinitionBtn.on('click', function() {
        const $button = $(this);
        const originalText = $button.text();

        $button.prop('disabled', true).text('<?php _e('Generating...', 'seo-postifier'); ?>');
        $actionStatus.html('<div class="notice notice-info inline"><p><?php _e('Generating script definition. This may take a few minutes...', 'seo-postifier'); ?></p></div>');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            timeout: 180000, // 3 minutes
            data: {
                action: 'seo_postifier_generate_script_definition',
                nonce: seoPostifierData.nonce,
                interview_id: interviewId
            },
            success: function(response) {
                if (response.success) {
                    currentInterview = response.data.interview;
                    displayInterview(currentInterview);
                    $actionStatus.html('<div class="notice notice-success inline"><p>' + response.data.message + '</p></div>');
                    updateButtonStates();
                } else {
                    $actionStatus.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                }
            },
            error: function(xhr, status) {
                let errorMsg = '<?php _e('Failed to generate script definition. Please try again.', 'seo-postifier'); ?>';
                if (status === 'timeout') {
                    errorMsg = '<?php _e('Request timed out. The script definition generation may still be processing.', 'seo-postifier'); ?>';
                }
                $actionStatus.html('<div class="notice notice-error inline"><p>' + errorMsg + '</p></div>');
            },
            complete: function() {
                $button.prop('disabled', false).text(originalText);
                updateButtonStates();
            }
        });
    });

    // Update all button states
    function updateButtonStates() {
        if (!currentInterview) {
            $generateScriptDefinitionBtn.prop('disabled', true);
            $generatePostBtn.prop('disabled', true);
            return;
        }

        const status = currentInterview.status;
        const hasScriptText = status === 'script_text_generated' || status === 'script_definition_generated' || currentInterview.generatedScriptText;
        const hasScriptDefinition = status === 'script_definition_generated' || 
                                   (currentInterview.generatedScriptDefinition && 
                                    currentInterview.generatedScriptDefinition.head && 
                                    currentInterview.generatedScriptDefinition.head.h1);
        const hasPost = currentInterview.associatedPostId;

        // Update Generate Script Definition button
        if (hasScriptDefinition) {
            $generateScriptDefinitionBtn.prop('disabled', true).text('<?php _e('Script Definition Already Generated', 'seo-postifier'); ?>');
        } else if (hasScriptText) {
            $generateScriptDefinitionBtn.prop('disabled', false).text('<?php _e('Generate Script Definition', 'seo-postifier'); ?>');
        } else {
            $generateScriptDefinitionBtn.prop('disabled', true).text('<?php _e('Generate Script Text First', 'seo-postifier'); ?>');
        }

        // Update Generate Post button
        if (hasPost) {
            $generatePostBtn.prop('disabled', true).text('<?php _e('Post Already Generated', 'seo-postifier'); ?>');
        } else if (hasScriptDefinition) {
            $generatePostBtn.prop('disabled', false).text('<?php _e('Generate Post', 'seo-postifier'); ?>');
        } else {
            $generatePostBtn.prop('disabled', true).text('<?php _e('Generate Script Definition First', 'seo-postifier'); ?>');
        }
    }

    // Generate post (with script definition generation first if needed)
    $generatePostBtn.on('click', function() {
        const $button = $(this);
        const originalText = $button.text();

        if ($button.prop('disabled')) {
            return;
        }

        $button.prop('disabled', true).text('<?php _e('Generating...', 'seo-postifier'); ?>');
        $actionStatus.html('<div class="notice notice-info inline"><p><?php _e('Starting post generation process...', 'seo-postifier'); ?></p></div>');

        // First, check if script definition is generated
        const needsScriptDefinition = currentInterview.status !== 'script_definition_generated' || 
                                     !currentInterview.generatedScriptDefinition || 
                                     !currentInterview.generatedScriptDefinition.head ||
                                     !currentInterview.generatedScriptDefinition.head.h1;

        function generatePost() {
            $actionStatus.html('<div class="notice notice-info inline"><p><?php _e('Generating post. This may take several minutes...', 'seo-postifier'); ?></p></div>');

            $.ajax({
                url: seoPostifierData.ajaxUrl,
                type: 'POST',
                timeout: 300000, // 5 minutes
                data: {
                    action: 'seo_postifier_generate_post',
                    nonce: seoPostifierData.nonce,
                    interview_id: interviewId
                },
                success: function(response) {
                    if (response.success) {
                        currentPost = response.data.post;
                        // Get post ID from the post object (_id is MongoDB's default ID field)
                        currentPostId = response.data.post._id || response.data.post.id || null;
                        displayPost(currentPost);
                        
                        // Reload interview to get updated associatedPostId
                        loadInterview();
                        
                        $actionStatus.html('<div class="notice notice-success inline"><p>' + response.data.message + '</p></div>');
                    } else {
                        $actionStatus.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                    }
                },
                error: function(xhr, status) {
                    let errorMsg = '<?php _e('Failed to generate post. Please try again.', 'seo-postifier'); ?>';
                    if (status === 'timeout') {
                        errorMsg = '<?php _e('Request timed out. The post generation may still be processing.', 'seo-postifier'); ?>';
                    }
                    $actionStatus.html('<div class="notice notice-error inline"><p>' + errorMsg + '</p></div>');
                },
                complete: function() {
                    $button.prop('disabled', false).text(originalText);
                    updateButtonStates();
                }
            });
        }

        if (needsScriptDefinition) {
            // First generate script definition
            $actionStatus.html('<div class="notice notice-info inline"><p><?php _e('Generating script definition first. This may take a few minutes...', 'seo-postifier'); ?></p></div>');

            $.ajax({
                url: seoPostifierData.ajaxUrl,
                type: 'POST',
                timeout: 180000, // 3 minutes
                data: {
                    action: 'seo_postifier_generate_script_definition',
                    nonce: seoPostifierData.nonce,
                    interview_id: interviewId
                },
                success: function(response) {
                    if (response.success) {
                        currentInterview = response.data.interview;
                        displayInterview(currentInterview);
                        $actionStatus.html('<div class="notice notice-success inline"><p><?php _e('Script definition generated. Now generating post...', 'seo-postifier'); ?></p></div>');
                        
                        // Now generate the post
                        setTimeout(generatePost, 1000);
                    } else {
                        $actionStatus.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                        $button.prop('disabled', false).text(originalText);
                        updateButtonStates();
                    }
                },
                error: function(xhr, status) {
                    let errorMsg = '<?php _e('Failed to generate script definition. Please try again.', 'seo-postifier'); ?>';
                    if (status === 'timeout') {
                        errorMsg = '<?php _e('Request timed out. The script definition generation may still be processing.', 'seo-postifier'); ?>';
                    }
                    $actionStatus.html('<div class="notice notice-error inline"><p>' + errorMsg + '</p></div>');
                    $button.prop('disabled', false).text(originalText);
                    updateButtonStates();
                }
            });
        } else {
            // Script definition already exists, generate post directly
            generatePost();
        }
    });

    // Create WordPress Draft
    $createWpDraftBtn.on('click', function() {
        // Try to get post ID from currentPost if currentPostId is not set
        if (!currentPostId && currentPost) {
            currentPostId = currentPost._id || currentPost.id;
        }
        
        if (!currentPostId || !currentPost) {
            $wpDraftStatus.html('<div class="notice notice-error inline"><p><?php _e('No post available to create draft.', 'seo-postifier'); ?></p></div>');
            return;
        }

        const $button = $(this);
        const originalText = $button.text();

        $button.prop('disabled', true).text('<?php _e('Creating Draft...', 'seo-postifier'); ?>');
        $wpDraftStatus.html('<div class="notice notice-info inline"><p><?php _e('Creating WordPress draft...', 'seo-postifier'); ?></p></div>');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_create_wp_draft',
                nonce: seoPostifierData.nonce,
                post_id: currentPostId
            },
            success: function(response) {
                if (response.success) {
                    const editUrl = response.data.edit_url;
                    // Show success message briefly, then redirect
                    $wpDraftStatus.html(
                        '<div class="notice notice-success inline">' +
                        '<p><?php _e('WordPress draft created successfully! Redirecting...', 'seo-postifier'); ?></p>' +
                        '</div>'
                    );
                    // Redirect to the edit page after a short delay
                    setTimeout(function() {
                        window.location.href = editUrl;
                    }, 500);
                } else {
                    $wpDraftStatus.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function() {
                $wpDraftStatus.html('<div class="notice notice-error inline"><p><?php _e('Failed to create WordPress draft. Please try again.', 'seo-postifier'); ?></p></div>');
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

    // Load interview on page load
    loadInterview();
});
</script>

