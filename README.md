# Hear The Pitch

This application is available at https://igormukhin.github.io/hear-the-pitch/

## Development

Use Node.js 22.22.2 or newer on the Node 22 release line and npm 10 or newer.
Run `nvm use` to select Node 22, then `npm ci` to install dependencies.
Start the development server with `npm run dev` and verify changes with `npm run build`.

TypeScript stays on version 6 because the current `vue-tsc` release cannot run with TypeScript 7.

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
