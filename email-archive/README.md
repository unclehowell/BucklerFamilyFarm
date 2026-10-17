# Great House Farm Public Mail Archive

**Live site:** https://email.bucklerfamily.estate

## Deployment source

- Repository: `unclehowell/BucklerFamilyFarm`
- Branch: `email-archive`
- Cloudflare Worker: `email`
- Custom domain: `email.bucklerfamily.estate`
- Interface: `email-archive/index.html`
- Approved catalogue: `email-archive/data/mail-index.json`
- Worker source: `email-archive/worker.js`
- Wrangler configuration: `email-archive/wrangler.jsonc`

The live Worker reads the interface and approved catalogue from this branch. It reads email text from the private Cloudflare R2 bucket `wayback-media` through the `CASE_ARCHIVE` Worker binding. It never makes the bucket public and it will return a source only when that source ID exists in the catalogue and its exact R2 key has the expected `text/` prefix.

This is a public, read-only evidence archive. It does not connect to Gmail or any personal mailbox, has no mailbox sign-in, and does not send or receive email.

## Catalogue scope and provenance

The catalogue is based on the existing public case index `unclehowell/datro@gh-pages:bpvsbuckler/text/_treeview.json`, matched against the corresponding text objects stored in R2. The initial index held 80 entries; six obviously unrelated or personal-only entries have been excluded, leaving 74 case-indexed source records in the public view. This should not be read as proof that every original email thread is complete: it is an archive of indexed messages and responses that can be checked against their source files.

Dates and subjects are taken from available email headers where present. If the original text does not supply a reliable date header, the interface does not invent one. Each indexed source has its own `evidenceVersion`; the catalogue has a separate semantic `manifestVersion`.

## Reading and linking

- Search by subject, organisation, case reference or message text.
- Choose a correspondence group to read its archived source records in the vertically scrollable reader.
- The thread description, dates and evidence notes are under a collapsed details section.
- Use **Copy thread link** for a stable URL: `/thread/<stable-subject-slug>`.
- Use **Copy embed code** to produce a preview URL: `/thread/<stable-subject-slug>?embed=1`. The embedded reader hides the folder and list panes and retains a vertical scroll.
- Each source card links to a stable text endpoint, `/source/<record-id>`, which returns the source as plain text. HTML in an email export is never executed.

The Worker permits embedding on `greathousefarmwiki.wordpress.com` and WordPress subdomains. All request methods other than GET and HEAD are rejected; no API endpoint writes data.

## Updating the archive

1. Confirm the original correspondence is within the Great House Farm case and intended for public release. Remove or redact unrelated personal content, private third-party correspondence and attachments that are not cleared for publication.
2. Add an approved record to `data/mail-index.json`, including a stable ID, actual object key under `text/`, source title, subject, category, date where established, and evidence version.
3. Increment `manifestVersion` when the index changes. Increment an individual record's `evidenceVersion` semantically when its published evidence record changes.
4. Keep the `RAW_BASE` in `worker.js` pointed to this branch. For interface changes, increment the `?ui=` cache key. Do not publish a public R2 domain for the entire bucket.
5. Commit changes to this branch, then check the live site, one source endpoint, search, a stable thread URL and the wiki embed.

## Local preview / deployment

From the repository root, install a current Wrangler CLI and run:

```sh
wrangler dev --config email-archive/wrangler.jsonc
wrangler deploy --config email-archive/wrangler.jsonc
```

The config describes the existing `email` Worker and its R2 bucket binding. Keep the deployed Worker and this source file in sync.

## Related case chronology

https://greathousefarmwiki.wordpress.com/records-access-chronology/
