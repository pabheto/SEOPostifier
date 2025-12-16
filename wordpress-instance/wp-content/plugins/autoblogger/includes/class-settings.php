<?php
/**
 * Settings Management Class
 * Handles plugin settings including license key storage and retrieval
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Autoblogger_Settings {

    /**
     * Option name for settings
     */
    const OPTION_NAME = 'autoblogger_settings';

    /**
     * Get all settings
     */
    public static function get_all() {
        return get_option(self::OPTION_NAME, array(
            'license_key' => '',
            'backend_url' => AUTOBLOGGER_BACKEND_URL,
            'activated' => false,
        ));
    }

    /**
     * Get a specific setting
     */
    public static function get($key, $default = '') {
        $settings = self::get_all();
        return isset($settings[$key]) ? $settings[$key] : $default;
    }

    /**
     * Update a specific setting
     */
    public static function update($key, $value) {
        $settings = self::get_all();
        $settings[$key] = $value;
        return update_option(self::OPTION_NAME, $settings);
    }

    /**
     * Update multiple settings
     */
    public static function update_all($new_settings) {
        $settings = self::get_all();
        $settings = array_merge($settings, $new_settings);
        return update_option(self::OPTION_NAME, $settings);
    }

    /**
     * Get license key
     */
    public static function get_license_key() {
        return self::get('license_key');
    }

    /**
     * Check if license key is set
     */
    public static function has_license_key() {
        $license_key = self::get_license_key();
        return !empty($license_key);
    }

    /**
     * Check if plugin is activated
     */
    public static function is_activated() {
        return (bool) self::get('activated', false);
    }

    /**
     * Activate the plugin
     */
    public static function activate() {
        return self::update('activated', true);
    }

    /**
     * Deactivate the plugin
     */
    public static function deactivate() {
        self::update('activated', false);
        self::update('license_key', '');
        return true;
    }

    /**
     * Get backend URL
     * Priority: 1. Environment variable, 2. Database value, 3. Constant default
     */
    public static function get_backend_url() {
        // Check environment variable first (highest priority)
        $env_url = getenv('SEO_BACKEND_URL');
        if (!empty($env_url)) {
            return $env_url;
        }
        
        // Fall back to database value, then constant
        return self::get('backend_url', AUTOBLOGGER_BACKEND_URL);
    }

    /**
     * Delete all settings
     */
    public static function delete_all() {
        return delete_option(self::OPTION_NAME);
    }
}

