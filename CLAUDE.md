# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. Claude Code is meant to act as a teacher not the builder of this project. It will help answer questions and only code when prompted to do so. 

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build via Vite
- `npm run lint` — run ESLint over the project
- `npm run preview` — preview the production build locally

There is no test runner configured. `node_modules/.bin/jiti some-scratch-test.ts` will execute a TypeScript file directly if you want to sanity-check pure logic like [src/data/schedule.ts](src/data/schedule.ts) without adding a test framework.

## Architecture

TeacherTime is a React 19 + TypeScript + Vite app styled with Tailwind CSS v4 (via `@tailwindcss/vite`, configured in [vite.config.ts](vite.config.ts)). A teacher builds a class schedule out of ordered, colored time blocks, then runs it as a series of analog clock faces so young students (2nd grade) can learn to read analog time.

The app is exactly two pages, routed with `react-router-dom`:

- `/` → [src/pages/Settings.tsx](src/pages/Settings.tsx) — build the schedule.
- `/clock` → [src/pages/Clock.tsx](src/pages/Clock.tsx) — run it.

[src/App.tsx](src/App.tsx) owns the `blocks` state, the `startTime` string, and the resolved `start` instant above `<Routes>`, so the schedule survives navigating between the two pages, and passes them down as props. Submit on Settings resolves `startTime` to an absolute instant, saves the session, then navigates to `/clock`; the browser back button returns to Settings natively. `/clock` with no resolved start (a reload straight onto that URL) redirects to `/`.

### Data

[src/data/BlockData.ts](src/data/BlockData.ts) defines the `BlockData` type (`id`, `name`, `color`, `duration`) plus `isValidDuration`, `durationToMinutes`, and `createBlock`. Durations are plain `HH:MM` strings validated by regex rather than a Date/duration library — keep new duration handling consistent with these helpers.

[src/data/schedule.ts](src/data/schedule.ts) is the pure core of the clock page and has no React in it. `buildSchedule(blocks, start)` lays the blocks end to end on an absolute timeline starting at `start`, then cuts that timeline at wall-clock hour boundaries so **each clock face covers exactly one real hour**. A block straddling a boundary produces a wedge on both faces. Angles are degrees clockwise from 12 o'clock (6° per minute). `clockIndexAt` / `blockIndexAt` locate the current face and block for a given instant, `containsTime` answers whether one face covers a given instant, and `remainingWedges` trims a face's wedges back to `now`. `resolveStart` turns the `HH:MM` value of an `<input type="time">` into an absolute instant on a reference day, with `""` meaning "start now" — so no AM/PM parsing or start-time validation lives in the app.

`start` may be in the past (a teacher setting up late) or the future (setting up early); nothing in `buildSchedule` assumes otherwise, and `clockIndexAt` clamps at both ends.

For a future start, `buildSchedule`'s third argument `from` widens the face range backwards so the hours between now and `start` become **faces with no wedges**. That keeps the carousel sitting on the real current hour — an empty clock with live hands — and lets the first block hour wait in the upcoming slot and take the centre when it actually starts, instead of parking a future hour in the centre from the moment the page opens.

[src/data/storage.ts](src/data/storage.ts) persists the session to `localStorage` under a versioned key, written only when Submit is pressed so a half-edited schedule can't overwrite the one actually run. `loadSession` is all-or-nothing: unreadable storage, bad JSON, or blocks that fail the shape guard all return `null` and App falls back to the three default blank blocks.

Hour flooring uses `Date.setMinutes(0,0,0)` / `setHours(h+1,0,0,0)` rather than modulo arithmetic on epoch ms, so it stays correct in half-hour timezones and across DST.

### Clock page behaviour

