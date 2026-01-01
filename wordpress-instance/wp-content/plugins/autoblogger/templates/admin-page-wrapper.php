<?php
/**
 * Admin Page Wrapper Template with Tabs
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap autoblogger-admin">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <!-- Tabs Navigation -->
    <?php if ($current_tab !== 'create-script' && $current_tab !== 'edit-script'): ?>
    <nav class="nav-tab-wrapper wp-clearfix" style="margin-bottom: 20px;">
        <a href="?page=autoblogger&tab=scripts" 
           class="nav-tab <?php echo $current_tab === 'scripts' ? 'nav-tab-active' : ''; ?>">
            <?php esc_html_e('My Drafts', 'autoblogger'); ?>
        </a>
        <a href="?page=autoblogger&tab=settings" 
           class="nav-tab <?php echo $current_tab === 'settings' ? 'nav-tab-active' : ''; ?>">
            <?php esc_html_e('Settings', 'autoblogger'); ?>
        </a>
    </nav>
    <?php endif; ?>

    <!-- Tab Content -->
    <div class="autoblogger-tab-content">
        <?php
        switch ($current_tab) {
            case 'settings':
                include AUTOBLOGGER_PLUGIN_DIR . 'templates/tab-settings.php';
                break;
            case 'create-script':
            case 'edit-script':
                include AUTOBLOGGER_PLUGIN_DIR . 'templates/tab-create-script.php';
                break;
            case 'view-script':
                // Redirect view-script to edit-script for unified experience
                // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- GET parameter for navigation redirect
                $interview_id = isset($_GET['interviewId']) ? sanitize_text_field(wp_unslash($_GET['interviewId'])) : '';
                if (!empty($interview_id)) {
                    // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- Admin redirect to same plugin page
                    wp_redirect(admin_url('admin.php?page=autoblogger&tab=edit-script&interviewId=' . urlencode($interview_id)));
                    exit;
                } else {
                    // If no interview ID, go to scripts list
                    // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- Admin redirect to same plugin page
                    wp_redirect(admin_url('admin.php?page=autoblogger&tab=scripts'));
                    exit;
                }
                break;
            case 'scripts':
            default:
                include AUTOBLOGGER_PLUGIN_DIR . 'templates/tab-scripts-list.php';
                break;
        }
        ?>
    </div>
</div>

