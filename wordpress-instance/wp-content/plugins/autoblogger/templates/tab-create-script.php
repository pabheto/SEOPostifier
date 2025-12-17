<?php
/**
 * Create Script Template - Unified Form with Tabs
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Determine if we're in create or edit mode
// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- GET parameter for navigation, not form processing
$autoblogger_interview_id = isset($_GET['interviewId']) ? sanitize_text_field(wp_unslash($_GET['interviewId'])) : '';
$autoblogger_is_edit_mode = !empty($autoblogger_interview_id);
$mode = $autoblogger_is_edit_mode ? 'edit' : 'create';
?>

<div class="autoblogger-create-script">
    <div class="card">
        <h2><?php echo esc_html($autoblogger_is_edit_mode ? __('Edit Draft', 'autoblogger') : __('Create New Draft', 'autoblogger')); ?></h2>
        <p><?php echo esc_html($autoblogger_is_edit_mode ? __('Update your draft parameters and settings.', 'autoblogger') : __('Define the SEO specifications for your new draft.', 'autoblogger')); ?></p>

        <p>
            <a href="?page=autoblogger&tab=scripts" class="button button-secondary">
                <?php esc_html_e('← Back to My Drafts', 'autoblogger'); ?>
            </a>
        </p>

        <form id="create-script-form" data-mode="<?php echo esc_attr($mode); ?>" data-interview-id="<?php echo esc_attr($autoblogger_interview_id); ?>" style="margin-top: 20px;" onsubmit="return false;">
            
            <!-- Tab Navigation -->
            <div class="autoblogger-form-tabs">
                <button type="button" class="form-tab active" data-tab="draft">
                    <?php esc_html_e('Draft Information', 'autoblogger'); ?>
                </button>
                <button type="button" class="form-tab" data-tab="settings">
                    <?php esc_html_e('Settings', 'autoblogger'); ?>
                </button>
            </div>

            <!-- Tab 1: Draft Information -->
            <div id="tab-draft" class="form-tab-content active">
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="main-keyword"><?php esc_html_e('Search Intent', 'autoblogger'); ?> *</label>
                        </th>
                        <td>
                            <input type="text" id="main-keyword" name="mainKeyword" class="regular-text" required />
                            <p class="description"><?php esc_html_e('Primary keyword or search intent to optimize for', 'autoblogger'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="user-description"><?php esc_html_e('Post Description', 'autoblogger'); ?></label>
                        </th>
                        <td>
                            <textarea id="user-description" name="userDescription" rows="6"
                                      class="large-text"></textarea>
                            <p class="description"><?php esc_html_e('Optional: Describe what the post should be about', 'autoblogger'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Tab 2: Settings -->
            <div id="tab-settings" class="form-tab-content">
                <h3><?php esc_html_e('Advanced Settings', 'autoblogger'); ?></h3>
                <p class="description"><?php esc_html_e('Configure additional settings for your draft. Click on each section to expand.', 'autoblogger'); ?></p>

                <!-- Accordion: Images -->
                <div class="settings-accordion">
                    <div class="accordion-header">
                        <h4><?php esc_html_e('Images', 'autoblogger'); ?></h4>
                        <span class="accordion-toggle">▼</span>
                    </div>
                    <div class="accordion-content">
                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="ai-images-mode"><?php esc_html_e('AI Images', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <select id="ai-images-mode" name="aiImagesMode">
                                        <option value="disabled"><?php esc_html_e('Disabled', 'autoblogger'); ?></option>
                                        <option value="auto" selected><?php esc_html_e('Auto', 'autoblogger'); ?></option>
                                        <option value="custom"><?php esc_html_e('Custom', 'autoblogger'); ?></option>
                                    </select>
                                    <p class="description"><?php esc_html_e('Select how AI images should be generated', 'autoblogger'); ?></p>
                                </td>
                            </tr>
                            <tr id="ai-images-custom-count-row" style="display: none;">
                                <th scope="row">
                                    <label for="ai-images-count"><?php esc_html_e('Number of Images', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <input type="number" id="ai-images-count" name="aiImagesCount"
                                           value="5" min="1" class="small-text" />
                                    <p class="description"><?php esc_html_e('Number of AI-generated images to create', 'autoblogger'); ?></p>
                                </td>
                            </tr>
                            <tr id="ai-images-custom-descriptions-row" style="display: none;">
                                <th scope="row">
                                    <label for="use-custom-ai-descriptions"><?php esc_html_e('Custom AI Descriptions', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox" id="use-custom-ai-descriptions" name="useCustomAiDescriptions" value="1" />
                                    <label for="use-custom-ai-descriptions"><?php esc_html_e('Provide custom descriptions for each AI image', 'autoblogger'); ?></label>
                                </td>
                            </tr>
                            <tr id="ai-images-descriptions-container" style="display: none;">
                                <td colspan="2">
                                    <div id="ai-images-descriptions-list"></div>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label><?php esc_html_e('User Images', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <button type="button" id="add-user-image" class="button button-secondary">
                                        <?php esc_html_e('+ Add User Image', 'autoblogger'); ?>
                                    </button>
                                    <p class="description"><?php esc_html_e('Add your own images to be used in the post', 'autoblogger'); ?></p>
                                    <div id="user-images-list" style="margin-top: 15px;"></div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Accordion: Style and Audience -->
                <div class="settings-accordion">
                    <div class="accordion-header">
                        <h4><?php esc_html_e('Style and Audience', 'autoblogger'); ?></h4>
                        <span class="accordion-toggle">▼</span>
                    </div>
                    <div class="accordion-content">
                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="language"><?php esc_html_e('Language', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <select id="language" name="language">
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
                                    <label for="search-intent"><?php esc_html_e('Search Intent Type', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <select id="search-intent" name="searchIntent">
                                        <option value="informational" selected>Informational</option>
                                        <option value="transactional">Transactional</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="navigational">Navigational</option>
                                    </select>
                                    <p class="description"><?php esc_html_e('User\'s search intent type', 'autoblogger'); ?></p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="target-audience"><?php esc_html_e('Target Audience', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <input type="text" id="target-audience" name="targetAudience"
                                           class="regular-text" value="General audience" />
                                    <p class="description"><?php esc_html_e('Describe your target audience', 'autoblogger'); ?></p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="tone-of-voice"><?php esc_html_e('Tone of Voice', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <select id="tone-of-voice" name="toneOfVoice">
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
                                    <label for="min-word-count"><?php esc_html_e('Minimum Word Count', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <input type="number" id="min-word-count" name="minWordCount"
                                           value="2000" min="100" class="small-text" />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="max-word-count"><?php esc_html_e('Maximum Word Count', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <input type="number" id="max-word-count" name="maxWordCount"
                                           value="2500" min="100" class="small-text" />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="needs-faq"><?php esc_html_e('Include FAQ Section', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox" id="needs-faq" name="needsFaqSection" value="1" checked />
                                    <label for="needs-faq"><?php esc_html_e('Add FAQ section at the end', 'autoblogger'); ?></label>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="notes-for-writer"><?php esc_html_e('Additional Instructions', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <textarea id="notes-for-writer" name="notesForWriter" rows="3"
                                              class="large-text"></textarea>
                                    <p class="description"><?php esc_html_e('Any additional instructions or requirements', 'autoblogger'); ?></p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Accordion: Keywords -->
                <div class="settings-accordion">
                    <div class="accordion-header">
                        <h4><?php esc_html_e('Keywords', 'autoblogger'); ?></h4>
                        <span class="accordion-toggle">▼</span>
                    </div>
                    <div class="accordion-content">
                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="secondary-keywords"><?php esc_html_e('Secondary Keywords', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <input type="text" id="secondary-keywords" name="secondaryKeywords" class="large-text" />
                                    <p class="description"><?php esc_html_e('Comma-separated list of secondary keywords', 'autoblogger'); ?></p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="keyword-density"><?php esc_html_e('Keyword Density Target', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <input type="number" id="keyword-density" name="keywordDensityTarget"
                                           value="0.015" min="0" max="1" step="0.001" class="small-text" />
                                    <p class="description"><?php esc_html_e('Target keyword density (0-1, default: 0.015)', 'autoblogger'); ?></p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Accordion: Link Mentions -->
                <div class="settings-accordion">
                    <div class="accordion-header">
                        <h4><?php esc_html_e('Link Mentions', 'autoblogger'); ?></h4>
                        <span class="accordion-toggle">▼</span>
                    </div>
                    <div class="accordion-content">
                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="internal-links-mode"><?php esc_html_e('Internal Links', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <select id="internal-links-mode" name="internalLinksMode">
                                        <option value="auto" selected><?php esc_html_e('Auto', 'autoblogger'); ?></option>
                                        <option value="disabled"><?php esc_html_e('Disabled', 'autoblogger'); ?></option>
                                        <option value="custom"><?php esc_html_e('Custom', 'autoblogger'); ?></option>
                                    </select>
                                    <p class="description"><?php esc_html_e('Select how internal links should be handled', 'autoblogger'); ?></p>
                                </td>
                            </tr>
                            <tr class="internal-links-custom-fields" style="display: none;">
                                <th scope="row">
                                    <label for="internal-links-to-use"><?php esc_html_e('Internal Links URLs', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <textarea id="internal-links-to-use" name="internalLinksToUse" rows="3"
                                              class="large-text" placeholder="One URL per line"></textarea>
                                    <p class="description"><?php esc_html_e('Specific internal links to include (one per line)', 'autoblogger'); ?></p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="external-links-research-mode"><?php esc_html_e('External Link Research', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <select id="external-links-research-mode" name="externalLinksResearchMode">
                                        <option value="auto" selected><?php esc_html_e('Auto', 'autoblogger'); ?></option>
                                        <option value="disabled"><?php esc_html_e('Disabled', 'autoblogger'); ?></option>
                                    </select>
                                    <p class="description"><?php esc_html_e('Automatically research and include external links', 'autoblogger'); ?></p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="use-custom-external-links"><?php esc_html_e('Use Custom External Links', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox" id="use-custom-external-links"
                                           name="useCustomExternalLinks" value="1" />
                                    <label for="use-custom-external-links"><?php esc_html_e('Provide specific external links to include', 'autoblogger'); ?></label>
                                </td>
                            </tr>
                            <tr class="external-links-custom-fields" style="display: none;">
                                <th scope="row">
                                    <label for="external-links-to-use"><?php esc_html_e('External Links URLs', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <textarea id="external-links-to-use" name="externalLinksToUse" rows="3"
                                              class="large-text" placeholder="One URL per line"></textarea>
                                    <p class="description"><?php esc_html_e('Specific external links to include (one per line)', 'autoblogger'); ?></p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Accordion: Brand Mentions -->
                <div class="settings-accordion">
                    <div class="accordion-header">
                        <h4><?php esc_html_e('Brand Mentions', 'autoblogger'); ?></h4>
                        <span class="accordion-toggle">▼</span>
                    </div>
                    <div class="accordion-content">
                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="mentions-brand"><?php esc_html_e('Mention Brand', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox" id="mentions-brand" name="mentionsBrand" value="1" />
                                    <label for="mentions-brand"><?php esc_html_e('Include brand mentions', 'autoblogger'); ?></label>
                                </td>
                            </tr>
                            <tr class="brand-fields" style="display: none;">
                                <th scope="row">
                                    <label for="brand-name"><?php esc_html_e('Brand Name', 'autoblogger'); ?></label>
                                </th>
                                <td>
                                    <input type="text" id="brand-name" name="brandName" class="regular-text" />
                                </td>
                            </tr>
                            <tr class="brand-fields" style="display: none;">
                                <th scope="row">
                                    <label for="brand-description"><?php esc_html_e('Brand Description', 'autoblogger'); ?></label>
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
                <button type="button" class="button button-primary button-large" id="submit-button">
                    <?php echo esc_html($autoblogger_is_edit_mode ? __('Update & Generate Post', 'autoblogger') : __('Create & Generate Post', 'autoblogger')); ?>
                </button>
                <a href="?page=autoblogger&tab=scripts" class="button button-secondary">
                    <?php esc_html_e('Cancel', 'autoblogger'); ?>
                </a>
            </p>

            <div id="create-script-status" style="margin-top: 15px;"></div>
        </form>
        
        <!-- Suggestions Step Container -->
        <div id="suggestions-step-container" style="display: none; margin-top: 30px;">
            <div class="card">
                <h2><?php esc_html_e('Select Post Architecture', 'autoblogger'); ?></h2>
                <p><?php esc_html_e('Choose a post structure suggestion or let AI decide automatically', 'autoblogger'); ?></p>
                
                <!-- Loading State -->
                <div id="suggestions-loading" class="autoblogger-fancy-loader" style="display: block;">
                    <div class="loader-spinner"></div>
                    <h3><?php esc_html_e('Generating Suggestions...', 'autoblogger'); ?></h3>
                    <p><?php esc_html_e('AI is analyzing your search intent and creating architecture options', 'autoblogger'); ?></p>
                </div>
                
                <!-- Suggestions List -->
                <div id="suggestions-list-container" style="display: none; margin-top: 20px;">
                    <div id="suggestions-list" class="autoblogger-suggestions-grid"></div>
                    
                    <p class="submit" style="margin-top: 30px;">
                        <button type="button" class="button button-secondary" id="back-to-form-button">
                            <?php esc_html_e('← Back to Edit', 'autoblogger'); ?>
                        </button>
                        <button type="button" class="button button-secondary" id="reload-suggestions-button" style="margin-left: 10px;">
                            <span class="dashicons dashicons-update" style="margin-top: 3px;"></span>
                            <?php esc_html_e('Reload Suggestions', 'autoblogger'); ?>
                        </button>
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Generation Progress Container -->
        <div id="generation-progress-container" style="display: none; margin-top: 30px;">
            <div class="card">
                <h2><?php esc_html_e('Generating Your Post', 'autoblogger'); ?></h2>
                
                <div class="autoblogger-progress-steps">
                    <div class="progress-step" id="step-script-text">
                        <div class="step-icon">
                            <span class="dashicons dashicons-admin-page"></span>
                        </div>
                        <div class="step-content">
                            <h3><?php esc_html_e('Generating Script Text', 'autoblogger'); ?></h3>
                            <p class="step-description"><?php esc_html_e('Creating the structured content outline', 'autoblogger'); ?></p>
                            <div class="step-status"><?php esc_html_e('Pending...', 'autoblogger'); ?></div>
                        </div>
                    </div>
                    
                    <div class="progress-step" id="step-script-definition">
                        <div class="step-icon">
                            <span class="dashicons dashicons-editor-table"></span>
                        </div>
                        <div class="step-content">
                            <h3><?php esc_html_e('Generating Script Definition', 'autoblogger'); ?></h3>
                            <p class="step-description"><?php esc_html_e('Defining sections and structure', 'autoblogger'); ?></p>
                            <div class="step-status"><?php esc_html_e('Pending...', 'autoblogger'); ?></div>
                        </div>
                    </div>
                    
                    <div class="progress-step" id="step-post">
                        <div class="step-icon">
                            <span class="dashicons dashicons-edit-large"></span>
                        </div>
                        <div class="step-content">
                            <h3><?php esc_html_e('Generating Post Content', 'autoblogger'); ?></h3>
                            <p class="step-description"><?php esc_html_e('Writing the complete post with AI', 'autoblogger'); ?></p>
                            <div class="step-status"><?php esc_html_e('Pending...', 'autoblogger'); ?></div>
                        </div>
                    </div>
                    
                    <div class="progress-step" id="step-wordpress">
                        <div class="step-icon">
                            <span class="dashicons dashicons-wordpress"></span>
                        </div>
                        <div class="step-content">
                            <h3><?php esc_html_e('Creating WordPress Draft', 'autoblogger'); ?></h3>
                            <p class="step-description"><?php esc_html_e('Publishing to WordPress editor', 'autoblogger'); ?></p>
                            <div class="step-status"><?php esc_html_e('Pending...', 'autoblogger'); ?></div>
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

    console.log('=== Autoblogger Script Loaded ===');
    console.log('jQuery version:', $.fn.jquery);
    
    const mode = $('#create-script-form').data('mode');
    const interviewId = $('#create-script-form').data('interview-id');
    const originalButtonText = '<?php echo esc_js($autoblogger_is_edit_mode ? __('Update & Generate Post', 'autoblogger') : __('Create & Generate Post', 'autoblogger')); ?>';
    
    console.log('Mode:', mode);
    console.log('Interview ID:', interviewId);
    console.log('Form exists:', $('#create-script-form').length > 0);
    console.log('Button exists:', $('#submit-button').length > 0);
    console.log('autobloggerData exists:', typeof autobloggerData !== 'undefined');
    
    if (typeof autobloggerData !== 'undefined') {
        console.log('autobloggerData:', autobloggerData);
    }

    // Tab switching functionality
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

    // Toggle conditional fields - Brand
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

    // Handle AI images count change
    let aiImagesCount = 5;
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
        
        if (!$('#use-custom-ai-descriptions').is(':checked')) {
            return;
        }

        const count = parseInt($('#ai-images-count').val()) || 5;
        for (let i = 0; i < count; i++) {
            const item = $('<div class="ai-image-description-item" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;"></div>');
            item.append('<label style="display: block; font-weight: 600; margin-bottom: 5px;">' + 
                '<?php esc_html_e('Image', 'autoblogger'); ?> ' + (i + 1) + ':</label>');
            item.append('<textarea class="large-text ai-image-description" data-index="' + i + '" ' +
                'placeholder="<?php esc_html_e('Describe what this image should show...', 'autoblogger'); ?>" ' +
                'rows="2" style="width: 100%;"></textarea>');
            container.append(item);
        }
    }

    // Add user image
    let userImageCounter = 0;
    $('#add-user-image').on('click', function() {
        const imageId = 'user-image-' + userImageCounter++;
        const item = $('<div class="user-image-item" data-id="' + imageId + '" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;"></div>');
        
        item.append('<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
            '<strong><?php esc_html_e('User Image', 'autoblogger'); ?> #' + (userImageCounter) + '</strong>' +
            '<button type="button" class="button button-link-delete remove-user-image" style="color: #b32d2e;">' +
            '<?php esc_html_e('Remove', 'autoblogger'); ?></button></div>');
        
        item.append('<table class="form-table" style="margin: 0;"><tbody>');
        
        // Source Type
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php esc_html_e('Source Type', 'autoblogger'); ?></label></th>' +
            '<td style="padding: 10px 0;"><input type="text" class="regular-text user-image-source-type" ' +
            'placeholder="<?php esc_html_e('e.g., url, wordpress_id', 'autoblogger'); ?>" /></td>' +
            '</tr>');
        
        // Source Value (Link)
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php esc_html_e('Link/URL', 'autoblogger'); ?> *</label></th>' +
            '<td style="padding: 10px 0;"><input type="text" class="regular-text user-image-source-value" ' +
            'placeholder="<?php esc_html_e('Image URL or WordPress ID', 'autoblogger'); ?>" required /></td>' +
            '</tr>');
        
        // Suggested Alt
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php esc_html_e('Alt Text', 'autoblogger'); ?></label></th>' +
            '<td style="padding: 10px 0;"><input type="text" class="regular-text user-image-alt" ' +
            'placeholder="<?php esc_html_e('Suggested alt text for the image', 'autoblogger'); ?>" /></td>' +
            '</tr>');
        
        // Image Description
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php esc_html_e('Image Description', 'autoblogger'); ?></label></th>' +
            '<td style="padding: 10px 0;"><textarea class="large-text user-image-description" rows="2" ' +
            'placeholder="<?php esc_html_e('Describe the image and what it shows', 'autoblogger'); ?>"></textarea></td>' +
            '</tr>');
        
        // Usage Notes
        item.find('tbody').append('<tr>' +
            '<th style="width: 150px; padding: 10px 0;"><label><?php esc_html_e('Usage Notes', 'autoblogger'); ?></label></th>' +
            '<td style="padding: 10px 0;"><textarea class="large-text user-image-notes" rows="2" ' +
            'placeholder="<?php esc_html_e('How should this image be used in the post?', 'autoblogger'); ?>"></textarea></td>' +
            '</tr>');
        
        item.find('tbody').append('</tbody></table>');
        
        $('#user-images-list').append(item);
        
        // Remove button handler
        item.find('.remove-user-image').on('click', function() {
            item.remove();
        });
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

    // Toggle custom external links fields
    $('#use-custom-external-links').on('change', function() {
        if ($(this).is(':checked')) {
            $('.external-links-custom-fields').show();
        } else {
            $('.external-links-custom-fields').hide();
        }
    });

    // Initialize AI images mode handler
    $('#ai-images-mode').trigger('change');

    // Form submission handler
    function handleFormSubmit(e) {
        console.log('=== handleFormSubmit called ===');
        
        if (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
        
        // Verify that required data is available
        if (typeof autobloggerData === 'undefined') {
            console.error('autobloggerData is not available');
            alert('<?php esc_html_e('Error: Plugin data not loaded. Please refresh the page.', 'autoblogger'); ?>');
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

        // Collect images configuration
        const aiImagesMode = $('#ai-images-mode').val();
        let aiImagesCountValue;
        
        if (aiImagesMode === 'auto') {
            aiImagesCountValue = -1;
        } else if (aiImagesMode === 'custom') {
            const aiImagesCountInput = $('#ai-images-count').val();
            aiImagesCountValue = (aiImagesCountInput !== '' && !isNaN(parseInt(aiImagesCountInput))) 
                ? parseInt(aiImagesCountInput) 
                : 5;
        } else {
            // disabled
            aiImagesCountValue = 0;
        }
        
        const useCustomAiDescriptions = $('#use-custom-ai-descriptions').is(':checked');
        const aiImagesUserDescriptions = [];
        
        if (useCustomAiDescriptions && aiImagesMode === 'custom' && aiImagesCountValue > 0) {
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
            aiImagesCount: aiImagesCountValue
        };
        
        if (aiImagesUserDescriptions.length > 0) {
            imagesConfig.aiImagesUserDescriptions = aiImagesUserDescriptions;
        }
        if (userImages.length > 0) {
            imagesConfig.useUserImages = true;
            imagesConfig.userImages = userImages;
        }

        // Helper function to split string into array
        const splitAndFilter = (str, delimiter) => {
            if (!str || typeof str !== 'string') return [];
            return str.split(delimiter)
                .map(item => item.trim())
                .filter(item => item.length > 0);
        };

        // Collect all form data
        const internalLinksMode = $('#internal-links-mode').val();
        const formData = {
            mainKeyword: $('#main-keyword').val(),
            secondaryKeywords: splitAndFilter($('#secondary-keywords').val(), ','),
            keywordDensityTarget: parseFloat($('#keyword-density').val()) || 0.015,
            userDescription: $('#user-description').val(),
            language: $('#language').val(),
            searchIntent: $('#search-intent').val(),
            targetAudience: $('#target-audience').val(),
            toneOfVoice: $('#tone-of-voice').val(),
            minWordCount: parseInt($('#min-word-count').val()) || 2000,
            maxWordCount: parseInt($('#max-word-count').val()) || 2500,
            needsFaqSection: $('#needs-faq').is(':checked'),
            mentionsBrand: $('#mentions-brand').is(':checked'),
            brandName: $('#brand-name').val() || '',
            brandDescription: $('#brand-description').val() || '',
            internalLinksMode: internalLinksMode,
            includeInternalLinks: internalLinksMode !== 'disabled',
            includeInternalLinksAutomatically: internalLinksMode === 'auto',
            internalLinksToUse: internalLinksMode === 'custom' ? splitAndFilter($('#internal-links-to-use').val(), '\n') : undefined,
            externalLinksResearchMode: $('#external-links-research-mode').val(),
            externalLinksToIncludeAutomatically: $('#external-links-research-mode').val() === 'auto' ? -1 : 0,
            useCustomExternalLinks: $('#use-custom-external-links').is(':checked'),
            externalLinksToUse: $('#use-custom-external-links').is(':checked') ? splitAndFilter($('#external-links-to-use').val(), '\n') : undefined,
            notesForWriter: $('#notes-for-writer').val() || '',
            imagesConfig: imagesConfig
        };

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
                url: autobloggerData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'autoblogger_create_interview',
                    nonce: autobloggerData.nonce,
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
                        $('#suggestions-loading').html('<div class="notice notice-error inline"><p>' + (response.data.message || '<?php echo esc_js(__('Failed to start process', 'autoblogger')); ?>') + '</p></div>');
                    }
                },
                error: function() {
                    $('#suggestions-loading').html('<div class="notice notice-error inline"><p><?php echo esc_js(__('Failed to start process. Please try again.', 'autoblogger')); ?></p></div>');
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
            $button.prop('disabled', true).text('<?php echo esc_js(__('Processing...', 'autoblogger')); ?>');
            
            // If internal links mode is auto, fetch blog links
            if (internalLinksMode === 'auto') {
                $.ajax({
                    url: autobloggerData.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'autoblogger_get_blog_links',
                        nonce: autobloggerData.nonce
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
                url: autobloggerData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'autoblogger_update_interview',
                    nonce: autobloggerData.nonce,
                    interview_data: formData
                },
                success: function(response) {
                    if (response.success) {
                        continueWithGeneration(interviewId);
                    } else {
                        $status.html('<div class="notice notice-error inline"><p>' + (response.data.message || '<?php echo esc_js(__('Failed to save draft', 'autoblogger')); ?>') + '</p></div>');
                        $button.prop('disabled', false).text(originalText);
                    }
                },
                error: function() {
                    $status.html('<div class="notice notice-error inline"><p><?php echo esc_js(__('Failed to save draft. Please try again.', 'autoblogger')); ?></p></div>');
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
                url: autobloggerData.ajaxUrl,
                type: 'POST',
                timeout: 120000,
                data: {
                    action: 'autoblogger_generate_suggestions',
                    nonce: autobloggerData.nonce,
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
                            <div class="autoblogger-suggestion-card auto" data-suggestion="auto">
                                <h3 class="autoblogger-suggestion-title">
                                    <span class="autoblogger-suggestion-badge"><?php esc_html_e('Recommended', 'autoblogger'); ?></span>
                                    <?php esc_html_e('Auto', 'autoblogger'); ?>
                                </h3>
                                <p class="autoblogger-suggestion-description">
                                    <?php esc_html_e('Let AI automatically determine the best structure for your post', 'autoblogger'); ?>
                                </p>
                            </div>
                        `;
                        
                        // Add actual suggestions
                        suggestions.forEach(function(suggestion, index) {
                            console.log('Adding suggestion', index, ':', suggestion);
                            const suggestionData = JSON.stringify(suggestion).replace(/"/g, '&quot;');
                            suggestionsHtml += `
                                <div class="autoblogger-suggestion-card" data-suggestion='${suggestionData}'>
                                    <h3 class="autoblogger-suggestion-title">${suggestion.title || 'No title'}</h3>
                                    <p class="autoblogger-suggestion-description">${suggestion.description || 'No description'}</p>
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
                        $('.autoblogger-suggestion-card').on('click', function() {
                            console.log('Suggestion clicked');
                            $('.autoblogger-suggestion-card').removeClass('selected');
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
                            <div class="autoblogger-suggestion-card auto" data-suggestion="auto">
                                <h3 class="autoblogger-suggestion-title">
                                    <span class="autoblogger-suggestion-badge"><?php esc_html_e('Recommended', 'autoblogger'); ?></span>
                                    <?php esc_html_e('Auto', 'autoblogger'); ?>
                                </h3>
                                <p class="autoblogger-suggestion-description">
                                    <?php esc_html_e('Let AI automatically determine the best structure for your post', 'autoblogger'); ?>
                                </p>
                            </div>
                        `;
                        
                        $('#suggestions-list').html(errorHtml + 
                            '<p style="color: #856404; padding: 10px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px; margin-top: 15px;">' +
                            '<?php esc_html_e('Unable to generate suggestions. You can proceed with Auto mode.', 'autoblogger'); ?></p>');
                        
                        $('.autoblogger-suggestion-card').on('click', function() {
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
                        <div class="autoblogger-suggestion-card auto" data-suggestion="auto">
                            <h3 class="autoblogger-suggestion-title">
                                <span class="autoblogger-suggestion-badge"><?php esc_html_e('Recommended', 'autoblogger'); ?></span>
                                <?php esc_html_e('Auto', 'autoblogger'); ?>
                            </h3>
                            <p class="autoblogger-suggestion-description">
                                <?php esc_html_e('Let AI automatically determine the best structure for your post', 'autoblogger'); ?>
                            </p>
                        </div>
                    `;
                    
                    $('#suggestions-list').html(errorHtml + 
                        '<p style="color: #856404; padding: 10px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px; margin-top: 15px;">' +
                        '<?php esc_html_e('Unable to generate suggestions. You can proceed with Auto mode.', 'autoblogger'); ?></p>');
                    
                    $('.autoblogger-suggestion-card').on('click', function() {
                        onSelectCallback('auto');
                    });
                }
            });
        }
        
        function continueWithGeneration(interviewIdToUse) {
            console.log('=== continueWithGeneration ===');
            
            // Update progress: Step 1 - Script Text
            $('#step-script-text').addClass('active');
            $('#step-script-text .step-status').text('<?php esc_html_e('In Progress...', 'autoblogger'); ?>');
            
            // Step 1: Generate script text
                    $.ajax({
                        url: autobloggerData.ajaxUrl,
                        type: 'POST',
                                    timeout: 180000,
                                    data: {
                                        action: 'autoblogger_generate_script_text',
                                        nonce: autobloggerData.nonce,
                                        interview_id: interviewIdToUse
                                    },
                                    success: function(genResponse) {
                                        if (genResponse.success) {
                                            console.log('Script text generated');
                                            
                                            // Complete step 1
                                            $('#step-script-text').removeClass('active').addClass('completed');
                                            $('#step-script-text .step-status').html('<?php esc_html_e('✓ Completed', 'autoblogger'); ?>');
                                            
                                            // Start step 2
                                            $('#step-script-definition').addClass('active');
                                            $('#step-script-definition .step-status').text('<?php esc_html_e('In Progress...', 'autoblogger'); ?>');
                                            
                                            // Step 2: Generate script definition
                                $.ajax({
                                    url: autobloggerData.ajaxUrl,
                                    type: 'POST',
                                                    timeout: 180000,
                                                    data: {
                                                        action: 'autoblogger_generate_script_definition',
                                                        nonce: autobloggerData.nonce,
                                                        interview_id: interviewIdToUse
                                                    },
                                                    success: function(defResponse) {
                                                        if (defResponse.success) {
                                                            console.log('Script definition generated');
                                                            
                                                            // Complete step 2
                                                            $('#step-script-definition').removeClass('active').addClass('completed');
                                                            $('#step-script-definition .step-status').html('<?php esc_html_e('✓ Completed', 'autoblogger'); ?>');
                                                            
                                                            // Start step 3
                                                            $('#step-post').addClass('active');
                                                            $('#step-post .step-status').text('<?php esc_html_e('In Progress...', 'autoblogger'); ?>');
                                                            
                                                            // Step 3: Generate post
                                            $.ajax({
                                                url: autobloggerData.ajaxUrl,
                                                type: 'POST',
                                                                timeout: 300000,
                                                                data: {
                                                                    action: 'autoblogger_generate_post',
                                                                    nonce: autobloggerData.nonce,
                                                                    interview_id: interviewIdToUse
                                                                },
                                                                success: function(postResponse) {
                                                                    if (postResponse.success) {
                                                                        console.log('Post generated');
                                                                        const postId = postResponse.data.post._id || postResponse.data.post.id;
                                                                        
                                                                        // Complete step 3
                                                                        $('#step-post').removeClass('active').addClass('completed');
                                                                        $('#step-post .step-status').html('<?php esc_html_e('✓ Completed', 'autoblogger'); ?>');
                                                                        
                                                                        // Start step 4
                                                                        $('#step-wordpress').addClass('active');
                                                                        $('#step-wordpress .step-status').text('<?php esc_html_e('In Progress...', 'autoblogger'); ?>');
                                                                        
                                                                        // Step 4: Create WordPress draft
                                                        $.ajax({
                                                            url: autobloggerData.ajaxUrl,
                                                            type: 'POST',
                                                            data: {
                                                                action: 'autoblogger_create_wp_draft',
                                                                nonce: autobloggerData.nonce,
                                                                post_id: postId
                                                                            },
                                                                            success: function(draftResponse) {
                                                                                if (draftResponse.success) {
                                                                                    console.log('WordPress draft created');
                                                                                    
                                                                                    // Complete step 4
                                                                                    $('#step-wordpress').removeClass('active').addClass('completed');
                                                                                    $('#step-wordpress .step-status').html('<?php esc_html_e('✓ Completed', 'autoblogger'); ?>');
                                                                                    
                                                                                    // Add success message
                                                                                    $('#generation-progress-container .card').append(
                                                                                        '<div class="notice notice-success inline" style="margin-top: 30px;"><p>' +
                                                                                        '<?php esc_html_e('WordPress draft created successfully! Redirecting to editor...', 'autoblogger'); ?></p></div>'
                                                                                    );
                                                                                    
                                                                                    setTimeout(function() {
                                                                                        window.location.href = draftResponse.data.edit_url;
                                                                                    }, 1500);
                                                                                } else {
                                                                                    $('#step-wordpress .step-status').html('<?php esc_html_e('✗ Failed', 'autoblogger'); ?>');
                                                                                    $('#generation-progress-container .card').append(
                                                                                        '<div class="notice notice-warning inline" style="margin-top: 30px;"><p><?php esc_html_e('Post generated but draft creation failed: ', 'autoblogger'); ?>' + 
                                                                                        (draftResponse.data.message || '<?php esc_html_e('Unknown error', 'autoblogger'); ?>') + '</p></div>'
                                                                                    );
                                                                                }
                                                                            },
                                                                            error: function() {
                                                                                $('#step-wordpress .step-status').html('<?php esc_html_e('✗ Failed', 'autoblogger'); ?>');
                                                                                $('#generation-progress-container .card').append(
                                                                                    '<div class="notice notice-warning inline" style="margin-top: 30px;"><p><?php esc_html_e('Post generated but draft creation failed. Please try creating manually.', 'autoblogger'); ?></p></div>'
                                                                                );
                                                                            }
                                                                        });
                                                                    } else {
                                                                        $('#step-post .step-status').html('<?php esc_html_e('✗ Failed', 'autoblogger'); ?>');
                                                                        $('#generation-progress-container .card').append(
                                                                            '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php esc_html_e('Failed to generate post: ', 'autoblogger'); ?>' + 
                                                                            (postResponse.data.message || '<?php esc_html_e('Unknown error', 'autoblogger'); ?>') + '</p></div>'
                                                                        );
                                                                    }
                                                                },
                                                                error: function() {
                                                                    $('#step-post .step-status').html('<?php esc_html_e('✗ Failed', 'autoblogger'); ?>');
                                                                    $('#generation-progress-container .card').append(
                                                                        '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php esc_html_e('Failed to generate post. Please try again.', 'autoblogger'); ?></p></div>'
                                                                    );
                                                                }
                                                            });
                                                        } else {
                                                            $('#step-script-definition .step-status').html('<?php esc_html_e('✗ Failed', 'autoblogger'); ?>');
                                                            $('#generation-progress-container .card').append(
                                                                '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php esc_html_e('Failed to generate script definition: ', 'autoblogger'); ?>' + 
                                                                (defResponse.data.message || '<?php esc_html_e('Unknown error', 'autoblogger'); ?>') + '</p></div>'
                                                            );
                                                        }
                                                    },
                                                    error: function() {
                                                        $('#step-script-definition .step-status').html('<?php esc_html_e('✗ Failed', 'autoblogger'); ?>');
                                                        $('#generation-progress-container .card').append(
                                                            '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php esc_html_e('Failed to generate script definition. Please try again.', 'autoblogger'); ?></p></div>'
                                                        );
                                                    }
                                                });
                                            } else {
                                                $('#step-script-text .step-status').html('<?php esc_html_e('✗ Failed', 'autoblogger'); ?>');
                                                $('#generation-progress-container .card').append(
                                                    '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php esc_html_e('Failed to generate script text: ', 'autoblogger'); ?>' + 
                                                    (genResponse.data.message || '<?php esc_html_e('Unknown error', 'autoblogger'); ?>') + '</p></div>'
                                                );
                                            }
                                        },
                                        error: function() {
                                            $('#step-script-text .step-status').html('<?php esc_html_e('✗ Failed', 'autoblogger'); ?>');
                                            $('#generation-progress-container .card').append(
                                                '<div class="notice notice-error inline" style="margin-top: 30px;"><p><?php esc_html_e('Failed to generate script text. Please try again.', 'autoblogger'); ?></p></div>'
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
        console.log('autobloggerData:', typeof autobloggerData !== 'undefined' ? 'available' : 'NOT available');
        
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
            alert('<?php esc_html_e('Cannot reload suggestions. Please try again from the beginning.', 'autoblogger'); ?>');
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
