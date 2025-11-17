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
        add_action('wp_ajax_seo_postifier_test_connection', array($this, 'test_backend_connection'));
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
     * Make request to backend
     */
    public function make_backend_request($endpoint, $method = 'GET', $body = null) {
        $url = SEO_POSTIFIER_BACKEND_URL . $endpoint;

        $args = array(
            'method' => $method,
            'timeout' => 15,
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
