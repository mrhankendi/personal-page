## Academic Pages (Next.js + Tailwind)

A fast, SPA-style academic website inspired by https://academicpages.github.io, built with Next.js App Router and Tailwind CSS. No full-page reloads when navigating between sections.

### What’s included
- Routes: Home, CV, Publications, Talks, Teaching, Blog, and dynamic Blog posts
- Shared sticky navbar and footer
- Content seeded via JSON in `src/data/`
- Simple content loader in `src/lib/content.ts`

## Try it locally (Windows PowerShell)

```powershell
# From the project folder
npm run dev
```

Then open http://localhost:3000

Build production assets:

```powershell
npm run build; npm start
```

## Customize content
- Edit `src/data/profile.json` for your name, bio, email, links
- Add/edit items in:
	- `src/data/publications.json`
	- `src/data/talks.json`
	- `src/data/teaching.json`
	- `src/data/posts.json` (supports a simple `content` string; you can switch to MDX later)

## Project structure
- `src/app/layout.tsx` — Site chrome (navbar + footer)
- `src/app/*/page.tsx` — Pages for Home, CV, Publications, Talks, Teaching, Blog
- `src/app/blog/[slug]/page.tsx` — Dynamic post page
- `src/lib/content.ts` — Content types and JSON loaders

## Next steps
- Replace placeholder text with your information
- Add a PDF CV and link it from the CV page
- If you want rich blog formatting, consider switching to MDX

