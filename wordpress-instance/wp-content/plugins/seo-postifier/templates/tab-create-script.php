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

        <form id="create-script-form" data-mode="<?php echo esc_attr($mode); ?>" data-interview-id="<?php echo esc_attr($interview_id); ?>" style="margin-top: 20px;" onsubmit="return false;">
            
            <div id="tab-draft">
                <h3><?php _e('Draft Information', 'seo-postifier'); ?></h3>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="main-keyword"><?php _e('Search Intent', 'seo-postifier'); ?> *</label>
                        </th>
                        <td>
                            <input type="text" id="main-keyword" name="mainKeyword" class="regular-text" required />
                            <p class="description"><?php _e('Primary keyword or search intent to optimize for', 'seo-postifier'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="user-description"><?php _e('Post Description', 'seo-postifier'); ?></label>
                        </th>
                        <td>
                            <textarea id="user-description" name="userDescription" rows="6"
                                      class="large-text"></textarea>
                            <p class="description"><?php _e('Optional: Describe what the post should be about', 'seo-postifier'); ?></p>
                        </td>
                    </tr>
                </table>
                
                <!-- Hidden fields for default values -->
                <input type="hidden" id="secondary-keywords" name="secondaryKeywords" value="" />
                <input type="hidden" id="keyword-density" name="keywordDensityTarget" value="0.015" />
                <input type="hidden" id="language" name="language" value="es" />
                <input type="hidden" id="search-intent" name="searchIntent" value="informational" />
                <input type="hidden" id="target-audience" name="targetAudience" value="General audience" />
                <input type="hidden" id="tone-of-voice" name="toneOfVoice" value="friendly" />
                <input type="hidden" id="min-word-count" name="minWordCount" value="2000" />
                <input type="hidden" id="max-word-count" name="maxWordCount" value="2500" />
                <input type="hidden" id="needs-faq" name="needsFaqSection" value="1" />
                <input type="hidden" id="mentions-brand" name="mentionsBrand" value="0" />
                <input type="hidden" id="brand-name" name="brandName" value="" />
                <input type="hidden" id="brand-description" name="brandDescription" value="" />
                <input type="hidden" id="internal-links-mode" name="internalLinksMode" value="auto" />
                <input type="hidden" id="external-links-research-mode" name="externalLinksResearchMode" value="auto" />
                <input type="hidden" id="use-custom-external-links" name="useCustomExternalLinks" value="0" />
                <input type="hidden" id="notes-for-writer" name="notesForWriter" value="" />
                <input type="hidden" id="ai-images-mode" name="aiImagesMode" value="auto" />
            </div>

            <p class="submit">
                <button type="button" class="button button-primary button-large" id="submit-button">
                    <?php echo $is_edit_mode ? __('Update & Generate Post', 'seo-postifier') : __('Create & Generate Post', 'seo-postifier'); ?>
                </button>
                <a href="?page=seo-postifier&tab=scripts" class="button button-secondary">
                    <?php _e('Cancel', 'seo-postifier'); ?>
                </a>
            </p>

            <div id="create-script-status" style="margin-top: 15px;"></div>
        </form>
        
        <!-- Suggestions Step Container -->
        <div id="suggestions-step-container" style="display: none; margin-top: 30px;">
            <div class="card">
                <h2><?php _e('Select Post Architecture', 'seo-postifier'); ?></h2>
                <p><?php _e('Choose a post structure suggestion or let AI decide automatically', 'seo-postifier'); ?></p>
                
                <!-- Loading State -->
                <div id="suggestions-loading" class="seo-postifier-fancy-loader" style="display: block;">
                    <div class="loader-spinner"></div>
                    <h3><?php _e('Generating Suggestions...', 'seo-postifier'); ?></h3>
                    <p><?php _e('AI is analyzing your search intent and creating architecture options', 'seo-postifier'); ?></p>
                </div>
                
                <!-- Suggestions List -->
                <div id="suggestions-list-container" style="display: none; margin-top: 20px;">
                    <div id="suggestions-list" class="seo-postifier-suggestions-grid"></div>
                    
                    <p class="submit" style="margin-top: 30px;">
                        <button type="button" class="button button-secondary" id="back-to-form-button">
                            <?php _e('← Back to Edit', 'seo-postifier'); ?>
                        </button>
                        <button type="button" class="button button-secondary" id="reload-suggestions-button" style="margin-left: 10px;">
                            <span class="dashicons dashicons-update" style="margin-top: 3px;"></span>
                            <?php _e('Reload Suggestions', 'seo-postifier'); ?>
                        </button>
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Generation Progress Container -->
        <div id="generation-progress-container" style="display: none; margin-top: 30px;">
            <div class="card">
                <h2><?php _e('Generating Your Post', 'seo-postifier'); ?></h2>
                
                <div class="seo-postifier-progress-steps">
                    <div class="progress-step" id="step-script-text">
                        <div class="step-icon">
                            <span class="dashicons dashicons-admin-page"></span>
                        </div>
                        <div class="step-content">
                            <h3><?php _e('Generating Script Text', 'seo-postifier'); ?></h3>
                            <p class="step-description"><?php _e('Creating the structured content outline', 'seo-postifier'); ?></p>
                            <div class="step-status"><?php _e('Pending...', 'seo-postifier'); ?></div>
                        </div>
                    </div>
                    
                    <div class="progress-step" id="step-script-definition">
                        <div class="step-icon">
                            <span class="dashicons dashicons-editor-table"></span>
                        </div>
                        <div class="step-content">
                            <h3><?php _e('Generating Script Definition', 'seo-postifier'); ?></h3>
                            <p class="step-description"><?php _e('Defining sections and structure', 'seo-postifier'); ?></p>
                            <div class="step-status"><?php _e('Pending...', 'seo-postifier'); ?></div>
                        </div>
                    </div>
                    
                    <div class="progress-step" id="step-post">
                        <div class="step-icon">
                            <span class="dashicons dashicons-edit-large"></span>
                        </div>
                        <div class="step-content">
                            <h3><?php _e('Generating Post Content', 'seo-postifier'); ?></h3>
                            <p class="step-description"><?php _e('Writing the complete post with AI', 'seo-postifier'); ?></p>
                            <div class="step-status"><?php _e('Pending...', 'seo-postifier'); ?></div>
                        </div>
                    </div>
                    
                    <div class="progress-step" id="step-wordpress">
                        <div class="step-icon">
                            <span class="dashicons dashicons-wordpress"></span>
                        </div>
                        <div class="step-content">
                            <h3><?php _e('Creating WordPress Draft', 'seo-postifier'); ?></h3>
                            <p class="step-description"><?php _e('Publishing to WordPress editor', 'seo-postifier'); ?></p>
                            <div class="step-status"><?php _e('Pending...', 'seo-postifier'); ?></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
jQuery(document).ready(function($) {
    'use strict';

    console.log('=== SEO Postifier Script Loaded ===');
    console.log('jQuery version:', $.fn.jquery);
    
    const mode = $('#create-script-form').data('mode');
    const interviewId = $('#create-script-form').data('interview-id');
    const originalButtonText = '<?php echo $is_edit_mode ? __('Update & Generate Post', 'seo-postifier') : __('Create & Generate Post', 'seo-postifier'); ?>';
    
    console.log('Mode:', mode);
    console.log('Interview ID:', interviewId);
    console.log('Form exists:', $('#create-script-form').length > 0);
    console.log('Button exists:', $('#submit-button').length > 0);
    console.log('seoPostifierData exists:', typeof seoPostifierData !== 'undefined');
    
    if (typeof seoPostifierData !== 'undefined') {
        console.log('seoPostifierData:', seoPostifierData);
    }

    // Form submission handler
    function handleFormSubmit(e) {
        console.log('=== handleFormSubmit called ===');
        
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
        
        console.log('Main keyword:', $('#main-keyword').val());
        console.log('Description:', $('#user-description').val());
        
        // Don't disable button yet - we need to show suggestions first
        $status.html('');

        // Collect form data - simple version with defaults
        const formData = {
            mainKeyword: $('#main-keyword').val(),
            secondaryKeywords: [],
            keywordDensityTarget: 0.015,
            userDescription: $('#user-description').val(),
            language: 'es',
            searchIntent: 'informational',
            targetAudience: 'General audience',
            toneOfVoice: 'friendly',
            minWordCount: 2000,
            maxWordCount: 2500,
            needsFaqSection: true,
            mentionsBrand: false,
            brandName: '',
            brandDescription: '',
            internalLinksMode: 'auto',
            includeInternalLinks: true,
            includeInternalLinksAutomatically: true,
            externalLinksResearchMode: 'auto',
            externalLinksToIncludeAutomatically: -1,
            useCustomExternalLinks: false,
            notesForWriter: '',
            imagesConfig: {
                aiImagesCount: -1  // Auto mode
            }
        };
        
        const internalLinksMode = 'auto';

        // If in create mode, show suggestions first before creating interview
        if (mode === 'create') {
            console.log('=== CREATE MODE - Starting suggestion flow ===');
            
            // Hide form and show suggestions step
            $('#create-script-form').fadeOut(300, function() {
                $('#suggestions-step-container').fadeIn(300).addClass('fade-in');
            });
            
            // Create a temporary interview to get suggestions
            const tempFormData = {
                mainKeyword: formData.mainKeyword,
                secondaryKeywords: formData.secondaryKeywords,
                userDescription: formData.userDescription,
                language: formData.language,
                searchIntent: formData.searchIntent,
                targetAudience: formData.targetAudience,
                toneOfVoice: formData.toneOfVoice,
                mentionsBrand: formData.mentionsBrand,
                brandName: formData.brandName,
                brandDescription: formData.brandDescription
            };
            
            console.log('Temp form data:', tempFormData);
            console.log('Sending create interview request...');
            
            // Create minimal interview for suggestions
            $.ajax({
                url: seoPostifierData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'seo_postifier_create_interview',
                    nonce: seoPostifierData.nonce,
                    interview_data: tempFormData
                },
                beforeSend: function() {
                    console.log('AJAX beforeSend - creating interview');
                },
                success: function(response) {
                    console.log('Create interview response:', response);
                    if (response.success) {
                        const tempInterviewId = response.data.interview.interviewId;
                        
                        // Now show suggestions
                        showSuggestionsStep(tempInterviewId, formData, function(selectedSuggestion) {
                            // Update formData with selected suggestion if not auto
                            if (selectedSuggestion && selectedSuggestion !== 'auto') {
                                const originalDescription = formData.userDescription || '';
                                const template = '\n\nTemplate:\n\n- Post title: ' + selectedSuggestion.title + '\n\n- Post description format: ' + selectedSuggestion.description;
                                formData.userDescription = originalDescription + template;
                            }
                            
                            // Hide suggestions and show progress
                            $('#suggestions-step-container').fadeOut(300, function() {
                                $('#generation-progress-container').fadeIn(300).addClass('fade-in');
                            });
                            
                            // Update the interview with full data
                            formData.interviewId = tempInterviewId;
                            proceedWithFullCreation(formData, tempInterviewId);
                        });
                    } else {
                        $('#suggestions-loading').html('<div class="notice notice-error inline"><p>' + (response.data.message || '<?php _e('Failed to start process', 'seo-postifier'); ?>') + '</p></div>');
                    }
                },
                error: function() {
                    $('#suggestions-loading').html('<div class="notice notice-error inline"><p><?php _e('Failed to start process. Please try again.', 'seo-postifier'); ?></p></div>');
                }
            });
        } else {
            // Edit mode - proceed directly
            formData.interviewId = interviewId;
            
            // Hide form and show progress
            $('#create-script-form').fadeOut(300, function() {
                $('#generation-progress-container').fadeIn(300).addClass('fade-in');
            });
            
            proceedWithFullCreation(formData, interviewId);
        }
        
        function proceedWithFullCreation(formData, interviewId) {
            $button.prop('disabled', true).text('<?php _e('Processing...', 'seo-postifier'); ?>');
            
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
                        updateInterviewAndContinue(formData, interviewId);
                    },
                    error: function() {
                        // Continue without blog links if fetch fails
                        updateInterviewAndContinue(formData, interviewId);
                    }
                });
            } else {
                updateInterviewAndContinue(formData, interviewId);
            }
        }
        
        function updateInterviewAndContinue(formData, interviewId) {
            // Update interview with complete data
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
                        continueWithGeneration(interviewId);
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
        }

        function showSuggestionsStep(interviewId, formData, onSelectCallback) {
            console.log('=== showSuggestionsStep ===');
            
            // Store for reload functionality
            currentInterviewIdForSuggestions = interviewId;
            currentFormDataForSuggestions = formData;
            currentCallbackForSuggestions = onSelectCallback;
            
            // Show loading
            $('#suggestions-loading').show();
            $('#suggestions-list-container').hide();
            
            // Call generate-suggestions endpoint
            $.ajax({
                url: seoPostifierData.ajaxUrl,
                type: 'POST',
                timeout: 120000,
                data: {
                    action: 'seo_postifier_generate_suggestions',
                    nonce: seoPostifierData.nonce,
                    interview_id: interviewId
                },
                success: function(response) {
                    console.log('=== Suggestions AJAX Success ===');
                    console.log('Full response:', response);
                    console.log('response.success:', response.success);
                    console.log('response.data:', response.data);
                    
                    if (response.success && response.data.suggestions) {
                        let suggestions = [];
                        
                        console.log('Type of suggestions:', typeof response.data.suggestions);
                        console.log('Raw suggestions:', response.data.suggestions);
                        
                        // Parse suggestions - handle both string and object responses
                        if (typeof response.data.suggestions === 'string') {
                            console.log('Parsing string suggestions...');
                            try {
                                const parsed = JSON.parse(response.data.suggestions);
                                console.log('Parsed object:', parsed);
                                
                                // The parsed object should have a "suggestions" property that is an array
                                if (parsed && Array.isArray(parsed.suggestions)) {
                                    suggestions = parsed.suggestions;
                                } else if (Array.isArray(parsed)) {
                                    suggestions = parsed;
                                } else {
                                    console.error('Parsed object does not contain suggestions array:', parsed);
                                    suggestions = [];
                                }
                            } catch (e) {
                                console.error('Failed to parse suggestions:', e);
                                suggestions = [];
                            }
                        } else if (response.data.suggestions.suggestions && Array.isArray(response.data.suggestions.suggestions)) {
                            console.log('Using nested suggestions array');
                            suggestions = response.data.suggestions.suggestions;
                        } else if (Array.isArray(response.data.suggestions)) {
                            console.log('Using direct array');
                            suggestions = response.data.suggestions;
                        } else {
                            console.error('Cannot parse suggestions, unknown format:', response.data.suggestions);
                            suggestions = [];
                        }
                        
                        console.log('Final parsed suggestions:', suggestions);
                        console.log('Is array?:', Array.isArray(suggestions));
                        console.log('Number of suggestions:', Array.isArray(suggestions) ? suggestions.length : 'NOT AN ARRAY');
                        
                        // Build suggestions HTML
                        let suggestionsHtml = '';
                        
                        // Add "Auto" option as first
                        suggestionsHtml += `
                            <div class="seo-postifier-suggestion-card auto" data-suggestion="auto">
                                <h3 class="seo-postifier-suggestion-title">
                                    <span class="seo-postifier-suggestion-badge"><?php _e('Recommended', 'seo-postifier'); ?></span>
                                    <?php _e('Auto', 'seo-postifier'); ?>
                                </h3>
                                <p class="seo-postifier-suggestion-description">
                                    <?php _e('Let AI automatically determine the best structure for your post', 'seo-postifier'); ?>
                                </p>
                            </div>
                        `;
                        
                        // Add actual suggestions
                        suggestions.forEach(function(suggestion, index) {
                            console.log('Adding suggestion', index, ':', suggestion);
                            const suggestionData = JSON.stringify(suggestion).replace(/"/g, '&quot;');
                            suggestionsHtml += `
                                <div class="seo-postifier-suggestion-card" data-suggestion='${suggestionData}'>
                                    <h3 class="seo-postifier-suggestion-title">${suggestion.title || 'No title'}</h3>
                                    <p class="seo-postifier-suggestion-description">${suggestion.description || 'No description'}</p>
                                </div>
                            `;
                        });
                        
                        console.log('Suggestions HTML length:', suggestionsHtml.length);
                        console.log('HTML preview:', suggestionsHtml.substring(0, 200));
                        
                        // Update suggestions list
                        $('#suggestions-list').html(suggestionsHtml);
                        console.log('HTML inserted into #suggestions-list');
                        console.log('#suggestions-list length:', $('#suggestions-list').length);
                        console.log('#suggestions-list content length:', $('#suggestions-list').html().length);
                        
                        // Hide loading and show list
                        console.log('Hiding loader, showing list...');
                        $('#suggestions-loading').fadeOut(300, function() {
                            console.log('Loader hidden');
                            $('#suggestions-list-container').fadeIn(300, function() {
                                console.log('List container shown');
                                console.log('Container is visible:', $('#suggestions-list-container').is(':visible'));
                            });
                        });
                        
                        // Add click handlers
                        $('.seo-postifier-suggestion-card').on('click', function() {
                            console.log('Suggestion clicked');
                            $('.seo-postifier-suggestion-card').removeClass('selected');
                            $(this).addClass('selected');
                            
                            const suggestionData = $(this).data('suggestion');
                            let selectedSuggestion;
                            
                            if (suggestionData === 'auto') {
                                selectedSuggestion = 'auto';
                            } else {
                                selectedSuggestion = suggestionData;
                            }
                            
                            console.log('Selected suggestion:', selectedSuggestion);
                            
                            // Call callback after a short delay for visual feedback
                            setTimeout(function() {
                                onSelectCallback(selectedSuggestion);
                            }, 300);
                        });
                        
                    } else {
                        // Error generating suggestions - show auto option only
                        const errorHtml = `
                            <div class="seo-postifier-suggestion-card auto" data-suggestion="auto">
                                <h3 class="seo-postifier-suggestion-title">
                                    <span class="seo-postifier-suggestion-badge"><?php _e('Recommended', 'seo-postifier'); ?></span>
                                    <?php _e('Auto', 'seo-postifier'); ?>
                                </h3>
                                <p class="seo-postifier-suggestion-description">
                                    <?php _e('Let AI automatically determine the best structure for your post', 'seo-postifier'); ?>
                                </p>
                            </div>
                        `;
                        
                        $('#suggestions-list').html(errorHtml + 
                            '<p style="color: #856404; padding: 10px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px; margin-top: 15px;">' +
                            '<?php _e('Unable to generate suggestions. You can proceed with Auto mode.', 'seo-postifier'); ?></p>');
                        
                        $('.seo-postifier-suggestion-card').on('click', function() {
                            onSelectCallback('auto');
                        });
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Suggestions error:', error);
                    
                    // Hide loading
                    $('#suggestions-loading').fadeOut(300, function() {
                        $('#suggestions-list-container').fadeIn(300);
                    });
                    
                    // Error - show auto option only
                    const errorHtml = `
                        <div class="seo-postifier-suggestion-card auto" data-suggestion="auto">
                            <h3 class="seo-postifier-suggestion-title">
                                <span class="seo-postifier-suggestion-badge"><?php _e('Recommended', 'seo-postifier'); ?></span>
                                <?php _e('Auto', 'seo-postifier'); ?>
                            </h3>
                            <p class="seo-postifier-suggestion-description">
                                <?php _e('Let AI automatically determine the best structure for your post', 'seo-postifier'); ?>
                            </p>
                        </div>
                    `;
                    
                    $('#suggestions-list').html(errorHtml + 
                        '<p style="color: #856404; padding: 10px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px; margin-top: 15px;">' +
                        '<?php _e('Unable to generate suggestions. You can proceed with Auto mode.', 'seo-postifier'); ?></p>');
                    
                    $('.seo-postifier-suggestion-card').on('click', function() {
                        onSelectCallback('auto');
                    });
                }
            });
        }
        
        function continueWithGeneration(interviewIdToUse) {
            console.log('=== continueWithGeneration ===');
            
            // Update progress: Step 1 - Script Text
            $('#step-script-text').addClass('active');
            $('#step-script-text .step-status').text('<?php _e('In Progress...', 'seo-postifier'); ?>');
            
            // Step 1: Generate script text
                    $.ajax({
                        url: seoPostifierData.ajaxUrl,
                        type: 'POST',
                                    timeout: 180000,
                                    data: {
                                        action: 'seo_postifier_generate_script_text',
                                        nonce: seoPostifierData.nonce,
                                        interview_id: interviewIdToUse
                                    },
                                    success: function(genResponse) {
                                        if (genResponse.success) {
                                            console.log('Script text generated');
                                            
                                            // Complete step 1
                                            $('#step-script-text').removeClass('active').addClass('completed');
                                            $('#step-script-text .step-status').html('<?php _e('✓ Completed', 'seo-postifier'); ?>');
                                            
                                            // Start step 2
                                            $('#step-script-definition').addClass('active');
                                            $('#step-script-definition .step-status').text('<?php _e('In Progress...', 'seo-postifier'); ?>');
                                            
                                            // Step 2: Generate script definition
                                $.ajax({
                                    url: seoPostifierData.ajaxUrl,
                                    type: 'POST',
                                                    timeout: 180000,
                                                    data: {
                                                        action: 'seo_postifier_generate_script_definition',
                                                        nonce: seoPostifierData.nonce,
                                                        interview_id: interviewIdToUse
                                                    },
                                                    success: function(defResponse) {
                                                        if (defResponse.success) {
                                                            console.log('Script definition generated');
                                                            
                                                            // Complete step 2
                                                            $('#step-script-definition').removeClass('active').addClass('completed');
                                                            $('#step-script-definition .step-status').html('<?php _e('✓ Completed', 'seo-postifier'); ?>');
                                                            
                                                            // Start step 3
                                                            $('#step-post').addClass('active');
                                                            $('#step-post .step-status').text('<?php _e('In Progress...', 'seo-postifier'); ?>');
                                                            
                                                            // Step 3: Generate post
                                            $.ajax({
                                                url: seoPostifierData.ajaxUrl,
                                                type: 'POST',
                                                                timeout: 300000,
                                                                data: {
                                                                    action: 'seo_postifier_generate_post',
                                                                    nonce: seoPostifierData.nonce,
                                                                    interview_id: interviewIdToUse
                                                                },
                                                                success: function(postResponse) {
                                                                    if (postResponse.success) {
                                                                        console.log('Post generated');
                                                                        const postId = postResponse.data.post._id || postResponse.data.post.id;
                                                                        
                                                                        // Complete step 3
                                                                        $('#step-post').removeClass('active').addClass('completed');
                                                                        $('#step-post .step-status').html('<?php _e('✓ Completed', 'seo-postifier'); ?>');
                                                                        
                                                                        // Start step 4
                                                                        $('#step-wordpress').addClass('active');
                                                                        $('#step-wordpress .step-status').text('<?php _e('In Progress...', 'seo-postifier'); ?>');
                                                                        
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
                                                                                    console.log('WordPress draft created');
                                                                                    
                                                                                    // Complete step 4
                                                                                    $('#step-wordpress').removeClass('active').addClass('completed');
                                                                                    $('#step-wordpress .step-status').html('<?php _e('✓ Completed', 'seo-postifier'); ?>');
                                                                                    
                                                                                    // Add success message
                                                                                    $('#generation-progress-container .card').append(
                                                                                        '<div class="notice notice-success inline" style="margin-top: 30px;"><p>' +
                                                                                        '<?php _e('WordPress draft created successfully! Redirecting to editor...', 'seo-postifier'); ?></p></div>'
                                                                                    );
                                                                                    
                                                                                    setTimeout(function() {
                                                                                        window.location.href = draftResponse.data.edit_url;
                                                                                    }, 1500);
                                                                                } else {
                                                                                    $('#step-wordpress .step-status').html('<?php _e('✗ Failed', 'seo-postifier'); ?>');
                                                                                    $('#generation-progress-container .card').append(
                                                                                        '<div class="notice notice-warning inline" style="margin-top: 30px;"><p><?php _e('Post generated but draft creation failed: ', 'seo-postifier'); ?>' + 
                                                                                        (draftResponse.data.message || '<?php _e('Unknown error', 'seo-postifier'); ?>') + '</p></div>'
                                                                                    );
                                                                                }
                                                                            },
                                                                            error: function() {
                                                                                $('#step-wordpress .step-status').html('<?php _e('✗ Failed', 'seo-postifier'); ?>');
                                                                                $('#generation-progress-container .card').append(
                                                                                    '<div class="notice notice-warning inline" style="margin-top: 30px;"><p><?php _e('Post generated but draft creation failed. Please try creating manually.', 'seo-postifier'); ?></p></div>'
                                                                                );
                                                                            }
                                                                        });
                                                                    } else {
                                                                        $('#step-post .step-status').html('<?php _e('✗ Failed', 'seo-postifier'); ?>');
                                                                        $('#generation-progress-container .card').append(
                                                                            '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php _e('Failed to generate post: ', 'seo-postifier'); ?>' + 
                                                                            (postResponse.data.message || '<?php _e('Unknown error', 'seo-postifier'); ?>') + '</p></div>'
                                                                        );
                                                                    }
                                                                },
                                                                error: function() {
                                                                    $('#step-post .step-status').html('<?php _e('✗ Failed', 'seo-postifier'); ?>');
                                                                    $('#generation-progress-container .card').append(
                                                                        '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php _e('Failed to generate post. Please try again.', 'seo-postifier'); ?></p></div>'
                                                                    );
                                                                }
                                                            });
                                                        } else {
                                                            $('#step-script-definition .step-status').html('<?php _e('✗ Failed', 'seo-postifier'); ?>');
                                                            $('#generation-progress-container .card').append(
                                                                '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php _e('Failed to generate script definition: ', 'seo-postifier'); ?>' + 
                                                                (defResponse.data.message || '<?php _e('Unknown error', 'seo-postifier'); ?>') + '</p></div>'
                                                            );
                                                        }
                                                    },
                                                    error: function() {
                                                        $('#step-script-definition .step-status').html('<?php _e('✗ Failed', 'seo-postifier'); ?>');
                                                        $('#generation-progress-container .card').append(
                                                            '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php _e('Failed to generate script definition. Please try again.', 'seo-postifier'); ?></p></div>'
                                                        );
                                                    }
                                                });
                                            } else {
                                                $('#step-script-text .step-status').html('<?php _e('✗ Failed', 'seo-postifier'); ?>');
                                                $('#generation-progress-container .card').append(
                                                    '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php _e('Failed to generate script text: ', 'seo-postifier'); ?>' + 
                                                    (genResponse.data.message || '<?php _e('Unknown error', 'seo-postifier'); ?>') + '</p></div>'
                                                );
                                            }
                                        },
                                        error: function() {
                                            $('#step-script-text .step-status').html('<?php _e('✗ Failed', 'seo-postifier'); ?>');
                                            $('#generation-progress-container .card').append(
                                                '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php _e('Failed to generate script text. Please try again.', 'seo-postifier'); ?></p></div>'
                                            );
                                        }
                    });
        } // End continueWithGeneration function
        
        return false;
    } // End handleFormSubmit function
    
    // Register form submit handler - prevent default submission
    $('#create-script-form').on('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    });
    
    // Handle button click
    console.log('=== Attaching click handler to button ===');
    
    const $submitBtn = $('#submit-button');
    console.log('Button found:', $submitBtn.length);
    
    $submitBtn.on('click', function(e) {
        console.log('=== BUTTON CLICKED ===');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('Event:', e);
        console.log('Mode:', mode);
        console.log('seoPostifierData:', typeof seoPostifierData !== 'undefined' ? 'available' : 'NOT available');
        
        // Manually validate
        const form = $('#create-script-form')[0];
        console.log('Form element:', form);
        
        if (form && form.checkValidity()) {
            console.log('✓ Form is valid, calling handleFormSubmit...');
            handleFormSubmit(e);
        } else {
            console.log('✗ Form validation failed');
            if (form) {
                form.reportValidity();
            } else {
                console.error('Form element not found!');
            }
        }
        return false;
    });
    
    console.log('=== Handler attached, testing click ===');
    
    // Test if button is clickable
    setTimeout(function() {
        console.log('Button is visible:', $submitBtn.is(':visible'));
        console.log('Button is enabled:', !$submitBtn.prop('disabled'));
    }, 100);
    
    // Back to form button
    $('#back-to-form-button').on('click', function() {
        console.log('Back button clicked');
        $('#suggestions-step-container').fadeOut(300, function() {
            $('#create-script-form').fadeIn(300).addClass('fade-in');
            // Re-enable the submit button
            $submitBtn.prop('disabled', false).text(originalButtonText);
        });
    });
    
    // Reload suggestions button
    let currentInterviewIdForSuggestions = null;
    let currentFormDataForSuggestions = null;
    let currentCallbackForSuggestions = null;
    
    $('#reload-suggestions-button').on('click', function() {
        console.log('Reload suggestions button clicked');
        
        if (!currentInterviewIdForSuggestions) {
            alert('<?php _e('Cannot reload suggestions. Please try again from the beginning.', 'seo-postifier'); ?>');
            return;
        }
        
        // Show loading and hide list
        $('#suggestions-list-container').fadeOut(300, function() {
            $('#suggestions-loading').fadeIn(300);
            
            // Regenerate suggestions
            if (currentFormDataForSuggestions && currentCallbackForSuggestions) {
                showSuggestionsStep(currentInterviewIdForSuggestions, currentFormDataForSuggestions, currentCallbackForSuggestions);
            }
        });
    });
});
</script>
