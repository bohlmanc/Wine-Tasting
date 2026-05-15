# Gradle / Android Build — Windows Fixes

## Current working state

- Gradle: **8.10.2** (set by Expo's prebuild template in `android/gradle/wrapper/gradle-wrapper.properties`)
- Android Gradle Plugin: **8.6.0**
- The `android/` folder was regenerated with `npx expo prebuild --platform android --clean` to get the correct Expo 52 / RN 0.76 template

## What was broken and how it was fixed

### 1. `@react-native-community/cli` was missing

`native_modules.gradle` resolves the CLI binary at build time. With only `cli-platform-android` installed (not `cli` itself), it fell back to `require('react-native/cli').bin` which returns `/dev/null` on RN 0.73+, causing:

```
Command '[node, /dev/null, config, --platform, android]' failed with exit code 1.
```

**Fix:** Added `@react-native-community/cli@14` as a devDependency.

### 2. Windows pipe buffer deadlock in `expo-modules-autolinking`

`autolinking_implementation.gradle` used Gradle's `providers.exec { }.standardOutput.asText.get()`. On Windows, the subprocess output (~17 KB) exceeds the OS pipe buffer (~4 KB), causing a deadlock: node blocks waiting for Gradle to drain the pipe; Gradle waits for node to exit.

Symptom: build hangs indefinitely at `0% INITIALIZING — Evaluating settings`.

**Fix:** Patched `node_modules/expo-modules-autolinking/scripts/android/autolinking_implementation.gradle` to redirect node stdout to a temp file instead of a pipe. Persisted via `patch-package`.

### 3. Stale `android/` folder (wrong template)

The original `android/` folder was generated with an old template that:
- Still referenced Flipper (removed in RN 0.74)
- Used the old `applyNativeModulesSettingsGradle` / `applyNativeModulesAppBuildGradle` approach
- Never called `autolinkLibrariesFromCommand()`, so `autolinking.json` was never generated, causing `GeneratePackageListTask` to fail

**Fix:** Deleted and regenerated with `npx expo prebuild --platform android --clean`. The new template uses:
- `com.facebook.react.settings` plugin + `autolinkLibrariesFromCommand()` in `settings.gradle` → generates `autolinking.json`
- `autolinkLibrariesWithApp()` in `app/build.gradle` → replaces old approach

## Persistent patches (patch-package)

Two patches in `patches/` are auto-applied via the `postinstall` script in `package.json`:

| Patch file | What it fixes |
|---|---|
| `expo-modules-autolinking+2.0.8.patch` | Replaces `providers.exec` with `ProcessBuilder` + file redirect to avoid Windows pipe deadlock in `useExpoModules()` |
| `@react-native-community+cli-platform-android+14.1.2.patch` | Drains stdout before `waitFor()` in `getCommandOutput` to avoid pipe deadlock (less critical with new template, kept as safety net) |

If patches fail to apply after `npm install`, re-run `npx patch-package` or inspect `patches/` against the installed package version.

## If you regenerate `android/` in the future

Run `npx expo prebuild --platform android --clean`, then retry the build. The node_modules patches survive independently and re-apply automatically on `npm install`. The `android/` folder itself is not committed to git.
