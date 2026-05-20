# Wine Pocket Pal — User Stories

## Personas

| Persona | Description |
|---|---|
| **Casual Taster** | Drinks wine socially, wants to remember favorites without friction. No technical knowledge. |
| **Learning Enthusiast** | Curious about wine, building vocabulary, wants structure and education. |
| **Flight Explorer** | Loves wine tastings, visits wineries or hosts flights at home. Wants to track the full experience. |
| **Wine Tracker** | Serious collector or hobbyist. Tracks everything — vintage, grapes, ratings, notes. |
| **Winery Guest** | Visiting a partner winery. Wants a guided, venue-specific tasting experience. |

---

## Epic 1: Quick Wine Logging

### US-101 — Log a wine in under a minute
**As a** Casual Taster,  
**I want to** record a wine I just tried with minimal taps,  
**so that** I can remember what it was without interrupting a conversation.

**Acceptance criteria:**
- User can reach the save screen in ≤ 4 taps (Home → AddWineType → Quick Sip → Think)
- Only producer, name, and rating are needed to save — all other fields optional
- Wine appears in My Tastings immediately after saving

### US-102 — Rate a wine thumbs up or down
**As a** Casual Taster,  
**I want to** mark a wine as liked or disliked,  
**so that** I know at a glance whether to order it again.

**Acceptance criteria:**
- Liked/disliked is selectable on the Think screen
- WineDetail shows a clear liked/disliked badge
- MyTastings list shows the emoji reaction on each card

### US-103 — Give a numeric rating
**As a** Casual Taster,  
**I want to** rate a wine 1–10,  
**so that** I can compare wines I've tried at different times.

**Acceptance criteria:**
- Rating buttons (1–10) are clearly visible on Think screen
- Rating displayed on MyTastings card and WineDetail
- Rating is optional — user can save without rating

### US-104 — Add a quick personal note
**As a** Casual Taster,  
**I want to** jot down a quick impression or pairing idea,  
**so that** I have more context than just a rating when I revisit the wine later.

**Acceptance criteria:**
- Multi-line notes field on Think screen
- Notes visible on WineDetail in a "Notes" section

### US-105 — Attach a photo to a wine
**As a** Casual Taster,  
**I want to** take or pick a photo of the bottle,  
**so that** I can recognize the wine by its label later.

**Acceptance criteria:**
- BasicInfo offers both camera capture and library picker
- Photo displays as a large hero image on WineDetail
- Placeholder icon shown when no photo was added

---

## Epic 2: Full Structured Tasting

### US-201 — Follow the structured 4-step tasting method
**As a** Learning Enthusiast,  
**I want to** be walked through Look → Smell → Taste → Think in order,  
**so that** I build proper tasting habits and don't skip steps.

**Acceptance criteria:**
- Choosing "Guided Tasting" always routes through WineStyle → LookColor → LookDetails → SmellMain → Taste → Think in that order
- Each screen is clearly labelled as a step (Look, Smell, Taste, Think)
- User cannot skip ahead; each step must be completed before proceeding

### US-202 — Record the wine's appearance
**As a** Learning Enthusiast,  
**I want to** choose the wine's color, color intensity, and clarity,  
**so that** I practice observational skills that correlate with wine characteristics.

**Acceptance criteria:**
- Color options are filtered to the selected wine style (e.g., no "Ruby" for white wine)
- Color tiles show the actual hex color visually
- Intensity (light/medium/deep) and clarity (clear/hazy/cloudy) are both recorded

### US-203 — Identify aromas from structured categories
**As a** Learning Enthusiast,  
**I want to** select detected aromas from organized categories (Fruit, Herbs & Spices, Outdoor, Other),  
**so that** I learn the vocabulary used by sommeliers and develop my nose.

**Acceptance criteria:**
- Aroma categories are expandable cards
- Fruit aromas are further organized by fruit type (Black, Red, Tropical, etc.)
- Multiple aromas can be selected across categories
- Selected aromas shown as chips before proceeding

