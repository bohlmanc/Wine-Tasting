import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/colors';
import { HERB_ITEMS, SPICE_ITEMS } from '../../constants/aromas';
import { useWineTasting } from '../../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'SmellHerbSpiceDetail'>;

export default function SmellHerbSpiceDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { category } = route.params;
  const { tasting, update } = useWineTasting();

  const items = category === 'Herbs' ? HERB_ITEMS : SPICE_ITEMS;
  const aromas = tasting.aromas ?? [];
  const color = Colors.herbsColor;
  const categoryCustomAromas = tasting.customAromas?.[category] ?? [];
  const [customInput, setCustomInput] = useState('');

  const isSelected = (item: string) => aromas.includes(item);

  const toggle = (item: string) => {
    if (isSelected(item)) {
      update({ aromas: aromas.filter(a => a !== item) });
    } else {
      update({ aromas: [...aromas, item] });
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !aromas.includes(trimmed)) {
      const prevCustom = tasting.customAromas ?? {};
      update({
        aromas: [...aromas, trimmed],
        customAromas: { ...prevCustom, [category]: [...(prevCustom[category] ?? []), trimmed] },
      });
    }
    setCustomInput('');
  };

  const removeCustom = (item: string) => {
    const prevCustom = tasting.customAromas ?? {};
    update({
      aromas: aromas.filter(a => a !== item),
      customAromas: { ...prevCustom, [category]: (prevCustom[category] ?? []).filter(a => a !== item) },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Step 2: Smell" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.heading, { color }]}>{category.toUpperCase()}</Text>
        <Text style={styles.subheading}>Select all that apply:</Text>

        <View style={styles.grid}>
          {items.map(item => {
            const sel = isSelected(item);
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chip,
                  { borderColor: color },
                  sel && { backgroundColor: color },
                ]}
                onPress={() => toggle(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: sel ? Colors.white : color }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {categoryCustomAromas.length > 0 && (
          <View style={styles.customSection}>
            <Text style={[styles.customLabel, { color }]}>Custom aromas:</Text>
            <View style={styles.grid}>
              {categoryCustomAromas.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, { borderColor: color, backgroundColor: color }]}
                  onPress={() => removeCustom(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, { color: Colors.white }]}>{item}{'  ✕'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.addRow}>
          <TextInput
            style={[styles.customInput, { borderColor: color }]}
            placeholder="Add custom aroma…"
            placeholderTextColor={Colors.textMuted}
            value={customInput}
            onChangeText={setCustomInput}
            onSubmitEditing={addCustom}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: color }]}
            onPress={addCustom}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: color }]}
          onPress={() => navigation.navigate('SmellHerbsSpices')}
        >
          <Text style={[styles.outlineBtnText, { color }]}>BACK TO HERBS & SPICES</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: Colors.textMuted }]}
          onPress={() => navigation.navigate('SmellMain')}
        >
          <Text style={[styles.outlineBtnText, { color: Colors.textMuted }]}>BACK TO AROMAS</Text>
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
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 2,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  customSection: {
    marginTop: 20,
  },
  customLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  customInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  addBtn: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  bottomBar: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  outlineBtn: {
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
