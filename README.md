# Wine Pocket Pal

A React Native mobile app for guided wine tasting. Walk through a structured Look → Smell → Taste → Think tasting flow, scan labels with AI or on-device OCR, and track your tastings over time. Supports winery check-in for guided flights at partner locations.

## Feature status

### Core tasting
| Feature | Status |
|---|---|
| Full tasting flow (Look, Smell, Taste, Think) | ✅ Done |
| Quick-note tasting type | ✅ Done |
| Label scanning — AI mode (Claude Haiku) | ✅ Done |
| Label scanning — Offline mode (ML Kit OCR) | ✅ Done |
| My Tastings list + Wine Detail | ✅ Done |
| Tasting Calendar | ✅ Done |
| Custom tasting flights | ✅ Done |

### Winery partner feature
| Feature | Status |
|---|---|
| Supabase backend (project created) | ✅ Done |
| Supabase schema + RLS | ⬜ Not applied yet — SQL ready in `docs/winery-partner-feature.md` |
| Winery check-in (search) | ✅ Done |
| Winery check-in (QR scan) | ⬜ Not started |
| Winery detail + tasting flight list | ✅ Done |
| Guided session flow | ✅ Done |
| Flight history (My Flights, Completed Flight Detail) | ✅ Done |
| Winery admin portal (Next.js) | ⬜ Not started |

---

## Stack

- **Expo SDK 52**, React Native 0.76.9, TypeScript
- **Navigation**: `@react-navigation/native-stack`
- **Storage**: AsyncStorage (local), Supabase (winery data)
- **Label scanning**: Claude Haiku API (online) / ML Kit text recognition (offline)

---

## Building locally on Android

With your phone connected via USB and USB debugging enabled:

```
npx expo run:android
```

This builds the app and deploys it directly to the connected device. First run takes a few minutes; subsequent runs are faster.

> **Note:** ML Kit (offline label scanning) is a native module — it won't work in Expo Go. Always use `npx expo run:android` for testing scan features.

> **Windows note:** Gradle build scripts are patched via `patch-package` to fix pipe buffer deadlocks. The patches apply automatically on `npm install`. See `docs/gradle-windows-build.md` if you regenerate the `android/` directory.

---

## Building locally on iOS

### Prerequisites
- Xcode (Mac App Store) with at least one iOS runtime downloaded
- Xcode command line tools: `xcode-select --install`
- Accept the Xcode license (first time): `sudo xcodebuild -license accept`

### Simulator

```
npx expo run:ios
```

Target a specific simulator:

```
npx expo run:ios --simulator "iPhone 16 Pro"
```

List available simulators:

```
xcrun simctl list devices available
```

### Physical device

Requires an Apple Developer account (free tier works for sideloading).

1. Connect iPhone via USB and trust the Mac on the device.
2. Xcode → **Settings → Accounts** → add your Apple ID.
3. Run:

```
npx expo run:ios --device
```

4. If you want to sideload and run without needing the phone connected, run:

```
npx expo run:ios --configuration Release
```

If Xcode complains about provisioning, open `ios/WinePocketPal.xcworkspace`, select your target → **Signing & Capabilities**, and set your Team.

> **Xcode 26 note:** Several compatibility patches are applied via `patch-package` and Podfile post_install hooks. See `docs/ios-xcode26-build-issues.md` if the iOS build fails.

---

## Store deployment

Both platforms are built and submitted locally (not via EAS cloud builds).

### Android → Google Play

