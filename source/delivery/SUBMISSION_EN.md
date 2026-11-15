# THARA submission copy — rebuild, 15 November 2026

Team: **Thara**. Mutasem Kharma (Team Leader), Rand Al-Dalabeeh, Ismaeel Al-Mashaiekh, Mutaz Kharma, Joud Al-Khawaldeh, Abdalrahman Al-Salhout. Registration has not been checked.

Review-ready text blocks; no official submission has been made. Live form lengths remain unchecked. The dated rules record is in ../docs/COMPETITION.md. Use the verified rebuild URL in ../docs/DEPLOYMENT.md; the old public URL is not proof of rebuild publication.

## Project name

THARA — Crop and Water Turn Explorer

## Short summary

THARA helps an Arabic-speaking vegetable grower compare crop and planting-date scenarios with recurring irrigation turns. Ten years of NASA POWER temperature drive a disclosed FAO-56 estimate of crop water use. Growers can change days or volume, inspect the comparison and save a bilingual plan. The prototype supports exploration before the season; it does not prescribe irrigation or identify a best crop.

## Detailed description

A vegetable grower can know the days water arrives yet still need to compare how the next crop's estimated use changes through the season. THARA combines field location, metric-dunum area, previous crop, water weekdays and optional turn volume with up to three crop/date scenarios. The interface works in Arabic and English without an account. A fictional Deir Alla example opens from a real saved NASA record.

NASA POWER Daily Point supplies T2M, T2M_MAX, T2M_MIN and PRECTOTCORR for 2015–2024. Tmax/Tmin, latitude and day of year drive Hargreaves reference evapotranspiration following FAO-56 equations 9, 21–25 and 52. Selected generic crop coefficients and stages from Tables 11/12 produce standard-condition ETc. Seven vegetable profiles have a model; okra and unspecified crops display weather only because a complete adopted profile has not been verified.

The planned month/day is matched in each historical year. Modeled options share complete reference seasons. The app sums ETc between consecutive water turns, then displays the historical median, full range and ratio of turn depth to estimated use. Volume is converted by area; flow requires both litres per second and turn duration. Unknown values stay unknown. Changing a crop or date changes modeled demand. Changing a water day or volume changes supply comparison. A weekly chart, scenario controls, daily trace, audit download and printable summary expose the result.

Historical weather is not a forecast. POWER is a regional grid, not a field measurement. Generic Hargreaves/Kc parameters and stage lengths need local checking. Effective rainfall, stored root-zone water and measured losses are outside the balance. Optional efficiency is an explicit scenario. The percentage is a screening comparison, not a claim that irrigation will be sufficient in the field. Adding a day assumes another full-volume allocation, not redistribution of a fixed weekly quota.

The previous-crop family check prompts field-history review without assigning suitability. Days above 35°C are descriptive over the whole season, with no assumed flowering stage or crop-damage conclusion. No yield, profit or water-saving outcome is estimated.

The strongest supplied user evidence concerns vegetable farms in the Middle Jordan Valley. It supports a constrained recurring decision; demand for THARA is untested. The researchers' interviews are not Team Thara interviews. Earlier LENSES forage sequences remain research context. This rebuild compares next-crop/date choices after a previous crop and does not claim a full optimized rotation strategy. POWER inclusion in current challenge Resources and the local cutoff remain unverified.

## NASA and model sources

- NASA POWER Daily Point API, AG, LST: T2M/T2M_MAX/T2M_MIN in °C; PRECTOTCORR in mm/day as read from this response. Exact request, raw response, retrieval time and SHA-256: public/data/power-2015-2024-*.
- NASA documentation: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- FAO-56 equations: https://www.fao.org/4/x0490e/x0490e07.htm
- FAO-56 crop stages/Kc: https://www.fao.org/4/x0490e/x0490e0b.htm
- Soil-water balance limits: https://www.fao.org/4/x0490e/x0490e0e.htm
- Indicative efficiency: https://www.fao.org/4/t7202e/t7202e08.htm
- Local crop occurrence, DoS 2019 Table 5.1.63: https://dosweb.dos.gov.jo/DataBank/Agri/Agr_2019.pdf#page=87
- Full research boundaries, family-check reference and prior LENSES context: ../docs/SOURCES.md and the app's Materials and tools link.

## Tools, materials and AI disclosure

React, TypeScript, Vite, Leaflet, NASA POWER and OpenStreetMap tiles; locally bundled IBM Plex Sans Arabic; Vitest, Playwright and Microsoft Edge; OpenAI Artifact Tool for slides; browser PDF and Poppler for checks. Code is Apache-2.0. Third-party data, maps and fonts retain their terms.

The user supplied the project and research handoff. Claude assisted the rebuild plan and initial implementation. OpenAI Codex assisted source review, retrieval commands, code, calculations, tests, copy, documentation and presentation creation. Raw NASA values were retrieved, not AI-generated; model outputs are derived estimates. The exact Claude version was not independently verified. Screenshot slides visibly mark AI-assisted prototype UI. The current app/deck has no generated photo, video, voice, NASA insignia or likeness of a person under 18. See ../docs/AI_DISCLOSURE.md and public/ai-usage.json. The team must check its earlier ideation history before originality declarations.

## Verification and next step

48 automated tests and a production build passed. Browser checks exercised Arabic mobile and English desktop, days/date/volume changes, zero inputs, audit/PDF export and simulated NASA failure. These are software checks, not field validation. No farmer interview, measured farm, partnership, calibrated irrigation recommendation or proven impact is claimed.

Next: observe a grower using the comparison, check whether they can explain the percentage, and compare modeled ETc against locally validated weather, irrigation and soil measurements.

## Submission assets

- Final project: https://mutasem-mk4.github.io/thara-demo/?lang=en
- Demo presentation: https://mutasem-mk4.github.io/thara-demo/materials/THARA_Rebuild_EN.pdf
- Editable deck: https://mutasem-mk4.github.io/thara-demo/materials/THARA_Rebuild_EN.pptx
- Actual project image: https://mutasem-mk4.github.io/thara-demo/materials/project-image.png
- Source: https://github.com/Mutasem-mk4/thara-demo/tree/main/source
- Review materials: https://mutasem-mk4.github.io/thara-demo/materials/

Use the seven-slide **THARA_Rebuild_EN** PPTX/PDF with actual UI screenshots, names and sources. The older **THARA_Demo_Team_Thara_EN** deck describes a superseded scope. No final video has been produced. Check live rules before choosing a video length. Do not link localhost or a private repo as a public demo.
