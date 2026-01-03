# Migration Guide - Unified Generation Screen

## Overview of Changes

This update unifies the creation and editing flows into a single, consistent experience.

## Before (Old Flow)

```
My Drafts List
├─ Create New Draft → tab-create-script.php
│  ├─ Fill form
│  ├─ See suggestions
│  ├─ Generate post
│  └─ Create WP draft
│
└─ View Existing Draft → tab-view-script.php (SEPARATE INTERFACE)
   ├─ Different form layout
   ├─ Update settings
   ├─ Generate post (no suggestions)
   └─ Create WP draft
```

## After (New Unified Flow)

```
My Drafts List
├─ Create New Draft → tab-create-script.php
│  ├─ Fill form
│  ├─ See suggestions
│  ├─ Generate post
│  └─ Create WP draft
│
└─ Edit & Generate → tab-create-script.php (SAME INTERFACE)
   ├─ Form pre-filled with existing data
   ├─ Modify settings as needed
   ├─ See suggestions
   ├─ Generate post
   └─ Create WP draft
```

## Key Changes

### 1. Unified Button Text

- **Old**: "View" button in drafts list
- **New**: "Edit & Generate" button in drafts list

### 2. Consistent Experience

Both create and edit now:

- Use the same form interface
- Show the suggestions step
- Have the same progress indicators
- Create WordPress drafts the same way

### 3. Data Loading

When editing an existing draft:

- All previous settings are automatically loaded
- Images configuration is restored
- Link settings are preserved
- Brand mentions are pre-filled

### 4. Backward Compatibility

- Old `view-script` URLs redirect to `edit-script`
- No data is lost in the transition
- All existing drafts continue to work

## User Flow Examples

### Creating a New Draft

1. Click "Create New Draft"
2. Fill in the form (Search Intent, Description, Settings)
3. Click "Create & Generate Post"
4. Choose a suggestion (or Auto)
5. Wait for generation
6. WordPress draft is created automatically
7. Redirected to WordPress editor

### Editing an Existing Draft

1. Click "Edit & Generate" on any draft
2. Form loads with all previous settings
3. Modify any settings as needed
4. Click "Update & Generate Post"
5. Choose a suggestion (or Auto)
6. Wait for generation
7. WordPress draft is created automatically
8. Redirected to WordPress editor

## Technical Details

### Post ID Resolution

The backend returns `associatedPostId` in the interview object. The plugin now correctly looks for this field when:

- Checking if a post has been generated
- Creating WordPress drafts
- Displaying post status

### Interview Data Structure

```javascript
{
  interviewId: "int_xxx",
  mainKeyword: "...",
  userDescription: "...",
  // ... other settings ...
  associatedPostId: "post_xxx",  // ← This is the key field
  imagesConfig: {
    aiImagesCount: -1,  // -1 = auto, 0 = disabled, >0 = custom count
    useUserImages: true,
    userImages: [...]
  }
}
```

## Troubleshooting

### "Failed to load interview data"

- Check browser console for detailed error messages
- Verify the interview exists in the database
- Ensure license key is valid and active

### "Post generated but could not retrieve post ID"

- This error should now be resolved
- If it still appears, check browser console for the interview object
- The console will log the full response for debugging

### Form Not Pre-Filling

- Ensure you're accessing via the "Edit & Generate" button
- Check that the `interviewId` parameter is in the URL
- Verify the interview has data in the database

## Migration Checklist

- ✅ Post ID retrieval fixed (associatedPostId)
- ✅ Unified form interface
- ✅ Edit mode data loading
- ✅ Suggestions shown in both modes
- ✅ Backward compatibility redirect
- ✅ Consistent button labeling
- ✅ Error messages improved

## Future Enhancements

Consider these improvements for future versions:

1. Add a "Duplicate Draft" feature
2. Allow saving drafts without generating
3. Add draft templates/presets
4. Implement draft versioning
5. Add collaborative editing features
