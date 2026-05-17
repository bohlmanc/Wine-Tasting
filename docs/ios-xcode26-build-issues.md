# iOS Build — Xcode 26 Compatibility Issues

> **Keep this file up to date.** Any future session that makes progress on iOS build failures should update the "Current state", the relevant fix section, and "Potential next steps" before closing out. The file is referenced from CLAUDE.md so it loads into context automatically.

## Current state (as of 2026-05-17)

iOS build has **not yet succeeded end-to-end**. Seven distinct failures have been identified and patches applied. It is unknown whether additional failures exist further down the build pipeline — each one surfaces only after the previous is fixed.

Environment: **Xcode 26 / iOS 26.5 SDK**, macOS, React Native 0.76.9, Expo SDK 52.

All 20 build phases in `Pods.xcodeproj` have been audited. The ones below were broken; the rest were already safe. The main `WinePocketPal.xcodeproj` build phases were also audited and one was broken.

---

## What was broken and how it was fixed

### 1. Yoga compilation error — `#undef __cpp_consteval`

**Symptom:**
```
error: undefining builtin macro [-Werror,-Wbuiltin-macro-redefined]
#undef __cpp_consteval
```
Affects: `YGValue.cpp`, `YGPixelGrid.cpp`, `YGNodeStyle.cpp`, `YGNodeLayout.cpp`, `YGNode.cpp`.

**Root cause:** Xcode 26's Clang now treats `#undef`-ing a built-in macro as a warning, and Yoga compiles with `-Werror`, so it becomes a hard error.

**Fix:** `ios/Podfile` `post_install` — appends `-Wno-builtin-macro-redefined` to Yoga's `OTHER_CPLUSPLUSFLAGS`.

---

### 2. `[CP-User] Generate Specs` (ReactCodegen) — unquoted path

**Symptom:**
```
Script '[CP-User] Generate Specs' failed — Pods/ReactCodegen
/bin/sh: /Users/haileybohlman/Desktop/Claude/Wine: No such file or directory
```

**Root cause:** The generated `Pods.xcodeproj` build phase script ends with:
```sh
/bin/sh -c "$WITH_ENVIRONMENT $SCRIPT_PHASES_SCRIPT"
```
The shell splits `Wine App` and interprets `Wine` as the script name.

**Fix:** `ios/Podfile` `post_install` — rewrites the shellScript to:
```sh
/bin/sh "$WITH_ENVIRONMENT" "$SCRIPT_PHASES_SCRIPT"
```

---

### 3. `with-environment.sh:46` — unquoted `$1`

**Symptom:**
```
with-environment.sh: line 46: /Users/haileybohlman/Desktop/Claude/Wine: No such file or directory
```

**Root cause:** `with-environment.sh` (react-native) executes its argument with unquoted `$1`.

**Fix:** `$1` → `"$1"`. Persisted in `patches/react-native+0.76.9.patch`.

---

### 4. `[CP-User] Generate app.config for prebuilt Constants.manifest` (EXConstants) — unquoted path

**Symptom:**
```
Script '[CP-User] Generate app.config for prebuilt Constants.manifest' failed — Pods/EXConstants
No such file or directory: /Users/haileybohlman/Desktop/Claude/Wine
```

**Root cause:** The build phase script is:
```sh
bash -l -c "$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh"
```
Same unquoted-variable-in-`-c` pattern as issue 2.

**Fix:** `ios/Podfile` `post_install` — rewrites the shellScript to:
```sh
bash -l "$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh"
```

---

### 5. `get-app-config-ios.sh:14` — unquoted `$PROJECT_DIR` in `basename`

**Root cause:** Inside `expo-constants/scripts/get-app-config-ios.sh`:
```sh
PROJECT_DIR_BASENAME=$(basename $PROJECT_DIR)
```
With spaces in the path, `basename` receives split arguments and returns `Wine` instead of `Pods`. The subsequent guard `if [ "x$PROJECT_DIR_BASENAME" != "xPods" ]; then exit 0` would exit early without generating `app.config`.

