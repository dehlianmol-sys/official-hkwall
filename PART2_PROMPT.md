# Part 2 prompt (paste this in the next chat)

Part 1 is already done in this project:
- One shared five-button bottom navigation everywhere (no page-level duplicate nav).
- Add Wallet / Add Tool is PIN-gated: no PIN -> PIN page -> automatic back -> PIN overlay -> flow opens.
- New user with no wallet sees the supplied "Tool / No wallets yet -> Add -> Choose your payment" screens.
- Only 5 apps are in service (Mobikwik, Phonepe, Paytm, Freecharge, IndusPay); all others show "Unavailable in service".
- App setup guide screen with Download (APK trigger placeholder), common teaching video link, Submit.
- Submit -> user enters the same phone number he logged in with -> UPI handle list for that app -> Save.
- Saved wallet overlay with enable / disable switch.
- One app = one active handle: relinking the same app replaces the old handle.

## Part 2 — please do this

1. APK per app. I will give the APK files for Mobikwik, Phonepe, Paytm, Freecharge and IndusPay.
   Put each APK on its app so Download serves that app's file only, never another app's.
   Config lives in `src/lib/walletTools.ts` (`apkUrl` per tool). Add an admin screen to upload/replace these APKs.
2. Teaching video. One common video link for every app. Set `TEACHING_VIDEO_URL` in `src/lib/walletTools.ts`
   and let the admin change it from the admin panel.
3. UPI handle list. Confirm/replace the handle list per app (currently Paytm: @paytm, @ptyes, @ptaxis, @ptsbi,
   @pthdfc; Phonepe: @ybl, @ibl, @axl; Mobikwik: @ikwik; Freecharge: @freecharge; IndusPay: @indus, @indusind).
4. Mode sync on the order/payment page. The app the user selected must be saved on his record and shown as
   "Mode: <app name>" on the payment/order page, and the payment must only be accepted through that tool.
5. Business tab. Keep it visible but unavailable until I say otherwise; then enable Paytm Business /
   GooglePay Business with their own handles and APKs.
6. Existing-user Add Tool. Use the same new design for users who already have a wallet (add another tool),
   keeping the one-active-handle-per-app rule.
7. Admin visibility. Admin should see each user's linked tool, handle, enabled/disabled state, and be able to
   disable a tool.
8. Finally, run a logged-in test of the whole flow (I will give a test account) and confirm nothing else changed.

Do not redesign anything. Keep my existing design, pages and database structure as they are.
