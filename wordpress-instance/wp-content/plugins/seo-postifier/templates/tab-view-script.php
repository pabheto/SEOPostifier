<?php
/**
 * View Script Template - 3 Step Process
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
        <h2><?php _e('Create Draft', 'seo-postifier'); ?></h2>
        
        <p>
            <a href="?page=seo-postifier&tab=scripts" class="button button-secondary">
                <?php _e('← Back to My Drafts', 'seo-postifier'); ?>
            </a>
        </p>

        <div id="loading-interview" style="margin: 20px 0;">
            <p><?php _e('Loading draft data...', 'seo-postifier'); ?></p>
        </div>

        <div id="interview-container" style="display: none; margin-top: 20px;">
            <!-- Progress Stepper -->
            <div class="seo-postifier-stepper">
                <div class="stepper-step" data-step="1">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <div class="step-title"><?php _e('Define Parameters', 'seo-postifier'); ?></div>
                        <div class="step-description"><?php _e('Set up your SEO parameters', 'seo-postifier'); ?></div>
                    </div>
                </div>
                <div class="stepper-connector"></div>
                <div class="stepper-step" data-step="2">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <div class="step-title"><?php _e('Elaborate Script', 'seo-postifier'); ?></div>
                        <div class="step-description"><?php _e('Create and refine your script', 'seo-postifier'); ?></div>
                    </div>
                </div>
                <div class="stepper-connector"></div>
                <div class="stepper-step" data-step="3">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <div class="step-title"><?php _e('Create Draft', 'seo-postifier'); ?></div>
                        <div class="step-description"><?php _e('Generate WordPress draft', 'seo-postifier'); ?></div>
                    </div>
                </div>
            </div>

            <!-- Step 1: Define Parameters -->
            <div id="step-1-container" class="step-container">
                <div class="step-header">
                    <h3><?php _e('Step 1: Define Parameters', 'seo-postifier'); ?></h3>
                    <p><?php _e('Configure the SEO parameters for your post. Once completed, the script text will be automatically generated.', 'seo-postifier'); ?></p>
                </div>

                <!-- Edit Form (same as before but simplified) -->
                <form id="edit-interview-form" class="step-content-form">
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
                                       value="0.015" min="0" max="1" step="0.001" class="small-text" />
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
                                <label for="edit-min-word-count"><?php _e('Minimum Word Count', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="edit-min-word-count" name="minWordCount"
                                       value="1500" min="100" class="small-text" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="edit-max-word-count"><?php _e('Maximum Word Count', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="edit-max-word-count" name="maxWordCount"
                                       value="3000" min="100" class="small-text" />
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
                                       name="includeInternalLinks" value="1" checked />
                                <label for="edit-include-internal-links"><?php _e('Include internal links', 'seo-postifier'); ?></label>
                            </td>
                        </tr>
                        <tr class="edit-internal-links-fields">
                            <th scope="row">
                                <label for="edit-max-internal-links"><?php _e('Max Internal Links', 'seo-postifier'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="edit-max-internal-links" name="maxInternalLinks"
                                       value="3" min="0" class="small-text" />
                            </td>
                        </tr>
                        <tr class="edit-internal-links-fields">
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
                                       value="2" min="0" class="small-text" />
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
                        <button type="submit" id="complete-step-1-btn" class="button button-primary button-large">
                            <?php _e('Complete Step 1 & Generate Script Text', 'seo-postifier'); ?>
                        </button>
                    </p>
                    <div id="step-1-status" style="margin-top: 15px;"></div>
                </form>
            </div>

            <!-- Step 2: Elaborate Script -->
            <div id="step-2-container" class="step-container" style="display: none;">
                <div class="step-header">
                    <h3><?php _e('Step 2: Elaborate Script', 'seo-postifier'); ?></h3>
                    <p><?php _e('Review and modify the generated script text. Once completed, the script definition and post will be automatically generated.', 'seo-postifier'); ?></p>
                </div>

                <div class="step-content-form">
                    <div class="seo-postifier-markdown-editor">
                        <div class="seo-postifier-editor-tabs">
                            <button type="button" class="editor-tab active" data-tab="edit"><?php _e('Edit', 'seo-postifier'); ?></button>
                            <button type="button" class="editor-tab" data-tab="preview"><?php _e('Preview', 'seo-postifier'); ?></button>
                        </div>
                        <div class="seo-postifier-editor-content">
                            <textarea id="script-text-editor" class="seo-postifier-textarea" rows="25"></textarea>
                            <div id="script-text-preview" class="seo-postifier-markdown-display" style="display: none;"></div>
                        </div>
                    </div>

                    <p class="submit" style="margin-top: 20px;">
                        <button type="button" id="complete-step-2-btn" class="button button-primary button-large">
                            <?php _e('Complete Step 2 & Generate Post', 'seo-postifier'); ?>
                        </button>
                    </p>
                    <div id="step-2-status" style="margin-top: 15px;"></div>
                </div>
            </div>

            <!-- Step 3: Create Draft -->
            <div id="step-3-container" class="step-container" style="display: none;">
                <div class="step-header">
                    <h3><?php _e('Step 3: Create Draft', 'seo-postifier'); ?></h3>
                    <p><?php _e('Review the generated post. Once completed, a WordPress draft will be created.', 'seo-postifier'); ?></p>
                </div>

                <div class="step-content-form">
                    <div id="post-markdown" class="seo-postifier-markdown-display"></div>

                    <p class="submit" style="margin-top: 20px;">
                        <button type="button" id="complete-step-3-btn" class="button button-primary button-large">
                            <?php _e('Complete Step 3 & Create WordPress Draft', 'seo-postifier'); ?>
                        </button>
                    </p>
                    <div id="step-3-status" style="margin-top: 15px;"></div>
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
    
    let currentInterview = null;
    let currentPost = null;
    let currentPostId = null;

    // Update stepper based on interview state
    function updateStepper(interview) {
        // Step 1: Completed if interview exists and has parameters
        const step1Complete = interview && interview.mainKeyword;
        // Step 2: Completed if script text is generated
        const step2Complete = interview && interview.generatedScriptText;
        // Step 3: Completed if post is generated
        const step3Complete = interview && interview.associatedPostId;

        $('.stepper-step[data-step="1"]').toggleClass('completed', step1Complete);
        $('.stepper-step[data-step="2"]').toggleClass('completed', step2Complete);
        $('.stepper-step[data-step="3"]').toggleClass('completed', step3Complete);
        
        // Remove active class from all steps first
        $('.stepper-step').removeClass('active');
        
        // Determine current step
        let currentStep = 1;
        if (step3Complete || (step2Complete && interview.generatedScriptDefinition)) {
            currentStep = 3;
        } else if (step2Complete) {
            currentStep = 2;
        }
        
        // Set active step
        $('.stepper-step[data-step="' + currentStep + '"]').addClass('active');

        // Show appropriate step container
        showStep(currentStep);
    }

    function showStep(stepNumber) {
        // Hide all step containers
        $('.step-container').hide();
        
        // Show the requested step
        $(`#step-${stepNumber}-container`).show();
        
        // Update active step in stepper
        $('.stepper-step').removeClass('active');
        $('.stepper-step[data-step="' + stepNumber + '"]').addClass('active');
    }
    
    // Handle step navigation clicks (using event delegation)
    $(document).on('click', '.stepper-step', function() {
        const stepNumber = parseInt($(this).data('step'));
        const isCompleted = $(this).hasClass('completed');
        const isActive = $(this).hasClass('active');
        
        // Determine if step is navigable
        let isNavigable = isCompleted || isActive;
        
        // Step 1 is always navigable if interview exists
        if (stepNumber === 1 && currentInterview) {
            isNavigable = true;
        }
        
        // Only allow navigation to navigable steps
        if (isNavigable) {
            showStep(stepNumber);
        }
    });

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

    // Toggle conditional fields
    $('#edit-mentions-brand').on('change', function() {
        $('.edit-brand-fields').toggle($(this).is(':checked'));
    });
    
    $('#edit-include-internal-links').on('change', function() {
        $('.edit-internal-links-fields').toggle($(this).is(':checked'));
    });
    
    $('#edit-include-external-links').on('change', function() {
        $('.edit-external-links-fields').toggle($(this).is(':checked'));
    });

    // Populate edit form with interview data
    function populateEditForm(interview) {
        $('#edit-main-keyword').val(interview.mainKeyword || '');
        $('#edit-secondary-keywords').val(Array.isArray(interview.secondaryKeywords) ? interview.secondaryKeywords.join(', ') : '');
        $('#edit-keyword-density').val(interview.keywordDensityTarget || 0.015);
        $('#edit-user-description').val(interview.userDescription || '');
        $('#edit-language').val(interview.language || 'es');
        $('#edit-search-intent').val(interview.searchIntent || 'informational');
        $('#edit-target-audience').val(interview.targetAudience || '');
        $('#edit-tone-of-voice').val(interview.toneOfVoice || 'friendly');
        $('#edit-min-word-count').val(interview.minWordCount || '1500');
        $('#edit-max-word-count').val(interview.maxWordCount || '3000');
        $('#edit-needs-faq').prop('checked', interview.needsFaqSection !== false);
        $('#edit-mentions-brand').prop('checked', interview.mentionsBrand === true);
        $('#edit-brand-name').val(interview.brandName || '');
        $('#edit-brand-description').val(interview.brandDescription || '');
        $('#edit-include-internal-links').prop('checked', interview.includeInternalLinks === true);
        $('#edit-max-internal-links').val(interview.maxInternalLinks || '3');
        $('#edit-internal-links-to-use').val(Array.isArray(interview.internalLinksToUse) ? interview.internalLinksToUse.join('\n') : '');
        $('#edit-include-external-links').prop('checked', interview.includeExternalLinks === true);
        $('#edit-max-external-links').val(interview.maxExternalLinks || '2');
        $('#edit-external-links-to-use').val(Array.isArray(interview.externalLinksToUse) ? interview.externalLinksToUse.join('\n') : '');
        $('#edit-notes-for-writer').val(interview.notesForWriter || '');
        
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

    // Step 1: Complete and generate script text
    $('#edit-interview-form').on('submit', function(e) {
        e.preventDefault();
        
        const $status = $('#step-1-status');
        const $button = $('#complete-step-1-btn');
        const originalText = $button.text();
        
        $button.prop('disabled', true).text('<?php _e('Saving & Generating Script Text...', 'seo-postifier'); ?>');
        $status.html('');

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

        Object.keys(formData).forEach(key => {
            if (formData[key] === undefined) {
                delete formData[key];
            }
        });

        // First update interview
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
                    $status.html('<div class="notice notice-info inline"><p><?php _e('Parameters saved. Generating script text...', 'seo-postifier'); ?></p></div>');
                    
                    // Now generate script text
                    $.ajax({
                        url: seoPostifierData.ajaxUrl,
                        type: 'POST',
                        timeout: 180000,
                        data: {
                            action: 'seo_postifier_generate_script_text',
                            nonce: seoPostifierData.nonce,
                            interview_id: interviewId
                        },
                        success: function(response2) {
                            if (response2.success) {
                                currentInterview = response2.data.interview;
                                $('#script-text-editor').val(currentInterview.generatedScriptText || '');
                                updateStepper(currentInterview);
                                $status.html('<div class="notice notice-success inline"><p><?php _e('Step 1 completed! Script text generated.', 'seo-postifier'); ?></p></div>');
                            } else {
                                $status.html('<div class="notice notice-error inline"><p>' + response2.data.message + '</p></div>');
                            }
                        },
                        error: function(xhr, status, error) {
                            let errorMsg = '<?php _e('Failed to generate script text.', 'seo-postifier'); ?>';
                            if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                                errorMsg = xhr.responseJSON.data.message;
                            }
                            $status.html('<div class="notice notice-error inline"><p>' + errorMsg + '</p></div>');
                        },
                        complete: function() {
                            $button.prop('disabled', false).text(originalText);
                        }
                    });
                } else {
                    $status.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function(xhr, status, error) {
                let errorMsg = '<?php _e('Failed to save parameters.', 'seo-postifier'); ?>';
                if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                    errorMsg = xhr.responseJSON.data.message;
                }
                $status.html('<div class="notice notice-error inline"><p>' + errorMsg + '</p></div>');
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

    // Step 2: Complete and generate post
    $('#complete-step-2-btn').on('click', function() {
        const $button = $(this);
        const originalText = $button.text();
        const $status = $('#step-2-status');
        
        $button.prop('disabled', true).text('<?php _e('Generating Script Definition & Post...', 'seo-postifier'); ?>');
        $status.html('<div class="notice notice-info inline"><p><?php _e('Generating script definition...', 'seo-postifier'); ?></p></div>');

        // First generate script definition
        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            timeout: 180000,
            data: {
                action: 'seo_postifier_generate_script_definition',
                nonce: seoPostifierData.nonce,
                interview_id: interviewId
            },
            success: function(response) {
                if (response.success) {
                    currentInterview = response.data.interview;
                    $status.html('<div class="notice notice-info inline"><p><?php _e('Script definition generated. Now generating post...', 'seo-postifier'); ?></p></div>');
                    
                    // Now generate post
                    $.ajax({
                        url: seoPostifierData.ajaxUrl,
                        type: 'POST',
                        timeout: 300000,
                        data: {
                            action: 'seo_postifier_generate_post',
                            nonce: seoPostifierData.nonce,
                            interview_id: interviewId
                        },
                        success: function(response2) {
                            if (response2.success) {
                                currentPost = response2.data.post;
                                currentPostId = response2.data.post._id || response2.data.post.id || null;
                                
                                // Convert post blocks to markdown
                                const markdown = blocksToMarkdown(currentPost.blocks);
                                if (typeof marked !== 'undefined') {
                                    const html = marked.parse(markdown);
                                    $('#post-markdown').html(html);
                                } else {
                                    $('#post-markdown').text(markdown);
                                }
                                
                                // Reload interview to get updated associatedPostId
                                loadInterview();
                                
                                $status.html('<div class="notice notice-success inline"><p><?php _e('Step 2 completed! Post generated.', 'seo-postifier'); ?></p></div>');
                            } else {
                                $status.html('<div class="notice notice-error inline"><p>' + response2.data.message + '</p></div>');
                            }
                        },
                        error: function(xhr, status, error) {
                            let errorMsg = '<?php _e('Failed to generate post.', 'seo-postifier'); ?>';
                            if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                                errorMsg = xhr.responseJSON.data.message;
                            }
                            $status.html('<div class="notice notice-error inline"><p>' + errorMsg + '</p></div>');
                        },
                        complete: function() {
                            $button.prop('disabled', false).text(originalText);
                        }
                    });
                } else {
                    $status.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function(xhr, status, error) {
                let errorMsg = '<?php _e('Failed to generate script definition.', 'seo-postifier'); ?>';
                if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                    errorMsg = xhr.responseJSON.data.message;
                }
                $status.html('<div class="notice notice-error inline"><p>' + errorMsg + '</p></div>');
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

    // Step 3: Complete and create WordPress draft
    $('#complete-step-3-btn').on('click', function() {
        if (!currentPostId && currentPost) {
            currentPostId = currentPost._id || currentPost.id;
        }
        
        if (!currentPostId || !currentPost) {
            $('#step-3-status').html('<div class="notice notice-error inline"><p><?php _e('No post available to create draft.', 'seo-postifier'); ?></p></div>');
            return;
        }

        const $button = $(this);
        const originalText = $button.text();
        const $status = $('#step-3-status');

        $button.prop('disabled', true).text('<?php _e('Creating WordPress Draft...', 'seo-postifier'); ?>');
        $status.html('<div class="notice notice-info inline"><p><?php _e('Creating WordPress draft...', 'seo-postifier'); ?></p></div>');

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
                    $status.html(
                        '<div class="notice notice-success inline">' +
                        '<p><?php _e('Step 3 completed! WordPress draft created successfully. Redirecting...', 'seo-postifier'); ?></p>' +
                        '</div>'
                    );
                    setTimeout(function() {
                        window.location.href = editUrl;
                    }, 1000);
                } else {
                    $status.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function() {
                $status.html('<div class="notice notice-error inline"><p><?php _e('Failed to create WordPress draft. Please try again.', 'seo-postifier'); ?></p></div>');
                $button.prop('disabled', false).text(originalText);
            }
        });
    });

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
                    
                    // Populate form
                    populateEditForm(currentInterview);
                    
                    // Populate script text editor if available
                    if (currentInterview.generatedScriptText) {
                        $('#script-text-editor').val(currentInterview.generatedScriptText);
                    }
                    
                    // Load post if associated
                    if (currentInterview.associatedPostId) {
                        loadPost(currentInterview.associatedPostId);
                    }
                    
                    // Update stepper and show appropriate step
                    updateStepper(currentInterview);
                    
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

    // Load post if associated
    function loadPost(postId) {
        if (!postId) return;
        
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
                    currentPostId = response.data.post._id || response.data.post.id || postId;
                    
                    const markdown = blocksToMarkdown(currentPost.blocks);
                    if (typeof marked !== 'undefined') {
                        const html = marked.parse(markdown);
                        $('#post-markdown').html(html);
                    } else {
                        $('#post-markdown').text(markdown);
                    }
                }
            },
            error: function() {
                console.error('Failed to load post');
            }
        });
    }

    // Load interview on page load
    loadInterview();
});
</script>