**Fix:** `basename $PROJECT_DIR` → `basename "$PROJECT_DIR"`. Persisted in `patches/expo-constants+17.0.8.patch`.

---

### 7. `[CP-User] [Hermes] Replace Hermes for the right configuration, if needed` — unquoted path in Node.js `execSync`

**Symptom:**
```
Script '[CP-User] [Hermes] Replace Hermes for the right configuration, if needed' failed
tar: /Users/haileybohlman/Desktop/Claude/Wine: m: No such file or directory
```
(The error is printed as a byte array — decode it to get the message above.)

**Root cause:** Only triggered on Release builds (first-time or config change). The Xcode build phase calls `replace_hermes_version.js`, which runs:
```js
execSync(`tar -xf ${tarballURLPath} -C ${finalLocation}`);
```
`tarballURLPath` contains `PODS_ROOT` which expands to a path with spaces. The unquoted variable causes the shell to split `Wine App` — `tar` gets `Wine` as the archive name.

**Fix:** Quote both paths in the template literal:
```js
execSync(`tar -xf "${tarballURLPath}" -C "${finalLocation}"`);
```
Persisted in `patches/react-native+0.76.9.patch` (replaces the previous patch for this package).

**Note:** This was previously marked as "audited and safe" — that audit only checked the shell script variables in `Pods.xcodeproj`, not the downstream Node.js script the build phase invokes.

---

### 6. `Bundle React Native code and images` (main project) — unquoted backtick

**Root cause:** In `WinePocketPal.xcodeproj`, the "Bundle React Native code and images" build phase ends with:
```sh
`"$NODE_BINARY" --print "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'"`
```
The unquoted backtick causes the result (a path with spaces) to be word-split when used as a command.

**Fix:** `ios/Podfile` `post_install` — rewrites the main project's shellScript via `installer.aggregate_targets`:
```sh
REACT_NATIVE_XCODE_SH="$("$NODE_BINARY" --print "...")"
"$REACT_NATIVE_XCODE_SH"
```

---

## Persistent patches (`patch-package`)

All patches in `patches/` are auto-applied via the `postinstall` script in `package.json`.

| Patch file | What it fixes |
|---|---|
| `react-native+0.76.9.patch` | `with-environment.sh:46` `$1` → `"$1"`; `replace_hermes_version.js:64` unquoted `tar` paths |
| `expo-constants+17.0.8.patch` | `get-app-config-ios.sh:14` `basename $PROJECT_DIR` → `basename "$PROJECT_DIR"` |

The `ios/Podfile` `post_install` hooks (fixes 1, 2, 4, 6) re-apply automatically on every `pod install` and patch both `Pods.xcodeproj` and `WinePocketPal.xcodeproj`.

**Important:** If `ios/` is ever regenerated with `npx expo prebuild --platform ios --clean`, the Podfile will be overwritten — re-apply the `post_install` blocks from this document manually.

---

## Audited and safe (no changes needed)

These build phases were checked and are already properly quoted:
- All 13 `Copy generated compatibility header` phases — use only Xcode `${VAR}` variables
- `[CP-User] [RN]Check rncore` (×2) — all vars quoted
- `[CP-User] [Hermes] Replace Hermes for the right configuration, if needed` — shell vars quoted, but downstream Node.js `execSync` was not (see fix #7)
- `[Expo] Configure project` (main project) — uses relative path with backslash-escaped space
- `expo-constants/scripts/with-node.sh` — uses `"$NODE_BINARY" "$@"`, safe
- `react-native/scripts/react_native_pods_utils/script_phases.sh` — all critical paths quoted

---

## Potential next steps

If the build fails after the six fixes above, check for the same unquoted-path pattern in any new build phases or scripts that surface. The pattern to look for:
- `bash -l -c "$VAR"` or `/bin/sh -c "$VAR $VAR2"` where a var expands to an absolute path
- Unquoted `` `command` `` or `$(command)` used directly as a command

For each new failure: fix the script in `node_modules`, run `npx patch-package <package-name>` to persist it, and document the fix in this file.
