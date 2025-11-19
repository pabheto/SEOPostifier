/**
 * API Handler Module
 * Handles all AJAX communications with WordPress backend
 */

const APIHandler = (function ($) {
  "use strict";

  /**
   * Make AJAX request to WordPress
   */
  function makeRequest(action, data = {}, timeout = 60000) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: seoPostifierData.ajaxUrl,
        type: "POST",
        timeout: timeout,
        data: {
          action: action,
          nonce: seoPostifierData.nonce,
          ...data,
        },
        success: function (response) {
          if (response.success) {
            resolve(response.data);
          } else {
            reject({
              type: "api_error",
              message: response.data?.message || "Request failed",
              data: response.data,
            });
          }
        },
        error: function (xhr, status, error) {
          reject({
            type: "network_error",
            message: error || "Network request failed",
            status: status,
            statusCode: xhr.status,
          });
        },
      });
    });
  }

  /**
   * Test backend connection
   */
  function testConnection() {
    return makeRequest("seo_postifier_test_connection");
  }

  /**
   * Create post interview
   */
  function createInterview(interviewData) {
    return makeRequest(
      "seo_postifier_create_interview",
      { interview_data: interviewData },
      30000
    );
  }

  /**
   * Generate script text from interview
   */
  function generateScriptText(interviewId) {
    return makeRequest(
      "seo_postifier_generate_script_text",
      { interview_id: interviewId },
      120000 // 2 minutes
    );
  }

  /**
   * Update script text
   */
  function updateScriptText(interviewId, scriptText) {
    return makeRequest("seo_postifier_update_script_text", {
      interview_id: interviewId,
      script_text: scriptText,
    });
  }

  /**
   * Generate script definition (formatted JSON)
   */
  function generateScriptDefinition(interviewId) {
    return makeRequest(
      "seo_postifier_generate_script_definition",
      { interview_id: interviewId },
      120000 // 2 minutes
    );
  }

  /**
   * Generate full post content
   */
  function generatePost(interviewId) {
    return makeRequest(
      "seo_postifier_generate_post",
      { interview_id: interviewId },
      300000 // 5 minutes
    );
  }

  /**
   * Create WordPress draft from post data
   */
  function createWordPressDraft(postData) {
    return makeRequest("seo_postifier_create_wp_draft", {
      post_data: postData,
    });
  }

  // Public API
  return {
    testConnection,
    createInterview,
    generateScriptText,
    updateScriptText,
    generateScriptDefinition,
    generatePost,
    createWordPressDraft,
  };
})(jQuery);

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = APIHandler;
}
