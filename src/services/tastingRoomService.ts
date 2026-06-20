import { supabase } from '../lib/supabase';
import { TastingRoom, RoomParticipant, RoomFlightWine, RoomWineResponse, PendingPartyWine } from '../types/room';
import { FlightWine } from '../types';

const CODE_CHARS = 'ACDEFGHJKMNPQRTUVWXY23456789';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

function mapRoom(row: Record<string, unknown>): TastingRoom {
  return {
    id: row.id as string,
    code: row.code as string,
    hostDeviceId: row.host_device_id as string,
    flightType: (row.flight_type as 'custom' | 'winery') ?? 'custom',
    wineryId: row.winery_id as string | undefined,
    wineryFlightId: row.winery_flight_id as string | undefined,
    isSetupComplete: row.is_setup_complete as boolean,
    isActive: row.is_active as boolean,
    expiresAt: row.expires_at as string,
    closingAt: row.closing_at as string | undefined,
    createdAt: row.created_at as string,
  };
}

function mapParticipant(row: Record<string, unknown>): RoomParticipant {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    deviceId: row.device_id as string,
    displayName: row.display_name as string,
    isHost: row.is_host as boolean,
    lastSeenAt: row.last_seen_at as string,
    joinedAt: row.joined_at as string,
    leftAt: row.left_at as string | undefined,
  };
}

function mapFlightWine(row: Record<string, unknown>): RoomFlightWine {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    position: row.position as number,
    name: row.name as string,
    producer: (row.producer as string) ?? '',
    vintage: (row.vintage as string) ?? '',
    style: row.style as string | undefined,
    grapes: (row.grapes as string[]) ?? [],
    region: (row.region as string) ?? '',
    country: (row.country as string) ?? '',
    abv: (row.abv as string) ?? '',
  };
}

function mapResponse(row: Record<string, unknown>): RoomWineResponse {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    participantId: row.participant_id as string,
    flightWineId: row.flight_wine_id as string,
    color: (row.color as string) ?? '',
    colorIntensity: (row.color_intensity as string) ?? '',
    clarity: (row.clarity as string) ?? '',
    aromas: (row.aromas as string[]) ?? [],
    customAromas: (row.custom_aromas as Record<string, string[]>) ?? {},
    sweetness: (row.sweetness as string) ?? '',
    acidity: (row.acidity as string) ?? '',
    tannin: (row.tannin as string) ?? '',
    alcohol: (row.alcohol as string) ?? '',
    body: (row.body as string) ?? '',
    finish: (row.finish as string) ?? '',
    liked: row.liked as boolean | null,
    rating: row.rating as number | null,
    notes: (row.notes as string) ?? '',
    completedAt: row.completed_at as string | null,
    updatedAt: row.updated_at as string,
  };
}

async function uniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode();
    const { data } = await supabase
      .from('tasting_rooms')
      .select('id')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();
    if (!data) return code;
  }
  throw new Error('Could not generate a unique room code. Please try again.');
}

export async function createRoom(
  deviceId: string,
  displayName: string,
): Promise<{ room: TastingRoom; participant: RoomParticipant }> {
  const code = await uniqueCode();

  const { data: roomRow, error: roomErr } = await supabase
    .from('tasting_rooms')
    .insert({ code, host_device_id: deviceId })
    .select()
    .single();
  if (roomErr || !roomRow) throw roomErr ?? new Error('Failed to create room');

  const { data: partRow, error: partErr } = await supabase
    .from('room_participants')
    .insert({ room_id: roomRow.id, device_id: deviceId, display_name: displayName, is_host: true })
    .select()
    .single();
  if (partErr || !partRow) throw partErr ?? new Error('Failed to join room as host');

  return { room: mapRoom(roomRow), participant: mapParticipant(partRow) };
}

export async function joinRoom(
  code: string,
  deviceId: string,
  displayName: string,
): Promise<{ room: TastingRoom; participant: RoomParticipant }> {
  const { data: roomRow, error: roomErr } = await supabase
    .from('tasting_rooms')
    .select()
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (roomErr) throw roomErr;
  if (!roomRow) throw new Error('Room not found. Check the code and try again.');

  const { data: existing } = await supabase
    .from('room_participants')
    .select()
    .eq('room_id', roomRow.id)
    .eq('device_id', deviceId)
    .maybeSingle();

  let partRow: Record<string, unknown>;
  if (existing) {
    const { data: updated, error: upErr } = await supabase
      .from('room_participants')
      .update({ display_name: displayName, last_seen_at: new Date().toISOString(), left_at: null })
      .eq('id', existing.id)
      .select()
      .single();
    if (upErr || !updated) throw upErr ?? new Error('Failed to rejoin room');
    partRow = updated;
  } else {
    const { data: inserted, error: insErr } = await supabase
      .from('room_participants')
      .insert({ room_id: roomRow.id, device_id: deviceId, display_name: displayName, is_host: false })
      .select()
      .single();
    if (insErr || !inserted) throw insErr ?? new Error('Failed to join room');
    partRow = inserted;
  }

  return { room: mapRoom(roomRow), participant: mapParticipant(partRow) };
}

