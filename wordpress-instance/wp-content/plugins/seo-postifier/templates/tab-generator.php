<?php
/**
 * Admin Page Template
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap seo-postifier-admin">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <div class="seo-postifier-container">
        <!-- Backend Connection Card -->
        <div class="card">
            <h2>Backend Connection</h2>
            <p>Backend URL: <strong><?php echo esc_html(SEO_POSTIFIER_BACKEND_URL); ?></strong></p>

            <button type="button" id="test-connection" class="button button-primary">
                Test Connection
            </button>

            <div id="connection-status" style="margin-top: 15px;"></div>
        </div>

        <!-- Post Interview Form -->
        <div class="card" style="margin-top: 20px;">
            <h2>Create Post Interview</h2>
            <p>Step 1: Define the SEO specifications for your post</p>

            <form id="post-interview-form">
                <!-- SEO Configuration -->
                <h3>SEO Configuration</h3>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="main-keyword">Main Keyword *</label>
                        </th>
                        <td>
                            <input type="text" id="main-keyword" name="mainKeyword" class="regular-text" required />
                            <p class="description">Primary keyword to optimize for</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="secondary-keywords">Secondary Keywords</label>
                        </th>
                        <td>
                            <input type="text" id="secondary-keywords" name="secondaryKeywords" class="large-text" />
                            <p class="description">Comma-separated list of secondary keywords</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="keyword-density">Keyword Density Target</label>
                        </th>
                        <td>
                            <input type="number" id="keyword-density" name="keywordDensityTarget"
                                   value="0.015" min="0" max="1" step="0.001" class="small-text" />
                            <p class="description">Target keyword density (0-1, default: 0.015)</p>
                        </td>
                    </tr>
                </table>

                <!-- Content Configuration -->
                <h3>Content Configuration</h3>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="user-description">Topic Description *</label>
                        </th>
                        <td>
                            <textarea id="user-description" name="userDescription" rows="4"
                                      class="large-text" required></textarea>
                            <p class="description">Describe what the post should be about</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="language">Language *</label>
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
                            <label for="search-intent">Search Intent *</label>
                        </th>
                        <td>
                            <select id="search-intent" name="searchIntent" required>
                                <option value="informational" selected>Informational</option>
                                <option value="transactional">Transactional</option>
                                <option value="commercial">Commercial</option>
                                <option value="navigational">Navigational</option>
                            </select>
                            <p class="description">User's search intent type</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="target-audience">Target Audience *</label>
                        </th>
                        <td>
                            <input type="text" id="target-audience" name="targetAudience"
                                   class="regular-text" required />
                            <p class="description">Describe your target audience</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="tone-of-voice">Tone of Voice *</label>
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
                <h3>Structure Configuration</h3>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="min-word-count">Minimum Word Count</label>
                        </th>
                        <td>
                            <input type="number" id="min-word-count" name="minWordCount"
                                   value="1500" min="100" class="small-text" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="max-word-count">Maximum Word Count</label>
                        </th>
                        <td>
                            <input type="number" id="max-word-count" name="maxWordCount"
                                   value="3000" min="100" class="small-text" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="needs-faq">Include FAQ Section</label>
                        </th>
                        <td>
                            <input type="checkbox" id="needs-faq" name="needsFaqSection" value="1" checked />
                            <label for="needs-faq">Add FAQ section at the end</label>
                        </td>
                    </tr>
                </table>

                <!-- Brand Configuration -->
                <h3>Brand Configuration</h3>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="mentions-brand">Mention Brand</label>
                        </th>
                        <td>
                            <input type="checkbox" id="mentions-brand" name="mentionsBrand" value="1" />
                            <label for="mentions-brand">Include brand mentions</label>
                        </td>
                    </tr>
                    <tr class="brand-fields" style="display: none;">
                        <th scope="row">
                            <label for="brand-name">Brand Name</label>
                        </th>
                        <td>
                            <input type="text" id="brand-name" name="brandName" class="regular-text" />
                        </td>
                    </tr>
                    <tr class="brand-fields" style="display: none;">
                        <th scope="row">
                            <label for="brand-description">Brand Description</label>
                        </th>
                        <td>
                            <textarea id="brand-description" name="brandDescription" rows="2"
                                      class="large-text"></textarea>
                        </td>
                    </tr>
                </table>

                <!-- Links Configuration -->
                <h3>Links Configuration</h3>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="include-internal-links">Internal Links</label>
                        </th>
                        <td>
                            <input type="checkbox" id="include-internal-links"
                                   name="includeInternalLinks" value="1" checked />
                            <label for="include-internal-links">Include internal links</label>
                        </td>
                    </tr>
                    <tr class="internal-links-fields">
                        <th scope="row">
                            <label for="max-internal-links">Max Internal Links</label>
                        </th>
                        <td>
                            <input type="number" id="max-internal-links" name="maxInternalLinks"
                                   value="3" min="0" class="small-text" />
                        </td>
                    </tr>
                    <tr class="internal-links-fields">
                        <th scope="row">
                            <label for="internal-links-to-use">Internal Links URLs</label>
                        </th>
                        <td>
                            <textarea id="internal-links-to-use" name="internalLinksToUse" rows="3"
                                      class="large-text" placeholder="One URL per line"></textarea>
                            <p class="description">Specific internal links to include (one per line)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="include-external-links">External Links</label>
                        </th>
                        <td>
                            <input type="checkbox" id="include-external-links"
                                   name="includeExternalLinks" value="1" />
                            <label for="include-external-links">Include external links</label>
                        </td>
                    </tr>
                    <tr class="external-links-fields" style="display: none;">
                        <th scope="row">
                            <label for="max-external-links">Max External Links</label>
                        </th>
                        <td>
                            <input type="number" id="max-external-links" name="maxExternalLinks"
                                   value="2" min="0" class="small-text" />
                        </td>
                    </tr>
                    <tr class="external-links-fields" style="display: none;">
                        <th scope="row">
                            <label for="external-links-to-use">External Links URLs</label>
                        </th>
                        <td>
                            <textarea id="external-links-to-use" name="externalLinksToUse" rows="3"
                                      class="large-text" placeholder="One URL per line"></textarea>
                            <p class="description">Specific external links to include (one per line)</p>
                        </td>
                    </tr>
                </table>

                <!-- Additional Notes -->
                <h3>Additional Instructions</h3>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="notes-for-writer">Notes for Writer</label>
                        </th>
                        <td>
                            <textarea id="notes-for-writer" name="notesForWriter" rows="3"
                                      class="large-text"></textarea>
                            <p class="description">Any additional instructions or requirements</p>
                        </td>
                    </tr>
                </table>

                <p class="submit">
                    <button type="submit" class="button button-primary button-large">
                        Create Interview & Generate Script
                    </button>
                </p>
            </form>

            <div id="interview-status" style="margin-top: 15px;"></div>
        </div>

        <!-- Script Review Section (Hidden initially) -->
        <div id="script-review-section" class="card" style="margin-top: 20px; display: none;">
            <h2>Review Generated Script</h2>
            <p>Step 2: Review and edit the generated SEO script</p>

            <div id="script-content-wrapper">
                <textarea id="script-content" rows="20" class="large-text"></textarea>
            </div>

            <p class="submit" style="margin-top: 20px;">
                <button type="button" id="approve-script" class="button button-primary">
                    Approve & Generate Formatted Script
                </button>
                <button type="button" id="regenerate-script" class="button button-secondary">
                    Regenerate Script
                </button>
            </p>

            <div id="script-review-status" style="margin-top: 15px;"></div>
        </div>

        <!-- Generated Post Preview (Hidden initially) -->
        <div id="post-preview-section" class="card" style="margin-top: 20px; display: none;">
            <h2>Generated Post Preview</h2>
            <p>Step 3: Review the final post content</p>

            <div id="post-content-preview" style="background: #fff; padding: 20px; border: 1px solid #ddd; margin-top: 20px;">
                <!-- Post content will be inserted here -->
            </div>

            <p class="submit" style="margin-top: 20px;">
                <button type="button" id="create-wp-draft" class="button button-primary button-large">
                    Create WordPress Draft
                </button>
                <button type="button" id="regenerate-post" class="button button-secondary">
                    Regenerate Post
                </button>
            </p>

            <div id="wp-draft-status" style="margin-top: 15px;"></div>
        </div>
    </div>
</div>