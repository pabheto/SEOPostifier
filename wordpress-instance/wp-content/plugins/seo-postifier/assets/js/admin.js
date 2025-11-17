jQuery(document).ready(function($) {
    'use strict';

    /**
     * Test backend connection
     */
    $('#test-connection').on('click', function() {
        const $button = $(this);
        const $status = $('#connection-status');

        // Disable button and show loading state
        $button.prop('disabled', true).text('Testing...');
        $status.removeClass('success error').addClass('info').show().text('Connecting to backend...');

        // Make AJAX request
        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_test_connection',
                nonce: seoPostifierData.nonce
            },
            success: function(response) {
                if (response.success) {
                    $status.removeClass('info error').addClass('success')
                        .html('<strong>Success!</strong> ' + response.data.message +
                              '<br/>Backend response: ' + JSON.stringify(response.data.data));
                } else {
                    $status.removeClass('info success').addClass('error')
                        .html('<strong>Error!</strong> ' + response.data.message);
                }
            },
            error: function(xhr, status, error) {
                $status.removeClass('info success').addClass('error')
                    .html('<strong>Connection Failed!</strong> ' + error);
            },
            complete: function() {
                $button.prop('disabled', false).text('Test Connection');
            }
        });
    });

    /**
     * Generate post form submission
     */
    $('#generate-post-form').on('submit', function(e) {
        e.preventDefault();

        const $form = $(this);
        const $button = $form.find('button[type="submit"]');
        const $status = $('#generation-status');

        // Get form data
        const topic = $('#post-topic').val();
        const keywords = $('#target-keywords').val();

        // Disable button and show loading state
        $button.prop('disabled', true).text('Generating...');
        $status.removeClass('success error').addClass('info').show()
            .text('Generating SEO-optimized post...');

        // TODO: Implement post generation AJAX call
        // For now, just show a placeholder message
        setTimeout(function() {
            $status.removeClass('info').addClass('info')
                .html('<strong>Coming Soon!</strong> Post generation will be implemented with the backend API.');
            $button.prop('disabled', false).text('Generate Post');
        }, 1000);
    });
});
