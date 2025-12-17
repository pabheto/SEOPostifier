<?php
/**
 * Admin Page Class
 * Manages the admin interface with tabs
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Autoblogger_Admin_Page {

    /**
     * Register admin menu
     */
    public static function register_menu() {
        add_menu_page(
            __('Autoblogger', 'autoblogger'),
            __('Autoblogger', 'autoblogger'),
            'manage_options',
            'autoblogger',
            array(__CLASS__, 'render_page'),
            'dashicons-edit-large',
            30
        );
    }

    /**
     * Enqueue admin scripts
     */
    public static function enqueue_scripts($hook) {
        if ('toplevel_page_autoblogger' !== $hook) {
            return;
        }

        // Enqueue styles
        wp_enqueue_style(
            'autoblogger-admin',
            AUTOBLOGGER_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            AUTOBLOGGER_VERSION
        );

        // Enqueue jQuery (already included with WordPress)
        wp_enqueue_script('jquery');

        // Localize script data for inline scripts in templates
        wp_localize_script('jquery', 'autobloggerData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('autoblogger_nonce'),
            'backendUrl' => Autoblogger_Settings::get_backend_url(),
            'hasLicense' => Autoblogger_Settings::has_license_key(),
            'licenseKey' => Autoblogger_Settings::get_license_key(),
            'isActivated' => Autoblogger_Settings::is_activated(),
        ));
    }

    /**
     * Render admin page
     */
    public static function render_page() {
        // Check if plugin is activated
        if (!Autoblogger_Settings::is_activated()) {
            include AUTOBLOGGER_PLUGIN_DIR . 'templates/tab-activation.php';
            return;
        }

        // Get current tab
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- GET parameter for tab navigation, not form processing
        $current_tab = isset($_GET['tab']) ? sanitize_text_field(wp_unslash($_GET['tab'])) : 'scripts';

        // Get settings
        $settings = Autoblogger_Settings::get_all();

        include AUTOBLOGGER_PLUGIN_DIR . 'templates/admin-page-wrapper.php';
    }
}

