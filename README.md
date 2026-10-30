# stassinos.xyz

Christopher Stassinos — cybersecurity and enterprise IT.

Live site: https://stassinos.xyz/

A static portfolio with seven connected ocean scenes, a relief-lit lunar sphere, responsive navigation, and a persistent YouTube music player. The artwork supports WebGL2, a Canvas fallback, and reduced motion. Playback starts only after pressing Play.

## Sections

| Route | Section |
| --- | --- |
| #/home | Overview |
| #/bot | Experience |
| #/memory | Credentials |
| #/history | Education |
| #/trajectory | Projects and project briefs |
| #/metrics | Skills |
| #/console | Contact and CV |

Legacy project HTML pages and the root CV URL remain available.

## Editing and deployment

- assets/site-content.js contains the profile, project briefs, credentials, and music selection.
- assets/portfolio.js and assets/portfolio.css provide the interface.
- assets/ocean-worlds.js, assets/ocean-canvas.js, and assets/lunar-detail.js provide the art.
- GitHub Pages deploys the main branch. CNAME retains stassinos.xyz.
- Runtime asset URLs include content hashes to refresh changed files after releases.
- build_cv.py regenerates the root PDF; copy the finished PDF into assets/ as well.

Serve locally with Python's http.server bound to 127.0.0.1. There is no build step. Browser smoke checks are in tests/; npm test runs them with Playwright.
