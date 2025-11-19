jQuery(document).ready(function($) {
    'use strict';

    // Store current interview data
    let currentInterviewData = null;

    /**
     * Toggle brand fields visibility
     */
    $('#mentions-brand').on('change', function() {
        if ($(this).is(':checked')) {
            $('.brand-fields').show();
        } else {
            $('.brand-fields').hide();
        }
    });

    /**
     * Toggle internal links fields visibility
     */
    $('#include-internal-links').on('change', function() {
        if ($(this).is(':checked')) {
            $('.internal-links-fields').show();
        } else {
            $('.internal-links-fields').hide();
        }
    });

    /**
     * Toggle external links fields visibility
     */
    $('#include-external-links').on('change', function() {
        if ($(this).is(':checked')) {
            $('.external-links-fields').show();
        } else {
            $('.external-links-fields').hide();
        }
    });

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
     * Create Post Interview and Generate Script
     */
    $('#post-interview-form').on('submit', function(e) {
        e.preventDefault();

        const $form = $(this);
        const $button = $form.find('button[type="submit"]');
        const $status = $('#interview-status');

        // Prepare form data
        const formData = {
            mainKeyword: $('#main-keyword').val(),
            secondaryKeywords: $('#secondary-keywords').val().split(',').map(s => s.trim()).filter(s => s),
            keywordDensityTarget: parseFloat($('#keyword-density').val()),
            userDescription: $('#user-description').val(),
            language: $('#language').val(),
            searchIntent: $('#search-intent').val(),
            targetAudience: $('#target-audience').val(),
            toneOfVoice: $('#tone-of-voice').val(),
            minWordCount: parseInt($('#min-word-count').val()),
            maxWordCount: parseInt($('#max-word-count').val()),
            needsFaqSection: $('#needs-faq').is(':checked'),
            mentionsBrand: $('#mentions-brand').is(':checked'),
            includeInternalLinks: $('#include-internal-links').is(':checked'),
            includeExternalLinks: $('#include-external-links').is(':checked'),
            maxInternalLinks: parseInt($('#max-internal-links').val()) || 3,
            maxExternalLinks: parseInt($('#max-external-links').val()) || 2,
            notesForWriter: $('#notes-for-writer').val() || ''
        };

        // Add brand fields if enabled
        if (formData.mentionsBrand) {
            formData.brandName = $('#brand-name').val();
            formData.brandDescription = $('#brand-description').val();
        }

        // Add link URLs if enabled
        if (formData.includeInternalLinks) {
            const internalLinks = $('#internal-links-to-use').val();
            if (internalLinks) {
                formData.internalLinksToUse = internalLinks.split('\n').map(s => s.trim()).filter(s => s);
            }
        }

        if (formData.includeExternalLinks) {
            const externalLinks = $('#external-links-to-use').val();
            if (externalLinks) {
                formData.externalLinksToUse = externalLinks.split('\n').map(s => s.trim()).filter(s => s);
            }
        }

        // Default values for required fields not in form
        formData.projectId = 'wordpress-default';
        formData.userId = 'wordpress-user';
        formData.imagesConfig = {
            aiImagesCount: 3,
            useUserImages: false,
            userImages: []
        };

        // Disable button and show loading state
        $button.prop('disabled', true).html('Creating Interview <span class="seo-postifier-spinner"></span>');
        $status.removeClass('success error warning').addClass('info').show()
            .text('Step 1/2: Creating post interview...');

        // Create interview via AJAX
        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_create_interview',
                nonce: seoPostifierData.nonce,
                interview_data: formData
            },
            success: function(response) {
                if (response.success) {
                    currentInterviewData = response.data.interview;
                    $status.removeClass('info error').addClass('success')
                        .html('<strong>Interview created!</strong> ID: ' + currentInterviewData._id);

                    // Now generate the script text
                    generateScriptText(currentInterviewData);
                } else {
                    $status.removeClass('info success').addClass('error')
                        .html('<strong>Error creating interview:</strong> ' + response.data.message);
                    $button.prop('disabled', false).text('Create Interview & Generate Script');
                }
            },
            error: function(xhr, status, error) {
                $status.removeClass('info success').addClass('error')
                    .html('<strong>Request Failed!</strong> ' + error);
                $button.prop('disabled', false).text('Create Interview & Generate Script');
            }
        });
    });

    /**
     * Generate Script Text
     */
    function generateScriptText(interviewData) {
        const $button = $('#post-interview-form button[type="submit"]');
        const $status = $('#interview-status');

        $status.removeClass('success error').addClass('info')
            .text('Step 2/2: Generating SEO script text...');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_generate_script_text',
                nonce: seoPostifierData.nonce,
                interview_id: interviewData._id
            },
            success: function(response) {
                if (response.success) {
                    currentInterviewData = response.data.interview;
                    $status.removeClass('info error').addClass('success')
                        .html('<strong>Script generated successfully!</strong>');

                    // Show the script review section
                    $('#script-content').val(currentInterviewData.generatedScriptText);
                    $('#script-review-section').show();

                    // Scroll to the script review section
                    $('html, body').animate({
                        scrollTop: $('#script-review-section').offset().top - 50
                    }, 500);

                    $button.prop('disabled', false).text('Create Interview & Generate Script');
                } else {
                    $status.removeClass('info success').addClass('error')
                        .html('<strong>Error generating script:</strong> ' + response.data.message);
                    $button.prop('disabled', false).text('Create Interview & Generate Script');
                }
            },
            error: function(xhr, status, error) {
                $status.removeClass('info success').addClass('error')
                    .html('<strong>Script generation failed!</strong> ' + error);
                $button.prop('disabled', false).text('Create Interview & Generate Script');
            }
        });
    }

    /**
     * Regenerate Script Text
     */
    $('#regenerate-script').on('click', function() {
        if (!currentInterviewData) {
            alert('No interview data available');
            return;
        }

        const $button = $(this);
        const $status = $('#script-review-status');

        $button.prop('disabled', true).html('Regenerating <span class="seo-postifier-spinner"></span>');
        $status.removeClass('success error').addClass('info').show()
            .text('Regenerating script text...');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_generate_script_text',
                nonce: seoPostifierData.nonce,
                interview_id: currentInterviewData._id
            },
            success: function(response) {
                if (response.success) {
                    currentInterviewData = response.data.interview;
                    $('#script-content').val(currentInterviewData.generatedScriptText);
                    $status.removeClass('info error').addClass('success')
                        .html('<strong>Script regenerated successfully!</strong>');
                } else {
                    $status.removeClass('info success').addClass('error')
                        .html('<strong>Error regenerating script:</strong> ' + response.data.message);
                }
                $button.prop('disabled', false).text('Regenerate Script');
            },
            error: function(xhr, status, error) {
                $status.removeClass('info success').addClass('error')
                    .html('<strong>Regeneration failed!</strong> ' + error);
                $button.prop('disabled', false).text('Regenerate Script');
            }
        });
    });

    /**
     * Approve Script and Generate Formatted Script
     */
    $('#approve-script').on('click', function() {
        if (!currentInterviewData) {
            alert('No interview data available');
            return;
        }

        const $button = $(this);
        const $status = $('#script-review-status');
        const updatedScript = $('#script-content').val();

        $button.prop('disabled', true).html('Processing <span class="seo-postifier-spinner"></span>');
        $status.removeClass('success error warning').addClass('info').show()
            .text('Step 1/3: Updating script text...');

        // First, update the script text if it was edited
        if (updatedScript !== currentInterviewData.generatedScriptText) {
            $.ajax({
                url: seoPostifierData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'seo_postifier_update_script_text',
                    nonce: seoPostifierData.nonce,
                    interview_id: currentInterviewData._id,
                    script_text: updatedScript
                },
                success: function(response) {
                    if (response.success) {
                        currentInterviewData.generatedScriptText = updatedScript;
                        generateScriptDefinition();
                    } else {
                        $status.removeClass('info success').addClass('error')
                            .html('<strong>Error updating script:</strong> ' + response.data.message);
                        $button.prop('disabled', false).text('Approve & Generate Formatted Script');
                    }
                },
                error: function(xhr, status, error) {
                    $status.removeClass('info success').addClass('error')
                        .html('<strong>Update failed!</strong> ' + error);
                    $button.prop('disabled', false).text('Approve & Generate Formatted Script');
                }
            });
        } else {
            generateScriptDefinition();
        }
    });

    /**
     * Generate Script Definition (JSON format)
     */
    function generateScriptDefinition() {
        const $button = $('#approve-script');
        const $status = $('#script-review-status');

        $status.removeClass('success error').addClass('info')
            .text('Step 2/3: Generating formatted script definition...');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_generate_script_definition',
                nonce: seoPostifierData.nonce,
                interview_id: currentInterviewData._id
            },
            success: function(response) {
                if (response.success) {
                    currentInterviewData = response.data.interview;
                    $status.removeClass('info error').addClass('info')
                        .html('Script formatted successfully! Generating post content...');

                    // Now generate the full post
                    generatePost();
                } else {
                    $status.removeClass('info success').addClass('error')
                        .html('<strong>Error formatting script:</strong> ' + response.data.message);
                    $button.prop('disabled', false).text('Approve & Generate Formatted Script');
                }
            },
            error: function(xhr, status, error) {
                $status.removeClass('info success').addClass('error')
                    .html('<strong>Formatting failed!</strong> ' + error);
                $button.prop('disabled', false).text('Approve & Generate Formatted Script');
            }
        });
    }

    /**
     * Generate Full Post Content
     */
    function generatePost() {
        const $button = $('#approve-script');
        const $status = $('#script-review-status');

        $status.removeClass('success error').addClass('info')
            .text('Step 3/3: Generating full post content (this may take a few minutes)...');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            timeout: 300000, // 5 minutes timeout for long generation
            data: {
                action: 'seo_postifier_generate_post',
                nonce: seoPostifierData.nonce,
                interview_id: currentInterviewData._id
            },
            success: function(response) {
                if (response.success) {
                    const post = response.data.post;
                    $status.removeClass('info error').addClass('success')
                        .html('<strong>Post generated successfully!</strong>');

                    // Display the post as markdown
                    displayPostAsMarkdown(post);

                    // Show the post preview section
                    $('#post-preview-section').show();

                    // Store the post data
                    $('#post-preview-section').data('post', post);

                    // Scroll to the post preview
                    $('html, body').animate({
                        scrollTop: $('#post-preview-section').offset().top - 50
                    }, 500);

                    $button.prop('disabled', false).text('Approve & Generate Formatted Script');
                } else {
                    $status.removeClass('info success').addClass('error')
                        .html('<strong>Error generating post:</strong> ' + response.data.message);
                    $button.prop('disabled', false).text('Approve & Generate Formatted Script');
                }
            },
            error: function(xhr, status, error) {
                $status.removeClass('info success').addClass('error')
                    .html('<strong>Post generation failed!</strong> ' + error);
                $button.prop('disabled', false).text('Approve & Generate Formatted Script');
            }
        });
    }

    /**
     * Display Post as Markdown
     */
    function displayPostAsMarkdown(post) {
        let markdown = '';

        // Add title
        if (post.title) {
            markdown += '# ' + post.title + '\n\n';
        }

        // Process blocks
        if (post.blocks && Array.isArray(post.blocks)) {
            post.blocks.forEach(function(block) {
                switch(block.type) {
                    case 'HEADING':
                        const level = block.data.level.replace('h', '');
                        markdown += '#'.repeat(parseInt(level)) + ' ' + block.data.title + '\n\n';
                        break;

                    case 'PARAGRAPH':
                        markdown += block.data.content + '\n\n';
                        break;

                    case 'IMAGE':
                        if (block.data.url) {
                            markdown += '![' + (block.data.alt || 'Image') + '](' + block.data.url + ')\n';
                            if (block.data.caption) {
                                markdown += '*' + block.data.caption + '*\n';
                            }
                            markdown += '\n';
                        }
                        break;

                    case 'FAQ':
                        if (block.data.questions && block.data.answers) {
                            markdown += '## FAQ\n\n';
                            block.data.questions.forEach(function(question, index) {
                                markdown += '**' + question + '**\n\n';
                                if (block.data.answers[index]) {
                                    markdown += block.data.answers[index] + '\n\n';
                                }
                            });
                        }
                        break;
                }
            });
        }

        // Convert markdown to HTML for preview
        const html = convertMarkdownToHtml(markdown);
        $('#post-content-preview').html(html);
    }

    /**
     * Simple Markdown to HTML converter
     */
    function convertMarkdownToHtml(markdown) {
        let html = markdown;

        // Convert headers
        html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
        html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

        // Convert bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convert italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Convert images
        html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;">');

        // Convert links
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

        // Convert paragraphs
        html = html.split('\n\n').map(function(paragraph) {
            if (paragraph.trim() && !paragraph.match(/^<[h|img|strong|em]/)) {
                return '<p>' + paragraph + '</p>';
            }
            return paragraph;
        }).join('\n');

        return html;
    }

    /**
     * Regenerate Post
     */
    $('#regenerate-post').on('click', function() {
        if (!currentInterviewData) {
            alert('No interview data available');
            return;
        }

        const $button = $(this);
        const $status = $('#wp-draft-status');

        $button.prop('disabled', true).html('Regenerating <span class="seo-postifier-spinner"></span>');
        $status.removeClass('success error').addClass('info').show()
            .text('Regenerating post content...');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            timeout: 300000, // 5 minutes timeout
            data: {
                action: 'seo_postifier_generate_post',
                nonce: seoPostifierData.nonce,
                interview_id: currentInterviewData._id
            },
            success: function(response) {
                if (response.success) {
                    const post = response.data.post;
                    $status.removeClass('info error').addClass('success')
                        .html('<strong>Post regenerated successfully!</strong>');

                    // Update the display
                    displayPostAsMarkdown(post);

                    // Store the new post data
                    $('#post-preview-section').data('post', post);
                } else {
                    $status.removeClass('info success').addClass('error')
                        .html('<strong>Error regenerating post:</strong> ' + response.data.message);
                }
                $button.prop('disabled', false).text('Regenerate Post');
            },
            error: function(xhr, status, error) {
                $status.removeClass('info success').addClass('error')
                    .html('<strong>Regeneration failed!</strong> ' + error);
                $button.prop('disabled', false).text('Regenerate Post');
            }
        });
    });

    /**
     * Create WordPress Draft
     */
    $('#create-wp-draft').on('click', function() {
        const post = $('#post-preview-section').data('post');
        if (!post) {
            alert('No post data available');
            return;
        }

        const $button = $(this);
        const $status = $('#wp-draft-status');

        $button.prop('disabled', true).html('Creating Draft <span class="seo-postifier-spinner"></span>');
        $status.removeClass('success error').addClass('info').show()
            .text('Creating WordPress draft...');

        $.ajax({
            url: seoPostifierData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'seo_postifier_create_wp_draft',
                nonce: seoPostifierData.nonce,
                post_data: post
            },
            success: function(response) {
                if (response.success) {
                    const wpPost = response.data.post;
                    $status.removeClass('info error').addClass('success')
                        .html('<strong>Draft created successfully!</strong> ' +
                              '<a href="' + wpPost.edit_link + '" target="_blank">Edit Post</a> | ' +
                              '<a href="' + wpPost.preview_link + '" target="_blank">Preview Post</a>');
                } else {
                    $status.removeClass('info success').addClass('error')
                        .html('<strong>Error creating draft:</strong> ' + response.data.message);
                }
                $button.prop('disabled', false).text('Create WordPress Draft');
            },
            error: function(xhr, status, error) {
                $status.removeClass('info success').addClass('error')
                    .html('<strong>Draft creation failed!</strong> ' + error);
                $button.prop('disabled', false).text('Create WordPress Draft');
            }
        });
    });
});