1. **Generate a release keystore** (one-time setup — keep the file and passwords somewhere safe):

   ```bash
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore android/app/release.keystore \
     -alias wine-pocket-pal \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

   On Windows PowerShell, `keytool` ships with the JDK — run the same command with backslashes or on a single line.

2. **Add signing credentials to `android/gradle.properties`** (never commit this file with real values):

   ```properties
   MYAPP_UPLOAD_STORE_FILE=release.keystore
   MYAPP_UPLOAD_KEY_ALIAS=wine-pocket-pal
   MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
   MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
   ```

3. **Wire the keystore into `android/app/build.gradle`** — replace the placeholder `signingConfigs` block:

   ```groovy
   signingConfigs {
       release {
           storeFile file(MYAPP_UPLOAD_STORE_FILE)
           storePassword MYAPP_UPLOAD_STORE_PASSWORD
           keyAlias MYAPP_UPLOAD_KEY_ALIAS
           keyPassword MYAPP_UPLOAD_KEY_PASSWORD
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
           // ... rest of existing release config
       }
   }
   ```

4. **Build the AAB** (preferred for Google Play) or APK:

   ```bash
   # from the project root
   cd android

   # AAB (recommended for Play Store)
   ./gradlew bundleRelease        # macOS/Linux
   .\gradlew.bat bundleRelease    # Windows

   # APK (for direct install / testing)
   ./gradlew assembleRelease
   .\gradlew.bat assembleRelease
   ```

   Output locations:
   - AAB: `android/app/build/outputs/bundle/release/app-release.aab`
   - APK: `android/app/build/outputs/apk/release/app-release.apk`

5. Upload to Google Play Console manually or via `eas submit --platform android`.

### iOS → App Store

1. Build an archive locally via Xcode (`Product → Archive`).
2. Distribute via Xcode Organizer → App Store Connect, or `eas submit --platform ios`.

### app.json fields to confirm before a release build

```json
{
  "expo": {
    "name": "Wine Pocket Pal",
    "slug": "wine-pocket-pal",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourname.winepocketpal"
    },
    "android": {
      "package": "com.yourname.winepocketpal"
    }
  }
}
```

---

## Docs

| Doc | What's in it |
|---|---|
| `docs/winery-partner-feature.md` | Full design reference + Supabase schema SQL + phase plan |
| `docs/camera-launch-issue.md` | Android camera not opening on first tap — symptoms and next steps |
| `docs/gradle-windows-build.md` | Windows Gradle deadlock patches |
| `docs/ios-xcode26-build-issues.md` | Xcode 26 compatibility patches |

---

## Testing

### How tests stay out of the production bundle

Metro (the JS bundler) only bundles files reachable from the app entry point. Test files — anything in `__tests__/` directories or matching `*.test.ts` / `*.spec.ts` — are never imported from `App.tsx`, so Metro never touches them. No special config is needed to exclude them; they simply don't exist from the bundler's perspective.

---

### Layer 1 — Unit tests (Jest)

**Best for:** Pure logic functions that don't touch native modules.

**Highest-value target: `src/services/offlineLabelParser.ts`**

The offline label parser contains a chain of independently testable pure functions — `extractVintage`, `extractAbv`, `extractGrapes`, `extractCountry`, `extractRegion`, `extractProducer`, `extractImporter` — that already have documented edge cases (OCR dropping decimals, diacritic normalization, AVA-to-state mapping). These are complex regex chains with high regression risk every time a pattern is adjusted. Unit tests here pay back immediately.

Other good targets:
- `src/storage/wineStorage.ts` — CRUD logic (mock `AsyncStorage` with its official jest mock)
- `src/storage/customFlightStorage.ts`, `guidedSessionStorage.ts` — same pattern

**Tooling:** `jest`, `jest-expo` (Expo's preset; handles Metro's module aliases and RN transforms), `@types/jest`.

```bash
npm install --save-dev jest jest-expo @types/jest
```

Add to `package.json`:
```json
"jest": {
  "preset": "jest-expo"
}
```

---

### Layer 2 — Component tests (React Native Testing Library)

**Best for:** Screen-level behavior and context state transitions, without needing a device.

Native modules (ML Kit, camera, `expo-image-picker`) are mocked at the module level; `AsyncStorage` is mocked via its official jest mock. This lets you assert that tapping "Next" advances the tasting flow, that required fields surface validation errors, or that `WineTastingContext` accumulates the right partial wine state — all without building or deploying anything.

Good targets:
- `WineTastingContext` — verify state threads correctly through `BasicInfo` → `Think`
- `BasicInfoScreen` — required field validation, vintage format constraints
- `ThinkScreen` — rating widget interaction, correct navigation target when `guidedSessionId` is set vs. not
- `CompletedFlightDetailScreen` — `completedWineIds` mapping (the skipped-wines bug class originates here)

**Tooling:** `@testing-library/react-native`, `@testing-library/jest-native`.

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

---

### Layer 3 — E2E tests (Maestro)

**Best for:** Full user flows on a real device or emulator. Catches integration failures that unit/component tests miss — native module interactions, navigation stack state, AsyncStorage round-trips, and layout issues.

Maestro uses simple YAML "flow" files that tap through the UI by accessibility label or visible text, with no code changes to the app. Flows live in an `e2e/` directory and are run from the terminal separately from any build step.

High-value flows to cover first:

| Flow | Why it matters |
|---|---|
| Quick tasting (manual entry) | Core happy path; exercises every persistence layer |
| Full guided tasting (all screens) | Highest regression surface in the app |
| Winery check-in → guided flight → all wines done | Covers Supabase + guided session integration |
| Custom flight: create, add wines, complete | Covers `customFlightStorage` end-to-end |

**Tooling:** [Maestro CLI](https://maestro.mobile.dev/). On Windows, download the binary from the Maestro releases page; on macOS/Linux, use their install script. No changes to the app are needed.

```bash
# Run a single flow against a connected device or emulator
maestro test e2e/quick-tasting.yaml

# Run all flows
maestro test e2e/
```

---

### What can't be meaningfully unit-tested

| Feature | Reason | How to verify |
|---|---|---|
| `launchCameraAsync` | Native Activity; can't mock realistically | Maestro E2E or manual |
| ML Kit OCR (`TextRecognition.recognize`) | Native binary; result depends on real image data | Manual with physical labels; unit-test the *parser logic* separately |
| Supabase network calls | External service | Mock in component tests; smoke-test against dev Supabase project manually |

---

### Recommended implementation order

1. **`jest-expo` setup + `offlineLabelParser.ts` unit tests** — highest ROI for the least setup effort; pure functions, zero mocks needed.
2. **AsyncStorage mock + storage layer tests** — `wineStorage`, `customFlightStorage`, `guidedSessionStorage`.
3. **Maestro flows for quick tasting and guided session** — catches integration issues unit tests can't see.
4. **RNTL component tests** — add as coverage gaps become apparent, especially around context state threading and `CompletedFlightDetailScreen` logic.
