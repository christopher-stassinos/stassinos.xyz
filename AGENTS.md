# Publishing

The live custom domain is served by Cloudflare Pages project `stassinos-portfolio`.
GitHub stores the source; pushing to GitHub alone does not publish to Cloudflare.

After committing and pushing an authorized release, run `python deploy_site.py`.
The helper uploads only committed public files, preserving the current layout.
Use `python deploy_site.py --prepare-only` to inspect the upload without publishing.
It uses the existing Wrangler login and never stores credentials in this repo.

Keep Cloudflare SSL mode Full (Strict), Universal SSL enabled, and Always Use HTTPS
enabled. Both `stassinos.xyz` and `www.stassinos.xyz` belong to this Pages project.
DNS is hosted at Cloudflare; the domain registration remains at GoDaddy.
