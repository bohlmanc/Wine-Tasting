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
import AppHeader from '../components/AppHeader';
import InfoModal from '../components/InfoModal';
import { Colors } from '../constants/colors';

const STEP_COLORS = ['#9B1C31', '#4A6FA5', '#2E7D32', '#7B4F9E', Colors.primary, Colors.primary];

const DEFINITIONS = [
  { term: 'Tannin', def: 'Drying/grippy sensation from grape skins and oak; more prominent in reds.' },
  { term: 'Acidity', def: 'Tartness and freshness; makes your mouth water.' },
  { term: 'Body', def: 'Weight of the wine on your palate; light to full.' },
  { term: 'Finish', def: 'How long flavors persist after swallowing.' },
  { term: 'Dry', def: 'Little to no residual sugar; not sweet.' },
  { term: 'Terroir', def: 'How the environment (soil, climate, geography) shapes wine character.' },
  { term: 'Vintage', def: 'The year the grapes were harvested.' },
];

type Section = { title: string; content: string; funFact?: string };

const GUIDE_SECTIONS: Section[] = [
  {
    title: '1. LOOK',
    content:
      'Tilt your glass against a white background and observe the color. Note the hue (ruby, garnet, gold, straw) and the intensity (pale, medium, deep). Clarity ranges from crystal clear to hazy or opaque.',
    funFact:
      'The color of red wine lightens with age as pigments precipitate out. A brick-red rim on a red wine suggests it has been aged.',
  },
  {
    title: '2. SMELL',
    content:
      'Swirl the glass to release aromas, then take a short sniff. Try to identify primary aromas (fruit, flowers, herbs from the grape), secondary aromas (from fermentation), and tertiary aromas (from aging in oak or bottle).',
    funFact:
      'Humans can detect over 10,000 different scents. Our sense of smell accounts for roughly 80% of what we perceive as "taste".',
  },
  {
    title: '3. TASTE',
    content:
      'Take a sip and let it coat your whole palate. Assess sweetness (residual sugar), acidity (freshness, mouthwatering quality), tannin (drying grip, from grape skins and oak), alcohol (warmth), body (weight), and finish (how long flavors linger).',
    funFact:
      'A "long finish" of 60+ seconds is a hallmark of great wines. The finish is often the best indicator of quality.',
  },
  {
    title: '4. THINK',
    content:
      'Synthesize your observations. Is the wine balanced? Are all elements in harmony? Consider the quality level and note whether you would drink it again. Make a guess at the grape variety, region, and vintage.',
    funFact:
      'Professional sommeliers in blind tastings identify grape variety correctly about 50–60% of the time — proving wine identification is genuinely hard!',
  },
  {
    title: 'WINE STYLES',
    content:
      'Red wines tend to be bold with tannin. Whites are more delicate with higher acidity. Rosé combines both styles. Sparkling wines have carbon dioxide bubbles from secondary fermentation — either in the bottle (Champagne method) or in a tank (Charmat method).',
    funFact:
      'Rosé wine is not a blend of red and white wine (in most cases). It gets its pink color by leaving red grape skins in brief contact with the juice.',
  },
  {
    title: 'FOOD PAIRING',
    content:
      'Match weight with weight: light wines with light dishes, full-bodied wines with rich foods. Acidity cuts through fat and cream. Tannins complement protein-rich meats. Sweet wines pair well with desserts that are slightly less sweet than the wine.',
    funFact:
      'The classic rule "red with meat, white with fish" is a simplification. A full-bodied white Burgundy pairs beautifully with lobster, and a light Pinot Noir works with salmon.',
  },
];

export default function WineTastingGuideScreen() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Wine Tasting Guide" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Wine Tasting Guide</Text>
        <Text style={styles.intro}>
          Use this guide to deepen your wine knowledge. Tap each section to expand.
        </Text>

        {GUIDE_SECTIONS.map((sec, i) => (
          <TouchableOpacity
            key={sec.title}
            style={[styles.accordion, expanded === i && styles.accordionExpanded]}
            onPress={() => setExpanded(expanded === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={styles.accordionHeader}>
              <View style={[styles.accordionAccent, { backgroundColor: STEP_COLORS[i] }]} />
              <Text style={styles.accordionTitle}>{sec.title}</Text>
              <Text style={styles.accordionChevron}>{expanded === i ? '▲' : '▼'}</Text>
            </View>
            {expanded === i && (
              <View style={styles.accordionBody}>
                <Text style={styles.bodyText}>{sec.content}</Text>
                {sec.funFact && (
                  <View style={styles.funFactBox}>
                    <Text style={styles.funFactLabel}>FUN FACT:</Text>
                    <Text style={styles.funFactText}>{sec.funFact}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Definitions */}
        <View style={styles.cheatSheet}>
          <Text style={styles.cheatTitle}>Definitions</Text>
          {DEFINITIONS.map(({ term, def }) => (
            <View key={term} style={styles.defRow}>
              <Text style={styles.defTerm}>{term}: </Text>
              <Text style={styles.defText}>{def}</Text>
            </View>
          ))}

          <Text style={[styles.cheatSubtitle, { marginTop: 16 }]}>Sweetness Levels</Text>
          <Text style={styles.cheatLine}>Bone Dry → Dry → Off-Dry → Semi-Sweet → Sweet → Very Sweet</Text>

          <Text style={styles.cheatSubtitle}>Acidity / Tannin / Body / Alcohol</Text>
          <Text style={styles.cheatLine}>Low → Medium(-) → Medium → Medium(+) → High</Text>

          <Text style={styles.cheatSubtitle}>Finish Length</Text>
          <Text style={styles.cheatLine}>Short → Medium(-) → Medium → Medium(+) → Long</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  intro: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  accordion: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  accordionExpanded: {
    borderColor: Colors.btnGuide,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    gap: 10,
  },
  accordionAccent: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    flex: 1,
  },
  accordionChevron: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  accordionBody: {
    padding: 16,
    paddingTop: 12,
  },
  bodyText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  funFactBox: {
    backgroundColor: Colors.infoBlueLight,
    borderRadius: 8,
    padding: 12,
  },
  funFactLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.infoBlue,
    textDecorationLine: 'underline',
    marginBottom: 4,
    letterSpacing: 1,
  },
  funFactText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  cheatSheet: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cheatTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  cheatSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
    marginTop: 8,
  },
  cheatLine: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  defRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  defTerm: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  defText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    flex: 1,
  },
});
