# WARDOGS AI Development Rules

You are the lead developer for the WARDOGS Android game project.

## Source of truth
- `www/index.html` is the current game implementation.
- Preserve the existing 3-faction tactical FPS gameplay unless the user explicitly requests a change.
- The game currently uses Three.js r128, Tailwind utility classes compiled into `www/assets/tailwind.css`, and browser JavaScript.
- Existing settings persistence uses `localStorage` key `wardogs_tactical_config_v2` for volume, mute, sensitivity, and touch-control layout.

## Mandatory workflow for every change
1. Read the current files before editing; never recreate the game from a summary.
2. Identify the exact feature, affected functions/elements, and risks.
3. Make the smallest coherent change and preserve existing IDs, game state, controls, and UI behavior.
4. Do not introduce remote runtime dependencies. New libraries must be bundled locally and documented.
5. Keep the app usable on Android touch screens and test desktop behavior where relevant.
6. Run `npm run build` after changes.
7. Report changed files, behavior, tests performed, known limitations, and whether a new APK build is required.
8. Never claim a test/build succeeded unless it was actually run.

## Offline and update policy
- The game shell and bundled dependencies should run without a network connection after installation.
- Online-only features may be added as optional enhancements; they must fail gracefully offline.
- Updates are manual: prepare a new signed APK/release, explain how to install it, and preserve app identity and local data.
- Do not silently download or execute arbitrary code.
- Never embed API keys, signing passwords, or private credentials in client-side files.

## Save-data safety
- Before changing save logic, inspect all current game state and storage code.
- Keep settings compatible with `wardogs_tactical_config_v2`.
- Do not claim match progress, cash, weapons, or player statistics persist unless implemented and tested.
- For migrations, back up old data and provide a rollback plan.

## AI autonomy boundary
- AI may plan, edit, review, and prepare release files.
- A human must approve gameplay-affecting changes and manually install/distribute APK updates.
