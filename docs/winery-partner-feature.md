# Winery Partner Feature — Design Reference

This document is the authoritative design reference for the "winery partner" feature. Read this before working on anything in the winery check-in, tasting flight, or guided session flows.

## Status overview

| Area | Status |
|---|---|
| Supabase project created | ✅ Done |
| Supabase schema + RLS applied | ✅ Done |
| App: WineryCheckIn, WinerySearch, WineryDetail, TastingFlightDetail screens | ✅ Done |
| App: GuidedSession orchestrator + BasicInfo pre-population | ✅ Done |
| App: Supabase client + wineryService wired to real DB | ✅ Done |
| App: Flight history (MyFlights, CompletedFlightDetail, flight provenance on Wine) | ✅ Done |
| App: QR code scanning | ⬜ Not started (Phase 4) |
| Winery admin portal (Next.js) | ⬜ Not started (Phase 5+) |

---

## Vision

Wineries sign up as partners and input their wines and tasting flights. A consumer opens the app at the winery, "checks in" (via QR scan or search), and can immediately start a guided tasting session where the app walks them through each wine in the flight in order — using the same full tasting flow that already exists.

---

## Chosen approach

| Decision | Choice | Why |
|---|---|---|
| Backend | **Supabase** | Real Postgres, Row-level security, Auth covers both consumers and winery accounts, relational model fits ordered wine lists naturally |
| Check-in methods | **QR code** (primary) + **Search** (fallback) | QR is cleanest at-winery UX; search is always-available fallback and doubles as discovery |
| Winery admin portal | **Next.js web app on Vercel** | Wineries need drag-to-reorder, image uploads, QR generation — form tools hit a wall quickly |
| Location check-in | **Phase 2 / optional** | GPS geofencing adds permission friction and battery cost; implement after QR/search are solid |

---

## Supabase Setup

**The Supabase project exists but the schema has not been applied yet.** Run the SQL below in the Supabase dashboard → SQL Editor. Copy the whole block and run it once.

```sql
-- ============================================================
-- 1. Tables
-- ============================================================

CREATE TABLE wineries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  description   text NOT NULL DEFAULT '',
  region        text NOT NULL DEFAULT '',
  country       text NOT NULL DEFAULT '',
  website       text,
  logo_url      text,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tasting_flights (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  winery_id   uuid NOT NULL REFERENCES wineries(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE flight_wines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id   uuid NOT NULL REFERENCES tasting_flights(id) ON DELETE CASCADE,
  position    int NOT NULL DEFAULT 0,
  name        text NOT NULL,
  producer    text NOT NULL DEFAULT '',
  vintage     text NOT NULL DEFAULT '',
  style       text CHECK (style IN ('red', 'white', 'rose', 'sparkling', 'dessert', 'fortified')),
  grapes      text[] NOT NULL DEFAULT '{}',
  region      text NOT NULL DEFAULT '',
  country     text NOT NULL DEFAULT '',
  abv         text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price       text,
  image_url   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Indexes
-- ============================================================

CREATE INDEX ON wineries (slug);
CREATE INDEX ON tasting_flights (winery_id, is_active, sort_order);
CREATE INDEX ON flight_wines (flight_id, position);

-- ============================================================
-- 3. Row-Level Security
-- ============================================================

ALTER TABLE wineries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasting_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_wines ENABLE ROW LEVEL SECURITY;

-- Wineries: anyone can read, owner can write
CREATE POLICY "public read wineries"
  ON wineries FOR SELECT USING (true);

CREATE POLICY "owner write wineries"
  ON wineries FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Flights: public read if active (or owner), owner can write
CREATE POLICY "public read active flights"
  ON tasting_flights FOR SELECT
  USING (
    is_active = true
    OR auth.uid() = (SELECT owner_user_id FROM wineries WHERE id = winery_id)
  );

CREATE POLICY "owner write flights"
  ON tasting_flights FOR ALL
  USING (auth.uid() = (SELECT owner_user_id FROM wineries WHERE id = winery_id))
  WITH CHECK (auth.uid() = (SELECT owner_user_id FROM wineries WHERE id = winery_id));

-- Flight wines: same visibility as parent flight
CREATE POLICY "public read flight wines"
  ON flight_wines FOR SELECT
  USING (
    (SELECT is_active FROM tasting_flights WHERE id = flight_id) = true
    OR auth.uid() = (
      SELECT w.owner_user_id
      FROM wineries w
      JOIN tasting_flights f ON f.winery_id = w.id
      WHERE f.id = flight_id
    )
  );

CREATE POLICY "owner write flight wines"
  ON flight_wines FOR ALL
  USING (
    auth.uid() = (
      SELECT w.owner_user_id
      FROM wineries w
      JOIN tasting_flights f ON f.winery_id = w.id
      WHERE f.id = flight_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT w.owner_user_id
      FROM wineries w
      JOIN tasting_flights f ON f.winery_id = w.id
      WHERE f.id = flight_id
    )
  );
```

