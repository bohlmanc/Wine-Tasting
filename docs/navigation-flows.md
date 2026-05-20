# Wine Pocket Pal — Navigation & Data Flow Diagrams

All routes live in a single flat `NativeStackNavigator`. There are no nested tab navigators — every screen is reachable from the stack. The diagrams below group flows by user goal.

---

## 1. Top-Level Entry Points

```
App.tsx
└── WineTastingProvider (global tasting context + reducer)
    └── AppNavigator (NativeStackNavigator, initialRoute: Home)
        ├── Home
        │   ├── → AddWineType          ("Start Tasting")
        │   ├── → WineTastingGuide     ("Wine Tasting Guide")
        │   └── → MyProfile           ("My Profile")
        └── [all other routes reachable from within flows]
```

---

## 2. Quick Tasting Flow

```
Home
└── AddWineType
    └── [choose "Quick Sip"]
        └── BasicInfo  (params: none | { guidedSessionId?, flightWineIndex? })
            ├── → ScanLabel  (optional, via "Scan Label" button)
            │   └── [analyze labels → fills context → back to BasicInfo]
            └── [Next]
                └── Think  (params: { guidedSessionId? })
                    └── [DONE — SAVE WINE]
                        ├── saveWine() → AsyncStorage
                        ├── RESET context
                        └── navigate("Home")
```

**Context fields written:** `tastingType='quick'`, `dateTasted`, `producer`, `name`, `country`, `region`, `subregion`, `vineyard`, `grapes`, `vintage`, `abv`, `price`, `importer`, `photo`, `liked`, `rating`, `notes`

---

## 3. Full Guided Tasting Flow

```
Home
└── AddWineType
    └── [choose "Guided Tasting"]
        └── BasicInfo
            ├── → ScanLabel  (optional)
            │   └── [fills name, producer, vintage, country, grapes, ABV, importer → back]
            └── [Next]
                └── WineStyle
                    └── [select style: Red / White / Rosé / Sparkling / Orange / Dessert]
                        └── LookColor
                            └── [select color (options vary by style)]
                                └── LookDetails  (params: { color, colorHex, colorSubtitle })
                                    └── [select intensity + clarity]
                                        └── SmellMain
                                            ├── → SmellFruitType          (tap "Fruit" card)
                                            │   └── SmellFruitDetail      (params: { fruitType })
                                            │       └── [multi-select → back to SmellMain]
                                            │       fruitType options:
                                            │         Black Fruit | Red Fruit | Dried Fruit
                                            │         Tropical Fruit | Tree Fruit | Citrus Fruit
                                            ├── → SmellHerbsSpices        (tap "Herbs & Spices" card)
                                            │   └── SmellHerbSpiceDetail  (params: { category })
                                            │       category: 'Herbs' | 'Spices'
                                            │       └── [multi-select → back to SmellMain]
                                            └── → SmellOutdoorOther       (tap "Outdoor" or "Other")
                                                    └── [multi-select → back to SmellMain]
                                                    category: 'Outdoor' | 'Other'

                                            [Next from SmellMain]
                                                └── Taste
                                                    └── [set 6 scales: Sweetness, Acidity,
                                                        Tannin(red only), Alcohol, Body, Finish]
                                                        └── Think
                                                            └── [DONE — SAVE WINE]
                                                                ├── saveWine()
                                                                ├── RESET context
                                                                └── navigate("Home")
```

**Context fields written (in addition to Quick):** `style`, `color`, `colorIntensity`, `clarity`, `aromas[]`, `sweetness`, `acidity`, `tannin`, `alcohol`, `body`, `finish`

---

## 4. Label Scan Sub-Flow

