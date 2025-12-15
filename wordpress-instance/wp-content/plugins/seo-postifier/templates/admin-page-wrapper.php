<?php
/**
 * Admin Page Wrapper Template with Tabs
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap seo-postifier-admin">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <!-- Tabs Navigation -->
    <?php if ($current_tab !== 'create-script' && $current_tab !== 'edit-script' && $current_tab !== 'view-script'): ?>
    <nav class="nav-tab-wrapper wp-clearfix" style="margin-bottom: 20px;">
        <a href="?page=seo-postifier&tab=scripts" 
           class="nav-tab <?php echo $current_tab === 'scripts' ? 'nav-tab-active' : ''; ?>">
            <?php _e('My Drafts', 'seo-postifier'); ?>
        </a>
        <a href="?page=seo-postifier&tab=settings" 
           class="nav-tab <?php echo $current_tab === 'settings' ? 'nav-tab-active' : ''; ?>">
            <?php _e('Settings', 'seo-postifier'); ?>
        </a>
    </nav>
    <?php endif; ?>

    <!-- Tab Content -->
    <div class="seo-postifier-tab-content">
        <?php
        switch ($current_tab) {
            case 'settings':
                include SEO_POSTIFIER_PLUGIN_DIR . 'templates/tab-settings.php';
                break;
            case 'create-script':
            case 'edit-script':
                include SEO_POSTIFIER_PLUGIN_DIR . 'templates/tab-create-script.php';
                break;
            case 'view-script':
                include SEO_POSTIFIER_PLUGIN_DIR . 'templates/tab-view-script.php';
                break;
            case 'scripts':
            default:
                include SEO_POSTIFIER_PLUGIN_DIR . 'templates/tab-scripts-list.php';
                break;
        }
        ?>
    </div>
</div>

