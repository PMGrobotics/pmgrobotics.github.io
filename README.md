# PMG Embedded — website

Company website for **PMG Embedded** (pmgembedded.com), hosted on GitHub Pages.

Built with plain HTML + CSS + JavaScript. No build step, no frameworks, no dependencies to install. Content is driven by YAML files that you edit directly.

---

## How to test locally

You need a local HTTP server because the browser blocks loading YAML files directly from disk (`file://`). Python ships with one built in:

```bash
cd ~/projects/pmgembedded.github.io   # or wherever the repo is
python3 -m http.server 8000
```
> On Windows: same command, just use `python` instead of `python3`.

Then open **<http://localhost:8000>** in your browser.

Press `Ctrl+C` in the terminal to stop the server.

---

## How to publish changes

```bash
git add .
git commit -m "describe what you changed"
git push
```

GitHub Pages rebuilds automatically. The site is live at pmgembedded.com within 1–2 minutes.

---

## File structure

```txt
index.html          — the website shell (rarely needs editing)
assets/
  style.css         — all visual styling
  app.js            — all JavaScript (routing, rendering)
  jsyaml.min.js     — YAML parser library (don't touch)
data/
  config.yaml       — company name, tagline, email, partners  ← edit this
  projects.yaml     — all projects                            ← edit this
  team.yaml         — team members                            ← edit this
images/
  logo-white.png    — navbar + footer logo (white letters, for dark background)
  logo-mark.png     — icon/favicon (the green chevron symbol)
  team/             — team headshots (danilo.png, nikola.png, sladjan.png, zelimir.png)
  projects/         — one subfolder per project
    am1808/
    smart-lock/
    sagitta/        — (empty, add images when available)
    twinkle/        — (empty)
    mpc8313/        — (empty)
    smart-suitcase/ — (empty)
    lorawan-meter/  — (empty)
CNAME               — custom domain (pmgembedded.com)
```

---

## How to add a project

1. Create a folder: `images/projects/my-project/`
2. Copy your images there (`.png` or `.jpg`)
3. Open `data/projects.yaml` and add a block at the bottom:

```yaml
- id: my-project          # URL slug — no spaces, lowercase, hyphens only
  title: My Project
  client: Client Name
  category: PCB Design
  thumbnail: "images/projects/my-project/main.png"   # shown on card + hero slideshow
  summary: "One sentence shown on the project card."
  description: |
    First paragraph of the longer description on the project detail page.

    Second paragraph (leave a blank line between paragraphs).
  images:
    - "images/projects/my-project/main.png"
    - "images/projects/my-project/photo2.png"
  tags:
    - PCB Design
    - STM32
```

1. Refresh <http://localhost:8000> — the card appears automatically, and the thumbnail is added to the rotating hero slideshow.

To **hide** a project without deleting it, add `hidden: true` to its block. It will be excluded from the project cards and hero slideshow.

---

## How to update team members

Edit `data/team.yaml`. To add a member, copy an existing block and fill it in. Put the photo in `images/team/`.

## How to add a contact form - Done

1. Sign up at [formspree.io](https://formspree.io) (free tier: 50 submissions/month)
2. Create a new form — Formspree gives you an endpoint URL like `https://formspree.io/f/xyzabcde`
3. Paste it into `data/config.yaml` under `form_endpoint:`

The contact section will automatically switch from an email button to a full name/email/message form.

## How to update partners

Edit `data/config.yaml` under the `partners:` key. Each partner needs a `name`, `url`, and a `logo` path (relative, e.g. `images/partner_logos/example.svg`, or leave `""` to show the name as text).

## How to update company info / email / tagline

Edit `data/config.yaml`.

---

## How the site works (for Claude)

Single-page app with hash-based routing:

- `/` or `/#` → home page (hero + services + projects + partners + team + contact)
- `/#project/<id>` → project detail page
- `/#projects`, `/#team`, etc. → home page, scrolled to that section

**Data flow:** `init()` fetches the three YAML files via `fetch()`, parses them with js-yaml, stores in `state`, then calls `router()`. The router decides which view to render into `#app`. Hash changes re-trigger `router()`.

**Hero slideshow:** auto-cycles every 3 seconds through projects that have a `thumbnail` set. Clicking a slide navigates to that project (`#project/<id>`).

**Project cards:** horizontal scroll strip. Each card is clickable → project detail.

**Project detail:** renders title, tags, image gallery (click to lightbox), description paragraphs. Back button uses `history.back()` or falls back to `#`.

**No build step.** Edit files, refresh browser. `jsyaml.min.js` is bundled locally (not CDN) so it works offline.

---
