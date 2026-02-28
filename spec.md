# SADIYA Collection

## Current State
- Email-based auth with login/signup in AuthModal (no forgot password)
- ProfilePage has personal info form but no change password section
- AdminSettings has a working Admin Security (change password) section
- AdminProducts add/edit dialog supports unlimited image uploads but no min/max constraint or multi-image upload in one go

## Requested Changes (Diff)

### Add
- Forgot Password flow in AuthModal: a "Forgot Password?" link on the Sign In tab that opens a reset view — user enters their email, gets a simulated reset code (shown inline since no email service), enters a new password. Works for both regular customer accounts and admin.
- Change Password section in ProfilePage (customers) — card below personal info with current password, new password, confirm new password fields
- `changeUserPassword(email, currentPassword, newPassword)` function in AuthContext for regular users
- Multi-image upload in AdminProducts: replace single image flow with a dedicated image upload area that accepts 8-15 images per product; enforce min/max at submit time; show a grid preview with remove buttons; progress indicator during batch upload

### Modify
- AuthModal: add a third tab state "forgot" (not a tab, but an internal view), with back-to-sign-in link
- AdminSettings Admin Security section: already has change password for admin — verify it works correctly, no changes needed unless broken
- AdminProducts dialog: image upload section redesigned to support multiple files, show count, enforce 8 min / 15 max

### Remove
- Nothing removed

## Implementation Plan
1. Update `AuthContext` to expose `changeUserPassword` for regular customers
2. Update `AuthModal` to add Forgot Password view (inline, no tab): link on sign-in form → enter email view → enter reset code + new password view
3. Update `ProfilePage` to add a "Change Password" card below the personal info form, using the new `changeUserPassword` from AuthContext
4. Update `AdminProducts` dialog image upload: multi-file input, grid preview, remove individual images, count badge (X/15), enforce 8 min on submit
