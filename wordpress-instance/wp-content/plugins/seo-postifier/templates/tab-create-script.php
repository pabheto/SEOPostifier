<?php
/**
 * Create Script Template - Unified Form with Tabs
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Determine if we're in create or edit mode
$interview_id = isset($_GET['interviewId']) ? sanitize_text_field($_GET['interviewId']) : '';
$is_edit_mode = !empty($interview_id);
$mode = $is_edit_mode ? 'edit' : 'create';
?>

<div class="seo-postifier-create-script">
    <div class="card">
        <h2><?php echo $is_edit_mode ? __('Edit Draft', 'seo-postifier') : __('Create New Draft', 'seo-postifier'); ?></h2>
        <p><?php echo $is_edit_mode ? __('Update your draft parameters and settings.', 'seo-postifier') : __('Define the SEO specifications for your new draft.', 'seo-postifier'); ?></p>

        <p>
            <a href="?page=seo-postifier&tab=scripts" class="button button-secondary">
                <?php _e('← Back to My Drafts', 'seo-postifier'); ?>
            </a>
        </p>

        <!-- Tab Navigation -->
        <div class="seo-postifier-form-tabs">
            <button type="button" class="form-tab active" data-tab="draft">
                <?php _e('New Draft', 'seo-postifier'); ?>
            </button>
            <button type="button" class="form-tab" data-tab="settings">
                <?php _e('Settings', 'seo-postifier'); ?>
            </button>
        </div>

        <form id="create-script-form" data-mode="<?php echo esc_attr($mode); ?>" data-interview-id="<?php echo esc_attr($interview_id); ?>" style="margin-top: 20px;">
            
            <!-- Tab 1: New Draft -->
            <div id="tab-draft" class="form-tab-content active">
                <h3><?php _e('Draft Information', 'seo-postifier'); ?></h3>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="main-keyword"><?php _e('Main Keyword', 'seo-postifier'); ?> *</label>
                        </th>
                        <td>
                            <input type="text" id="main-keyword" name="mainKeyword" class="regular-text" required />
                            <p class="description"><?php _e('Primary keyword to optimize for', 'seo-postifier'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="secondary-keywords"><?php _e('Secondary Keywords', 'seo-postifier'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="secondary-keywords" name="secondaryKeywords" class="large-text" />
                            <p class="description"><?php _e('Comma-separated list of secondary keywords', 'seo-postifier'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="user-description"><?php _e('Post Description', 'seo-postifier'); ?> *</label>
                        </th>
                        <td>
                            <textarea id="user-description" name="userDescription" rows="6"
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
                                    <label for="ai-images-mode"><?php _e('AI Images', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <select id="ai-images-mode" name="aiImagesMode">
                                        <option value="disabled"><?php _e('Disabled', 'seo-postifier'); ?></option>
                                        <option value="auto" selected><?php _e('Auto', 'seo-postifier'); ?></option>
                                        <option value="custom"><?php _e('Custom', 'seo-postifier'); ?></option>
                                    </select>
                                    <p class="description"><?php _e('Select how AI images should be generated', 'seo-postifier'); ?></p>
                                </td>
                            </tr>
                            <tr id="ai-images-custom-count-row" style="display: none;">
                                <th scope="row">
                                    <label for="ai-images-count"><?php _e('Number of Images', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <input type="number" id="ai-images-count" name="aiImagesCount"
                                           value="5" min="1" class="small-text" />
                                    <p class="description"><?php _e('Number of AI-generated images to create', 'seo-postifier'); ?></p>
                                </td>
                            </tr>
                            <tr id="ai-images-custom-descriptions-row" style="display: none;">
                                <th scope="row">
                                    <label for="use-custom-ai-descriptions"><?php _e('Custom AI Descriptions', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox" id="use-custom-ai-descriptions" name="useCustomAiDescriptions" value="1" />
                                    <label for="use-custom-ai-descriptions"><?php _e('Provide custom descriptions for each AI image', 'seo-postifier'); ?></label>
                                </td>
                            </tr>
                            <tr id="ai-images-descriptions-container" style="display: none;">
                                <td colspan="2">
                                    <div id="ai-images-descriptions-list"></div>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label><?php _e('User Images', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <button type="button" id="add-user-image" class="button button-secondary">
                                        <?php _e('+ Add User Image', 'seo-postifier'); ?>
                                    </button>
                                    <p class="description"><?php _e('Add your own images to be used in the post', 'seo-postifier'); ?></p>
                                    <div id="user-images-list" style="margin-top: 15px;"></div>
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
                                    <label for="keyword-density"><?php _e('Keyword Density Target', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <input type="number" id="keyword-density" name="keywordDensityTarget"
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
                                    <label for="language"><?php _e('Language', 'seo-postifier'); ?> *</label>
                                </th>
                                <td>
                                    <select id="language" name="language" required>
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
                                    <label for="search-intent"><?php _e('Search Intent', 'seo-postifier'); ?> *</label>
                                </th>
                                <td>
                                    <select id="search-intent" name="searchIntent" required>
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
                                    <label for="target-audience"><?php _e('Target Audience', 'seo-postifier'); ?> *</label>
                                </th>
                                <td>
                                    <input type="text" id="target-audience" name="targetAudience"
                                           class="regular-text" value="General audience" required />
                                    <p class="description"><?php _e('Describe your target audience', 'seo-postifier'); ?></p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="tone-of-voice"><?php _e('Tone of Voice', 'seo-postifier'); ?> *</label>
                                </th>
                                <td>
                                    <select id="tone-of-voice" name="toneOfVoice" required>
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
                                    <label for="min-word-count"><?php _e('Minimum Word Count', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <input type="number" id="min-word-count" name="minWordCount"
                                           value="2000" min="100" class="small-text" />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="max-word-count"><?php _e('Maximum Word Count', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <input type="number" id="max-word-count" name="maxWordCount"
                                           value="2500" min="100" class="small-text" />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="needs-faq"><?php _e('Include FAQ Section', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox" id="needs-faq" name="needsFaqSection" value="1" checked />
                                    <label for="needs-faq"><?php _e('Add FAQ section at the end', 'seo-postifier'); ?></label>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="notes-for-writer"><?php _e('Additional Instructions', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <textarea id="notes-for-writer" name="notesForWriter" rows="3"
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
                                    <label for="internal-links-mode"><?php _e('Internal Links', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <select id="internal-links-mode" name="internalLinksMode">
                                        <option value="auto" selected><?php _e('Auto', 'seo-postifier'); ?></option>
                                        <option value="disabled"><?php _e('Disabled', 'seo-postifier'); ?></option>
                                        <option value="custom"><?php _e('Custom', 'seo-postifier'); ?></option>
                                    </select>
                                    <p class="description"><?php _e('Select how internal links should be handled', 'seo-postifier'); ?></p>
                                </td>
                            </tr>
                            <tr class="internal-links-custom-fields" style="display: none;">
                                <th scope="row">
                                    <label for="internal-links-to-use"><?php _e('Internal Links URLs', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <textarea id="internal-links-to-use" name="internalLinksToUse" rows="3"
                                              class="large-text" placeholder="One URL per line"></textarea>
                                    <p class="description"><?php _e('Specific internal links to include (one per line)', 'seo-postifier'); ?></p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="external-links-research-mode"><?php _e('External Link Research', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <select id="external-links-research-mode" name="externalLinksResearchMode">
                                        <option value="auto" selected><?php _e('Auto', 'seo-postifier'); ?></option>
                                        <option value="disabled"><?php _e('Disabled', 'seo-postifier'); ?></option>
                                    </select>
                                    <p class="description"><?php _e('Automatically research and include external links', 'seo-postifier'); ?></p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="use-custom-external-links"><?php _e('Use Custom External Links', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox" id="use-custom-external-links"
                                           name="useCustomExternalLinks" value="1" />
                                    <label for="use-custom-external-links"><?php _e('Provide specific external links to include', 'seo-postifier'); ?></label>
                                </td>
                            </tr>
                            <tr class="external-links-custom-fields" style="display: none;">
                                <th scope="row">
                                    <label for="external-links-to-use"><?php _e('External Links URLs', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <textarea id="external-links-to-use" name="externalLinksToUse" rows="3"
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
                                    <label for="mentions-brand"><?php _e('Mention Brand', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox" id="mentions-brand" name="mentionsBrand" value="1" />
                                    <label for="mentions-brand"><?php _e('Include brand mentions', 'seo-postifier'); ?></label>
                                </td>
                            </tr>
                            <tr class="brand-fields" style="display: none;">
                                <th scope="row">
                                    <label for="brand-name"><?php _e('Brand Name', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <input type="text" id="brand-name" name="brandName" class="regular-text" />
                                </td>
                            </tr>
                            <tr class="brand-fields" style="display: none;">
                                <th scope="row">
                                    <label for="brand-description"><?php _e('Brand Description', 'seo-postifier'); ?></label>
                                </th>
                                <td>
                                    <textarea id="brand-description" name="brandDescription" rows="2"
                                              class="large-text"></textarea>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>

            <p class="submit">
                <button type="submit" class="button button-primary button-large" id="submit-button">
                    <?php echo $is_edit_mode ? __('Update & Generate Post', 'seo-postifier') : __('Create & Generate Post', 'seo-postifier'); ?>
                </button>
                <a href="?page=seo-postifier&tab=scripts" class="button button-secondary">
                    <?php _e('Cancel', 'seo-postifier'); ?>
                </a>
            </p>

            <div id="create-script-status" style="margin-top: 15px;"></div>
        </form>
    </div>
</div>

<script type="text/javascript">
jQuery(document).ready(function($) {
    'use strict';

    const mode = $('#create-script-form').data('mode');
    const interviewId = $('#create-script-form').data('interview-id');
    
    // Counter for user images
    let userImageCounter = 0;
    let aiImagesCount = 3;

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

    // Toggle brand fields
    $('#mentions-brand').on('change', function() {
        if ($(this).is(':checked')) {
            $('.brand-fields').show();
        } else {
            $('.brand-fields').hide();
        }
    });

    // Handle AI images mode change
    $('#ai-images-mode').on('change', function() {
        const mode = $(this).val();
        if (mode === 'custom') {
            $('#ai-images-custom-count-row').show();
            $('#ai-images-count').trigger('change');
        } else {
            $('#ai-images-custom-count-row').hide();
            $('#ai-images-custom-descriptions-row').hide();
            $('#use-custom-ai-descriptions').prop('checked', false);
            $('#ai-images-descriptions-container').hide();
        }
    });

    // Handle AI images count change (only when in custom mode)
    $('#ai-images-count').on('change', function() {
        if ($('#ai-images-mode').val() !== 'custom') {
            return;
        }
        aiImagesCount = parseInt($(this).val()) || 5;
        if (aiImagesCount > 1) {
            $('#ai-images-custom-descriptions-row').show();
        } else {
            $('#ai-images-custom-descriptions-row').hide();
            $('#use-custom-ai-descriptions').prop('checked', false);
            $('#ai-images-descriptions-container').hide();
        }
        updateAiDescriptionsList();
    });

    // Handle internal links mode change
    $('#internal-links-mode').on('change', function() {
        const mode = $(this).val();
        if (mode === 'custom') {
            $('.internal-links-custom-fields').show();
        } else {
            $('.internal-links-custom-fields').hide();
        }
    });

    // Handle external links research mode change
    $('#external-links-research-mode').on('change', function() {
        // Mode change doesn't affect custom links checkbox
    });

    // Toggle custom external links fields
    $('#use-custom-external-links').on('change', function() {
        if ($(this).is(':checked')) {
            $('.external-links-custom-fields').show();
        } else {
            $('.external-links-custom-fields').hide();
        }
    });

    // Handle custom AI descriptions checkbox
    $('#use-custom-ai-descriptions').on('change', function() {
        if ($(this).is(':checked')) {
            $('#ai-images-descriptions-container').show();
            updateAiDescriptionsList();
        } else {
            $('#ai-images-descriptions-container').hide();
        }
    });

    // Update AI descriptions list
    function updateAiDescriptionsList() {
        const container = $('#ai-images-descriptions-list');
        container.empty();
        
        if (! $('#use-custom-ai-descriptions').is(':checked')) {
            return;
        }

        const count = parseInt($('#ai-images-count').val()) || 3;
        for (let i = 0; i < count; i++) {
            const item = $('<div class="ai-image-description-item" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;"></div>');
            item.append('<label style="display: block; font-weight: 600; margin-bottom: 5px;">' + 
                '<?php _e('Image', 'seo-postifier'); ?> ' + (i + 1) + ':</label>');
            item.append('<textarea class="large-text ai-image-description" data-index="' + i + '" ' +
                'placeholder="<?php _e('Describe what this image should show...', 'seo-postifier'); ?>" ' +
                'rows="2" style="width: 100%;"></textarea>');
            container.append(item);
        }
    }

    // Add user image
    $('#add-user-image').on('click', function() {
        const imageId = 'user-image-' + userImageCounter++;
        const item = $('<div class="user-image-item" data-id="' + imageId + '" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;"></div>');
        
        item.append('<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
            '<strong><?php _e('User Image', 'seo-postifier'); ?> #' + (userImageCounter) + '</strong>' +
            '<button type="button" class="button button-link-delete remove-user-image" style="color: #b32d2e;">' +
            '<?php _e('Remove', 'seo-postifier'); ?></button></div>');
        
        item.append('<table class="form-table" style="margin: 0;"><tbody>');
        
        // Source Type
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php _e('Source Type', 'seo-postifier'); ?></label></th>' +
            '<td style="padding: 10px 0;"><input type="text" class="regular-text user-image-source-type" ' +
            'placeholder="<?php _e('e.g., url, wordpress_id', 'seo-postifier'); ?>" /></td>' +
            '</tr>');
        
        // Source Value (Link)
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php _e('Link/URL', 'seo-postifier'); ?> *</label></th>' +
            '<td style="padding: 10px 0;"><input type="text" class="regular-text user-image-source-value" ' +
            'placeholder="<?php _e('Image URL or WordPress ID', 'seo-postifier'); ?>" required /></td>' +
            '</tr>');
        
        // Suggested Alt
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php _e('Alt Text', 'seo-postifier'); ?></label></th>' +
            '<td style="padding: 10px 0;"><input type="text" class="regular-text user-image-alt" ' +
            'placeholder="<?php _e('Suggested alt text for the image', 'seo-postifier'); ?>" /></td>' +
            '</tr>');
        
        // Image Description
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php _e('Image Description', 'seo-postifier'); ?></label></th>' +
            '<td style="padding: 10px 0;"><textarea class="large-text user-image-description" rows="2" ' +
            'placeholder="<?php _e('Describe the image and what it shows', 'seo-postifier'); ?>"></textarea></td>' +
            '</tr>');
        
        // Usage Notes
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php _e('Usage Notes', 'seo-postifier'); ?></label></th>' +
            '<td style="padding: 10px 0;"><textarea class="large-text user-image-notes" rows="2" ' +
            'placeholder="<?php _e('How should this image be used in the post?', 'seo-postifier'); ?>"></textarea></td>' +
            '</tr>');
        
        item.find('tbody').append('</tbody></table>');
        
        $('#user-images-list').append(item);
        
        // Remove button handler
        item.find('.remove-user-image').on('click', function() {
            item.remove();
        });
    });

    // Initialize AI images mode handler
    $('#ai-images-mode').trigger('change');

    // Form submission handler
    function handleFormSubmit(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
        
        // Verify that required data is available
        if (typeof seoPostifierData === 'undefined') {
            console.error('seoPostifierData is not available');
            alert('<?php _e('Error: Plugin data not loaded. Please refresh the page.', 'seo-postifier'); ?>');
            return false;
        }

        const $form = $('#create-script-form');
        const $status = $('#create-script-status');
        const $button = $('#submit-button');
        const originalText = $button.text();

        $button.prop('disabled', true).text('<?php _e('Processing...', 'seo-postifier'); ?>');
        $status.html('');

        // Helper function to split string into array and filter empty values
        const splitAndFilter = (str, delimiter) => {
            if (!str || typeof str !== 'string') return [];
            return str.split(delimiter)
                .map(item => item.trim())
                .filter(item => item.length > 0);
        };

        // Collect images configuration
        const aiImagesMode = $('#ai-images-mode').val();
        let aiImagesCount;
        
        if (aiImagesMode === 'auto') {
            aiImagesCount = -1;
        } else if (aiImagesMode === 'custom') {
            const aiImagesCountInput = $('#ai-images-count').val();
            aiImagesCount = (aiImagesCountInput !== '' && !isNaN(parseInt(aiImagesCountInput))) 
                ? parseInt(aiImagesCountInput) 
                : 5;
        } else {
            // disabled
            aiImagesCount = 0;
        }
        
        const useCustomAiDescriptions = $('#use-custom-ai-descriptions').is(':checked');
        const aiImagesUserDescriptions = [];
        
        if (useCustomAiDescriptions && aiImagesMode === 'custom' && aiImagesCount > 0) {
            $('.ai-image-description').each(function() {
                const desc = $(this).val().trim();
                if (desc) {
                    aiImagesUserDescriptions.push(desc);
                }
            });
        }
        
        const userImages = [];
        $('.user-image-item').each(function() {
            const $item = $(this);
            const sourceValue = $item.find('.user-image-source-value').val().trim();
            
            if (sourceValue) {
                const imageDescription = $item.find('.user-image-description').val().trim();
                const usageNotes = $item.find('.user-image-notes').val().trim();
                
                // Combine description and usage notes into notes field
                let notes = '';
                if (imageDescription) {
                    notes = imageDescription;
                }
                if (usageNotes) {
                    notes += (notes ? '\n\n' : '') + 'Usage: ' + usageNotes;
                }
                
                userImages.push({
                    sourceType: $item.find('.user-image-source-type').val().trim() || 'url',
                    sourceValue: sourceValue,
                    suggestedAlt: $item.find('.user-image-alt').val().trim() || undefined,
                    notes: notes || undefined
                });
            }
        });
        
        // Build images config object
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

        // Collect form data
        const internalLinksMode = $('#internal-links-mode').val();
        const formData = {
            mainKeyword: $('#main-keyword').val(),
            secondaryKeywords: splitAndFilter($('#secondary-keywords').val(), ','),
            keywordDensityTarget: parseFloat($('#keyword-density').val()),
            userDescription: $('#user-description').val(),
            language: $('#language').val(),
            searchIntent: $('#search-intent').val(),
            targetAudience: $('#target-audience').val(),
            toneOfVoice: $('#tone-of-voice').val(),
            minWordCount: parseInt($('#min-word-count').val()),
            maxWordCount: parseInt($('#max-word-count').val()),
            needsFaqSection: $('#needs-faq').is(':checked'),
            mentionsBrand: $('#mentions-brand').is(':checked'),
            brandName: $('#brand-name').val(),
            brandDescription: $('#brand-description').val(),
            internalLinksMode: internalLinksMode,
            internalLinksToUse: internalLinksMode === 'custom' ? splitAndFilter($('#internal-links-to-use').val(), '\n') : undefined,
            includeInternalLinks: internalLinksMode !== 'disabled',
            includeInternalLinksAutomatically: internalLinksMode === 'auto',
            externalLinksResearchMode: $('#external-links-research-mode').val(),
            externalLinksToIncludeAutomatically: $('#external-links-research-mode').val() === 'auto' ? -1 : undefined,
            useCustomExternalLinks: $('#use-custom-external-links').is(':checked'),
            externalLinksToUse: $('#use-custom-external-links').is(':checked') ? splitAndFilter($('#external-links-to-use').val(), '\n') : undefined,
            notesForWriter: $('#notes-for-writer').val(),
            imagesConfig: imagesConfig
        };

        // Determine action based on mode
        const action = mode === 'edit' ? 'seo_postifier_update_interview' : 'seo_postifier_create_interview';
        
        // Add interviewId for edit mode
        if (mode === 'edit' && interviewId) {
            formData.interviewId = interviewId;
        }

        // If internal links mode is auto, fetch blog links
        if (internalLinksMode === 'auto') {
            $.ajax({
                url: seoPostifierData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'seo_postifier_get_blog_links',
                    nonce: seoPostifierData.nonce
                },
                success: function(linksResponse) {
                    if (linksResponse.success && linksResponse.data.formatted) {
                        formData.blogInternalLinksMeta = linksResponse.data.formatted;
                    }
                    submitInterview();
                },
                error: function() {
                    // Continue without blog links if fetch fails
                    submitInterview();
                }
            });
        } else {
            submitInterview();
        }

        function submitInterview() {
        // First, create or update the interview
        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: action,
                nonce: seoPostifierData.nonce,
                interview_data: formData
            },
            success: function(response) {
                if (response.success) {
                    const newInterviewId = response.data.interview.interviewId || interviewId;
                    $status.html('<div class="notice notice-info inline"><p><?php _e('Draft saved. Generating script text...', 'seo-postifier'); ?></p></div>');
                    $button.text('<?php _e('Generating Script Text...', 'seo-postifier'); ?>');
                    
                    // Step 1: Generate script text
                    $.ajax({
                        url: seoPostifierData.ajaxUrl,
                        type: 'POST',
                        timeout: 180000,
                        data: {
                            action: 'seo_postifier_generate_script_text',
                            nonce: seoPostifierData.nonce,
                            interview_id: newInterviewId
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
                                        interview_id: newInterviewId
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
                                                    interview_id: newInterviewId
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
                                                                    $status.html('<div class="notice notice-success inline"><p><?php _e('WordPress draft created successfully! Redirecting...', 'seo-postifier'); ?></p></div>');
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
                    $status.html('<div class="notice notice-error inline"><p>' + (response.data.message || '<?php _e('Failed to save draft', 'seo-postifier'); ?>') + '</p></div>');
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function() {
                $status.html('<div class="notice notice-error inline"><p><?php _e('Failed to save draft. Please try again.', 'seo-postifier'); ?></p></div>');
                $button.prop('disabled', false).text(originalText);
            }
        });
        } // End submitInterview function
        
        return false;
    }
    
    // Register form submit handler
    $('#create-script-form').off('submit').on('submit', handleFormSubmit);
    
    // Also handle button click
    $(document).off('click', '#create-script-form button[type="submit"]').on('click', '#create-script-form button[type="submit"]', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Manually validate and submit
        const form = $('#create-script-form')[0];
        if (form && form.checkValidity()) {
            handleFormSubmit(e);
        } else {
            form.reportValidity();
        }
        return false;
    });

    // If in edit mode, load existing interview data
    if (mode === 'edit' && interviewId) {
        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_get_interview',
                nonce: seoPostifierData.nonce,
                interview_id: interviewId
            },
            success: function(response) {
                if (response.success && response.data.interview) {
                    const interview = response.data.interview;
                    
                    // Populate form fields
                    $('#main-keyword').val(interview.mainKeyword || '');
                    $('#secondary-keywords').val(Array.isArray(interview.secondaryKeywords) ? interview.secondaryKeywords.join(', ') : '');
                    $('#keyword-density').val(interview.keywordDensityTarget || 0.015);
                    $('#user-description').val(interview.userDescription || '');
                    $('#language').val(interview.language || 'es');
                    $('#search-intent').val(interview.searchIntent || 'informational');
                    $('#target-audience').val(interview.targetAudience || '');
                    $('#tone-of-voice').val(interview.toneOfVoice || 'friendly');
                    $('#min-word-count').val(interview.minWordCount || '2000');
                    $('#max-word-count').val(interview.maxWordCount || '2500');
                    $('#needs-faq').prop('checked', interview.needsFaqSection !== false);
                    $('#mentions-brand').prop('checked', interview.mentionsBrand === true);
                    $('#brand-name').val(interview.brandName || '');
                    $('#brand-description').val(interview.brandDescription || '');
                    // Handle internal links mode
                    if (interview.internalLinksMode) {
                        $('#internal-links-mode').val(interview.internalLinksMode);
                    } else if (interview.includeInternalLinks === false) {
                        $('#internal-links-mode').val('disabled');
                    } else if (interview.includeInternalLinksAutomatically === true) {
                        $('#internal-links-mode').val('auto');
                    } else if (interview.internalLinksToUse && interview.internalLinksToUse.length > 0) {
                        $('#internal-links-mode').val('custom');
                    } else {
                        $('#internal-links-mode').val('auto');
                    }
                    $('#internal-links-mode').trigger('change');
                    $('#internal-links-to-use').val(Array.isArray(interview.internalLinksToUse) ? interview.internalLinksToUse.join('\n') : '');
                    
                    // Handle external links research mode
                    if (interview.externalLinksResearchMode) {
                        $('#external-links-research-mode').val(interview.externalLinksResearchMode);
                    } else if (interview.externalLinksToIncludeAutomatically === -1 || interview.includeExternalLinks === true) {
                        $('#external-links-research-mode').val('auto');
                    } else {
                        $('#external-links-research-mode').val('disabled');
                    }
                    
                    // Handle custom external links
                    if (interview.useCustomExternalLinks || (interview.externalLinksToUse && interview.externalLinksToUse.length > 0)) {
                        $('#use-custom-external-links').prop('checked', true);
                        $('#use-custom-external-links').trigger('change');
                    }
                    $('#external-links-to-use').val(Array.isArray(interview.externalLinksToUse) ? interview.externalLinksToUse.join('\n') : '');
                    $('#notes-for-writer').val(interview.notesForWriter || '');
                    
                    // Populate image configuration
                    const imagesConfig = interview.imagesConfig || {};
                    const aiImagesCount = imagesConfig.aiImagesCount || -1;
                    
                    if (aiImagesCount === -1) {
                        $('#ai-images-mode').val('auto');
                    } else if (aiImagesCount === 0) {
                        $('#ai-images-mode').val('disabled');
                    } else {
                        $('#ai-images-mode').val('custom');
                        $('#ai-images-count').val(aiImagesCount);
                    }
                    $('#ai-images-mode').trigger('change');
                    
                    if (imagesConfig.useCustomAiDescriptions && imagesConfig.aiImagesUserDescriptions) {
                        $('#use-custom-ai-descriptions').prop('checked', true);
                        $('#use-custom-ai-descriptions').trigger('change');
                        setTimeout(function() {
                            imagesConfig.aiImagesUserDescriptions.forEach(function(desc, index) {
                                $('.ai-image-description[data-index="' + index + '"]').val(desc || '');
                            });
                        }, 100);
                    }
                    
                    // Populate user images
                    $('#user-images-list').empty();
                    userImageCounter = 0;
                    if (imagesConfig.useUserImages && Array.isArray(imagesConfig.userImages)) {
                        imagesConfig.userImages.forEach(function(userImage) {
                            if (userImage.sourceValue) {
                                // Trigger add user image functionality
                                $('#add-user-image').trigger('click');
                                const $lastItem = $('#user-images-list .user-image-item').last();
                                $lastItem.find('.user-image-source-type').val(userImage.sourceType || '');
                                $lastItem.find('.user-image-source-value').val(userImage.sourceValue || '');
                                $lastItem.find('.user-image-alt').val(userImage.suggestedAlt || '');
                                if (userImage.notes) {
                                    const notesParts = userImage.notes.split('\n\nUsage: ');
                                    $lastItem.find('.user-image-description').val(notesParts[0] || '');
                                    if (notesParts[1]) {
                                        $lastItem.find('.user-image-notes').val(notesParts[1] || '');
                                    }
                                }
                            }
                        });
                    }
                    
                    // Trigger conditional field visibility
                    $('#mentions-brand').trigger('change');
                }
            }
        });
    }
});
</script>