### US-204 — Record taste dimensions on calibrated scales
**As a** Learning Enthusiast,  
**I want to** rate sweetness, acidity, tannin, alcohol, body, and finish on labeled scales,  
**so that** I can articulate why I like or dislike a wine's structure.

**Acceptance criteria:**
- Each of the 6 dimensions has a 5-step scale with named endpoints (e.g., "Dry ↔ Sweet")
- Tannin scale is hidden for wines marked as white, rosé, sparkling, or dessert
- All 6 (or 5) dimensions are visible on one screen without scrolling (or with clear affordance)
- Values are shown in WineDetail in a structured grid

### US-205 — Scan a label to auto-fill wine details
**As a** Learning Enthusiast,  
**I want to** photograph a wine label and have the app extract the details automatically,  
**so that** I spend less time typing and more time tasting.

**Acceptance criteria:**
- BasicInfo has a "Scan Label" button
- User can capture front label, back label, or both
- AI mode uses Claude Haiku to extract: name, producer, vintage, country, region, grapes, ABV, importer
- Offline mode uses on-device OCR (no internet required) and extracts vintage, ABV, grapes, country
- Extracted data fills BasicInfo fields; user can override any field before proceeding

### US-206 — Read the wine education guide
**As a** Learning Enthusiast,  
**I want to** read an in-app guide explaining tasting terms and methods,  
**so that** I know what I'm assessing before I begin a tasting.

**Acceptance criteria:**
- Wine Tasting Guide is accessible from the Home screen without starting a tasting
- Guide covers the 4-step method, definitions of Tannin, Acidity, Body, Finish, and related terms
- Content is readable without an internet connection

---

## Epic 3: Wine Library & Discovery

### US-301 — Browse my complete tasting history
**As a** Wine Tracker,  
**I want to** see all wines I've saved in a searchable list,  
**so that** I can look up a wine before ordering it again.

**Acceptance criteria:**
- My Tastings shows all saved wines sorted newest first
- Each card shows: photo/placeholder, name, style badge, vintage, country, grapes, rating, liked/disliked, date
- List is scrollable and performant with many wines

### US-302 — Search and filter my wines
**As a** Wine Tracker,  
**I want to** filter my wine list by style, grape, or country and search by text,  
**so that** I can quickly find a specific wine or compare wines of a certain type.

**Acceptance criteria:**
- Free-text search filters by producer/name in real time
- Style filter chips (RED, WHITE, ROSÉ, SPARKLING) narrow results
- Grape and country filters are also available
- Filters combine (AND logic)
- Filter state persists while on the screen

### US-303 — View all details for a wine I've tasted
**As a** Wine Tracker,  
**I want to** open a wine and see every piece of information I recorded — appearance, aromas, taste structure, rating, and notes — in one place,  
**so that** I can fully recall the experience.

**Acceptance criteria:**
- WineDetail shows large photo (or placeholder), all identification fields, style badge, grapes, date tasted
- Sight, Aromas, and Taste sections display (when present)
- Notes shown in their own section
- If wine was part of a flight, a badge links to the flight detail

### US-304 — Delete a wine I no longer want to track
**As a** Wine Tracker,  
**I want to** remove a wine entry from my history,  
**so that** my library stays accurate.

**Acceptance criteria:**
- Delete button (or swipe action) available on each card in My Tastings
- Confirmation prompt prevents accidental deletion
- Wine is removed immediately from list without page reload

### US-305 — Update a tasting I already saved
**As a** Wine Tracker,  
**I want to** edit any section of a recorded tasting,  
**so that** I can fix mistakes or add information I missed.

**Acceptance criteria:**
- WineDetail shows an "Update Tasting" button
- Modal offers three edit paths: Basic Info, Wine & Tasting (style/look/smell/taste), Reactions (think)
- Edits persist to the same wine record (no duplicate created)

### US-306 — See which days I've tasted wine on a calendar
**As a** Wine Tracker,  
**I want to** view my tasting history on a calendar with color-coded dots,  
**so that** I can see patterns in when and what I drink.

