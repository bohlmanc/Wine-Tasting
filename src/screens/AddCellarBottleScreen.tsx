import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { saveCellarBottle, getCellarBottle } from '../storage/cellarStorage';
import { CellarBottle, WineStyle } from '../types';
import { WINE_COUNTRIES, GRAPE_VARIETIES } from '../constants/wineData';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddCellarBottle'>;

const STYLE_OPTIONS: { value: WineStyle; label: string; color: string }[] = [
  { value: 'red', label: 'Red', color: '#C1121F' },
  { value: 'white', label: 'White', color: '#C8A000' },
  { value: 'rose', label: 'Rosé', color: '#D06080' },
  { value: 'sparkling', label: 'Sparkling', color: '#4A8585' },
];

const SORTED_COUNTRIES = ['United States', ...WINE_COUNTRIES.filter(c => c !== 'United States').sort()];

function makeBlankBottle(): Omit<CellarBottle, 'id' | 'createdAt'> {
  return {
    name: '',
    producer: '',
    vintage: '',
    country: '',
    region: '',
    grapes: [],
    style: null,
    abv: '',
    photo: null,
    quantity: 1,
    purchaseDate: '',
    purchasePrice: '',
    drinkFrom: '',
    drinkBy: '',
    notes: '',
  };
}

