import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, Camera } from 'expo-camera';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { scanMenuOffline } from '../services/offlineMenuParser';
import { savePendingWines, saveOriginalWines, FlightPendingWine } from '../storage/flightPendingWineStorage';
import { useWineTasting } from '../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Phase = 'capture' | 'review';

export default function ScanMenuScreen() {
  const navigation = useNavigation<Nav>();
  const { setCustomFlight } = useWineTasting();

  const [phase, setPhase] = useState<Phase>('capture');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [wines, setWines] = useState<FlightPendingWine[]>([]);
  const [flightNameInput, setFlightNameInput] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync();
    Camera.requestCameraPermissionsAsync();
  }, []);

  async function pickImage(useCamera: boolean) {
    const permission = useCamera
      ? await Camera.getCameraPermissionsAsync()
      : await ImagePicker.getMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        useCamera
          ? 'Camera access is needed to take a photo. Please enable it in Settings.'
          : 'Photo library access is needed. Please enable it in Settings.',
      );
      return;
    }

    if (useCamera) {
      setCameraOpen(true);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });
      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not open the photo library.');
    }
  }

  async function handleCapture() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (!photo) return;
      setImageUri(photo.uri ?? null);
      setCameraOpen(false);
    } catch (e: any) {
      Alert.alert('Camera Error', e?.message ?? 'Could not capture photo.');
    }
  }

  async function handleScan() {
    if (!imageUri) return;
    setScanning(true);
    try {
      const extracted = await scanMenuOffline(imageUri);
      if (extracted.length === 0) {
        Alert.alert(
          'No Wines Found',
          'No wines could be detected on this menu. Make sure the menu fills the frame and is well-lit. You can add wines manually below.',
          [{ text: 'OK', onPress: () => { setWines([]); setPhase('review'); } }],
        );
        return;
      }
      setWines(extracted);
      setPhase('review');
    } catch (e: any) {
      Alert.alert('Scan Failed', 'Could not read the menu. Try retaking the photo with better lighting and less glare.');
    } finally {
      setScanning(false);
    }
  }

  function removeWine(id: string) {
    setWines(prev => prev.filter(w => w.id !== id));
  }

  function addEmptyWine() {
    Alert.prompt(
      'Add Wine',
      'Enter the wine name:',
      (name) => {
        if (!name?.trim()) return;
        const id = `pending-manual-${Date.now()}`;
        setWines(prev => [...prev, { id, name: name.trim() }]);
      },
      'plain-text',
      '',
    );
  }

  function addEmptyWineAndroid() {
    // Alert.prompt is iOS-only; use a state-driven modal on Android
    setAddModalVisible(true);
  }

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addNameInput, setAddNameInput] = useState('');

  function confirmAddWine() {
    const name = addNameInput.trim();
    if (!name) return;
    const id = `pending-manual-${Date.now()}`;
    setWines(prev => [...prev, { id, name }]);
    setAddNameInput('');
    setAddModalVisible(false);
  }

  async function handleStartFlight() {
    const name = flightNameInput.trim();
    if (!name) return;
    const flightId = `custom-flight-${Date.now()}`;
    setCustomFlight(flightId, name);
    if (wines.length > 0) {
      await savePendingWines(flightId, wines);
      await saveOriginalWines(flightId, wines);
    }
    navigation.navigate('CustomFlight', { flightId, flightName: name });
  }

  const canScan = !!imageUri && !scanning;
  const canStartFlight = !!flightNameInput.trim();

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Scan Wine Menu" />

      {phase === 'capture' ? (
        <>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineBadgeText}>Offline — on-device OCR, no internet needed</Text>
            </View>

            <Text style={styles.hint}>
              Take a photo of the wine menu or tasting sheet. The app will read the text on-device and pre-populate your flight.
            </Text>

            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
                <View style={styles.previewActions}>
                  <TouchableOpacity style={styles.retakeBtn} onPress={() => pickImage(true)}>
                    <Text style={styles.retakeBtnText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.retakeBtn} onPress={() => pickImage(false)}>
                    <Text style={styles.retakeBtnText}>Choose Library</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.clearBtn} onPress={() => { setImageUri(null); }}>
                    <Text style={styles.clearBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderIcon}>📋</Text>
                <Text style={styles.placeholderLabel}>Wine Menu</Text>
                <View style={styles.placeholderBtns}>
                  <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)}>
                    <Text style={styles.photoBtnText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.photoBtn, styles.photoBtnSecondary]} onPress={() => pickImage(false)}>
                    <Text style={[styles.photoBtnText, styles.photoBtnSecondaryText]}>Choose from Library</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={styles.footer}>
            {scanning ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.primary} size="small" />
                <Text style={styles.loadingText}>Reading menu…</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionBtn, !canScan && styles.actionBtnDisabled]}
                onPress={handleScan}
                disabled={!canScan}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>Scan Menu</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        /* Review phase */
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewTitle}>
                {wines.length > 0
                  ? `Found ${wines.length} wine${wines.length !== 1 ? 's' : ''}`
                  : 'No wines detected'}
              </Text>
              <Text style={styles.reviewSubtitle}>
                Review the list, remove any errors, then name your flight.
              </Text>
            </View>

            {wines.map((wine, i) => (
              <View key={wine.id} style={styles.wineCard}>
                <View style={styles.wineCardPosition}>
                  <Text style={styles.wineCardPositionText}>{i + 1}</Text>
                </View>
                <View style={styles.wineCardInfo}>
                  <Text style={styles.wineCardName}>
                    {[wine.vintage, wine.producer, wine.name].filter(Boolean).join(' ') || 'Unknown Wine'}
                  </Text>
                  {(wine.region || wine.country) && (
                    <Text style={styles.wineCardMeta}>
                      {[wine.region, wine.country].filter(Boolean).join(', ')}
                    </Text>
                  )}
                  {wine.grapes && wine.grapes.length > 0 && (
                    <Text style={styles.wineCardGrapes}>{wine.grapes.join(', ')}</Text>
                  )}
                  {wine.price ? (
                    <Text style={styles.wineCardPrice}>{wine.price}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeWine(wine.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addWineBtn}
              onPress={Platform.OS === 'ios' ? addEmptyWine : addEmptyWineAndroid}
              activeOpacity={0.85}
            >
              <Text style={styles.addWineBtnText}>+ Add Wine Manually</Text>
            </TouchableOpacity>

            <View style={styles.flightNameSection}>
              <Text style={styles.flightNameLabel}>Name Your Flight</Text>
              <TextInput
                style={styles.flightNameInput}
                value={flightNameInput}
                onChangeText={setFlightNameInput}
                placeholder="e.g. Friday Night Reds, Bordeaux Flight…"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnGreen, !canStartFlight && styles.actionBtnDisabled]}
              onPress={handleStartFlight}
              disabled={!canStartFlight}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>Start Flight</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rescanBtn}
              onPress={() => { setPhase('capture'); setWines([]); }}
            >
              <Text style={styles.rescanBtnText}>Rescan Menu</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Camera Modal */}
      <Modal visible={cameraOpen} animationType="slide" onRequestClose={() => setCameraOpen(false)}>
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={styles.cameraControls}>
            <TouchableOpacity onPress={() => setCameraOpen(false)} style={styles.cameraCancelBtn}>
              <Text style={styles.cameraCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCapture} style={styles.captureBtn}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <View style={{ width: 80 }} />
          </View>
        </View>
      </Modal>

      {/* Android "Add Wine" Modal */}
      <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={() => setAddModalVisible(false)}>
        <KeyboardAvoidingView style={styles.addModalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.addModalSheet}>
            <Text style={styles.addModalTitle}>Add Wine</Text>
            <TextInput
              style={styles.addModalInput}
              value={addNameInput}
              onChangeText={setAddNameInput}
              placeholder="Wine name…"
              placeholderTextColor={Colors.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={confirmAddWine}
            />
            <View style={styles.addModalButtons}>
              <TouchableOpacity onPress={() => { setAddModalVisible(false); setAddNameInput(''); }} style={styles.addModalCancel}>
                <Text style={styles.addModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmAddWine}
                style={[styles.addModalConfirm, !addNameInput.trim() && styles.actionBtnDisabled]}
                disabled={!addNameInput.trim()}
              >
                <Text style={styles.addModalConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },

  onlineBadge: {
    backgroundColor: Colors.infoBlueLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  onlineBadgeText: {
    fontSize: 13,
    color: Colors.infoBlue,
    fontWeight: '600',
  },

  hint: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 20,
  },

  placeholder: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    gap: 8,
  },
  placeholderIcon: { fontSize: 40 },
  placeholderLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  placeholderBtns: {
    gap: 10,
    alignItems: 'center',
  },
  photoBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 11,
    minWidth: 180,
    alignItems: 'center',
  },
  photoBtnText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  photoBtnSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  photoBtnSecondaryText: { color: Colors.primary },

  previewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  preview: {
    width: '100%',
    height: 280,
    backgroundColor: Colors.surface,
  },
  previewActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  retakeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: Colors.border,
  },
  retakeBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  clearBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  clearBtnText: { color: Colors.disliked, fontWeight: '600', fontSize: 14 },

  footer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  loadingText: { fontSize: 16, color: Colors.textMuted, fontWeight: '600' },
  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionBtnGreen: { backgroundColor: Colors.btnWinery },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // Review phase
  reviewHeader: {
    marginBottom: 20,
    gap: 4,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },

  wineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  wineCardPosition: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  wineCardPositionText: {
    color: Colors.primaryDark,
    fontWeight: '800',
    fontSize: 13,
  },
  wineCardInfo: { flex: 1, gap: 2 },
  wineCardName: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  wineCardMeta: { fontSize: 12, color: Colors.textMuted },
  wineCardGrapes: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },
  wineCardPrice: { fontSize: 12, color: Colors.primaryDark, fontWeight: '600', marginTop: 2 },
  removeBtn: {
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  removeBtnText: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '700',
  },

  addWineBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  addWineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },

  flightNameSection: {
    gap: 8,
    marginBottom: 16,
  },
  flightNameLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  flightNameInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.white,
  },

  rescanBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  rescanBtnText: {
    fontSize: 14,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },

  // Camera
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 48,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraCancelBtn: { width: 80, alignItems: 'center', paddingVertical: 12 },
  cameraCancelText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },

  // Add wine modal (Android)
  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  addModalSheet: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    gap: 14,
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  addModalInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  addModalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addModalCancel: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addModalCancelText: { color: Colors.textMuted, fontWeight: '600', fontSize: 15 },
  addModalConfirm: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addModalConfirmText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
