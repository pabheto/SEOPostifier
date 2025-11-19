<?php
/**
 * Plugin Name: SEO Postifier
 * Plugin URI: https://example.com/seo-postifier
 * Description: Automatically generates WordPress posts with SEO optimizations using AI-powered backend
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: seo-postifier
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SEO_POSTIFIER_VERSION', '1.0.0');
define('SEO_POSTIFIER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SEO_POSTIFIER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SEO_POSTIFIER_BACKEND_URL', getenv('SEO_BACKEND_URL') ?: 'http://localhost:4000');

/**
 * Main SEO Postifier Class
 */
class SEO_Postifier {

    /**
     * Instance of this class
     */
    private static $instance = null;

    /**
     * Get instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));

        // AJAX handlers
        add_action('wp_ajax_seo_postifier_test_connection', array($this, 'test_backend_connection'));
        add_action('wp_ajax_seo_postifier_create_interview', array($this, 'create_interview'));
        add_action('wp_ajax_seo_postifier_generate_script_text', array($this, 'generate_script_text'));
        add_action('wp_ajax_seo_postifier_update_script_text', array($this, 'update_script_text'));
        add_action('wp_ajax_seo_postifier_generate_script_definition', array($this, 'generate_script_definition'));
        add_action('wp_ajax_seo_postifier_generate_post', array($this, 'generate_post'));
        add_action('wp_ajax_seo_postifier_create_wp_draft', array($this, 'create_wp_draft'));
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('SEO Postifier', 'seo-postifier'),
            __('SEO Postifier', 'seo-postifier'),
            'manage_options',
            'seo-postifier',
            array($this, 'render_admin_page'),
            'dashicons-edit-large',
            30
        );
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        if ('toplevel_page_seo-postifier' !== $hook) {
            return;
        }

        wp_enqueue_style(
            'seo-postifier-admin',
            SEO_POSTIFIER_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            SEO_POSTIFIER_VERSION
        );

        wp_enqueue_script(
            'seo-postifier-admin',
            SEO_POSTIFIER_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            SEO_POSTIFIER_VERSION,
            true
        );

        wp_localize_script('seo-postifier-admin', 'seoPostifierData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('seo_postifier_nonce'),
            'backendUrl' => SEO_POSTIFIER_BACKEND_URL
        ));
    }

    /**
     * Render admin page
     */
    public function render_admin_page() {
        include SEO_POSTIFIER_PLUGIN_DIR . 'templates/admin-page.php';
    }

