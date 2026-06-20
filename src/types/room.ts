export interface TastingRoom {
  id: string;
  code: string;
  hostDeviceId: string;
  flightType: 'custom' | 'winery';
  wineryId?: string;
  wineryFlightId?: string;
  isSetupComplete: boolean;
  isActive: boolean;
  expiresAt: string;
  closingAt?: string;
  createdAt: string;
}

export interface RoomParticipant {
  id: string;
  roomId: string;
  deviceId: string;
  displayName: string;
  isHost: boolean;
  lastSeenAt: string;
  joinedAt: string;
  leftAt?: string;
}

export interface RoomFlightWine {
  id: string;
  roomId: string;
  position: number;
  name: string;
  producer: string;
  vintage: string;
  style?: string;
  grapes: string[];
  region: string;
  country: string;
  abv: string;
}

export interface RoomWineResponse {
  id: string;
  roomId: string;
  participantId: string;
  flightWineId: string;
  color: string;
  colorIntensity: string;
  clarity: string;
  aromas: string[];
  customAromas: Record<string, string[]>;
  sweetness: string;
  acidity: string;
  tannin: string;
  alcohol: string;
  body: string;
  finish: string;
  liked: boolean | null;
  rating: number | null;
  notes: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface PendingPartyWine {
  id: string;
  name: string;
  producer: string;
  vintage: string;
  style?: string;
  grapes: string[];
  region: string;
  country: string;
  abv: string;
}
