import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { useTastingRoom } from '../context/TastingRoomContext';
import { RoomParticipant, RoomWineResponse } from '../types/room';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'RoomWineResults'>;

const STYLE_EMOJI: Record<string, string> = {
  red: '🍷', white: '🥂', rose: '🌸', sparkling: '✨', orange: '🍊', dessert: '🍯',
};

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

function ResultRow({
  label,
  participants,
  getValue,
}: {
  label: string;
  participants: ParticipantWithResp[];
  getValue: (r: RoomWineResponse | undefined) => string;
}) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <View style={styles.resultCols}>
        {participants.map(p => {
          const value = getValue(p.__resp);
          return (
            <Text key={p.id} style={[styles.resultValue, !value && styles.resultValueEmpty]} numberOfLines={2}>
              {value || '·····'}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

// Attach response to participant for convenient access in ResultRow
type ParticipantWithResp = RoomParticipant & { __resp: RoomWineResponse | undefined };

export default function RoomWineResultsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { flightWineId } = route.params;

  const { flightWines, participants, responses, myParticipant, clearActiveTasting } = useTastingRoom();

  const wine = flightWines.find(w => w.id === flightWineId);

  const participantsWithResp: ParticipantWithResp[] = participants.map(p => ({
    ...p,
    __resp: responses.find(r => r.participantId === p.id && r.flightWineId === flightWineId),
  }));

  // Sort: me first, then others in join order
  const sorted = [
    ...participantsWithResp.filter(p => p.id === myParticipant?.id),
    ...participantsWithResp.filter(p => p.id !== myParticipant?.id),
  ];

  const handleBackToRoom = () => {
    clearActiveTasting();
    navigation.navigate('TastingRoom');
  };

  const completedCount = sorted.filter(p => p.__resp?.completedAt).length;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Results" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Wine header */}
        {wine && (
          <View style={styles.wineHeader}>
            <Text style={styles.wineTitle}>
              {STYLE_EMOJI[wine.style ?? ''] ?? '🍾'} {wine.name}{wine.vintage ? `  ${wine.vintage}` : ''}
            </Text>
            {wine.producer ? <Text style={styles.wineProducer}>{wine.producer}</Text> : null}
            {(wine.region || wine.country) ? (
              <Text style={styles.wineMeta}>{[wine.region, wine.country].filter(Boolean).join(', ')}</Text>
            ) : null}
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>
                {completedCount}/{sorted.length} complete
              </Text>
            </View>
          </View>
        )}

        {/* Column headers */}
        <View style={styles.colHeaders}>
          <View style={styles.labelCol} />
          <View style={styles.valueCols}>
            {sorted.map(p => (
              <Text key={p.id} style={[styles.colHeader, p.id === myParticipant?.id && styles.colHeaderMe]} numberOfLines={1}>
                {p.displayName.split(' ')[0]}{p.id === myParticipant?.id ? ' (you)' : ''}
              </Text>
            ))}
          </View>
        </View>

        {/* LOOK */}
        <SectionHeader title="LOOK" />
        <ResultRow label="Color" participants={sorted} getValue={r => r?.color ?? ''} />
        <ResultRow label="Intensity" participants={sorted} getValue={r => r?.colorIntensity ?? ''} />
        <ResultRow label="Clarity" participants={sorted} getValue={r => r?.clarity ?? ''} />

        {/* SMELL */}
        <SectionHeader title="SMELL" />
        <ResultRow
          label="Aromas"
          participants={sorted}
          getValue={r => (r?.aromas ?? []).slice(0, 4).join(', ')}
        />

        {/* TASTE */}
        <SectionHeader title="TASTE" />
        <ResultRow label="Sweetness" participants={sorted} getValue={r => r?.sweetness ?? ''} />
        <ResultRow label="Acidity" participants={sorted} getValue={r => r?.acidity ?? ''} />
        <ResultRow label="Tannin" participants={sorted} getValue={r => r?.tannin || '–'} />
        <ResultRow label="Alcohol" participants={sorted} getValue={r => r?.alcohol ?? ''} />
        <ResultRow label="Body" participants={sorted} getValue={r => r?.body ?? ''} />
        <ResultRow label="Finish" participants={sorted} getValue={r => r?.finish ?? ''} />

        {/* THINK */}
        <SectionHeader title="THINK" />
        <ResultRow
          label="Liked?"
          participants={sorted}
          getValue={r => {
            if (!r?.completedAt) return '';
            if (r.liked === true) return '👍 Yes';
            if (r.liked === false) return '👎 No';
            return '–';
          }}
        />
        <ResultRow
          label="Rating"
          participants={sorted}
          getValue={r => {
            if (!r?.completedAt) return '';
            return r.rating != null ? `★ ${r.rating}/10` : '–';
          }}
        />
        <ResultRow
          label="Notes"
          participants={sorted}
          getValue={r => {
            if (!r?.completedAt) return '';
            return r.notes || '–';
          }}
        />

        {/* Not-yet-done notice */}
        {completedCount < sorted.length && (
          <View style={styles.pendingNotice}>
            <Text style={styles.pendingNoticeText}>
              {sorted.length - completedCount} taster{sorted.length - completedCount !== 1 ? 's are' : ' is'} still going — results fill in automatically.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.backBtn} onPress={handleBackToRoom} activeOpacity={0.85}>
          <Text style={styles.backBtnText}>Back to Room</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },

  wineHeader: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    gap: 4,
  },
  wineTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    textAlign: 'center',
  },
  wineProducer: { fontSize: 14, color: Colors.textMuted },
  wineMeta: { fontSize: 13, color: Colors.textMuted },
  completionBadge: {
    marginTop: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  completionText: { fontSize: 13, fontWeight: '700', color: Colors.primaryDark },

  // Column header row
  colHeaders: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  labelCol: { width: 80 },
  valueCols: { flex: 1, flexDirection: 'row' },
  colHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  colHeaderMe: { color: Colors.primary },

  // Section header
  sectionHeader: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 16,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1.5,
  },

  // Result rows
  resultRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  resultLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    paddingTop: 1,
  },
  resultCols: { flex: 1, flexDirection: 'row' },
  resultValue: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  resultValueEmpty: {
    color: Colors.border,
    fontStyle: 'italic',
  },

  pendingNotice: {
    marginTop: 20,
    backgroundColor: '#FFF8EC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F5A623',
  },
  pendingNoticeText: {
    fontSize: 13,
    color: '#B8740A',
    fontWeight: '600',
    textAlign: 'center',
  },

  backBtn: {
    backgroundColor: Colors.btnWinery,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  backBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
