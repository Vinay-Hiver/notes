# PRD gaps: Multiple Attachments in Omni

What the PRD ([Product Spec: Multiple Attachments in Omni](https://hiverhq.atlassian.net/wiki/x/AoBDjw)) asks for that the prototype doesn't do yet. Checked on 27 Oct 2026.

## To build

Items 1–7 were built on the `notes-try` branch on 27 Oct 2026, using the PRD limits (10 files, 24 MB total).

1. **Limits (R3).** The PRD allows up to 10 files and 24 MB total per note. The prototype uses 5 files and 1 MB per file, and doesn't check the total size. Decide which limits to show.
2. **Total-size check (R3).** If we use the PRD limits, reject a file that would push the note past 24 MB in total.
3. **Name the rejected file (R3).** The size-limit modal should name the file and the limit it breaks. Today it only states the limit.
4. **Message for the file-count limit (R3).** Files past the count limit are dropped without a message. Show one that names the limit.
5. **Upload progress on each file (R4).** Each file shows its own upload progress after it's added.
6. **Upload failure, Retry and Remove (R4).** A failed file shows an error on that file only, with Retry and Remove. Other files aren't affected.
7. **Block posting while uploading or failed (R4).** Add stays disabled while any file is uploading or has failed.

## To check with Design

8. **File names on a posted note (R2).** The PRD says each attachment is "listed with its file name". The prototype shows only the icon, with the name in a hover tooltip.
9. **Other channels (R5).** The PRD covers notes in every Omni channel. The prototype shows the flow only in a Slack inbox.
