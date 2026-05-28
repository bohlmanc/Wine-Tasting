import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
  Alert,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, Camera } from 'expo-camera';
import { RootStackParamList } from '../../navigation/types';
import AppHeader from '../../components/AppHeader';
import InfoModal from '../../components/InfoModal';
import { Colors } from '../../constants/colors';
import { WINE_COUNTRIES, GRAPE_VARIETIES, getRegions, getSubregions } from '../../constants/wineData';
import { useWineTasting } from '../../context/WineTastingContext';
import { saveWine } from '../../storage/wineStorage';
import { loadCustomGrapes, saveCustomGrape, deleteCustomGrape } from '../../storage/customGrapesStorage';
import { getPendingWines, savePendingWines } from '../../storage/flightPendingWineStorage';
import { Wine } from '../../types';

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

function RegionPickerModal({
  visible,
  country,
  onSelect,
  onClose,
}: {
  visible: boolean;
  country: string;
  onSelect: (region: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const regions = getRegions(country);
  const trimmed = query.trim();
  const filtered = trimmed
    ? regions.filter(r => r.toLowerCase().includes(trimmed.toLowerCase()))
    : regions;
  const canUseCustom = trimmed.length > 0 && !regions.some(r => r.toLowerCase() === trimmed.toLowerCase());

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Region</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.pickerClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grapeSearchWrap}>
            <TextInput
              style={styles.grapeSearchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search or type a region..."
              placeholderTextColor="#aaa"
              autoCorrect={false}
              autoCapitalize="words"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.grapeSearchClear}>
                <Text style={styles.grapeSearchClearText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          {canUseCustom && (
            <TouchableOpacity
              style={styles.addCustomGrape}
              onPress={() => { onSelect(trimmed); onClose(); }}
            >
              <Text style={styles.addCustomGrapeText}>+ Use "{trimmed}" as region</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={filtered}
            keyExtractor={i => i}
            keyboardShouldPersistTaps="handled"
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

function SubregionPickerModal({
  visible,
  country,
  region,
  onSelect,
  onClose,
}: {
  visible: boolean;
  country: string;
  region: string;
  onSelect: (subregion: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const subregions = getSubregions(country, region);
  const trimmed = query.trim();
  const filtered = trimmed
    ? subregions.filter(s => s.toLowerCase().includes(trimmed.toLowerCase()))
    : subregions;
  const canUseCustom = trimmed.length > 0 && !subregions.some(s => s.toLowerCase() === trimmed.toLowerCase());

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Subregion</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.pickerClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grapeSearchWrap}>
            <TextInput
              style={styles.grapeSearchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search or type a subregion..."
              placeholderTextColor="#aaa"
              autoCorrect={false}
              autoCapitalize="words"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.grapeSearchClear}>
                <Text style={styles.grapeSearchClearText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          {canUseCustom && (
            <TouchableOpacity
              style={styles.addCustomGrape}
              onPress={() => { onSelect(trimmed); onClose(); }}
            >
              <Text style={styles.addCustomGrapeText}>+ Use "{trimmed}" as subregion</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={filtered}
            keyExtractor={i => i}
            keyboardShouldPersistTaps="handled"
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
  const [customGrapes, setCustomGrapes] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setPending([...selected]);
      setSearch('');
      loadCustomGrapes().then(setCustomGrapes);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const allGrapes = useMemo(() => {
    const extras = customGrapes.filter(g => !GRAPE_VARIETIES.includes(g));
    // Include any selected grapes that were deleted from the custom list so they remain visible/deselectable
    const orphaned = pending.filter(g => !GRAPE_VARIETIES.includes(g) && !extras.includes(g));
    return [...GRAPE_VARIETIES, ...extras, ...orphaned].sort((a, b) => a.localeCompare(b));
  }, [customGrapes, pending]);

  const toggle = (grape: string) => {
    setPending(prev =>
      prev.includes(grape) ? prev.filter(g => g !== grape) : [...prev, grape]
    );
  };

  const handleAddCustom = async () => {
    const grape = search.trim();
    if (!grape) return;
    await saveCustomGrape(grape);
    setCustomGrapes(prev => prev.includes(grape) ? prev : [...prev, grape]);
    setPending(prev => prev.includes(grape) ? prev : [...prev, grape]);
    setSearch('');
  };

  const handleDeleteCustom = async (grape: string) => {
    await deleteCustomGrape(grape);
    setCustomGrapes(prev => prev.filter(g => g !== grape));
    setPending(prev => prev.filter(g => g !== grape));
  };

  const query = search.trim().toLowerCase();
  let displayData = allGrapes;
  let showFuzzyHint = false;

  if (query.length > 0) {
    const exact = allGrapes.filter(g => g.toLowerCase().includes(query));
    if (exact.length > 0) {
      displayData = exact;
    } else {
      const threshold = Math.min(3, Math.floor(query.length / 3) + 1);
      const fuzzy = allGrapes.filter(g =>
        g.toLowerCase().split(/[\s/]+/).some(word => {
          if (Math.abs(word.length - query.length) > 3) return false;
          return levenshtein(query, word) <= threshold;
        })
      );
      displayData = fuzzy.length > 0 ? fuzzy : allGrapes;
      showFuzzyHint = true;
    }
  }

  const canAddCustom = query.length > 0 && !allGrapes.some(g => g.toLowerCase() === query);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.pickerOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.pickerSheet, { maxHeight: '80%' }]}>
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
          {canAddCustom && (
            <TouchableOpacity style={styles.addCustomGrape} onPress={handleAddCustom}>
              <Text style={styles.addCustomGrapeText}>+ Add "{search.trim()}" as new grape</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={displayData}
            keyExtractor={i => i}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = pending.includes(item);
              const isCustom = !GRAPE_VARIETIES.includes(item);
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, isSelected && styles.grapeItemSelected]}
                  onPress={() => toggle(item)}
                >
                  <Text style={[styles.pickerItemText, isSelected && styles.grapeItemTextSelected]}>
                    {item}
                  </Text>
                  {isSelected && <Text style={styles.grapeCheckmark}>✓</Text>}
                  {isCustom && (
                    <TouchableOpacity
                      onPress={() => handleDeleteCustom(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.grapeDeleteBtn}
                    >
                      <Text style={styles.grapeDeleteText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function BasicInfoScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'BasicInfo'>>();
  const { tasting, update, reset, setScanApplied, setGuidedSessionId } = useWineTasting();

  const addToFlightId = route.params?.addToFlightId;
  const addToFlightName = route.params?.addToFlightName;
  const isAddToFlight = Boolean(addToFlightId);

  useEffect(() => {
    const sessionId = route.params?.guidedSessionId ?? null;
    setGuidedSessionId(sessionId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const isFull = tasting.tastingType === 'full';
  const isEditing = Boolean(tasting.id) && !isAddToFlight;

  const parseStoredDate = (s: string | undefined): Date => {
    if (!s) return new Date();
    const [m, d, y] = s.split('/').map(Number);
    const parsed = new Date(y, m - 1, d);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };
  const formatDate = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;

  const [dateTasted, setDateTasted] = useState<Date>(() => parseStoredDate(tasting.dateTasted));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [producer, setProducer] = useState(tasting.producer ?? '');
  const [name, setName] = useState(tasting.name ?? '');
  const [country, setCountry] = useState(tasting.country ?? '');
  const [region, setRegion] = useState(tasting.region ?? '');
  const [subregion, setSubregion] = useState(tasting.subregion ?? '');
  const [vineyard, setVineyard] = useState(tasting.vineyard ?? '');
  const [grapes, setGrapes] = useState<string[]>(tasting.grapes ?? []);
  const [importer, setImporter] = useState(tasting.importer ?? '');
  const [vintage, setVintage] = useState(tasting.vintage ?? '');
  const [abv, setAbv] = useState((tasting.abv ?? '').replace(/%/g, ''));
  const [price, setPrice] = useState(tasting.price ?? '');
  const [photo, setPhoto] = useState<string | null>(tasting.photo ?? null);

  const [expanded, setExpanded] = useState(false);

  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const [subregionPickerOpen, setSubregionPickerOpen] = useState(false);
  const [grapePickerOpen, setGrapePickerOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Re-sync local state when returning from ScanLabelScreen
  useFocusEffect(
    useCallback(() => {
      setProducer(tasting.producer ?? '');
      setName(tasting.name ?? '');
      setCountry(tasting.country ?? '');
      setRegion(tasting.region ?? '');
      setSubregion(tasting.subregion ?? '');
      setGrapes(tasting.grapes ?? []);
      setImporter(tasting.importer ?? '');
      setVintage(tasting.vintage ?? '');
      setAbv((tasting.abv ?? '').replace(/%/g, ''));
      setPrice(tasting.price ?? '');
      setPhoto(tasting.photo ?? null);
      if (tasting.scanApplied) {
        setExpanded(true);
        setScanApplied(false);
      }
    }, [tasting]),
  );

  const removeGrape = (grape: string) => setGrapes(prev => prev.filter(g => g !== grape));

  const openCamera = async () => {
    const permission = await Camera.getCameraPermissionsAsync();
    if (!permission.granted) {
      const request = await Camera.requestCameraPermissionsAsync();
      if (!request.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to take photos. Please enable it in Settings.');
        return;
      }
    }
    setCameraOpen(true);
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setPhoto(photo!.uri);
      setCameraOpen(false);
    } catch (e: any) {
      Alert.alert('Camera Error', e?.message ?? 'Could not capture photo.');
    }
  };

  const handleNext = () => {
    update({ dateTasted: formatDate(dateTasted), producer, name, country, region, subregion, vineyard, grapes, importer, vintage, abv, price, photo });
    if (isFull) {
      navigation.navigate('WineStyle');
    } else {
      navigation.navigate('Think');
    }
  };

  const handleUpdate = async () => {
    if (!tasting.id) return;
    const wine: Wine = {
      ...(tasting as Wine),
      dateTasted: formatDate(dateTasted),
      producer,
      name,
      country,
      region,
      subregion,
      vineyard,
      grapes,
      importer,
      vintage,
      abv,
      price,
      photo,
    };
    try {
      await saveWine(wine);
      reset();
      navigation.reset({
        index: 2,
        routes: [
          { name: 'Home' },
          { name: 'MyTastings' },
          { name: 'WineDetail', params: { wineId: wine.id } },
        ],
      });
    } catch {
      Alert.alert('Error', 'Could not update your tasting. Please try again.');
    }
  };

  const handleAddToFlight = async () => {
    if (!addToFlightId || !addToFlightName) return;
    const existing = await getPendingWines(addToFlightId);
    await savePendingWines(addToFlightId, [
      ...existing,
      {
        id: `pending-${Date.now()}`,
        name,
        producer,
        vintage,
        country,
        region,
        grapes,
        abv,
        price,
      },
    ]);
    navigation.navigate('CustomFlight', { flightId: addToFlightId, flightName: addToFlightName });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={isAddToFlight ? 'Add Wine to Flight' : 'Basic Information'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.scanBanner} onPress={() => navigation.navigate('ScanLabel')}>
          <Text style={styles.scanBannerIcon}>📷</Text>
          <View style={styles.scanBannerText}>
            <Text style={styles.scanBannerTitle}>Scan Wine Label</Text>
            <Text style={styles.scanBannerSub}>Auto-fill fields from front &amp; back labels</Text>
          </View>
          <Text style={styles.scanBannerArrow}>›</Text>
        </TouchableOpacity>

        {/* Always-visible core fields */}
        <Row label="Producer:" info={<InfoModal title="Producer" body="The winery or estate that made the wine — great to track so you can find bottles you loved again." />}>
          <TextInput style={styles.input} value={producer} onChangeText={setProducer} placeholder="" />
        </Row>

        <Row label="Name:" info={<InfoModal title="Wine Name" body="The specific wine name or cuvée — sometimes a vineyard name, sometimes the grape variety. It helps you tell one bottle apart from another by the same producer." />}>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="" />
        </Row>

        <Row label="Grape(s):" info={<InfoModal title="Grape Varieties" body="The grape or grapes used to make this wine. Some are single-variety, others are blends. Tracking this is one of the best ways to figure out which grapes you love most." />}>
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

        <Row label="Vintage:" info={<InfoModal title="Vintage" body="The year the grapes were picked. Weather that season affects the flavor, which is why the same wine can taste different year to year. Found prominently on the label." />}>
          <TextInput
            style={[styles.input, styles.inputShort]}
            value={vintage}
            onChangeText={setVintage}
            placeholder=""
            keyboardType="numeric"
            maxLength={4}
          />
        </Row>

        {/* Bottle photo — always visible */}
        <View style={styles.photoSection}>
          <Text style={styles.photoSectionLabel}>Bottle Photo:</Text>
          {photo ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photo }} style={styles.photoPreview} resizeMode="contain" />
              <View style={styles.photoPreviewActions}>
                <TouchableOpacity style={styles.photoRetakeBtn} onPress={openCamera}>
                  <Text style={styles.photoRetakeBtnText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoClearBtn} onPress={() => setPhoto(null)}>
                  <Text style={styles.photoClearBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderIcon}>📷</Text>
              <View style={styles.photoPlaceholderBtns}>
                <TouchableOpacity style={styles.photoBtn} onPress={openCamera}>
                  <Text style={styles.photoBtnText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.photoBtn, styles.photoBtnSecondary]} onPress={pickFromLibrary}>
                  <Text style={[styles.photoBtnText, styles.photoBtnSecondaryText]}>Choose from Library</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Expand/collapse toggle */}
        <TouchableOpacity style={styles.expandToggle} onPress={() => setExpanded(v => !v)} activeOpacity={0.7}>
          <Text style={styles.expandToggleText}>{expanded ? 'Hide fields ▲' : 'See all fields ▼'}</Text>
        </TouchableOpacity>

        {/* Additional fields, hidden by default */}
        {expanded && (
          <>
            <Row label="Date:" noInfo>
              <TouchableOpacity
                style={[styles.input, styles.inputShort, styles.dateButton]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateButtonText}>{formatDate(dateTasted)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateTasted}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_event: DateTimePickerEvent, selected?: Date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selected) setDateTasted(selected);
                  }}
                />
              )}
            </Row>

            <Row label="Country:" info={<InfoModal title="Country" body="Where the grapes were grown. Wine is incredibly tied to place — the same grape can taste completely different depending on the country. One of the most fun things to explore." />}>
              <TouchableOpacity style={styles.dropdownTrigger} onPress={() => { Keyboard.dismiss(); setCountryPickerOpen(true); }}>
                <Text style={country ? styles.dropdownValue : styles.dropdownPlaceholder}>{country || ''}</Text>
                <Text style={styles.chevron}>∨</Text>
              </TouchableOpacity>
            </Row>

            <Row label="Region:" noInfo>
              {getRegions(country).length > 0 ? (
                <TouchableOpacity style={styles.dropdownTrigger} onPress={() => { Keyboard.dismiss(); setRegionPickerOpen(true); }}>
                  <Text style={region ? styles.dropdownValue : styles.dropdownPlaceholder}>{region || ''}</Text>
                  <Text style={styles.chevron}>∨</Text>
                </TouchableOpacity>
              ) : (
                <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="" />
              )}
            </Row>

            <Row label="Subregion:" noInfo>
              {getSubregions(country, region).length > 0 ? (
                <TouchableOpacity style={styles.dropdownTrigger} onPress={() => { Keyboard.dismiss(); setSubregionPickerOpen(true); }}>
                  <Text style={subregion ? styles.dropdownValue : styles.dropdownPlaceholder}>{subregion || ''}</Text>
                  <Text style={styles.chevron}>∨</Text>
                </TouchableOpacity>
              ) : (
                <TextInput style={styles.input} value={subregion} onChangeText={setSubregion} placeholder="" />
              )}
            </Row>

            <Row label="Vineyard:" noInfo>
              <TextInput style={styles.input} value={vineyard} onChangeText={setVineyard} placeholder="" />
            </Row>

            <Row label="Importer:" info={<InfoModal title="Importer" body="The company that brought this wine into your country — usually on the back label. Great secret weapon: if you love a wine, look for other bottles from the same importer." />}>
              <TextInput style={styles.input} value={importer} onChangeText={setImporter} placeholder="" />
            </Row>

            <Row label="ABV:" info={<InfoModal title="Alcohol by Volume" body="The alcohol percentage printed on the label. A great way to cross-check what you tasted — if it felt high and the label says 15%, trust yourself. Under 12% is light, 12–13.5% is medium, above 14% is high." />}>
              <TextInput
                style={[styles.input, styles.inputShort]}
                value={abv}
                onChangeText={(v) => setAbv(v.replace(/[^0-9.]/g, ''))}
                placeholder="e.g. 13.5"
                keyboardType="decimal-pad"
              />
            </Row>

            <Row label="Price:" noInfo>
              <TextInput
                style={[styles.input, styles.inputShort]}
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. $24.99"
                keyboardType="decimal-pad"
              />
            </Row>
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={[styles.nextBar, isEditing && styles.nextBarEditing]}>
        {isEditing && (
          <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
            <Text style={styles.updateBtnText}>UPDATE</Text>
          </TouchableOpacity>
        )}
        {isAddToFlight ? (
          <TouchableOpacity style={styles.nextBtn} onPress={handleAddToFlight}>
            <Text style={styles.nextBtnText}>Add to Flight</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>NEXT &gt;</Text>
          </TouchableOpacity>
        )}
      </View>
      </KeyboardAvoidingView>

      <PickerModal
        visible={countryPickerOpen}
        items={WINE_COUNTRIES}
        onSelect={(c) => { setCountry(c); setRegion(''); setSubregion(''); }}
        onClose={() => setCountryPickerOpen(false)}
        title="Select Country"
      />
      <RegionPickerModal
        visible={regionPickerOpen}
        country={country}
        onSelect={(r) => { setRegion(r); setSubregion(''); }}
        onClose={() => setRegionPickerOpen(false)}
      />
      <SubregionPickerModal
        visible={subregionPickerOpen}
        country={country}
        region={region}
        onSelect={setSubregion}
        onClose={() => setSubregionPickerOpen(false)}
      />
      <GrapePickerModal
        visible={grapePickerOpen}
        selected={grapes}
        onConfirm={setGrapes}
        onClose={() => setGrapePickerOpen(false)}
      />

      <Modal visible={cameraOpen} animationType="slide" onRequestClose={() => setCameraOpen(false)}>
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={styles.cameraControls}>
            <TouchableOpacity onPress={() => setCameraOpen(false)} style={styles.cameraCancelBtn}>
              <Text style={styles.cameraCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCapture} style={styles.captureBtn}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <View style={{ width: 80 }} />
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(26, 163, 152, 0.12)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  scanBannerIcon: { fontSize: 24 },
  scanBannerText: { flex: 1 },
  scanBannerTitle: { fontSize: 15, fontWeight: '700', color: Colors.btnGuide },
  scanBannerSub: { fontSize: 12, color: Colors.btnGuide, opacity: 0.8, marginTop: 1 },
  scanBannerArrow: { fontSize: 22, color: Colors.btnGuide, fontWeight: '300' },
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
  dateButton: {
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: Colors.text,
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
  addCustomGrape: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f8e8',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  addCustomGrapeText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  grapeDeleteBtn: {
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  grapeDeleteText: {
    fontSize: 14,
    color: Colors.disliked,
    fontWeight: '700',
  },
  grapeTag: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  grapeTagText: { fontSize: 12, color: Colors.primaryDark, fontWeight: '600' },
  expandToggle: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  expandToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  photoSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  photoSectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  photoPlaceholder: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    gap: 14,
  },
  photoPlaceholderIcon: { fontSize: 32 },
  photoPlaceholderBtns: { gap: 10, alignItems: 'center' },
  photoBtn: {
    backgroundColor: Colors.btnGuide,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    minWidth: 180,
    alignItems: 'center',
  },
  photoBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  photoBtnSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.btnGuide,
  },
  photoBtnSecondaryText: { color: Colors.btnGuide },
  photoPreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  photoPreview: { width: '100%', height: 200, backgroundColor: Colors.surface },
  photoPreviewActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  photoRetakeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: Colors.border,
  },
  photoRetakeBtnText: { color: Colors.btnGuide, fontWeight: '600', fontSize: 14 },
  photoClearBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  photoClearBtnText: { color: Colors.disliked, fontWeight: '600', fontSize: 14 },
  nextBar: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBarEditing: {
    justifyContent: 'space-between',
  },
  updateBtn: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  updateBtnText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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

  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 48,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraCancelBtn: {
    width: 80,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cameraCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
});
