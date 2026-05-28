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
import { Colors } from '../constants/colors';

const STEP_COLORS = ['#9B1C31', '#4A6FA5', '#2E7D32', '#7B4F9E', Colors.primary, Colors.primary];

const DEFINITIONS = [
  { term: 'Tannin', def: 'That dry, cotton-ball sensation in your mouth from grape skins and oak; more prominent in reds.' },
  { term: 'Acidity', def: 'That mouthwatering, puckery quality — think squeezing a lemon. High-acid wines make you salivate; low-acid wines feel rounder and softer.' },
  { term: 'Body', def: 'How heavy the wine feels in your mouth. Milk scale: skim = light, 2% = medium, whole milk = full.' },
  { term: 'Finish', def: 'How long the good flavors linger after you swallow. Ten seconds or more is a long finish — a sign of quality.' },
  { term: 'Dry', def: 'Little to no residual sugar — not sweet. Though a dry wine can still smell and taste very fruity, which throws people off.' },
  { term: 'Terroir', def: 'The full picture of where a wine came from — soil, climate, geography — and how that shapes what\'s in your glass.' },
  { term: 'Vintage', def: 'The year the grapes were picked. Weather that season directly affects the flavor — the same wine can taste different year to year.' },
];

type Section = { title: string; content: string; funFact?: string };

const GUIDE_SECTIONS: Section[] = [
  {
    title: '1. LOOK',
    content:
      'Hold your glass at a 45-degree angle over something white and look down through it. Check the hue (ruby, garnet, straw, gold) and the intensity — is it pale and almost watery, or deep and rich? These clues can tell you a lot about the grape and the age of the wine.',
    funFact:
      'As red wine ages, it gets lighter — and white wine gets darker. Both trend toward amber or brown over time. Bright, vivid red = likely young. A pale, brick-toned rim = some age on it.',
  },
  {
    title: '2. SMELL',
    content:
      'Give your glass a good swirl, then get your nose all the way in there. Start simple: does it smell like fruit? From there, narrow it down — cherry or plum? Lemon or pineapple? You\'re building your aroma vocabulary one step at a time, and there are no wrong answers.',
    funFact:
      'Most of what we think of as "taste" actually comes from the nose. Try plugging yours and taking a sip — you\'ll be amazed at how little flavor you get. Smell is everything.',
  },
  {
    title: '3. TASTE',
    content:
      'Take a medium sip and chew on it — just a slow-motion swish around your mouth. You\'re assessing: sweetness, acidity (how much it makes you salivate), body (weight — think skim vs. whole milk), tannin (that drying feeling in reds), and finish (how long flavors linger after you swallow).',
    funFact:
      'If flavors last 10 seconds or more after you swallow, that\'s a long finish — one of the best signs of a quality wine. The longer, the better.',
  },
  {
    title: '4. THINK',
    content:
      'This is the most important step — and the one most people skip. Did you like it? Why or why not? Once you know what you love, you can walk into any wine shop or restaurant and ask for exactly that. These notes become your personal guide.',
    funFact:
      'Pro sommeliers identify grape varieties correctly only about 50–60% of the time in blind tastings. If you\'re not sure what\'s in your glass, you\'re in very good company — the goal is to start noticing, not to be right.',
  },
  {
    title: 'WINE STYLES',
    content:
      'Reds get their color and tannins from skin contact with the grapes. Whites skip the skin contact — that\'s why they\'re lighter and more acidic. Rosé comes from brief skin contact with red grapes, not a blend. Sparkling wines get their bubbles from a secondary fermentation that traps carbon dioxide in the bottle.',
    funFact:
      'One of the biggest wine myths: rosé is made by blending red and white. Not true! It gets its gorgeous pink color from a brief period of skin contact. The longer the skins stay in, the deeper the color.',
  },
  {
    title: 'FOOD PAIRING',
    content:
      'The easiest rule: match the weight. Light wines with light dishes, full-bodied wines with rich foods. High-acid wines are amazing with creamy or fatty dishes — that acidity cuts right through it. And a big tannic red? Pair it with protein, which is why steak and Cabernet is such a classic.',
    funFact:
      '"Red with meat, white with fish" is a great starting point, but don\'t let it box you in. A full-bodied Chardonnay is incredible with lobster, and a light Pinot Noir pairs beautifully with salmon. Trust your palate first.',
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
          Everything you need to taste wine with confidence. Tap each section to expand.
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
