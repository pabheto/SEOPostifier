# Autoblogger Plugin - Unification and Bug Fix Update

## Date: December 31, 2025

## Issues Fixed

### 1. Post ID Retrieval Error ✅

**Problem:**

- After post generation, the WordPress plugin displayed: "Post generated but could not retrieve post ID. Please check your drafts list."
- The plugin was looking for `interview.postId` but the backend returns `interview.associatedPostId`

**Solution:**

- Updated `tab-create-script.php` to check for `interview.associatedPostId` instead of `interview.postId`
- Updated `tab-view-script.php` with the same fix
- Added better error logging to help debug future issues

**Files Changed:**

- `templates/tab-create-script.php` (line ~1254)
- `templates/tab-view-script.php` (line ~1080)

### 2. Unified Generation Screen ✅

**Problem:**

- There were two separate flows for creating and editing drafts:
  - `tab-create-script.php` - for creating new drafts
  - `tab-view-script.php` - for viewing/editing existing drafts
- This created a confusing user experience with different UIs for similar tasks

**Solution:**

- Unified both flows to use `tab-create-script.php` for both creating AND editing
- The create script already had logic to detect edit mode (via `interviewId` parameter)
- Added automatic data loading when in edit mode
- Updated the "View" button in drafts list to say "Edit & Generate" and point to edit-script tab
- Added redirect from view-script to edit-script for backward compatibility
- Both create and edit modes now show the suggestions step for a consistent experience

**Files Changed:**

- `templates/tab-scripts-list.php` - Changed "View" button to "Edit & Generate" linking to edit-script
- `templates/admin-page-wrapper.php` - Added redirect from view-script to edit-script
- `templates/tab-create-script.php` - Added interview data loading for edit mode

## New Features

### Edit Mode Data Loading

When a user clicks "Edit & Generate" on an existing draft:

1. The unified form loads with all the previous settings
2. User can modify any settings as needed
3. Suggestions are shown (same experience as create mode)
4. Generation proceeds with updated settings

### Backward Compatibility

- Old links to `view-script` tab automatically redirect to `edit-script`
- The `tab-view-script.php` file is kept for compatibility but no longer used

## User Experience Improvements

1. **Consistent Interface**: Same form and flow for both creating and editing drafts
2. **Better Error Messages**: More descriptive error messages with console logging for debugging
3. **Streamlined Navigation**: Single "Edit & Generate" button instead of separate View/Edit actions
4. **Preserved Data**: When editing, all previous settings are loaded and can be modified

## Testing Recommendations

1. Create a new draft and verify generation completes successfully
2. Edit an existing draft and verify:
   - All settings load correctly
   - Suggestions are shown
   - Generation completes with updated settings
   - WordPress draft is created successfully
3. Verify old bookmarks to view-script redirect properly
4. Test with different interview configurations (with/without images, links, etc.)

## Breaking Changes

None - the changes are backward compatible.

## Notes

- The `tab-view-script.php` file can be removed in a future version once all users have updated
- Consider adding a migration script to update any saved bookmarks/links
