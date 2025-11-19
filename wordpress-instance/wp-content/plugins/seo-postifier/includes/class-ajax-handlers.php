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
        add_action('wp_ajax_seo_postifier_generate_script_text', array(__CLASS__, 'generate_script_text'));
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
                'interview' => $result['data']['interview']
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to generate script: ' . $result['message']
            ));
        }
    }

}