- **The start instant arrives as a prop**, already resolved by Settings, so the schedule can't slide forward on every tick.
- The one pinned value left is `openedAt` (`useState(() => Date.now())`), passed to `buildSchedule` as `from`. It only sets how far back the carousel reaches, never when the schedule runs; pinning it stops the lead-in faces being trimmed away as the hours pass.
- **Wedges only ever show time still to come.** [ClockCarousel](src/components/ClockCarousel.tsx) draws `remainingWedges(clock, now)` rather than `clock.wedges`, so the running block's color shrinks away behind the minute hand, a finished block disappears, and a face whose hour has passed comes back blank. Elapsed color on a face would read to a child as "there's still that much left", which is the opposite of the truth.
- Faces in the future keep their full wedges, so a face always reads exactly like a real wall clock at that hour.
- Trimming happens at render, not in `buildSchedule`: the schedule stays a stable structural layout memoized on `[blocks, start, openedAt]`, and only the drawn wedges follow `now`.
- [src/hooks/useNow.ts](src/hooks/useNow.ts) re-renders once a second to move the hands.
- [src/components/ClockFace.tsx](src/components/ClockFace.tsx) draws one face as SVG in a 100×100 viewBox: numbers and ticks around the outside, colored wedges as an inner Time Timer style disc (already trimmed to `now` by the carousel), and live hour + minute hands (no second hand). **Hands render only on the centre face when that face actually contains `now`** (`isCurrent && containsTime(clock, now)`) — being centred isn't enough, since a future start or a finished schedule centres the nearest face rather than the one `now` falls in, and real hands there would point at a time outside that hour and mislead a child. Hands are drawn twice, a `var(--bg)` halo under a `var(--text-h)` stroke, so they stay readable over any wedge color.
- [src/components/ClockCarousel.tsx](src/components/ClockCarousel.tsx) draws **only two faces**: `clocks[index]` in the middle column, as large as the space allows, and `clocks[index + 1]` small beside it on the right. Hours that are over aren't rendered at all, and **nothing animates** — when the hour turns the next face simply becomes the current one. The row used to slide left as the index advanced; that's gone deliberately, because the legend now sits immediately to the left and a face moving that way would run into it.
- **The three columns are what centres the clock.** [Clock.tsx](src/pages/Clock.tsx) lays the page out as legend | current hour | next hour, and the `SIDE_COLUMN` class string is used for *both* outer columns, so the middle column — and the face centred in it — lands exactly in the middle of the window. Change that width in one place and the mirroring holds. Each face is a `w-[92%] aspect-square max-h-[92%]` box with the SVG letterboxing inside it, so the face grows to fill whichever of width or height runs out first — the 92% just keeps it a touch off the legend and off the top and bottom — and its time label stays right underneath.
- The clock page breaks out of the `#root` 1126px column (`w-dvw ml-[calc(50%-50dvw)]`) so a projector or classroom TV gets the whole window. Settings keeps the narrow column.
- [src/components/Legend.tsx](src/components/Legend.tsx) shows the running block with a countdown, then the remaining blocks rolling along underneath, and sits in the **left column** with the Back button under it — so the page reads left to right: what's happening now, then the hours it happens in.
- [src/components/FinishedModal.tsx](src/components/FinishedModal.tsx) appears when the last block ends, with Close and Back to Settings. `src/assets/chime.mp3` plays once at that moment; playback failures are swallowed so a blocked autoplay can't take the page down.

### Deployment

Pushing to `main` builds and publishes `dist` to GitHub Pages ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) on the custom domain in [public/CNAME](public/CNAME). Pages serves static files only and has no SPA fallback, so [public/404.html](public/404.html) catches every URL that isn't `/` — including a refresh on `/clock` — and redirects to Settings. That mirrors what App does for `/clock` in dev: a reload has no resolved start time, so the teacher lands on Settings and presses Submit again.

### Styling

Deliberately plain and utilitarian — thin `border`s, `rounded-sm`, `text-sm`, colored text buttons with hover states (`text-green-500 hover:text-green-300`).

Button color carries meaning across both pages; keep new buttons inside this vocabulary rather than picking a color for looks:

| Color | Means | Buttons |
| --- | --- | --- |
| blue | changes page | Submit, back, Back to Settings |
| green | adds to the schedule without leaving the page | Add Block |
| red | removes | Remove |
| gray | dismisses a popup, changes nothing | Close (both modals) |
| pink | explains | ⓘ |

Every one is `text-<color>-500 hover:text-<color>-300`; disabled stays `text-gray-400` with the hover suppressed. Don't introduce shadows, gradients, or a heavier design system. [src/index.css](src/index.css) defines the `--text` / `--text-h` / `--bg` / `--border` custom properties and a dark-mode block; Tailwind v4's default border color is `currentColor`, so SVG strokes using `currentColor` match the surrounding borders automatically.
