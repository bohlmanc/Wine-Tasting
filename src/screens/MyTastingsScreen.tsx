import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  FlatList,
  Image,
  Alert,
  TextInput,
  Modal,
  Pressable,
  Keyboard,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { loadWines, deleteWine } from '../storage/wineStorage';
import { Wine, WineStyle } from '../types';
import { GRAPE_VARIETIES, WINE_COUNTRIES } from '../constants/wineData';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SORTED_COUNTRIES = [
  'United States',
  ...WINE_COUNTRIES.filter(c => c !== 'United States').sort(),
];

const STYLE_OPTIONS: { value: WineStyle; label: string; color: string }[] = [
  { value: 'red', label: 'RED', color: '#C1121F' },
  { value: 'white', label: 'WHITE', color: '#C8A000' },
  { value: 'rose', label: 'ROSÉ', color: '#D06080' },
  { value: 'sparkling', label: 'SPARK', color: '#4A8585' },
];

export default function MyWinesScreen() {
  const navigation = useNavigation<Nav>();
  const [wines, setWines] = useState<Wine[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<WineStyle | null>(null);
  const [selectedGrapes, setSelectedGrapes] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showGrapePicker, setShowGrapePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const refresh = useCallback(async () => {
    const loaded = await loadWines();
    setWines(loaded);
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const filteredWines = useMemo(() => {
    let result = wines;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(w =>
        [w.name, w.producer, w.country, w.region, w.vintage, w.notes, ...(w.grapes ?? [])]
          .some(f => f?.toLowerCase().includes(q))
      );
    }
    if (selectedStyle) result = result.filter(w => w.style === selectedStyle);
    if (selectedGrapes.length) result = result.filter(w => selectedGrapes.some(g => w.grapes?.includes(g)));
    if (selectedCountries.length) result = result.filter(w => selectedCountries.includes(w.country ?? ''));
    return result;
  }, [wines, searchText, selectedStyle, selectedGrapes, selectedCountries]);

  const hasFilters = !!(searchText || selectedStyle || selectedGrapes.length || selectedCountries.length);

  const clearAll = useCallback(() => {
    setSearchText('');
    setSelectedStyle(null);
    setSelectedGrapes([]);
    setSelectedCountries([]);
  }, []);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Wine',
      `Remove "${name || 'this wine'}" from your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWine(id);
            refresh();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="My Tastings" />
      <Pressable style={styles.container} onPress={Keyboard.dismiss}>
        {wines.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍷</Text>
            <Text style={styles.emptyText}>No wines saved yet.</Text>
            <Text style={styles.emptySubtext}>Start a tasting to add your first wine!</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddWineType')}>
              <Text style={styles.addBtnText}>ADD A WINE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.filterArea}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search wines..."
                placeholderTextColor={Colors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              <View style={styles.styleRow}>
                {STYLE_OPTIONS.map(opt => {
                  const active = selectedStyle === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.styleChip, active && { backgroundColor: opt.color, borderColor: opt.color }]}
                      onPress={() => setSelectedStyle(active ? null : opt.value)}
                    >
                      <Text style={[styles.styleChipText, active && styles.styleChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.dropdownRow}>
                <FilterPill
                  label={selectedGrapes.length ? `Grape (${selectedGrapes.length})` : 'Grape'}
                  active={selectedGrapes.length > 0}
                  onPress={() => setShowGrapePicker(true)}
                  onClear={() => setSelectedGrapes([])}
                />
                <FilterPill
                  label={selectedCountries.length ? `Country (${selectedCountries.length})` : 'Country'}
                  active={selectedCountries.length > 0}
                  onPress={() => setShowCountryPicker(true)}
                  onClear={() => setSelectedCountries([])}
                />
              </View>
            </View>

            <FlatList
              data={filteredWines}
              keyExtractor={w => w.id}
              contentContainerStyle={styles.list}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No wines match your filters.</Text>
                  <TouchableOpacity onPress={clearAll}>
                    <Text style={styles.clearAllText}>Clear all filters</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({ item }) => (
                <WineCard
                  wine={item}
                  onPress={() => navigation.navigate('WineDetail', { wineId: item.id })}
                  onDelete={() => handleDelete(item.id, item.name)}
                />
              )}
              ListHeaderComponent={
                <View style={styles.listHeader}>
                  <Text style={styles.count}>
                    {filteredWines.length}{hasFilters ? ` of ${wines.length}` : ''}{' '}
                    wine{filteredWines.length !== 1 ? 's' : ''}
                  </Text>
                  <TouchableOpacity style={styles.addBtnSmall} onPress={() => navigation.navigate('AddWineType')}>
                    <Text style={styles.addBtnSmallText}>+ ADD</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </>
        )}
      </Pressable>

      <PickerModal
        visible={showGrapePicker}
        title="Filter by Grape"
        options={GRAPE_VARIETIES}
        selected={selectedGrapes}
        onToggle={g => setSelectedGrapes(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
        onClear={() => setSelectedGrapes([])}
        onClose={() => setShowGrapePicker(false)}
      />
      <PickerModal
        visible={showCountryPicker}
        title="Filter by Country"
        options={SORTED_COUNTRIES}
        selected={selectedCountries}
        onToggle={c => setSelectedCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
        onClear={() => setSelectedCountries([])}
        onClose={() => setShowCountryPicker(false)}
      />
    </SafeAreaView>
  );
}

function FilterPill({
  label,
  active,
  onPress,
  onClear,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  onClear: () => void;
}) {
  return (
    <View style={[styles.pill, active && styles.pillActive]}>
      <TouchableOpacity onPress={onPress} style={styles.pillInner}>
        <Text style={[styles.pillText, active && styles.pillTextActive]} numberOfLines={1}>
          {label}{active ? '' : ' ▾'}
        </Text>
      </TouchableOpacity>
      {active && (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
          <Text style={styles.pillClear}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function PickerModal({
  visible,
  title,
  options,
  selected,
  onToggle,
  onClear,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalDoneBtn}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
          {selected.length > 0 && (
            <TouchableOpacity style={styles.modalClearRow} onPress={onClear}>
              <Text style={styles.modalClearText}>✕  Clear all</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={options}
            keyExtractor={v => v}
            style={styles.modalList}
            renderItem={({ item }) => {
              const checked = selected.includes(item);
              return (
                <TouchableOpacity
                  style={[styles.modalOption, checked && styles.modalOptionSelected]}
                  onPress={() => onToggle(item)}
                >
                  <Text style={[styles.modalOptionText, checked && styles.modalOptionTextSelected]}>
                    {item}
                  </Text>
                  {checked && <Text style={styles.modalCheck}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function WineCard({
  wine,
  onPress,
  onDelete,
}: {
  wine: Wine;
  onPress: () => void;
  onDelete: () => void;
}) {
  const displayName = [wine.producer, wine.name].filter(Boolean).join(' ') || 'Unnamed Wine';
  const styleBadgeColor =
    wine.style === 'red' ? '#C1121F'
    : wine.style === 'white' ? '#C8A000'
    : wine.style === 'rose' ? '#D06080'
    : wine.style === 'sparkling' ? '#4A8585'
    : Colors.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        {wine.photo ? (
          <Image source={{ uri: wine.photo }} style={styles.cardPhoto} />
        ) : (
          <View style={[styles.cardPhotoPlaceholder, { backgroundColor: styleBadgeColor + '22' }]}>
            <Text style={{ fontSize: 24 }}>🍷</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{displayName}</Text>
        <View style={styles.cardMeta}>
          {wine.style && (
            <View style={[styles.badge, { backgroundColor: styleBadgeColor }]}>
              <Text style={styles.badgeText}>{wine.style.toUpperCase()}</Text>
            </View>
          )}
          {wine.vintage ? <Text style={styles.metaText}>{wine.vintage}</Text> : null}
          {wine.country ? <Text style={styles.metaText}>{wine.country}</Text> : null}
        </View>
        {wine.grapes && wine.grapes.length > 0 && (
          <Text style={styles.cardGrapes} numberOfLines={1}>{wine.grapes.join(', ')}</Text>
        )}
        {wine.flightName ? (
          <View style={styles.flightBadge}>
            <Text style={styles.flightBadgeText} numberOfLines={1}>
              🍾 {wine.wineryName ? `${wine.wineryName} · ` : ''}{wine.flightName}
            </Text>
          </View>
        ) : null}
        {wine.rating != null && (
          <Text style={styles.cardRating}>{'★'.repeat(Math.round(wine.rating / 2))}{'☆'.repeat(5 - Math.round(wine.rating / 2))} {wine.rating}/10</Text>
        )}
        {wine.dateTasted ? <Text style={styles.cardDate}>{wine.dateTasted}</Text> : null}
      </View>

      <View style={styles.cardRight}>
        {wine.liked === true && <Text style={styles.likedIcon}>👍</Text>}
        {wine.liked === false && <Text style={styles.likedIcon}>👎</Text>}
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.background },

  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 28 },
  addBtn: {
    backgroundColor: Colors.btnGuide,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  addBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // Filter area
  filterArea: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: Colors.text,
  },
  styleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  styleChip: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  styleChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  styleChipTextActive: { color: Colors.white },
  dropdownRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    backgroundColor: Colors.white,
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 6,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillInner: {},
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  pillTextActive: { color: Colors.white },
  pillClear: {
    fontSize: 11,
    color: Colors.white,
    marginLeft: 6,
    fontWeight: '700',
  },

  // List
  list: { padding: 16 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  count: { fontSize: 15, fontWeight: '700', color: Colors.textMuted },
  addBtnSmall: {
    backgroundColor: Colors.btnGuide,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnSmallText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  noResults: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  noResultsText: { fontSize: 15, color: Colors.textMuted },
  clearAllText: { fontSize: 14, color: Colors.primary, fontWeight: '700' },

  // Wine card
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLeft: { marginRight: 12 },
  cardPhoto: { width: 64, height: 64, borderRadius: 8 },
  cardPhotoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardName: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 6,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },
  metaText: { fontSize: 12, color: Colors.textMuted },
  cardGrapes: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic', marginBottom: 2 },
  flightBadge: {
    backgroundColor: '#F5F0E8',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  flightBadgeText: { fontSize: 11, fontWeight: '600', color: '#8B6914' },
  cardRating: { fontSize: 12, color: Colors.textMuted, marginBottom: 2 },
  cardDate: { fontSize: 11, color: Colors.textMuted },
  cardRight: { alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8 },
  likedIcon: { fontSize: 20 },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 14, color: Colors.textMuted },

  // Picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  modalDoneBtn: { paddingVertical: 4, paddingLeft: 16 },
  modalDoneText: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
  modalClearRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 4,
  },
  modalClearText: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  modalList: { flexGrow: 0 },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  modalOptionSelected: { backgroundColor: Colors.surface, marginHorizontal: -16, paddingHorizontal: 16 },
  modalOptionText: { fontSize: 15, color: Colors.text },
  modalOptionTextSelected: { color: Colors.primary, fontWeight: '700' },
  modalCheck: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
});
