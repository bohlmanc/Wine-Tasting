import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Wine, TastingType, WineStyle } from '../types';

type TastingState = Partial<Wine> & { tastingType: TastingType; scanApplied: boolean };

type TastingAction =
  | { type: 'SET_TASTING_TYPE'; payload: TastingType }
  | { type: 'UPDATE'; payload: Partial<Wine> }
  | { type: 'LOAD_WINE'; payload: Wine }
  | { type: 'RESET' }
  | { type: 'SET_SCAN_APPLIED'; payload: boolean };

const initialState: TastingState = {
  tastingType: 'full',
  scanApplied: false,
  dateTasted: new Date().toLocaleDateString('en-US'),
  producer: '',
  name: '',
  country: '',
  region: '',
  subregion: '',
  vineyard: '',
  grapes: [],
  importer: '',
  vintage: '',
  abv: '',
  photo: null,
  style: null,
  color: '',
  colorIntensity: '',
  clarity: '',
  aromas: [],
  customAromas: {},
  sweetness: '',
  acidity: '',
  tannin: '',
  alcohol: '',
  body: '',
  finish: '',
  liked: null,
  rating: null,
  notes: '',
};

function reducer(state: TastingState, action: TastingAction): TastingState {
  switch (action.type) {
    case 'SET_TASTING_TYPE':
      return { ...initialState, tastingType: action.payload };
    case 'UPDATE':
      return { ...state, ...action.payload };
    case 'LOAD_WINE':
      return { ...action.payload, scanApplied: false };
    case 'RESET':
      return { ...initialState };
    case 'SET_SCAN_APPLIED':
      return { ...state, scanApplied: action.payload };
    default:
      return state;
  }
}

interface WineTastingContextValue {
  tasting: TastingState;
  setTastingType: (type: TastingType) => void;
  update: (data: Partial<Wine>) => void;
  loadWine: (wine: Wine) => void;
  reset: () => void;
  setScanApplied: (v: boolean) => void;
}

const WineTastingContext = createContext<WineTastingContextValue | null>(null);

export function WineTastingProvider({ children }: { children: ReactNode }) {
  const [tasting, dispatch] = useReducer(reducer, initialState);

  const setTastingType = (type: TastingType) =>
    dispatch({ type: 'SET_TASTING_TYPE', payload: type });
  const update = (data: Partial<Wine>) =>
    dispatch({ type: 'UPDATE', payload: data });
  const loadWine = (wine: Wine) =>
    dispatch({ type: 'LOAD_WINE', payload: wine });
  const reset = () => dispatch({ type: 'RESET' });
  const setScanApplied = (v: boolean) =>
    dispatch({ type: 'SET_SCAN_APPLIED', payload: v });

  return (
    <WineTastingContext.Provider value={{ tasting, setTastingType, update, loadWine, reset, setScanApplied }}>
      {children}
    </WineTastingContext.Provider>
  );
}

export function useWineTasting() {
  const ctx = useContext(WineTastingContext);
  if (!ctx) throw new Error('useWineTasting must be used within WineTastingProvider');
  return ctx;
}
