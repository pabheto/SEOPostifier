<?php
/**
 * API Client Class
 * Handles all communications with the Autoblogger backend
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Autoblogger_API_Client {

    /**
     * Make request to backend with license authentication
     */
    public static function request($endpoint, $method = 'GET', $body = null, $timeout = 60) {
        $backend_url = Autoblogger_Settings::get_backend_url();
        $license_key = Autoblogger_Settings::get_license_key();
        
        if (empty($backend_url)) {
            return new WP_Error('no_backend_url', 'Backend URL is not configured. Please set it in Settings.');
        }
        
        $url = rtrim($backend_url, '/') . $endpoint;

        // Print backend URL when requesting (only in debug mode)
        // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Autoblogger Backend URL: ' . $backend_url);
            error_log('Autoblogger Request URL: ' . $url . ' [' . $method . ']');
        }

        $args = array(
            'method'  => $method,
            'timeout' => $timeout,
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
        );

        // Add license key to Authorization header if available
        if (!empty($license_key)) {
            $args['headers']['Authorization'] = 'Bearer ' . $license_key;
        }

        if ($body !== null) {
            $args['body'] = json_encode($body);
        }

        return wp_remote_request($url, $args);
    }

    /**
     * Test backend connection
     */
    public static function test_connection() {
        return self::request('/hello', 'GET', null, 10);
    }

    /**
     * Create post interview
     */
    public static function create_interview($interview_data) {
        return self::request('/posts-interviews/create', 'POST', $interview_data, 30);
    }

    /**
     * Update post interview
     */
    public static function update_interview($interview_data) {
        return self::request('/posts-interviews/update', 'POST', $interview_data, 30);
    }

    /**
     * Generate script text
     */
    public static function generate_script_text($interview_id) {
        return self::request('/posts-interviews/generate-script-text', 'POST', array(
            'interviewId' => $interview_id
        ), 120);
    }

    /**
     * Generate script definition
     */
    public static function generate_script_definition($interview_id) {
        return self::request('/posts-interviews/generate-script-definition', 'POST', array(
            'interviewId' => $interview_id
        ), 120);
    }

    /**
     * Generate suggestions for interview
     */
    public static function generate_suggestions($interview_id) {
        return self::request('/posts-interviews/generate-suggestions', 'POST', array(
            'interviewId' => $interview_id
        ), 120);
    }

    /**
     * Generate post from interview
     */
    public static function generate_post($interview_id) {
        return self::request('/posts/generate', 'POST', array(
            'interviewId' => $interview_id
        ), 300);
    }

    /**
     * Get post by ID
     */
    public static function get_post($post_id) {
        return self::request('/posts/' . $post_id, 'GET', null, 30);
    }

    /**
     * Get interviews list
     */
    public static function get_interviews_list() {
        return self::request('/posts-interviews/get-interviews-list', 'GET', null, 30);
    }

    /**
     * Get interview by ID
     */
    public static function get_interview($interview_id) {
        return self::request('/posts-interviews/get-interview/' . $interview_id, 'GET', null, 30);
    }

    /**
     * Activate license key for this site
     */
    public static function activate_license($license_key, $site_url) {
        return self::request('/licenses/activate', 'POST', array(
            'licenseKey' => $license_key,
            'siteUrl' => $site_url
        ), 10);
    }

    /**
     * Validate license key (get license details)
     */
    public static function validate_license($license_key) {
        return self::request('/licenses/' . $license_key, 'GET', null, 10);
    }

    /**
     * Get current subscription and usage
     */
    public static function get_subscription() {
        return self::request('/subscriptions/current-by-license', 'GET', null, 30);
    }

    /**
     * Parse response and extract data
     */
    public static function parse_response($response) {
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            $error_code = $response->get_error_code();
            
            // Log the error for debugging (only in debug mode)
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Autoblogger API Error: ' . $error_code . ' - ' . $error_message);
            }
            
            return array(
                'success' => false,
                'message' => $error_message,
                'code' => $error_code,
            );
        }

        $body = wp_remote_retrieve_body($response);
        $code = wp_remote_retrieve_response_code($response);
        $data = json_decode($body, true);

        // Log response for debugging if there's an error (only in debug mode)
        if ($code < 200 || $code >= 300) {
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Autoblogger API HTTP Error: ' . $code);
                error_log('Response body: ' . substr($body, 0, 500));
            }
        }

        if ($code >= 200 && $code < 300) {
            return array(
                'success' => true,
                'data' => $data,
                'code' => $code,
            );
        } else {
            // Try to extract error message from response
            $error_message = 'Request failed';
            if (isset($data['message'])) {
                if (is_array($data['message'])) {
                    $error_message = implode(', ', $data['message']);
                } else {
                    $error_message = $data['message'];
                }
            } elseif (isset($data['error'])) {
                $error_message = $data['error'];
            }
            
            return array(
                'success' => false,
                'message' => $error_message,
                'code' => $code,
                'data' => $data,
            );
        }
    }
}

