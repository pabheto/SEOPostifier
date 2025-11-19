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

        // Enqueue modular JavaScript files in dependency order
        wp_enqueue_script(
            'seo-postifier-state-manager',
            SEO_POSTIFIER_PLUGIN_URL . 'assets/js/modules/state-manager.js',
            array(),
            SEO_POSTIFIER_VERSION,
            true
        );

        wp_enqueue_script(
            'seo-postifier-api-handler',
            SEO_POSTIFIER_PLUGIN_URL . 'assets/js/modules/api-handler.js',
            array('jquery'),
            SEO_POSTIFIER_VERSION,
            true
        );

        wp_enqueue_script(
            'seo-postifier-ui-controller',
            SEO_POSTIFIER_PLUGIN_URL . 'assets/js/modules/ui-controller.js',
            array('jquery'),
            SEO_POSTIFIER_VERSION,
            true
        );

        wp_enqueue_script(
            'seo-postifier-workflow',
            SEO_POSTIFIER_PLUGIN_URL . 'assets/js/modules/workflow-orchestrator.js',
            array('jquery', 'seo-postifier-state-manager', 'seo-postifier-api-handler', 'seo-postifier-ui-controller'),
            SEO_POSTIFIER_VERSION,
            true
        );

        wp_enqueue_script(
            'seo-postifier-admin',
            SEO_POSTIFIER_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery', 'seo-postifier-workflow'),
            SEO_POSTIFIER_VERSION,
            true
        );

        // Localize script data
        wp_localize_script('seo-postifier-admin', 'seoPostifierData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('seo_postifier_nonce'),
            'backendUrl' => SEO_Postifier_Settings::get_backend_url(),
            'hasLicense' => SEO_Postifier_Settings::has_license_key(),
            'licenseKey' => SEO_Postifier_Settings::get_license_key(),
        ));
    }

    /**
     * Render admin page
     */
    public static function render_page() {
        // Get current tab
        $current_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'generator';

        // Get settings
        $settings = SEO_Postifier_Settings::get_all();

        include SEO_POSTIFIER_PLUGIN_DIR . 'templates/admin-page-wrapper.php';
    }
}

