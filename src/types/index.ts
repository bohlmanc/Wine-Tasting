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
}

export type PartialWine = Partial<Wine> & { id: string; tastingType: TastingType };
