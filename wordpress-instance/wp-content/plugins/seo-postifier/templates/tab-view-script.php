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
            <!-- Interview View/Edit Toggle -->
            <div style="margin-bottom: 20px;">
                <button type="button" id="toggle-edit-mode" class="button button-secondary">
                    <span class="view-mode-text"><?php _e('Edit Interview Parameters', 'seo-postifier'); ?></span>
                    <span class="edit-mode-text" style="display: none;"><?php _e('Cancel Editing', 'seo-postifier'); ?></span>
                </button>
            </div>

            <!-- Interview View Mode -->
            <div id="interview-view-mode">
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
                        <!-- Script Text Editor with Preview -->
                        <div id="script-text-container" style="display: none; margin-bottom: 20px;">
                            <h3><?php _e('Script Text', 'seo-postifier'); ?></h3>
                            <div class="seo-postifier-markdown-editor">
                                <div class="seo-postifier-editor-tabs">
                                    <button type="button" class="editor-tab active" data-tab="edit"><?php _e('Edit', 'seo-postifier'); ?></button>
                                    <button type="button" class="editor-tab" data-tab="preview"><?php _e('Preview', 'seo-postifier'); ?></button>
                                </div>
                                <div class="seo-postifier-editor-content">
                                    <textarea id="script-text-editor" class="seo-postifier-textarea" rows="20"></textarea>
                                    <div id="script-text-preview" class="seo-postifier-markdown-display" style="display: none;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Post Preview -->
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

            <!-- Interview Edit Mode -->
            <div id="interview-edit-mode" style="display: none;">
                <form id="edit-interview-form">
                    <h3><?php _e('Edit Interview Parameters', 'seo-postifier'); ?></h3>
                    
                    <!-- SEO Configuration -->
                    <h3><?php _e('SEO Configuration', 'seo-postifier'); ?></h3>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="edit-main-keyword"><?php _e('Main Keyword', 'seo-postifier'); ?> *</label>
                            </th>
                            <td>
                                <input type="text" id="edit-main-keyword" name="mainKeyword" class="regular-text" required />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="edit-secondary-keywords"><?php _e('Secondary Keywords', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="edit-secondary-keywords" name="secondaryKeywords" class="large-text" />
                                <p class="description"><?php _e('Comma-separated list of secondary keywords', 'seo-postifier'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="edit-keyword-density"><?php _e('Keyword Density Target', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="edit-keyword-density" name="keywordDensityTarget"
                                       min="0" max="1" step="0.001" class="small-text" />
                            </td>
                        </tr>
                    </table>

                    <!-- Content Configuration -->
                    <h3><?php _e('Content Configuration', 'seo-postifier'); ?></h3>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="edit-user-description"><?php _e('Topic Description', 'seo-postifier'); ?> *</label>
                            </th>
                            <td>
                                <textarea id="edit-user-description" name="userDescription" rows="4"
                                          class="large-text" required></textarea>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="edit-language"><?php _e('Language', 'seo-postifier'); ?> *</label>
                            </th>
                            <td>
                                <select id="edit-language" name="language" required>
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                    <option value="it">Italiano</option>
                                    <option value="pt">Português</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="edit-search-intent"><?php _e('Search Intent', 'seo-postifier'); ?> *</label>
                            </th>
                            <td>
                                <select id="edit-search-intent" name="searchIntent" required>
                                    <option value="informational">Informational</option>
                                    <option value="transactional">Transactional</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="navigational">Navigational</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="edit-target-audience"><?php _e('Target Audience', 'seo-postifier'); ?> *</label>
                            </th>
                            <td>
                                <input type="text" id="edit-target-audience" name="targetAudience"
                                       class="regular-text" required />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="edit-tone-of-voice"><?php _e('Tone of Voice', 'seo-postifier'); ?> *</label>
                            </th>
                            <td>
                                <select id="edit-tone-of-voice" name="toneOfVoice" required>
                                    <option value="professional">Professional</option>
                                    <option value="friendly">Friendly</option>
                                    <option value="technical">Technical</option>
                                    <option value="educational">Educational</option>
                                    <option value="casual">Casual</option>
                                    <option value="formal">Formal</option>
                                </select>
                            </td>
                        </tr>
                    </table>

                    <!-- Structure Configuration -->
                    <h3><?php _e('Structure Configuration', 'seo-postifier'); ?></h3>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="edit-min-word-count"><?php _e('Minimum Word Count', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="edit-min-word-count" name="minWordCount"
                                       min="100" class="small-text" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="edit-max-word-count"><?php _e('Maximum Word Count', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="edit-max-word-count" name="maxWordCount"
                                       min="100" class="small-text" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="edit-needs-faq"><?php _e('Include FAQ Section', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="checkbox" id="edit-needs-faq" name="needsFaqSection" value="1" />
                                <label for="edit-needs-faq"><?php _e('Add FAQ section at the end', 'seo-postifier'); ?></label>
                            </td>
                        </tr>
                    </table>

                    <!-- Brand Configuration -->
                    <h3><?php _e('Brand Configuration', 'seo-postifier'); ?></h3>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="edit-mentions-brand"><?php _e('Mention Brand', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="checkbox" id="edit-mentions-brand" name="mentionsBrand" value="1" />
                                <label for="edit-mentions-brand"><?php _e('Include brand mentions', 'seo-postifier'); ?></label>
                            </td>
                        </tr>
                        <tr class="edit-brand-fields" style="display: none;">
                            <th scope="row">
                                <label for="edit-brand-name"><?php _e('Brand Name', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="edit-brand-name" name="brandName" class="regular-text" />
                            </td>
                        </tr>
                        <tr class="edit-brand-fields" style="display: none;">
                            <th scope="row">
                                <label for="edit-brand-description"><?php _e('Brand Description', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <textarea id="edit-brand-description" name="brandDescription" rows="2"
                                          class="large-text"></textarea>
                            </td>
                        </tr>
                    </table>

                    <!-- Links Configuration -->
                    <h3><?php _e('Links Configuration', 'seo-postifier'); ?></h3>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="edit-include-internal-links"><?php _e('Internal Links', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="checkbox" id="edit-include-internal-links"
                                       name="includeInternalLinks" value="1" />
                                <label for="edit-include-internal-links"><?php _e('Include internal links', 'seo-postifier'); ?></label>
                            </td>
                        </tr>
                        <tr class="edit-internal-links-fields" style="display: none;">
                            <th scope="row">
                                <label for="edit-max-internal-links"><?php _e('Max Internal Links', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="edit-max-internal-links" name="maxInternalLinks"
                                       min="0" class="small-text" />
                            </td>
                        </tr>
                        <tr class="edit-internal-links-fields" style="display: none;">
                            <th scope="row">
                                <label for="edit-internal-links-to-use"><?php _e('Internal Links URLs', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <textarea id="edit-internal-links-to-use" name="internalLinksToUse" rows="3"
                                          class="large-text" placeholder="One URL per line"></textarea>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="edit-include-external-links"><?php _e('External Links', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="checkbox" id="edit-include-external-links"
                                       name="includeExternalLinks" value="1" />
                                <label for="edit-include-external-links"><?php _e('Include external links', 'seo-postifier'); ?></label>
                            </td>
                        </tr>
                        <tr class="edit-external-links-fields" style="display: none;">
                            <th scope="row">
                                <label for="edit-max-external-links"><?php _e('Max External Links', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="edit-max-external-links" name="maxExternalLinks"
                                       min="0" class="small-text" />
                            </td>
                        </tr>
                        <tr class="edit-external-links-fields" style="display: none;">
                            <th scope="row">
                                <label for="edit-external-links-to-use"><?php _e('External Links URLs', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <textarea id="edit-external-links-to-use" name="externalLinksToUse" rows="3"
                                          class="large-text" placeholder="One URL per line"></textarea>
                            </td>
                        </tr>
                    </table>

                    <!-- Additional Notes -->
                    <h3><?php _e('Additional Instructions', 'seo-postifier'); ?></h3>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="edit-notes-for-writer"><?php _e('Notes for Writer', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <textarea id="edit-notes-for-writer" name="notesForWriter" rows="3"
                                          class="large-text"></textarea>
                            </td>
                        </tr>
                    </table>

                    <p class="submit">
                        <button type="submit" class="button button-primary button-large">
                            <?php _e('Save Changes', 'seo-postifier'); ?>
                        </button>
                        <button type="button" id="cancel-edit" class="button button-secondary">
                            <?php _e('Cancel', 'seo-postifier'); ?>
                        </button>
                    </p>
                    <div id="edit-interview-status" style="margin-top: 15px;"></div>
                </form>
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
        
        // Populate edit form if in edit mode
        if ($('#interview-edit-mode').is(':visible')) {
            populateEditForm(interview);
        }
        
        // Display script text if available
        if (interview.generatedScriptText) {
            $('#script-text-editor').val(interview.generatedScriptText);
            updateScriptPreview();
            $('#script-text-container').show();
        } else {
            $('#script-text-container').hide();
        }
    }
    
    // Populate edit form with interview data
    function populateEditForm(interview) {
        $('#edit-main-keyword').val(interview.mainKeyword || '');
        $('#edit-secondary-keywords').val(Array.isArray(interview.secondaryKeywords) ? interview.secondaryKeywords.join(', ') : '');
        $('#edit-keyword-density').val(interview.keywordDensityTarget || 0.017);
        $('#edit-user-description').val(interview.userDescription || '');
        $('#edit-language').val(interview.language || 'es');
        $('#edit-search-intent').val(interview.searchIntent || 'informational');
        $('#edit-target-audience').val(interview.targetAudience || '');
        $('#edit-tone-of-voice').val(interview.toneOfVoice || 'friendly');
        $('#edit-min-word-count').val(interview.minWordCount || '');
        $('#edit-max-word-count').val(interview.maxWordCount || '');
        $('#edit-needs-faq').prop('checked', interview.needsFaqSection !== false);
        $('#edit-mentions-brand').prop('checked', interview.mentionsBrand === true);
        $('#edit-brand-name').val(interview.brandName || '');
        $('#edit-brand-description').val(interview.brandDescription || '');
        $('#edit-include-internal-links').prop('checked', interview.includeInternalLinks === true);
        $('#edit-max-internal-links').val(interview.maxInternalLinks || '');
        $('#edit-internal-links-to-use').val(Array.isArray(interview.internalLinksToUse) ? interview.internalLinksToUse.join('\n') : '');
        $('#edit-include-external-links').prop('checked', interview.includeExternalLinks === true);
        $('#edit-max-external-links').val(interview.maxExternalLinks || '');
        $('#edit-external-links-to-use').val(Array.isArray(interview.externalLinksToUse) ? interview.externalLinksToUse.join('\n') : '');
        $('#edit-notes-for-writer').val(interview.notesForWriter || '');
        
        // Toggle conditional fields
        $('.edit-brand-fields').toggle($('#edit-mentions-brand').is(':checked'));
        $('.edit-internal-links-fields').toggle($('#edit-include-internal-links').is(':checked'));
        $('.edit-external-links-fields').toggle($('#edit-include-external-links').is(':checked'));
    }
    
    // Update script text preview
    function updateScriptPreview() {
        const markdown = $('#script-text-editor').val();
        if (typeof marked !== 'undefined') {
            const html = marked.parse(markdown);
            $('#script-text-preview').html(html);
        } else {
            $('#script-text-preview').text(markdown);
        }
    }
    
    // Toggle edit mode
    $('#toggle-edit-mode').on('click', function() {
        const isEditMode = $('#interview-edit-mode').is(':visible');
        if (isEditMode) {
            $('#interview-edit-mode').hide();
            $('#interview-view-mode').show();
            $('.view-mode-text').show();
            $('.edit-mode-text').hide();
        } else {
            if (currentInterview) {
                populateEditForm(currentInterview);
            }
            $('#interview-view-mode').hide();
            $('#interview-edit-mode').show();
            $('.view-mode-text').hide();
            $('.edit-mode-text').show();
        }
    });
    
    // Cancel edit
    $('#cancel-edit').on('click', function() {
        $('#toggle-edit-mode').click();
    });
    
    // Toggle conditional fields in edit form
    $('#edit-mentions-brand').on('change', function() {
        $('.edit-brand-fields').toggle($(this).is(':checked'));
    });
    
    $('#edit-include-internal-links').on('change', function() {
        $('.edit-internal-links-fields').toggle($(this).is(':checked'));
    });
    
    $('#edit-include-external-links').on('change', function() {
        $('.edit-external-links-fields').toggle($(this).is(':checked'));
    });
    
    // Markdown editor tabs
    $('.editor-tab').on('click', function() {
        const tab = $(this).data('tab');
        $('.editor-tab').removeClass('active');
        $(this).addClass('active');
        
        if (tab === 'edit') {
            $('#script-text-editor').show();
            $('#script-text-preview').hide();
        } else {
            updateScriptPreview();
            $('#script-text-editor').hide();
            $('#script-text-preview').show();
        }
    });
    
    // Update preview on script text change
    $('#script-text-editor').on('input', function() {
        if ($('.editor-tab[data-tab="preview"]').hasClass('active')) {
            updateScriptPreview();
        }
    });
    
    // Handle edit form submission
    $('#edit-interview-form').on('submit', function(e) {
        e.preventDefault();
        
        const $status = $('#edit-interview-status');
        const $button = $(this).find('button[type="submit"]');
        const originalText = $button.text();
        
        $button.prop('disabled', true).text('<?php _e('Saving...', 'seo-postifier'); ?>');
        $status.html('');
        
        // Helper function to split string into array and filter empty values
        const splitAndFilter = (str, delimiter) => {
            if (!str || typeof str !== 'string') return [];
            return str.split(delimiter)
                .map(item => item.trim())
                .filter(item => item.length > 0);
        };
        
        // Collect form data
        const formData = {
            interviewId: interviewId,
            mainKeyword: $('#edit-main-keyword').val(),
            secondaryKeywords: splitAndFilter($('#edit-secondary-keywords').val(), ','),
            keywordDensityTarget: parseFloat($('#edit-keyword-density').val()) || undefined,
            userDescription: $('#edit-user-description').val(),
            language: $('#edit-language').val(),
            searchIntent: $('#edit-search-intent').val(),
            targetAudience: $('#edit-target-audience').val(),
            toneOfVoice: $('#edit-tone-of-voice').val(),
            minWordCount: $('#edit-min-word-count').val() ? parseInt($('#edit-min-word-count').val()) : undefined,
            maxWordCount: $('#edit-max-word-count').val() ? parseInt($('#edit-max-word-count').val()) : undefined,
            needsFaqSection: $('#edit-needs-faq').is(':checked'),
            mentionsBrand: $('#edit-mentions-brand').is(':checked'),
            brandName: $('#edit-brand-name').val() || undefined,
            brandDescription: $('#edit-brand-description').val() || undefined,
            includeInternalLinks: $('#edit-include-internal-links').is(':checked'),
            maxInternalLinks: $('#edit-max-internal-links').val() ? parseInt($('#edit-max-internal-links').val()) : undefined,
            internalLinksToUse: splitAndFilter($('#edit-internal-links-to-use').val(), '\n'),
            includeExternalLinks: $('#edit-include-external-links').is(':checked'),
            maxExternalLinks: $('#edit-max-external-links').val() ? parseInt($('#edit-max-external-links').val()) : undefined,
            externalLinksToUse: splitAndFilter($('#edit-external-links-to-use').val(), '\n'),
            notesForWriter: $('#edit-notes-for-writer').val() || undefined
        };
        
        // Remove undefined values
        Object.keys(formData).forEach(key => {
            if (formData[key] === undefined) {
                delete formData[key];
            }
        });
        
        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_update_interview',
                nonce: seoPostifierData.nonce,
                interview_data: formData
            },
            success: function(response) {
                if (response.success) {
                    currentInterview = response.data.interview;
                    displayInterview(currentInterview);
                    $status.html('<div class="notice notice-success inline"><p>' + response.data.message + '</p></div>');
                    
                    // Switch back to view mode
                    setTimeout(function() {
                        $('#toggle-edit-mode').click();
                        updateButtonStates();
                    }, 1000);
                } else {
                    $status.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                }
            },
            error: function(xhr, status, error) {
                let errorMsg = '<?php _e('Failed to update interview. Please try again.', 'seo-postifier'); ?>';
                if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                    errorMsg = xhr.responseJSON.data.message;
                }
                $status.html('<div class="notice notice-error inline"><p>' + errorMsg + '</p></div>');
            },
            complete: function() {
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

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
            error: function(xhr, status, error) {
                let errorMsg = '<?php _e('Failed to generate script text. Please try again.', 'seo-postifier'); ?>';
                
                // Check if we got a response with error details
                if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                    errorMsg = xhr.responseJSON.data.message;
                } else if (xhr.status === 0) {
                    errorMsg = '<?php _e('Connection failed. Please check your backend URL settings.', 'seo-postifier'); ?>';
                } else if (status === 'timeout') {
                    errorMsg = '<?php _e('Request timed out. The script generation may still be processing.', 'seo-postifier'); ?>';
                } else if (xhr.status === 400) {
                    errorMsg = '<?php _e('Invalid request. Please check the interview ID.', 'seo-postifier'); ?>';
                } else if (xhr.status === 401) {
                    errorMsg = '<?php _e('Authentication failed. Please check your license key.', 'seo-postifier'); ?>';
                } else if (xhr.status === 404) {
                    errorMsg = '<?php _e('Interview not found.', 'seo-postifier'); ?>';
                } else if (xhr.status === 500) {
                    errorMsg = '<?php _e('Server error. Please try again later.', 'seo-postifier'); ?>';
                }
                
                console.error('Script text generation error:', {
                    status: xhr.status,
                    statusText: status,
                    error: error,
                    response: xhr.responseText
                });
                
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

