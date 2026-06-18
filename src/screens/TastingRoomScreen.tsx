import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { useTastingRoom } from '../context/TastingRoomContext';
import { useWineTasting } from '../context/WineTastingContext';
import { RoomFlightWine, RoomParticipant, RoomWineResponse } from '../types/room';
import { WineStyle } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STYLE_EMOJI: Record<string, string> = {
  red: '🍷', white: '🥂', rose: '🌸', sparkling: '✨', orange: '🍊', dessert: '🍯',
};

function statusForParticipant(
  participant: RoomParticipant,
  responses: RoomWineResponse[],
  flightWineId: string,
): 'done' | 'tasting' | 'waiting' {
  const resp = responses.find(r => r.participantId === participant.id && r.flightWineId === flightWineId);
  if (!resp) return 'waiting';
  if (resp.completedAt) return 'done';
  return 'tasting';
}

function StatusDot({ status }: { status: 'done' | 'tasting' | 'waiting' }) {
  const color = status === 'done' ? Colors.liked : status === 'tasting' ? '#F5A623' : Colors.border;
  return <View style={[styles.statusDot, { backgroundColor: color }]} />;
}

function WineCard({
  wine,
  index,
  participants,
  responses,
  myParticipant,
  onTaste,
  onViewResults,
}: {
  wine: RoomFlightWine;
  index: number;
  participants: RoomParticipant[];
  responses: RoomWineResponse[];
  myParticipant: RoomParticipant | null;
  onTaste: () => void;
  onViewResults: () => void;
}) {
  const myResponse = responses.find(r => r.participantId === myParticipant?.id && r.flightWineId === wine.id);
  const iCompleted = !!myResponse?.completedAt;
  const isTasting = !!myResponse && !myResponse.completedAt;

  return (
    <View style={styles.wineCard}>
      <View style={styles.wineCardHeader}>
        <View style={styles.wineIndexBadge}>
          <Text style={styles.wineIndexText}>{index + 1}</Text>
        </View>
        <View style={styles.wineCardInfo}>
          <Text style={styles.wineCardName}>
            {STYLE_EMOJI[wine.style ?? ''] ?? '🍾'} {wine.name}
            {wine.vintage ? `  ${wine.vintage}` : ''}
          </Text>
          {wine.producer ? <Text style={styles.wineCardProducer}>{wine.producer}</Text> : null}
          {(wine.region || wine.country) ? (
            <Text style={styles.wineCardMeta}>{[wine.region, wine.country].filter(Boolean).join(', ')}</Text>
          ) : null}
        </View>
      </View>

      {/* Participant status row */}
      <View style={styles.participantStatusRow}>
        {participants.map(p => {
          const status = statusForParticipant(p, responses, wine.id);
          return (
            <View key={p.id} style={styles.participantStatus}>
              <StatusDot status={status} />
              <Text style={styles.participantStatusName} numberOfLines={1}>{p.displayName.split(' ')[0]}</Text>
            </View>
          );
        })}
      </View>

      {/* Action button */}
      {iCompleted ? (
        <TouchableOpacity style={styles.viewResultsBtn} onPress={onViewResults} activeOpacity={0.85}>
          <Text style={styles.viewResultsBtnText}>See Results</Text>
        </TouchableOpacity>
      ) : isTasting ? (
        <View style={styles.tastingInProgressBadge}>
          <Text style={styles.tastingInProgressText}>You're tasting this wine…</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.tasteBtn} onPress={onTaste} activeOpacity={0.85}>
          <Text style={styles.tasteBtnText}>Taste This Wine</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function TastingRoomScreen() {
  const navigation = useNavigation<Nav>();
  const { room, participants, flightWines, responses, myParticipant, isHost, startTastingWine, leaveRoom } = useTastingRoom();
  const { reset, setTastingType, update } = useWineTasting();

  // Clear any stale active tasting state when returning to room
  useFocusEffect(useCallback(() => {}, []));

  const handleCopyCode = () => {
    if (room?.code) {
      Clipboard.setString(room.code);
      Alert.alert('Copied!', `Room code ${room.code} copied to clipboard.`);
    }
  };

  const handleTasteWine = async (wine: RoomFlightWine) => {
    await startTastingWine(wine.id);
    reset();
    setTastingType('full');
    update({
      name: wine.name,
      producer: wine.producer,
      vintage: wine.vintage,
      style: (wine.style as WineStyle) ?? undefined,
      grapes: wine.grapes,
      region: wine.region,
      country: wine.country,
      abv: wine.abv,
    });
    navigation.navigate('BasicInfo');
  };

  const handleLeave = () => {
    Alert.alert('Leave Party', 'Are you sure you want to leave this tasting party?', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          leaveRoom();
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        },
      },
    ]);
  };

  const doneCount = flightWines.filter(wine =>
    responses.some(r => r.participantId === myParticipant?.id && r.flightWineId === wine.id && r.completedAt)
  ).length;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Tasting Party" onBack={handleLeave} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Room code header */}
        <View style={styles.roomHeader}>
          <View style={styles.codePill}>
            <Text style={styles.codeLabel}>ROOM CODE</Text>
            <Text style={styles.codeText}>{room?.code ?? '····'}</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode} activeOpacity={0.7}>
            <Text style={styles.copyBtnText}>Copy</Text>
          </TouchableOpacity>
        </View>

        {/* Participants */}
        <Text style={styles.sectionLabel}>In This Party ({participants.length})</Text>
        <View style={styles.participantsList}>
          {participants.map(p => {
            const isMe = p.id === myParticipant?.id;
            return (
              <View key={p.id} style={styles.participantRow}>
                <View style={styles.presenceDot} />
                <Text style={styles.participantName}>
                  {p.displayName}
                  {p.isHost ? '  ·  host' : ''}
                  {isMe ? '  (you)' : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Progress if any wines done */}
        {doneCount > 0 && (
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{doneCount}/{flightWines.length} wines tasted by you</Text>
          </View>
        )}

        {/* Flight wines */}
        <Text style={styles.sectionLabel}>The Flight</Text>
        {flightWines.map((wine, i) => (
          <WineCard
            key={wine.id}
            wine={wine}
            index={i}
            participants={participants}
            responses={responses}
            myParticipant={myParticipant}
            onTaste={() => handleTasteWine(wine)}
            onViewResults={() => navigation.navigate('RoomWineResults', { flightWineId: wine.id })}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },

  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  codePill: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryDark,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Colors.primary,
    letterSpacing: 6,
  },
  copyBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  participantsList: {
    marginBottom: 20,
    gap: 8,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  presenceDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.liked,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },

  progressBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e7d32',
  },

  // Wine card
  wineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  wineCardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  wineIndexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  wineIndexText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  wineCardInfo: { flex: 1 },
  wineCardName: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 2,
  },
  wineCardProducer: { fontSize: 13, color: Colors.textMuted },
  wineCardMeta: { fontSize: 12, color: Colors.textMuted },

  participantStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  participantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  participantStatusName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    maxWidth: 64,
  },

  tasteBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tasteBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  viewResultsBtn: {
    backgroundColor: Colors.btnGuide,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewResultsBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  tastingInProgressBadge: {
    borderWidth: 1,
    borderColor: '#F5A623',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFF8EC',
  },
  tastingInProgressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B8740A',
  },
});
