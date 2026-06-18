import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { useTastingRoom } from '../context/TastingRoomContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TastingRoomWaitingScreen() {
  const navigation = useNavigation<Nav>();
  const { room, participants, leaveRoom } = useTastingRoom();

  // Watch for the host to finish setup via Realtime (room.isSetupComplete flips in context)
  useEffect(() => {
    if (room?.isSetupComplete) {
      navigation.replace('TastingRoom');
    }
  }, [room?.isSetupComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const host = participants.find(p => p.isHost);

  const handleLeave = () => {
    Alert.alert('Leave Room', 'Are you sure you want to leave this tasting party?', [
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

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Tasting Party" onBack={handleLeave} />
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.codeBadge}>
          <Text style={styles.codeLabel}>ROOM CODE</Text>
          <Text style={styles.code}>{room?.code ?? '····'}</Text>
        </View>

        <View style={styles.waitingCard}>
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.waitingTitle}>Waiting for {host?.displayName ?? 'the host'}</Text>
          <Text style={styles.waitingDesc}>
            The host is setting up the flight.{'\n'}You'll be let in automatically when it's ready.
          </Text>
        </View>

        <Text style={styles.participantsLabel}>In this room ({participants.length})</Text>
        {participants.map(p => (
          <View key={p.id} style={styles.participantRow}>
            <View style={styles.presenceDot} />
            <Text style={styles.participantName}>
              {p.displayName}{p.isHost ? '  (host)' : ''}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: { flexGrow: 1, backgroundColor: Colors.background, padding: 24 },
  codeBadge: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  code: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Colors.primary,
    letterSpacing: 8,
  },
  waitingCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    marginBottom: 32,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.primaryDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  waitingDesc: {
    fontSize: 14,
    color: Colors.primaryDark,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  participantsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  presenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.liked,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
});
