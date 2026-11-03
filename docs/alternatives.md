# Digital alternatives

The Arabic and English alternatives routes contain five app pairs, ten comparison criteria, local search and category filters, a privacy-only view, shareable comparison URLs, official publisher links and three suggested first steps for each app. The game section opens [Opening Tomorrow](game.md), a local simulation with five connected decisions, original SVG scenes, local progress and replay. Its game bundle loads when the visitor opens it. The floating navigation links to the directory, comparison and game sections, with an active section indicator and a mobile menu. It retains the home page's navigation styling and single warm appearance. Reduced motion follows the operating system or a local preference.

Each alternative has a localized page at `/ar/apps/[slug]/` and `/en/apps/[slug]/`, with a publisher download link, privacy and feature facts, sources, first steps and a link back to its comparison. Download links are available on catalog cards, in the selected comparison and in the getting-started guide. They open the publisher's download page for device selection. The bottom of the alternatives page includes a home button and links to the initiative's three stations. Comparison arrows follow the document's writing direction, from the current app toward its alternative.

The comparison opens with logo pairs and three privacy summaries, followed by an interactive criterion selector. Choosing a criterion shows its question, both applications side by side and the relevant publisher sources. The full table is optional. Official app logos are served locally, with original source URLs in `public/app-logos/sources.json`. Lenis 1.3.27 runs locally with smooth wheel scrolling and native touch scrolling. Its source and MIT license are retained in `public/vendor`. The scroll controller is destroyed when reduced motion is enabled or the page unmounts.

The [narrative notes](narrative.md) describe the initiative papers behind the comparison questions. App pages include an illustrative app card, section navigation, six sourced facts arranged in privacy and everyday-use groups, an interactive comparison and a three-step setup guide. Each fact has an icon for its subject and publisher references. The download links point to the publisher.

The alternatives hero is a vector illustration of the blue switch, with three app cards arranged directly behind it. The cards display Signal, Brave and Proton Mail logos. The mobile header places the brand, compact language control and menu on one aligned row. The general three-card narrative section is absent. The local-cloud station links to its [complete page and survey preview](home-cloud.md).

The five pairs are Signal and WhatsApp, Brave and Chrome, Proton Mail and Gmail, Nextcloud and Google Drive, and ONLYOFFICE Desktop Editors and Google Docs. The named ONLYOFFICE edition matters: local editing and cloud collaboration have different data flows. Nextcloud administration and optional end-to-end encryption are described separately. Gmail and WhatsApp encryption protections are included alongside their limitations.

## Project references

Reviewed on 24 October 2026:

- The supplied `Fed3_Website_Study_AR (1).docx` and pasted landing-page specification.
- [Initiative work plan](https://docs.google.com/document/d/1utnv_CTGBab8z4b28iN5-3YlWDk5tgarf3aYqdxhmZc/edit), including the comparison and download-guide deliverable starting on 11 October.
- [Current activity plan](https://docs.google.com/spreadsheets/d/1sqcIaZqXE8oJWJAULg4Fi7ezSAWz_7jMIJrWp1pk8fw/edit).
- [Alternative services reference](https://docs.google.com/document/d/1sNjDvgPWZTsotVxqpFPygScetjg9b-ih/edit).
- [Visual references](https://docs.google.com/document/d/1EuZZN-Bz-EsEtqrqYYG58HCVUifbxLWmwuGBvJMG1B0/edit).
- [Game ideas](https://docs.google.com/document/d/1eCCsb14rJ4mdm87S1QATaFevTnFAAwbh/edit).
- [Initiative presentation](https://docs.google.com/presentation/d/1SgI0UQVupUVAmKxR6Xsf65_dhryjlu1-/edit).

The user requested five alternatives for this delivery. The initiative plan's broader target of 10 to 15 apps is a separate scope. Private planning files are not loaded by the public website. The comparison dataset in `lib/fed3/alternatives.ts` contains public publisher sources and a review date. Publisher documentation supports this editorial comparison; it is not an independent security audit or measured performance benchmark.

## Verification

- Production compilation and TypeScript passed.
- Four existing sequence unit tests passed.
- Six browser tests cover all five comparison/guide pairs, Arabic search, categories, empty results, query links, language direction, clipboard sharing, logo loading, criterion selection, optional table, section navigation, mobile menu and Lenis cleanup. They check the home and station links, arrow direction and the ten localized app pages with their official download links and comparison return paths. A dark system preference and a saved dark preference leave the single page appearance unchanged.
- Two further browser tests cover the continuous three-chapter journey using the real assets, reverse scrolling, the pin exit, responsive controls and comparison navigation in both languages.
- Responsive browser checks cover widths of 320, 390 and 768 pixels in both languages, plus a 1440-pixel desktop capture.

Run the focused browser checks against a running production server with `TEST_BASE_URL` set to its URL, using `playwright test tests/alternatives.browser.spec.ts --project=chromium`. The existing development server at `127.0.0.1:3000` returned failed HMR WebSocket handshakes during the initial automated run. The production server on port 3100 avoids that development transport problem.
