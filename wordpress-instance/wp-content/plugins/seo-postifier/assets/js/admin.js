/**
 * SEO Postifier Admin
 * Main entry point for the plugin admin interface
 *
 * This file coordinates all modules to provide the complete workflow:
 * 1. Create post interview
 * 2. Generate script text
 * 3. Review and approve script
 * 4. Generate formatted script definition
 * 5. Generate full post content
 * 6. Create WordPress draft
 */

jQuery(document).ready(function ($) {
  "use strict";

  // Initialize UI Controller
  UIController.init();

  // Setup state change listener for debugging
  StateManager.onStateChange(function (newState, oldState, data) {
    console.log(`State changed: ${oldState} -> ${newState}`, data || "");
  });

  /**
   * Test Connection Button Handler
   */
  UIController.elements.testConnectionBtn.on("click", function () {
    WorkflowOrchestrator.testConnection();
  });

  /**
   * Interview Form Submission Handler
   */
  UIController.elements.interviewForm.on("submit", function (e) {
    e.preventDefault();

    // Prevent double submission
    if (StateManager.isBusy()) {
      console.warn("Operation already in progress");
      return;
    }

    // Get form data
    const formData = UIController.getInterviewFormData();

    // Start the workflow
    WorkflowOrchestrator.startWorkflow(formData);
  });

  /**
   * Regenerate Script Button Handler
   */
  UIController.elements.regenerateScriptBtn.on("click", function () {
    if (StateManager.isBusy()) {
      console.warn("Operation already in progress");
      return;
    }

    WorkflowOrchestrator.regenerateScript();
  });

  /**
   * Approve Script Button Handler
   */
  UIController.elements.approveScriptBtn.on("click", function () {
    if (StateManager.isBusy()) {
      console.warn("Operation already in progress");
      return;
    }

    const editedScriptText = UIController.getScriptText();
    WorkflowOrchestrator.approveAndContinue(editedScriptText);
  });

  /**
   * Regenerate Post Button Handler
   */
  UIController.elements.regeneratePostBtn.on("click", function () {
    if (StateManager.isBusy()) {
      console.warn("Operation already in progress");
      return;
    }

    WorkflowOrchestrator.regeneratePost();
  });

  /**
   * Create WordPress Draft Button Handler
   */
  UIController.elements.createDraftBtn.on("click", function () {
    if (StateManager.isBusy()) {
      console.warn("Operation already in progress");
      return;
    }

    WorkflowOrchestrator.createWordPressDraft();
  });

  /**
   * Keyboard shortcut support (optional enhancement)
   */
  $(document).on("keydown", function (e) {
    // Ctrl/Cmd + Enter to submit forms
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (
        UIController.elements.scriptReviewSection.is(":visible") &&
        !StateManager.isBusy()
      ) {
        // Approve script with keyboard shortcut
        UIController.elements.approveScriptBtn.click();
      }
    }
  });

  /**
   * Warn user before leaving page if work is in progress
   */
  $(window).on("beforeunload", function (e) {
    if (StateManager.isBusy()) {
      const message =
        "An operation is still in progress. Are you sure you want to leave?";
      e.returnValue = message;
      return message;
    }
  });

  // Log initialization
  console.log("SEO Postifier Admin initialized successfully");
  console.log("Backend URL:", seoPostifierData.backendUrl);
});
