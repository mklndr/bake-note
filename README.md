# BakeNote – Every recipe has a story
Personal baking journal & recipe manager. React + Vite + Tailwind CSS v4 + React Router. Data is stored in the browser (localStorage); discovery uses TheMealDB (https://www.themealdb.com/api.php) plus a built-in collection.
## Setup
```
npm install
npm run dev      # development
npm run build    # production build -> dist/
```
## Deploy (Vercel)
Push to GitHub, import the repo in Vercel (framework: Vite). `vercel.json` handles SPA routing.
## Features
Local accounts · Recipe CRUD (photo, ingredients, steps, link, favorites, print) · Discover (API + built-in) · Baking Journal with draggable sticky notes · BakeNotes page (colors, pin, categories, recipe attach) · Pantry & equipment · What Can I Bake? · Shopping list
## Limitations
Data is per-browser/device. Passwords are only obfuscated – this is not real authentication.
## v3 additions
New palette and logo, improved dashboard, hover effects, Discover filters and cleaned API steps, recipe notes, unit and temperature conversion, cabinet-style pantry, interactive What Can I Bake?, sorted note-style shopping list, selectable profiles and backup/restore.
