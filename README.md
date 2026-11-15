# THARA · Team Thara

Public static build of the crop and water-turn exploration prototype. This repository publishes browser assets, authentic saved NASA POWER data and editable source in [source/](source/).

Demo: https://mutasem-mk4.github.io/thara-demo/ · [English](https://mutasem-mk4.github.io/thara-demo/?lang=en) · [Slides and review materials](https://mutasem-mk4.github.io/thara-demo/materials/).

To run from the source directory: `npm ci`, then `npm run dev`. Run `npm test` and `npm run build` for the recorded checks. Seven-slide English PPTX/PDF are under materials/. The older deck retained in source/delivery describes a superseded version.

NASA POWER Daily: T2M, T2M_MAX, T2M_MIN, PRECTOTCORR; AG; LST; 2015–2024. Saved raw response and provenance are under `data/`. FAO-56 Hargreaves and generic Kc/stage profiles produce exploratory ETc estimates. The ratio compares entered water turns with modeled use; it is not an irrigation prescription or validated crop recommendation.

Historical grids are not a forecast or a field sensor. Effective rain, soil storage and measured losses are outside the balance. Seven crop profiles are modeled; okra is weather-only. No field impact or savings is claimed. The fictional Deir Alla example has disclosed inputs.

Claude and OpenAI Codex assisted planning, software, calculations, copy and checks. Raw NASA values were retrieved, not generated. See `ai-usage.json`, `project-materials.json` and `third-party-notices.txt` for actual tools, sources and licensing. No NASA logo or generated photo/voice/video is used.

The build uses relative asset paths, so the same static files can be served at a domain root or a GitHub Pages subpath. Map tiles and live NASA requests need their services. The saved example needs the app and data assets to be accessible.
