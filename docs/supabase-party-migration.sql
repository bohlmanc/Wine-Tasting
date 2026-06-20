-- Tasting Party feature — run this in the Supabase SQL editor

-- 1. tasting_rooms
CREATE TABLE IF NOT EXISTS tasting_rooms (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code           varchar(4) NOT NULL UNIQUE,
  host_device_id text NOT NULL,
  flight_type    text DEFAULT 'custom',      -- 'custom' | 'winery'
  winery_id      text,
  winery_flight_id text,
  is_setup_complete boolean DEFAULT false,   -- false while host is building the flight
  is_active      boolean DEFAULT true,
  expires_at     timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  closing_at     timestamptz,
  created_at     timestamptz DEFAULT now()
);

-- 2. room_participants
CREATE TABLE IF NOT EXISTS room_participants (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id      uuid NOT NULL REFERENCES tasting_rooms(id) ON DELETE CASCADE,
  device_id    text NOT NULL,
  display_name text NOT NULL,
  is_host      boolean DEFAULT false,
  last_seen_at timestamptz DEFAULT now(),
  joined_at    timestamptz DEFAULT now(),
  left_at      timestamptz,
  UNIQUE(room_id, device_id)
);

-- 3. room_flight_wines (locked list — written once when host taps "Start Party")
CREATE TABLE IF NOT EXISTS room_flight_wines (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id    uuid NOT NULL REFERENCES tasting_rooms(id) ON DELETE CASCADE,
  position   int NOT NULL DEFAULT 0,
  name       text NOT NULL,
  producer   text DEFAULT '',
  vintage    text DEFAULT '',
  style      text,
  grapes     jsonb DEFAULT '[]',
  region     text DEFAULT '',
  country    text DEFAULT '',
  abv        text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- 4. room_wine_responses (one row per participant × wine; updated per section)
CREATE TABLE IF NOT EXISTS room_wine_responses (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id         uuid NOT NULL REFERENCES tasting_rooms(id) ON DELETE CASCADE,
  participant_id  uuid NOT NULL REFERENCES room_participants(id) ON DELETE CASCADE,
  flight_wine_id  uuid NOT NULL REFERENCES room_flight_wines(id) ON DELETE CASCADE,
  -- Look (broadcast from LookDetails)
  color           text DEFAULT '',
  color_intensity text DEFAULT '',
  clarity         text DEFAULT '',
  -- Smell (broadcast from SmellMain)
  aromas          jsonb DEFAULT '[]',
  custom_aromas   jsonb DEFAULT '{}',
  -- Taste (broadcast from TasteScreen)
  sweetness       text DEFAULT '',
  acidity         text DEFAULT '',
  tannin          text DEFAULT '',
  alcohol         text DEFAULT '',
  body            text DEFAULT '',
  finish          text DEFAULT '',
  -- Think (broadcast from ThinkScreen)
  liked           boolean,
  rating          int,
  notes           text DEFAULT '',
  -- Status
  completed_at    timestamptz,
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(participant_id, flight_wine_id)
);

-- RLS: enable on all tables, allow anon key (public) to read & write
-- Data here is non-sensitive; host-level write auth is enforced in app code.
ALTER TABLE tasting_rooms       ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_flight_wines   ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_wine_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "party_rooms_select"    ON tasting_rooms       FOR SELECT USING (true);
CREATE POLICY "party_rooms_insert"    ON tasting_rooms       FOR INSERT WITH CHECK (true);
CREATE POLICY "party_rooms_update"    ON tasting_rooms       FOR UPDATE USING (true);

CREATE POLICY "party_parts_select"    ON room_participants   FOR SELECT USING (true);
CREATE POLICY "party_parts_insert"    ON room_participants   FOR INSERT WITH CHECK (true);
CREATE POLICY "party_parts_update"    ON room_participants   FOR UPDATE USING (true);

CREATE POLICY "party_wines_select"    ON room_flight_wines   FOR SELECT USING (true);
CREATE POLICY "party_wines_insert"    ON room_flight_wines   FOR INSERT WITH CHECK (true);

CREATE POLICY "party_resp_select"     ON room_wine_responses FOR SELECT USING (true);
CREATE POLICY "party_resp_insert"     ON room_wine_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "party_resp_update"     ON room_wine_responses FOR UPDATE USING (true);

-- Realtime: add tables to the publication (run separately if needed)
-- ALTER PUBLICATION supabase_realtime ADD TABLE tasting_rooms;
-- ALTER PUBLICATION supabase_realtime ADD TABLE room_participants;
-- ALTER PUBLICATION supabase_realtime ADD TABLE room_wine_responses;

-- Index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_tasting_rooms_code ON tasting_rooms(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_room_participants_room ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_flight_wines_room ON room_flight_wines(room_id);
CREATE INDEX IF NOT EXISTS idx_room_responses_room ON room_wine_responses(room_id);

-- ─── Migration: host-leave / room-close behaviour ────────────────────────────
-- Run these two ALTER statements in the Supabase SQL editor if the tables
-- were already created without the new columns.
ALTER TABLE tasting_rooms     ADD COLUMN IF NOT EXISTS closing_at timestamptz;
ALTER TABLE room_participants ADD COLUMN IF NOT EXISTS left_at    timestamptz;