**Acceptance criteria:**
- Calendar shows a dot per wine style tasted on each date
- Dots are color-coded (red/white/rosé/sparkling/etc.)
- Tapping a day shows a modal list of wines tasted that day
- Tapping a wine in the modal opens WineDetail

---

## Epic 4: Custom Wine Flights

### US-401 — Create a named flight for wines tasted together
**As a** Flight Explorer,  
**I want to** group wines I'm trying side-by-side into a named flight,  
**so that** I can review and compare them as a set later.

**Acceptance criteria:**
- "Start a Wine Flight" option in AddWineType
- Choosing "Custom Flight" prompts for a flight name
- Flight name is visible as a banner during subsequent wine additions

### US-402 — Add wines to a custom flight one at a time
**As a** Flight Explorer,  
**I want to** taste and save each wine into the flight sequentially,  
**so that** each wine's tasting happens naturally as I drink it.

**Acceptance criteria:**
- "+ Add Wine" on CustomFlight starts a normal tasting flow (Quick or Full)
- Wine is saved with the flight's ID and name
- After saving, app returns to the CustomFlight screen
- Newly added wine appears in the flight list immediately

### US-403 — Mark a custom flight as complete
**As a** Flight Explorer,  
**I want to** mark a flight as finished when I'm done,  
**so that** I can distinguish closed flights from ones still in progress.

**Acceptance criteria:**
- "Complete Flight" button available when flight has at least one wine and is not yet completed
- Completed flights show a "Completed" badge
- No new wines can be added to a completed flight
- Flight appears in My Flights history

### US-404 — Cancel a custom flight I no longer want to track
**As a** Flight Explorer,  
**I want to** cancel a flight in progress,  
**so that** I can start fresh if I change my mind or it was a mistake.

**Acceptance criteria:**
- "Cancel Flight" button shown on CustomFlight when not yet completed
- Alert asks for confirmation before cancelling
- After cancel, flight context is reset and app returns to Home
- Individual wines saved during the flight are not deleted (they remain as standalone tastings)

### US-405 — Review all wines from a completed custom flight
**As a** Flight Explorer,  
**I want to** open a completed custom flight and see all wines I recorded,  
**so that** I can compare them or share the results.

**Acceptance criteria:**
- My Flights shows all custom flights with "CUSTOM FLIGHT" label
- Opening a custom flight shows wine list with rating, liked/disliked, notes snippet per wine
- Tapping a wine opens WineDetail

---

## Epic 5: Winery Guided Sessions

### US-501 — Find a partner winery by searching
**As a** Winery Guest,  
**I want to** search for the winery I'm visiting by name,  
**so that** I can access their tasting flights without needing a QR code.

**Acceptance criteria:**
- Winery Search filters results as the user types
- Search works on winery name, region, and country
- Results show name, region · country, and description snippet
- Search results available without internet when wineries are cached in memory

### US-502 — Scan a winery QR code to check in instantly (future)
**As a** Winery Guest,  
**I want to** scan a QR code at the winery to jump straight to their tasting flights,  
**so that** I don't have to search for the winery manually.

**Acceptance criteria:**
- "Scan QR Code" option on WineryCheckIn screen
- QR code encodes `wpp://winery/{slug}`
- Scanning navigates directly to WineryDetail for that winery
- *(Phase 4 — not yet implemented)*

### US-503 — Browse a winery's tasting flights before starting
**As a** Winery Guest,  
**I want to** see all available tasting flights at the winery before choosing one,  
**so that** I can pick the one that matches my interests.

**Acceptance criteria:**
- WineryDetail shows all active flights as cards
- Each card shows flight name, wine count, and description snippet
- Only `is_active = true` flights are shown
- Tap flight shows the full wine list (TastingFlightDetail) before committing to a session

### US-504 — Begin a guided tasting session for a winery flight
**As a** Winery Guest,  
**I want to** start a session for a specific flight so the app walks me through each wine in order,  
**so that** I can focus on tasting instead of managing the app.

