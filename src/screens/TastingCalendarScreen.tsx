import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { loadWines } from '../storage/wineStorage';
import { Wine } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STYLE_COLORS: Record<string, string> = {
  red: '#C1121F',
  white: '#C8A000',
  rose: '#D06080',
  sparkling: '#4A8585',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function makeDateKey(year: number, month: number, day: number): string {
  return `${year}-${month}-${day}`;
}

function wineToDateKey(wine: Wine): string | null {
  if (!wine.dateTasted) return null;
  // dateTasted is stored as toLocaleDateString('en-US') → "M/D/YYYY"
  const parts = wine.dateTasted.split('/');
  if (parts.length === 3) {
    const m = parseInt(parts[0], 10);
    const d = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (!isNaN(m) && !isNaN(d) && !isNaN(y)) {
      return makeDateKey(y, m - 1, d);
    }
  }
  const d = new Date(wine.dateTasted);
  if (isNaN(d.getTime())) return null;
  return makeDateKey(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function TastingCalendarScreen() {
  const navigation = useNavigation<Nav>();
  const [wines, setWines] = useState<Wine[]>([]);
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadWines().then(setWines);
    }, [])
  );

  const winesByDate = useMemo(() => {
    const map = new Map<string, Wine[]>();
    wines.forEach(wine => {
      const key = wineToDateKey(wine);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(wine);
    });
    return map;
  }, [wines]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const todayKey = makeDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedWines = selectedDay != null
    ? (winesByDate.get(makeDateKey(year, month, selectedDay)) ?? [])
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Tasting Calendar" />
      <View style={styles.container}>
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={prevMonth}
            style={styles.navBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
          <TouchableOpacity
            onPress={nextMonth}
            style={styles.navBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dayNamesRow}>
          {DAY_LABELS.map(d => (
            <View key={d} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{d}</Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (day == null) {
              return <View key={`e-${i}`} style={styles.cell} />;
            }
            const key = makeDateKey(year, month, day);
            const dayWines = winesByDate.get(key) ?? [];
            const isToday = key === todayKey;
            const isSelected = selectedDay === day;
            const hasWines = dayWines.length > 0;

            return (
              <TouchableOpacity
                key={day}
                style={styles.cell}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.dayNumCircle,
                  isToday && !isSelected && styles.dayNumCircleToday,
                  isSelected && styles.dayNumCircleSelected,
                ]}>
                  <Text style={[
                    styles.dayNum,
                    isToday && !isSelected && styles.dayNumToday,
                    isSelected && styles.dayNumSelected,
                  ]}>
                    {day}
                  </Text>
                </View>
                {hasWines && (
                  <View style={styles.dotsRow}>
                    {dayWines.slice(0, 3).map((w, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.dot,
                          { backgroundColor: STYLE_COLORS[w.style ?? ''] ?? Colors.primary },
                        ]}
                      />
                    ))}
                    {dayWines.length > 3 && (
                      <Text style={styles.dotPlus}>+</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {wines.length} wine{wines.length !== 1 ? 's' : ''} tasted total
          </Text>
        </View>
      </View>

      <Modal
        visible={selectedDay != null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDay(null)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSelectedDay(null)}
        >
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {selectedDay != null ? `${MONTH_NAMES[month]} ${selectedDay}, ${year}` : ''}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedDay(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedWines.length === 0 ? (
              <View style={styles.emptyDay}>
                <Text style={styles.emptyDayIcon}>🍷</Text>
                <Text style={styles.emptyDayText}>No wines tasted on this day.</Text>
                <TouchableOpacity
                  style={styles.startTastingBtn}
                  onPress={() => {
                    setSelectedDay(null);
                    navigation.navigate('AddWineType');
                  }}
                >
                  <Text style={styles.startTastingBtnText}>Start a Tasting</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedDay(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.emptyDayClose}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {selectedWines.map(wine => {
                  const displayName = [wine.producer, wine.name].filter(Boolean).join(' ') || 'Unnamed Wine';
                  const styleColor = STYLE_COLORS[wine.style ?? ''] ?? Colors.primary;
                  return (
                    <TouchableOpacity
                      key={wine.id}
                      style={styles.wineCard}
                      onPress={() => {
                        setSelectedDay(null);
                        navigation.navigate('WineDetail', { wineId: wine.id });
                      }}
                      activeOpacity={0.8}
                    >
                      {wine.photo ? (
                        <Image source={{ uri: wine.photo }} style={styles.winePhoto} />
                      ) : (
                        <View style={[styles.winePhotoPlaceholder, { backgroundColor: styleColor + '22' }]}>
                          <Text style={styles.winePlaceholderEmoji}>🍷</Text>
                        </View>
                      )}
                      <View style={styles.wineInfo}>
                        <Text style={styles.wineName} numberOfLines={1}>{displayName}</Text>
                        <View style={styles.wineMeta}>
                          {wine.style && (
                            <View style={[styles.styleBadge, { backgroundColor: styleColor }]}>
                              <Text style={styles.styleBadgeText}>{wine.style.toUpperCase()}</Text>
                            </View>
                          )}
                          {wine.vintage ? <Text style={styles.wineMetaText}>{wine.vintage}</Text> : null}
                          {wine.country ? <Text style={styles.wineMetaText}>{wine.country}</Text> : null}
                        </View>
                        {wine.grapes && wine.grapes.length > 0 && (
                          <Text style={styles.wineGrapes} numberOfLines={1}>{wine.grapes.join(', ')}</Text>
                        )}
                        {wine.rating != null && (
                          <Text style={styles.wineRating}>
                            {'★'.repeat(Math.round(wine.rating / 2))}
                            {'☆'.repeat(5 - Math.round(wine.rating / 2))}
                            {' '}{wine.rating}/10
                          </Text>
                        )}
                      </View>
                      <View style={styles.wineRight}>
                        {wine.liked === true && <Text style={styles.likedIcon}>👍</Text>}
                        {wine.liked === false && <Text style={styles.likedIcon}>👎</Text>}
                        <Text style={styles.wineArrow}>›</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.background },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navArrow: {
    fontSize: 26,
    color: Colors.primary,
    fontWeight: '700',
    lineHeight: 32,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },

  dayNamesRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayNameCell: {
    width: '14.2857%',
    alignItems: 'center',
    paddingVertical: 7,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  cell: {
    width: '14.2857%',
    height: 58,
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 4,
  },
  dayNumCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumCircleToday: {
    backgroundColor: Colors.primaryLight,
  },
  dayNumCircleSelected: {
    backgroundColor: Colors.primary,
  },
  dayNum: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  dayNumToday: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  dayNumSelected: {
    color: Colors.white,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotPlus: {
    fontSize: 8,
    color: Colors.textMuted,
    fontWeight: '800',
    lineHeight: 10,
  },

  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  // Bottom sheet modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: '70%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  sheetClose: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '700',
    padding: 4,
  },
  sheetScroll: { flexGrow: 0 },
  sheetScrollContent: { gap: 10, paddingBottom: 4 },

  // Empty day state
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyDayIcon: { fontSize: 40 },
  emptyDayText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  startTastingBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 4,
  },
  startTastingBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptyDayClose: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
    paddingVertical: 4,
  },

  // Wine cards in modal
  wineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  winePhoto: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  winePhotoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  winePlaceholderEmoji: { fontSize: 22 },
  wineInfo: { flex: 1 },
  wineName: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 4,
  },
  wineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  styleBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  styleBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },
  wineMetaText: { fontSize: 12, color: Colors.textMuted },
  wineGrapes: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic', marginBottom: 2 },
  wineRating: { fontSize: 12, color: Colors.textMuted },
  wineRight: { alignItems: 'center', paddingLeft: 8, gap: 6 },
  likedIcon: { fontSize: 18 },
  wineArrow: { fontSize: 24, color: Colors.border, fontWeight: '300' },
});