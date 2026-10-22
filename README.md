# NusaVerse

A browser game about Indonesian culture. Pick a province on the map, walk through its 3D museum hall, answer the quiz, and collect stamps in your culture passport.

The app covers 34 provinces (the map predates the 2022 Papua split) with 335 exhibits: 111 3D models and 224 photos. All UI text is in Indonesian.

## Features

### Main menu

- Animated title over performance photos that crossfade every 7 seconds.
- A "Tahukah kamu?" fact balloon that cycles through exhibit facts. Click to read the full text, or press "Lagi!" for another one.
- Three pinned exhibit cards. Clicking one opens the map with that province selected. "Acak koleksi" deals three new cards.
- Mouse parallax, a scrolling ticker of province names, and a volume slider with mute.
- Arrow keys move between menu items. Background rotation and fact cycling stop when the system asks for reduced motion.

### Province map

- SVG map of Indonesia. Click a province or pick it from the list grouped by island.
- Double click, or press Enter on the selected province, to enter its museum.
- Provinces you already stamped are filled in red on the map.
- The side panel shows the province summary, how many exhibits you have seen there, and whether you finished its quiz and curator mission.

### 3D museum

Each province gets its own gallery hall built with React Three Fiber: a barrel-vaulted corridor that ends in a half dome. The main exhibit (always a 3D model) stands in the center of the apse. The rest alternate along the walls, photos hung on the wall and models on pedestals, each with a spotlight and a text plaque. Small objects spin slowly on turntables. Carpet and trim colors change per island. The whole scene uses a comic book style with ink outlines and halftone shading.

| Input | Action |
| --- | --- |
| Click the scene | Lock the cursor and look around |
| W A S D or arrow keys | Walk |
| Shift | Run |
| E | Inspect the exhibit under the crosshair |
| Hold right click | Zoom |
| C | Switch between look mode and free cursor |
| H | Show a hint for the current mission |
| I | Province info |
| K | Quiz |
| Esc or M | Pause menu |

On touch screens, drag to look and hold the on-screen arrows to move. The tour buttons at the bottom move you from one exhibit to the next. Exhibits opened that way do not count for the mission. Footsteps play as you walk. You cannot walk through pedestals, benches, or plants.

The three.js code is only downloaded once you reach the map, so the menu loads fast. If WebGL fails, the hall shows an error with a retry button instead of a blank screen.

### Curator mission

Every hall has a mission with three exhibits to find. They are found one at a time, and each clue is the exhibit description with the words from its title blanked out. The hint shows the first letter of each word. Finding all three earns a curator star for that province.

### Province info

The info panel lists the traditional house, attire, dance, regional song and instrument, the food on display in the hall, and a short history.

### Quiz and stamps

Each province has its own quiz. Get at least two thirds of the answers right to earn its stamp. Stamps, seen exhibits, and curator stars are saved in the browser, so the game works without an account. Progress stays in sync across open tabs.

### Tebak asal (guess the origin)

Ten rounds. Each round shows a photo from a random province and four choices. One wrong choice always comes from the same island, so you cannot guess from the island alone. The game tracks your streak and keeps your best score on the device. After each answer you can open that province on the map.

### Culture passport

- Stamp count, island badges (earned when every province on an island is stamped), and curator stars.
- A collection album that counts seen exhibits in seven categories: buildings, clothing, food, art and music, traditions, heirlooms, nature and wildlife.
- Unstamped provinces link back to the map.
- A button to clear all progress on the device. Stamps saved to an account are not affected.

### Accounts and leaderboard

Accounts use Supabase Auth with email and password.

- Sign up with a display name, sign in, sign out, and change your name.
- When you sign in, stamps on the device are uploaded and stamps from the account are downloaded.
- The leaderboard shows the top 20 accounts by stamp count. Ties go to whoever got their last stamp first. The list is cached and refreshed whenever someone earns a stamp.

### Community stories

Signed-in players can send a story about a province's culture: a title of 3 to 80 characters and a body of 20 to 2000. Stories appear in the "Cerita warga" panel of that province only after a curator approves them. Each account can have at most 5 stories waiting for review.

### Curator room

`/admin` is only open to accounts with the admin role. It shows:

- Totals for registered accounts, stamps given, published stories, and stories waiting for review.
- The moderation queue with approve and reject buttons.
- Stamps per province as a bar list.
- The 50 newest users, with a button to grant or remove the curator role. Admins cannot change their own role.

Access rules live in the database as row level security policies, not only in the app.

### Other

- Sound effects for clicks, page turns, stamps, right and wrong answers, and footsteps. Volume and mute are remembered on the device.
- Fullscreen toggle in the pause menu. On Chrome and Edge, Esc opens the pause menu instead of leaving fullscreen.
- All panels use the native `<dialog>` element, so focus stays inside and Esc closes them.
- The "Kredit aset" panel lists the author and license of every model, photo, texture, and sound.

## Tech stack

- Next.js 16 (App Router, Server Actions, `"use cache"`) and React 19
- three.js with React Three Fiber and drei
- Supabase for auth and Postgres
- Tailwind CSS 4
- vinext and Cloudflare Workers for the Cloudflare build

## Running locally

Requires Node.js 22.18 or newer and pnpm.

```bash
pnpm install
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Supabase, Project Settings, API. Without them the museum, quiz, and passport still work, and the account features show a notice instead.

Set up the database by running `supabase/schema.sql` once in the Supabase SQL Editor. It is safe to run again. To make the first admin, sign up in the app, then run the `update` statement at the bottom of that file with your email.

```bash
pnpm dev          # Next.js dev server on http://localhost:3000
pnpm dev:vinext   # same app on Vite, http://localhost:3001
```

## Deploying to Cloudflare

The Cloudflare build uses [vinext](https://github.com/cloudflare/vinext), which runs the same `app/` directory on Vite and deploys it as a Cloudflare Worker. The config is in `vite.config.ts` and `cloudflare.config.ts`. Cached responses are stored with Workers Response Store, which runs as a second Worker named `uinic-response-store` backed by an R2 bucket.

The Supabase values in `.env.local` are compiled into the build, so they must be present on the machine that runs the deploy.

One-time setup:

```bash
pnpm exec cf auth login
pnpm exec cf r2 buckets create --name uinic-response-store-cache-bodies
pnpm build:vinext
pnpm deploy:response-store
```

Deploy the app (run this again for every update):

```bash
pnpm deploy:vinext
```

After the first deploy, add the Worker URL to Supabase under Authentication, URL Configuration. Otherwise email confirmation links will point to the wrong site.

To test the Worker build locally before deploying:

```bash
pnpm build:vinext
pnpm start:vinext
```

The regular Next.js build (`pnpm build`) still works for Vercel or any Node host.

Two limits to know about on Cloudflare: vinext marks `cacheComponents` support as experimental, and `next/image` serves images without resizing unless Cloudflare Images is configured.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Next.js dev server |
| `pnpm build` / `pnpm start` | Next.js production build and server |
| `pnpm dev:vinext` | Dev server on Vite |
| `pnpm build:vinext` | Build for Cloudflare Workers |
| `pnpm start:vinext` | Run the Worker build locally |
| `pnpm deploy:vinext` | Build and deploy to Cloudflare |
| `pnpm deploy:response-store` | Deploy the cache Worker |
| `pnpm check:data` | Validate province data against the map and quiz answers |
| `pnpm assets` | Download missing models, photos, textures, and HDRI |
| `pnpm lint` | ESLint |

`pnpm assets` skips files that already exist. Models come from Sketchfab and need `SKETCHFAB_TOKEN` in `.env.local`.

## Project layout

```
app/              pages, server actions, auth callback, /admin
components/       game screens, 3D museum, quiz, passport, forms
data/             province and exhibit data, asset list, data check
lib/              Supabase clients, passport storage, sound effects
public/           models, photos, textures, HDRI, sound effects
scripts/          asset download script
supabase/         database schema and policies
proxy.ts          refreshes the Supabase session cookie
```

## Credits

3D models are from Sketchfab, photos from Wikimedia Commons, textures, HDRI and furniture from Poly Haven, sound effects from Kenney, and the province map from `@svg-maps/indonesia`. Each item's author and license is listed in the "Kredit aset" panel in the game.
