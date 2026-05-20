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
import Svg, { Path, Ellipse, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppHeader from '../../components/AppHeader';
import InfoModal from '../../components/InfoModal';
import { Colors } from '../../constants/colors';
import { useWineTasting } from '../../context/WineTastingContext';
import { WineStyle } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STYLES: { key: WineStyle; label: string; borderColor: string; glassColor: string }[] = [
  { key: 'red', label: 'RED', borderColor: '#C1121F', glassColor: '#A01020' },
  { key: 'white', label: 'WHITE', borderColor: '#C8A000', glassColor: '#E0D060' },
  { key: 'rose', label: 'ROSÉ', borderColor: '#D06080', glassColor: '#F0A0B0' },
  { key: 'sparkling', label: 'SPARKLING', borderColor: '#C8A000', glassColor: '#D8C860' },
  { key: 'orange', label: 'ORANGE', borderColor: '#C07020', glassColor: '#D4922A' },
  { key: 'dessert', label: 'DESSERT', borderColor: '#8B5E28', glassColor: '#C09010' },
];

function WineGlassIcon({ color, type }: { color: string; type: WineStyle }) {
  if (type === 'sparkling') {
    return (
      <Svg width={60} height={100} viewBox="0 0 60 100">
        <Path d="M20 5 L40 5 L45 55 Q45 70 30 70 Q15 70 15 55 Z" stroke="#333" strokeWidth={2} fill={color} />
        <Path d="M27 70 L33 70 L35 95 L25 95 Z" stroke="#333" strokeWidth={1.5} fill={color} />
        <Path d="M22 95 L38 95" stroke="#333" strokeWidth={2} strokeLinecap="round" fill="none" />
        <Ellipse cx={30} cy={35} rx={2} ry={3} fill="rgba(255,255,255,0.5)" />
        <Ellipse cx={36} cy={25} rx={2} ry={3} fill="rgba(255,255,255,0.5)" />
        <Ellipse cx={24} cy={45} rx={2} ry={3} fill="rgba(255,255,255,0.5)" />
      </Svg>
    );
  }
  return (
    <Svg width={60} height={100} viewBox="0 0 60 100">
      <Path d="M10 5 Q10 50 30 60 Q50 50 50 5 Z" stroke="#333" strokeWidth={2} fill={color} />
      <Path d="M27 60 L33 60 L35 85 L25 85 Z" stroke="#333" strokeWidth={1.5} fill={color} />
      <Path d="M20 85 L40 85" stroke="#333" strokeWidth={2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export default function WineStyleScreen() {
  const navigation = useNavigation<Nav>();
  const { tasting, update } = useWineTasting();
  const [selected, setSelected] = useState<WineStyle | null>(tasting.style ?? null);

  const handleNext = () => {
    if (!selected) return;
    update({ style: selected });
    navigation.navigate('LookColor');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Wine Style" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <InfoModal
            title="Wine Style"
            body="Select the style of wine you are tasting. This helps guide the tasting notes and appropriate descriptors for each style."
          />
        </View>
        <Text style={styles.heading}>What Style of Wine Are{'\n'}You Tasting?</Text>

        <View style={styles.grid}>
          {STYLES.map(s => {
            const sel = selected === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.card, { borderColor: s.borderColor, backgroundColor: sel ? s.borderColor + '22' : Colors.white }]}
                onPress={() => setSelected(s.key)}
                activeOpacity={0.8}
              >
                <WineGlassIcon color={s.glassColor} type={s.key} />
                <Text style={[styles.cardLabel, { color: s.borderColor }]}>{s.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.nextBar}>
        <TouchableOpacity style={[styles.nextBtn, !selected && styles.nextBtnDisabled]} onPress={handleNext} disabled={!selected}>
          <Text style={styles.nextBtnText}>NEXT &gt;</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 20 },
  topRow: { alignItems: 'center', marginBottom: 8 },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 2.5,
    borderRadius: 14,
    width: '45%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 10,
  },
  cardLabel: {
    fontSize: 18,
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
    backgroundColor: Colors.primary,
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
