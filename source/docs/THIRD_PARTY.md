# Third-party notices

The Apache-2.0 license in `LICENSE` covers original application code and original team-authored text. It does not relicense these materials:

| Material | Version / rights | Use |
|---|---|---|
| NASA POWER | API v2.10.3 in saved responses; project registry lists CC BY 4.0 | Authentic raw daily data, with request, retrieval date, metadata and attribution |
| IBM Plex Sans Arabic via Fontsource | 5.2.6; SIL Open Font License 1.1, [copy](IBM-Plex-Sans-Arabic-OFL.txt) | Current locally bundled Arabic and Latin font |
| Noto Sans Arabic via Fontsource | 5.3.0; SIL Open Font License 1.1, [copy](Noto-Sans-Arabic-OFL.txt) | Earlier interface dependency retained in the project |
| React / React DOM | 19.3.1, MIT | User interface runtime |
| Leaflet | 1.9.4, BSD 2-Clause | Interactive field coordinate picker |
| OpenStreetMap | Open Database License; [copyright and credits](https://www.openstreetmap.org/copyright) | Live standard raster basemap with visible attribution; tiles follow the [OSMF tile usage policy](https://operations.osmfoundation.org/policies/tiles/) |
| GeoNames | CC BY 4.0; [city reference points](https://www.geonames.org/JO/largest-cities-in-jordan.html), [Jordan place records](https://www.geonames.org/advanced-search.html?country=JO&q=Jord%C3%A2nia) | Rounded reference coordinates for the named area picker. Deir Alla uses THARA’s documented case reference |
| Vite / plugin-react | 8.3.8 / 6.3.0, MIT | Local development and static build |
| TypeScript | 7.0.2, Apache-2.0 | Type checking |
| Vitest | 5.1.0, MIT | Tests; not part of the browser runtime |
| React type definitions | 19.3.0, MIT | Development only |
| Ghanayem et al. paper | CC BY-NC 4.0, as stated on its first page | Research citation and bounded factual paraphrase. PDF, figures and tables are not redistributed in the site |
| LENSES / NARC publications | Redistribution license not confirmed | Source links and factual references only. No copied publication graphics or PDFs in the app |

The lockfile records exact packages, including transitive dependencies. `public/third-party-notices.txt` accompanies the static build with React, React DOM, Leaflet and font license texts, the original code license and NASA attribution. The earlier ImageGen illustration is archived outside the current public app.

The rebuild deck was authored with the bundled OpenAI Artifact Tool. It contains editable text and a native table, plus real application screenshots marked as AI-assisted prototype UI. Its PDF is an image rendering of those seven slides; the PPTX is the editable version. The tool runtime is not distributed with the app. Include it in the submission's resource disclosure.
