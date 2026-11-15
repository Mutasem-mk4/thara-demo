# Sources and bounded claims

## Current water-model rebuild

| Source | Actual use | Limit |
|---|---|---|
| [FAO-56 chapter 3](https://www.fao.org/4/x0490e/x0490e07.htm), Eq. 9, 21–25 and 52 | Mean of daily Tmax/Tmin, astronomical radiation and Hargreaves reference evapotranspiration | Temperature-only approximation; comparison with local reference measurements is needed. T2M is retained separately, not substituted into Eq. 9 |
| [FAO-56 chapter 6](https://www.fao.org/4/x0490e/x0490e0b.htm), Tables 11/12 and Eq. 66 | Seven selected generic Kc/stage profiles and linear stage interpolation | Profile rows, regions and chosen values are recorded in `src/cropProfiles.ts`; fixed stage lengths and coefficients are assumptions, without local wind/humidity adjustment |
| [FAO-56 soil-water balance](https://www.fao.org/4/x0490e/x0490e0e.htm) | Explains why ETc alone cannot prescribe irrigation | Rain, root-zone storage, depletion and effective irrigation are outside this prototype's balance |
| [FAO irrigation training manual, Annex I Table 8](https://www.fao.org/4/t7202e/t7202e08.htm) | Optional indicative efficiency scenarios: surface 60%, drip 90% | Neither is a measured efficiency for the user's field; default compares gross volume before losses |
| [University of Minnesota Extension](https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/living-soil-healthy-garden) | Crop family check after the previous crop | Family membership is a prompt to review disease history, not a suitability decision |
| [DoS Jordan 2019, Table 5.1.63](https://dosweb.dos.gov.jo/DataBank/Agri/Agr_2019.pdf#page=87) | Local occurrence of selected vegetables in Deir Alla in that survey | Does not validate present popularity, local Kc or planting calendars |

The current saved NASA file covers 2015-01-01 through 2024-12-31 at 32.16 N, 35.62 E: `public/data/power-2015-2024-raw.json`, with adjacent provenance. It contains T2M, T2M_MAX, T2M_MIN (°C) and PRECTOTCORR (mm/day), as specified by this response. It was retrieved 15 November 2026; the provenance carries the exact UTC timestamp and SHA-256. Data use the response's LST standard. POWER is a regional grid, not a field sensor. Historical seasons are not a forecast.

The active product is the vegetable crop/date comparison. LENSES and the earlier qualitative crop cards below remain prior research context; they do not supply the new vegetable coefficients or computed ratios. Okra and the unspecified other crop remain weather-only because the selected FAO tables did not provide the complete profile adopted here.

The 35°C count is a descriptive whole-window statistic, not a crop damage or flowering threshold. ±10% Kc is an explicitly chosen sensitivity scenario, not a published uncertainty bound. Ten historical seasons are a limited reference sample, not a 30-year climate normal.

## Earlier research context

Checked during research on 13–14 November 2026. Full review records remain in the sibling `research-prestart` directory and are not bundled into the public app.

| ID | Source | Used for | Boundary |
|---|---|---|---|
| NASA | [POWER Daily](https://power.larc.nasa.gov/docs/services/api/temporal/daily/) | Daily API, time standard and request structure | Actual units and fill values come from each response |
| NASA-META | [Meteorological sources](https://power.larc.nasa.gov/docs/methodology/data/sources_meteorology/) | Gridded reanalysis / assimilation context | No claim of a field sensor at the entered coordinate |
| LENSES | [D2.2, §3.1.1 Deir Alla](https://www.lenses-prima.eu/wp-content/uploads/2024/02/D2_2_Activity_of_the_LAAs-D2_2_Activity_of_the_LENSES_Learning_and_Action_Al.pdf) | Barley replacing sesbania, vetch replacing sorghum | Original comparison included alfalfa. No preferred sequence, full-cycle yield or savings inferred |
| NARC | [Forage trial presentation](https://www.lenses-prima.eu/wp-content/uploads/2022/11/Jordan-New-forage-crops-for-fodder-production-in-a-changing-climate_NARC.pdf) | Summer/winter crop context | No complete verified calendar or winter commercial product assumed |
| USER | [Ghanayem et al. 2025](https://journals.nasspublishing.com/index.php/rwae/article/download/104701), method p709 and Table 3 p711 | Small purposive vegetable study, 45 farmers from 15 households, constraints on recurrent decisions | These are the authors' interviews, not ours. No forage adoption or THARA demand inferred |
| RIGHTS | [NASA-managed POWER registry entry](https://registry.opendata.aws/nasa-power/) and [referencing guide](https://power.larc.nasa.gov/docs/referencing/) | Data rights and attribution | Preserve the product's terms rather than assigning the code license |

Saved raw files and adjacent provenance in `public/data/` include exact request URLs, retrieval timestamps and SHA-256 hashes. The app's audit download includes the current raw source response and per-day calculation trail. Source response values remain separate from synthetic test rows in `src/climate.test.ts`.

The current official challenge link is [Field Shift](https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/). Its Resources content did not appear in our checks; inclusion of POWER in the current resource list remains unverified. See the official [submission guide](https://www.spaceappschallenge.org/resources/project-submission-guide/) and [judging guide](https://www.spaceappschallenge.org/resources/judging-awards-guide/) for the rules we read. The more specific organizer resource-eligibility answer remains [discussion 1827](https://github.com/nasa/spaceapps/discussions/1827).

All comparison windows and field constraints are demonstration assumptions or user inputs. The interface marks their status. No external source supports an automated agronomic suitability threshold in this version, so none is implemented.

## Crop guidance in the field planner

[Jordan Department of Statistics, 2019, table 5.1.63, printed p. 65](https://dosweb.dos.gov.jo/DataBank/Agri/Agr_2019.pdf#page=87) records tomatoes, cucumbers, squash, eggplant, peppers, potatoes, okra and string beans among crops grown in Deir Alla. The table supports local occurrence in that survey year; the interface makes no current ranking. The separate research group uses the four crops in the documented LENSES sequences above.

The selected crop card links to the responsible source. [FAO](https://www.fao.org/4/t7202e/t7202e05.htm) and [University of Minnesota Extension](https://extension.umn.edu/agriculture/specialty-crops/vegetable-farming/irrigation-strategies-for-vegetables) support qualitative growth-stage checks. [Utah State University Extension](https://extension.usu.edu/vegetableguide/cucurbits/irrigation) supports the cucumber and zucchini cards, and [University of Georgia Extension](https://site.extension.uga.edu/colquittag/files/2023/10/Okra.pdf) supports okra. Forage cards use the trial context and ask the adviser to verify planting, crop identity or harvest decisions. These questions are THARA's prompts and are kept distinct from published findings. The calendar's longest gap comes from the user's schedule; the tool does not infer the timing of the growth stage or water sufficiency.
