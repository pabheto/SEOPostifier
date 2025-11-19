/**
 * UI Controller Module
 * Manages all UI updates and user interactions
 */

const UIController = (function ($) {
  "use strict";

  // UI Elements cache
  const elements = {
    // Connection
    testConnectionBtn: null,
    connectionStatus: null,

    // Interview form
    interviewForm: null,
    interviewSubmitBtn: null,
    interviewStatus: null,

    // Script review
    scriptReviewSection: null,
    scriptContent: null,
    approveScriptBtn: null,
    regenerateScriptBtn: null,
    scriptReviewStatus: null,

    // Post preview
    postPreviewSection: null,
    postContentPreview: null,
    createDraftBtn: null,
    regeneratePostBtn: null,
    draftStatus: null,
  };

  /**
   * Initialize UI elements cache
   */
  function init() {
    // Connection elements
    elements.testConnectionBtn = $("#test-connection");
    elements.connectionStatus = $("#connection-status");

    // Interview form elements
    elements.interviewForm = $("#post-interview-form");
    elements.interviewSubmitBtn = elements.interviewForm.find(
      'button[type="submit"]'
    );
    elements.interviewStatus = $("#interview-status");

    // Script review elements
    elements.scriptReviewSection = $("#script-review-section");
    elements.scriptContent = $("#script-content");
    elements.approveScriptBtn = $("#approve-script");
    elements.regenerateScriptBtn = $("#regenerate-script");
    elements.scriptReviewStatus = $("#script-review-status");

    // Post preview elements
    elements.postPreviewSection = $("#post-preview-section");
    elements.postContentPreview = $("#post-content-preview");
    elements.createDraftBtn = $("#create-wp-draft");
    elements.regeneratePostBtn = $("#regenerate-post");
    elements.draftStatus = $("#wp-draft-status");

    // Setup conditional field visibility
    setupConditionalFields();
  }

  /**
   * Setup conditional field visibility toggles
   */
  function setupConditionalFields() {
    $("#mentions-brand").on("change", function () {
      $(".brand-fields").toggle($(this).is(":checked"));
    });

    $("#include-internal-links").on("change", function () {
      $(".internal-links-fields").toggle($(this).is(":checked"));
    });

    $("#include-external-links").on("change", function () {
      $(".external-links-fields").toggle($(this).is(":checked"));
    });
  }

  /**
   * Show status message
   */
  function showStatus($element, type, message, dismissible = false) {
    $element
      .removeClass("info success error warning")
      .addClass(type)
      .html(message)
      .show();

    if (dismissible) {
      setTimeout(() => {
        $element.fadeOut();
      }, 5000);
    }
  }

  /**
   * Set button loading state
   */
  function setButtonLoading($button, loading, loadingText = "Processing") {
    if (loading) {
      $button
        .prop("disabled", true)
        .data("original-text", $button.html())
        .html(`${loadingText} <span class="seo-postifier-spinner"></span>`);
    } else {
      const originalText = $button.data("original-text") || $button.text();
      $button.prop("disabled", false).html(originalText);
    }
  }

  /**
   * Show interview creation progress
   */
  function showInterviewProgress(step, message) {
    showStatus(elements.interviewStatus, "info", `${step}: ${message}`);
  }

  /**
   * Show interview success
   */
  function showInterviewSuccess(interviewId) {
    showStatus(
      elements.interviewStatus,
      "success",
      `<strong>Interview created!</strong> ID: ${interviewId}`
    );
  }

  /**
   * Show interview error
   */
  function showInterviewError(errorMessage) {
    showStatus(
      elements.interviewStatus,
      "error",
      `<strong>Error:</strong> ${errorMessage}`
    );
    setButtonLoading(elements.interviewSubmitBtn, false);
  }

  /**
   * Show script text ready for review
   */
  function showScriptReview(scriptText) {
    elements.scriptContent.val(scriptText);
    elements.scriptReviewSection.show();

    // Scroll to script review section
    $("html, body").animate(
      {
        scrollTop: elements.scriptReviewSection.offset().top - 50,
      },
      500
    );

    showStatus(
      elements.interviewStatus,
      "success",
      "<strong>Script generated successfully!</strong> Review and approve below."
    );
    setButtonLoading(elements.interviewSubmitBtn, false);
  }

  /**
   * Show script review progress
   */
  function showScriptReviewProgress(step, message) {
    showStatus(elements.scriptReviewStatus, "info", `${step}: ${message}`);
  }

  /**
   * Show script review error
   */
  function showScriptReviewError(errorMessage) {
    showStatus(
      elements.scriptReviewStatus,
      "error",
      `<strong>Error:</strong> ${errorMessage}`
    );
    setButtonLoading(elements.approveScriptBtn, false);
    setButtonLoading(elements.regenerateScriptBtn, false);
  }

  /**
   * Show post preview
   */
  function showPostPreview(post) {
    const html = convertPostToHTML(post);
    elements.postContentPreview.html(html);
    elements.postPreviewSection.show();

    // Scroll to post preview section
    $("html, body").animate(
      {
        scrollTop: elements.postPreviewSection.offset().top - 50,
      },
      500
    );

    showStatus(
      elements.scriptReviewStatus,
      "success",
      "<strong>Post generated successfully!</strong> Review below."
    );
    setButtonLoading(elements.approveScriptBtn, false);
  }

  /**
   * Convert post data to HTML for preview
   */
  function convertPostToHTML(post) {
    let html = "";

    // Add title
    if (post.title) {
      html += `<h1>${escapeHtml(post.title)}</h1>`;
    }

    // Process blocks
    if (post.blocks && Array.isArray(post.blocks)) {
      post.blocks.forEach(function (block) {
        switch (block.type) {
          case "heading":
            const level = block.level.replace("h", "");
            html += `<h${level}>${escapeHtml(block.title)}</h${level}>`;
            break;

          case "paragraph":
            html += `<p>${block.content}</p>`;
            break;

          case "image":
            if (block.image && block.image.sourceValue) {
              html += `<figure>
                <img src="${escapeHtml(
                  block.image.sourceValue
                )}" alt="${escapeHtml(
                block.image.suggestedAlt || "Image"
              )}" style="max-width: 100%;">
                ${
                  block.image.notes
                    ? `<figcaption><em>${escapeHtml(
                        block.image.notes
                      )}</em></figcaption>`
                    : ""
                }
              </figure>`;
            }
            break;

          case "faq":
            if (block.questions && block.answers) {
              html += '<div class="faq-section"><h2>FAQ</h2>';
              block.questions.forEach(function (question, index) {
                html += `<div class="faq-item">
                  <h3>${escapeHtml(question)}</h3>
                  ${
                    block.answers[index] ? `<p>${block.answers[index]}</p>` : ""
                  }
                </div>`;
              });
              html += "</div>";
            }
            break;
        }
      });
    }

    return html;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show WordPress draft created
   */
  function showDraftCreated(wpPost) {
    showStatus(
      elements.draftStatus,
      "success",
      `<strong>Draft created successfully!</strong> 
      <a href="${wpPost.edit_link}" target="_blank">Edit Post</a> | 
      <a href="${wpPost.preview_link}" target="_blank">Preview Post</a>`
    );
    setButtonLoading(elements.createDraftBtn, false);
  }

  /**
   * Show draft creation error
   */
  function showDraftError(errorMessage) {
    showStatus(
      elements.draftStatus,
      "error",
      `<strong>Error:</strong> ${errorMessage}`
    );
    setButtonLoading(elements.createDraftBtn, false);
  }

  /**
   * Get form data from interview form
   */
  function getInterviewFormData() {
    const formData = {
      mainKeyword: $("#main-keyword").val(),
      secondaryKeywords: $("#secondary-keywords")
        .val()
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      keywordDensityTarget: parseFloat($("#keyword-density").val()),
      userDescription: $("#user-description").val(),
      language: $("#language").val(),
      searchIntent: $("#search-intent").val(),
      targetAudience: $("#target-audience").val(),
      toneOfVoice: $("#tone-of-voice").val(),
      minWordCount: parseInt($("#min-word-count").val()),
      maxWordCount: parseInt($("#max-word-count").val()),
      needsFaqSection: $("#needs-faq").is(":checked"),
      mentionsBrand: $("#mentions-brand").is(":checked"),
      includeInternalLinks: $("#include-internal-links").is(":checked"),
      includeExternalLinks: $("#include-external-links").is(":checked"),
      maxInternalLinks: parseInt($("#max-internal-links").val()) || 3,
      maxExternalLinks: parseInt($("#max-external-links").val()) || 2,
      notesForWriter: $("#notes-for-writer").val() || "",
    };

    // Add brand fields if enabled
    if (formData.mentionsBrand) {
      formData.brandName = $("#brand-name").val();
      formData.brandDescription = $("#brand-description").val();
    }

    // Add link URLs if enabled
    if (formData.includeInternalLinks) {
      const internalLinks = $("#internal-links-to-use").val();
      if (internalLinks) {
        formData.internalLinksToUse = internalLinks
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s);
      }
    }

    if (formData.includeExternalLinks) {
      const externalLinks = $("#external-links-to-use").val();
      if (externalLinks) {
        formData.externalLinksToUse = externalLinks
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s);
      }
    }

    // Default values for required fields not in form
    formData.projectId = "wordpress-default";
    formData.userId = "wordpress-user";
    formData.imagesConfig = {
      aiImagesCount: 3,
      useUserImages: false,
      userImages: [],
    };

    return formData;
  }

  /**
   * Get edited script text
   */
  function getScriptText() {
    return elements.scriptContent.val();
  }

  /**
   * Show connection test result
   */
  function showConnectionResult(success, message, data = null) {
    if (success) {
      showStatus(
        elements.connectionStatus,
        "success",
        `<strong>Success!</strong> ${message}${
          data ? `<br/>Response: ${JSON.stringify(data)}` : ""
        }`,
        true
      );
    } else {
      showStatus(
        elements.connectionStatus,
        "error",
        `<strong>Error!</strong> ${message}`
      );
    }
  }

  // Public API
  return {
    init,
    elements,
    showStatus,
    setButtonLoading,
    showInterviewProgress,
    showInterviewSuccess,
    showInterviewError,
    showScriptReview,
    showScriptReviewProgress,
    showScriptReviewError,
    showPostPreview,
    showDraftCreated,
    showDraftError,
    getInterviewFormData,
    getScriptText,
    showConnectionResult,
  };
})(jQuery);

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = UIController;
}
