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
import GaugeDial from '../../components/GaugeDial';
import { Colors } from '../../constants/colors';
import { useWineTasting } from '../../context/WineTastingContext';
import { useTastingRoom } from '../../context/TastingRoomContext';
import {
  SWEETNESS_STEPS,
  ACIDITY_STEPS,
  TANNIN_STEPS,
  ALCOHOL_STEPS,
  BODY_STEPS,
  FINISH_STEPS,
} from '../../constants/wineData';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const INFO: Record<string, string> = {
  Sweetness: 'How sweet does it taste? Most wines are dry — the yeast ate up all the sugar during fermentation. Even a very fruity wine might have zero sweetness, which surprises a lot of people.',
  Acidity: 'High acidity makes your mouth water and gives the wine freshness and vibrancy. Low acidity feels rounder and softer. Quick test: after swallowing, would you have drooled if your mouth were open?',
  Tannin: 'That dry, cotton-ball sensation in red wine from grape skins and oak. Tannin and acidity are opposites: one makes you salivate, the other dries your mouth right out.',
  Alcohol: 'Feel warmth at the back of your throat? That\'s the alcohol — think of it as a very mild version of a tequila shot. Higher alcohol = more warmth. You can always verify on the label.',
  Body: 'How heavy does the wine feel in your mouth? I like the milk scale: skim milk = light-bodied, 2% = medium-bodied, whole milk = full-bodied.',
  Finish: 'How long do the good flavors linger after you swallow? Ten seconds or more is a long finish — one of the clearest signs of a quality wine.',
};

export default function TasteScreen() {
  const navigation = useNavigation<Nav>();
  const { tasting, update } = useWineTasting();
  const { broadcastTaste } = useTastingRoom();

  const isRedWine = tasting.style === 'red';
  const hasTannin = isRedWine;

  const [sweetnessIdx, setSweetnessIdx] = useState(
    tasting.sweetness ? SWEETNESS_STEPS.indexOf(tasting.sweetness) : 2
  );
  const [acidityIdx, setAcidityIdx] = useState(
    tasting.acidity ? ACIDITY_STEPS.indexOf(tasting.acidity) : 2
  );
  const [tanninIdx, setTanninIdx] = useState(
    tasting.tannin ? TANNIN_STEPS.indexOf(tasting.tannin) : 2
  );
  const [alcoholIdx, setAlcoholIdx] = useState(
    tasting.alcohol ? ALCOHOL_STEPS.indexOf(tasting.alcohol) : 2
  );
  const [bodyIdx, setBodyIdx] = useState(
    tasting.body ? BODY_STEPS.indexOf(tasting.body) : 2
  );
  const [finishIdx, setFinishIdx] = useState(
    tasting.finish ? FINISH_STEPS.indexOf(tasting.finish) : 2
  );

  const activeFlightName = tasting.customFlightId ? tasting.customFlightName : null;

  const handleNext = () => {
    update({
      sweetness: SWEETNESS_STEPS[sweetnessIdx],
      acidity: ACIDITY_STEPS[acidityIdx],
      tannin: hasTannin ? TANNIN_STEPS[tanninIdx] : '',
      alcohol: ALCOHOL_STEPS[alcoholIdx],
      body: BODY_STEPS[bodyIdx],
      finish: FINISH_STEPS[finishIdx],
    });
    broadcastTaste(
      SWEETNESS_STEPS[sweetnessIdx],
      ACIDITY_STEPS[acidityIdx],
      hasTannin ? TANNIN_STEPS[tanninIdx] : '',
      ALCOHOL_STEPS[alcoholIdx],
      BODY_STEPS[bodyIdx],
      FINISH_STEPS[finishIdx],
    );
    navigation.navigate('Think');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Step 3: Taste" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <InfoModal
            title="Step 3: Taste"
            body="Take a medium sip and chew on it — that's just a slow-motion swish around your mouth. Move the wine to different spots before swallowing. Tap each characteristic to learn what you're looking for."
          />
        </View>
        <Text style={styles.heading}>How Does Your Wine{'\n'}Taste?</Text>

        {activeFlightName && (
          <View style={styles.activeFlightBanner}>
            <Text style={styles.activeFlightLabel}>Flight</Text>
            <Text style={styles.activeFlightName}>{activeFlightName}</Text>
          </View>
        )}

        <GaugeSection
          label="Sweetness"
          steps={SWEETNESS_STEPS}
          index={sweetnessIdx}
          onChange={setSweetnessIdx}
        />

        <GaugeSection
          label="Acidity"
          steps={ACIDITY_STEPS}
          index={acidityIdx}
          onChange={setAcidityIdx}
        />

        {hasTannin && (
          <GaugeSection
            label="Tannin"
            steps={TANNIN_STEPS}
            index={tanninIdx}
            onChange={setTanninIdx}
          />
        )}

        <GaugeSection
          label="Alcohol"
          steps={ALCOHOL_STEPS}
          index={alcoholIdx}
          onChange={setAlcoholIdx}
        />

        <GaugeSection
          label="Body"
          steps={BODY_STEPS}
          index={bodyIdx}
          onChange={setBodyIdx}
        />

        <GaugeSection
          label="Finish"
          steps={FINISH_STEPS}
          index={finishIdx}
          onChange={setFinishIdx}
        />

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.nextBar}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>NEXT &gt;</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function GaugeSection({
  label,
  steps,
  index,
  onChange,
}: {
  label: string;
  steps: string[];
  index: number;
  onChange: (i: number) => void;
}) {
  return (
    <View style={styles.gaugeSection}>
      <View style={styles.gaugeLabelRow}>
        <Text style={styles.gaugeLabel}>{label}</Text>
        <InfoModal
          title={label}
          body={INFO[label] ?? ''}
        />
      </View>
      <GaugeDial steps={steps} currentIndex={index} onChange={onChange} />
    </View>
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

  activeFlightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  activeFlightLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeFlightName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
    flex: 1,
  },

  gaugeSection: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gaugeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gaugeLabel: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    textDecorationLine: 'underline',
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
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  nextBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
