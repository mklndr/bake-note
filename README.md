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
Local accounts · Recipe CRUD (photo, ingredients, steps, link, favorites, print) · Discover (API + built-in) · Baking Journal (several journals on a shelf) with draggable sticky notes · BakeNotes page (colors, pin, categories, recipe attach) · Pantry (separate containers per expiry date) · What Can I Bake? · Shopping list
## Limitations
Data is per-browser/device. Passwords are only obfuscated – this is not real authentication.
## v3 additions
New palette and logo, improved dashboard, hover effects, Discover filters and cleaned API steps, recipe notes, unit and temperature conversion, cabinet-style pantry, interactive What Can I Bake?, sorted note-style shopping list, selectable profiles and backup/restore.
## v5 redesign
Top navigation (search, pill links, account menu) replaces the sidebar. New palette (Milk, Blush Oat, Dusty Rose, Cocoa Taupe, Espresso plus a berry accent), Fraunces headings, rebuilt landing page and dashboard, photo-first recipe cards, header search that filters My Recipe Book.

## Book view
My Recipe Book has a Book view toggle: recipes appear as pages of a flip-book (framer-motion). Run `npm install` after pulling this version.

## Bookshelf journal
Baking Journal is a shelf of journals. Click one to open it as a flip-book with entries as pages, page bookmarks and draggable sticky notes.

## Recipe APIs and keys
Discover uses TheMealDB (no key), RecipeAPI.io and Spoonacular. Put your keys in `.env` (see `.env.example`). Never commit `.env`; add the same variables in Vercel project settings. Vite exposes `VITE_` variables to the browser, so rotate the keys after your presentation or move the calls to a serverless function.
