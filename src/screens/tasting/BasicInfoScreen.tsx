import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../navigation/types';
import AppHeader from '../../components/AppHeader';
import InfoModal from '../../components/InfoModal';
import { Colors } from '../../constants/colors';
import { WINE_COUNTRIES, GRAPE_VARIETIES } from '../../constants/wineData';
import { useWineTasting } from '../../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function PickerModal({
  visible,
  items,
  onSelect,
  onClose,
  title,
}: {
  visible: boolean;
  items: string[];
  onSelect: (item: string) => void;
  onClose: () => void;
  title: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.pickerClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={items}
            keyExtractor={i => i}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.pickerItem} onPress={() => { onSelect(item); onClose(); }}>
                <Text style={styles.pickerItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : 1 + Math.min(row[j - 1], row[j], prev);
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

function GrapePickerModal({
  visible,
  selected,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  selected: string[];
  onConfirm: (grapes: string[]) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<string[]>(selected);

  useEffect(() => {
    if (visible) {
      setPending([...selected]);
      setSearch('');
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (grape: string) => {
    setPending(prev =>
      prev.includes(grape) ? prev.filter(g => g !== grape) : [...prev, grape]
    );
  };

  const query = search.trim().toLowerCase();
  let displayData = GRAPE_VARIETIES as string[];
  let showFuzzyHint = false;

  if (query.length > 0) {
    const exact = GRAPE_VARIETIES.filter(g => g.toLowerCase().includes(query));
    if (exact.length > 0) {
      displayData = exact;
    } else {
      const threshold = Math.min(3, Math.floor(query.length / 3) + 1);
      const fuzzy = GRAPE_VARIETIES.filter(g =>
        g.toLowerCase().split(/[\s/]+/).some(word => {
          if (Math.abs(word.length - query.length) > 3) return false;
          return levenshtein(query, word) <= threshold;
        })
      );
      displayData = fuzzy.length > 0 ? fuzzy : GRAPE_VARIETIES;
      showFuzzyHint = true;
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Grapes</Text>
            <TouchableOpacity onPress={() => { onConfirm(pending); onClose(); }}>
              <Text style={styles.pickerClose}>
                Done{pending.length > 0 ? ` (${pending.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grapeSearchWrap}>
            <TextInput
              style={styles.grapeSearchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search grapes..."
              placeholderTextColor="#aaa"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.grapeSearchClear}>
                <Text style={styles.grapeSearchClearText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          {showFuzzyHint && (
            <Text style={styles.fuzzyHint}>No exact match — showing similar options</Text>
          )}
          <FlatList
            data={displayData}
            keyExtractor={i => i}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = pending.includes(item);
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, isSelected && styles.grapeItemSelected]}
                  onPress={() => toggle(item)}
                >
                  <Text style={[styles.pickerItemText, isSelected && styles.grapeItemTextSelected]}>
                    {item}
                  </Text>
                  {isSelected && <Text style={styles.grapeCheckmark}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function BasicInfoScreen() {
  const navigation = useNavigation<Nav>();
  const { tasting, update } = useWineTasting();
  const isFull = tasting.tastingType === 'full';

  const [dateTasted, setDateTasted] = useState(tasting.dateTasted ?? '');
  const [producer, setProducer] = useState(tasting.producer ?? '');
  const [name, setName] = useState(tasting.name ?? '');
  const [country, setCountry] = useState(tasting.country ?? '');
  const [region, setRegion] = useState(tasting.region ?? '');
  const [subregion, setSubregion] = useState(tasting.subregion ?? '');
  const [vineyard, setVineyard] = useState(tasting.vineyard ?? '');
  const [grapes, setGrapes] = useState<string[]>(tasting.grapes ?? []);
  const [importer, setImporter] = useState(tasting.importer ?? '');
  const [vintage, setVintage] = useState(tasting.vintage ?? '');
  const [abv, setAbv] = useState(tasting.abv ?? '');
  const [photo, setPhoto] = useState<string | null>(tasting.photo ?? null);

  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [grapePickerOpen, setGrapePickerOpen] = useState(false);

  // Re-sync local state when returning from ScanLabelScreen
  useFocusEffect(
    useCallback(() => {
      setProducer(tasting.producer ?? '');
      setName(tasting.name ?? '');
      setCountry(tasting.country ?? '');
      setGrapes(tasting.grapes ?? []);
      setImporter(tasting.importer ?? '');
      setVintage(tasting.vintage ?? '');
      setAbv(tasting.abv ?? '');
    }, [tasting]),
  );

  const removeGrape = (grape: string) => setGrapes(prev => prev.filter(g => g !== grape));

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleNext = () => {
    update({ dateTasted, producer, name, country, region, subregion, vineyard, grapes, importer, vintage, abv, photo });
    if (isFull) {
      navigation.navigate('WineStyle');
    } else {
      navigation.navigate('Think');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Basic Information" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.scanBanner} onPress={() => navigation.navigate('ScanLabel')}>
          <Text style={styles.scanBannerIcon}>📷</Text>
          <View style={styles.scanBannerText}>
            <Text style={styles.scanBannerTitle}>Scan Wine Label</Text>
            <Text style={styles.scanBannerSub}>Auto-fill fields from front &amp; back labels</Text>
          </View>
          <Text style={styles.scanBannerArrow}>›</Text>
        </TouchableOpacity>

        <Row label="Date Tasted:" noInfo>
          <TextInput
            style={[styles.input, styles.inputShort]}
            value={dateTasted}
            onChangeText={setDateTasted}
            placeholder="MM/DD/YYYY"
          />
        </Row>

        <Row label="Producer:" info={<InfoModal title="Producer" body="The winery or estate that produced the wine." />}>
          <TextInput style={styles.input} value={producer} onChangeText={setProducer} placeholder="" />
        </Row>

        <Row label="Name:" info={<InfoModal title="Wine Name" body="The specific wine name or cuvée label on the bottle." />}>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="" />
        </Row>

        <Row label="Country:" info={<InfoModal title="Country" body="The country where the grapes were grown and the wine was produced." />}>
          <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setCountryPickerOpen(true)}>
            <Text style={country ? styles.dropdownValue : styles.dropdownPlaceholder}>{country || ''}</Text>
            <Text style={styles.chevron}>∨</Text>
          </TouchableOpacity>
        </Row>

        {isFull && (
          <>
            <Row label="Region:" noInfo>
              <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="" />
            </Row>
            <Row label="Subregion:" noInfo>
              <TextInput style={styles.input} value={subregion} onChangeText={setSubregion} placeholder="" />
            </Row>
            <Row label="Vineyard:" noInfo>
              <TextInput style={styles.input} value={vineyard} onChangeText={setVineyard} placeholder="" />
            </Row>
          </>
        )}

        <Row label="Grape(s):" info={<InfoModal title="Grape Varieties" body="The grape variety or varieties used to make this wine. You can add multiple grapes." />}>
          <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setGrapePickerOpen(true)}>
            <Text style={grapes.length > 0 ? styles.dropdownValue : styles.dropdownPlaceholder}>
              {grapes.length > 0 ? `${grapes.length} selected` : 'Tap to select'}
            </Text>
            <Text style={styles.chevron}>∨</Text>
          </TouchableOpacity>
          {grapes.length > 0 && (
            <View style={styles.grapeTagsRow}>
              {grapes.map(g => (
                <TouchableOpacity key={g} style={styles.grapeTag} onPress={() => removeGrape(g)}>
                  <Text style={styles.grapeTagText}>{g} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Row>

        <Row label="Importer:" info={<InfoModal title="Importer" body="The company that imported this wine into your country. Often found on the back label." />}>
          <TextInput style={styles.input} value={importer} onChangeText={setImporter} placeholder="" />
        </Row>

        <Row label="Vintage:" info={<InfoModal title="Vintage" body="The year the grapes were harvested. Found prominently on the label (e.g., 2019)." />}>
          <TextInput
            style={[styles.input, styles.inputShort]}
            value={vintage}
            onChangeText={setVintage}
            placeholder=""
            keyboardType="numeric"
            maxLength={4}
          />
        </Row>

        <Row label="ABV:" info={<InfoModal title="Alcohol by Volume" body="The alcohol percentage printed on the label (e.g., 13.5%). This is the actual bottled content, not a tasting impression." />}>
          <TextInput
            style={[styles.input, styles.inputShort]}
            value={abv}
            onChangeText={setAbv}
            placeholder="e.g. 13.5%"
            keyboardType="decimal-pad"
          />
        </Row>

        <View style={styles.photoRow}>
          <Text style={styles.photoLabel}>Add Photo:</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickPhoto}>
            <Text style={styles.uploadBtnText}>{photo ? 'Change Photo' : 'Upload Photo'}</Text>
          </TouchableOpacity>
          {photo && <Image source={{ uri: photo }} style={styles.photoThumb} />}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.nextBar}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>NEXT &gt;</Text>
        </TouchableOpacity>
      </View>

      <PickerModal
        visible={countryPickerOpen}
        items={WINE_COUNTRIES}
        onSelect={setCountry}
        onClose={() => setCountryPickerOpen(false)}
        title="Select Country"
      />
      <GrapePickerModal
        visible={grapePickerOpen}
        selected={grapes}
        onConfirm={setGrapes}
        onClose={() => setGrapePickerOpen(false)}
      />
    </SafeAreaView>
  );
}

function Row({
  label,
  info,
  noInfo,
  children,
}: {
  label: string;
  info?: React.ReactNode;
  noInfo?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.labelArea}>
        {!noInfo && (info ?? <View style={{ width: 26 }} />)}
        {noInfo && <View style={{ width: 26 }} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.inputArea}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20, paddingTop: 16 },

  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  scanBannerIcon: { fontSize: 24 },
  scanBannerText: { flex: 1 },
  scanBannerTitle: { fontSize: 15, fontWeight: '700', color: Colors.primaryDark },
  scanBannerSub: { fontSize: 12, color: Colors.primaryDark, opacity: 0.8, marginTop: 1 },
  scanBannerArrow: { fontSize: 22, color: Colors.primaryDark, fontWeight: '300' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  labelArea: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
    gap: 6,
    paddingTop: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  inputArea: {
    flex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  inputShort: {
    width: 130,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    flex: 1,
  },
  dropdownValue: { flex: 1, fontSize: 14, color: Colors.text },
  dropdownPlaceholder: { flex: 1, fontSize: 14, color: '#aaa' },
  chevron: { fontSize: 14, color: Colors.text },
  grapeTagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  grapeSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  grapeSearchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 6,
  },
  grapeSearchClear: { paddingHorizontal: 6, paddingVertical: 4 },
  grapeSearchClearText: { fontSize: 20, color: '#aaa', lineHeight: 22 },
  fuzzyHint: {
    fontSize: 12,
    color: '#b07800',
    fontStyle: 'italic',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#fffbe6',
  },
  grapeItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  grapeItemTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  grapeCheckmark: {
    fontSize: 16,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  grapeTag: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  grapeTagText: { fontSize: 12, color: Colors.primaryDark, fontWeight: '600' },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  photoLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  uploadBtn: {
    backgroundColor: '#888',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  uploadBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  photoThumb: { width: 50, height: 50, borderRadius: 6 },
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
  nextBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  pickerClose: { fontSize: 17, color: Colors.btnView, fontWeight: '600' },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  pickerItemText: { fontSize: 16, color: Colors.text },
});
