# MIM28 website handover

Prepared 29 October 2026 for https://github.com/edav8/MIM-COUNCIL.

## Source

The website-source folder contains the 405 tracked files from commit a93e07503b593c087b7f0d84399aa8460fbbf8a9. This matches saved Sites version 26, verified against Sites on 29 October. Existing project: appgprj_6a9cb004728c8191ae6cea1b34db5b81. Current live URL: https://mim28.com.

This is the existing application source, not a standalone HTML export or a ready-made migration to another host. It includes the homepage, team, representatives, clubs, voting/ideas APIs, and Student Life report source. Unpublished prototype edits from other local folders are not included.

## GitHub handover

Repository contents and collaborator permissions have not yet been verified: the connected GitHub account returned 404. Inspect the destination before importing. Use a separate handover branch and a pull request to review changes. If the destination already contains your friend's newer website, keep this source in a separate legacy-source folder or agree which components to bring over; do not overwrite her work.

GitHub stores the code. Uploading it does not change the live domain or move the existing hosting.

## Runtime and build

This project uses React 19, Vinext, Vite, the OpenAI Sites Vite plugin, and Cloudflare Workers. Node >=22.13.0 is specified in package.json; use the included pnpm-lock.yaml to preserve dependencies.

Basic project commands from website-source:

    pnpm install --frozen-lockfile
    pnpm dev
    pnpm build

The integrated report requires an additional step after a fresh main website build:

    node scripts/attach-student-life-report.mjs

Run that attachment step once per clean build. It wraps the generated Worker and verifies the bundled report Worker's fingerprint. A main build alone does not integrate the report route. The report's own source and maintenance instructions are in reports/student-life/.

These commands have not been rerun as part of the handover. The unchanged source passed checks for its original publication. Package integrity was checked separately. External hosting compatibility has not been tested.

## Data and services to migrate separately

- D1 binding DB: existing ideas, votes, submissions, club sessions and report metadata. SQL migrations/schema are included, but production database records are not.
- R2 binding BUCKET: published report HTML and aggregate snapshot objects. These hosted objects are not included in this source archive. The report publication manifest contains object references and hashes, not the actual stored objects.
- Runtime settings: configure required settings privately on the chosen host. The root .env.example provides blank names for OPENAI_API_KEY, RESEND_API_KEY, FEEDBACK_EMAIL_FROM and FEEDBACK_EMAIL_TO. Owner authentication/report settings also need to be reviewed during migration.
- The .openai/hosting.json files describe the existing Sites project and bindings. They do not give GitHub access to that hosting. Existing Sites authentication and report owner editing may require adaptation on a different host.

Do not commit production database exports, runtime credentials or raw survey records. This archive excludes Git history, installed dependencies, ignored environment files, local database state, build outputs and private workspace material. A scan for common credential formats found no matches; this is not a guarantee that every possible sensitive string has been detected.

## Domain cutover

Keep mim28.com in Tim's domain account. Test the replacement on the new host's temporary URL first, including existing routes, form submissions, votes and the report. Back up and migrate required production data separately. Once the replacement is ready, the new host supplies DNS records for Tim to apply. Preserve unrelated DNS/email records and retain the previous host until the replacement is verified.

No GitHub upload, hosting change, database export or DNS change has been made by preparing this package.
