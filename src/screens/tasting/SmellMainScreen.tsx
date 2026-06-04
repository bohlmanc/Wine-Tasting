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
import Svg, { Path, Circle } from 'react-native-svg';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function CategoryIcon({ categoryKey, color }: { categoryKey: string; color: string }) {
  if (categoryKey === 'FRUIT') {
    return (
      <Svg width={48} height={54} viewBox="0 0 48 54">
        <Path d="M24 3 L24 11" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
        <Path d="M24 6 Q31 2 35 6 Q31 11 24 9" fill={color} opacity={0.65} />
        <Circle cx={18} cy={18} r={6.5} fill={color} opacity={0.7} />
        <Circle cx={30} cy={18} r={6.5} fill={color} opacity={0.7} />
        <Circle cx={11} cy={29} r={6.5} fill={color} opacity={0.78} />
        <Circle cx={24} cy={29} r={6.5} fill={color} opacity={0.78} />
        <Circle cx={37} cy={29} r={6.5} fill={color} opacity={0.78} />
        <Circle cx={17} cy={40} r={6.5} fill={color} opacity={0.88} />
        <Circle cx={30} cy={40} r={6.5} fill={color} opacity={0.88} />
        <Circle cx={24} cy={51} r={6} fill={color} />
      </Svg>
    );
  }
  if (categoryKey === 'HERBS') {
    return (
      <Svg width={48} height={54} viewBox="0 0 48 54">
        <Path d="M24 54 L24 4" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <Path d="M24 46 Q10 38 11 26 Q22 30 24 42" fill={color} opacity={0.7} />
        <Path d="M24 46 Q38 38 37 26 Q26 30 24 42" fill={color} opacity={0.7} />
        <Path d="M24 32 Q9 22 12 10 Q23 16 24 30" fill={color} opacity={0.82} />
        <Path d="M24 32 Q39 22 36 10 Q25 16 24 30" fill={color} opacity={0.82} />
        <Path d="M24 17 Q17 8 22 2 Q28 7 24 16" fill={color} opacity={0.9} />
      </Svg>
    );
  }
  if (categoryKey === 'OUTDOOR') {
    return (
      <Svg width={48} height={54} viewBox="0 0 48 54">
        <Path d="M20 42 L20 54 L28 54 L28 42 Z" fill={color} opacity={0.8} />
        <Path d="M24 12 L44 42 L4 42 Z" fill={color} opacity={0.8} />
        <Path d="M24 2 L40 28 L8 28 Z" fill={color} opacity={0.65} />
      </Svg>
    );
  }
  if (categoryKey === 'OTHER') {
    return (
      <Svg width={48} height={54} viewBox="0 0 48 54">
        <Path d="M24 4 L27 21 L44 27 L27 33 L24 50 L21 33 L4 27 L21 21 Z" fill={color} opacity={0.85} />
      </Svg>
    );
  }
  return null;
}

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
            body="Give your glass a good swirl, then get your nose all the way in there. Start simple — pick a category and see if anything rings a bell. Whatever you smell is correct. This is all based on your experience, and no one else has had the exact same one."
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
              <CategoryIcon categoryKey={cat.key} color={cat.color} />
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
    justifyContent: 'center',
    gap: 10,
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
