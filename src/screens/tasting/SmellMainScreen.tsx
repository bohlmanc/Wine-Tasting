import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppHeader from '../../components/AppHeader';
import InfoModal from '../../components/InfoModal';
import { Colors } from '../../constants/colors';
import { useWineTasting } from '../../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = [
  { key: 'FRUIT', label: 'FRUIT', color: Colors.fruitColor },
  { key: 'HERBS', label: 'HERBS &\nSPICES', color: Colors.herbsColor },
  { key: 'OUTDOOR', label: 'OUTDOOR', color: Colors.outdoorColor },
  { key: 'OTHER', label: 'OTHER', color: Colors.otherColor },
];

export default function SmellMainScreen() {
  const navigation = useNavigation<Nav>();
  const { tasting } = useWineTasting();
  const aromas = tasting.aromas ?? [];

  const hasAromasIn = (cat: string) => {
    if (cat === 'FRUIT') {
      const fruitKeys = ['Black Fruit', 'Red Fruit', 'Dried Fruit', 'Tropical Fruit', 'Tree Fruit', 'Citrus Fruit'];
      return aromas.some(() => true); // simplified check
    }
    return false;
  };

  const handleCategory = (cat: string) => {
    if (cat === 'FRUIT') {
      navigation.navigate('SmellFruitType');
    } else if (cat === 'HERBS') {
      navigation.navigate('SmellHerbsSpices');
    } else if (cat === 'OUTDOOR') {
      navigation.navigate('SmellOutdoorOther', { category: 'Outdoor' });
    } else if (cat === 'OTHER') {
      navigation.navigate('SmellOutdoorOther', { category: 'Other' });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Step 2: Smell" />
      <View style={styles.container}>
        <View style={styles.topRow}>
          <InfoModal
            title="Step 2: Smell"
            body="Swirl your glass and take a sniff. Try to identify the aromas — fruity, earthy, herbal, or other. Tap each category to explore options."
          />
        </View>
        <Text style={styles.heading}>What Does Your Wine{'\n'}Smell Like?</Text>

        <View style={styles.grid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.card, { borderColor: cat.color }]}
              onPress={() => handleCategory(cat.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.cardLabel, { color: cat.color }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {aromas.length > 0 && (
          <View style={styles.selectedArea}>
            <Text style={styles.selectedTitle}>Selected Aromas:</Text>
            <View style={styles.tagsRow}>
              {aromas.map(a => (
                <View key={a} style={styles.tag}>
                  <Text style={styles.tagText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.nextBar}>
        <TouchableOpacity style={styles.nextBtn} onPress={() => navigation.navigate('Taste')}>
          <Text style={styles.nextBtnText}>NEXT &gt;</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  topRow: { alignItems: 'center', marginBottom: 8 },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
    marginBottom: 28,
    color: Colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    width: '47%',
    borderWidth: 2.5,
    borderRadius: 12,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 14,
    backgroundColor: Colors.white,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
  },
  selectedArea: {
    marginTop: 20,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: Colors.primaryDark, fontWeight: '600' },
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
  nextBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
