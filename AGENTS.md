# Repository Guidelines

## Project Structure & Module Organization

This is a Vue 3 and TypeScript ear-training application built with Vite. `src/main.ts` initializes the app; `src/App.vue` switches between exercises. Exercise interfaces live in `src/components/` (`GuessPitch.vue` and `LowerHigher.vue`). Shared pitch conversion and audio playback code lives in `src/support/`, including the WebAudioFont implementation. Styles and images belong in `src/assets/`. Production output goes to the ignored `dist/` directory. `.github/workflows/build.yml` builds and deploys to GitHub Pages on pushes to `main`.

## Build, Test, and Development Commands

- `npm ci`: install dependencies from `package-lock.json` reproducibly.
- `npm run dev`: start the Vite development server.
- `npm run type-check`: check TypeScript and Vue components with `vue-tsc`.
- `npm run build`: run type checking and generate the production bundle in parallel.
- `npm run build-only`: generate the bundle without type checking.
- `npm run preview`: serve the built bundle locally for production verification.

## Coding Style & Naming Conventions

Use Vue single-file components with `<script setup lang="ts">` and the Composition API. Name components in PascalCase and support modules in lowercase, following existing filenames. Use descriptive camelCase names for new functions and variables. Prefer `@/` imports for modules under `src/`. Match the surrounding file's formatting: Vue script/template blocks generally use two-space indentation, while support modules use four spaces. Quote and semicolon styles vary; avoid unrelated reformatting. No ESLint or Prettier configuration is currently provided.

## Testing Guidelines

There is no automated test suite, test script, or coverage threshold configured. Run `npm run build` before submitting changes. Manually verify both exercises in the browser, including playback, replay, answer feedback, pitch hints, and the Lower Higher gap and same-note controls. Audio changes require listening checks. If introducing automated tests, document the framework and execution command alongside them.

## Commit & Pull Request Guidelines

History uses short, lowercase descriptions such as `new exercise: lower higher` and `fix relative path`; follow that concise style. Keep commits focused. Pull requests should explain the behavior change, reference related issues when applicable, and list build and manual verification results. Include screenshots for visible interface changes. Preserve relative asset paths for deployment under the GitHub Pages project URL, and avoid committing generated output or dependencies.
