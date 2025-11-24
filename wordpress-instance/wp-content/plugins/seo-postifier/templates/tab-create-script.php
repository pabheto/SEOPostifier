<?php
/**
 * Create Script Template
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="seo-postifier-create-script">
    <div class="card">
        <h2><?php _e('Create New Script', 'seo-postifier'); ?></h2>
        <p><?php _e('Define the SEO specifications for your new script.', 'seo-postifier'); ?></p>

        <p>
            <a href="?page=seo-postifier&tab=scripts" class="button button-secondary">
                <?php _e('← Back to My Drafts', 'seo-postifier'); ?>
            </a>
        </p>

        <form id="create-script-form" style="margin-top: 20px;">
            <!-- SEO Configuration -->
            <h3><?php _e('SEO Configuration', 'seo-postifier'); ?></h3>
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
                        <label for="keyword-density"><?php _e('Keyword Density Target', 'seo-postifier'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="keyword-density" name="keywordDensityTarget"
                               value="0.015" min="0" max="1" step="0.001" class="small-text" />
                        <p class="description"><?php _e('Target keyword density (0-1, default: 0.015)', 'seo-postifier'); ?></p>
                    </td>
                </tr>
            </table>

            <!-- Content Configuration -->
            <h3><?php _e('Content Configuration', 'seo-postifier'); ?></h3>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="user-description"><?php _e('Topic Description', 'seo-postifier'); ?> *</label>
                    </th>
                    <td>
                        <textarea id="user-description" name="userDescription" rows="4"
                                  class="large-text" required></textarea>
                        <p class="description"><?php _e('Describe what the post should be about', 'seo-postifier'); ?></p>
                    </td>
                </tr>
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
                               class="regular-text" required />
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
            </table>

            <!-- Structure Configuration -->
            <h3><?php _e('Structure Configuration', 'seo-postifier'); ?></h3>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="min-word-count"><?php _e('Minimum Word Count', 'seo-postifier'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="min-word-count" name="minWordCount"
                               value="1500" min="100" class="small-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="max-word-count"><?php _e('Maximum Word Count', 'seo-postifier'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="max-word-count" name="maxWordCount"
                               value="3000" min="100" class="small-text" />
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
            </table>

            <!-- Brand Configuration -->
            <h3><?php _e('Brand Configuration', 'seo-postifier'); ?></h3>
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

            <!-- Links Configuration -->
            <h3><?php _e('Links Configuration', 'seo-postifier'); ?></h3>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="include-internal-links"><?php _e('Internal Links', 'seo-postifier'); ?></label>
                    </th>
                    <td>
                        <input type="checkbox" id="include-internal-links"
                               name="includeInternalLinks" value="1" checked />
                        <label for="include-internal-links"><?php _e('Include internal links', 'seo-postifier'); ?></label>
                    </td>
                </tr>
                <tr class="internal-links-fields">
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
                        <label for="include-external-links"><?php _e('External Links', 'seo-postifier'); ?></label>
                    </th>
                    <td>
                        <input type="checkbox" id="include-external-links"
                               name="includeExternalLinks" value="1" />
                        <label for="include-external-links"><?php _e('Include external links', 'seo-postifier'); ?></label>
                    </td>
                </tr>
                <tr class="external-links-fields" style="display: none;">
                    <th scope="row">
                        <label for="external-links-to-include-automatically"><?php _e('External Links to Include Automatically', 'seo-postifier'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="external-links-to-include-automatically" name="externalLinksToIncludeAutomatically"
                               value="2" min="0" class="small-text" />
                        <p class="description"><?php _e('Number of external links to automatically include', 'seo-postifier'); ?></p>
                    </td>
                </tr>
                <tr class="external-links-fields" style="display: none;">
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

            <!-- Images Configuration -->
            <h3><?php _e('Images Configuration', 'seo-postifier'); ?></h3>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="ai-images-count"><?php _e('AI Images Count', 'seo-postifier'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="ai-images-count" name="aiImagesCount"
                               value="0" min="0" class="small-text" />
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

            <!-- Additional Notes -->
            <h3><?php _e('Additional Instructions', 'seo-postifier'); ?></h3>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="notes-for-writer"><?php _e('Notes for Writer', 'seo-postifier'); ?></label>
                    </th>
                    <td>
                        <textarea id="notes-for-writer" name="notesForWriter" rows="3"
                                  class="large-text"></textarea>
                        <p class="description"><?php _e('Any additional instructions or requirements', 'seo-postifier'); ?></p>
                    </td>
                </tr>
            </table>

            <p class="submit">
                <button type="submit" class="button button-primary button-large">
                    <?php _e('Create Script', 'seo-postifier'); ?>
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

    // Counter for user images
    let userImageCounter = 0;
    let aiImagesCount = 0;

    // Toggle brand fields
    $('#mentions-brand').on('change', function() {
        if ($(this).is(':checked')) {
            $('.brand-fields').show();
        } else {
            $('.brand-fields').hide();
        }
    });

    // Toggle internal links fields
    $('#include-internal-links').on('change', function() {
        if ($(this).is(':checked')) {
            $('.internal-links-fields').show();
        } else {
            $('.internal-links-fields').hide();
        }
    });

    // Toggle external links fields
    $('#include-external-links').on('change', function() {
        if ($(this).is(':checked')) {
            $('.external-links-fields').show();
        } else {
            $('.external-links-fields').hide();
        }
    });

    // Handle AI images count change
    $('#ai-images-count').on('change', function() {
        aiImagesCount = parseInt($(this).val()) || 0;
        if (aiImagesCount > 1) {
            $('#ai-images-custom-descriptions-row').show();
        } else {
            $('#ai-images-custom-descriptions-row').hide();
            $('#use-custom-ai-descriptions').prop('checked', false);
            $('#ai-images-descriptions-container').hide();
        }
        updateAiDescriptionsList();
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

        const count = parseInt($('#ai-images-count').val()) || 0;
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

    // Initialize AI images count handler
    $('#ai-images-count').trigger('change');

    // Form submission handler - register early to catch first submission
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
        const $button = $form.find('button[type="submit"]');
        const originalText = $button.text();

        $button.prop('disabled', true).text('<?php _e('Creating...', 'seo-postifier'); ?>');
        $status.html('');

        // Helper function to split string into array and filter empty values
        const splitAndFilter = (str, delimiter) => {
            if (!str || typeof str !== 'string') return [];
            return str.split(delimiter)
                .map(item => item.trim())
                .filter(item => item.length > 0);
        };

        // Collect images configuration
        const aiImagesCountInput = $('#ai-images-count').val();
        const aiImagesCount = (aiImagesCountInput !== '' && !isNaN(parseInt(aiImagesCountInput))) 
            ? parseInt(aiImagesCountInput) 
            : 0;
        const useCustomAiDescriptions = $('#use-custom-ai-descriptions').is(':checked');
        const aiImagesUserDescriptions = [];
        
        if (useCustomAiDescriptions && aiImagesCount > 0) {
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
        // Always include aiImagesCount (even if 0) to ensure it's sent to the API
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
            includeInternalLinks: $('#include-internal-links').is(':checked'),
            internalLinksToUse: splitAndFilter($('#internal-links-to-use').val(), '\n'),
            includeExternalLinks: $('#include-external-links').is(':checked'),
            externalLinksToIncludeAutomatically: parseInt($('#external-links-to-include-automatically').val()) || undefined,
            externalLinksToUse: splitAndFilter($('#external-links-to-use').val(), '\n'),
            notesForWriter: $('#notes-for-writer').val()
        };
        
        // Always include imagesConfig (it always has aiImagesCount at minimum)
        formData.imagesConfig = imagesConfig;

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_create_interview',
                nonce: seoPostifierData.nonce,
                interview_data: formData
            },
            success: function(response) {
                if (response.success) {
                    const interviewId = response.data.interview.interviewId;
                    $status.html('<div class="notice notice-success inline"><p>' + response.data.message + '</p></div>');
                    
                    // Redirect to view script page
                    setTimeout(function() {
                        window.location.href = '?page=seo-postifier&tab=view-script&interviewId=' + interviewId;
                    }, 500);
                } else {
                    $status.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function() {
                $status.html('<div class="notice notice-error inline"><p><?php _e('Failed to create script. Please try again.', 'seo-postifier'); ?></p></div>');
                $button.prop('disabled', false).text(originalText);
            }
        });
        
        return false;
    }
    
    // Register form submit handler - use off() first to prevent duplicates
    $('#create-script-form').off('submit').on('submit', handleFormSubmit);
    
    // Also handle button click to ensure we catch it early
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
});
</script>

