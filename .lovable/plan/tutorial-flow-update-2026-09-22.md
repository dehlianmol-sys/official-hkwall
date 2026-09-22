# Tutorial Flow Update

## Changes
- Replace the green circular Download treatment with bold green text only.
- Open the install tutorial automatically when the three-second Chrome timer finishes; keep the button tap opening the same tutorial.
- Add a separate admin-uploaded “Submit tutorial” banner category.
- After Setup Submit, show the Submit tutorial before the phone-number screen; its final confirmation continues to phone entry.

## Technical details
- Reuse the existing banner storage by marking Submit tutorial images separately, avoiding a database structure change.
- Keep install and Submit tutorial images in separate ordered sequences.
- Reuse the existing timed tutorial viewer with context-specific heading and confirmation text.