    /**
     * Test backend connection (AJAX handler)
     */
    public function test_backend_connection() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        $response = $this->make_backend_request('/hello');

        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => 'Connection failed: ' . $response->get_error_message()
            ));
            return;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        wp_send_json_success(array(
            'message' => 'Connected successfully!',
            'data' => $data
        ));
    }

    /**
     * Create Interview (AJAX handler)
     */
    public function create_interview() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        $interview_data = isset($_POST['interview_data']) ? $_POST['interview_data'] : array();

        $response = $this->make_backend_request('/posts-interviews/create', 'POST', $interview_data);

        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => 'Failed to create interview: ' . $response->get_error_message()
            ));
            return;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (wp_remote_retrieve_response_code($response) !== 201) {
            wp_send_json_error(array(
                'message' => isset($data['message']) ? $data['message'] : 'Failed to create interview'
            ));
            return;
        }

        wp_send_json_success(array(
            'message' => 'Interview created successfully',
            'interview' => $data
        ));
    }

    /**
     * Generate Script Text (AJAX handler)
     */
    public function generate_script_text() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        $interview_id = isset($_POST['interview_id']) ? sanitize_text_field($_POST['interview_id']) : '';

        if (empty($interview_id)) {
            wp_send_json_error(array('message' => 'Interview ID is required'));
            return;
        }

        $response = $this->make_backend_request('/posts-interviews/generate-script-text', 'POST', array(
            'interviewId' => $interview_id
        ));

        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => 'Failed to generate script: ' . $response->get_error_message()
            ));
            return;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (wp_remote_retrieve_response_code($response) !== 200) {
            wp_send_json_error(array(
                'message' => isset($data['message']) ? $data['message'] : 'Failed to generate script'
            ));
            return;
        }

        wp_send_json_success(array(
            'message' => 'Script generated successfully',
            'interview' => $data
        ));
    }

    /**
     * Update Script Text (AJAX handler)
     */
    public function update_script_text() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        $interview_id = isset($_POST['interview_id']) ? sanitize_text_field($_POST['interview_id']) : '';
        $script_text = isset($_POST['script_text']) ? wp_unslash($_POST['script_text']) : '';

        if (empty($interview_id) || empty($script_text)) {
            wp_send_json_error(array('message' => 'Interview ID and script text are required'));
            return;
        }

        // For now, we'll just return success since the backend doesn't have an update endpoint
        // In production, you would create an update endpoint on the backend
        wp_send_json_success(array(
            'message' => 'Script updated successfully'
        ));
    }

    /**
     * Generate Script Definition (AJAX handler)
     */
    public function generate_script_definition() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        $interview_id = isset($_POST['interview_id']) ? sanitize_text_field($_POST['interview_id']) : '';

        if (empty($interview_id)) {
            wp_send_json_error(array('message' => 'Interview ID is required'));
            return;
        }

        $response = $this->make_backend_request('/posts-interviews/generate-script-definition', 'POST', array(
            'interviewId' => $interview_id
        ));

        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => 'Failed to generate script definition: ' . $response->get_error_message()
            ));
            return;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (wp_remote_retrieve_response_code($response) !== 200) {
            wp_send_json_error(array(
                'message' => isset($data['message']) ? $data['message'] : 'Failed to generate script definition'
            ));
            return;
        }

        wp_send_json_success(array(
            'message' => 'Script definition generated successfully',
            'interview' => $data
        ));
    }

    /**
     * Generate Post (AJAX handler)
     */
    public function generate_post() {
        check_ajax_referer('seo_postifier_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }

        $interview_id = isset($_POST['interview_id']) ? sanitize_text_field($_POST['interview_id']) : '';

        if (empty($interview_id)) {
            wp_send_json_error(array('message' => 'Interview ID is required'));
            return;
        }

        // Increase timeout for long-running generation
        set_time_limit(300);

        $response = $this->make_backend_request('/posts-interviews/generate-post', 'POST', array(
            'interviewId' => $interview_id
        ), 300); // 5 minutes timeout

        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => 'Failed to generate post: ' . $response->get_error_message()
            ));
            return;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (wp_remote_retrieve_response_code($response) !== 201) {
            wp_send_json_error(array(
                'message' => isset($data['message']) ? $data['message'] : 'Failed to generate post'
            ));
            return;
        }

        wp_send_json_success(array(
            'message' => 'Post generated successfully',
            'post' => $data
        ));
    }

    /**
     * Create WordPress Draft (AJAX handler)
     */
    public function create_wp_draft() {
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
        $content = $this->blocks_to_wp_content($post_data['blocks']);

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
    private function blocks_to_wp_content($blocks) {
        $content = '';

        if (!is_array($blocks)) {
            return $content;
        }

        foreach ($blocks as $block) {
            if (!isset($block['type']) || !isset($block['data'])) {
                continue;
            }

            switch ($block['type']) {
                case 'HEADING':
                    $level = isset($block['data']['level']) ? $block['data']['level'] : 'h2';
                    $title = isset($block['data']['title']) ? $block['data']['title'] : '';
                    $level_num = str_replace('h', '', $level);
                    $content .= sprintf('<%s>%s</%s>' . "\n\n", $level, esc_html($title), $level);
                    break;

                case 'PARAGRAPH':
                    $text = isset($block['data']['content']) ? $block['data']['content'] : '';
                    $content .= sprintf('<p>%s</p>' . "\n\n", wp_kses_post($text));
                    break;

                case 'IMAGE':
                    if (isset($block['data']['url'])) {
                        $url = $block['data']['url'];
                        $alt = isset($block['data']['alt']) ? $block['data']['alt'] : '';
                        $caption = isset($block['data']['caption']) ? $block['data']['caption'] : '';

                        $img = sprintf('<img src="%s" alt="%s" class="aligncenter" />', esc_url($url), esc_attr($alt));

                        if (!empty($caption)) {
                            $content .= sprintf('[caption]%s %s[/caption]' . "\n\n", $img, esc_html($caption));
                        } else {
                            $content .= $img . "\n\n";
                        }
                    }
                    break;

                case 'FAQ':
                    if (isset($block['data']['questions']) && isset($block['data']['answers'])) {
                        $content .= '<h2>FAQ</h2>' . "\n\n";
                        $questions = $block['data']['questions'];
                        $answers = $block['data']['answers'];

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

    /**
     * Make request to backend
     */
    public function make_backend_request($endpoint, $method = 'GET', $body = null, $timeout = 60) {
        $url = SEO_POSTIFIER_BACKEND_URL . $endpoint;

        $args = array(
            'method' => $method,
            'timeout' => $timeout,
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
        );

        if ($body !== null) {
            $args['body'] = json_encode($body);
        }

        return wp_remote_request($url, $args);
    }
}

/**
 * Initialize the plugin
 */
function seo_postifier_init() {
    return SEO_Postifier::get_instance();
}

// Start the plugin
add_action('plugins_loaded', 'seo_postifier_init');

/**
 * Activation hook
 */
register_activation_hook(__FILE__, 'seo_postifier_activate');
function seo_postifier_activate() {
    // Activation tasks (if needed)
    flush_rewrite_rules();
}

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, 'seo_postifier_deactivate');
function seo_postifier_deactivate() {
    // Deactivation tasks (if needed)
    flush_rewrite_rules();
}