**Acceptance criteria:**
- Tapping a flight and confirming "Start Tasting" creates a GuidedSession
- GuidedSession shows current wine position (e.g., "Wine 2 of 5") with a progress bar
- Current wine details (name, vintage, producer, region, grapes, ABV, winery notes) are shown
- User taps "Start Tasting This Wine" to enter the full tasting flow for that wine

### US-505 — Resume an interrupted session
**As a** Winery Guest,  
**I want to** resume a session I started earlier if I left the app mid-flight,  
**so that** I don't lose my progress.

**Acceptance criteria:**
- Session state is persisted locally in AsyncStorage
- On returning to WineryDetail and tapping the same flight, a modal offers "Resume" or "Start Fresh"
- "Resume" restores session at the exact wine where the user left off
- "Start Fresh" clears the previous session and creates a new one

### US-506 — Skip a wine in a guided session
**As a** Winery Guest,  
**I want to** skip a wine in the flight,  
**so that** I can move on if I don't want to taste a particular wine.

**Acceptance criteria:**
- "Skip This Wine" button visible on GuidedSession screen
- Skipping marks the wine in `completedWineIds` as null and advances the session
- Skipped wines shown in gray in the completion summary
- Skipped wines can be retroactively tasted from CompletedFlightDetail

### US-507 — Add my own wines to a winery flight
**As a** Winery Guest,  
**I want to** add a wine the winery poured that wasn't on the official flight list,  
**so that** my session reflects everything I actually tasted.

**Acceptance criteria:**
- "Edit Flight" toggle on TastingFlightDetail reveals edit mode
- "+ Add Wine" opens a modal (name required; producer, vintage, style optional)
- Added wine is saved as a local override (does not modify Supabase data)
- Flight shows "modified" badge when overrides are active
- Added wine can be tasted just like any flight wine

### US-508 — Remove a wine from a winery flight locally
**As a** Winery Guest,  
**I want to** remove a wine I won't be tasting from the flight list,  
**so that** my session progress reflects only the wines I'm actually drinking.

**Acceptance criteria:**
- Edit mode shows a ✕ (remove) button on each wine row
- Removing saves a local override; does not affect Supabase data
- Removed wine disappears from the flight list
- "Cancel Tasting" restores the original flight (removes all overrides)

### US-509 — See my progress through a flight
**As a** Winery Guest,  
**I want to** see how many wines I've completed vs. skipped vs. remaining,  
**so that** I can pace myself through a long tasting.

**Acceptance criteria:**
- TastingFlightDetail shows a progress indicator (e.g., "3/5" badge) when a session is in progress
- GuidedSession shows a progress bar and "Wine X of Y" count
- Completed wines show a checkmark; skipped wines show a visual distinction

### US-510 — End a session early and archive it
**As a** Winery Guest,  
**I want to** end the tasting session even if I haven't finished all wines,  
**so that** I can leave the winery and still keep my progress.

**Acceptance criteria:**
- "End Session" button on GuidedSession
- Alert asks for confirmation
- Session is archived with current completion state
- Remaining wines show as uncompleted in CompletedFlightDetail
- All tasted wines are preserved

### US-511 — Review my completed winery flight later
**As a** Winery Guest,  
**I want to** open a completed flight and see all my tasting notes for each wine,  
**so that** I can remember the experience and share it with others.

**Acceptance criteria:**
- Completed flight listed in My Flights with winery name, flight name, date, and X/Y wines tasted
- CompletedFlightDetail shows each wine with "Saved · tap to view" or "Skipped · tap to add notes"
- Tapping a saved wine opens WineDetail with full tasting record
- Header shows winery name, flight name, date, and wine count

### US-512 — Add tasting notes to a wine I skipped after the session
**As a** Winery Guest,  
**I want to** go back and add notes for a wine I skipped during the session,  
**so that** I can complete my record even if I didn't taste it in order.

**Acceptance criteria:**
- Skipped wine rows in CompletedFlightDetail show "Skipped · tap to add notes"
- Tapping loads the wine's information into the tasting flow context (retroactive mode)
- User completes a tasting for that wine; result is linked to the completed session
- Wine row updates to show "Saved · tap to view" after notes are added

