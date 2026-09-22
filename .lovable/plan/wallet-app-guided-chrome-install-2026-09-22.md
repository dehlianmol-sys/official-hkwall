# Wallet App Guided Chrome Install

## What will change
- Apply this only to wallet-app APKs on the Add Tool screen; the public HK Wallet download page stays unchanged.
- Replace the current download percentage/install sequence with a 3-second redirect countdown and a disabled **Open Chrome Browser** button.
- After the countdown, tapping the button opens a guided tutorial before leaving the app.
- Show the admin-uploaded tutorial screenshots one at a time. Each slide keeps **Next** disabled for 3 seconds; the final slide uses **Confirm**.
- After final confirmation, open the selected wallet APK in Google Chrome. Keep a normal web-link fallback when Chrome cannot be forced.

## Admin controls
- Add **Tutorial banner** as a third banner category beside normal and daily notice banners.
- Let admins upload multiple common tutorial screenshots; their displayed sequence follows the saved order.
- Clearly label tutorial items in the banner list and keep deletion available.
- Tutorial banners will not appear in the home carousel or daily notice popup.

## Technical details
- Extend the existing `banners` records to support `banner_type = 'tutorial'` and use the existing `sort_order` column.
- Update banner types, loading, and admin save logic while retaining compatibility with older banner rows.
- Add a focused guided-install overlay to the wallet setup flow with countdown cleanup, image loading, slide position, and final Chrome handoff.
- Use an Android Chrome intent for supported Android devices, then fall back to opening the HTTPS APK URL normally.
- Preserve existing install tracking and unlock Submit only after the user confirms the tutorial.

## Verification
- Check admin upload/list/delete behavior for tutorial screenshots.
- Check that tutorial images never enter normal or notice banners.
- Test the 3-second initial button, 3-second per-slide Next buttons, final Confirm, Chrome intent, fallback, and mobile layout.
- Confirm the app builds cleanly.
