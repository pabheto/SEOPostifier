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
        
        // Backend operations
        add_action('wp_ajax_seo_postifier_test_connection', array(__CLASS__, 'test_connection'));
        add_action('wp_ajax_seo_postifier_create_interview', array(__CLASS__, 'create_interview'));
        add_action('wp_ajax_seo_postifier_generate_script_text', array(__CLASS__, 'generate_script_text'));
        add_action('wp_ajax_seo_postifier_generate_script_definition', array(__CLASS__, 'generate_script_definition'));
        add_action('wp_ajax_seo_postifier_generate_post', array(__CLASS__, 'generate_post'));
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
     * Generate Script Text (AJAX handler)
     */
    public static function generate_script_text() {
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

        $response = SEO_Postifier_API_Client::generate_script_text($interview_id);
        $result = SEO_Postifier_API_Client::parse_response($response);

        if ($result['success']) {
            wp_send_json_success(array(
                'message' => 'Script generated successfully',
                'interview' => $result['data']
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to generate script: ' . $result['message']
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
                'interview' => $result['data']
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
                'post' => $result['data']
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to generate post: ' . $result['message']
            ));
        }
    }

    /**
     * Create WordPress Draft (AJAX handler)
     */
    public static function create_wp_draft() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        $post_data = isset($_POST['post_data']) ? $_POST['post_data'] : array();

        if (empty($post_data) || !isset($post_data['title']) || !isset($post_data['blocks'])) {
            wp_send_json_error(array('message' => 'Invalid post data'));
            return;
        }

        // Convert blocks to WordPress content
        $content = self::blocks_to_wp_content($post_data['blocks']);

        // Create the WordPress post
        $wp_post_id = wp_insert_post(array(
            'post_title'    => sanitize_text_field($post_data['title']),
            'post_content'  => $content,
            'post_status'   => 'draft',
            'post_type'     => 'post',
            'post_author'   => get_current_user_id(),
            'meta_input'    => array(
                '_seo_postifier_interview_id' => isset($post_data['interviewId']) ? $post_data['interviewId'] : '',
                '_seo_postifier_main_keyword' => isset($post_data['mainKeyword']) ? $post_data['mainKeyword'] : '',
                '_seo_postifier_secondary_keywords' => isset($post_data['secondaryKeywords']) ? json_encode($post_data['secondaryKeywords']) : ''
            )
        ));

        if (is_wp_error($wp_post_id)) {
            wp_send_json_error(array(
                'message' => 'Failed to create draft: ' . $wp_post_id->get_error_message()
            ));
            return;
        }

        // Generate slug if provided
        if (isset($post_data['slug'])) {
            wp_update_post(array(
                'ID' => $wp_post_id,
                'post_name' => sanitize_title($post_data['slug'])
            ));
        }

        // Get edit and preview links
        $edit_link = get_edit_post_link($wp_post_id, 'raw');
        $preview_link = get_preview_post_link($wp_post_id);

        wp_send_json_success(array(
            'message' => 'WordPress draft created successfully',
            'post' => array(
                'id' => $wp_post_id,
                'edit_link' => $edit_link,
                'preview_link' => $preview_link
            )
        ));
    }

    /**
     * Convert blocks to WordPress content
     */
    private static function blocks_to_wp_content($blocks) {
        $content = '';

        if (!is_array($blocks)) {
            return $content;
        }

        foreach ($blocks as $block) {
            if (!isset($block['type'])) {
                continue;
            }

            switch ($block['type']) {
                case 'heading':
                    $level = isset($block['level']) ? $block['level'] : 'h2';
                    $title = isset($block['title']) ? $block['title'] : '';
                    $content .= sprintf('<%s>%s</%s>' . "\n\n", $level, esc_html($title), $level);
                    break;

                case 'paragraph':
                    $text = isset($block['content']) ? $block['content'] : '';
                    $content .= sprintf('<p>%s</p>' . "\n\n", wp_kses_post($text));
                    break;

                case 'image':
                    if (isset($block['image']['sourceValue'])) {
                        $url = $block['image']['sourceValue'];
                        $alt = isset($block['image']['suggestedAlt']) ? $block['image']['suggestedAlt'] : '';
                        $caption = isset($block['image']['notes']) ? $block['image']['notes'] : '';

                        $img = sprintf('<img src="%s" alt="%s" class="aligncenter" />', esc_url($url), esc_attr($alt));

                        if (!empty($caption)) {
                            $content .= sprintf('[caption]%s %s[/caption]' . "\n\n", $img, esc_html($caption));
                        } else {
                            $content .= $img . "\n\n";
                        }
                    }
                    break;

                case 'faq':
                    if (isset($block['questions']) && isset($block['answers'])) {
                        $content .= '<h2>FAQ</h2>' . "\n\n";
                        $questions = $block['questions'];
                        $answers = $block['answers'];

                        foreach ($questions as $index => $question) {
                            $content .= sprintf('<h3>%s</h3>' . "\n", esc_html($question));
                            if (isset($answers[$index])) {
                                $content .= sprintf('<p>%s</p>' . "\n\n", wp_kses_post($answers[$index]));
                            }
                        }
                    }
                    break;
            }
        }

        return $content;
    }
}

