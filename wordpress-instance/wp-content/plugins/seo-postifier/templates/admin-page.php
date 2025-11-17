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
        <div class="card">
            <h2>Backend Connection</h2>
            <p>Backend URL: <strong><?php echo esc_html(SEO_POSTIFIER_BACKEND_URL); ?></strong></p>

            <button type="button" id="test-connection" class="button button-primary">
                Test Connection
            </button>

            <div id="connection-status" style="margin-top: 15px;"></div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <h2>Generate SEO-Optimized Post</h2>
            <p>Use the form below to generate an SEO-optimized WordPress post.</p>

            <form id="generate-post-form">
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="post-topic">Topic</label>
                        </th>
                        <td>
                            <input type="text" id="post-topic" name="post_topic" class="regular-text"
                                   placeholder="Enter the topic for your post" required />
                            <p class="description">The main topic or subject of the post</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="target-keywords">Target Keywords</label>
                        </th>
                        <td>
                            <input type="text" id="target-keywords" name="target_keywords" class="regular-text"
                                   placeholder="keyword1, keyword2, keyword3" />
                            <p class="description">Comma-separated list of keywords to optimize for</p>
                        </td>
                    </tr>
                </table>

                <p class="submit">
                    <button type="submit" class="button button-primary button-large">
                        Generate Post
                    </button>
                </p>
            </form>

            <div id="generation-status" style="margin-top: 15px;"></div>
        </div>
    </div>
</div>
