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

export default function ScanMenuScreen() {
  const navigation = useNavigation<Nav>();
  const { setCustomFlight } = useWineTasting();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  // Bug 13: flight name is entered upfront, before scanning
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
        mediaTypes: ['images'],
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

  // Bug 12: after scan, create the flight immediately and navigate to CustomFlight
  async function handleScan() {
    if (!imageUri || !flightNameInput.trim()) return;
    setScanning(true);
    try {
      const extracted = await scanMenuOffline(imageUri);
      const flightId = `custom-flight-${Date.now()}`;
      const name = flightNameInput.trim();
      setCustomFlight(flightId, name);
      if (extracted.length > 0) {
        await savePendingWines(flightId, extracted);
        await saveOriginalWines(flightId, extracted);
      }
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'CustomFlight', params: { flightId, flightName: name } }],
      });
    } catch (e: any) {
      Alert.alert('Scan Failed', 'Could not read the menu. Try retaking the photo with better lighting and less glare.');
    } finally {
      setScanning(false);
    }
  }

  const canScan = !!imageUri && !!flightNameInput.trim() && !scanning;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Scan Wine Menu" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineBadgeText}>Offline — on-device OCR, no internet needed</Text>
          </View>

          <Text style={styles.hint}>
            Name your flight, then take a photo of the wine menu or tasting sheet. The app will read the text on-device and pre-populate your flight.
          </Text>

          {/* Bug 13: name the flight first */}
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
                <TouchableOpacity style={styles.clearBtn} onPress={() => setImageUri(null)}>
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
      </KeyboardAvoidingView>

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

  flightNameSection: {
    gap: 8,
    marginBottom: 20,
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
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
});
