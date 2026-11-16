# WARDOGS Android — starter project

This project wraps the uploaded single-file WARDOGS HTML game as an Android app using Capacitor.

## What is prepared
- Original game copied to `www/index.html`.
- Tailwind CDN replaced by a locally compiled CSS file.
- Three.js r128 is installed as an npm dependency and copied locally during build.
- Google Fonts CDN link removed; system font fallbacks are used so the game does not need that network request.
- Capacitor Android configuration and scripts.
- AI development rules in `WARDOGS_AI_RULES.md`.

## Requirements on the build computer
- Node.js LTS and npm
- Android Studio with Android SDK
- A JDK version supported by the installed Android Gradle Plugin

## First setup
From this folder:

```bash
npm install
npm run build
npm run android:init
npm run android:sync
npm run android:open
```

In Android Studio, wait for Gradle sync, select an emulator or connected Android device, then Run.

To create an APK, use Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
For a distributable release, create and securely store a signing key, then build a signed APK/AAB. Do not put signing credentials in this project.

## Manual update model
1. AI edits the source files and records the changes.
2. Run `npm run android:sync`.
3. Build a new APK in Android Studio.
4. Test it, then distribute the new APK.
5. The user installs the update manually.

Keep `appId` in `capacitor.config.json` unchanged so Android recognizes later builds as updates to the same app. Use the same signing key for update installs.

## Partial offline behavior
The game HTML, compiled Tailwind CSS, and Three.js library are packaged locally. The game should therefore not need a network connection for those assets. This is not yet a formal offline certification: test airplane mode on the target device. Any future online account, cloud-save, analytics, or remote content feature will require connectivity.

## Current save-data limitation
The uploaded game explicitly saves **settings only** in localStorage under `wardogs_tactical_config_v2` (volume, mute, sensitivity, and touch layout). This starter does not add persistent match progress, money, weapon purchases, or statistics. Those systems need a separate design and implementation after auditing the game state.

## AI development workflow
Give the AI the task and ask it to follow `WARDOGS_AI_RULES.md`. Have it inspect the current code, make a focused change, run the build, and provide a test report. Human approval and manual APK installation remain required.

## Project status
Starter files are prepared. Android platform generation, dependency installation, Gradle build, device testing, and APK signing still need to be performed on a computer with Android tooling.
