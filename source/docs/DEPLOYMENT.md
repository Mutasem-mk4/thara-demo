# Rebuild publication record

15 November 2026. The user explicitly authorized replacing the older public demo, then authorized the assistant to resolve the hosting problem.

The existing Sites project appgprj_6af8710f8ed08191880b312776b50c4e remained readable as version 7, but two attempts to obtain a write credential returned NOT_FOUND/project_not_found. The connected account's owned-site list was empty. No duplicate Sites identity was created and no success was claimed on the old URL.

A public static-build repository was created through the already authenticated GitHub account:
https://github.com/Mutasem-mk4/thara-demo

GitHub Pages was enabled from main, root path. The new rebuild URL returned HTTP 200:
https://mutasem-mk4.github.io/thara-demo/

English:
https://mutasem-mk4.github.io/thara-demo/?lang=en

The repository contains built app assets, source data/provenance, public notices and this build's disclosure metadata. Editable source is delivered locally to the team. The older private Claude handoff remains a historical snapshot, not the current rebuild.

Local production preview: http://127.0.0.1:4273/ while the server runs. Rebuild with npm run build from thara. Relative asset paths support both root and subdirectory hosting. Further deployment checks and the exact final commit are recorded in evidence/rebuild/ when completed.

Official competition submission, team registration and account changes have not been performed. Restoring ownership/access to the older Sites project remains necessary only if the team insists on retaining that URL.
