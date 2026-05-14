import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Wine, TastingType, WineStyle } from '../types';

type TastingState = Partial<Wine> & { tastingType: TastingType };

type TastingAction =
  | { type: 'SET_TASTING_TYPE'; payload: TastingType }
  | { type: 'UPDATE'; payload: Partial<Wine> }
  | { type: 'RESET' };

const initialState: TastingState = {
  tastingType: 'full',
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
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

interface WineTastingContextValue {
  tasting: TastingState;
  setTastingType: (type: TastingType) => void;
  update: (data: Partial<Wine>) => void;
  reset: () => void;
}

const WineTastingContext = createContext<WineTastingContextValue | null>(null);

export function WineTastingProvider({ children }: { children: ReactNode }) {
  const [tasting, dispatch] = useReducer(reducer, initialState);

  const setTastingType = (type: TastingType) =>
    dispatch({ type: 'SET_TASTING_TYPE', payload: type });
  const update = (data: Partial<Wine>) =>
    dispatch({ type: 'UPDATE', payload: data });
  const reset = () => dispatch({ type: 'RESET' });

  return (
    <WineTastingContext.Provider value={{ tasting, setTastingType, update, reset }}>
      {children}
    </WineTastingContext.Provider>
  );
}

export function useWineTasting() {
  const ctx = useContext(WineTastingContext);
  if (!ctx) throw new Error('useWineTasting must be used within WineTastingProvider');
  return ctx;
}
