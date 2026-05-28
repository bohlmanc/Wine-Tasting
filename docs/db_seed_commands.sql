-- ============================================================
-- Wine Pocket Pal — Supabase Seed & Utility Commands
-- ============================================================
-- Paste any block into the Supabase Dashboard → SQL Editor.
-- The schema (tables + RLS policies) must already be applied
-- before running any of these. See winery-partner-feature.md
-- for the schema SQL.
-- ============================================================


-- ============================================================
-- SECTION 1: SEED DATA — Insert all test wineries
-- ============================================================
-- Run this to populate the DB from scratch (or after a wipe).
-- Safe to skip any winery block you don't need.
-- ============================================================


-- ------------------------------------------------------------
-- Winery: Test Winery (generic QA winery)
-- ------------------------------------------------------------
WITH test_winery AS (
  INSERT INTO wineries (name, slug, description, region, country)
  VALUES (
    'Test Winery',
    'test-winery',
    'A winery for local development and QA.',
    'Napa Valley',
    'United States'
  )
  RETURNING id
),
test_flight AS (
  INSERT INTO tasting_flights (winery_id, name, description, is_active, sort_order)
  SELECT id, 'QA Flight', 'A basic flight for testing the guided session flow end-to-end.', true, 1
  FROM test_winery
  RETURNING id
)
INSERT INTO flight_wines (flight_id, position, name, producer, vintage, style, grapes, region, country, abv, description, price)
  SELECT (SELECT id FROM test_flight), 1, 'Test White', 'Test Winery', '2023', 'white', ARRAY['Chardonnay'], 'Napa Valley', 'United States', '13.5%', 'A placeholder white wine for QA purposes.', '$20'
  UNION ALL
  SELECT (SELECT id FROM test_flight), 2, 'Test Red', 'Test Winery', '2022', 'red', ARRAY['Cabernet Sauvignon'], 'Napa Valley', 'United States', '14.0%', 'A placeholder red wine for QA purposes.', '$25';


-- ------------------------------------------------------------
-- Winery: Lola
-- ------------------------------------------------------------
WITH lola AS (
  INSERT INTO wineries (name, slug, description, region, country, website)
  VALUES (
    'Lola',
    'lola',
    'A boutique Washington winery crafting expressive, terroir-driven wines from exceptional Columbia Valley fruit.',
    'Columbia Valley, WA',
    'United States',
    'https://www.lolawineco.com'
  )
  RETURNING id
),
lola_flight AS (
  INSERT INTO tasting_flights (winery_id, name, description, is_active, sort_order)
  SELECT id, 'Spring Release Flight', 'A curated selection of our current releases showcasing the diversity of Washington terroir.', true, 1
  FROM lola
  RETURNING id
)
INSERT INTO flight_wines (flight_id, position, name, producer, vintage, style, grapes, region, country, abv, description, price)
  SELECT (SELECT id FROM lola_flight), 1, 'Roussanne', 'Lola', '2022', 'white', ARRAY['Roussanne'], 'Columbia Valley', 'United States', '13.5%', 'Lush and aromatic with honeysuckle, apricot, and a hint of beeswax. Fermented in neutral oak for added texture without losing freshness.', '$32'
  UNION ALL
  SELECT (SELECT id FROM lola_flight), 2, 'Rosé of Syrah', 'Lola', '2023', 'rose', ARRAY['Syrah'], 'Horse Heaven Hills', 'United States', '13.0%', 'Vibrant salmon-pink with strawberry, watermelon, and a hint of white pepper. Crisp and dry with a refreshing finish.', '$28'
  UNION ALL
  SELECT (SELECT id FROM lola_flight), 3, 'Syrah', 'Lola', '2021', 'red', ARRAY['Syrah', 'Viognier'], 'Walla Walla Valley', 'United States', '14.2%', 'Vibrant and spicy with black pepper, smoked olive, and ripe dark berries. Co-fermented with 3% Viognier for added floral lift.', '$44'
  UNION ALL
  SELECT (SELECT id FROM lola_flight), 4, 'Cabernet Sauvignon', 'Lola', '2021', 'red', ARRAY['Cabernet Sauvignon'], 'Horse Heaven Hills', 'United States', '14.5%', 'Deep and brooding with cassis, dark cherry, and cedar. Structured tannins lead to a long, elegant finish.', '$48';