export default function AddCellarBottleScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const editId = route.params?.bottleId;
  const isEditing = !!editId;

  const [fields, setFields] = useState(makeBlankBottle());
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showGrapePicker, setShowGrapePicker] = useState(false);

  useEffect(() => {
    if (editId) {
      getCellarBottle(editId).then(b => {
        if (b) {
          const { id, createdAt, ...rest } = b;
          setFields(rest);
        }
      });
    }
  }, [editId]);

  const set = useCallback(<K extends keyof typeof fields>(key: K, value: typeof fields[K]) => {
    setFields(prev => ({ ...prev, [key]: value }));
  }, []);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) {
      set('photo', result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!fields.name.trim() && !fields.producer.trim()) {
      Alert.alert('Missing Info', 'Please enter at least a producer or wine name.');
      return;
    }
    const bottle: CellarBottle = {
      id: editId ?? `cellar_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...fields,
    };
    await saveCellarBottle(bottle);
    navigation.goBack();
  };

  const toggleGrape = (grape: string) => {
    set('grapes', fields.grapes.includes(grape)
      ? fields.grapes.filter(g => g !== grape)
      : [...fields.grapes, grape]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={isEditing ? 'Edit Bottle' : 'Add to Cellar'} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Photo */}
        <TouchableOpacity style={styles.photoArea} onPress={pickPhoto} activeOpacity={0.8}>
          {fields.photo ? (
            <Image source={{ uri: fields.photo }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoHint}>Add photo (optional)</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Producer & Name */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Producer</Text>
            <TextInput
              style={styles.input}
              value={fields.producer}
              onChangeText={v => set('producer', v)}
              placeholder="e.g. Caymus"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Wine Name</Text>
          <TextInput
            style={styles.input}
            value={fields.name}
            onChangeText={v => set('name', v)}
            placeholder="e.g. Special Selection Cabernet"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Vintage & ABV */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Vintage</Text>
            <TextInput
              style={styles.input}
              value={fields.vintage}
              onChangeText={v => set('vintage', v)}
              placeholder="e.g. 2020"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>ABV %</Text>
            <TextInput
              style={styles.input}
              value={fields.abv}
              onChangeText={v => set('abv', v)}
              placeholder="e.g. 14.5"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Wine Style */}
        <View style={styles.field}>
          <Text style={styles.label}>Style</Text>
          <View style={styles.styleRow}>
            {STYLE_OPTIONS.map(opt => {
              const active = fields.style === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.styleChip, active && { backgroundColor: opt.color, borderColor: opt.color }]}
                  onPress={() => set('style', active ? null : opt.value)}
                >
                  <Text style={[styles.styleChipText, active && styles.styleChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Country */}
        <View style={styles.field}>
          <Text style={styles.label}>Country</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCountryPicker(true)}>
            <Text style={[styles.pickerBtnText, !fields.country && styles.pickerBtnPlaceholder]}>
              {fields.country || 'Select country...'}
            </Text>
            <Text style={styles.pickerArrow}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Region */}
        <View style={styles.field}>
          <Text style={styles.label}>Region</Text>
          <TextInput
            style={styles.input}
            value={fields.region}
            onChangeText={v => set('region', v)}
            placeholder="e.g. Napa Valley"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Grapes */}
        <View style={styles.field}>
          <Text style={styles.label}>Grapes</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowGrapePicker(true)}>
            <Text style={[styles.pickerBtnText, !fields.grapes.length && styles.pickerBtnPlaceholder]} numberOfLines={1}>
              {fields.grapes.length ? fields.grapes.join(', ') : 'Select grapes...'}
            </Text>
            <Text style={styles.pickerArrow}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Quantity */}
        <View style={styles.field}>
          <Text style={styles.label}>Quantity</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => set('quantity', Math.max(1, fields.quantity - 1))}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{fields.quantity}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => set('quantity', fields.quantity + 1)}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Drink window */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Drink From</Text>
            <TextInput
              style={styles.input}
              value={fields.drinkFrom}
              onChangeText={v => set('drinkFrom', v)}
              placeholder="e.g. 2025"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Drink By</Text>
            <TextInput
              style={styles.input}
              value={fields.drinkBy}
              onChangeText={v => set('drinkBy', v)}
              placeholder="e.g. 2032"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>

        {/* Purchase info */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Purchase Date</Text>
            <TextInput
              style={styles.input}
              value={fields.purchaseDate}
              onChangeText={v => set('purchaseDate', v)}
              placeholder="e.g. 05/2024"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Price Paid</Text>
            <TextInput
              style={styles.input}
              value={fields.purchasePrice}
              onChangeText={v => set('purchasePrice', v)}
              placeholder="e.g. $45"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={fields.notes}
            onChangeText={v => set('notes', v)}
            placeholder="Any notes about this bottle..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>{isEditing ? 'Save Changes' : 'Add to Cellar'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Country picker */}
      <PickerModal
        visible={showCountryPicker}
        title="Select Country"
        options={SORTED_COUNTRIES}
        selected={fields.country ? [fields.country] : []}
        onToggle={c => { set('country', fields.country === c ? '' : c); setShowCountryPicker(false); }}
        onClear={() => set('country', '')}
        onClose={() => setShowCountryPicker(false)}
        singleSelect
      />

      {/* Grape picker */}
      <PickerModal
        visible={showGrapePicker}
        title="Select Grapes"
        options={GRAPE_VARIETIES}
        selected={fields.grapes}
        onToggle={toggleGrape}
        onClear={() => set('grapes', [])}
        onClose={() => setShowGrapePicker(false)}
      />
    </SafeAreaView>
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
  singleSelect = false,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  onClear: () => void;
  onClose: () => void;
  singleSelect?: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalDoneBtn}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
          {selected.length > 0 && !singleSelect && (
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
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.btnCellar },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },

  photoArea: { marginBottom: 20, alignItems: 'center' },
  photo: { width: 120, height: 120, borderRadius: 12 },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoIcon: { fontSize: 28 },
  photoHint: { fontSize: 12, color: Colors.textMuted },

  row: { flexDirection: 'row', gap: 12 },
  field: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    color: Colors.text,
  },
  notesInput: { minHeight: 80, paddingTop: 12 },

  styleRow: { flexDirection: 'row', gap: 8 },
  styleChip: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  styleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  styleChipTextActive: { color: Colors.white },

  pickerBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerBtnText: { fontSize: 16, color: Colors.text, flex: 1 },
  pickerBtnPlaceholder: { color: Colors.textMuted },
  pickerArrow: { fontSize: 14, color: Colors.textMuted, marginLeft: 8 },

  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.btnCellar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: { fontSize: 22, color: Colors.white, fontWeight: '700', lineHeight: 26 },
  stepperValue: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    minWidth: 36,
    textAlign: 'center',
  },

  saveBtn: {
    backgroundColor: Colors.btnCellar,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

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
  modalDoneText: { fontSize: 15, color: Colors.btnCellar, fontWeight: '700' },
  modalClearRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 4,
  },
  modalClearText: { fontSize: 14, color: Colors.btnCellar, fontWeight: '700' },
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
  modalOptionTextSelected: { color: Colors.btnCellar, fontWeight: '700' },
  modalCheck: { fontSize: 15, color: Colors.btnCellar, fontWeight: '700' },
});
