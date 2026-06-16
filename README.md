# Chroma 🎨

A clean, modern random color palette generator. Click **Generate** (or hit
`Space`) to roll a fresh, harmonious 5-color palette. Click any color to copy
its hex code, and lock the ones you love so they survive the next roll.

## Features

- **One-click palettes** — five colors at a time, each labeled with its hex code
- **Click to copy** — tap any swatch to copy its code to the clipboard
- **Lock favorites** 🔒 — keep a color while you reroll the rest
- **Harmony modes** — Surprise me, Analogous, Complementary, Triadic, Monochrome
- **Keyboard friendly** — press `Space` to generate
- **Auto contrast** — hex labels stay readable on light *and* dark colors
- Zero dependencies, zero build step — just HTML, CSS, and vanilla JS

## Run locally

It's a static site, so just open `index.html` in your browser. Or serve it:

```bash
npx serve .
```

## Deploy to Vercel

This repo is ready to ship as-is (no build step).

**Option A — Vercel dashboard**
1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Other**. Leave build & output settings empty.
4. Click **Deploy**.

**Option B — Vercel CLI**
```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

That's it — Vercel serves the static files directly.

## Files

| File          | Purpose                                  |
| ------------- | ---------------------------------------- |
| `index.html`  | Markup + layout                          |
| `style.css`   | Styling, animations, responsive design   |
| `app.js`      | Palette generation, copy, lock, controls |
| `vercel.json` | Clean URLs + basic security headers      |
