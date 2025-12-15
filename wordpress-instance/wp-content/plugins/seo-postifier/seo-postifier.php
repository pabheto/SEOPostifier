<?php
/**
 * Plugin Name: SEO Postifier
 * Plugin URI: https://example.com/seo-postifier
 * Description: Automatically generates WordPress posts with SEO optimizations using AI-powered backend. Includes automatic SEO meta integration for Yoast SEO, RankMath, and All in One SEO.
 * Version: 2.0.1
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
define('SEO_POSTIFIER_VERSION', '2.0.1');
define('SEO_POSTIFIER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SEO_POSTIFIER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SEO_POSTIFIER_BACKEND_URL', getenv('SEO_BACKEND_URL') ?: 'https://seo-postifier-backend-nmb9f.ondigitalocean.app/');

// Development mode flag - set to true to show backend URL configuration
define('SEO_POSTIFIER_DEV_MODE', false);

// Require plugin classes
require_once SEO_POSTIFIER_PLUGIN_DIR . 'includes/class-settings.php';
require_once SEO_POSTIFIER_PLUGIN_DIR . 'includes/class-api-client.php';
require_once SEO_POSTIFIER_PLUGIN_DIR . 'includes/class-ajax-handlers.php';
require_once SEO_POSTIFIER_PLUGIN_DIR . 'includes/class-admin-page.php';

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
        // Load in admin area
        if (is_admin()) {
            add_action('admin_menu', array('SEO_Postifier_Admin_Page', 'register_menu'));
            add_action('admin_enqueue_scripts', array('SEO_Postifier_Admin_Page', 'enqueue_scripts'));
            
            // Register AJAX handlers
            SEO_Postifier_AJAX_Handlers::register();
        }
        
        // Load frontend styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_styles'));
    }
    
    /**
     * Enqueue frontend styles
     */
    public function enqueue_frontend_styles() {
        wp_enqueue_style(
            'seo-postifier-frontend',
            SEO_POSTIFIER_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            SEO_POSTIFIER_VERSION
        );
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
    // Set default settings if not exist
    if (!get_option(SEO_Postifier_Settings::OPTION_NAME)) {
        SEO_Postifier_Settings::update_all(array(
            'license_key' => '',
            'backend_url' => SEO_POSTIFIER_BACKEND_URL,
            'activated' => false,
        ));
    }
    flush_rewrite_rules();
}

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, 'seo_postifier_deactivate');
function seo_postifier_deactivate() {
    flush_rewrite_rules();
}
