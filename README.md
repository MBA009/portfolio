# Portfolio

Static portfolio site — plain HTML, CSS and JS. No build step.

## Edit

- `index.html` — all content (name, projects, about, experience, links). Search for `Your Name`, `you@example.com`, `your-username`.
- `style.css` — design tokens are at the top (`:root`).
- `script.js` — `TIMEZONE` for the footer clock.
- Drop a `resume.pdf` in this folder for the résumé links.

## Projects

Each project has its own page in `projects/` and a media folder in `assets/projects/<name>/`.

Add images or videos by dropping files into that folder with these names. No HTML editing needed:

| File | Where it shows |
|---|---|
| `cover.*` | Large banner under the project title |
| `01.*` – `04.*` | Gallery (caption text is in the project's HTML) |

Supported: `.webp .png .jpg .jpeg .gif .avif .mp4 .webm`. Keep videos short and compressed (GitHub's file limit is 100 MB; aim for under 10 MB).

- Empty slots show a dashed placeholder when previewing locally, and are hidden on the live site.
- For more than four, copy a `<figure>` in the page and bump the number.
- For a YouTube video, use `data-youtube="VIDEO_ID"` instead of `data-media="..."`.
- For a looping silent clip (like a GIF), add `data-autoplay` to the `<figure>`.
- To add a new project, copy a page in `projects/`, make a matching folder in `assets/projects/`, and add a row to the Selected Work list in `index.html`.

Preview locally with `python -m http.server` and visit http://localhost:8000.

## Deploy to GitHub Pages

```sh
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/<username>/<username>.github.io.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)`**.

Naming the repo `<username>.github.io` serves the site at `https://<username>.github.io`. Any other repo name serves it at `https://<username>.github.io/<repo>/`.