-- ------------------------------------------------------------
-- Winery: JM Cellars
-- ------------------------------------------------------------
WITH jm AS (
  INSERT INTO wineries (name, slug, description, region, country, website)
  VALUES (
    'JM Cellars',
    'jm-cellars',
    'A Woodinville winery focused on Bordeaux-style reds from Washington''s finest vineyards. Known for elegant structure and age-worthy blends.',
    'Woodinville, WA',
    'United States',
    'https://www.jmcellars.com'
  )
  RETURNING id
),
jm_flight AS (
  INSERT INTO tasting_flights (winery_id, name, description, is_active, sort_order)
  SELECT id, 'Bordeaux Varieties Flight', 'Explore our range of single-varietal and blended Bordeaux wines from Washington''s top vineyard sites.', true, 1
  FROM jm
  RETURNING id
)
INSERT INTO flight_wines (flight_id, position, name, producer, vintage, style, grapes, region, country, abv, description, price)
  SELECT (SELECT id FROM jm_flight), 1, 'Chardonnay', 'JM Cellars', '2022', 'white', ARRAY['Chardonnay'], 'Columbia Valley', 'United States', '13.8%', 'Barrel-fermented with subtle oak influence. Bright apple and citrus layered with cream and toasted almond. Balanced acidity and a clean, persistent finish.', '$36'
  UNION ALL
  SELECT (SELECT id FROM jm_flight), 2, 'Merlot', 'JM Cellars', '2021', 'red', ARRAY['Merlot'], 'Columbia Valley', 'United States', '14.2%', 'Plush and round with ripe plum, black cherry, and milk chocolate. Soft tannins and a velvety mid-palate make this approachable now or over the next decade.', '$42'
  UNION ALL
  SELECT (SELECT id FROM jm_flight), 3, 'Cabernet Franc', 'JM Cellars', '2021', 'red', ARRAY['Cabernet Franc'], 'Walla Walla Valley', 'United States', '14.0%', 'Aromatic and savory with dried herb, red currant, and cedar. Silky tannins and a long, earthy finish that sets this variety apart from its Bordeaux siblings.', '$46'
  UNION ALL
  SELECT (SELECT id FROM jm_flight), 4, 'Tre Fanciulli', 'JM Cellars', '2020', 'red', ARRAY['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc'], 'Columbia Valley', 'United States', '14.4%', 'Our flagship Bordeaux blend — "three boys" in Italian, honoring the winemaker''s sons. Deep and complex with cassis, dark plum, and graphite. Built to age.', '$65';


-- ------------------------------------------------------------
-- Winery: Eight Bells Winery
-- ------------------------------------------------------------
WITH eb AS (
  INSERT INTO wineries (name, slug, description, region, country, website)
  VALUES (
    'Eight Bells Winery',
    'eight-bells',
    'A Seattle-area winery taking inspiration from European traditions to craft wines that reflect the unique character of Pacific Northwest vineyards.',
    'Georgetown, Seattle, WA',
    'United States',
    'https://www.eightbellswinery.com'
  )
  RETURNING id
),
eb_flight AS (
  INSERT INTO tasting_flights (winery_id, name, description, is_active, sort_order)
  SELECT id, 'Pacific Northwest Exploration', 'A journey through the diverse grape varieties that thrive in Washington and Oregon''s wine country.', true, 1
  FROM eb
  RETURNING id
)
INSERT INTO flight_wines (flight_id, position, name, producer, vintage, style, grapes, region, country, abv, description, price)
  SELECT (SELECT id FROM eb_flight), 1, 'Riesling', 'Eight Bells', '2023', 'white', ARRAY['Riesling'], 'Columbia Valley', 'United States', '12.0%', 'Off-dry with vibrant peach, lime zest, and jasmine. Bright natural acidity lifts the slight residual sweetness for a beautifully balanced glass.', '$26'
  UNION ALL
  SELECT (SELECT id FROM eb_flight), 2, 'Grenache Blanc', 'Eight Bells', '2022', 'white', ARRAY['Grenache Blanc'], 'Yakima Valley', 'United States', '13.2%', 'Rare in Washington but right at home here. Honeydew melon, white peach, and a distinctive almond note on the finish. Full-bodied and textured.', '$34'
  UNION ALL
  SELECT (SELECT id FROM eb_flight), 3, 'Grenache', 'Eight Bells', '2021', 'red', ARRAY['Grenache'], 'Yakima Valley', 'United States', '14.0%', 'Translucent ruby with bright raspberry, dried rose petal, and a hint of orange peel. Juicy acidity and silky tannins inspired by the Southern Rhône.', '$40'
  UNION ALL
  SELECT (SELECT id FROM eb_flight), 4, 'Tempranillo', 'Eight Bells', '2020', 'red', ARRAY['Tempranillo'], 'Red Mountain', 'United States', '14.3%', 'Washington Tempranillo at its finest — leather, dried cherry, tobacco leaf, and earthy spice. Firm but refined tannins with a long, savory finish.', '$48';


