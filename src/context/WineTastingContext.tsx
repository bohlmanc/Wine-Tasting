import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Wine, TastingType } from '../types';

type TastingState = Omit<Partial<Wine>, 'guidedSessionId'> & {
  tastingType: TastingType;
  scanApplied: boolean;
  guidedSessionId: string | null;
  customFlightId: string | null;
  customFlightName: string | null;
  retroactiveSessionId: string | null;
  retroactiveFlightWineId: string | null;
};

type TastingAction =
  | { type: 'SET_TASTING_TYPE'; payload: TastingType }
  | { type: 'UPDATE'; payload: Partial<Wine> }
  | { type: 'LOAD_WINE'; payload: Wine }
  | { type: 'RESET' }
  | { type: 'SET_SCAN_APPLIED'; payload: boolean }
  | { type: 'SET_GUIDED_SESSION_ID'; payload: string | null }
  | { type: 'SET_CUSTOM_FLIGHT'; payload: { id: string | null; name: string | null } }
  | { type: 'SET_RETROACTIVE'; payload: { sessionId: string | null; flightWineId: string | null } };

const initialState: TastingState = {
  tastingType: 'full',
  scanApplied: false,
  guidedSessionId: null,
  customFlightId: null,
  customFlightName: null,
  retroactiveSessionId: null,
  retroactiveFlightWineId: null,
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
      return {
        ...initialState,
        tastingType: action.payload,
        customFlightId: state.customFlightId,
        customFlightName: state.customFlightName,
      };
    case 'UPDATE':
      return { ...state, ...action.payload };
    case 'LOAD_WINE':
      return { ...action.payload, scanApplied: false, guidedSessionId: null, customFlightId: null, customFlightName: null };
    case 'SET_CUSTOM_FLIGHT':
      return { ...state, customFlightId: action.payload.id, customFlightName: action.payload.name };
    case 'RESET':
      return { ...initialState };
    case 'SET_SCAN_APPLIED':
      return { ...state, scanApplied: action.payload };
    case 'SET_GUIDED_SESSION_ID':
      return { ...state, guidedSessionId: action.payload };
    case 'SET_RETROACTIVE':
      return { ...state, retroactiveSessionId: action.payload.sessionId, retroactiveFlightWineId: action.payload.flightWineId };
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
  setGuidedSessionId: (id: string | null) => void;
  setCustomFlight: (id: string | null, name: string | null) => void;
  setRetroactive: (sessionId: string | null, flightWineId: string | null) => void;
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
  const setGuidedSessionId = (id: string | null) =>
    dispatch({ type: 'SET_GUIDED_SESSION_ID', payload: id });
  const setCustomFlight = (id: string | null, name: string | null) =>
    dispatch({ type: 'SET_CUSTOM_FLIGHT', payload: { id, name } });
  const setRetroactive = (sessionId: string | null, flightWineId: string | null) =>
    dispatch({ type: 'SET_RETROACTIVE', payload: { sessionId, flightWineId } });

  return (
    <WineTastingContext.Provider
      value={{ tasting, setTastingType, update, loadWine, reset, setScanApplied, setGuidedSessionId, setCustomFlight, setRetroactive }}
    >
      {children}
    </WineTastingContext.Provider>
  );
}

export function useWineTasting() {
  const ctx = useContext(WineTastingContext);
  if (!ctx) throw new Error('useWineTasting must be used within WineTastingProvider');
  return ctx;
}
