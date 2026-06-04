import React, { useState } from 'react';
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
import { RootStackParamList } from '../../navigation/types';
import AppHeader from '../../components/AppHeader';
import InfoModal from '../../components/InfoModal';
import { Colors } from '../../constants/colors';
import { useWineTasting } from '../../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'LookDetails'>;

const INTENSITIES = ['PALE', 'MEDIUM', 'DEEP'];
const CLARITIES = ['CLEAR', 'HAZY', 'OPAQUE'];

function ToggleRow({
  options,
  selected,
  onSelect,
  color,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  color: string;
}) {
  return (
    <View style={styles.toggleRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.toggleBtn,
            { borderColor: color },
            selected === opt && { backgroundColor: color + '33' },
          ]}
          onPress={() => onSelect(opt)}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, { color: Colors.text }]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function LookDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { color, colorHex, colorSubtitle } = route.params;
  const { tasting, update } = useWineTasting();

  const [intensity, setIntensity] = useState(tasting.colorIntensity ?? '');
  const [clarity, setClarity] = useState(tasting.clarity ?? '');

  const handleNext = () => {
    update({ colorIntensity: intensity, clarity });
    navigation.navigate('SmellMain');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Step 1: Look" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <InfoModal
            title="Step 1: Look"
            body="Intensity is how concentrated the color looks — pale (almost watery) to deep (barely see-through). Clarity is simply how clear it is. Most wines are crystal clear, but a hazy wine is completely fine too."
          />
        </View>
        <Text style={styles.heading}>What Does Your Wine{'\n'}Look Like?</Text>

        <View style={styles.colorDisplay}>
          <View style={[styles.colorCircle, { backgroundColor: colorHex }]} />
          <Text style={styles.colorName}>{color.toUpperCase()}</Text>
          <Text style={styles.colorSubtitle}>({colorSubtitle})</Text>
        </View>

        <Text style={styles.sectionLabel}>Intensity:</Text>
        <ToggleRow
          options={INTENSITIES}
          selected={intensity}
          onSelect={setIntensity}
          color={Colors.primary}
        />

        <Text style={styles.sectionLabel}>Clarity:</Text>
        <ToggleRow
          options={CLARITIES}
          selected={clarity}
          onSelect={setClarity}
          color={Colors.primary}
        />
      </ScrollView>

      <View style={styles.nextBar}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>NEXT &gt;</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, alignItems: 'center' },
  topRow: { marginBottom: 8 },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.text,
  },
  colorDisplay: { alignItems: 'center', marginBottom: 28 },
  colorCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  colorName: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  colorSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '800',
    textDecorationLine: 'underline',
    color: Colors.text,
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginTop: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  nextBar: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBtn: {
    backgroundColor: Colors.btnGuide,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
