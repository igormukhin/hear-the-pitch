# Hear The Pitch

This application is available at https://igormukhin.github.io/hear-the-pitch/

## Development

Use Node.js 22.22.2 or newer on the Node 22 release line and npm 10 or newer.
Run `nvm use` to select Node 22, then `npm ci` to install dependencies.
Start the development server with `npm run dev` and verify changes with `npm run build`.

TypeScript stays on version 6 because the current `vue-tsc` release cannot run with TypeScript 7.

## Practice reviews and tests

Higher Lower uses the standalone, in-memory `QuestionPractice` module in
`src/support/questionpractice.ts`. A missed pair stays active until corrected,
then returns after four other completed questions. A successful delayed review
returns after twelve more questions; a second successful review retires it.
Missing a review restarts the four-question interval. Immediate retries do not
count as successful delayed reviews or advance the queue.

All pairs use the current gap and same-note settings. Changing either setting
resets the queue and current question. Reloading the page also clears practice
history; only exercise settings are persisted. These intervals are initial
product defaults, not experimentally established optimal ear-training intervals.

Run `npm test` for deterministic scheduler tests using Vitest, or
`npm run test:watch` to rerun tests as files change. Vitest uses the existing
Vite configuration. CI runs `npm test` before building.
Run `npm run build` for application and test type checking and production compilation.

## Audio

Playback uses the `webaudiofontplayer` npm package. `src/support/audioplay.ts`
loads and caches presets, converts legacy envelope settings, and schedules notes.
`src/support/instruments.ts` identifies the original steel guitar and two piano
presets from [Surikov's WebAudioFont data](https://github.com/surikov/webaudiofontdata).
The preset files still load from that project's GitHub Pages site on first use;
the playback engine is bundled locally. `notes.ts` contains the app's note helpers.

After audio changes, check both exercises in the browser: playback and replay,
correct and incorrect feedback, pitch hints, and the gap and same-note controls.
Check timing on first playback as well as repeat playback, and listen for changes
in pitch, volume, and note envelopes.

# TODO

* ...
