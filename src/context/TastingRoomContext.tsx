import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { getDeviceId } from '../utils/deviceId';
import * as roomService from '../services/tastingRoomService';
import { TastingRoom, RoomParticipant, RoomFlightWine, RoomWineResponse, PendingPartyWine } from '../types/room';
import { FlightWine } from '../types';

interface TastingRoomContextValue {
  room: TastingRoom | null;
  participants: RoomParticipant[];
  flightWines: RoomFlightWine[];
  responses: RoomWineResponse[];
  myParticipant: RoomParticipant | null;
  isHost: boolean;
  activeFlightWineId: string | null;
  activeResponseId: string | null;

  createRoom: (displayName: string) => Promise<void>;
  joinRoom: (code: string, displayName: string) => Promise<{ isSetupComplete: boolean }>;
  leaveRoom: () => void;
  startPartyWithCustomWines: (wines: PendingPartyWine[]) => Promise<void>;
  startPartyWithWineryFlight: (flightWines: FlightWine[], wineryId: string, flightId: string) => Promise<void>;
  startTastingWine: (flightWineId: string) => Promise<void>;
  clearActiveTasting: () => void;
  broadcastLook: (color: string, colorIntensity: string, clarity: string) => void;
  broadcastSmell: (aromas: string[], customAromas: Record<string, string[]>) => void;
  broadcastTaste: (sweetness: string, acidity: string, tannin: string, alcohol: string, body: string, finish: string) => void;
  broadcastThink: (liked: boolean | null, rating: number | null, notes: string) => Promise<void>;
}

const TastingRoomContext = createContext<TastingRoomContextValue | null>(null);

export function TastingRoomProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<TastingRoom | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [flightWines, setFlightWines] = useState<RoomFlightWine[]>([]);
  const [responses, setResponses] = useState<RoomWineResponse[]>([]);
  const [myParticipant, setMyParticipant] = useState<RoomParticipant | null>(null);
  const [activeFlightWineId, setActiveFlightWineId] = useState<string | null>(null);
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const presenceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isHost = myParticipant?.isHost ?? false;

  // Poll for updates every 3 seconds while in a room
  useEffect(() => {
    if (!room) return;

    const roomId = room.id;

    const poll = async () => {
      try {
        const [updatedRoom, parts] = await Promise.all([
          roomService.getRoom(roomId),
          roomService.getParticipants(roomId),
        ]);
        if (updatedRoom) setRoom(updatedRoom);
        setParticipants(parts);
        if (updatedRoom?.isSetupComplete) {
          const [wines, resps] = await Promise.all([
            roomService.getFlightWines(roomId),
            roomService.getResponses(roomId),
          ]);
          setFlightWines(wines);
          setResponses(resps);
        }
      } catch {
        // network blip — next tick retries
      }
    };

    pollIntervalRef.current = setInterval(poll, 3000);

    if (myParticipant) {
      presenceIntervalRef.current = setInterval(() => {
        roomService.updatePresence(myParticipant.id).catch(() => {});
      }, 30_000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
        presenceIntervalRef.current = null;
      }
    };
  }, [room?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const createRoom = useCallback(async (displayName: string) => {
    const deviceId = await getDeviceId();
    const { room: r, participant: p } = await roomService.createRoom(deviceId, displayName);
    setRoom(r);
    setMyParticipant(p);
    setParticipants([p]);
    setFlightWines([]);
    setResponses([]);
  }, []);

  const joinRoom = useCallback(async (code: string, displayName: string) => {
    const deviceId = await getDeviceId();
    const { room: r, participant: p } = await roomService.joinRoom(code, deviceId, displayName);

    const [parts, wines, resps] = await Promise.all([
      roomService.getParticipants(r.id),
      r.isSetupComplete ? roomService.getFlightWines(r.id) : Promise.resolve([]),
      r.isSetupComplete ? roomService.getResponses(r.id) : Promise.resolve([]),
    ]);

    setRoom(r);
    setMyParticipant(p);
    setParticipants(parts);
    setFlightWines(wines);
    setResponses(resps);

    return { isSetupComplete: r.isSetupComplete };
  }, []);

  const leaveRoom = useCallback(() => {
    setRoom(null);
    setMyParticipant(null);
    setParticipants([]);
    setFlightWines([]);
    setResponses([]);
    setActiveFlightWineId(null);
    setActiveResponseId(null);
  }, []);

  const startPartyWithCustomWines = useCallback(async (wines: PendingPartyWine[]) => {
    if (!room) return;
    const savedWines = await roomService.startPartyWithCustomWines(room.id, wines);
    setFlightWines(savedWines);
    setRoom(prev => prev ? { ...prev, isSetupComplete: true } : prev);
  }, [room]);

  const startPartyWithWineryFlight = useCallback(async (flightWines: FlightWine[], wineryId: string, flightId: string) => {
    if (!room) return;
    const savedWines = await roomService.startPartyWithWineryFlight(room.id, flightWines, wineryId, flightId);
    setFlightWines(savedWines);
    setRoom(prev => prev ? { ...prev, isSetupComplete: true, flightType: 'winery', wineryId, wineryFlightId: flightId } : prev);
  }, [room]);

  const startTastingWine = useCallback(async (flightWineId: string) => {
    if (!room || !myParticipant) return;
    const responseId = await roomService.createWineResponse(room.id, myParticipant.id, flightWineId);
    setActiveFlightWineId(flightWineId);
    setActiveResponseId(responseId);
  }, [room, myParticipant]);

  const clearActiveTasting = useCallback(() => {
    setActiveFlightWineId(null);
    setActiveResponseId(null);
  }, []);

  const broadcastLook = useCallback((color: string, colorIntensity: string, clarity: string) => {
    if (!activeResponseId) return;
    roomService.broadcastLook(activeResponseId, color, colorIntensity, clarity).catch(() => {});
  }, [activeResponseId]);

  const broadcastSmell = useCallback((aromas: string[], customAromas: Record<string, string[]>) => {
    if (!activeResponseId) return;
    roomService.broadcastSmell(activeResponseId, aromas, customAromas).catch(() => {});
  }, [activeResponseId]);

  const broadcastTaste = useCallback((sweetness: string, acidity: string, tannin: string, alcohol: string, body: string, finish: string) => {
    if (!activeResponseId) return;
    roomService.broadcastTaste(activeResponseId, sweetness, acidity, tannin, alcohol, body, finish).catch(() => {});
  }, [activeResponseId]);

  const broadcastThink = useCallback(async (liked: boolean | null, rating: number | null, notes: string) => {
    if (!activeResponseId) return;
    await roomService.broadcastThink(activeResponseId, liked, rating, notes);
  }, [activeResponseId]);

  return (
    <TastingRoomContext.Provider
      value={{
        room,
        participants,
        flightWines,
        responses,
        myParticipant,
        isHost,
        activeFlightWineId,
        activeResponseId,
        createRoom,
        joinRoom,
        leaveRoom,
        startPartyWithCustomWines,
        startPartyWithWineryFlight,
        startTastingWine,
        clearActiveTasting,
        broadcastLook,
        broadcastSmell,
        broadcastTaste,
        broadcastThink,
      }}
    >
      {children}
    </TastingRoomContext.Provider>
  );
}

export function useTastingRoom(): TastingRoomContextValue {
  const ctx = useContext(TastingRoomContext);
  if (!ctx) throw new Error('useTastingRoom must be used within TastingRoomProvider');
  return ctx;
}
