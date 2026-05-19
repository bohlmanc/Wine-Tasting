import { supabase } from '../lib/supabase';
import { Winery, TastingFlight, FlightWine, WineStyle } from '../types';

// ---------------------------------------------------------------------------
// Row shapes returned by Supabase (snake_case → camelCase via mappers)
// ---------------------------------------------------------------------------

type WineryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  region: string;
  country: string;
  logo_url: string | null;
};

type FlightWineRow = {
  id: string;
  position: number;
  name: string;
  producer: string;
  vintage: string;
  style: string | null;
  grapes: string[];
  region: string;
  country: string;
  abv: string;
  description: string;
  image_url: string | null;
};

type FlightRow = {
  id: string;
  winery_id: string;
  name: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  flight_wines: FlightWineRow[];
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapWinery(row: WineryRow): Winery {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    region: row.region,
    country: row.country,
    logoUrl: row.logo_url,
  };
}

function mapFlightWine(row: FlightWineRow): FlightWine {
  return {
    id: row.id,
    position: row.position,
    name: row.name,
    producer: row.producer,
    vintage: row.vintage,
    style: (row.style as WineStyle) ?? null,
    grapes: row.grapes ?? [],
    region: row.region,
    country: row.country,
    abv: row.abv,
    description: row.description,
    imageUrl: row.image_url,
  };
}

function mapFlight(row: FlightRow): TastingFlight {
  return {
    id: row.id,
    wineryId: row.winery_id,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    wines: (row.flight_wines ?? [])
      .sort((a, b) => a.position - b.position)
      .map(mapFlightWine),
  };
}

const FLIGHT_WINE_FIELDS = 'id, position, name, producer, vintage, style, grapes, region, country, abv, description, image_url';

const WINERY_FIELDS = `id, name, slug, description, region, country, logo_url`;

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

let wineryCache: Winery[] | null = null;

export async function getAllWineries(): Promise<Winery[]> {
  if (wineryCache) return wineryCache;
  const { data, error } = await supabase
    .from('wineries')
    .select(WINERY_FIELDS)
    .order('name');
  if (error) throw error;
  wineryCache = (data as WineryRow[]).map(mapWinery);
  return wineryCache;
}

export async function searchWineries(query: string): Promise<Winery[]> {
  const all = await getAllWineries();
  if (!query.trim()) return all;
  const q = query.toLowerCase().trim();
  return all.filter(w =>
    w.name.toLowerCase().includes(q) ||
    (w.region ?? '').toLowerCase().includes(q) ||
    (w.country ?? '').toLowerCase().includes(q)
  );
}

export async function getWineryBySlug(slug: string): Promise<Winery | null> {
  const { data, error } = await supabase
    .from('wineries')
    .select(WINERY_FIELDS)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapWinery(data as WineryRow) : null;
}

export async function getWinery(wineryId: string): Promise<Winery | null> {
  const { data, error } = await supabase
    .from('wineries')
    .select(WINERY_FIELDS)
    .eq('id', wineryId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapWinery(data as WineryRow) : null;
}

export async function getActiveFlights(wineryId: string): Promise<TastingFlight[]> {
  const { data, error } = await supabase
    .from('tasting_flights')
    .select(`id, winery_id, name, description, is_active, sort_order, flight_wines(${FLIGHT_WINE_FIELDS})`)
    .eq('winery_id', wineryId)
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return (data as unknown as FlightRow[]).map(mapFlight);
}

export async function getFlight(flightId: string, wineryId: string): Promise<TastingFlight | null> {
  const { data, error } = await supabase
    .from('tasting_flights')
    .select(`id, winery_id, name, description, is_active, sort_order, flight_wines(${FLIGHT_WINE_FIELDS})`)
    .eq('id', flightId)
    .eq('winery_id', wineryId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapFlight(data as unknown as FlightRow) : null;
}
