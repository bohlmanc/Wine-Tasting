# Wine Pocket Pal — Claude Context

## Stack
- Expo SDK 50, React Native 0.73, TypeScript
- Navigation: `@react-navigation/native-stack`
- Storage: AsyncStorage
- Build: EAS (managed workflow) — `eas build --profile development` for dev builds

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

## Known gotchas

### GestureHandlerRootView is required
`react-native-gesture-handler` is installed. Without `GestureHandlerRootView` wrapping the root in `App.tsx`, RNGH intercepts native touch events and silently drops them — buttons appear to do nothing and produce zero logs.
**Fix already applied:** `App.tsx` imports `'react-native-gesture-handler'` first and wraps with `GestureHandlerRootView`.

### ML Kit only works in EAS dev builds
`@react-native-ml-kit/text-recognition` is a native module — not available in Expo Go. Offline scan mode will error in Expo Go; this is expected. Run `eas build --profile development` to test offline scanning on a real device.

### Metro must transform ML Kit's TS source
The package ships `index.ts` as its main entry (no compiled JS). `metro.config.js` opts `@react-native-ml-kit` into Metro's transform pipeline so the bundler can handle it.

### Camera does not open immediately on Android (dev-client)
On a physical Android device running via `expo-dev-client`, `launchCameraAsync` does not bring the camera to the foreground until another modal/Activity is opened and closed. Choose from Library works fine. See **[docs/camera-launch-issue.md](docs/camera-launch-issue.md)** for full symptom description, everything that was tried, and next steps.

### No config plugin needed for ML Kit
`@react-native-ml-kit/text-recognition` uses React Native autolinking — adding it to `app.json` plugins causes a Node.js type-stripping error because the package has no config plugin. Leave it out of plugins; EAS Build handles it via autolinking.
