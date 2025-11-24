<?php
/**
 * AJAX Handlers Class
 * Handles all AJAX requests from the admin interface
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class SEO_Postifier_AJAX_Handlers {

    /**
     * Register AJAX handlers
     */
    public static function register() {
        // Settings
        add_action('wp_ajax_seo_postifier_save_settings', array(__CLASS__, 'save_settings'));
        add_action('wp_ajax_seo_postifier_test_license', array(__CLASS__, 'test_license'));
        
        // Interview management
        add_action('wp_ajax_seo_postifier_get_interviews_list', array(__CLASS__, 'get_interviews_list'));
        add_action('wp_ajax_seo_postifier_get_interview', array(__CLASS__, 'get_interview'));
        add_action('wp_ajax_seo_postifier_create_interview', array(__CLASS__, 'create_interview'));
        add_action('wp_ajax_seo_postifier_update_interview', array(__CLASS__, 'update_interview'));
        add_action('wp_ajax_seo_postifier_generate_script_text', array(__CLASS__, 'generate_script_text'));
        add_action('wp_ajax_seo_postifier_generate_script_definition', array(__CLASS__, 'generate_script_definition'));
        add_action('wp_ajax_seo_postifier_generate_post', array(__CLASS__, 'generate_post'));
        add_action('wp_ajax_seo_postifier_get_post', array(__CLASS__, 'get_post'));
        add_action('wp_ajax_seo_postifier_create_wp_draft', array(__CLASS__, 'create_wp_draft'));
    }

    /**
     * Save settings (AJAX handler)
     */
    public static function save_settings() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        $license_key = isset($_POST['license_key']) ? sanitize_text_field($_POST['license_key']) : '';
        $backend_url = isset($_POST['backend_url']) ? esc_url_raw($_POST['backend_url']) : '';

        $settings = array();
        if (!empty($license_key)) {
            $settings['license_key'] = $license_key;
        }
        if (!empty($backend_url)) {
            $settings['backend_url'] = $backend_url;
        }

        SEO_Postifier_Settings::update_all($settings);

        wp_send_json_success(array(
            'message' => 'Settings saved successfully',
            'settings' => SEO_Postifier_Settings::get_all()
        ));
    }

    /**
     * Test license key (AJAX handler)
     */
    public static function test_license() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        $license_key = isset($_POST['license_key']) ? sanitize_text_field($_POST['license_key']) : '';

        if (empty($license_key)) {
            wp_send_json_error(array('message' => 'Please enter a license key first'));
            return;
        }

        // Validate license using the /users/auth/license endpoint
        $response = SEO_Postifier_API_Client::validate_license($license_key);
        $result = SEO_Postifier_API_Client::parse_response($response);

        if ($result['success']) {
            $user_data = $result['data'];
            $message = 'License is valid!';
            
            if (isset($user_data['user']['email'])) {
                $message .= ' User: ' . $user_data['user']['email'];
            }
            
            if (isset($user_data['license']['role'])) {
                $message .= ' | Role: ' . $user_data['license']['role'];
            }

            wp_send_json_success(array(
                'message' => $message,
                'data' => $user_data
            ));
        } else {
            $error_message = $result['message'];
            
            // Provide more helpful error messages
            if ($result['code'] === 401) {
                $error_message = 'Invalid or inactive license key';
            } elseif ($result['code'] === 404) {
                $error_message = 'License key not found';
            }

            wp_send_json_error(array(
                'message' => 'License validation failed: ' . $error_message
            ));
        }
    }

    /**
     * Test backend connection (AJAX handler)
     */
    public static function test_connection() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        if (!SEO_Postifier_Settings::has_license_key()) {
            wp_send_json_error(array('message' => 'Please configure your license key in Settings'));
            return;
        }

        $response = SEO_Postifier_API_Client::test_connection();
        $result = SEO_Postifier_API_Client::parse_response($response);

        if ($result['success']) {
            wp_send_json_success(array(
                'message' => 'Connected successfully!',
                'data' => $result['data']
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Connection failed: ' . $result['message']
            ));
        }
    }

    /**
     * Create Interview (AJAX handler)
     */
    public static function create_interview() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        if (!SEO_Postifier_Settings::has_license_key()) {
            wp_send_json_error(array('message' => 'Please configure your license key in Settings'));
            return;
        }

        $interview_data = isset($_POST['interview_data']) ? $_POST['interview_data'] : array();

        set_time_limit(60);

        $response = SEO_Postifier_API_Client::create_interview($interview_data);
        $result = SEO_Postifier_API_Client::parse_response($response);

        if ($result['success']) {
            wp_send_json_success(array(
                'message' => 'Interview created successfully',
                'interview' => $result['data']
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to create interview: ' . $result['message']
            ));
        }
    }

     /**
     * Update Interview (AJAX handler)
     */
    public static function update_interview() {
        try {
            // Verify nonce
            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'seo_postifier_nonce')) {
                wp_send_json_error(array('message' => 'Security check failed. Please refresh the page and try again.'));
                return;
            }

            if (!current_user_can('manage_options')) {
                wp_send_json_error(array('message' => 'Unauthorized'));
                return;
            }

            if (!SEO_Postifier_Settings::has_license_key()) {
                wp_send_json_error(array('message' => 'Please configure your license key in Settings'));
                return;
            }

            $interview_data = isset($_POST['interview_data']) ? $_POST['interview_data'] : array();

            if (empty($interview_data['interviewId'])) {
                wp_send_json_error(array('message' => 'Interview ID is required'));
                return;
            }

            set_time_limit(60);

            $response = SEO_Postifier_API_Client::update_interview($interview_data);
            $result = SEO_Postifier_API_Client::parse_response($response);

            if ($result['success']) {
                wp_send_json_success(array(
                    'message' => 'Interview updated successfully',
                    'interview' => $result['data']['interview']
                ));
            } else {
                $error_message = 'Failed to update interview';
                if (isset($result['message'])) {
                    $error_message .= ': ' . $result['message'];
                }
                if (isset($result['code'])) {
                    $error_message .= ' (HTTP ' . $result['code'] . ')';
                }
                wp_send_json_error(array('message' => $error_message));
            }
        } catch (Exception $e) {
            error_log('SEO Postifier Error in update_interview: ' . $e->getMessage());
            wp_send_json_error(array(
                'message' => 'An error occurred: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Get Interviews List (AJAX handler)
     */
    public static function get_interviews_list() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        if (!SEO_Postifier_Settings::has_license_key()) {
            wp_send_json_error(array('message' => 'Please configure your license key in Settings'));
            return;
        }

        $response = SEO_Postifier_API_Client::get_interviews_list();
        $result = SEO_Postifier_API_Client::parse_response($response);

        if ($result['success']) {
            wp_send_json_success(array(
                'message' => 'Interviews list retrieved successfully',
                'interviews' => $result['data']['interviews']
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to load interviews: ' . $result['message']
            ));
        }
    }

    /**
     * Get Interview by ID (AJAX handler)
     */
    public static function get_interview() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        if (!SEO_Postifier_Settings::has_license_key()) {
            wp_send_json_error(array('message' => 'Please configure your license key in Settings'));
            return;
        }

        $interview_id = isset($_POST['interview_id']) ? sanitize_text_field($_POST['interview_id']) : '';

        if (empty($interview_id)) {
            wp_send_json_error(array('message' => 'Interview ID is required'));
            return;
        }

        $response = SEO_Postifier_API_Client::get_interview($interview_id);
        $result = SEO_Postifier_API_Client::parse_response($response);

        if ($result['success']) {
            wp_send_json_success(array(
                'message' => 'Interview retrieved successfully',
                'interview' => $result['data']['interview']
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to load interview: ' . $result['message']
            ));
        }
    }

    /**
     * Generate Script Text (AJAX handler)
     */
    public static function generate_script_text() {
        try {
            // Verify nonce
            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'seo_postifier_nonce')) {
                wp_send_json_error(array('message' => 'Security check failed. Please refresh the page and try again.'));
                return;
            }

            if (!current_user_can('manage_options')) {
                wp_send_json_error(array('message' => 'Unauthorized'));
                return;
            }

            if (!SEO_Postifier_Settings::has_license_key()) {
                wp_send_json_error(array('message' => 'Please configure your license key in Settings'));
                return;
            }

            $interview_id = isset($_POST['interview_id']) ? sanitize_text_field($_POST['interview_id']) : '';

            if (empty($interview_id)) {
                wp_send_json_error(array('message' => 'Interview ID is required'));
                return;
            }

            set_time_limit(180);

            $response = SEO_Postifier_API_Client::generate_script_text($interview_id);
            $result = SEO_Postifier_API_Client::parse_response($response);

            if ($result['success']) {
                wp_send_json_success(array(
                    'message' => 'Script generated successfully',
                    'interview' => $result['data']['interview']
                ));
            } else {
                $error_message = 'Failed to generate script';
                if (isset($result['message'])) {
                    $error_message .= ': ' . $result['message'];
                }
                if (isset($result['code'])) {
                    $error_message .= ' (HTTP ' . $result['code'] . ')';
                }
                wp_send_json_error(array('message' => $error_message));
            }
        } catch (Exception $e) {
            error_log('SEO Postifier Error in generate_script_text: ' . $e->getMessage());
            wp_send_json_error(array(
                'message' => 'An error occurred: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Generate Script Definition (AJAX handler)
     */
    public static function generate_script_definition() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        if (!SEO_Postifier_Settings::has_license_key()) {
            wp_send_json_error(array('message' => 'Please configure your license key in Settings'));
            return;
        }

        $interview_id = isset($_POST['interview_id']) ? sanitize_text_field($_POST['interview_id']) : '';

        if (empty($interview_id)) {
            wp_send_json_error(array('message' => 'Interview ID is required'));
            return;
        }

        set_time_limit(180);

        $response = SEO_Postifier_API_Client::generate_script_definition($interview_id);
        $result = SEO_Postifier_API_Client::parse_response($response);

        if ($result['success']) {
            wp_send_json_success(array(
                'message' => 'Script definition generated successfully',
                'interview' => $result['data']['interview']
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to generate script definition: ' . $result['message']
            ));
        }
    }

    /**
     * Generate Post (AJAX handler)
     */
    public static function generate_post() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        if (!SEO_Postifier_Settings::has_license_key()) {
            wp_send_json_error(array('message' => 'Please configure your license key in Settings'));
            return;
        }

        $interview_id = isset($_POST['interview_id']) ? sanitize_text_field($_POST['interview_id']) : '';

        if (empty($interview_id)) {
            wp_send_json_error(array('message' => 'Interview ID is required'));
            return;
        }

        set_time_limit(300);

        $response = SEO_Postifier_API_Client::generate_post($interview_id);
        $result = SEO_Postifier_API_Client::parse_response($response);

        if ($result['success']) {
            wp_send_json_success(array(
                'message' => 'Post generated successfully',
                'post' => $result['data']['post']
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to generate post: ' . $result['message']
            ));
        }
    }

    /**
     * Get Post by ID (AJAX handler)
     */
    public static function get_post() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        if (!SEO_Postifier_Settings::has_license_key()) {
            wp_send_json_error(array('message' => 'Please configure your license key in Settings'));
            return;
        }

        $post_id = isset($_POST['post_id']) ? sanitize_text_field($_POST['post_id']) : '';

        if (empty($post_id)) {
            wp_send_json_error(array('message' => 'Post ID is required'));
            return;
        }

        $response = SEO_Postifier_API_Client::get_post($post_id);
        $result = SEO_Postifier_API_Client::parse_response($response);

        if ($result['success']) {
            wp_send_json_success(array(
                'message' => 'Post retrieved successfully',
                'post' => $result['data']['post']
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to load post: ' . $result['message']
            ));
        }
    }

    /**
     * Create WordPress Draft from Post (AJAX handler)
     */
    public static function create_wp_draft() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        if (!SEO_Postifier_Settings::has_license_key()) {
            wp_send_json_error(array('message' => 'Please configure your license key in Settings'));
            return;
        }

        $post_id = isset($_POST['post_id']) ? sanitize_text_field($_POST['post_id']) : '';

        if (empty($post_id)) {
            wp_send_json_error(array('message' => 'Post ID is required'));
            return;
        }

        // Get post from backend
        $response = SEO_Postifier_API_Client::get_post($post_id);
        $result = SEO_Postifier_API_Client::parse_response($response);

        if (!$result['success']) {
            wp_send_json_error(array(
                'message' => 'Failed to load post: ' . $result['message']
            ));
            return;
        }

        $post_data = $result['data']['post'];

        if (empty($post_data['blocks']) || !is_array($post_data['blocks'])) {
            wp_send_json_error(array('message' => 'Post has no content blocks'));
            return;
        }

        // Convert blocks to WordPress HTML content
        $content = self::convert_blocks_to_wp_content($post_data['blocks']);

        if (empty($content)) {
            wp_send_json_error(array('message' => 'Post content is empty'));
            return;
        }

        // Create WordPress post
        $wp_post_data = array(
            'post_title' => !empty($post_data['title']) ? sanitize_text_field($post_data['title']) : 'Draft Post',
            'post_content' => $content,
            'post_status' => 'draft',
            'post_type' => 'post',
            'post_author' => get_current_user_id(),
        );

        // Add excerpt if available (extract from first paragraph if no explicit excerpt)
        if (!empty($post_data['excerpt'])) {
            $wp_post_data['post_excerpt'] = sanitize_textarea_field($post_data['excerpt']);
        } else {
            // Try to extract excerpt from first paragraph block
            foreach ($post_data['blocks'] as $block) {
                if (isset($block['type']) && $block['type'] === 'paragraph' && !empty($block['content'])) {
                    $excerpt = wp_trim_words(strip_tags($block['content']), 30, '...');
                    if (!empty($excerpt)) {
                        $wp_post_data['post_excerpt'] = sanitize_textarea_field($excerpt);
                        break;
                    }
                }
            }
        }

        // Insert post
        $wp_post_id = wp_insert_post($wp_post_data, true);

        if (is_wp_error($wp_post_id)) {
            wp_send_json_error(array(
                'message' => 'Failed to create WordPress draft: ' . $wp_post_id->get_error_message()
            ));
            return;
        }

        // Add meta title (using H1/title as meta title)
        if (!empty($post_data['title'])) {
            $meta_title = sanitize_text_field($post_data['title']);
            update_post_meta($wp_post_id, '_seo_meta_title', $meta_title);
            
            // Also try to set it for common SEO plugins
            // Yoast SEO
            update_post_meta($wp_post_id, '_yoast_wpseo_title', $meta_title);
            // Rank Math
            update_post_meta($wp_post_id, 'rank_math_title', $meta_title);
            // All in One SEO
            update_post_meta($wp_post_id, '_aioseo_title', $meta_title);
        }

        // Get edit URL
        $edit_url = admin_url('post.php?action=edit&post=' . $wp_post_id);

        wp_send_json_success(array(
            'message' => 'WordPress draft created successfully',
            'wordpress_post_id' => $wp_post_id,
            'edit_url' => $edit_url
        ));
    }

    /**
     * Generate table of contents from heading blocks
     */
    private static function generate_index($blocks) {
        $headings = array();
        $anchor_counts = array(); // Track anchor usage for uniqueness
        
        foreach ($blocks as $block) {
            if (isset($block['type']) && $block['type'] === 'heading') {
                if (isset($block['level']) && isset($block['title'])) {
                    $level = intval(str_replace('h', '', $block['level']));
                    $level = max(2, min(6, $level)); // Only include H2-H6 (H1 is the post title)
                    $title = wp_kses_post($block['title']);
                    
                    // Generate anchor ID from title
                    $base_anchor = sanitize_title($title);
                    
                    // Ensure unique anchor IDs
                    $anchor = $base_anchor;
                    $counter = 1;
                    while (isset($anchor_counts[$anchor])) {
                        $anchor = $base_anchor . '-' . $counter;
                        $counter++;
                    }
                    $anchor_counts[$anchor] = true;
                    
                    $headings[] = array(
                        'level' => $level,
                        'title' => $title,
                        'anchor' => $anchor
                    );
                }
            }
        }
        
        // Don't generate index if there are less than 2 headings
        if (count($headings) < 2) {
            return '';
        }
        
        $index_content = '<!-- wp:group {"className":"seo-postifier-index","layout":{"type":"constrained"}} -->' . "\n";
        $index_content .= '<div class="wp-block-group seo-postifier-index">' . "\n";
        
        // Index title
        $index_content .= '<!-- wp:heading {"level":2} -->' . "\n";
        $index_content .= '<h2 class="wp-block-heading index-title">' . esc_html__('Table of Contents', 'seo-postifier') . '</h2>' . "\n";
        $index_content .= '<!-- /wp:heading -->' . "\n\n";
        
        // Index list
        $index_content .= '<!-- wp:list -->' . "\n";
        $index_content .= '<ul class="wp-block-list index-list">' . "\n";
        
        foreach ($headings as $heading) {
            $level_class = 'index-level-' . $heading['level'];
            $index_content .= '<li class="' . esc_attr($level_class) . '">';
            $index_content .= '<a href="#' . esc_attr($heading['anchor']) . '">' . $heading['title'] . '</a>';
            $index_content .= '</li>' . "\n";
        }
        
        $index_content .= '</ul>' . "\n";
        $index_content .= '<!-- /wp:list -->' . "\n\n";
        
        $index_content .= '</div>' . "\n";
        $index_content .= '<!-- /wp:group -->' . "\n\n";
        
        return $index_content;
    }

    /**
     * Convert post blocks to WordPress Gutenberg block format
     */
    private static function convert_blocks_to_wp_content($blocks) {
        // Generate table of contents from headings
        $index_content = self::generate_index($blocks);
        
        $content = '';
        
        // Add index at the beginning if generated
        if (!empty($index_content)) {
            $content .= $index_content;
        }

        // Track anchor IDs to ensure uniqueness
        $anchor_counts = array();

        foreach ($blocks as $block) {
            if (!isset($block['type'])) {
                continue;
            }

            switch ($block['type']) {
                case 'heading':
                    if (isset($block['level']) && isset($block['title'])) {
                        $level = isset($block['level']) ? intval(str_replace('h', '', $block['level'])) : 2;
                        $level = max(1, min(6, $level)); // Ensure level is between 1 and 6
                        $title = wp_kses_post($block['title']);
                        
                        // Generate anchor ID for headings (H2 and below, since H1 is the post title)
                        $anchor = '';
                        if ($level >= 2) {
                            $base_anchor = sanitize_title($title);
                            
                            // Ensure unique anchor IDs
                            $anchor = $base_anchor;
                            $counter = 1;
                            while (isset($anchor_counts[$anchor])) {
                                $anchor = $base_anchor . '-' . $counter;
                                $counter++;
                            }
                            $anchor_counts[$anchor] = true;
                        }
                        
                        // Gutenberg heading block format with anchor ID
                        $attributes = array('level' => $level);
                        if (!empty($anchor)) {
                            $attributes['anchor'] = $anchor;
                        }
                        $attributes_json = json_encode($attributes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                        
                        $content .= '<!-- wp:heading ' . $attributes_json . ' -->' . "\n";
                        $heading_tag = '<h' . $level . ' class="wp-block-heading"';
                        if (!empty($anchor)) {
                            $heading_tag .= ' id="' . esc_attr($anchor) . '"';
                        }
                        $heading_tag .= '>' . $title . '</h' . $level . '>';
                        $content .= $heading_tag . "\n";
                        $content .= '<!-- /wp:heading -->' . "\n\n";
                    }
                    break;

                case 'paragraph':
                    if (isset($block['content'])) {
                        $paragraph = wp_kses_post($block['content']);
                        
                        // Gutenberg paragraph block format
                        $content .= '<!-- wp:paragraph -->' . "\n";
                        $content .= '<p class="wp-block-paragraph">' . $paragraph . '</p>' . "\n";
                        $content .= '<!-- /wp:paragraph -->' . "\n\n";
                    }
                    break;

                case 'image':
                    if (isset($block['image'])) {
                        // Support both 'sourceValue' (new format) and 'url' (legacy format)
                        $image_url = '';
                        if (isset($block['image']['sourceValue']) && !empty($block['image']['sourceValue'])) {
                            $image_url = esc_url($block['image']['sourceValue']);
                        } elseif (isset($block['image']['url']) && !empty($block['image']['url'])) {
                            $image_url = esc_url($block['image']['url']);
                        }
                        
                        if (!empty($image_url)) {
                            $image_alt = isset($block['image']['alt']) ? esc_attr($block['image']['alt']) : '';
                            
                            // Gutenberg image block format
                            $attributes = array(
                                'id' => 0,
                                'sizeSlug' => 'full',
                                'linkDestination' => 'none'
                            );
                            if (!empty($image_alt)) {
                                $attributes['alt'] = $image_alt;
                            }
                            
                            $content .= '<!-- wp:image ' . json_encode($attributes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ' -->' . "\n";
                            $content .= '<figure class="wp-block-image size-full">' . "\n";
                            $content .= '<img src="' . $image_url . '" alt="' . $image_alt . '" />' . "\n";
                            if (!empty($image_alt)) {
                                $content .= '<figcaption class="wp-element-caption">' . esc_html($image_alt) . '</figcaption>' . "\n";
                            }
                            $content .= '</figure>' . "\n";
                            $content .= '<!-- /wp:image -->' . "\n\n";
                        }
                    }
                    break;

                case 'faq':
                    if (isset($block['questions']) && isset($block['answers']) && is_array($block['questions']) && is_array($block['answers'])) {
                        // Use Gutenberg group block for FAQ section
                        $content .= '<!-- wp:group {"layout":{"type":"constrained"}} -->' . "\n";
                        $content .= '<div class="wp-block-group">' . "\n";
                        
                        // FAQ heading
                        $content .= '<!-- wp:heading {"level":2} -->' . "\n";
                        $content .= '<h2 class="wp-block-heading">FAQ</h2>' . "\n";
                        $content .= '<!-- /wp:heading -->' . "\n\n";
                        
                        // FAQ items as accordion using WordPress core/details block
                        for ($i = 0; $i < count($block['questions']); $i++) {
                            if (isset($block['questions'][$i]) && isset($block['answers'][$i])) {
                                $question = wp_kses_post($block['questions'][$i]);
                                $answer = wp_kses_post($block['answers'][$i]);
                                
                                // Use WordPress core/details block for accordion
                                // The summary attribute contains the question text
                                $attributes = json_encode(array(
                                    'summary' => $question
                                ), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                                
                                $content .= '<!-- wp:details ' . $attributes . ' -->' . "\n";
                                $content .= '<details class="wp-block-details faq-item">' . "\n";
                                $content .= '<summary class="faq-question">' . $question . '</summary>' . "\n";
                                $content .= '<!-- wp:paragraph -->' . "\n";
                                $content .= '<p class="wp-block-paragraph faq-answer">' . $answer . '</p>' . "\n";
                                $content .= '<!-- /wp:paragraph -->' . "\n";
                                $content .= '</details>' . "\n";
                                $content .= '<!-- /wp:details -->' . "\n\n";
                            }
                        }
                        
                        $content .= '</div>' . "\n";
                        $content .= '<!-- /wp:group -->' . "\n\n";
                    }
                    break;
            }
        }

        return trim($content);
    }

}


