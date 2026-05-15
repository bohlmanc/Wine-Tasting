# Wine-Tasting
A Mobile application for wine tasting

To publish a new version of the app to EAS:

```
npx eas-cli@latest workflow:run create-production-builds.yml
```

To run a preview version of the build on Android:

```
eas build --profile preview --platform android
```

## Building locally on Android

With your phone connected via USB and USB debugging enabled, run:

```
npx expo run:android
```

Make sure you're using expo 52, that's what version is supported. Also ensure you install a dev client first with:

```
npx expo install expo-dev-client
```

This builds the app and deploys it directly to the connected device via Android Studio's toolchain.

## Launching on the App Store & Google Play

### Prerequisites
- **Apple**: Apple Developer account ($99/year) — developer.apple.com/programs
- **Google**: Google Play Console account ($25 one-time) — play.google.com/console

### 1. Confirm app.json config
Make sure these fields are set before building:
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

### 2. Build for production
```bash
# iOS only
eas build --platform ios --profile production

# Android only
eas build --platform android --profile production

# Both at once
eas build --platform all --profile production
```
EAS will handle signing credentials automatically on first run.

### 3. Submit to the stores
```bash
# iOS → App Store Connect
eas submit --platform ios

# Android → Google Play
eas submit --platform android
```
iOS requires an App Store Connect API key; Android requires a Google Play service account JSON key — EAS will prompt for these.

### 4. Complete the store listing (manual)
- **iOS**: App Store Connect → create app listing, add screenshots & description, submit for review (~1–3 days).
- **Android**: Google Play Console → create app, fill store listing, publish (~1–3 days for first release).

See the [EAS Submit docs](https://docs.expo.dev/submit/introduction/) for credential setup details.