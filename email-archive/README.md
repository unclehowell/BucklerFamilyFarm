# Great House Farm Public Email Archive

This directory is the source of the serverless public email archive at https://email.bucklerfamily.estate.

## Components

- index.html — dependency-free, responsive archive UI; thread list, search, filters and full-thread reader.
- data/threads.json — the approved public correspondence dataset. It is currently empty by design.
- schema/thread.schema.json — schema for each published email thread.
- worker.js — Cloudflare Worker entry point. It serves the version-controlled files from this branch on the public hostname.
- wrangler.jsonc — local deployment configuration.

The Worker is read-only. It does not connect to Gmail or any personal mailbox, does not accept email, and has no write endpoints. The published page and data are served from this repository branch. The browser supports stable thread URLs such as /thread/<thread-id> and an embed mode such as /thread/<thread-id>?embed=1 for an evidence page preview.

## Add a reviewed thread

1. Preserve original messages and attachments separately as evidence. Do not invent missing headers or body text.
2. Review the material for personal data, third-party private information, privileged material, live security details, and attachments that are not cleared for publication. Redact only in the public derivative, document the redaction, and retain the original securely outside this public repository.
3. Add one thread object to data/threads.json following schema/thread.schema.json. Use a stable lower-case slug for id. Keep the messages in their original chronological order.
4. Assign each thread a semantic version:
   - Patch (for example 1.0.1): typographical correction or non-substantive metadata fix.
   - Minor (for example 1.1.0): one or more further messages added to the same thread without changing the established record.
   - Major (for example 2.0.0): material restructuring, a substantive correction, or a change to what the published thread represents.
5. Update updatedAt and append an entry to revisions whenever the thread changes. For an addition, explain which dated messages were added.
6. Validate the JSON, commit the change to this branch, then open the stable thread URL and check the rendered message order, source links, and redactions.

The archive-level schemaVersion describes the data format; each thread's version describes the published evidence record. These are separate version numbers.

## Thread fields

Required fields: id, subject, description, correspondenceWith, organisation, category, version, updatedAt, messages.

Each message should include date, fromName, to and body where those fields exist in the source. fromAddress and cc are optional. Attachments should link only to separately reviewed public files. sourceUrl should point to a stable public evidence record, not to a personal mailbox or private drive.

Do not paste private correspondence into a commit merely because it mentions the case. This is intended to be a public evidence archive. Publish only correspondence deliberately approved for public release.

## Local preview / deploy

Use a recent Wrangler CLI from the repository root or this directory. The Worker name is email-archive and the target hostname is email.bucklerfamily.estate. This Worker uses a small, explicit allow-list of public static paths and is configured as a read-only service.

For local development:
- npm install --global wrangler
- wrangler dev --config email-archive/wrangler.jsonc
- wrangler deploy --config email-archive/wrangler.jsonc

The Cloudflare domain association is managed for this deployed Worker. If deploying a new Worker version manually, keep the repository copy of worker.js in sync.

## Related case chronology

The current public correspondence overview is at:
https://greathousefarmwiki.wordpress.com/records-access-chronology/

That chronology is a narrative index, not a substitute for original message records. This archive does not mark a thread complete until its public messages and source record have been checked.
