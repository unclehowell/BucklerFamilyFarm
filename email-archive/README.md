# Great House Farm Public Mail Archive

This is the source for the public, read-only correspondence archive deployed at:

**https://email.bucklerfamily.estate**

## Source and deployment

- Repository: `unclehowell/BucklerFamilyFarm`
- Branch: `email-archive`
- Cloudflare Worker: `email`
- Public hostname: `email.bucklerfamily.estate`
- Web interface: `email-archive/index.html`
- Catalogue: `email-archive/data/mail-index.json`
- Worker: `email-archive/worker.js`
- Wrangler configuration: `email-archive/wrangler.jsonc`

The Worker serves the web interface and catalogue from this branch. When a reader opens a record, it retrieves its text from the already-public `https://wayback.datro.xyz/text/` archive. The Worker checks each requested source against the 80-record public catalogue before it will fetch it.

This service is not Gmail or a live mailbox. It has no mailbox sign-in, no inbox credentials, and no send/receive or write endpoint.

## What is indexed

The initial catalogue contains 80 case-related public archive records selected from the existing `unclehowell/datro@gh-pages:bpvsbuckler/text/_treeview.json` index using Great House Farm / Tŷ Mawr / Llandough / BP v Buckler and correspondence-style filename indicators. The reader groups normalized subjects into conversation-like groups. Grouping is a finding aid, not proof that each original thread is complete. The source catalogue currently lacks dates for some files; the interface shows these as undated rather than inferring dates from incomplete metadata.

## Reading and linking

- Search the catalogue by case reference, organisation, filename or message text.
- Use the folder controls to narrow the results.
- Open a subject to read its indexed source records in the vertically scrollable reader.
- The description and evidence notes are below the reader in a collapsed section.
- Use **Copy thread link** for a stable public URL: `/thread/<stable-subject-slug>`.
- Use **Copy embed code** to produce an iframe preview link: `/thread/<stable-subject-slug>?embed=1`. This embed mode hides the folder and list panes so the selected evidence occupies the preview.
- Each record retains its source link and an evidence version; the catalogue itself has its own manifest version.

The Worker permits embedding on `greathousefarmwiki.wordpress.com` and WordPress subdomains. The rest of the archive remains read-only.

## Updating safely

1. Confirm the exact correspondence record is intended for public release and that the upstream text is already public.
2. Review the complete source for personal data, third-party private material, privilege, sensitive information and attachments. Do not import a private Gmail dump or unpublished material into this public repository. Redact the public copy where appropriate and record the reason.
3. Add or correct the corresponding entry in `data/mail-index.json`. Keep a stable `id`, exact public `path`, descriptive `subject`, `category`, and `evidenceVersion`.
4. Increment `manifestVersion` when the catalogue changes. Increment an evidence record's `evidenceVersion` semantically when its public evidence representation changes (for example, `1.0.0` → `1.1.0` for an addition or backward-compatible correction, or `2.0.0` for a major change).
5. For UI changes, update `index.html` and bump the `?ui=` cache-key in `worker.js` so edge caches retrieve the current UI immediately.
6. Commit changes to this branch, then check the live domain and test both a thread link and an `?embed=1` link.

Do not alter the source text or re-label a record as a verified complete thread unless the underlying evidence supports that description.

## Local use

From the repository root, after installing a current Wrangler CLI:

```sh
wrangler dev --config email-archive/wrangler.jsonc
wrangler deploy --config email-archive/wrangler.jsonc
```

The config uses the existing `email` Worker identity and custom domain. Keep it and the deployed Worker in sync.

## Related chronology

The wiki's narrative summary remains at:
https://greathousefarmwiki.wordpress.com/records-access-chronology/
