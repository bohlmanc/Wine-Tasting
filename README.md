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

If Xcode complains about provisioning, open `ios/WinePocketPal.xcworkspace`, select your target → **Signing & Capabilities**, and set your Team.

> **Xcode 26 note:** Several compatibility patches are applied via `patch-package` and Podfile post_install hooks. See `docs/ios-xcode26-build-issues.md` if the iOS build fails.

---

## Store deployment

Both platforms are built and submitted locally (not via EAS cloud builds).

### Android → Google Play

1. Build a release APK/AAB locally via Android Studio or Gradle.
2. Upload to Google Play Console manually or via `eas submit --platform android`.

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
