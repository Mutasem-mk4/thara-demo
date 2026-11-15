# Verification record

## Pre-submission completion — 15 November 2026

Current closeout evidence is under `evidence/closeout/`; the earlier rebuild record below describes the preceding version.

- 50 tests passed across seven source test files. Vitest is explicitly scoped to `src/**/*.test.ts`, so archived code snapshots are not accidentally collected. The added tests cover user-reported salinity documentation, zero versus missing readings and priority explanation order. Missing or unknown irrigation volume still returns no depth, not zero.
- Production TypeScript/Vite build passed. The scenario math is unchanged by the new context. Arabic mobile browser checks verified priority switching with unchanged percentages, recorded/unknown constraints, zero-valued user-reported ECe, incomplete and completed documentation, three stable research strategy IDs, feed-priority ordering, and audit exports containing the same states.
- English desktop checks exercised three crop options including weather-only okra. The English printable system text contains no Arabic. A closed research case stays out of the ordinary plan; an open case reaches a separate research PDF. Source/measurement text entered by a user is preserved in its original language.
- Generated Arabic/English print artifacts and real UI screenshots are in the closeout evidence directory. Browser-entered measurement/market examples carry explicit `UI TEST` labels and are not real field measurements. NASA values remain authentic, separately retained source evidence.
- The current seven-slide deck is `delivery/THARA_Final_EN.pptx` with a matching image-rendered PDF. Package/layout checks and Artifact Tool import passed, and all seven slide renders were visually inspected. Native PowerPoint execution remains untested.
- Field validation, farmer interviews, model calibration, physical-phone GPS, full screen-reader coverage and an entirely offline first visit remain unverified or unimplemented. A NASA outage is handled through the exact saved case; it is not a service-worker offline guarantee.

Public deployment of this completion is recorded separately in `DEPLOYMENT.md` after the release checks. No official competition submission has been made.

## Water-model rebuild — 15 November 2026, 21:54 Amman

This section describes the current interface. Earlier sections below are historical records for superseded versions.

Final build/test output is in evidence/rebuild/tests-final.txt and build-final.txt. The final public browser pass at 22:15 Amman is in evidence/rebuild/public/browser-rebuild.json. The published NASA bytes and slide download hashes were also checked. Source and public links are in DEPLOYMENT.md.

- `npm test`: **48 tests passed across six files**. The original climate tests remain. Added checks cover FAO radiation Example 8, Hargreaves arithmetic and missing values; Kc stages; m³/dunum conversion; explicit efficiency; unknown versus zero; complete intervals; shared reference years; leap-day and cross-year boundaries; crop/date/weekday/volume changes; unsupported crop models; exact-point saved fallback.
- `npm run build`: TypeScript and Vite production build passed.
- Ran the production bundle in headless Microsoft Edge through Playwright, with an emulated Pixel 7 in Arabic and a 1440×900 desktop in English. The saved example loaded two modeled options and ten complete shared seasons. Initial displayed peak-interval ratios were **27% for zucchini and 22% for tomato**, using the explicitly fictional 4-dunum field, 30 m³ per turn, Sunday/Thursday and 1 March 2027 planting.
- Exercised adding Tuesday, restoring inputs, shifting only one option by two weeks, doubling turn volume, and entering zero. Each produced the checked change without reusing another crop's result. Opened the family check, formula and daily trace; downloaded the JSON audit. Arabic document width fit the phone both before and after opening the wide trace table.
- Entered an English field from scratch with 2 L/s × 1 hour, two crops including weather-only okra, and exported the result. Checked that English printable result text contains no Arabic characters. Both Arabic and English A4 PDFs were produced; see `evidence/rebuild/` for screenshots, audit and browser-check summary.
- Blocked NASA requests for a new Amman point: showed unavailable and no previous result. The exact-point Deir Alla saved example still worked. This is a simulated NASA outage; it does not test an entirely offline first visit with no app assets cached.
- A real decade response for Deir Alla was downloaded from NASA, saved unchanged and hashed. Source metadata and independent daily coverage are retained. Browser checks also reached live NASA for the English Deir Alla input path.
- No physical-phone GPS test, full screen-reader audit, farmer usability study, field measurement, local FAO calibration or agronomic validation was performed. The ratio does not establish irrigation adequacy.

Browser automation source is copied to `scripts/browser-rebuild-check.cjs`; it needs an installed `playwright-core` package and an Edge executable (override with `EDGE_EXECUTABLE`). It uses genuine served NASA data and blocks requests for the failure case. The final pass also checked three options including weather-only okra, unknown volume, and an actual change from an existing saved result to an uncovered point with NASA blocked. Synthetic numeric fixtures remain in test files only.

