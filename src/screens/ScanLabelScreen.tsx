import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, Camera } from 'expo-camera';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { scanWineLabel } from '../services/labelScanService';
import { scanLabelOffline } from '../services/offlineLabelParser';
import { useWineTasting } from '../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ScanLabelScreen() {
  const navigation = useNavigation<Nav>();
  const { update } = useWineTasting();

  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [frontBase64, setFrontBase64] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [backBase64, setBackBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<{
    setUri: (u: string) => void;
    setBase64: (b: string) => void;
  } | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync();
    Camera.requestCameraPermissionsAsync();
  }, []);

  async function pickImage(
    useCamera: boolean,
    setUri: (u: string) => void,
    setBase64: (b: string) => void,
  ) {
    const permission = useCamera
      ? await Camera.getCameraPermissionsAsync()
      : await ImagePicker.getMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', useCamera
        ? 'Camera access is needed to take a photo. Please enable it in Settings.'
        : 'Photo library access is needed. Please enable it in Settings.');
      return;
    }

    if (useCamera) {
      setCameraTarget({ setUri, setBase64 });
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        setUri(result.assets[0].uri);
        setBase64(result.assets[0].base64 ?? '');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not open the photo library.');
    }
  }

  async function handleCapture() {
    if (!cameraRef.current || !cameraTarget) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      cameraTarget.setUri(photo.uri);
      cameraTarget.setBase64(photo.base64 ?? '');
      setCameraTarget(null);
    } catch (e: any) {
      Alert.alert('Camera Error', e?.message ?? 'Could not capture photo.');
    }
  }

  async function handleAnalyze() {
    if (!frontUri && !backUri) return;

    setLoading(true);
    try {
      const data = mode === 'offline'
        ? await scanLabelOffline(frontUri, backUri)
        : await scanWineLabel(frontBase64, backBase64);

      const grapes = (data.grapes ?? []).filter(g => g.length > 0);

      if (mode === 'offline') {
        const anyFound = data.vintage || data.abv || data.country || grapes.length > 0;
        if (!anyFound) {
          Alert.alert(
            'Nothing Detected',
            'No vintage, ABV, grapes, or country were found in the photos.\n\nTips: make sure the label fills the frame and is well-lit. For name and producer, switch to AI (Online) mode.',
          );
          return;
        }
      }

      update({
        name: data.name ?? '',
        producer: data.producer ?? '',
        vintage: data.vintage ?? '',
        country: data.country ?? '',
        grapes,
        abv: data.abv ?? '',
        importer: data.importer ?? '',
      });

      navigation.goBack();
    } catch (e: any) {
      const msg = e?.message ?? 'Unknown error';
      if (mode === 'online' && msg.includes('401')) {
        Alert.alert('API Key Error', 'Your Anthropic API key is invalid. Check src/config/apiConfig.ts.');
      } else if (mode === 'online' && (msg.includes('fetch') || msg.includes('network'))) {
        Alert.alert('No Connection', 'No internet connection. Switch to Offline mode to scan without one.');
      } else if (mode === 'offline') {
        Alert.alert('Scan Error', `Text recognition failed: ${e?.message ?? 'unknown error'}. Try retaking the photo or switch to AI (Online) mode.`);
      } else {
        Alert.alert('Scan Failed', 'Could not read the labels. Try retaking the photos with better lighting.');
      }
    } finally {
      setLoading(false);
    }
  }

  const canAnalyze = (!!frontUri || !!backUri) && !loading;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Scan Wine Label" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'online' && styles.modeBtnActive]}
            onPress={() => setMode('online')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeBtnText, mode === 'online' && styles.modeBtnTextActive]}>
              AI (Online)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'offline' && styles.modeBtnActive]}
            onPress={() => setMode('offline')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeBtnText, mode === 'offline' && styles.modeBtnTextActive]}>
              Offline
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          {mode === 'online'
            ? 'AI mode reads name, producer, grapes, vintage, ABV, and country. Requires internet.'
            : 'Offline mode extracts vintage, ABV, grapes, and country from label text. Name and producer will need to be filled in manually.'}
        </Text>

        <LabelSection
          title="Front Label"
          subtitle="Wine name, producer, vintage"
          imageUri={frontUri}
          onCamera={() => pickImage(true, setFrontUri, setFrontBase64)}
          onLibrary={() => pickImage(false, setFrontUri, setFrontBase64)}
          onClear={() => { setFrontUri(null); setFrontBase64(null); }}
        />

        <LabelSection
          title="Back Label"
          subtitle="Grapes, ABV, importer"
          imageUri={backUri}
          onCamera={() => pickImage(true, setBackUri, setBackBase64)}
          onLibrary={() => pickImage(false, setBackUri, setBackBase64)}
          onClear={() => { setBackUri(null); setBackBase64(null); }}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={Colors.primary} size="small" />
            <Text style={styles.loadingText}>Reading labels...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.analyzeBtn, !canAnalyze && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze}
            disabled={!canAnalyze}
          >
            <Text style={styles.analyzeBtnText}>Analyze Labels</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={!!cameraTarget} animationType="slide" onRequestClose={() => setCameraTarget(null)}>
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={styles.cameraControls}>
            <TouchableOpacity onPress={() => setCameraTarget(null)} style={styles.cameraCancelBtn}>
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

function LabelSection({
  title,
  subtitle,
  imageUri,
  onCamera,
  onLibrary,
  onClear,
}: {
  title: string;
  subtitle: string;
  imageUri: string | null;
  onCamera: () => void;
  onLibrary: () => void;
  onClear: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>

      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.retakeBtn} onPress={onCamera}>
              <Text style={styles.retakeBtnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
              <Text style={styles.clearBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>📷</Text>
          <View style={styles.placeholderBtns}>
            <TouchableOpacity style={styles.photoBtn} onPress={onCamera}>
              <Text style={styles.photoBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoBtn, styles.photoBtnSecondary]} onPress={onLibrary}>
              <Text style={[styles.photoBtnText, styles.photoBtnSecondaryText]}>Choose from Library</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },

  hint: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 24,
    lineHeight: 20,
  },

  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 12,
  },

  placeholder: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    gap: 16,
  },
  placeholderIcon: {
    fontSize: 36,
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
  photoBtnSecondaryText: {
    color: Colors.primary,
  },

  previewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  preview: {
    width: '100%',
    height: 220,
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
  retakeBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearBtnText: {
    color: Colors.disliked,
    fontWeight: '600',
    fontSize: 14,
  },

  footer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  analyzeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  analyzeBtnDisabled: {
    opacity: 0.45,
  },
  analyzeBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  modeBtnTextActive: {
    color: Colors.white,
  },

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
  cameraCancelBtn: {
    width: 80,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cameraCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
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
