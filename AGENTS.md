<!-- bmad:context -->
<!-- Verified 2026-09-01 against aa28aa762f87b0b3f9d8cf1d928fbd045437bf37. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## units-frontend

Angular 17 frontend for Units, a UAE on-prem property management platform (tenant, PMC, and owner workflows). Served by nginx from the committed `dist/Units/browser` build in the parent repo's docker-compose (`../../docker-compose.yml`), routed to `portal.getunits.ai`.

## Policy

- Branch off `property-develop`, PR back into `property-develop` — no direct pushes.
- Never hand-edit `dist/` — it is committed build output the deploy compose mounts directly; regenerate with `npm run build`.

<!-- /bmad:context -->
