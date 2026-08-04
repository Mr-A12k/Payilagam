# Profile Picture Upload & Rendering Implementation

This plan outlines the implementation for the user profile picture (avatar) upload feature and its global display across the application.

## Open Questions
- (None) The feature requirements are clear.

## Proposed Changes

### Backend

#### [MODIFY] [authRoutes.js](file:///d:/TaskPro/BackEnd/src/routes/authRoutes.js)
- Add `multer` configuration to handle file uploads, saving files to `process.env.RESOURCE_STORAGE_PATH/avatars`.
- Expose a new route `POST /api/auth/profile/avatar` wrapped in the `authenticate` middleware and `multer` upload handler.

#### [MODIFY] [authController.js](file:///d:/TaskPro/BackEnd/src/controllers/authController.js)
- Add an `uploadAvatar` function.
- It will read the uploaded file path, construct the relative URL (`/resources/avatars/filename.ext`), and call `authService.updateProfile` to save the `profileUrl` to the DB.

### Frontend

#### [MODIFY] [Avatar.jsx](file:///d:/TaskPro/FrontEnd/src/components/ui/Avatar.jsx)
- Update the `Avatar` component signature to accept `src` and `fallback` props directly.
- Under the hood, it will automatically render `<AvatarImage>` and `<AvatarFallback>`.
- If `src` is a relative path starting with `/resources/`, it will automatically prepend the backend base URL (extracted from `VITE_API_URL`) so that images load correctly.

#### [MODIFY] [Settings.jsx](file:///d:/TaskPro/FrontEnd/src/pages/Settings.jsx)
- Update the "Change Avatar" section to use an actual `<input type="file" />`.
- Implement `handleAvatarUpload` which uses `FormData` and Axios to `POST /api/auth/profile/avatar`.
- Dispatch `fetchProfile()` on success to globally update the user's avatar.

## Verification Plan

### Automated Tests
- No automated tests required for this feature.

### Manual Verification
1. Navigate to Settings as an authenticated user.
2. Click "Change Avatar" and upload an image (PNG/JPG).
3. Verify that the image is successfully uploaded, Redux state updates, and the avatar immediately appears in the settings page and the global sidebar header.