-- ------------------------------------------------------------
-- Winery: DeLille Cellars
-- ------------------------------------------------------------
WITH delille AS (
  INSERT INTO wineries (name, slug, description, region, country, website)
  VALUES (
    'DeLille Cellars',
    'delille-cellars',
    'Founded in 1992, DeLille Cellars is one of Washington''s most celebrated wineries, producing Bordeaux and Rhône-inspired wines of exceptional quality and longevity.',
    'Woodinville, WA',
    'United States',
    'https://www.delillecellars.com'
  )
  RETURNING id
),
delille_flight AS (
  INSERT INTO tasting_flights (winery_id, name, description, is_active, sort_order)
  SELECT id, 'The DeLille Experience', 'From our white Bordeaux blend to our legendary Harrison Hill single-vineyard red — a complete portrait of DeLille Cellars.', true, 1
  FROM delille
  RETURNING id
)
INSERT INTO flight_wines (flight_id, position, name, producer, vintage, style, grapes, region, country, abv, description, price)
  SELECT (SELECT id FROM delille_flight), 1, 'Chaleur Estate Blanc', 'DeLille Cellars', '2022', 'white', ARRAY['Sauvignon Blanc', 'Sémillon'], 'Columbia Valley', 'United States', '13.5%', 'Washington''s most celebrated white Bordeaux blend. Bright citrus and stone fruit up front, with a rich, creamy mid-palate and a long minerally finish. Pairs beautifully with Pacific seafood.', '$44'
  UNION ALL
  SELECT (SELECT id FROM delille_flight), 2, 'D2', 'DeLille Cellars', '2021', 'red', ARRAY['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc', 'Petit Verdot'], 'Columbia Valley', 'United States', '14.5%', 'Our flagship red blend and one of Washington''s most iconic wines. Layers of dark fruit, espresso, and cedar give way to a long, structured finish. Approachable now, exceptional with 5–10 more years.', '$58'
  UNION ALL
  SELECT (SELECT id FROM delille_flight), 3, 'Doyenne', 'DeLille Cellars', '2021', 'red', ARRAY['Syrah', 'Grenache', 'Mourvèdre'], 'Yakima Valley', 'United States', '14.3%', 'Our Rhône-inspired red from some of Yakima Valley''s finest sites. Smoked meat, black olive, dark plum, and violets. This is Washington Syrah at its most expressive.', '$52'
  UNION ALL
  SELECT (SELECT id FROM delille_flight), 4, 'Harrison Hill', 'DeLille Cellars', '2019', 'red', ARRAY['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc'], 'Snipes Mountain', 'United States', '14.8%', 'Named for one of Washington''s oldest vineyard sites, planted in 1962. Intense and concentrated with crushed rock, dark cassis, and dark chocolate. A true collector''s wine built for decades of aging.', '$120';


