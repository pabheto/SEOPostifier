/**
 * Workflow Orchestrator Module
 * Orchestrates the multi-step workflow for post creation
 */

const WorkflowOrchestrator = (function ($) {
  "use strict";

  /**
   * Start the complete workflow from interview creation
   */
  async function startWorkflow(formData) {
    try {
      // Step 1: Create interview
      StateManager.setState(StateManager.WorkflowState.CREATING_INTERVIEW);
      UIController.showInterviewProgress(
        "Step 1/2",
        "Creating post interview..."
      );
      UIController.setButtonLoading(
        UIController.elements.interviewSubmitBtn,
        true,
        "Creating Interview"
      );

      const interviewResponse = await APIHandler.createInterview(formData);
      const interview = interviewResponse.interview;

      if (!interview || !interview.interviewId) {
        throw new Error("Invalid interview response from server");
      }

      StateManager.setInterviewData(interview);
      UIController.showInterviewSuccess(interview.interviewId);

      // Step 2: Generate script text automatically
      await generateScriptText(interview.interviewId);
    } catch (error) {
      handleWorkflowError(error, "creating interview");
    }
  }

  /**
   * Generate script text from interview
   */
  async function generateScriptText(interviewId) {
    try {
      StateManager.setState(StateManager.WorkflowState.GENERATING_SCRIPT_TEXT);
      UIController.showInterviewProgress(
        "Step 2/2",
        "Generating SEO script text..."
      );

      const scriptResponse = await APIHandler.generateScriptText(interviewId);
      const interview = scriptResponse.interview;

      if (!interview || !interview.generatedScriptText) {
        throw new Error("Script text not generated properly");
      }

      // Update state with complete interview data including script text
      StateManager.setInterviewData(interview);

      // Show the script for review
      UIController.showScriptReview(interview.generatedScriptText);
    } catch (error) {
      handleWorkflowError(error, "generating script text");
    }
  }

  /**
   * Approve script and continue to generate formatted definition
   */
  async function approveAndContinue(editedScriptText) {
    try {
      const interview = StateManager.getInterviewData();
      if (!interview) {
        throw new Error("No interview data available");
      }

      UIController.setButtonLoading(
        UIController.elements.approveScriptBtn,
        true,
        "Processing"
      );

      // Step 1: Update script text if it was edited
      if (editedScriptText !== interview.generatedScriptText) {
        StateManager.setState(StateManager.WorkflowState.UPDATING_SCRIPT_TEXT);
        UIController.showScriptReviewProgress(
          "Step 1/3",
          "Updating script text..."
        );

        await APIHandler.updateScriptText(
          interview.interviewId,
          editedScriptText
        );

        // Update local interview data with edited text
        interview.generatedScriptText = editedScriptText;
        StateManager.setInterviewData(interview);
      }

      // Step 2: Generate script definition
      await generateScriptDefinition(interview.interviewId);

      // Step 3: Generate post content (automatically after definition)
      await generatePost(interview.interviewId);
    } catch (error) {
      handleWorkflowError(error, "approving script");
    }
  }

  /**
   * Generate script definition (JSON format)
   */
  async function generateScriptDefinition(interviewId) {
    try {
      StateManager.setState(
        StateManager.WorkflowState.GENERATING_SCRIPT_DEFINITION
      );
      UIController.showScriptReviewProgress(
        "Step 2/3",
        "Generating formatted script definition..."
      );

      const definitionResponse = await APIHandler.generateScriptDefinition(
        interviewId
      );
      const interview = definitionResponse.interview;

      if (!interview || !interview.generatedScriptDefinition) {
        throw new Error("Script definition not generated properly");
      }

      // Update state with complete interview data including definition
      StateManager.setInterviewData(interview);
    } catch (error) {
      handleWorkflowError(error, "generating script definition");
    }
  }

  /**
   * Generate full post content
   */
  async function generatePost(interviewId) {
    try {
      StateManager.setState(StateManager.WorkflowState.GENERATING_POST);
      UIController.showScriptReviewProgress(
        "Step 3/3",
        "Generating full post content (this may take a few minutes)..."
      );

      const postResponse = await APIHandler.generatePost(interviewId);
      const post = postResponse.post;

      if (!post || !post.title) {
        throw new Error("Post not generated properly");
      }

      // Update state with post data
      StateManager.setPostData(post);

      // Show post preview
      UIController.showPostPreview(post);
    } catch (error) {
      handleWorkflowError(error, "generating post");
    }
  }

  /**
   * Regenerate script text
   */
  async function regenerateScript() {
    try {
      const interview = StateManager.getInterviewData();
      if (!interview) {
        throw new Error("No interview data available");
      }

      UIController.setButtonLoading(
        UIController.elements.regenerateScriptBtn,
        true,
        "Regenerating"
      );
      UIController.showScriptReviewProgress(
        "Progress",
        "Regenerating script text..."
      );

      await generateScriptText(interview.interviewId);

      UIController.setButtonLoading(
        UIController.elements.regenerateScriptBtn,
        false
      );
    } catch (error) {
      handleWorkflowError(error, "regenerating script");
      UIController.setButtonLoading(
        UIController.elements.regenerateScriptBtn,
        false
      );
    }
  }

  /**
   * Regenerate post content
   */
  async function regeneratePost() {
    try {
      const interview = StateManager.getInterviewData();
      if (!interview) {
        throw new Error("No interview data available");
      }

      UIController.setButtonLoading(
        UIController.elements.regeneratePostBtn,
        true,
        "Regenerating"
      );
      UIController.showStatus(
        UIController.elements.draftStatus,
        "info",
        "Regenerating post content..."
      );

      await generatePost(interview.interviewId);

      UIController.setButtonLoading(
        UIController.elements.regeneratePostBtn,
        false
      );
    } catch (error) {
      handleWorkflowError(error, "regenerating post");
      UIController.setButtonLoading(
        UIController.elements.regeneratePostBtn,
        false
      );
    }
  }

  /**
   * Create WordPress draft from generated post
   */
  async function createWordPressDraft() {
    try {
      const post = StateManager.getPostData();
      if (!post) {
        throw new Error("No post data available");
      }

      UIController.setButtonLoading(
        UIController.elements.createDraftBtn,
        true,
        "Creating Draft"
      );
      UIController.showStatus(
        UIController.elements.draftStatus,
        "info",
        "Creating WordPress draft..."
      );

      const draftResponse = await APIHandler.createWordPressDraft(post);
      const wpPost = draftResponse.post;

      UIController.showDraftCreated(wpPost);
    } catch (error) {
      handleWorkflowError(error, "creating WordPress draft");
    }
  }

  /**
   * Handle workflow errors
   */
  function handleWorkflowError(error, context) {
    console.error(`Error ${context}:`, error);

    const errorMessage =
      error.message || error.error || "An unexpected error occurred";

    StateManager.setError(errorMessage, { context, error });

    // Show appropriate error message in UI
    if (
      context.includes("interview") ||
      context.includes("script text") ||
      context.includes("generating")
    ) {
      if (StateManager.getInterviewData()) {
        UIController.showScriptReviewError(errorMessage);
      } else {
        UIController.showInterviewError(errorMessage);
      }
    } else if (context.includes("post") || context.includes("draft")) {
      UIController.showDraftError(errorMessage);
    }
  }

  /**
   * Test backend connection
   */
  async function testConnection() {
    try {
      UIController.setButtonLoading(
        UIController.elements.testConnectionBtn,
        true,
        "Testing"
      );
      UIController.showStatus(
        UIController.elements.connectionStatus,
        "info",
        "Connecting to backend..."
      );

      const result = await APIHandler.testConnection();

      UIController.showConnectionResult(true, result.message, result.data);
    } catch (error) {
      const errorMessage =
        error.message || "Failed to connect to backend server";
      UIController.showConnectionResult(false, errorMessage);
    } finally {
      UIController.setButtonLoading(
        UIController.elements.testConnectionBtn,
        false
      );
    }
  }

  // Public API
  return {
    startWorkflow,
    generateScriptText,
    approveAndContinue,
    regenerateScript,
    regeneratePost,
    createWordPressDraft,
    testConnection,
  };
})(jQuery);

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = WorkflowOrchestrator;
}
