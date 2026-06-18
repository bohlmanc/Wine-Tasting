import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
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

type Mode = 'pick' | 'create' | 'join';

export default function TastingPartyLobbyScreen() {
  const navigation = useNavigation<Nav>();
  const { createRoom, joinRoom } = useTastingRoom();

  const [mode, setMode] = useState<Mode>('pick');
  const [displayName, setDisplayName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const name = displayName.trim();
    if (!name) return;
    setLoading(true);
    try {
      await createRoom(name);
      navigation.replace('PartyFlightSetup');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not create room. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const name = displayName.trim();
    const code = roomCode.trim().toUpperCase();
    if (!name || code.length !== 4) return;
    setLoading(true);
    try {
      const { isSetupComplete } = await joinRoom(code, name);
      if (isSetupComplete) {
        navigation.replace('TastingRoom');
      } else {
        navigation.replace('TastingRoomWaiting');
      }
    } catch (e: any) {
      Alert.alert('Room Not Found', e?.message ?? 'Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Tasting Party" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {mode === 'pick' && (
            <>
              <Text style={styles.heading}>Taste Together</Text>
              <Text style={styles.sub}>
                Share a live tasting session with friends.{'\n'}Everyone tastes the same wines and sees each other's results.
              </Text>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => setMode('create')}
                activeOpacity={0.85}
              >
                <Text style={styles.optionIcon}>🍾</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Create a Room</Text>
                  <Text style={styles.optionDesc}>You're the host — you set up the wines</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, styles.optionCardJoin]}
                onPress={() => setMode('join')}
                activeOpacity={0.85}
              >
                <Text style={styles.optionIcon}>🔑</Text>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: Colors.white }]}>Join a Room</Text>
                  <Text style={[styles.optionDesc, { color: Colors.primaryLight }]}>Enter a 4-letter code from the host</Text>
                </View>
                <Text style={[styles.optionArrow, { color: Colors.white }]}>›</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === 'create' && (
            <>
              <TouchableOpacity onPress={() => setMode('pick')} style={styles.backBtn}>
                <Text style={styles.backBtnText}>‹ Back</Text>
              </TouchableOpacity>
              <Text style={styles.heading}>Create a Room</Text>
              <Text style={styles.sub}>Your name will be shown to other tasters.</Text>

              <Text style={styles.fieldLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Hailey"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, !displayName.trim() && styles.primaryBtnDisabled]}
                onPress={handleCreate}
                disabled={!displayName.trim() || loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.primaryBtnText}>Create Room</Text>
                }
              </TouchableOpacity>
            </>
          )}

          {mode === 'join' && (
            <>
              <TouchableOpacity onPress={() => setMode('pick')} style={styles.backBtn}>
                <Text style={styles.backBtnText}>‹ Back</Text>
              </TouchableOpacity>
              <Text style={styles.heading}>Join a Room</Text>
              <Text style={styles.sub}>Enter the 4-letter code from your host.</Text>

              <Text style={styles.fieldLabel}>Room Code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={roomCode}
                onChangeText={v => setRoomCode(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
                placeholder="XXXX"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={4}
                autoFocus
              />

              <Text style={styles.fieldLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Cody"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={handleJoin}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, styles.primaryBtnJoin, (!displayName.trim() || roomCode.length !== 4) && styles.primaryBtnDisabled]}
                onPress={handleJoin}
                disabled={!displayName.trim() || roomCode.length !== 4 || loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.primaryBtnText}>Join Room</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: 24,
    paddingTop: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  optionCardJoin: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionIcon: { fontSize: 32, marginRight: 14 },
  optionText: { flex: 1 },
  optionTitle: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  optionArrow: {
    fontSize: 26,
    color: Colors.textMuted,
    lineHeight: 30,
  },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  codeInput: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  primaryBtnJoin: {
    backgroundColor: Colors.btnGuide,
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
