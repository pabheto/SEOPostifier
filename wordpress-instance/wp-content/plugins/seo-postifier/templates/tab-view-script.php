<?php
/**
 * View Script Template - Simplified to show only settings
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
        <h2><?php _e('Draft Settings', 'seo-postifier'); ?></h2>
        
        <p>
            <a href="?page=seo-postifier&tab=scripts" class="button button-secondary">
                <?php _e('← Back to My Drafts', 'seo-postifier'); ?>
            </a>
        </p>

        <div id="loading-interview" style="margin: 20px 0;">
            <p><?php _e('Loading draft data...', 'seo-postifier'); ?></p>
        </div>

        <div id="interview-container" style="display: none; margin-top: 20px;">
            <!-- Tab Navigation -->
            <div class="seo-postifier-form-tabs">
                <button type="button" class="form-tab active" data-tab="draft">
                    <?php _e('New Draft', 'seo-postifier'); ?>
                </button>
                <button type="button" class="form-tab" data-tab="settings">
                    <?php _e('Settings', 'seo-postifier'); ?>
                </button>
            </div>

            <!-- Edit Form -->
            <form id="edit-interview-form" style="margin-top: 20px;">
                
                <!-- Tab 1: New Draft -->
                <div id="tab-draft" class="form-tab-content active">
                    <h3><?php _e('Draft Information', 'seo-postifier'); ?></h3>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="edit-main-keyword"><?php _e('Main Keyword', 'seo-postifier'); ?> *</label>
                            </th>
                            <td>
                                <input type="text" id="edit-main-keyword" name="mainKeyword" class="regular-text" required />
                                <p class="description"><?php _e('Primary keyword to optimize for', 'seo-postifier'); ?></p>
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
                                <label for="edit-user-description"><?php _e('Post Description', 'seo-postifier'); ?> *</label>
                            </th>
                            <td>
                                <textarea id="edit-user-description" name="userDescription" rows="6"
                                          class="large-text" required></textarea>
                                <p class="description"><?php _e('Describe what the post should be about', 'seo-postifier'); ?></p>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Tab 2: Settings -->
                <div id="tab-settings" class="form-tab-content">
                    <h3><?php _e('Advanced Settings', 'seo-postifier'); ?></h3>
                    <p class="description"><?php _e('Configure additional settings for your draft. Click on each section to expand.', 'seo-postifier'); ?></p>

                    <!-- Accordion: Images -->
                    <div class="settings-accordion">
                        <div class="accordion-header">
                            <h4><?php _e('Images', 'seo-postifier'); ?></h4>
                            <span class="accordion-toggle">▼</span>
                        </div>
                        <div class="accordion-content">
                            <table class="form-table">
                                <tr>
                                    <th scope="row">
                                        <label for="edit-ai-images-count"><?php _e('AI Images Count', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <input type="number" id="edit-ai-images-count" name="aiImagesCount"
                                               value="3" min="0" class="small-text" />
                                        <p class="description"><?php _e('Number of AI-generated images to create', 'seo-postifier'); ?></p>
                                    </td>
                                </tr>
                                <tr id="edit-ai-images-custom-descriptions-row" style="display: none;">
                                    <th scope="row">
                                        <label for="edit-use-custom-ai-descriptions"><?php _e('Custom AI Descriptions', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <input type="checkbox" id="edit-use-custom-ai-descriptions" name="useCustomAiDescriptions" value="1" />
                                        <label for="edit-use-custom-ai-descriptions"><?php _e('Provide custom descriptions for each AI image', 'seo-postifier'); ?></label>
                                    </td>
                                </tr>
                                <tr id="edit-ai-images-descriptions-container" style="display: none;">
                                    <td colspan="2">
                                        <div id="edit-ai-images-descriptions-list"></div>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label><?php _e('User Images', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <button type="button" id="edit-add-user-image" class="button button-secondary">
                                            <?php _e('+ Add User Image', 'seo-postifier'); ?>
                                        </button>
                                        <p class="description"><?php _e('Add your own images to be used in the post', 'seo-postifier'); ?></p>
                                        <div id="edit-user-images-list" style="margin-top: 15px;"></div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- Accordion: Keyword Usage -->
                    <div class="settings-accordion">
                        <div class="accordion-header">
                            <h4><?php _e('Keyword Usage', 'seo-postifier'); ?></h4>
                            <span class="accordion-toggle">▼</span>
                        </div>
                        <div class="accordion-content">
                            <table class="form-table">
                                <tr>
                                    <th scope="row">
                                        <label for="edit-keyword-density"><?php _e('Keyword Density Target', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <input type="number" id="edit-keyword-density" name="keywordDensityTarget"
                                               value="0.015" min="0" max="1" step="0.001" class="small-text" />
                                        <p class="description"><?php _e('Target keyword density (0-1, default: 0.015)', 'seo-postifier'); ?></p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- Accordion: Style and Audience -->
                    <div class="settings-accordion">
                        <div class="accordion-header">
                            <h4><?php _e('Style and Audience', 'seo-postifier'); ?></h4>
                            <span class="accordion-toggle">▼</span>
                        </div>
                        <div class="accordion-content">
                            <table class="form-table">
                                <tr>
                                    <th scope="row">
                                        <label for="edit-language"><?php _e('Language', 'seo-postifier'); ?> *</label>
                                    </th>
                                    <td>
                                        <select id="edit-language" name="language" required>
                                            <option value="en">English</option>
                                            <option value="es" selected>Español</option>
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
                                            <option value="informational" selected>Informational</option>
                                            <option value="transactional">Transactional</option>
                                            <option value="commercial">Commercial</option>
                                            <option value="navigational">Navigational</option>
                                        </select>
                                        <p class="description"><?php _e('User\'s search intent type', 'seo-postifier'); ?></p>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="edit-target-audience"><?php _e('Target Audience', 'seo-postifier'); ?> *</label>
                                    </th>
                                    <td>
                                        <input type="text" id="edit-target-audience" name="targetAudience"
                                               class="regular-text" value="General audience" required />
                                        <p class="description"><?php _e('Describe your target audience', 'seo-postifier'); ?></p>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="edit-tone-of-voice"><?php _e('Tone of Voice', 'seo-postifier'); ?> *</label>
                                    </th>
                                    <td>
                                        <select id="edit-tone-of-voice" name="toneOfVoice" required>
                                            <option value="professional">Professional</option>
                                            <option value="friendly" selected>Friendly</option>
                                            <option value="technical">Technical</option>
                                            <option value="educational">Educational</option>
                                            <option value="casual">Casual</option>
                                            <option value="formal">Formal</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="edit-min-word-count"><?php _e('Minimum Word Count', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <input type="number" id="edit-min-word-count" name="minWordCount"
                                               value="2000" min="100" class="small-text" />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="edit-max-word-count"><?php _e('Maximum Word Count', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <input type="number" id="edit-max-word-count" name="maxWordCount"
                                               value="2500" min="100" class="small-text" />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="edit-needs-faq"><?php _e('Include FAQ Section', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <input type="checkbox" id="edit-needs-faq" name="needsFaqSection" value="1" checked />
                                        <label for="edit-needs-faq"><?php _e('Add FAQ section at the end', 'seo-postifier'); ?></label>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="edit-notes-for-writer"><?php _e('Additional Instructions', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <textarea id="edit-notes-for-writer" name="notesForWriter" rows="3"
                                                  class="large-text"></textarea>
                                        <p class="description"><?php _e('Any additional instructions or requirements', 'seo-postifier'); ?></p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- Accordion: Link Mentions -->
                    <div class="settings-accordion">
                        <div class="accordion-header">
                            <h4><?php _e('Link Mentions', 'seo-postifier'); ?></h4>
                            <span class="accordion-toggle">▼</span>
                        </div>
                        <div class="accordion-content">
                            <table class="form-table">
                                <tr>
                                    <th scope="row">
                                        <label for="edit-include-internal-links"><?php _e('Internal Links', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <input type="checkbox" id="edit-include-internal-links"
                                               name="includeInternalLinks" value="1" checked />
                                        <label for="edit-include-internal-links"><?php _e('Include internal links', 'seo-postifier'); ?></label>
                                    </td>
                                </tr>
                                <tr class="edit-internal-links-fields">
                                    <th scope="row">
                                        <label for="edit-internal-links-to-use"><?php _e('Internal Links URLs', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <textarea id="edit-internal-links-to-use" name="internalLinksToUse" rows="3"
                                                  class="large-text" placeholder="One URL per line"></textarea>
                                        <p class="description"><?php _e('Specific internal links to include (one per line)', 'seo-postifier'); ?></p>
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
                                        <label for="edit-external-links-to-include-automatically"><?php _e('External Links to Include Automatically', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <input type="number" id="edit-external-links-to-include-automatically" name="externalLinksToIncludeAutomatically"
                                               value="2" min="0" class="small-text" />
                                        <p class="description"><?php _e('Number of external links to automatically include', 'seo-postifier'); ?></p>
                                    </td>
                                </tr>
                                <tr class="edit-external-links-fields" style="display: none;">
                                    <th scope="row">
                                        <label for="edit-external-links-to-use"><?php _e('External Links URLs', 'seo-postifier'); ?></label>
                                    </th>
                                    <td>
                                        <textarea id="edit-external-links-to-use" name="externalLinksToUse" rows="3"
                                                  class="large-text" placeholder="One URL per line"></textarea>
                                        <p class="description"><?php _e('Specific external links to include (one per line)', 'seo-postifier'); ?></p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- Accordion: Brand Mentions -->
                    <div class="settings-accordion">
                        <div class="accordion-header">
                            <h4><?php _e('Brand Mentions', 'seo-postifier'); ?></h4>
                            <span class="accordion-toggle">▼</span>
                        </div>
                        <div class="accordion-content">
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
                        </div>
                    </div>
                </div>

                <p class="submit" style="margin-top: 20px;">
                    <button type="submit" id="update-settings-btn" class="button button-primary button-large">
                        <?php _e('Update Settings & Re-create Post', 'seo-postifier'); ?>
                    </button>
                </p>
                <div id="update-status" style="margin-top: 15px;"></div>
            </form>
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
    
    let currentInterview = null;

    // Tab switching
    $('.form-tab').on('click', function() {
        const tab = $(this).data('tab');
        $('.form-tab').removeClass('active');
        $(this).addClass('active');
        $('.form-tab-content').removeClass('active');
        $('#tab-' + tab).addClass('active');
    });

    // Accordion functionality
    $('.accordion-header').on('click', function() {
        const $accordion = $(this).closest('.settings-accordion');
        const $content = $accordion.find('.accordion-content');
        const $toggle = $(this).find('.accordion-toggle');
        
        $accordion.toggleClass('active');
        $content.slideToggle(200);
        $toggle.toggleClass('expanded');
    });

    // Initialize accordions - all closed by default
    $('.accordion-content').hide();
    $('.accordion-toggle').addClass('expanded');

    // Toggle conditional fields
    $('#edit-mentions-brand').on('change', function() {
        if ($(this).is(':checked')) {
            $('.edit-brand-fields').show();
        } else {
            $('.edit-brand-fields').hide();
        }
    });
    
    $('#edit-include-internal-links').on('change', function() {
        if ($(this).is(':checked')) {
            $('.edit-internal-links-fields').show();
        } else {
            $('.edit-internal-links-fields').hide();
        }
    });
    
    $('#edit-include-external-links').on('change', function() {
        if ($(this).is(':checked')) {
            $('.edit-external-links-fields').show();
        } else {
            $('.edit-external-links-fields').hide();
        }
    });

    // Image configuration handlers
    let editUserImageCounter = 0;
    let editAiImagesCount = 3;

    // Handle AI images count change
    $('#edit-ai-images-count').on('change', function() {
        editAiImagesCount = parseInt($(this).val()) || 3;
        if (editAiImagesCount > 1) {
            $('#edit-ai-images-custom-descriptions-row').show();
        } else {
            $('#edit-ai-images-custom-descriptions-row').hide();
            $('#edit-use-custom-ai-descriptions').prop('checked', false);
            $('#edit-ai-images-descriptions-container').hide();
        }
        updateEditAiDescriptionsList();
    });

    // Handle custom AI descriptions checkbox
    $('#edit-use-custom-ai-descriptions').on('change', function() {
        if ($(this).is(':checked')) {
            $('#edit-ai-images-descriptions-container').show();
            updateEditAiDescriptionsList();
        } else {
            $('#edit-ai-images-descriptions-container').hide();
        }
    });

    // Update AI descriptions list
    function updateEditAiDescriptionsList() {
        const container = $('#edit-ai-images-descriptions-list');
        container.empty();
        
        if (! $('#edit-use-custom-ai-descriptions').is(':checked')) {
            return;
        }

        const count = parseInt($('#edit-ai-images-count').val()) || 3;
        for (let i = 0; i < count; i++) {
            const item = $('<div class="ai-image-description-item" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;"></div>');
            item.append('<label style="display: block; font-weight: 600; margin-bottom: 5px;">' + 
                '<?php _e('Image', 'seo-postifier'); ?> ' + (i + 1) + ':</label>');
            item.append('<textarea class="large-text edit-ai-image-description" data-index="' + i + '" ' +
                'placeholder="<?php _e('Describe what this image should show...', 'seo-postifier'); ?>" ' +
                'rows="2" style="width: 100%;"></textarea>');
            container.append(item);
        }
    }

    // Add user image
    $('#edit-add-user-image').on('click', function() {
        const imageId = 'edit-user-image-' + editUserImageCounter++;
        const item = $('<div class="edit-user-image-item" data-id="' + imageId + '" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;"></div>');
        
        item.append('<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
            '<strong><?php _e('User Image', 'seo-postifier'); ?> #' + (editUserImageCounter) + '</strong>' +
            '<button type="button" class="button button-link-delete edit-remove-user-image" style="color: #b32d2e;">' +
            '<?php _e('Remove', 'seo-postifier'); ?></button></div>');
        
        item.append('<table class="form-table" style="margin: 0;"><tbody>');
        
        // Source Type
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php _e('Source Type', 'seo-postifier'); ?></label></th>' +
            '<td style="padding: 10px 0;"><input type="text" class="regular-text edit-user-image-source-type" ' +
            'placeholder="<?php _e('e.g., url, wordpress_id', 'seo-postifier'); ?>" /></td>' +
            '</tr>');
        
        // Source Value (Link)
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php _e('Link/URL', 'seo-postifier'); ?> *</label></th>' +
            '<td style="padding: 10px 0;"><input type="text" class="regular-text edit-user-image-source-value" ' +
            'placeholder="<?php _e('Image URL or WordPress ID', 'seo-postifier'); ?>" required /></td>' +
            '</tr>');
        
        // Suggested Alt
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php _e('Alt Text', 'seo-postifier'); ?></label></th>' +
            '<td style="padding: 10px 0;"><input type="text" class="regular-text edit-user-image-alt" ' +
            'placeholder="<?php _e('Suggested alt text for the image', 'seo-postifier'); ?>" /></td>' +
            '</tr>');
        
        // Image Description
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php _e('Image Description', 'seo-postifier'); ?></label></th>' +
            '<td style="padding: 10px 0;"><textarea class="large-text edit-user-image-description" rows="2" ' +
            'placeholder="<?php _e('Describe the image and what it shows', 'seo-postifier'); ?>"></textarea></td>' +
            '</tr>');
        
        // Usage Notes
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php _e('Usage Notes', 'seo-postifier'); ?></label></th>' +
            '<td style="padding: 10px 0;"><textarea class="large-text edit-user-image-notes" rows="2" ' +
            'placeholder="<?php _e('How should this image be used in the post?', 'seo-postifier'); ?>"></textarea></td>' +
            '</tr>');
        
        item.find('tbody').append('</tbody></table>');
        
        $('#edit-user-images-list').append(item);
        
        // Remove button handler
        item.find('.edit-remove-user-image').on('click', function() {
            item.remove();
        });
    });

    // Initialize AI images count handler
    $('#edit-ai-images-count').trigger('change');

    // Populate edit form with interview data
    function populateEditForm(interview) {
        $('#edit-main-keyword').val(interview.mainKeyword || '');
        $('#edit-secondary-keywords').val(Array.isArray(interview.secondaryKeywords) ? interview.secondaryKeywords.join(', ') : '');
        $('#edit-keyword-density').val(interview.keywordDensityTarget || 0.015);
        $('#edit-user-description').val(interview.userDescription || '');
        $('#edit-language').val(interview.language || 'es');
        $('#edit-search-intent').val(interview.searchIntent || 'informational');
        $('#edit-target-audience').val(interview.targetAudience || 'General audience');
        $('#edit-tone-of-voice').val(interview.toneOfVoice || 'friendly');
        $('#edit-min-word-count').val(interview.minWordCount || '2000');
        $('#edit-max-word-count').val(interview.maxWordCount || '2500');
        $('#edit-needs-faq').prop('checked', interview.needsFaqSection !== false);
        $('#edit-mentions-brand').prop('checked', interview.mentionsBrand === true);
        $('#edit-brand-name').val(interview.brandName || '');
        $('#edit-brand-description').val(interview.brandDescription || '');
        $('#edit-include-internal-links').prop('checked', interview.includeInternalLinks === true);
        $('#edit-internal-links-to-use').val(Array.isArray(interview.internalLinksToUse) ? interview.internalLinksToUse.join('\n') : '');
        $('#edit-include-external-links').prop('checked', interview.includeExternalLinks === true);
        $('#edit-external-links-to-include-automatically').val(interview.externalLinksToIncludeAutomatically || '2');
        $('#edit-external-links-to-use').val(Array.isArray(interview.externalLinksToUse) ? interview.externalLinksToUse.join('\n') : '');
        $('#edit-notes-for-writer').val(interview.notesForWriter || '');
        
        // Populate image configuration
        const imagesConfig = interview.imagesConfig || {};
        $('#edit-ai-images-count').val(imagesConfig.aiImagesCount || 3);
        $('#edit-ai-images-count').trigger('change');
        
        if (imagesConfig.useCustomAiDescriptions && imagesConfig.aiImagesUserDescriptions) {
            $('#edit-use-custom-ai-descriptions').prop('checked', true);
            $('#edit-use-custom-ai-descriptions').trigger('change');
            setTimeout(function() {
                imagesConfig.aiImagesUserDescriptions.forEach(function(desc, index) {
                    $('.edit-ai-image-description[data-index="' + index + '"]').val(desc || '');
                });
            }, 100);
        }
        
        // Populate user images
        $('#edit-user-images-list').empty();
        editUserImageCounter = 0;
        if (imagesConfig.useUserImages && Array.isArray(imagesConfig.userImages)) {
            imagesConfig.userImages.forEach(function(userImage) {
                if (userImage.sourceValue) {
                    $('#edit-add-user-image').trigger('click');
                    const $lastItem = $('#edit-user-images-list .edit-user-image-item').last();
                    $lastItem.find('.edit-user-image-source-type').val(userImage.sourceType || '');
                    $lastItem.find('.edit-user-image-source-value').val(userImage.sourceValue || '');
                    $lastItem.find('.edit-user-image-alt').val(userImage.suggestedAlt || '');
                    if (userImage.notes) {
                        const notesParts = userImage.notes.split('\n\nUsage: ');
                        $lastItem.find('.edit-user-image-description').val(notesParts[0] || '');
                        if (notesParts[1]) {
                            $lastItem.find('.edit-user-image-notes').val(notesParts[1] || '');
                        }
                    }
                }
            });
        }
        
        // Toggle conditional fields
        $('.edit-brand-fields').toggle($('#edit-mentions-brand').is(':checked'));
        $('.edit-internal-links-fields').toggle($('#edit-include-internal-links').is(':checked'));
        $('.edit-external-links-fields').toggle($('#edit-include-external-links').is(':checked'));
    }

    // Helper function to split string into array
    const splitAndFilter = (str, delimiter) => {
        if (!str || typeof str !== 'string') return [];
        return str.split(delimiter)
            .map(item => item.trim())
            .filter(item => item.length > 0);
    };

    // Update settings form submission
    $('#edit-interview-form').on('submit', function(e) {
        e.preventDefault();
        
        const $status = $('#update-status');
        const $button = $('#update-settings-btn');
        const originalText = $button.text();
        
        $button.prop('disabled', true).text('<?php _e('Updating...', 'seo-postifier'); ?>');
        $status.html('');

        // Collect images configuration
        const aiImagesCountInput = $('#edit-ai-images-count').val();
        const aiImagesCount = (aiImagesCountInput !== '' && !isNaN(parseInt(aiImagesCountInput))) 
            ? parseInt(aiImagesCountInput) 
            : 3;
        const useCustomAiDescriptions = $('#edit-use-custom-ai-descriptions').is(':checked');
        const aiImagesUserDescriptions = [];
        
        if (useCustomAiDescriptions && aiImagesCount > 0) {
            $('.edit-ai-image-description').each(function() {
                const desc = $(this).val().trim();
                if (desc) {
                    aiImagesUserDescriptions.push(desc);
                }
            });
        }
        
        const userImages = [];
        $('.edit-user-image-item').each(function() {
            const $item = $(this);
            const sourceValue = $item.find('.edit-user-image-source-value').val().trim();
            
            if (sourceValue) {
                const imageDescription = $item.find('.edit-user-image-description').val().trim();
                const usageNotes = $item.find('.edit-user-image-notes').val().trim();
                
                let notes = '';
                if (imageDescription) {
                    notes = imageDescription;
                }
                if (usageNotes) {
                    notes += (notes ? '\n\n' : '') + 'Usage: ' + usageNotes;
                }
                
                userImages.push({
                    sourceType: $item.find('.edit-user-image-source-type').val().trim() || 'url',
                    sourceValue: sourceValue,
                    suggestedAlt: $item.find('.edit-user-image-alt').val().trim() || undefined,
                    notes: notes || undefined
                });
            }
        });
        
        const imagesConfig = {
            aiImagesCount: aiImagesCount
        };
        
        if (aiImagesUserDescriptions.length > 0) {
            imagesConfig.aiImagesUserDescriptions = aiImagesUserDescriptions;
        }
        if (userImages.length > 0) {
            imagesConfig.useUserImages = true;
            imagesConfig.userImages = userImages;
        }

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
            internalLinksToUse: splitAndFilter($('#edit-internal-links-to-use').val(), '\n'),
            includeExternalLinks: $('#edit-include-external-links').is(':checked'),
            externalLinksToIncludeAutomatically: $('#edit-external-links-to-include-automatically').val() ? parseInt($('#edit-external-links-to-include-automatically').val()) : undefined,
            externalLinksToUse: splitAndFilter($('#edit-external-links-to-use').val(), '\n'),
            notesForWriter: $('#edit-notes-for-writer').val() || undefined,
            imagesConfig: imagesConfig
        };

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
                    $status.html('<div class="notice notice-info inline"><p><?php _e('Settings updated. Generating script text...', 'seo-postifier'); ?></p></div>');
                    $button.text('<?php _e('Generating Script Text...', 'seo-postifier'); ?>');
                    
                    // Step 1: Generate script text
                    $.ajax({
                        url: seoPostifierData.ajaxUrl,
                        type: 'POST',
                        timeout: 180000,
                        data: {
                            action: 'seo_postifier_generate_script_text',
                            nonce: seoPostifierData.nonce,
                            interview_id: interviewId
                        },
                        success: function(genResponse) {
                            if (genResponse.success) {
                                $status.html('<div class="notice notice-info inline"><p><?php _e('Script text generated. Generating script definition...', 'seo-postifier'); ?></p></div>');
                                $button.text('<?php _e('Generating Script Definition...', 'seo-postifier'); ?>');
                                
                                // Step 2: Generate script definition
                                $.ajax({
                                    url: seoPostifierData.ajaxUrl,
                                    type: 'POST',
                                    timeout: 180000,
                                    data: {
                                        action: 'seo_postifier_generate_script_definition',
                                        nonce: seoPostifierData.nonce,
                                        interview_id: interviewId
                                    },
                                    success: function(defResponse) {
                                        if (defResponse.success) {
                                            $status.html('<div class="notice notice-info inline"><p><?php _e('Script definition generated. Generating post...', 'seo-postifier'); ?></p></div>');
                                            $button.text('<?php _e('Generating Post...', 'seo-postifier'); ?>');
                                            
                                            // Step 3: Generate post
                                            $.ajax({
                                                url: seoPostifierData.ajaxUrl,
                                                type: 'POST',
                                                timeout: 300000,
                                                data: {
                                                    action: 'seo_postifier_generate_post',
                                                    nonce: seoPostifierData.nonce,
                                                    interview_id: interviewId
                                                },
                                                success: function(postResponse) {
                                                    if (postResponse.success) {
                                                        const postId = postResponse.data.post._id || postResponse.data.post.id;
                                                        $status.html('<div class="notice notice-info inline"><p><?php _e('Post generated. Creating WordPress draft...', 'seo-postifier'); ?></p></div>');
                                                        $button.text('<?php _e('Creating WordPress Draft...', 'seo-postifier'); ?>');
                                                        
                                                        // Step 4: Create WordPress draft
                                                        $.ajax({
                                                            url: seoPostifierData.ajaxUrl,
                                                            type: 'POST',
                                                            data: {
                                                                action: 'seo_postifier_create_wp_draft',
                                                                nonce: seoPostifierData.nonce,
                                                                post_id: postId
                                                            },
                                                            success: function(draftResponse) {
                                                                if (draftResponse.success) {
                                                                    $status.html('<div class="notice notice-success inline"><p><?php _e('Settings updated and WordPress draft re-created successfully! Redirecting...', 'seo-postifier'); ?></p></div>');
                                                                    setTimeout(function() {
                                                                        window.location.href = draftResponse.data.edit_url;
                                                                    }, 1000);
                                                                } else {
                                                                    $status.html('<div class="notice notice-warning inline"><p><?php _e('Post generated but draft creation failed: ', 'seo-postifier'); ?>' + (draftResponse.data.message || '<?php _e('Unknown error', 'seo-postifier'); ?>') + '</p></div>');
                                                                    $button.prop('disabled', false).text(originalText);
                                                                }
                                                            },
                                                            error: function() {
                                                                $status.html('<div class="notice notice-warning inline"><p><?php _e('Post generated but draft creation failed. Please try creating manually.', 'seo-postifier'); ?></p></div>');
                                                                $button.prop('disabled', false).text(originalText);
                                                            }
                                                        });
                                                    } else {
                                                        $status.html('<div class="notice notice-error inline"><p><?php _e('Failed to generate post: ', 'seo-postifier'); ?>' + (postResponse.data.message || '<?php _e('Unknown error', 'seo-postifier'); ?>') + '</p></div>');
                                                        $button.prop('disabled', false).text(originalText);
                                                    }
                                                },
                                                error: function() {
                                                    $status.html('<div class="notice notice-error inline"><p><?php _e('Failed to generate post. Please try again.', 'seo-postifier'); ?></p></div>');
                                                    $button.prop('disabled', false).text(originalText);
                                                }
                                            });
                                        } else {
                                            $status.html('<div class="notice notice-error inline"><p><?php _e('Failed to generate script definition: ', 'seo-postifier'); ?>' + (defResponse.data.message || '<?php _e('Unknown error', 'seo-postifier'); ?>') + '</p></div>');
                                            $button.prop('disabled', false).text(originalText);
                                        }
                                    },
                                    error: function() {
                                        $status.html('<div class="notice notice-error inline"><p><?php _e('Failed to generate script definition. Please try again.', 'seo-postifier'); ?></p></div>');
                                        $button.prop('disabled', false).text(originalText);
                                    }
                                });
                            } else {
                                $status.html('<div class="notice notice-error inline"><p><?php _e('Failed to generate script text: ', 'seo-postifier'); ?>' + (genResponse.data.message || '<?php _e('Unknown error', 'seo-postifier'); ?>') + '</p></div>');
                                $button.prop('disabled', false).text(originalText);
                            }
                        },
                        error: function() {
                            $status.html('<div class="notice notice-error inline"><p><?php _e('Failed to generate script text. Please try again.', 'seo-postifier'); ?></p></div>');
                            $button.prop('disabled', false).text(originalText);
                        }
                    });
                } else {
                    $status.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function(xhr, status, error) {
                let errorMsg = '<?php _e('Failed to update settings.', 'seo-postifier'); ?>';
                if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                    errorMsg = xhr.responseJSON.data.message;
                }
                $status.html('<div class="notice notice-error inline"><p>' + errorMsg + '</p></div>');
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

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
                    populateEditForm(currentInterview);
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

    // Load interview on page load
    loadInterview();
});
</script>
