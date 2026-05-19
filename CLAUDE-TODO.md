# Wine Pocket Pal — Feature & Improvement Backlog

Status values: `not started` | `pending` | `complete`

---

## 001 — Edit wines in a pre-created winery flight
**Status:** `complete`

**What:** On the `TastingFlightDetailScreen`, give the user a way to add, remove, or reorder wines in a winery-sourced flight before or during the session, in case the winery's actual pours differ from what was loaded from Supabase.

**Plan:**
- Add an "Edit Flight" button (e.g. pencil icon in the header) on `TastingFlightDetailScreen.tsx`.
- Tapping it enters an edit mode where each `WineRow` gets a remove (×) button and a drag handle for reordering.
- An "Add Wine" row at the bottom opens a mini-form (name, producer, vintage, style) to append a custom wine to the local copy of the flight.
- Changes are saved to the local flight copy in `guidedSessionStorage` (`saveFlightForSession`) — they do **not** push back to Supabase.
- The `TastingFlight` type may need a `localOverride?: boolean` flag so the UI can show "customised" when the local copy differs from the remote.

**Files touched:** `src/screens/TastingFlightDetailScreen.tsx`, `src/storage/guidedSessionStorage.ts`, `src/types/index.ts` (possibly).

---

## 002 — Custom flight: dedicated flight page with add-wine flow
**Status:** `complete`

**What:** After naming a custom flight, instead of dropping the user back at the "Start Tasting" menu with only a banner, navigate to a proper flight-management page where they can see current wines, add more, and tap "Complete Tasting" at any time.

**Plan:**
- Create `src/screens/CustomFlightScreen.tsx` — styled similarly to `TastingFlightDetailScreen` but for local/custom flights.
  - Lists wines already saved under the current `customFlightId`.
  - "Add Wine" button → navigates to `AddWineType` (which sets the flight context) → full tasting flow → on save returns back to `CustomFlightScreen`.
  - "Complete Tasting" button always visible at the bottom; tapping it marks the custom flight as finished (clears context) and navigates to `MyFlights` or `Home`.
- Add `CustomFlight` to `RootStackParamList` in `src/navigation/types.ts`.
- Register the screen in `src/navigation/AppNavigator.tsx`.
- `AddWineTypeScreen` — after `handleStartCustomFlight` resolves, navigate to `CustomFlight` instead of just closing the modal.

**Files touched:** `src/screens/CustomFlightScreen.tsx` (new), `src/screens/AddWineTypeScreen.tsx`, `src/navigation/types.ts`, `src/navigation/AppNavigator.tsx`.

---

## 003 — Custom flight: go to flight page on creation, add Cancel Flight
**Status:** `complete`