### After running the SQL — manual steps

1. **Verify tables exist**: Dashboard → Table Editor should show `wineries`, `tasting_flights`, `flight_wines`.
2. **Verify RLS is on**: Each table's settings should show "Row Level Security: Enabled".
3. **Seed a test winery** (optional but recommended before testing the app): insert a row into `wineries` with a known `slug` so search and QR scan have something to find.

### Inserting a test winery (SQL Editor)

```sql
INSERT INTO wineries (name, slug, description, region, country)
VALUES (
  'Test Winery',
  'test-winery',
  'A winery for local development and QA.',
  'Napa Valley',
  'United States'
);

-- Grab the new winery's id for the next inserts:
-- SELECT id FROM wineries WHERE slug = 'test-winery';
```

---

## Data model

### Supabase tables

```
wineries
  id            uuid PK
  name          text
  slug          text UNIQUE        -- used in QR codes: wpp://winery/{slug}
  description   text
  region        text
  country       text
  website       text
  logo_url      text
  owner_user_id uuid FK → auth.users
  created_at    timestamptz

tasting_flights
  id            uuid PK
  winery_id     uuid FK → wineries
  name          text
  description   text
  is_active     boolean            -- winery can toggle flights on/off
  sort_order    int                -- which flight appears first
  created_at    timestamptz

flight_wines
  id            uuid PK
  flight_id     uuid FK → tasting_flights
  position      int                -- determines tasting order
  name          text
  producer      text
  vintage       text
  style         text               -- red | white | rose | sparkling
  grapes        text[]
  region        text
  country       text
  abv           text
  description   text               -- winery's tasting notes / description shown before user rates
  price         text
  image_url     text
```

### App-side types (src/types/index.ts additions)

```ts
export interface Winery {
  id: string;
  name: string;
  slug: string;
  description: string;
  region: string;
  country: string;
  logoUrl: string | null;
}

export interface TastingFlight {
  id: string;
  wineryId: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  wines: FlightWine[];
}

export interface FlightWine {
  id: string;
  position: number;
  name: string;
  producer: string;
  vintage: string;
  style: WineStyle | null;
  grapes: string[];
  region: string;
  country: string;
  abv: string;
  description: string;
  imageUrl: string | null;
}

// Tracks an in-progress guided session (stored locally in AsyncStorage)
export interface GuidedSession {
  id: string;
  wineryId: string;
  flightId: string;
  flightName: string;
  wineryName: string;
  startedAt: string;
  currentIndex: number;             // which wine in the flight the user is on
  wineIds: string[];                // Wine.id for each completed tasting (null if not yet done)
}
```

---

## App screens

### New screens — ✅ All built

| Screen | File | Status |
|---|---|---|
| `WineryCheckInScreen` | `src/screens/WineryCheckInScreen.tsx` | ✅ Done |
| `WinerySearchScreen` | `src/screens/WinerySearchScreen.tsx` | ✅ Done |
| `WineryDetailScreen` | `src/screens/WineryDetailScreen.tsx` | ✅ Done |
| `TastingFlightDetailScreen` | `src/screens/TastingFlightDetailScreen.tsx` | ✅ Done |
| `GuidedSessionScreen` | `src/screens/GuidedSessionScreen.tsx` | ✅ Done |

