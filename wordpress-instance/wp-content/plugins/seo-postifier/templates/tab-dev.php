<?php
/**
 * Dev Tab Template
 * For testing purposes - displays all post titles and meta
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Query all posts
$args = array(
    'post_type' => 'post',
    'post_status' => 'any', // Include all statuses (publish, draft, private, etc.)
    'posts_per_page' => -1, // Get all posts
    'orderby' => 'date',
    'order' => 'DESC',
);

$posts_query = new WP_Query($args);
$posts = $posts_query->posts;

// Get all meta keys used across posts
$all_meta_keys = array();
foreach ($posts as $post) {
    $meta = get_post_meta($post->ID);
    $all_meta_keys = array_merge($all_meta_keys, array_keys($meta));
}
$all_meta_keys = array_unique($all_meta_keys);
sort($all_meta_keys);
?>

<div class="seo-postifier-dev-section">
    <h2><?php _e('Development & Testing', 'seo-postifier'); ?></h2>
    <p class="description">
        <?php _e('This section is for development and testing purposes. It displays all post titles and meta information from your WordPress site.', 'seo-postifier'); ?>
    </p>

    <div class="dev-stats" style="background: #f0f0f1; padding: 15px; margin: 20px 0; border-left: 4px solid #2271b1;">
        <h3 style="margin-top: 0;"><?php _e('Statistics', 'seo-postifier'); ?></h3>
        <ul style="margin: 0;">
            <li><strong><?php _e('Total Posts:', 'seo-postifier'); ?></strong> <?php echo count($posts); ?></li>
            <li><strong><?php _e('Unique Meta Keys:', 'seo-postifier'); ?></strong> <?php echo count($all_meta_keys); ?></li>
        </ul>
    </div>

    <div class="dev-controls" style="margin: 20px 0;">
        <button type="button" class="button" onclick="jQuery('.post-details').toggle();">
            <?php _e('Toggle All Details', 'seo-postifier'); ?>
        </button>
        <button type="button" class="button" onclick="jQuery('.post-meta').toggle();">
            <?php _e('Toggle Meta Data', 'seo-postifier'); ?>
        </button>
        <button type="button" class="button button-primary" onclick="copyAllData()">
            <?php _e('Copy All Data as JSON', 'seo-postifier'); ?>
        </button>
    </div>

    <div class="dev-posts-list">
        <?php if (empty($posts)): ?>
            <div class="notice notice-info">
                <p><?php _e('No posts found in your WordPress site.', 'seo-postifier'); ?></p>
            </div>
        <?php else: ?>
            <?php foreach ($posts as $post): 
                $post_meta = get_post_meta($post->ID);
                $post_meta_formatted = array();
                
                // Format meta data (handle serialized data)
                foreach ($post_meta as $key => $values) {
                    $post_meta_formatted[$key] = array();
                    foreach ($values as $value) {
                        // Try to unserialize if it's serialized
                        $unserialized = @unserialize($value);
                        if ($unserialized !== false) {
                            $post_meta_formatted[$key][] = $unserialized;
                        } else {
                            $post_meta_formatted[$key][] = $value;
                        }
                    }
                }
            ?>
                <div class="post-item" style="background: #fff; border: 1px solid #ccd0d4; margin-bottom: 20px; padding: 15px; box-shadow: 0 1px 1px rgba(0,0,0,.04);">
                    <div class="post-header" style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                        <h3 style="margin: 0 0 5px 0;">
                            <a href="<?php echo get_edit_post_link($post->ID); ?>" target="_blank">
                                <?php echo esc_html($post->post_title ?: __('(No Title)', 'seo-postifier')); ?>
                            </a>
                        </h3>
                        <div class="post-meta-info" style="font-size: 12px; color: #646970;">
                            <span><strong><?php _e('ID:', 'seo-postifier'); ?></strong> <?php echo $post->ID; ?></span> |
                            <span><strong><?php _e('Status:', 'seo-postifier'); ?></strong> <?php echo esc_html($post->post_status); ?></span> |
                            <span><strong><?php _e('Type:', 'seo-postifier'); ?></strong> <?php echo esc_html($post->post_type); ?></span> |
                            <span><strong><?php _e('Date:', 'seo-postifier'); ?></strong> <?php echo esc_html($post->post_date); ?></span> |
                            <span><strong><?php _e('Author:', 'seo-postifier'); ?></strong> <?php echo esc_html(get_the_author_meta('display_name', $post->post_author)); ?></span>
                        </div>
                    </div>

                    <div class="post-details" style="display: none;">
                        <div class="post-content-preview" style="margin-bottom: 15px;">
                            <strong><?php _e('Content Preview:', 'seo-postifier'); ?></strong>
                            <div style="background: #f9f9f9; padding: 10px; margin-top: 5px; border-radius: 3px; max-height: 150px; overflow-y: auto;">
                                <?php echo esc_html(wp_trim_words($post->post_content, 50)); ?>
                            </div>
                        </div>

                        <div class="post-excerpt" style="margin-bottom: 15px;">
                            <strong><?php _e('Excerpt:', 'seo-postifier'); ?></strong>
                            <div style="background: #f9f9f9; padding: 10px; margin-top: 5px; border-radius: 3px;">
                                <?php echo esc_html($post->post_excerpt ?: __('(No excerpt)', 'seo-postifier')); ?>
                            </div>
                        </div>

                        <div class="post-urls" style="margin-bottom: 15px;">
                            <strong><?php _e('URLs:', 'seo-postifier'); ?></strong>
                            <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                                <li><strong><?php _e('Edit:', 'seo-postifier'); ?></strong> <a href="<?php echo get_edit_post_link($post->ID); ?>" target="_blank"><?php echo get_edit_post_link($post->ID); ?></a></li>
                                <li><strong><?php _e('View:', 'seo-postifier'); ?></strong> <a href="<?php echo get_permalink($post->ID); ?>" target="_blank"><?php echo get_permalink($post->ID); ?></a></li>
                            </ul>
                        </div>
                    </div>

                    <div class="post-meta" style="display: none;">
                        <strong><?php _e('Meta Data:', 'seo-postifier'); ?></strong>
                        <?php if (empty($post_meta_formatted)): ?>
                            <p style="color: #646970; font-style: italic;"><?php _e('No meta data found for this post.', 'seo-postifier'); ?></p>
                        <?php else: ?>
                            <div style="background: #f9f9f9; padding: 10px; margin-top: 5px; border-radius: 3px; max-height: 300px; overflow-y: auto;">
                                <pre style="margin: 0; font-size: 11px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word;"><?php echo esc_html(print_r($post_meta_formatted, true)); ?></pre>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="post-actions" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                        <button type="button" class="button button-small" onclick="jQuery(this).closest('.post-item').find('.post-details').toggle();">
                            <?php _e('Toggle Details', 'seo-postifier'); ?>
                        </button>
                        <button type="button" class="button button-small" onclick="jQuery(this).closest('.post-item').find('.post-meta').toggle();">
                            <?php _e('Toggle Meta', 'seo-postifier'); ?>
                        </button>
                        <button type="button" class="button button-small" onclick="copyPostData(<?php echo $post->ID; ?>)">
                            <?php _e('Copy as JSON', 'seo-postifier'); ?>
                        </button>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <div class="dev-meta-keys" style="margin-top: 30px; background: #fff; border: 1px solid #ccd0d4; padding: 15px; box-shadow: 0 1px 1px rgba(0,0,0,.04);">
        <h3><?php _e('All Meta Keys Found Across Posts', 'seo-postifier'); ?></h3>
        <div style="background: #f9f9f9; padding: 10px; margin-top: 10px; border-radius: 3px; max-height: 200px; overflow-y: auto;">
            <code style="display: block; line-height: 1.8;">
                <?php echo esc_html(implode(', ', $all_meta_keys)); ?>
            </code>
        </div>
    </div>
</div>

<script type="text/javascript">
    // Prepare all posts data for JSON export
    var allPostsData = <?php 
        $export_data = array();
        foreach ($posts as $post) {
            $post_meta = get_post_meta($post->ID);
            $post_meta_formatted = array();
            
            foreach ($post_meta as $key => $values) {
                $post_meta_formatted[$key] = array();
                foreach ($values as $value) {
                    $unserialized = @unserialize($value);
                    if ($unserialized !== false) {
                        $post_meta_formatted[$key][] = $unserialized;
                    } else {
                        $post_meta_formatted[$key][] = $value;
                    }
                }
            }
            
            $export_data[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'status' => $post->post_status,
                'type' => $post->post_type,
                'date' => $post->post_date,
                'author' => get_the_author_meta('display_name', $post->post_author),
                'excerpt' => $post->post_excerpt,
                'content_preview' => wp_trim_words($post->post_content, 50),
                'edit_url' => get_edit_post_link($post->ID),
                'permalink' => get_permalink($post->ID),
                'meta' => $post_meta_formatted
            );
        }
        echo json_encode($export_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    ?>;

    function copyPostData(postId) {
        var postData = allPostsData.find(function(p) { return p.id == postId; });
        if (postData) {
            var jsonString = JSON.stringify(postData, null, 2);
            copyToClipboard(jsonString);
            alert('<?php _e('Post data copied to clipboard!', 'seo-postifier'); ?>');
        }
    }

    function copyAllData() {
        var jsonString = JSON.stringify(allPostsData, null, 2);
        copyToClipboard(jsonString);
        alert('<?php _e('All posts data copied to clipboard!', 'seo-postifier'); ?>');
    }

    function copyToClipboard(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
</script>

<style>
    .seo-postifier-dev-section {
        max-width: 100%;
    }
    
    .post-item {
        transition: box-shadow 0.2s;
    }
    
    .post-item:hover {
        box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }
    
    .post-item h3 a {
        text-decoration: none;
        color: #2271b1;
    }
    
    .post-item h3 a:hover {
        text-decoration: underline;
    }
    
    pre {
        font-family: 'Courier New', Courier, monospace;
    }
</style>