The rebuild deck has seven slides, actual application screenshots and the six confirmed names. All seven rendered slides were visually inspected. PPTX package/layout checks and Artifact Tool import passed; the PDF has seven image-rendered pages. The PDF is a sharing copy and the PPTX remains editable. Neither was tested inside native PowerPoint. The app now visibly discloses its AI-assisted interface/mark, includes entered field/water inputs in print, and exposes per-variable historical summary/coverage within source details.

## Self-service field plan — 15 November 2026

- Production build and all 36 Vitest tests passed. Added cases cover the intervening days across leap day and year boundaries, plus turns before, on and after a user-recorded crop date.
- Ran the production bundle in Chromium with an emulated Pixel 7 and a desktop viewport. Arabic RTL and English LTR paths passed. Checked the marked calendar dates, trial cancellation and adoption, unchanged weather, unknown and zero volumes, planned-date validation, a tomato observation, and the independent forage example.
- Tested weather with a recorded real NASA response and with the NASA request blocked. The water calendar and printable plan worked when NASA was unavailable. Rendered and reviewed the Arabic A4 PDF, including dates, volume, observation, historical weather and source URL.
- Repeated the Chromium checks on public Sites version 7 and verified its HTML and bundled JavaScript. A separate direct NASA request returned 120 daily rows for the test point and requested range.
- No physical-phone, full screen-reader or farmer usability session was run for this revision.

## Crop guidance expansion

- A production-bundle DOM check selected all 12 crops and verified their own prompt and source. It also verified that crop edits preserve weather and the irrigation gap, and that the potato and barley cards carry to the adviser summary. The numerical test suite remains at 28 tests.

## Season calendar interface

- The production build and 28 Vitest tests passed.
- A DOM check of the production bundle verified navigation across months, jumping to a highlighted gap endpoint, a 5-to-4-day change when editing weekdays on the results screen, restoring the original days, showing unknown availability, unchanged NASA values and the selected days reaching the adviser summary. It also verified the original NASA link and that print events expand and restore the source details.
- Windows browser inspection could not be completed while the desktop was locked. Visual inspection at the target viewport sizes, keyboard-only navigation in a real browser and native PDF output remain unverified.

## Planting and water calendar

- 28 Vitest tests passed. The new tests cover weekday changes, longest gaps, inclusive leap day, unknown versus zero, and conversion of flow and duration to cubic metres.
- The production bundle was exercised in a simulated DOM with genuine NASA response fixtures. Changing Tuesday/Thursday to Monday/Thursday changed the longest gap from 5 to 4 while preserving weather. The check also covered crop-specific content, optional planned dates, validation, per-turn volume, the matching adviser summary and the separate Deir Alla example.
- The interface calculates availability, not agronomic sufficiency. Native browser PDF pagination was not verified in this revision.

## Field location journey

- Verified map tiles, visible OpenStreetMap attribution, point selection, confirmation, and live NASA results for a public test point at 32.158 N, 35.603 E in the Codex desktop browser panel on Windows.
- Verified NASA HTTP 200 and matching response coordinates and dates for a second public test point at 32.215 N, 35.614 E. A production-bundle DOM test replayed its genuine response and verified seasonal values, the 30-day shift, previous crop and irrigation in the summary, and absence of reference crop sequences in the field result.
- Simulated GPS success and permission denial, then verified manual coordinates, changed-point network failure without stale data, and the independent saved example. Native device GPS, a physical phone and final PDF pagination remain unverified.
- The production build and all 25 calculation and request tests passed.

This records executed checks, not field validation or competition eligibility. Node 22.18.0 / npm 10.9.3 on Windows. Final command output is saved under `evidence/`.

## Automated checks

`npm test`: 20 tests, covering inclusive boundaries, leap day and year crossings; invalid dates; independent coverage per variable; missing and fill values; zero rainfall; identical and conflicting duplicates; empty/all-missing windows; raw NASA reference arithmetic; metadata/unit validation; failed-network saved fallback; out-of-coverage requests; stale-result key gating; soil/water measurement metadata; invalid location and overlapping sequence windows.

The real NASA reference for 1–10 January 2024 is T2M mean 14.849 °C, highest daily maximum 25.85 °C, lowest daily minimum 7.95 °C, precipitation sum 0.48 mm, ten valid days per variable. Synthetic edge cases exist only in test code.

`npm run build`: TypeScript checking and Vite production build completed. Raw data hashes are compared against saved provenance and the production build. Local Markdown file targets are checked during packaging.

## Historical timing comparison

The 25 tests passed, including five added cases for the timing demo, leap-year date shifting, source coverage, mismatched coordinates and a shift crossing a calendar-year boundary. The production build passed TypeScript and Vite.

