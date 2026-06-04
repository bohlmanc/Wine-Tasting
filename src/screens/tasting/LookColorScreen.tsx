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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppHeader from '../../components/AppHeader';
import InfoModal from '../../components/InfoModal';
import { Colors } from '../../constants/colors';
import { useWineTasting } from '../../context/WineTastingContext';
import {
  RED_WINE_COLORS,
  WHITE_WINE_COLORS,
  ROSE_WINE_COLORS,
  SPARKLING_WINE_COLORS,
  ORANGE_WINE_COLORS,
  DESSERT_WINE_COLORS,
} from '../../constants/wineData';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const COLOR_INFO: Record<string, string> = {
  red: 'Red wine color tells you a lot. Bright ruby with a purple edge? Likely young, maybe Malbec. A brownish, garnet rim? That wine has some age on it. Tilt your glass over something white to really see the hue.',
  white: 'White wines range from nearly watery to a rich, deep gold. Pale straw usually means young and unoaked. Deeper gold? It\'s either been aged, seen some oak, or both.',
  rose: 'The color tells you how long the grape skins were in contact with the juice. Pale, barely-there blush = brief contact, elegant style. Deep salmon = longer contact, bolder flavors.',
  sparkling: 'Sparkling wines tend to be pale — and that\'s totally normal. A deeper golden color usually means more time on the lees (spent yeast) or some oak influence.',
  orange: 'Orange wine is white wine made like a red — the skins stay in the juice for an extended time, giving that amber or copper color. The longer the contact, the deeper and more tannic the wine.',
  dessert: 'Dessert wines are the most color-diverse category — pale gold to deep mahogany. A late-harvest Riesling looks light; a fortified Port is dark and intense. Both are gorgeous.',
};

export default function LookColorScreen() {
  const navigation = useNavigation<Nav>();
  const { tasting, update } = useWineTasting();
  const [selected, setSelected] = useState<string>(tasting.color ?? '');

  const style = tasting.style ?? 'red';
  const colorOptions =
    style === 'red' ? RED_WINE_COLORS
    : style === 'white' ? WHITE_WINE_COLORS
    : style === 'rose' ? ROSE_WINE_COLORS
    : style === 'sparkling' ? SPARKLING_WINE_COLORS
    : style === 'orange' ? ORANGE_WINE_COLORS
    : DESSERT_WINE_COLORS;

  const handleNext = () => {
    const found = colorOptions.find(c => c.name === selected);
    update({ color: selected });
    navigation.navigate('LookDetails', {
      color: selected ?? "",
      colorHex: found?.hex ?? '#888',
      colorSubtitle: found?.subtitle ?? '',
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Step 1: Look" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <InfoModal
            title="Step 1: Look"
            body={COLOR_INFO[style] ?? ''}
          />
        </View>
        <Text style={styles.heading}>What Does Your Wine{'\n'}Look Like?</Text>

        <View style={styles.colorsRow}>
          {colorOptions.map(c => (
            <TouchableOpacity
              key={c.name}
              style={styles.colorItem}
              onPress={() => setSelected(c.name)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.colorCircleWrapper,
                  selected === c.name && styles.colorCircleWrapperSelected,
                ]}
              >
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c.hex },
                  ]}
                />
              </View>
              <Text style={styles.colorName}>{c.name.toUpperCase()}</Text>
              <Text style={styles.colorSubtitle}>{c.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.nextBar}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
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
    marginBottom: 32,
    color: Colors.text,
  },
  colorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
  },
  colorItem: {
    alignItems: 'center',
    width: 130,
  },
  colorCircleWrapper: {
    borderRadius: 20,
    padding: 6,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: Colors.background,
  },
  colorCircleWrapperSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  colorCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: '#33333322',
  },
  colorName: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 2,
  },
  colorSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
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
