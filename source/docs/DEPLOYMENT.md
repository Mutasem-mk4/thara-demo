# Rebuild publication record

15 November 2026. The user explicitly authorized replacing the older public demo, then authorized the assistant to resolve the hosting problem.

The existing Sites project appgprj_6af8710f8ed08191880b312776b50c4e remained readable as version 7, but two attempts to obtain a write credential returned NOT_FOUND/project_not_found. The connected account's owned-site list was empty. No duplicate Sites identity was created and no success was claimed on the old URL.

A public static-build repository was created through the already authenticated GitHub account:
https://github.com/Mutasem-mk4/thara-demo

GitHub Pages was enabled from main, root path. The new rebuild URL returned HTTP 200:
https://mutasem-mk4.github.io/thara-demo/

English:
https://mutasem-mk4.github.io/thara-demo/?lang=en

The repository contains built app assets, source data/provenance, public notices, disclosure metadata and editable app source under source/. Public review materials and the final seven-slide PPTX/PDF are at https://mutasem-mk4.github.io/thara-demo/materials/ . The older private Claude handoff remains a historical snapshot, not the current rebuild.

The deployed app/deck source commit is 9a14433766fab93ff3d7954b0ac2c3136049f7b0 (later documentation-only commits may follow). Its app bundle is index-CHJITeuu.js. The public browser check completed at 2026-11-15T19:15:44.481Z and is saved under evidence/rebuild/public/. Arabic mobile and English desktop, three options, edited inputs, unknown/zero values, trace/audit/PDF and changed-point outage checks passed with no captured page errors. Downloaded public slide files matched their local hashes. The public NASA raw response matched SHA-256 1a62cc19ad39e1d6154ff6cc790cfdd7e2325e2b1edbf97460178ca312580f4c.

Local production preview: http://127.0.0.1:4273/ while the server runs. Rebuild with npm run build from thara. Relative asset paths support both root and subdirectory hosting. The source copies of all 30 src files matched the local originals at publication.

Official competition submission, team registration and account changes have not been performed. Restoring ownership/access to the older Sites project remains necessary only if the team insists on retaining that URL.
