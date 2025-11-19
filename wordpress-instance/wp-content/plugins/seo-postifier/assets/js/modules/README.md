# SEO Postifier JavaScript Modules

This directory contains modular JavaScript components that power the SEO Postifier WordPress plugin admin interface.

## Architecture Overview

The plugin follows a clean, modular architecture with clear separation of concerns:

```
┌─────────────────┐
│   admin.js      │  Main entry point, event binding
│  (Coordinator)  │
└────────┬────────┘
         │
         ├─────────────────────────────────────────┐
         │                                         │
         v                                         v
┌────────────────────┐                  ┌──────────────────┐
│ WorkflowOrchestrator│◄────────────────►│  StateManager    │
│  (Business Logic)  │                  │  (State Store)   │
└─────────┬──────────┘                  └──────────────────┘
          │
          ├────────────────┬────────────────┐
          │                │                │
          v                v                v
    ┌──────────┐    ┌─────────────┐  ┌──────────────┐
    │APIHandler│    │UIController │  │StateManager  │
    │ (API)    │    │    (UI)     │  │   (State)    │
    └──────────┘    └─────────────┘  └──────────────┘
```

## Modules

### 1. StateManager (`state-manager.js`)

**Purpose**: Centralized state management for the entire workflow.

**Responsibilities**:
- Maintains current workflow state (idle, creating, generating, etc.)
- Stores interview data, post data, and error information
- Provides state change notifications via listeners
- Validates state transitions
- Detects when operations are complete (script ready, post ready)

**Key Features**:
- Automatic state detection based on interview data
- State change listeners for reactive updates
- Error state management
- Busy state detection to prevent concurrent operations

**Public API**:
- `getState()` / `setState()`
- `getInterviewData()` / `setInterviewData()`
- `getPostData()` / `setPostData()`
- `onStateChange(callback)` - Subscribe to state changes
- `isBusy()` - Check if operation in progress
- `isScriptTextReady()` / `isPostReady()` - Check completion status

### 2. APIHandler (`api-handler.js`)

**Purpose**: Handles all AJAX communications with WordPress backend.

**Responsibilities**:
- Makes AJAX requests to WordPress AJAX handlers
- Returns Promises for async/await pattern
- Handles timeouts and errors uniformly
- Manages request/response transformation

**Key Features**:
- Promise-based API for clean async code
- Configurable timeouts per operation
- Automatic error type detection (network vs API errors)
- Proper nonce handling for WordPress security

**Public API**:
- `testConnection()` - Test backend connectivity
- `createInterview(data)` - Create new interview
- `generateScriptText(id)` - Generate SEO script text
- `updateScriptText(id, text)` - Update edited script
- `generateScriptDefinition(id)` - Generate JSON script definition
- `generatePost(id)` - Generate full post content
- `createWordPressDraft(post)` - Create WP draft post

### 3. UIController (`ui-controller.js`)

**Purpose**: Manages all UI updates and user interactions.

**Responsibilities**:
- Caches DOM element references
- Shows/hides UI sections based on workflow
- Displays status messages and errors
- Manages button loading states
- Converts post data to HTML preview
- Extracts form data

**Key Features**:
- Centralized UI element cache for performance
- Conditional field visibility management
- Automatic scroll-to-section on workflow steps
- HTML escaping for security
- Loading state management for buttons

**Public API**:
- `init()` - Initialize and cache UI elements
- `showStatus($el, type, message)` - Show status messages
- `setButtonLoading($btn, loading, text)` - Manage button states
- `showScriptReview(text)` - Display script for review
- `showPostPreview(post)` - Display generated post
- `getInterviewFormData()` - Extract form values
- `getScriptText()` - Get edited script text

### 4. WorkflowOrchestrator (`workflow-orchestrator.js`)

**Purpose**: Orchestrates the multi-step post creation workflow.

**Responsibilities**:
- Coordinates between StateManager, APIHandler, and UIController
- Implements business logic for the workflow
- Handles sequential async operations
- Manages error recovery and user feedback

**Key Features**:
- Automatic progression through workflow steps
- Intelligent error handling with context
- State updates coordinated with UI updates
- Validates data before proceeding to next step

