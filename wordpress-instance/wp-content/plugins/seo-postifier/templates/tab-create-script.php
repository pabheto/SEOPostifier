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
                <?php _e('← Back to My Scripts', 'seo-postifier'); ?>
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
                        <label for="max-internal-links"><?php _e('Max Internal Links', 'seo-postifier'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="max-internal-links" name="maxInternalLinks"
                               value="3" min="0" class="small-text" />
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
                        <label for="max-external-links"><?php _e('Max External Links', 'seo-postifier'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="max-external-links" name="maxExternalLinks"
                               value="2" min="0" class="small-text" />
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

    // Form submission
    $('#create-script-form').on('submit', function(e) {
        e.preventDefault();

        const $status = $('#create-script-status');
        const $button = $(this).find('button[type="submit"]');
        const originalText = $button.text();

        $button.prop('disabled', true).text('<?php _e('Creating...', 'seo-postifier'); ?>');
        $status.html('');

        // Collect form data
        const formData = {
            mainKeyword: $('#main-keyword').val(),
            secondaryKeywords: $('#secondary-keywords').val(),
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
            maxInternalLinks: parseInt($('#max-internal-links').val()),
            internalLinksToUse: $('#internal-links-to-use').val(),
            includeExternalLinks: $('#include-external-links').is(':checked'),
            maxExternalLinks: parseInt($('#max-external-links').val()),
            externalLinksToUse: $('#external-links-to-use').val(),
            notesForWriter: $('#notes-for-writer').val()
        };

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
    });
});
</script>