```
BasicInfo
└── [tap "Scan Label"]
    └── ScanLabel
        ├── Mode toggle: "AI (Online)" | "Offline"
        ├── Front Label section
        │   ├── Take Photo (camera)
        │   ├── Choose from Library
        │   └── Remove photo
        ├── Back Label section  (same options)
        └── [Analyze Labels]
            ├── AI mode  → labelScanService.ts → Claude Haiku API
            │              → ScannedLabelData { name, producer, vintage,
            │                                   country, region, grapes, abv, importer }
            └── Offline  → offlineLabelParser.ts → ML Kit on-device OCR
                           → ScannedLabelData (vintage, ABV, grapes, country via regex)
            └── [results written to WineTastingContext]
                └── navigate back to BasicInfo  (fields pre-filled)
```

---

## 5. Custom Flight Flow

```
Home
└── AddWineType
    └── [tap "Start a Wine Flight" → modal opens]
        └── [choose "Custom Flight (at home / venue)"]
            └── [enter flight name]
                └── CustomFlight  (params: { flightId, flightName })
                    │   Context: SET_CUSTOM_FLIGHT { customFlightId, customFlightName }
                    ├── "+ Add Wine" button
                    │   └── AddWineType  (banner shows active flight)
                    │       └── [choose Quick Sip or Guided Tasting]
                    │           └── [full tasting flow]
                    │               └── Think → saveWine(wine with flightId/flightName)
                    │                   └── navigate back to CustomFlight
                    │                       (wine appears in list)
                    ├── [tap existing wine card]
                    │   └── WineDetail
                    ├── "Complete Flight"  (if wines exist and not yet completed)
                    │   └── markCustomFlightCompleted()
                    │       └── CustomFlight  (shows "Completed" badge, hides Add/Complete)
                    └── "Cancel Flight"  (if not completed)
                        └── [alert] → navigate("Home"), RESET context custom flight
```

**Storage:** wines saved to `@wine_pocket_pal:wines` with `flightId`, `flightName`
**Custom flight completion:** `@completed_custom_flights` (AsyncStorage)

---

## 6. Winery Guided Session Flow

### 6a. Check-In & Flight Selection

```
Home
└── AddWineType
    └── [tap "Start a Wine Flight" → modal]
        └── [choose "At a Winery"]
            └── WineryCheckIn
                ├── "Scan QR Code"  (Phase 4 — Coming Soon)
                │   └── [decode wpp://winery/{slug} → WineryDetail]
                └── "Search Wineries"
                    └── WinerySearch
                        └── [type query → filters cached Supabase wineries]
                            └── [tap winery card]
                                └── WineryDetail  (params: { wineryId })
                                    └── [tap flight card]
                                        ├── [if session exists for this flight]
                                        │   └── modal: "Resume" | "Start Fresh"
                                        └── [Start Tasting]
                                            └── TastingFlightDetail  (params: { flightId, wineryId })
```

### 6b. Flight Customization (Optional)

```
TastingFlightDetail
└── [tap "✎ Edit Flight"]
    ├── "+ Add Wine" → modal (name required, producer, vintage, style optional)
    │   └── saveFlightOverride() → guidedSessionStorage
    │       └── wine added to list, "modified" badge shown
    └── [tap ✕ on wine row]
        └── wine removed from list (override stored locally)
```

### 6c. Tasting Each Wine

```
TastingFlightDetail
└── [tap "Tap to taste →" on a wine row]
    └── [createGuidedSession() if none exists, else resume]
        └── GuidedSession  (params: { sessionId })
            ├── Progress bar: Wine X of Y
            ├── Current wine card (name, vintage, producer, region, grapes, ABV, description)
            ├── "Start Tasting This Wine"
            │   └── BasicInfo  (params: { guidedSessionId, flightWineIndex })
            │       (wine info pre-filled from FlightWine)
            │       └── [full Quick or Full tasting flow]
            │           └── Think  (params: { guidedSessionId })
            │               └── [DONE — SAVE WINE]
            │                   ├── saveWine(wine with flightId, flightName,
            │                   │            wineryId, wineryName, flightWineId)
            │                   ├── mark wine as completed in session
            │                   │   (completedWineIds[flightWineId] = wineId)
            │                   ├── advance session.currentIndex
            │                   └── navigate("GuidedSession", { sessionId })
            ├── "Skip This Wine"
            │   └── mark wine as skipped (completedWineIds[flightWineId] = null)
            │       └── advance to next wine
            └── "End Session"  (alert)
                └── archiveFlightSession() → navigate("Home")
```

