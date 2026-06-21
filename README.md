# Kumar Saurabh — Personal Site

A custom dark, cinematic personal website + blog built with **Jekyll** and hosted free on
**GitHub Pages**. No theme — the design, animations and layout are all bespoke.

Live (after deploy): **https://kumsaurabh.github.io**

---

## 🚀 Deploy to GitHub Pages (one time)

GitHub Pages serves a *user site* from a repo named exactly `<username>.github.io`.

1. Sign in to GitHub as **`kumsaurabh`** and **create a repo** named exactly
   **`kumsaurabh.github.io`** (Public, no README).
2. **Push this folder** to it (it's already a git repo — just add the remote):
   ```bash
   cd D:/projects/kumsaurabh.github.io
   git remote add origin https://github.com/kumsaurabh/kumsaurabh.github.io.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**,
   pick **`main`** / **`/ (root)`**, Save.
4. Wait ~1 minute. Your site is live at **https://kumsaurabh.github.io**.

That's it — every future `git push` re-deploys automatically.

---

## ✍️ Add a blog post

Create a file in `_posts/` named `YYYY-MM-DD-title.md`:

```markdown
---
title: "Your post title"
date: 2026-07-01
categories: [ai, delivery]
read_time: "4 min read"
excerpt: "One or two sentences shown on the blog list."
---

Write your post in **Markdown** here.
```

Commit and push — it appears on `/blog/` automatically.

---

## 🎨 Edit content & settings

| Want to change… | Edit this file |
|---|---|
| Name, tagline, email, social links, nav | `_config.yml` |
| Hero text, About, Expertise, Work, Contact | `index.html` |
| Colors, fonts, spacing (design tokens up top) | `assets/css/style.css` |
| Animations / interactions | `assets/js/main.js` |
| Blog posts | `_posts/*.md` |

**Add your résumé:** drop a PDF in `assets/` (e.g. `assets/Kumar_Saurabh_Resume.pdf`),
then uncomment the `resume:` line in `_config.yml` — a "Résumé" button appears in the nav.

**Add Twitter/X or Instagram:** uncomment those lines under `social:` in `_config.yml`.

---

## 💻 Preview locally (optional)

Requires Ruby + Bundler.

```bash
cd D:/projects/kumsaurabh.github.io
bundle install
bundle exec jekyll serve --livereload
# open http://localhost:4000
```

---

## 🌐 Custom domain (optional, later)

Buy a domain (e.g. `kumarsaurabh.com`), then in **Settings → Pages → Custom domain**
add it and follow the DNS instructions. Update `url:` in `_config.yml` to match.