### Screens that are reused as-is

The entire existing tasting flow (`BasicInfo` → `WineStyle` → `Look` → `Smell` → `Taste` → `Think`) is reused without changes. The guided session pre-populates `BasicInfo` with the flight wine's data (name, producer, vintage, country, grapes, ABV) so the user doesn't need to type anything — they just confirm or adjust, then proceed through smell/taste/think.

The only change needed in the tasting context is a way to know if a tasting was started from a guided session (so `Think` can return to `GuidedSession` instead of `Home` when done).

### Navigation param additions

```ts
WineryCheckIn: undefined;
WinerySearch: undefined;
WineryDetail: { wineryId: string };
TastingFlightDetail: { flightId: string; wineryId: string };
GuidedSession: { sessionId: string };
// BasicInfo needs a new optional param:
BasicInfo: { guidedSessionId?: string; flightWineIndex?: number } | undefined;
```

---

## Check-in flow detail

### QR code path
1. Winery admin portal generates a QR code encoding `wpp://winery/{slug}`
2. User taps "Visit a Winery" on Home, opens camera
3. App decodes the slug, fetches winery from Supabase, navigates to `WineryDetail`

### Search path
1. User taps "Visit a Winery" → "Search Wineries"
2. Text input queries `wineries` table (name ILIKE search)
3. Results list → tap → `WineryDetail`

---

## Guided session flow detail

```
TastingFlightDetail
  → "Begin Tasting" creates a GuidedSession record in AsyncStorage
  → GuidedSession screen shows Wine #1's info
  → "Start Tasting This Wine" pre-populates BasicInfo and enters tasting flow
  → tasting flow completes (Think screen saves Wine), returns to GuidedSession
  → GuidedSession advances index, shows Wine #2
  → ... repeat until all wines done
  → GuidedSession shows completion summary (links to each saved Wine)
```

The guided session does NOT require a network connection after check-in — the flight data is fetched once and the rest is local.

---

## Winery admin portal (separate repo)

- **Stack**: Next.js (App Router) + Supabase JS client + Tailwind
- **Host**: Vercel (free tier)
- **Auth**: Supabase Auth with email/password; each winery account owns its `wineries` row via `owner_user_id`
- **Features needed**:
  - Winery registration / profile setup
  - Create/edit tasting flights
  - Add wines to a flight, drag to reorder
  - Toggle flights active/inactive
  - Generate + download QR code (encodes the winery slug)
  - View-only tasting stats (how many sessions started for each flight)

Row-level security ensures a winery account can only read/write its own rows.

---

## What NOT to do

- Don't require user accounts for consumers — the tasting app works without login. Wineries need accounts; consumers don't (at least in v1).
- Don't store the guided session server-side in v1 — local AsyncStorage is fine. Cloud sync can come later.
- Don't implement location-based check-in until QR + search are stable.
- Don't change the existing tasting screens' internal logic — only add the optional `guidedSessionId` param and a return-to-session path at the end.

---

## Phase plan

| Phase | Scope | Status |
|---|---|---|
| 1a | Supabase schema + RLS | ✅ Done |
| 1b | Winery admin portal (registration, flight builder, QR gen) | ✅ Done — Next.js app at wine-admin-portal/ (sibling to Wine App) |
| 2 | App: WineryCheckIn, WinerySearch, WineryDetail, TastingFlightDetail screens | ✅ Done |
| 3 | App: GuidedSession orchestrator + BasicInfo pre-population from flight data | ✅ Done |
| 3b | App: Supabase client + wineryService wired to real DB | ✅ Done |
| 3c | App: Flight history — MyFlightsScreen, CompletedFlightDetailScreen; sessions archived on Done/End; flight provenance stamped on Wine; "From flight" link in WineDetail | ✅ Done |
| 4 | App: QR code scanning (reuse existing camera, add barcode decoder) | ⬜ Not started |
| 5 | Optional: location-based check-in, consumer accounts, cloud session sync | ⬜ Not started |