export async function startPartyWithCustomWines(
  roomId: string,
  wines: PendingPartyWine[],
): Promise<RoomFlightWine[]> {
  const rows = wines.map((w, i) => ({
    room_id: roomId,
    position: i,
    name: w.name,
    producer: w.producer,
    vintage: w.vintage,
    style: w.style ?? null,
    grapes: w.grapes,
    region: w.region,
    country: w.country,
    abv: w.abv,
  }));

  const { data: wineRows, error: wineErr } = await supabase
    .from('room_flight_wines')
    .insert(rows)
    .select();
  if (wineErr || !wineRows) throw wineErr ?? new Error('Failed to save flight wines');

  const { error: updateErr } = await supabase
    .from('tasting_rooms')
    .update({ is_setup_complete: true, flight_type: 'custom' })
    .eq('id', roomId);
  if (updateErr) throw updateErr;

  return wineRows.map(mapFlightWine);
}

export async function startPartyWithWineryFlight(
  roomId: string,
  wines: FlightWine[],
  wineryId: string,
  flightId: string,
): Promise<RoomFlightWine[]> {
  const rows = wines.map((w, i) => ({
    room_id: roomId,
    position: w.position ?? i,
    name: w.name,
    producer: w.producer,
    vintage: w.vintage,
    style: w.style ?? null,
    grapes: w.grapes,
    region: w.region,
    country: w.country,
    abv: w.abv,
  }));

  const { data: wineRows, error: wineErr } = await supabase
    .from('room_flight_wines')
    .insert(rows)
    .select();
  if (wineErr || !wineRows) throw wineErr ?? new Error('Failed to save flight wines');

  const { error: updateErr } = await supabase
    .from('tasting_rooms')
    .update({ is_setup_complete: true, flight_type: 'winery', winery_id: wineryId, winery_flight_id: flightId })
    .eq('id', roomId);
  if (updateErr) throw updateErr;

  return wineRows.map(mapFlightWine);
}

export async function createWineResponse(
  roomId: string,
  participantId: string,
  flightWineId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('room_wine_responses')
    .upsert(
      { room_id: roomId, participant_id: participantId, flight_wine_id: flightWineId },
      { onConflict: 'participant_id,flight_wine_id' },
    )
    .select('id')
    .single();
  if (error || !data) throw error ?? new Error('Failed to create response');
  return data.id as string;
}

export async function broadcastLook(
  responseId: string,
  color: string,
  colorIntensity: string,
  clarity: string,
): Promise<void> {
  await supabase
    .from('room_wine_responses')
    .update({ color, color_intensity: colorIntensity, clarity, updated_at: new Date().toISOString() })
    .eq('id', responseId);
}

export async function broadcastSmell(
  responseId: string,
  aromas: string[],
  customAromas: Record<string, string[]>,
): Promise<void> {
  await supabase
    .from('room_wine_responses')
    .update({ aromas, custom_aromas: customAromas, updated_at: new Date().toISOString() })
    .eq('id', responseId);
}

export async function broadcastTaste(
  responseId: string,
  sweetness: string,
  acidity: string,
  tannin: string,
  alcohol: string,
  body: string,
  finish: string,
): Promise<void> {
  await supabase
    .from('room_wine_responses')
    .update({ sweetness, acidity, tannin, alcohol, body, finish, updated_at: new Date().toISOString() })
    .eq('id', responseId);
}

export async function broadcastThink(
  responseId: string,
  liked: boolean | null,
  rating: number | null,
  notes: string,
): Promise<void> {
  await supabase
    .from('room_wine_responses')
    .update({
      liked,
      rating,
      notes,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', responseId);
}

export async function leaveRoomAsParticipant(
  participantId: string,
  roomId: string,
): Promise<{ shouldScheduleClose: boolean }> {
  await supabase
    .from('room_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('id', participantId);

  const { data: active } = await supabase
    .from('room_participants')
    .select('id')
    .eq('room_id', roomId)
    .is('left_at', null);

  return { shouldScheduleClose: (active ?? []).length === 0 };
}

export async function scheduleRoomClose(roomId: string): Promise<void> {
  const closingAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await supabase
    .from('tasting_rooms')
    .update({ closing_at: closingAt, expires_at: expiresAt })
    .eq('id', roomId);
}

export async function updatePresence(participantId: string): Promise<void> {
  await supabase
    .from('room_participants')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', participantId);
}

export async function getRoom(roomId: string): Promise<TastingRoom | null> {
  const { data } = await supabase.from('tasting_rooms').select().eq('id', roomId).maybeSingle();
  return data ? mapRoom(data) : null;
}

export async function getFlightWines(roomId: string): Promise<RoomFlightWine[]> {
  const { data } = await supabase
    .from('room_flight_wines')
    .select()
    .eq('room_id', roomId)
    .order('position');
  return (data ?? []).map(mapFlightWine);
}

export async function getParticipants(roomId: string): Promise<RoomParticipant[]> {
  const { data } = await supabase.from('room_participants').select().eq('room_id', roomId);
  return (data ?? []).map(mapParticipant);
}

export async function getResponses(roomId: string): Promise<RoomWineResponse[]> {
  const { data } = await supabase.from('room_wine_responses').select().eq('room_id', roomId);
  return (data ?? []).map(mapResponse);
}

export { mapRoom, mapParticipant, mapFlightWine, mapResponse };
