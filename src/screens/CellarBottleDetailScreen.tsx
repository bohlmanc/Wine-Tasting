import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { getCellarBottle, saveCellarBottle, deleteCellarBottle } from '../storage/cellarStorage';
import { CellarBottle, WineStyle } from '../types';
import { useWineTasting } from '../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CellarBottleDetail'>;

function getDrinkWindowStatus(drinkBy: string, drinkFrom: string): 'not_ready' | 'good' | 'soon' | 'past' | 'none' {
  const now = new Date();

  if (drinkFrom.trim()) {
    const fromYear = parseInt(drinkFrom.trim(), 10);
    const fromDate = isNaN(fromYear) ? new Date(drinkFrom) : new Date(fromYear, 0, 1);
    if (!isNaN(fromDate.getTime()) && fromDate > now) return 'not_ready';
  }

  if (!drinkBy.trim()) return 'none';
  const byYear = parseInt(drinkBy.trim(), 10);
  const byDate = isNaN(byYear) ? new Date(drinkBy) : new Date(byYear, 11, 31);
  if (isNaN(byDate.getTime())) return 'none';
  const diffDays = (byDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'past';
  if (diffDays < 365) return 'soon';
  return 'good';
}

const STYLE_COLORS: Record<WineStyle, string> = {
  red: '#C1121F',
  white: '#C8A000',
  rose: '#D06080',
  sparkling: '#4A8585',
};

const STATUS_CONFIG = {
  not_ready: { color: Colors.btnView, bg: '#D8E8F8', label: 'Not yet ready', icon: '⏳' },
  good: { color: '#2E7C2E', bg: '#C8E8C8', label: 'In drinking window', icon: '✓' },
  soon: { color: '#C87828', bg: '#F8ECC8', label: 'Drink soon', icon: '!' },
  past: { color: '#8B1A1A', bg: '#E8C8C8', label: 'Past peak — drink now', icon: '⚠' },
  none: { color: Colors.textMuted, bg: Colors.surface, label: 'No drink window set', icon: '' },
};

export default function CellarBottleDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { setTastingType, update } = useWineTasting();
  const [bottle, setBottle] = useState<CellarBottle | null>(null);
  const [showTastingModal, setShowTastingModal] = useState(false);

  const load = useCallback(async () => {
    const b = await getCellarBottle(route.params.bottleId);
    setBottle(b);
  }, [route.params.bottleId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = () => {
    Alert.alert(
      'Remove from Cellar',
      `Remove "${bottle ? [bottle.producer, bottle.name].filter(Boolean).join(' ') : 'this bottle'}" from your cellar?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteCellarBottle(route.params.bottleId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const adjustQuantity = async (delta: number) => {
    if (!bottle) return;
    const newQty = Math.max(0, bottle.quantity + delta);
    if (newQty === 0) {
      Alert.alert(
        'Remove Last Bottle?',
        'Setting quantity to 0 will remove this entry from your cellar.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              await deleteCellarBottle(bottle.id);
              navigation.goBack();
            },
          },
        ]
      );
      return;
    }
    const updated = { ...bottle, quantity: newQty };
    await saveCellarBottle(updated);
    setBottle(updated);
  };

  const startTasting = (type: 'quick' | 'full') => {
    if (!bottle) return;
    setShowTastingModal(false);
    setTastingType(type);
    update({
      producer: bottle.producer,
      name: bottle.name,
      vintage: bottle.vintage,
      country: bottle.country,
      region: bottle.region,
      grapes: bottle.grapes,
      style: bottle.style,
      abv: bottle.abv,
      photo: bottle.photo,
    });
    navigation.navigate('BasicInfo');
  };

  if (!bottle) return null;

  const displayName = [bottle.producer, bottle.name].filter(Boolean).join(' ') || 'Unnamed Bottle';
  const drinkStatus = getDrinkWindowStatus(bottle.drinkBy, bottle.drinkFrom);
  const statusCfg = STATUS_CONFIG[drinkStatus];
  const styleBadgeColor = bottle.style ? STYLE_COLORS[bottle.style] : Colors.btnCellar;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Cellar" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Header card */}
        <View style={styles.heroCard}>
          {bottle.photo ? (
            <Image source={{ uri: bottle.photo }} style={styles.heroPhoto} />
          ) : (
            <View style={[styles.heroPhotoPlaceholder, { backgroundColor: styleBadgeColor + '22' }]}>
              <Text style={styles.heroPhotoIcon}>🍾</Text>
            </View>
          )}
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{displayName}</Text>
            <View style={styles.heroBadgeRow}>
              {bottle.style && (
                <View style={[styles.badge, { backgroundColor: styleBadgeColor }]}>
                  <Text style={styles.badgeText}>{bottle.style.toUpperCase()}</Text>
                </View>
              )}
              {bottle.vintage ? <Text style={styles.heroMeta}>{bottle.vintage}</Text> : null}
              {bottle.country ? <Text style={styles.heroMeta}>{bottle.country}</Text> : null}
            </View>
          </View>
        </View>

        {/* Drink window banner */}
        {drinkStatus !== 'none' && (
          <View style={[styles.windowBanner, { backgroundColor: statusCfg.bg, borderColor: statusCfg.color + '44' }]}>
            <Text style={[styles.windowIcon]}>{statusCfg.icon}</Text>
            <View style={styles.windowTextBlock}>
              <Text style={[styles.windowLabel, { color: statusCfg.color }]}>{statusCfg.label}</Text>
              {(bottle.drinkFrom || bottle.drinkBy) && (
                <Text style={styles.windowRange}>
                  {bottle.drinkFrom && bottle.drinkBy
                    ? `${bottle.drinkFrom} – ${bottle.drinkBy}`
                    : bottle.drinkBy
                    ? `Drink by ${bottle.drinkBy}`
                    : `Ready from ${bottle.drinkFrom}`}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Quantity control */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BOTTLES IN CELLAR</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => adjustQuantity(-1)}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{bottle.quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => adjustQuantity(1)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailCard}>
          {bottle.region ? <DetailRow label="Region" value={bottle.region} /> : null}
          {bottle.grapes.length > 0 ? <DetailRow label="Grapes" value={bottle.grapes.join(', ')} /> : null}
          {bottle.abv ? <DetailRow label="ABV" value={`${bottle.abv}%`} /> : null}
          {bottle.purchaseDate ? <DetailRow label="Purchased" value={bottle.purchaseDate} /> : null}
          {bottle.purchasePrice ? <DetailRow label="Price" value={bottle.purchasePrice} /> : null}
        </View>

        {bottle.notes ? (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>NOTES</Text>
            <Text style={styles.notesText}>{bottle.notes}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <TouchableOpacity style={styles.tastingBtn} onPress={() => setShowTastingModal(true)} activeOpacity={0.85}>
          <Text style={styles.tastingBtnText}>Start Tasting</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('AddCellarBottle', { bottleId: bottle.id })}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Remove from Cellar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Tasting type modal */}
      <Modal visible={showTastingModal} transparent animationType="fade" onRequestClose={() => setShowTastingModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTastingModal(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Start Tasting</Text>
            <Text style={styles.modalSubtitle}>{displayName}</Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: Colors.btnView }]}
              onPress={() => startTasting('quick')}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBtnText}>Quick Sip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: Colors.btnGuide }]}
              onPress={() => startTasting('full')}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBtnText}>Full Tasting</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowTastingModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.btnCellar },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },

  heroCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  heroPhoto: { width: 88, height: 88, borderRadius: 12, marginRight: 14 },
  heroPhotoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 12,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPhotoIcon: { fontSize: 36 },
  heroInfo: { flex: 1, justifyContent: 'center' },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 8,
  },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },
  heroMeta: { fontSize: 13, color: Colors.textMuted },

  windowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  windowIcon: { fontSize: 20 },
  windowTextBlock: { flex: 1 },
  windowLabel: { fontSize: 14, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  windowRange: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  qtyBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.btnCellar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 26, color: Colors.white, fontWeight: '700', lineHeight: 30 },
  qtyValue: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    minWidth: 48,
    textAlign: 'center',
  },

  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  detailLabel: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  detailValue: { fontSize: 14, color: Colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },

  notesCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notesLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.8, marginBottom: 8 },
  notesText: { fontSize: 14, color: Colors.text, lineHeight: 20 },

  tastingBtn: {
    backgroundColor: Colors.btnCellar,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  tastingBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  secondaryActions: { flexDirection: 'row', gap: 10 },
  editBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.btnCellar,
    backgroundColor: Colors.white,
  },
  editBtnText: { color: Colors.btnCellar, fontWeight: '700', fontSize: 15 },
  deleteBtn: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  deleteBtnText: { color: Colors.textMuted, fontWeight: '600', fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBtn: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalCancelBtn: { paddingVertical: 12, alignItems: 'center' },
  modalCancelText: { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },
});
