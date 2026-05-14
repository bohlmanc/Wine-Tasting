# Camera Launch Issue — ScanLabelScreen

## Symptom
On a physical Android device (Pixel 10, Android 15) running via `expo-dev-client`, pressing **Take Photo** does nothing visible. The camera only opens after something else triggers a window/Activity change — e.g. opening the Expo dev menu, opening the photo library picker, or any other modal — and then closing it.

**Choose from Library works fine.** The issue is isolated to `launchCameraAsync`.

## What was tried (all ineffective)

1. **`InteractionManager.runAfterInteractions`** before the permission request — permission dialog also had this problem originally but was solved separately (see below). Did not fix camera launch.

2. **`setTimeout(150ms)`** before `launchCameraAsync` — no change.

3. **`InteractionManager` + `requestAnimationFrame`** immediately before `launchCameraAsync` — no change.

4. **`useEffect` + state decoupling** — pressing the button sets `pendingCamera` state; a `useEffect` watching that state calls `launchCameraAsync` after the render cycle. This is the most complete decoupling from the touch event possible in React Native. Still no change.

## Permission flow (separately fixed)
Originally the permission dialog also wouldn't show on button press. Fixed by calling `requestCameraPermissionsAsync()` and `requestMediaLibraryPermissionsAsync()` in a `useEffect` on screen mount, then using `getCameraPermissionsAsync()` (non-prompting check) inside `pickImage`. This works correctly now.

## Current state of ScanLabelScreen.tsx
- Permissions requested eagerly on mount via `useEffect`
- Camera launch decoupled from touch via `pendingCamera` state + `useEffect`
- Library picker called directly (works fine)

## Hypothesis
The issue is likely specific to `expo-dev-client` on Android 15. The dev client may hold a window overlay or Activity state that prevents `startActivityForResult` (which `launchCameraAsync` uses under the hood) from bringing the camera Activity to the foreground. Opening any other modal "resets" the Activity stack, which is why the camera appears afterward.

This may not reproduce in a production or preview EAS build — worth testing with `eas build --profile preview` before investigating further.

## Next steps to try
1. Build a **preview or production EAS build** (`eas build --profile preview`) and test there — if it works, the issue is dev-client-specific and not worth solving.
2. Replace `expo-image-picker` camera with **`expo-camera`** (renders camera inline as a React Native view, no Activity launch needed).
3. File an issue against `expo-image-picker` / `expo-dev-client` with the repro steps.