Local DOM checks ran the production bundle with the saved NASA responses. The default comparison showed both 90-day windows, 68.56 and 37.43 mm of precipitation, and 15.17 and 18.99 °C mean temperature. The computed differences were −31.13 mm and +3.81 °C before rounding the individual means. The check opened the daily evidence for both windows, selected the second window, marked irrigation availability unknown, verified the review summary, and restored the case. English/LTR and a deliberately missing rainfall test value were also checked. The latter suppressed the rain difference and bars and showed 89/90 days. The existing basic interface smoke check also passed.

Browser control was unavailable for this revision. Production DOM verification did not exercise CSS layout on a physical phone or the native print dialog. See [timing check output](evidence/interface-timing.txt).

## Simplified case interface

The production build passed TypeScript and Vite, and the 20 calculation and request integrity tests passed. A local DOM smoke check ran the production bundle with the real packaged NASA responses. It verified both sequences and shared weather on first load, invalid-date feedback before applying changes, the 1–10 January reference result, the daily trace and chart, irrigation availability and unknown handling in the review summary, return to the case, English/LTR switching, and unavailable results outside the saved period.

Browser control was unavailable for this revision. The DOM check does not verify visual rendering, native date controls, mobile layout, download behavior, or native printing. The checks below record earlier builds.

## Observed browser checks from earlier builds

- Arabic desktop case, both sequences, source status and separate coverage were rendered in Chrome.
- Switching priority to soil changed the question order while weather values stayed unchanged.
- Changing the first window to 1–10 January 2024 updated both sequences to the reference results, rather than retaining the old window. Date input handling was corrected following this check.
- Changing latitude to 32.20 in saved mode showed unavailable, removed the previous weather result and disabled summary/audit actions.
- A descriptive irrigation note appeared in the adviser summary without converting time to volume.
- Live NASA retrieval succeeded in the browser and displayed its current retrieval date.
- English mode changed document direction to LTR. A 390 × 844 viewport was inspected; no horizontal overflow was found. Temporary viewport settings were reset. Arabic mode restored RTL.
- The on-screen print summary displayed the current field, priority, assumptions, raw request URLs and retrieval metadata, followed by comparison and review content. Returning to editing worked.
- The audit action created a real JSON download in the user's Downloads folder. The browser automation download event timed out, so the file's actual existence and JSON contents were checked separately. The final export also includes entered constraints.
- A keyboard Tab action moved focus from the skip link to the brand link. Focus styling and form labels were inspected in code. A full keyboard-only journey and screen-reader audit were not performed.

Network failure/fallback was tested at the fetch boundary with real saved fixtures, not by disconnecting the user's browser. This app requires a reachable host and is not an offline PWA.

## Presentation and review artifacts

The final English PPTX contains seven slides and the six user-confirmed names. Its structural, layout, font-policy and first-party reimport checks passed, with four editable native tables. The receipt is retained in `evidence/deck-validation.json`. This does not establish native PowerPoint rendering: that remains untested.

All seven slide renders were visually inspected. The seven-page PDF was rendered and its page montage inspected separately. Source notes are retained in the PPTX; the PDF is a visual review copy.

## Remaining limits

Native browser printing was invoked once but its system dialog could not be inspected through the available browser controls. Final PDF pagination and physical printing of the application summary remain unchecked. The on-screen summary preview was checked.

NASA source documentation and the published user-study link were accessible during research. Direct LENSES downloads encountered TLS/access problems; the publications supplied in the handoff were used with linked citations. No claim is made that every external link passed a fresh browser check.

No public hosting, incognito public-link check, actual platform field-limit check, official submission, member-registration verification, organizer communication, farmer interview or field experiment was performed. POWER's inclusion in current challenge Resources and the Amman local cutoff remain unverified; see [competition status](COMPETITION.md).
# Guided demo redesign, 14 November 2026

- `npm.cmd test`: 25 tests passed. `npm.cmd run build`: TypeScript and Vite production build passed.
- In the Codex desktop browser panel on Windows, visually checked the Arabic opening illustration and disclosure, both crop sequences, and the timing screen before and after selection. Saw the window move and both readings update, including 68.56 to 37.43 mm.
- In jsdom, executed the production bundle with the archived NASA fixtures. Verified Arabic and English direction, stage navigation and focus, dates and timeline length, daily audit rows, shifted summary, irrigation entries and clearing, print detail events, reset and presentation layout. An injected NASA network failure exercised the labelled matching fallback; a changed point hid the previous result. A synthetic missing rain day produced 89/90 coverage and suppressed the rain difference.
- The revised mobile viewport, native fullscreen and final saved PDF have not been checked. The print event check verifies expanded evidence content, not pagination. The seven-slide deck remains the prepared submission asset and contains no capture of the redesigned screens.

