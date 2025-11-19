/**
 * State Manager Module
 * Manages the application state and interview workflow status
 */

const StateManager = (function () {
  "use strict";

  // Interview workflow states
  const WorkflowState = {
    IDLE: "idle",
    CREATING_INTERVIEW: "creating_interview",
    INTERVIEW_CREATED: "interview_created",
    GENERATING_SCRIPT_TEXT: "generating_script_text",
    SCRIPT_TEXT_READY: "script_text_ready",
    UPDATING_SCRIPT_TEXT: "updating_script_text",
    GENERATING_SCRIPT_DEFINITION: "generating_script_definition",
    SCRIPT_DEFINITION_READY: "script_definition_ready",
    GENERATING_POST: "generating_post",
    POST_READY: "post_ready",
    ERROR: "error",
  };

  // Private state
  let currentState = WorkflowState.IDLE;
  let interviewData = null;
  let postData = null;
  let errorInfo = null;

  // State change listeners
  const listeners = [];

  /**
   * Get current workflow state
   */
  function getState() {
    return currentState;
  }

  /**
   * Set new workflow state
   */
  function setState(newState, additionalData = {}) {
    const previousState = currentState;
    currentState = newState;

    // Notify all listeners
    listeners.forEach((listener) => {
      listener(newState, previousState, additionalData);
    });
  }

  /**
   * Register a state change listener
   */
  function onStateChange(callback) {
    listeners.push(callback);
    // Return unsubscribe function
    return function unsubscribe() {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current interview data
   */
  function getInterviewData() {
    return interviewData;
  }

  /**
   * Set interview data and update state accordingly
   */
  function setInterviewData(data) {
    if (!data) {
      interviewData = null;
      return;
    }

    interviewData = data;

    // Automatically determine state based on interview data
    if (data.generatedScriptText && data.generatedScriptDefinition) {
      setState(WorkflowState.SCRIPT_DEFINITION_READY);
    } else if (data.generatedScriptText) {
      setState(WorkflowState.SCRIPT_TEXT_READY);
    } else if (data.interviewId) {
      setState(WorkflowState.INTERVIEW_CREATED);
    }
  }

  /**
   * Get current post data
   */
  function getPostData() {
    return postData;
  }

  /**
   * Set post data
   */
  function setPostData(data) {
    postData = data;
    if (data) {
      setState(WorkflowState.POST_READY);
    }
  }

  /**
   * Set error state
   */
  function setError(error, context = {}) {
    errorInfo = {
      message: error,
      context: context,
      timestamp: Date.now(),
    };
    setState(WorkflowState.ERROR, { error: errorInfo });
  }

  /**
   * Clear error state
   */
  function clearError() {
    errorInfo = null;
    if (currentState === WorkflowState.ERROR) {
      setState(WorkflowState.IDLE);
    }
  }

  /**
   * Get error information
   */
  function getError() {
    return errorInfo;
  }

  /**
   * Reset all state
   */
  function reset() {
    currentState = WorkflowState.IDLE;
    interviewData = null;
    postData = null;
    errorInfo = null;
  }

  /**
   * Check if in a busy state (operation in progress)
   */
  function isBusy() {
    return [
      WorkflowState.CREATING_INTERVIEW,
      WorkflowState.GENERATING_SCRIPT_TEXT,
      WorkflowState.UPDATING_SCRIPT_TEXT,
      WorkflowState.GENERATING_SCRIPT_DEFINITION,
      WorkflowState.GENERATING_POST,
    ].includes(currentState);
  }

  /**
   * Check if script text is ready for review
   */
  function isScriptTextReady() {
    return (
      interviewData &&
      interviewData.generatedScriptText &&
      currentState === WorkflowState.SCRIPT_TEXT_READY
    );
  }

  /**
   * Check if post is ready for review
   */
  function isPostReady() {
    return postData && currentState === WorkflowState.POST_READY;
  }

  // Public API
  return {
    WorkflowState,
    getState,
    setState,
    onStateChange,
    getInterviewData,
    setInterviewData,
    getPostData,
    setPostData,
    setError,
    clearError,
    getError,
    reset,
    isBusy,
    isScriptTextReady,
    isPostReady,
  };
})();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = StateManager;
}
