# THARA · ثرى

An Arabic and English pre-season planning prototype for Team Thara. Growers compare up to three vegetable crop and planting-date scenarios against recurring irrigation turns. NASA POWER temperatures drive a Hargreaves estimate of reference evapotranspiration. Published FAO-56 coefficients convert that estimate into crop water use.

Rebuild demo: https://mutasem-mk4.github.io/thara-demo/ · English: https://mutasem-mk4.github.io/thara-demo/?lang=en . Public build and editable application source: https://github.com/Mutasem-mk4/thara-demo (source subdirectory). The older Sites URL is a superseded version; its current connection does not grant write access. See `docs/DEPLOYMENT.md`.

## Run

Tested using Node 22.18.0 and npm 10.9.3.

```powershell
npm ci
npm run dev -- --port 5173
```

Open `http://127.0.0.1:5173/` for Arabic or `http://127.0.0.1:5173/?lang=en` for English. PowerShell users can use `npm.cmd` if the npm shim is blocked.

```powershell
npm test
npm run build
npm run preview -- --port 4173
```

The Vite output is `dist/`. No API key, login, database or environment secret is required. Serve the app over HTTP or HTTPS. HTTPS is required for browser geolocation outside localhost.

## The working journey

Choose **Start with my field** to select an area reference point, map point, device location or manual coordinates. Add the area in metric dunums, if known, and the previous crop. Record recurring water weekdays and optional volume per turn or flow and duration. Choose up to three crop/date pairs and open the comparison.

**See the Deir Alla example** loads a fictional four-dunum field, previous tomato, Sunday/Thursday turns of 30 m³ each, and zucchini/tomato scenarios beginning 1 March 2027. The actual NASA record is saved at 32.16 N, 35.62 E. The example dates and field inputs are demonstration assumptions.

Results update when a turn day, quantity, field area, assumed efficiency or planting date changes. **Restore starting inputs** reverses these result-screen experiments. All options print together through **Save my plan as PDF**. **Download audit file** exports the scenario, per-year calculations and original NASA evidence. Edits remain in browser memory and reset after reload.

## Data and reproducibility

- NASA POWER Daily Point, community AG, LST, 2015-01-01 through 2024-12-31. The saved response contains 3,653 dates for each requested variable, `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`.
- Raw bytes and request/provenance are in `public/data/power-2015-2024-*`. Run `node scripts/fetch-history.mjs` to refresh the reference snapshot. Refreshing replaces the snapshot and its provenance together.
- Each response's fill value, units and metadata are read. A missing value remains missing. Conflicting duplicates remain missing for the affected variable.
- A live request must match the requested point and historical range. On failure, the saved response is used only for the same point and range and is labelled. Uncovered points display unavailable. Request keys and abort signals prevent stale results.
- The 2024/2025 snapshots are retained as earlier evidence. The new planning flow uses the decade snapshot.

## Calculations

`src/eto.ts` implements FAO-56 equations 21–25 for extraterrestrial radiation and equation 52 for Hargreaves ETo. The standardized mean is `(T2M_MAX + T2M_MIN)/2` from equation 9. Radiation in MJ/m²/day is multiplied by 0.408 once to obtain its equivalent in mm/day. `T2M` remains an authentic recorded climate variable.

`src/cropProfiles.ts` records seven coefficient profiles with the exact FAO-56 Table 11 climate/season row and Table 12 coefficients. The initial and mid-season coefficients are constant, with linear development and late stages. Chosen variants within published ranges are stated. Stage lengths stay fixed in the scenario when a date changes. Okra and other crops have a declared 90-day weather-only window because a complete profile has not been verified from this source.

`src/cropWater.ts` computes `ETc = Kc × ETo` per day. Each historical season begins on the planned month/day and advances by crop age. A February 29 plan uses leap reference years. Cross-year seasons require coverage in both calendar years. Crop options use a shared set of complete seasons. The result shows the median and min–max range, with the included count out of ten. Missing seasons are excluded explicitly.

Each complete turn interval sums crop use from the turn day through the day before the next turn. Days before the first turn and from the last turn to the window end are excluded from these complete-interval comparisons and counted visibly. Weekly plots include the entire modeled season, with a labelled shorter final week.

Gross turn depth in mm is `volume m³ / area dunums`, with a metric dunum of 1,000 m². Flow inputs convert as `L/s × hours × 3.6 = m³`. An explicit efficiency scenario can multiply gross depth. The ratio is the turn depth divided by estimated use for that interval. A zero volume stays zero, and an unknown volume yields no ratio. Rain is reported separately. The ±10% Kc figure is a sensitivity scenario.

## Scope and limits

Hargreaves requires regional checking against Penman–Monteith. Generic Kc values and stage lengths have no local calibration for the selected field, cultivar, wetting frequency, wind or humidity. The screening comparison leaves effective rainfall, soil-water storage and field losses outside the calculation unless an efficiency scenario is entered. A ratio alone cannot establish field irrigation adequacy.

The family check identifies whether the previous crop and option share a botanical family. It needs crop-history and disease review. Days above 35°C are descriptive over the full scenario window, with no assumed flowering date or damage threshold. Historical gridded weather provides context for past seasons. Farm-specific suitability, yield, profit, water savings and future weather remain unvalidated.

Published user evidence concerns vegetables. LENSES forage sequences are retained as research context in `docs/SOURCES.md` and earlier material. The team has no farmer interviews, measured farm, established partnership or field outcome for this prototype.

## Verification and delivery

Executed checks are recorded in [VALIDATION.md](docs/VALIDATION.md). The rebuild retains the earlier integrity tests and adds tests for the new calculations. Browser screenshots and PDF checks are under `docs/evidence/rebuild/`. These are technical checks, with farmer usability testing still pending.

Current English submission copy, pitch, demo script and checklist are in `delivery/`. Earlier slides and material describe an older scope. The rebuild deck is explicitly named separately.

Claude supplied the approved rebuild plan and an initial implementation. Codex verified sources and continued implementation, model checks, UI, documentation and presentation work. See [AI disclosure](docs/AI_DISCLOSURE.md), [materials inventory](public/project-materials.json), and [licenses](docs/THIRD_PARTY.md). No generated photographic, video or voice asset appears in the current app.