---

## Epic 6: Profile & App Management

### US-601 — See a summary of my tasting activity
**As a** Wine Tracker,  
**I want to** see how many wines and flights I've recorded,  
**so that** I can track my progress as a taster.

**Acceptance criteria:**
- My Profile shows total wine count and total flight count
- Stats update in real time as wines are added or deleted

### US-602 — Clear all my data
**As any user,**  
**I want to** clear all saved tastings and flights from the app,  
**so that** I can start fresh (e.g., reset before sharing the app with someone else).

**Acceptance criteria:**
- "Clear all data" option on My Profile
- Confirmation alert warns the action is irreversible
- After clearing: wine count = 0, flight list empty, My Tastings empty

---

## Epic 7: Cross-Cutting Concerns

### US-701 — Use the app without an internet connection
**As a** Casual Taster,  
**I want to** log wines even when I'm in a basement wine bar with no signal,  
**so that** connectivity doesn't block me from recording a tasting.

**Acceptance criteria:**
- All tasting flows (Quick, Full) work fully offline
- Wine data saved to local AsyncStorage with no network dependency
- Label scan falls back to Offline mode (on-device OCR) gracefully
- Winery search uses cached data if available; shows appropriate message if no cache

### US-702 — Use AI label scanning when online
**As a** Wine Tracker,  
**I want to** use the AI mode to scan a label and have it auto-identify grapes, vintage, and region,  
**so that** I can be accurate without having to read tiny label text.

**Acceptance criteria:**
- AI mode clearly labeled as requiring internet
- Sends front and/or back label images to Claude Haiku
- Extracts: name, producer, vintage, country, region, grapes, ABV, importer
- All extracted fields are pre-filled but editable before saving

### US-703 — Use offline OCR label scanning without internet
**As a** Casual Taster,  
**I want to** use the Offline scan mode so the app extracts basic label info on-device,  
**so that** I get some auto-fill even when I have no connection.

**Acceptance criteria:**
- Offline mode uses ML Kit on-device OCR
- Extracts vintage, ABV, grapes, and country via regex and lookup lists
- Name and producer left blank for manual entry
- Works on a physical device (not available in Expo Go)

### US-704 — Know that my data stays on my device
**As any user,**  
**I want to** know that my personal tasting notes are stored locally and not uploaded to a server,  
**so that** I control my own data.

**Acceptance criteria:**
- Wine records, notes, ratings stored in AsyncStorage (device-local)
- Winery/flight catalog data comes from Supabase read-only
- No user authentication required to use the app in v1

### US-705 — Navigate back from any screen without losing my work
**As any user,**  
**I want to** be able to use the back button during a tasting without losing all my progress,  
**so that** I can correct a mistake on a previous screen.

**Acceptance criteria:**
- Tasting context persists while navigating within a tasting flow
- Back navigation from any tasting screen returns to the previous screen with previous selections intact
- Context is only reset on explicit "Save" or "Cancel" actions

---

## Story Map Summary

| Theme | Stories | Priority |
|---|---|---|
| Quick logging | US-101–105 | High — core use case |
| Full structured tasting | US-201–206 | High — differentiator |
| Wine library | US-301–306 | High — retention driver |
| Custom flights | US-401–405 | Medium — at-home use case |
| Winery guided sessions | US-501–512 | Medium — winery partner feature |
| Profile & management | US-601–602 | Low |
| Cross-cutting (offline, data) | US-701–705 | High — table stakes |

### Not Yet Covered (Future Epics)

- **Social sharing**: share a flight summary or wine card
- **Wine recommendations**: suggest wines based on taste preferences
- **Winery admin portal**: winery creates flights, generates QR codes, views check-ins
- **Consumer accounts**: sync tastings across devices
- **Location-based check-in**: auto-suggest nearby partner winery
- **QR code scanning** (US-502): Phase 4, infrastructure ready, UI not yet built
- **Flight export**: export tasting notes as PDF or share link
- **Push notifications**: remind user to log a wine or revisit a visit summary
