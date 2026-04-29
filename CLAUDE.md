# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local development

No build step. Serve the repo root with a local HTTP server (required because `fetch()` is blocked on `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publishing

```bash
git add <files>
git commit -m "description"
git push
```

GitHub Pages auto-deploys within ~1–2 minutes. Live site: pmgembedded.com (CNAME configured).

## Architecture

Single-page app — one `index.html` shell, all logic in `assets/app.js`, all styles in `assets/style.css`. Content is data-driven from three YAML files parsed at runtime by the bundled `assets/jsyaml.min.js`.

**Data flow:** `init()` → fetches `data/config.yaml`, `data/projects.yaml`, `data/team.yaml` in parallel → stores in `state` object → calls `router()`.

**Routing:** hash-based. `#project/<id>` renders the project detail view; any other hash renders the home page and optionally smooth-scrolls to a section (`#projects`, `#team`, `#contact`, `#services`). Hash changes re-trigger `router()`.

**Rendering:** entirely via `innerHTML` — each view is built by composing HTML strings from functions (`heroHTML`, `servicesHTML`, `projectsHTML`, etc. for home; `renderProject` for detail). Event listeners are re-attached after each render.

**Project detail gallery:** first image gets the `gallery-item-main` class (displayed larger). All gallery images are clickable → lightbox. `hidden: true` in a project block removes it from both the card grid and the hero slideshow.

## Content editing

All content changes go through the three YAML files — `index.html` and `app.js` rarely need touching.

### `data/projects.yaml`
- `id`: URL slug used in `#project/<id>` — must be unique, lowercase, hyphens only
- `thumbnail`: shown on the project card and in the hero slideshow; leave `""` to show a letter placeholder and exclude from the slideshow
- `images`: first image is displayed as the main/hero image in the detail gallery; rest appear below
- `hidden: true`: hides from cards and slideshow without deleting
- `description`: supports multi-line YAML (`|` block scalar); each non-empty line becomes a `<p>` tag

### `data/config.yaml`
- `tagline`: supports HTML (`<br>`, `<em>`) for the hero headline
- `form_endpoint`: Formspree URL; when set, the contact section renders a full form instead of an email button
- `partners`: each entry needs `name`, `url`, and `logo` (path relative to site root, or `""` for text fallback)

### `data/team.yaml`
- `photo`: path relative to site root, or `""` to show initials
- `linkedin`: when set, wraps the photo in a link with an overlay icon

## Image conventions

- Project images go in `images/projects/<project-id>/`
- Team headshots go in `images/team/`
- Partner logos go in `images/partner_logos/`
- PNG and JPG both work; prefer PNG for PCB renders
