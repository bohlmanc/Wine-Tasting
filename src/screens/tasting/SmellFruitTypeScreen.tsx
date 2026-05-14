import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/colors';
import { FRUIT_TYPES } from '../../constants/aromas';
import { useWineTasting } from '../../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FRUIT_COLORS: Record<string, string> = {
  'Black Fruit': '#4A1A4A',
  'Red Fruit': '#C01030',
  'Dried Fruit': '#8B4513',
  'Tropical Fruit': '#D08000',
  'Tree Fruit': '#C87828',
  'Citrus Fruit': '#D4A000',
};

export default function SmellFruitTypeScreen() {
  const navigation = useNavigation<Nav>();
  const { tasting } = useWineTasting();
  const aromas = tasting.aromas ?? [];

  const hasFruitType = (type: string) =>
    aromas.some(a => a.startsWith(type + ':') || a === type);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Step 2: Smell" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>What Type of Fruit?</Text>
        <View style={styles.grid}>
          {FRUIT_TYPES.map(type => {
            const color = FRUIT_COLORS[type] ?? Colors.fruitColor;
            const has = hasFruitType(type);
            return (
              <TouchableOpacity
                key={type}
                style={[styles.card, { borderColor: color, backgroundColor: has ? color + '22' : Colors.white }]}
                onPress={() => navigation.navigate('SmellFruitDetail', { fruitType: type })}
                activeOpacity={0.8}
              >
                <Text style={[styles.cardLabel, { color }]}>{type.toUpperCase()}</Text>
                {has && <Text style={[styles.checkmark, { color }]}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('SmellMain')}>
          <Text style={styles.backBtnText}>BACK TO AROMAS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
    marginBottom: 24,
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
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  bottomBar: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backBtn: {
    borderWidth: 2,
    borderColor: Colors.fruitColor,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtnText: {
    color: Colors.fruitColor,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
