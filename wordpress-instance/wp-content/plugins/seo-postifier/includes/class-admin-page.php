<?php
/**
 * Admin Page Class
 * Manages the admin interface with tabs
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class SEO_Postifier_Admin_Page {

    /**
     * Register admin menu
     */
    public static function register_menu() {
        add_menu_page(
            __('SEO Postifier', 'seo-postifier'),
            __('SEO Postifier', 'seo-postifier'),
            'manage_options',
            'seo-postifier',
            array(__CLASS__, 'render_page'),
            'dashicons-edit-large',
            30
        );
    }

    /**
     * Enqueue admin scripts
     */
    public static function enqueue_scripts($hook) {
        if ('toplevel_page_seo-postifier' !== $hook) {
            return;
        }

        // Enqueue styles
        wp_enqueue_style(
            'seo-postifier-admin',
            SEO_POSTIFIER_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            SEO_POSTIFIER_VERSION
        );

        // Enqueue jQuery (already included with WordPress)
        wp_enqueue_script('jquery');

        // Localize script data for inline scripts in templates
        wp_localize_script('jquery', 'seoPostifierData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('seo_postifier_nonce'),
            'backendUrl' => SEO_Postifier_Settings::get_backend_url(),
            'hasLicense' => SEO_Postifier_Settings::has_license_key(),
            'licenseKey' => SEO_Postifier_Settings::get_license_key(),
            'isActivated' => SEO_Postifier_Settings::is_activated(),
        ));
    }

    /**
     * Render admin page
     */
    public static function render_page() {
        // Check if plugin is activated
        if (!SEO_Postifier_Settings::is_activated()) {
            include SEO_POSTIFIER_PLUGIN_DIR . 'templates/tab-activation.php';
            return;
        }

        // Get current tab
        $current_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'scripts';

        // Get settings
        $settings = SEO_Postifier_Settings::get_all();

        include SEO_POSTIFIER_PLUGIN_DIR . 'templates/admin-page-wrapper.php';
    }
}