-- ------------------------------------------------------------
-- Winery: Kinhaven  (3 flights)
-- ------------------------------------------------------------
WITH kinhaven AS (
  INSERT INTO wineries (name, slug, description, region, country, website)
  VALUES (
    'Kinhaven',
    'kinhaven',
    'A family-owned estate winery tucked into the Rattlesnake Hills AVA. Founded in 2004 by the Holt family after leaving the tech industry, Kinhaven farms 18 acres of estate fruit and sources select blocks from trusted neighbors. Three distinct tasting flights let visitors explore their full range — from crisp whites to age-worthy reserve reds.',
    'Rattlesnake Hills, WA',
    'United States',
    'https://www.kinhavenwineco.com'
  )
  RETURNING id
),
whites_flight AS (
  INSERT INTO tasting_flights (winery_id, name, description, is_active, sort_order)
  SELECT id,
    'Whites & Rosé',
    'Start here — our cool-climate whites and estate rosé. A lighter, refreshing introduction to Kinhaven before moving into the reds.',
    true, 1
  FROM kinhaven
  RETURNING id
),
reds_flight AS (
  INSERT INTO tasting_flights (winery_id, name, description, is_active, sort_order)
  SELECT id,
    'Red Varieties',
    'Our core red lineup showcasing the versatility of Rattlesnake Hills fruit — from a silky Grenache to a bold Cabernet.',
    true, 2
  FROM kinhaven
  RETURNING id
),
reserve_flight AS (
  INSERT INTO tasting_flights (winery_id, name, description, is_active, sort_order)
  SELECT id,
    'Estate Reserve Collection',
    'Small-production wines from our best estate blocks and oldest vines. Limited quantities, released only in exceptional vintages.',
    true, 3
  FROM kinhaven
  RETURNING id
)
INSERT INTO flight_wines (flight_id, position, name, producer, vintage, style, grapes, region, country, abv, description, price)
  -- Whites & Rosé
  SELECT (SELECT id FROM whites_flight), 1, 'Viognier', 'Kinhaven', '2022', 'white', ARRAY['Viognier'], 'Rattlesnake Hills', 'United States', '13.8%', 'Deeply aromatic with peach blossom, apricot nectar, and a touch of ginger. Fermented in neutral oak with extended lees contact for a creamy mid-palate that never loses its lift.', '$36'
  UNION ALL
  SELECT (SELECT id FROM whites_flight), 2, 'Pinot Gris', 'Kinhaven', '2023', 'white', ARRAY['Pinot Gris'], 'Yakima Valley', 'United States', '13.2%', 'Bright and textured in the Alsatian style. Pear, green apple, and white blossom with a slightly smoky mineral note on the finish. Excellent with Pacific oysters or light pasta.', '$28'
  UNION ALL
  SELECT (SELECT id FROM whites_flight), 3, 'Rosé of Grenache', 'Kinhaven', '2023', 'rose', ARRAY['Grenache'], 'Rattlesnake Hills', 'United States', '12.8%', 'Estate-grown Grenache pressed directly to tank. Pale copper-pink with fresh strawberry, watermelon rind, and a hint of dried herbs. Bone dry with a clean, mouthwatering finish.', '$26'
  UNION ALL
  -- Red Varieties
  SELECT (SELECT id FROM reds_flight), 1, 'Grenache', 'Kinhaven', '2021', 'red', ARRAY['Grenache'], 'Rattlesnake Hills', 'United States', '13.9%', 'Silky and expressive with raspberry, dried rose petal, and a hint of cured meat. Whole-cluster fermented for added spice and texture. Inspired by the great Grenaches of Châteauneuf-du-Pape.', '$42'
  UNION ALL
  SELECT (SELECT id FROM reds_flight), 2, 'Merlot', 'Kinhaven', '2021', 'red', ARRAY['Merlot'], 'Columbia Valley', 'United States', '14.2%', 'Rich and generous with black cherry, dark plum, and cocoa powder. Aged 18 months in French oak, 30% new. Plush tannins and a long, warm finish — a crowd-pleasing benchmark for Washington Merlot.', '$40'
  UNION ALL
  SELECT (SELECT id FROM reds_flight), 3, 'Cabernet Sauvignon', 'Kinhaven', '2020', 'red', ARRAY['Cabernet Sauvignon'], 'Red Mountain', 'United States', '14.8%', 'Sourced from a single block on Red Mountain — one of Washington''s warmest AVAs. Concentrated cassis, cedar, and iron mineral with firm, polished tannins. Give it an hour of air or another 5 years in the cellar.', '$54'
  UNION ALL
  -- Estate Reserve Collection
  SELECT (SELECT id FROM reserve_flight), 1, 'Old Vine Chenin Blanc', 'Kinhaven', '2022', 'white', ARRAY['Chenin Blanc'], 'Rattlesnake Hills', 'United States', '13.5%', 'From 30-year-old estate vines — among the oldest Chenin Blanc plantings in Washington. Quince, golden apple, and lanolin with electric acidity that will carry this wine for another decade. Produced in tiny quantities: 94 cases.', '$52'
  UNION ALL
  SELECT (SELECT id FROM reserve_flight), 2, 'Reserve Syrah', 'Kinhaven', '2020', 'red', ARRAY['Syrah'], 'Walla Walla Valley', 'United States', '14.5%', 'A single-vineyard Syrah from the Milton-Freewater bench. Smoked olive, dark violet, cracked black pepper, and cured meat. Aged 22 months in 50% new French oak. Dense and structured — best from 2026 onward.', '$72'
  UNION ALL
  SELECT (SELECT id FROM reserve_flight), 3, 'The Holt', 'Kinhaven', '2019', 'red', ARRAY['Cabernet Sauvignon', 'Merlot', 'Petit Verdot'], 'Rattlesnake Hills', 'United States', '14.9%', 'Our flagship. Named for the family that founded Kinhaven. Only made in exceptional vintages — this is the third release ever. Layers of dark cassis, graphite, tobacco leaf, and dark chocolate. Built to age 20+ years. 180 cases produced.', '$110';


