<?php
/**
 * Plugin Name: Autoblogger
 * Plugin URI: https://autoblogger.es
 * Description: Automatically generates WordPress posts with SEO optimizations using AI-powered backend. Includes automatic SEO meta integration for Yoast SEO, RankMath, and All in One SEO.
 * Version: 2.0.1
 * Author: Autoblogger
 * Author URI: https://autoblogger.es
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: autoblogger
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('AUTOBLOGGER_VERSION', '2.0.1');
define('AUTOBLOGGER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('AUTOBLOGGER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('AUTOBLOGGER_BACKEND_URL', getenv('SEO_BACKEND_URL') ?: 'https://seo-postifier-backend-nmb9f.ondigitalocean.app/');

// Development mode flag - set to true to show backend URL configuration
define('AUTOBLOGGER_DEV_MODE', false);

// Require plugin classes
require_once AUTOBLOGGER_PLUGIN_DIR . 'includes/class-settings.php';
require_once AUTOBLOGGER_PLUGIN_DIR . 'includes/class-api-client.php';
require_once AUTOBLOGGER_PLUGIN_DIR . 'includes/class-ajax-handlers.php';
require_once AUTOBLOGGER_PLUGIN_DIR . 'includes/class-admin-page.php';

/**
 * Main Autoblogger Class
 */
class Autoblogger {

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
            add_action('admin_menu', array('Autoblogger_Admin_Page', 'register_menu'));
            add_action('admin_enqueue_scripts', array('Autoblogger_Admin_Page', 'enqueue_scripts'));
            
            // Register AJAX handlers
            Autoblogger_AJAX_Handlers::register();
        }
        
        // Load frontend styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_styles'));
    }
    
    /**
     * Enqueue frontend styles
     */
    public function enqueue_frontend_styles() {
        wp_enqueue_style(
            'autoblogger-frontend',
            AUTOBLOGGER_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            AUTOBLOGGER_VERSION
        );
    }
}

/**
 * Initialize the plugin
 */
function autoblogger_init() {
    return Autoblogger::get_instance();
}

// Start the plugin
add_action('plugins_loaded', 'autoblogger_init');

/**
 * Activation hook
 */
register_activation_hook(__FILE__, 'autoblogger_activate');
function autoblogger_activate() {
    // Set default settings if not exist
    if (!get_option(Autoblogger_Settings::OPTION_NAME)) {
        Autoblogger_Settings::update_all(array(
            'license_key' => '',
            'backend_url' => AUTOBLOGGER_BACKEND_URL,
            'activated' => false,
        ));
    }
    flush_rewrite_rules();
}

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, 'autoblogger_deactivate');
function autoblogger_deactivate() {
    flush_rewrite_rules();
}
