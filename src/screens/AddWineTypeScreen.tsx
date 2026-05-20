import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { useWineTasting } from '../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddWineType'>;

export default function AddWineTypeScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { tasting, setTastingType, setCustomFlight } = useWineTasting();

  const [flightModalVisible, setFlightModalVisible] = useState(false);
  const [flightStep, setFlightStep] = useState<'choose' | 'method' | 'name'>('choose');
  const [flightNameInput, setFlightNameInput] = useState('');

  const hasActiveFlight = Boolean(tasting.customFlightId);
  const activeFlightName = tasting.customFlightName || (hasActiveFlight ? 'My Flight' : null);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.startFlight && !hasActiveFlight) {
        setFlightStep('method');
        setFlightModalVisible(true);
        navigation.setParams({ startFlight: undefined });
      }
    // navigation.setParams identity is stable, safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params?.startFlight]),
  );

  const handleBack = hasActiveFlight
    ? () => navigation.navigate('CustomFlight', { flightId: tasting.customFlightId!, flightName: activeFlightName! })
    : undefined;

  const choose = (type: 'quick' | 'full') => {
    setTastingType(type);
    navigation.navigate('BasicInfo');
  };

  const closeModal = () => {
    setFlightModalVisible(false);
    setFlightStep('choose');
    setFlightNameInput('');
  };

  const handleScanMenu = () => {
    closeModal();
    navigation.navigate('ScanMenu');
  };

  const handleStartCustomFlight = () => {
    const name = flightNameInput.trim();
    if (!name) return;
    const id = tasting.customFlightId ?? `custom-flight-${Date.now()}`;
    setCustomFlight(id, name);
    closeModal();
    navigation.navigate('CustomFlight', { flightId: id, flightName: name });
  };

  const handleWineryFlight = () => {
    closeModal();
    navigation.navigate('WineryCheckIn');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Start Tasting" onBack={handleBack} />
      <View style={styles.container}>
        {hasActiveFlight && (
          <View style={styles.activeFlightBanner}>
            <Text style={styles.activeFlightLabel}>Flight</Text>
            <Text style={styles.activeFlightName}>{activeFlightName}</Text>
          </View>
        )}

        <View style={styles.btnArea}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Colors.primary }]}
            onPress={() => choose('quick')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Quick Sip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Colors.btnGuide }]}
            onPress={() => choose('full')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Guided Tasting</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flightBtn}
            onPress={() => {
              if (hasActiveFlight) {
                navigation.navigate('CustomFlight', { flightId: tasting.customFlightId!, flightName: activeFlightName! });
              } else {
                setFlightStep('choose');
                setFlightNameInput('');
                setFlightModalVisible(true);
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.flightBtnText}>
              {hasActiveFlight ? 'Edit Flight' : '+ Start a Wine Flight'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={flightModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {flightStep === 'choose' ? (
              <>
                <Text style={styles.modalTitle}>Start a Wine Flight</Text>
                <Text style={styles.modalSubtitle}>Where are you tasting?</Text>

                <TouchableOpacity
                  style={styles.flightOptionCard}
                  activeOpacity={0.85}
                  onPress={() => setFlightStep('method')}
                >
                  <View style={styles.flightOptionLeft}>
                    <Text style={styles.flightOptionIcon}>🏠</Text>
                    <View>
                      <Text style={styles.flightOptionTitle}>Custom Flight</Text>
                      <Text style={styles.flightOptionDesc}>At home or a non-partner venue</Text>
                    </View>
                  </View>
                  <Text style={styles.flightOptionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.flightOptionCard, styles.flightOptionCardWinery]}
                  activeOpacity={0.85}
                  onPress={handleWineryFlight}
                >
                  <View style={styles.flightOptionLeft}>
                    <Text style={styles.flightOptionIcon}>🍷</Text>
                    <View>
                      <Text style={[styles.flightOptionTitle, { color: Colors.white }]}>At a Winery</Text>
                      <Text style={[styles.flightOptionDesc, { color: Colors.primaryLight }]}>
                        Search or scan QR for their flight
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.flightOptionArrow, { color: Colors.white }]}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : flightStep === 'method' ? (
              <>
                <TouchableOpacity onPress={() => setFlightStep('choose')} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Custom Flight</Text>
                <Text style={styles.modalSubtitle}>
                  Scan a printed wine menu to pre-populate your flight, or add wines manually as you taste.
                </Text>

                <TouchableOpacity
                  style={styles.flightOptionCard}
                  activeOpacity={0.85}
                  onPress={handleScanMenu}
                >
                  <View style={styles.flightOptionLeft}>
                    <Text style={styles.flightOptionIcon}>📋</Text>
                    <View>
                      <Text style={styles.flightOptionTitle}>Scan a Wine Menu</Text>
                      <Text style={styles.flightOptionDesc}>AI reads a menu or tasting sheet</Text>
                    </View>
                  </View>
                  <Text style={styles.flightOptionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.flightOptionCard}
                  activeOpacity={0.85}
                  onPress={() => setFlightStep('name')}
                >
                  <View style={styles.flightOptionLeft}>
                    <Text style={styles.flightOptionIcon}>✍️</Text>
                    <View>
                      <Text style={styles.flightOptionTitle}>Enter Manually</Text>
                      <Text style={styles.flightOptionDesc}>Add wines one at a time as you go</Text>
                    </View>
                  </View>
                  <Text style={styles.flightOptionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => setFlightStep('method')} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Name Your Flight</Text>
                <Text style={styles.modalSubtitle}>
                  Give this set of wines a name to group your tastings together.
                </Text>
                <TextInput
                  style={styles.nameInput}
                  value={flightNameInput}
                  onChangeText={setFlightNameInput}
                  placeholder="e.g. Friday Night Reds, Bordeaux Flight…"
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="done"
                  onSubmitEditing={handleStartCustomFlight}
                  autoFocus
                />
                <TouchableOpacity
                  style={[
                    styles.startFlightBtn,
                    !flightNameInput.trim() && styles.startFlightBtnDisabled,
                  ]}
                  onPress={handleStartCustomFlight}
                  disabled={!flightNameInput.trim()}
                  activeOpacity={0.85}
                >
                  <Text style={styles.startFlightBtnText}>
                    {tasting.customFlightId ? 'Update Flight Name' : 'Start Flight'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  activeFlightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 24,
  },
  activeFlightLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeFlightName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
    flex: 1,
  },
  btnArea: {
    gap: 20,
    marginBottom: 60,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 28,
    alignItems: 'center',
  },
  btnText: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  flightBtn: {
    borderWidth: 2,
    borderColor: Colors.btnWinery,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  flightBtnText: {
    color: Colors.btnWinery,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    gap: 14,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    marginTop: -6,
  },
  flightOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flightOptionCardWinery: {
    backgroundColor: Colors.btnWinery,
    borderColor: Colors.btnWinery,
  },
  flightOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  flightOptionIcon: { fontSize: 32 },
  flightOptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 2,
  },
  flightOptionDesc: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  flightOptionArrow: {
    fontSize: 26,
    color: Colors.textMuted,
    lineHeight: 30,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 15,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '700',
  },
  nameInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  startFlightBtn: {
    backgroundColor: Colors.btnWinery,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startFlightBtnDisabled: {
    opacity: 0.4,
  },
  startFlightBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
