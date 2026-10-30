# Student Life report integration

The existing mim28.com website is preserved. `/reports/student-life` and the Data runtime's reserved `/api/snapshot`, `/api/presentation`, `/api/query-rows`, `/api/queries`, `/api/deployment-assets` and `/_data` routes delegate to the exact packaged Data worker. Existing idea-board APIs are unaffected.

The report uses the existing logical DB binding, new nonconflicting `data_app_*` tables, and the BUCKET binding for immutable HTML and aggregate snapshot assets. Report editing is controlled by the Sites owner environment setting; no credentials or owner identities are stored in source.

`student-life/` preserves the generated publication-source checkout and its immutable data-recovery manifest. Its complete dataset is deliberately absent from source Git. The generated worker is pinned separately in `lib/reports/student-life-worker.mjs`.

Build the website normally, then run `node scripts/attach-student-life-report.mjs` before packaging. This attaches the prebuilt report without recompiling its client or worker. After deployment, upload and verify the exact report assets with the Data publication uploader from the original authoring project. Future report updates require hydration and repackaging; do not replace the whole website with the report's worker.

The archived aggregate-only snapshot reflects the 8 October 2026 survey export. No raw CSV, respondent identifiers or comments are published.