-- ============================================================
-- SECTION 2: WIPE — Delete everything and start fresh
-- ============================================================
-- Deletes all rows from all three tables in dependency order.
-- The schema, RLS policies, and indexes are preserved.
-- ============================================================

DELETE FROM flight_wines;
DELETE FROM tasting_flights;
DELETE FROM wineries;


-- ============================================================
-- SECTION 3: UTILITY QUERIES
-- ============================================================


-- ------------------------------------------------------------
-- Look up winery IDs (useful before running targeted updates)
-- ------------------------------------------------------------
SELECT id, name, slug FROM wineries ORDER BY name;


-- ------------------------------------------------------------
-- Look up all flights for a specific winery
-- ------------------------------------------------------------
SELECT f.id, f.name, f.sort_order, f.is_active
FROM tasting_flights f
JOIN wineries w ON w.id = f.winery_id
WHERE w.slug = 'kinhaven'   -- change slug as needed
ORDER BY f.sort_order;


-- ------------------------------------------------------------
-- Look up all wines in a specific flight
-- ------------------------------------------------------------
SELECT fw.position, fw.name, fw.vintage, fw.style, fw.price
FROM flight_wines fw
JOIN tasting_flights f ON f.id = fw.flight_id
JOIN wineries w ON w.id = f.winery_id
WHERE w.slug = 'kinhaven'   -- change slug as needed
  AND f.name = 'Red Varieties'  -- change flight name as needed
ORDER BY fw.position;


-- ------------------------------------------------------------
-- Delete a specific winery (cascades to its flights and wines)
-- ------------------------------------------------------------
DELETE FROM wineries
WHERE slug = 'test-winery';   -- change slug as needed


-- ------------------------------------------------------------
-- Delete a specific flight (cascades to its wines)
-- ------------------------------------------------------------
DELETE FROM tasting_flights
WHERE id = (
  SELECT f.id
  FROM tasting_flights f
  JOIN wineries w ON w.id = f.winery_id
  WHERE w.slug = 'kinhaven'         -- change slug as needed
    AND f.name = 'Red Varieties'    -- change flight name as needed
);


-- ------------------------------------------------------------
-- Toggle a flight active / inactive
-- ------------------------------------------------------------
UPDATE tasting_flights
SET is_active = false   -- set to true to re-enable
WHERE id = (
  SELECT f.id
  FROM tasting_flights f
  JOIN wineries w ON w.id = f.winery_id
  WHERE w.slug = 'kinhaven'             -- change slug as needed
    AND f.name = 'Estate Reserve Collection'  -- change flight name as needed
);


-- ------------------------------------------------------------
-- Update a winery's description, region, or website
-- ------------------------------------------------------------
UPDATE wineries
SET
  description = 'Updated description goes here.',
  region      = 'Walla Walla Valley, WA',
  website     = 'https://www.newwebsite.com'
WHERE slug = 'lola';   -- change slug as needed


-- ------------------------------------------------------------
-- Update a specific wine in a flight (e.g. new vintage / price)
-- ------------------------------------------------------------
UPDATE flight_wines
SET
  vintage     = '2022',
  price       = '$56',
  description = 'Updated tasting notes go here.'
WHERE flight_id = (
  SELECT f.id
  FROM tasting_flights f
  JOIN wineries w ON w.id = f.winery_id
  WHERE w.slug = 'delille-cellars'   -- change slug as needed
    AND f.name = 'The DeLille Experience'  -- change flight name as needed
)
AND name = 'D2';   -- change wine name as needed


-- ------------------------------------------------------------
-- Reorder wines within a flight (update position values)
-- ------------------------------------------------------------
-- Run one UPDATE per wine that needs a new position.
UPDATE flight_wines SET position = 1 WHERE id = '<wine-uuid>';
UPDATE flight_wines SET position = 2 WHERE id = '<wine-uuid>';
UPDATE flight_wines SET position = 3 WHERE id = '<wine-uuid>';
