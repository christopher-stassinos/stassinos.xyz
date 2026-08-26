# stassinos.xyz

Personal portfolio of **Christopher Stassinos** — cybersecurity & enterprise IT.

**Live site:** [https://stassinos.xyz](https://stassinos.xyz)

A single-page, dependency-free portfolio with a monochrome "gallery" visual system: framed artwork, wall-label plaques, scan-line texture, and a persistent ambient audio player. Project briefs open seamlessly in an in-page overlay without a full navigation.

## Pages

| Page | Description |
| --- | --- |
| `index.html` | Portfolio home — profile, certifications, skills, resume timeline, contact |
| `alpaca-gpu-trading-bot.html` | Public Market Lab — systematic trading research stack (Mac mini + 5-GPU rig, Alpaca API, SQLite, Flask) |
| `siem-home-lab.html` | SIEM Home Lab — Splunk, pfSense, VMware, Windows Server AD detection engineering |
| `network-traffic-analysis.html` | Network Traffic Analysis — Wireshark, tcpdump, Kali Linux packet-analysis workflows |

## Stack

- Plain HTML/CSS/JS — no build step, no framework
- Hosted on GitHub Pages with a custom domain (`CNAME` → stassinos.xyz)
- `build_cv.py` regenerates `christopher-stassinos-cv.pdf`
- Playwright smoke tests in `tests/`

## Local development

```bash
python -m http.server 4173
# open http://127.0.0.1:4173
```

## Tests

```bash
npm install
npx playwright install chromium
npm test
```

Smoke checks cover mobile layout (single column, no horizontal overflow), the audio player controls, and the project-brief overlay.