### 6d. Session Completion

```
GuidedSession
└── [all wines tasted or skipped → completion view]
    ├── Shows all wines: ✓ tasted | skipped (gray)
    └── "Done"
        └── archiveFlightSession()
            └── clearGuidedSession()
                └── clearFlightOverride()
                    └── navigate("MyFlights" or "Home")
```

---

## 7. View & Edit Existing Tastings

### 7a. Browse Wine Library

```
Home → MyProfile
└── "My Tastings"
    └── MyTastings
        ├── Filter bar: search text
        ├── Style filters: RED | WHITE | ROSÉ | SPARK
        ├── Grape filter
        ├── Country filter
        └── [tap wine card]
            └── WineDetail  (params: { wineId })
                └── "Update Tasting" button → modal:
                    ├── "Basic Info"    → BasicInfo (LOAD_WINE context)
                    ├── "Wine & Tasting" → WineStyle (LOAD_WINE context)
                    └── "Reactions"     → Think (LOAD_WINE context)
                        └── [edit and save → back to WineDetail]
```

### 7b. Calendar View

```
Home → MyProfile → "Tasting Calendar"
└── TastingCalendar
    ├── Calendar grid with colored dots per day
    │   (red/white/rosé/sparkling/orange/dessert dot per wine)
    └── [tap a day]
        └── modal: list of wines tasted that day
            └── [tap wine] → WineDetail
```

### 7c. Flight History

```
Home → MyProfile → "My Flights"
└── MyFlights
    ├── Winery flights (sorted newest first)
    │   └── [tap row] → CompletedFlightDetail  (params: { sessionId })
    │       ├── Header: winery, flight name, date, X/Y wines tasted
    │       ├── [tap saved wine row] → WineDetail
    │       └── [tap skipped wine row]
    │           └── LOAD_WINE context (FlightWine data)
    │               SET_RETROACTIVE { retroactiveSessionId, retroactiveFlightWineId }
    │               └── BasicInfo → [tasting flow] → Think
    │                   └── saveWine() + update completedWineIds in archive
    │                       └── navigate("CompletedFlightDetail")
    └── Custom flights
        └── [tap row] → CustomFlight  (params: { flightId, flightName })
```

---

## 8. Winery Partner Direct Entry

```
(Phase 4: QR scan in-app)
WineryCheckIn → [scan QR → decode wpp://winery/{slug}]
    └── WineryDetail  (params: { wineryId })

(Current: manual search)
WineryCheckIn → WinerySearch → WineryDetail
```

### Winery Detail Inner Navigation

```
WineryDetail
└── [flight card] → TastingFlightDetail
    └── [wine row "Tap to taste"] → GuidedSession → [tasting flow]
                                                     → back to GuidedSession
    └── [wine row — completed] → (no navigation, shows inline result)
    ├── "Complete Tasting"
    │   └── archiveFlightSession() + clearFlightOverride()
    │       └── navigate("Home")
    └── "Cancel Tasting"
        └── [alert] → clearGuidedSession() + clearFlightOverride()
            └── navigate("Home")
```

---

## 9. Educational Path

```
Home
└── "Wine Tasting Guide"
    └── WineTastingGuide  (read-only, no navigation out except back)
        ├── 4-step method (Look → Smell → Taste → Think)
        └── Definitions (Tannin, Acidity, Body, Finish, etc.)
```

---

## 10. Full Screen Inventory with Reachability