**Public API**:
- `startWorkflow(formData)` - Begin complete workflow
- `generateScriptText(id)` - Generate script text step
- `approveAndContinue(text)` - Approve script and continue
- `regenerateScript()` - Regenerate script text
- `regeneratePost()` - Regenerate post content
- `createWordPressDraft()` - Create final WP draft
- `testConnection()` - Test backend connection

### 5. Main Admin (`admin.js`)

**Purpose**: Application entry point and event binding.

**Responsibilities**:
- Initialize all modules
- Bind UI event handlers
- Coordinate high-level user interactions
- Setup keyboard shortcuts
- Warn on page unload during operations

**Key Features**:
- Clean event delegation
- Keyboard shortcut support (Ctrl/Cmd + Enter)
- Prevents double submissions
- Warns before leaving during operations

## Workflow Flow

The plugin implements this workflow:

```
1. User fills form
   ↓
2. Create Interview (POST /posts-interviews/create)
   ↓
3. Generate Script Text (POST /posts-interviews/generate-script-text)
   ↓
4. User Reviews Script ← Script is editable
   ↓
5. User Approves Script
   ↓
6. Update Script Text (if edited) (POST /posts-interviews/update-script-text)
   ↓
7. Generate Script Definition (POST /posts-interviews/generate-script-definition)
   ↓
8. Generate Full Post (POST /posts-interviews/generate-post)
   ↓
9. User Reviews Post
   ↓
10. Create WordPress Draft (POST via WP AJAX)
```

## State Lifecycle

```
IDLE
  ↓ (form submit)
CREATING_INTERVIEW
  ↓ (interview created)
INTERVIEW_CREATED
  ↓ (auto-start script generation)
GENERATING_SCRIPT_TEXT
  ↓ (script generated)
SCRIPT_TEXT_READY ← User can review/edit
  ↓ (user approves)
UPDATING_SCRIPT_TEXT (if edited)
  ↓
GENERATING_SCRIPT_DEFINITION
  ↓
SCRIPT_DEFINITION_READY
  ↓ (auto-start post generation)
GENERATING_POST
  ↓ (post generated)
POST_READY ← User can review
  ↓ (user creates draft)
(Draft Created - can start new workflow)
```

## Error Handling

Errors are handled at multiple levels:

1. **API Level** (`APIHandler`): Network and HTTP errors
2. **Workflow Level** (`WorkflowOrchestrator`): Business logic errors
3. **State Level** (`StateManager`): State transition errors
4. **UI Level** (`UIController`): User-facing error display

All errors include:
- Error message
- Context (what operation failed)
- Timestamp
- Original error object (for debugging)

## Benefits of This Architecture

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Testability**: Modules can be tested independently
3. **Maintainability**: Changes are localized to specific modules
4. **Reusability**: Modules can be reused in other contexts
5. **Debuggability**: State changes are logged and traceable
6. **Scalability**: Easy to add new features or workflow steps
7. **Type Safety**: Clear interfaces between modules
8. **Error Handling**: Consistent error handling across the application

## Adding New Features

To add a new workflow step:

1. Add new state to `StateManager.WorkflowState`
2. Create API method in `APIHandler`
3. Add UI update method in `UIController`
4. Implement workflow logic in `WorkflowOrchestrator`
5. Bind events in `admin.js`

## Dependencies

- **jQuery**: DOM manipulation and AJAX (provided by WordPress)
- **WordPress AJAX API**: Backend communication
- **seoPostifierData**: Localized WordPress data (nonce, URLs)

## Browser Compatibility

The code uses modern JavaScript (ES6+) but avoids features not supported in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- DOM elements are cached in `UIController` to avoid repeated queries
- State changes trigger targeted UI updates, not full re-renders
- Promises used for async operations to avoid callback hell
- Long-running operations show loading indicators
- AJAX timeouts prevent hanging requests

## Security

- All user input is sanitized before sending to backend
- HTML output is escaped to prevent XSS
- WordPress nonces used for CSRF protection
- Sensitive operations require `manage_options` capability (server-side)

## Future Enhancements

Potential improvements:
- Add unit tests for each module
- Implement undo/redo for workflow steps
- Add progress indicators for long operations
- Implement auto-save for edited content
- Add workflow pause/resume functionality
- Support multiple concurrent workflows

