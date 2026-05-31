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
  { term: 'Acidity', def: 'That mouthwatering, puckery quality like sucking on a lemon. High-acid wines make you salivate; low-acid wines feel rounder and softer.' },
  { term: 'Body', def: 'How heavy the wine feels in your mouth. Try using my milk scale as reference: skim = light, 2% = medium, whole milk = full.' },
  { term: 'Finish', def: 'How long the good flavors linger after you swallow. Ten seconds or more is a long finish (and a sign of quality wine.)' },
  { term: 'Dry', def: 'The opposite of sweet. Little to no residual sugar. A dry wine can still smell and taste very fruity, but that doesn\'t mean it\'s sweet.' },
  { term: 'Terroir', def: 'Essentially translates to \"sense of place:\" the soil, climate, geography and how that shapes what\'s in your glass.' },
  { term: 'Vintage', def: 'The year the grapes were picked. Weather that season directly affects the flavor. The same wine can taste different year to year.' },
];

type TasteSubcategory = {
  label: string;
  text: string;
  border: string;
  labelBg: string;
  contentBg: string;
  textColor: string;
};

type Section = { title: string; content: string; funFact?: string; subcategories?: TasteSubcategory[] };

const TASTE_SUBCATEGORIES: TasteSubcategory[] = [
  {
    label: 'Sweet',
    text: 'Can you detect any sugar in the wine? Try not to confuse it with fruity flavor. A wine can be fruity without any sugar!',
    border: '#4A7AB5',
    labelBg: '#B8D0E8',
    contentBg: '#EDF4FB',
    textColor: '#1E3A5F',
  },
  {
    label: 'Acidity',
    text: 'Does the wine make your mouth water? High acidity will cause excess saliva production, similar to a lemon.',
    border: '#C8940A',
    labelBg: '#F5E478',
    contentBg: '#FFFDE8',
    textColor: '#7A5800',
  },
  {
    label: 'Tannin',
    text: 'Does the wine make your mouth feel dry or grippy? Found primarily in red wine, tannins make it feel like you have cotton balls in your mouth.',
    border: '#9B6510',
    labelBg: '#E8D0A0',
    contentBg: '#FBF4E4',
    textColor: '#5C3A08',
  },
  {
    label: 'Alcohol',
    text: 'Do you notice a warm or hot sensation in your throat? The further back you feel the heat, the more alcoholic the wine is.',
    border: '#9B1C1C',
    labelBg: '#EDAAAA',
    contentBg: '#FDF0F0',
    textColor: '#7A1212',
  },
  {
    label: 'Body',
    text: 'What is the weight of the wine in your mouth? Is it light bodied (like skim milk), medium-bodied (2% milk) or full-bodied (whole milk)?',
    border: '#7B4A9E',
    labelBg: '#D8B8E8',
    contentBg: '#F5EEF9',
    textColor: '#4A2068',
  },
  {
    label: 'Finish',
    text: 'How long do the good flavors of the wine last? The aftertaste of high quality wines can last over 15 seconds.',
    border: '#4A7A2A',
    labelBg: '#B8D8A0',
    contentBg: '#EEF8E6',
    textColor: '#2E5418',
  },
];

const GUIDE_SECTIONS: Section[] = [
  {
    title: '1. LOOK',
    content:
      'Hold your glass at a 45-degree angle over something white and look down through it. Describe the hue (aka the color) and the intensity: is it pale, medium, or deep?',
    funFact:
      'As red wine ages, it gets lighter while white wine gets darker as it ages.',
  },
  {
    title: '2. SMELL',
    content:
      'Start simple: does it smell like fruit? If yes, can you narrow it down to a type of fruit? If you get stuck try choosing two very different aromas and decide which one is smells more like: Cherry or plum? Lemon or pineapple? Does it smell like something beyond fruit? Think about walking by an herb garden or what is in your space cabient. Use the list of aromas in this app as a starting point and then get creative.',
    funFact:
      'Most of what we think of as "taste" actually comes from the nose. Try plugging your nose and taking a sip. You\'ll be amazed at how little flavor you get.',
  },
  {
    title: '3. TASTE',
    content:
      'Take a medium sip and "chew" on it (slowly swish the wine around your mouth.) Your nose did the work of picking out flavors so now you\'re focusing on the structure of the wine.',
    subcategories: TASTE_SUBCATEGORIES,
    funFact:
      'Want to feel like an expert? After taking a sip of wine, breathe in slowly through your mouth (like slowly slurping a noodle or whistling backwards). This will help open up the wine and release more flavor.',
  },
  {
    title: '4. THINK',
    content:
      'This is the most important step and the one most people skip. Did you like the wine? Why or why not? Try to pick out 2-3 specific components of the wine that led to your decision.',
    funFact:
      'Once you figure out what you like and don\'t like in a wine, you can walk into any wine shop, wine bar, or restaurant and find great wines simply by sharing what you like and asking for a recommendation.',
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
                {sec.subcategories && (
                  <View style={styles.tasteGrid}>
                    {sec.subcategories.map((sub) => (
                      <View key={sub.label} style={[styles.tasteRow, { borderColor: sub.border }]}>
                        <View style={[styles.tasteLabelCell, { backgroundColor: sub.labelBg, borderRightColor: sub.border }]}>
                          <Text style={[styles.tasteLabelText, { color: sub.border }]}>{sub.label}</Text>
                        </View>
                        <View style={[styles.tasteContentCell, { backgroundColor: sub.contentBg }]}>
                          <Text style={[styles.tasteContentText, { color: sub.textColor }]}>{sub.text}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
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
          <Text style={styles.cheatLine}>Dry → Off-Dry → Semi-Sweet → Sweet → Very Sweet</Text>

          <Text style={styles.cheatSubtitle}>Acidity / Tannin / Alcohol</Text>
          <Text style={styles.cheatLine}>Low → Medium(-) → Medium → Medium(+) → High</Text>

          <Text style={styles.cheatSubtitle}>Body</Text>
          <Text style={styles.cheatLine}>Light → Medium(-) → Medium → Medium(+) → Full</Text>

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
  tasteGrid: {
    gap: 8,
    marginBottom: 12,
  },
  tasteRow: {
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tasteLabelCell: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRightWidth: 2,
  },
  tasteLabelText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
  },
  tasteContentCell: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  tasteContentText: {
    fontSize: 13,
    lineHeight: 19,
  },
});