| Screen | Route Name | Reachable From | Params |
|---|---|---|---|
| Home | `Home` | App start, Think (after save), GuidedSession end | — |
| Add Wine Type | `AddWineType` | Home, CustomFlight (Add Wine) | — |
| Basic Info | `BasicInfo` | AddWineType, GuidedSession, WineDetail (edit), CompletedFlightDetail (retro) | `{ guidedSessionId?, flightWineIndex? }` |
| Scan Label | `ScanLabel` | BasicInfo | — |
| Wine Style | `WineStyle` | BasicInfo (full tasting), WineDetail (edit) | — |
| Look Color | `LookColor` | WineStyle | — |
| Look Details | `LookDetails` | LookColor | `{ color, colorHex, colorSubtitle }` |
| Smell Main | `SmellMain` | LookDetails | — |
| Smell Fruit Type | `SmellFruitType` | SmellMain | — |
| Smell Fruit Detail | `SmellFruitDetail` | SmellFruitType | `{ fruitType }` |
| Smell Herbs Spices | `SmellHerbsSpices` | SmellMain | — |
| Smell Herb/Spice Detail | `SmellHerbSpiceDetail` | SmellHerbsSpices | `{ category }` |
| Smell Outdoor/Other | `SmellOutdoorOther` | SmellMain | `{ category }` |
| Taste | `Taste` | SmellMain | — |
| Think | `Think` | BasicInfo (quick), Taste (full) | `{ guidedSessionId? }` |
| My Tastings | `MyTastings` | MyProfile | — |
| Tasting Calendar | `TastingCalendar` | MyProfile | — |
| Wine Detail | `WineDetail` | MyTastings, CompletedFlightDetail, CustomFlight, TastingCalendar modal | `{ wineId }` |
| Wine Tasting Guide | `WineTastingGuide` | Home | — |
| My Profile | `MyProfile` | Home | — |
| Winery Check-In | `WineryCheckIn` | AddWineType modal | — |
| Winery Search | `WinerySearch` | WineryCheckIn | — |
| Winery Detail | `WineryDetail` | WinerySearch | `{ wineryId }` |
| Tasting Flight Detail | `TastingFlightDetail` | WineryDetail | `{ flightId, wineryId }` |
| Guided Session | `GuidedSession` | TastingFlightDetail, Think (return) | `{ sessionId }` |
| My Flights | `MyFlights` | MyProfile | — |
| Completed Flight Detail | `CompletedFlightDetail` | MyFlights, WineDetail (flight badge) | `{ sessionId }` |
| Custom Flight | `CustomFlight` | AddWineType (new flight), MyFlights | `{ flightId, flightName }` |

---

## 11. Global State (WineTastingContext) Data Flow

```
WineTastingProvider
│
├── State shape:
│   ├── tastingType: 'quick' | 'full'
│   ├── scanApplied: boolean
│   ├── guidedSessionId: string | null
│   ├── customFlightId: string | null
│   ├── customFlightName: string | null
│   ├── retroactiveSessionId: string | null
│   ├── retroactiveFlightWineId: string | null
│   └── [all Wine fields as partials]
│
├── SET_TASTING_TYPE   ← AddWineType
├── UPDATE             ← every tasting screen (incremental field updates)
├── LOAD_WINE          ← WineDetail "Update Tasting" (loads existing wine for edit)
├── RESET              ← Think (after save), Cancel flows
├── SET_SCAN_APPLIED   ← ScanLabel (after label analysis applied)
├── SET_GUIDED_SESSION_ID ← TastingFlightDetail (when starting a session)
├── SET_CUSTOM_FLIGHT  ← AddWineType (when creating a custom flight)
└── SET_RETROACTIVE    ← CompletedFlightDetail (for adding notes to skipped wines)
```

---

## 12. Persistence Layer Summary

```
AsyncStorage
├── @wine_pocket_pal:wines          — array of Wine objects (all saved tastings)
├── guided_session_active           — active GuidedSession JSON
├── guided_session_flight_{id}      — TastingFlight JSON cached for active session
├── guided_session_override_{id}    — FlightOverride JSON (local flight edits)
├── guided_session_archived         — CompletedFlightSession[] (flight history)
└── @completed_custom_flights       — string[] of completed custom flight IDs

Supabase (remote, read-mostly for consumers)
├── wineries             — partner winery profiles
├── tasting_flights      — winery tasting flights
└── flight_wines         — individual wines within a flight
```
