# MIM28 website handover

Source handover for the existing https://mim28.com website, prepared on 29 October 2026.

## Start here

1. Download `MIM28-website-handover.zip` and extract it.
2. Read `HANDOVER.md` for the application architecture, build steps, report integration, data migration and domain cutover notes.
3. The `website-source/` directory contains all 405 tracked source files from Sites version 26, commit `a93e07503b593c087b7f0d84399aa8460fbbf8a9`. The version/source match was verified against Sites on 29 October.
4. To work directly in this repository, extract the contents of `website-source/` into a working branch and commit them as ordinary files. Keep these handover notes for reference.

This initial handover stores the source in an archive. It has not yet been unpacked into browsable repository folders or configured for deployment from GitHub.

## Hosting and data

The application uses React, Vinext and Cloudflare Workers with D1 and R2. It is not a standalone HTML page. The source ZIP does not contain production database records, hosted report objects or runtime secrets. These must be handled separately if moving hosting.

Uploading this handover does not move hosting or change mim28.com. Test the replacement before changing the domain's DNS records, and keep domain ownership with Tim.

The package excludes Git history, installed dependencies, private environment files, local database state and private workspace material. Source code was preserved unchanged; no new build was run for this handover. ZIP integrity and the per-file SHA-256 manifest were verified.

Archive SHA-256: `063dd3d436fdd8b2013221a17a3afc5eb2f9c10de7ff0595cfbeb50226c8970f`
