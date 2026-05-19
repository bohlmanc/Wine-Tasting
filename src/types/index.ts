export type TastingType = 'quick' | 'full';
export type WineStyle = 'red' | 'white' | 'rose' | 'sparkling';

export interface Wine {
  id: string;
  tastingType: TastingType;
  createdAt: string;

  // Basic info
  dateTasted: string;
  producer: string;
  name: string;
  country: string;
  region: string;
  subregion: string;
  vineyard: string;
  grapes: string[];
  importer: string;
  vintage: string;
  abv: string;
  photo: string | null;

  // Style
  style: WineStyle | null;

  // Look
  color: string;
  colorIntensity: string;
  clarity: string;

  // Smell
  aromas: string[];
  customAromas?: Record<string, string[]>;

  // Taste
  sweetness: string;
  acidity: string;
  tannin: string;
  alcohol: string;
  body: string;
  finish: string;

  // Think
  liked: boolean | null;
  rating: number | null;
  notes: string;

  // Guided session provenance (set when wine is saved from a flight)
  guidedSessionId?: string;
  flightId?: string;
  flightName?: string;
  wineryId?: string;
  wineryName?: string;
  flightWineId?: string;
}

export type PartialWine = Partial<Wine> & { id: string; tastingType: TastingType };

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

export interface CompletedFlightSession {
  session: GuidedSession;
  flight: TastingFlight;
}

export interface GuidedSession {
  id: string;
  wineryId: string;
  flightId: string;
  flightName: string;
  wineryName: string;
  startedAt: string;
  currentIndex: number;
  currentWineId: string | null;
  completedWineIds: Record<string, string | null>;
}
