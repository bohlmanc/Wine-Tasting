# Wine Pocket Pal — Claude Context

## Stack
- Expo SDK 52, React Native 0.76.9, TypeScript
- Navigation: `@react-navigation/native-stack`
- Storage: AsyncStorage
- Build: Local builds (moved away from EAS for cost reasons)
  - Android: `npx expo run:android` (Windows PC, eventually macOS)
  - iOS: `npx expo run:ios` (macOS only, planned)
  - Store deployment: Android via Google Play, iOS via App Store — both built and submitted locally
  - Local device testing: direct USB deploy via the run commands above

## Key architecture
- `App.tsx` → `WineTastingProvider` → `AppNavigator`
- Screens live in `src/screens/`, tasting flow screens in `src/screens/tasting/`
- Wine data model: `src/types/index.ts` (`Wine`, `PartialWine`, `TastingType`, `WineStyle`)
- Tasting state passed via `WineTastingContext`
- Persistence: `src/storage/wineStorage.ts` (AsyncStorage CRUD)

## Label scanning
- **Online mode**: `src/services/labelScanService.ts` — calls Claude Haiku API with base64 image(s); extracts name, producer, vintage, country, grapes, ABV, importer
- **Offline mode**: `src/services/offlineLabelParser.ts` — uses `@react-native-ml-kit/text-recognition` (on-device OCR); extracts vintage, ABV, grapes, country via regex + list matching; name/producer left blank for manual entry
- UI: `src/screens/ScanLabelScreen.tsx` — mode toggle (AI Online / Offline), captures front + back label photos

## Winery partner feature (planned)

Wineries sign up via a separate web admin portal, input tasting flights and wines, and generate QR codes. Consumers check in via QR scan or search, then do a guided tasting session that walks through each wine in the flight using the existing tasting flow screens.

**Design reference**: [docs/winery-partner-feature.md](docs/winery-partner-feature.md) — read this before touching any winery/flight/guided-session code. **Keep it current**: update the phase plan and status table whenever a phase completes, new work ships, or the approach pivots.

**Chosen approach**:
- Backend: Supabase (Postgres + RLS + Auth)
- Check-in: QR code (primary) + search (fallback); location-based is phase 2
- Winery admin portal: separate Next.js app on Vercel
- Consumer accounts: not required in v1 — tastings remain local to device

**Key constraint**: The existing tasting flow screens (`BasicInfo` → `Think`) are reused as-is. The guided session only adds an optional `guidedSessionId` param so `Think` knows to return to the session instead of `Home`.

## Known gotchas

### GestureHandlerRootView is required
`react-native-gesture-handler` is installed. Without `GestureHandlerRootView` wrapping the root in `App.tsx`, RNGH intercepts native touch events and silently drops them — buttons appear to do nothing and produce zero logs.
**Fix already applied:** `App.tsx` imports `'react-native-gesture-handler'` first and wraps with `GestureHandlerRootView`.

### ML Kit only works in local dev builds
`@react-native-ml-kit/text-recognition` is a native module — not available in Expo Go. Offline scan mode will error in Expo Go; this is expected. Use `npx expo run:android` to test offline scanning on a real device.

### Metro must transform ML Kit's TS source
The package ships `index.ts` as its main entry (no compiled JS). `metro.config.js` opts `@react-native-ml-kit` into Metro's transform pipeline so the bundler can handle it.

### Camera does not open immediately on Android (dev-client)
On a physical Android device running via `expo-dev-client`, `launchCameraAsync` does not bring the camera to the foreground until another modal/Activity is opened and closed. Choose from Library works fine. See **[docs/camera-launch-issue.md](docs/camera-launch-issue.md)** for full symptom description, everything that was tried, and next steps.

### No config plugin needed for ML Kit
`@react-native-ml-kit/text-recognition` uses React Native autolinking — adding it to `app.json` plugins causes a Node.js type-stripping error because the package has no config plugin. Leave it out of plugins; autolinking handles it during the local build.

### iOS builds on Xcode 26 require several compatibility patches
Xcode 26's stricter Clang and unquoted-path bugs in React Native's build scripts cause multiple distinct failures when building for iOS. Fixes are applied via `ios/Podfile` post_install hooks and `patch-package`. **If iOS build fails, update [docs/ios-xcode26-build-issues.md](docs/ios-xcode26-build-issues.md) with any new findings before closing the session.** See that file for full diagnosis, all patches applied so far, and known candidates for the next failure.

### Android local builds on Windows require patched node_modules
`npx expo run:android` hangs at "Evaluating settings" on Windows due to pipe buffer deadlocks in two Gradle scripts. Fixes are applied via `patch-package` and survive `npm install` automatically. See **[docs/gradle-windows-build.md](docs/gradle-windows-build.md)** for full diagnosis, what was patched, and what to do if `android/` is regenerated.
