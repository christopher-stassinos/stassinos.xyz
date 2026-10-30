# stassinos.xyz

Christopher Stassinos — cybersecurity and enterprise IT.

Live site: https://www.stassinos.xyz/ (the bare domain redirects here).

A static portfolio with seven connected ocean scenes, an ASCII crescent moon, responsive navigation, and a persistent YouTube music player. The artwork supports WebGL2, a Canvas fallback, and reduced motion. Playback starts only after pressing Play.

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
- Cloudflare Pages project `stassinos-portfolio` serves the public site over HTTPS. GoDaddy remains the domain registrar; Cloudflare hosts DNS.
- GitHub stores the source. After committing and pushing a release, run `python deploy_site.py` to publish it. A GitHub push alone does not deploy to Cloudflare.
- The deployment helper uploads only committed public files. Use `python deploy_site.py --prepare-only` to inspect the upload. Wrangler uses its existing local login; no credentials belong in this repository.
- `_headers` sets HTTPS transport and content-type protections. Keep Cloudflare Full (Strict), Universal SSL, and Always Use HTTPS enabled.
- Runtime asset URLs include content hashes to refresh changed files after releases.
- build_cv.py regenerates the root PDF; copy the finished PDF into assets/ as well.

Serve locally with Python's http.server bound to 127.0.0.1. There is no build step. Browser smoke checks are in tests/; npm test runs them with Playwright.
