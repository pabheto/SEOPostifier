<?php
/**
 * API Client Class
 * Handles all communications with the SEO Postifier backend
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class SEO_Postifier_API_Client {

    /**
     * Make request to backend with license authentication
     */
    public static function request($endpoint, $method = 'GET', $body = null, $timeout = 60) {
        $backend_url = SEO_Postifier_Settings::get_backend_url();
        $license_key = SEO_Postifier_Settings::get_license_key();
        
        $url = rtrim($backend_url, '/') . $endpoint;

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
     * Generate script text
     */
    public static function generate_script_text($interview_id) {
        return self::request('/posts-interviews/generate-script-text', 'POST', array(
            'interviewId' => $interview_id
        ), 120);
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
     * Validate license key
     */
    public static function validate_license($license_key) {
        return self::request('/users/auth/license', 'POST', array(
            'licenseKey' => $license_key
        ), 10);
    }

    /**
     * Parse response and extract data
     */
    public static function parse_response($response) {
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => $response->get_error_message(),
            );
        }

        $body = wp_remote_retrieve_body($response);
        $code = wp_remote_retrieve_response_code($response);
        $data = json_decode($body, true);

        if ($code >= 200 && $code < 300) {
            return array(
                'success' => true,
                'data' => $data,
                'code' => $code,
            );
        } else {
            return array(
                'success' => false,
                'message' => isset($data['message']) ? $data['message'] : 'Request failed',
                'code' => $code,
                'data' => $data,
            );
        }
    }
}