**What:** When the user creates a new custom flight, they should land on the `CustomFlightScreen` (see #002), not return to the "Start Tasting" menu. Also add a "Cancel Flight" option that clears the active custom flight.

**Plan:**
- This is largely covered by #002's navigation change in `AddWineTypeScreen`.
- On `CustomFlightScreen` (or wherever the active flight banner shows), add a "Cancel Flight" destructive action (e.g. a text link or red button at the bottom) that calls `setCustomFlight(null, null)` (or a new `clearCustomFlight` action on the context) and navigates back to `Home`.
- Show an `Alert.alert` confirmation before cancelling so the user doesn't lose the flight by accident.

**Files touched:** `src/screens/AddWineTypeScreen.tsx`, `src/screens/CustomFlightScreen.tsx` (new, from #002), `src/context/WineTastingContext.tsx`.

**Depends on:** #002 (same new screen).

---

## 004 — Profile: Tasting Calendar & My Flights as full-size buttons
**Status:** `complete`

**What:** On `MyProfileScreen`, the Tasting Calendar and My Flights links are styled as smaller `calendarBtn` items. They should be promoted to the same large button style used on `HomeScreen` to be more prominent and consistent.

**Plan:**
- In `MyProfileScreen.tsx`, replace the current `calendarBtn` `TouchableOpacity` elements with the same `btn` / `btnText` style from `HomeScreen` (large, bold, full-width, coloured background).
- Keep the existing `Colors.btnCalendar` and `'#5B6E5B'` colours.
- Remove the `calendarBtn` / `calendarBtnText` styles if no longer used elsewhere.

**Files touched:** `src/screens/MyProfileScreen.tsx`.

---

## 005 — Wine list: flight indicator badge on wines that belong to a flight
**Status:** `complete`

**What:** In `MyTastingsScreen` (the searchable wine list), wines that have a `flightId` should show a small badge or label (e.g. "✈ Flight Name") similar to how it appears when you drill into the wine detail.

**Plan:**
- In the `WineCard` (or whatever renders each row in `MyTastingsScreen.tsx`), check `wine.flightName` / `wine.flightId`.
- If set, render a small coloured chip (pill) below the wine name showing the flight name.
- Style: small font, muted/teal background, rounded — consistent with existing `TagChip` component in `src/components/TagChip.tsx` if applicable.

**Files touched:** `src/screens/MyTastingsScreen.tsx`.

---

## 006 — Profile: remove Avg Rating stat box
**Status:** `complete`

**What:** Remove the "Avg Rating" `StatBox` from the stats row on `MyProfileScreen`.

**Plan:**
- In `MyProfileScreen.tsx`, remove `<StatBox label="Avg Rating" value={avgRating ?? '—'} />` from the `statsRow`.
- Remove the `avgRating` computed variable if it's no longer used anywhere else on the screen.
- The stats row will go from three boxes to two (`Total Wines`, `Liked`).

**Files touched:** `src/screens/MyProfileScreen.tsx`.

---

## 007 — Profile: show flights completed count
**Status:** `complete`

**What:** Add a stat on `MyProfileScreen` showing how many tasting flights the user has completed.

**Plan:**
- Load completed sessions from `guidedSessionStorage` (there is already an `archiveFlightSession` / `loadActiveSessionForFlight` pattern; check for a `loadAllArchivedSessions` or add one).
- Also count distinct `customFlightId` values from the `Wine[]` list for custom flights (wines saved with the same `flightId` count as one flight).
- Combine both counts for total flights completed.
- Add a `StatBox label="Flights" value={String(flightCount)}` to the stats row (alongside or replacing Avg Rating per #006).

**Files touched:** `src/screens/MyProfileScreen.tsx`, `src/storage/guidedSessionStorage.ts` (possibly add a list/count helper).

---

## 008 — Homepage: remove "My Tastings" and "Visit a Winery" buttons
**Status:** `complete`

**What:** Strip the "My Tastings" and "Visit a Winery" buttons from `HomeScreen` to simplify the landing screen.

**Note:** Looking at the current `HomeScreen.tsx`, neither button is present in the current code (only "Start Tasting", "Wine Tasting Guide", "My Profile"). Verify at runtime whether these appear — they may be rendered conditionally or exist in a version of the file not yet saved. If the screen is already clean, mark this complete with no code change.

**Plan:**
- Open `HomeScreen.tsx` and confirm the buttons exist.
- If present, remove the `TouchableOpacity` blocks for "My Tastings" and "Visit a Winery".
- If absent, no change needed — mark complete.

**Files touched:** `src/screens/HomeScreen.tsx` (possibly no change needed).

---

## 009 — Update tasting: upgrade quick sip to full tasting
**Status:** `complete`

**What:** When editing a wine that was saved as a `quick` tasting, offer a "Do Full Tasting" option that converts it to a full tasting and navigates through the guided tasting screens.

**Plan:**
- In the Update/Edit tasting flow (likely a modal or screen launched from `MyTastingsScreen` or `WineDetailScreen`), detect `wine.tastingType === 'quick'`.
- Show an additional option: "Upgrade to Full Tasting".
- Tapping it loads the wine's existing data into `WineTastingContext`, sets `tastingType` to `'full'`, and navigates to `BasicInfo` (or `WineStyle` if basic info is already filled).
- On completing `ThinkScreen`, overwrite the existing wine record (`id` stays the same) with `tastingType: 'full'` and the new tasting data, rather than creating a duplicate.

**Files touched:** `src/screens/MyTastingsScreen.tsx` (or wherever the edit modal lives), `src/screens/WineDetailScreen.tsx`, `src/context/WineTastingContext.tsx`, `src/screens/tasting/ThinkScreen.tsx` (save-and-return logic).

---

## 010 — Update Tasting modal: add close button, dismiss on backdrop tap
**Status:** `complete`

**What:** The Update Tasting modal has no X / close button. Add one, and make tapping outside the modal dismiss it without any confirmation CTA.

**Plan:**
- Find the Update Tasting `Modal` component (likely in `MyTastingsScreen.tsx`).
- Add an `×` `TouchableOpacity` in the top-right corner of the modal sheet.
- The backdrop `Pressable` / `TouchableOpacity` that already exists (or should be added) should call `onClose` directly — no alert or confirmation.

**Files touched:** `src/screens/MyTastingsScreen.tsx` (or whichever file owns the modal).

---

## 011 — Update Tasting: offer "Basic Info" vs "Tasting Notes" entry points
**Status:** `complete`

**What:** When the user taps to update a tasting, instead of one generic flow, show two options: "Basic Info" (navigates to `BasicInfoScreen` pre-filled) and "Tasting Notes" (navigates to the first tasting notes screen pre-filled).

**Plan:**
- In the Update Tasting modal/sheet, replace the single "Edit" action with two labelled buttons: "Basic Info" and "Tasting Notes".
- Both load the wine's existing values into `WineTastingContext`.
- "Basic Info" → `navigation.navigate('BasicInfo')`.
- "Tasting Notes" → `navigation.navigate('WineStyle')` (first screen of the notes flow) or `navigation.navigate('LookColor')` depending on which feels right.
- On completing `ThinkScreen`, the save logic should overwrite the same wine `id` (same as #009 — can share the overwrite logic).

**Files touched:** `src/screens/MyTastingsScreen.tsx` (or whichever file owns the update modal).

---

## 012 — Quick sip wine: "Complete Guided Tasting" button on wine detail
**Status:** `complete`

**What:** On the wine detail page for a quick-sip wine, add a prominent "Complete Guided Tasting" button that converts the wine to a full tasting and launches the guided tasting experience.

**Plan:**
- In `src/screens/WineDetailScreen.tsx`, check `wine.tastingType === 'quick'`.
- If true, render a "Complete Guided Tasting" button (styled like a primary CTA) below the wine details.
- Tapping it loads the wine into `WineTastingContext` (populate all existing fields, set `tastingType: 'full'`), stores the wine `id` somewhere accessible (context or nav param) so the save step knows to overwrite rather than create new.
- Navigate to `BasicInfo` (or skip to `WineStyle` if basic info is already complete) to begin the full tasting flow.
- On completing `ThinkScreen`, overwrite the original wine record and navigate back to the detail screen (or `MyTastings`).

**Files touched:** `src/screens/WineDetailScreen.tsx`, `src/context/WineTastingContext.tsx`, `src/screens/tasting/ThinkScreen.tsx`.

**Note:** Overlaps with #009 and #011 in the "overwrite existing wine on save" logic — implement that shared piece once and reuse across all three.
