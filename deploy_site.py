"""Publish only the committed public portfolio files to Cloudflare Pages."""

import argparse
from pathlib import Path
import shutil
import subprocess
import uuid


ROOT = Path(__file__).resolve().parent
PUBLIC_ROOT_FILES = {
    "index.html", "alpaca-gpu-trading-bot.html", "network-traffic-analysis.html",
    "siem-home-lab.html", "christopher-stassinos-cv.pdf", "icarus.jpeg",
    "NOTICE.md", "robots.txt", "sitemap.xml", "_headers",
}


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prepare-only", action="store_true",
                        help="Stage the committed public files without uploading.")
    args = parser.parse_args()
    if git("status", "--porcelain", "--untracked-files=no").strip():
        parser.error("Commit tracked changes before publishing.")
    commit = git("rev-parse", "HEAD").decode().strip()
    tracked = git("ls-tree", "-r", "--name-only", "HEAD").decode().splitlines()
    public = [name for name in tracked
              if name in PUBLIC_ROOT_FILES or name.startswith("assets/")]
    missing = PUBLIC_ROOT_FILES - set(public)
    if missing:
        parser.error("Missing public files: " + ", ".join(sorted(missing)))
    # Each run gets a new directory; previous output is never deleted.
    staging = ROOT / ".cloudflare-build" / f"{commit[:12]}-{uuid.uuid4().hex[:8]}"
    staging.mkdir(parents=True)
    for name in public:
        target = staging / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(git("show", f"{commit}:{name}"))
    print(f"Prepared {len(public)} public files from {commit[:12]} in {staging}",
          flush=True)
    if args.prepare_only:
        return
    npx = shutil.which("npx.cmd") or shutil.which("npx")
    if not npx:
        parser.error("Install Node.js from nodejs.org, then run this again.")
    subprocess.run([
        npx, "--yes", "wrangler@4.156.0", "pages", "deploy", str(staging),
        "--project-name", "stassinos-portfolio", "--branch", "main",
        "--commit-hash", commit,
    ], cwd=ROOT, check=True)


if __name__ == "__main__":
    main()
