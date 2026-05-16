import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppHeader from '../../components/AppHeader';
import InfoModal from '../../components/InfoModal';
import { Colors } from '../../constants/colors';
import { useWineTasting } from '../../context/WineTastingContext';
import { saveWine } from '../../storage/wineStorage';
import { Wine } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const EMOJI_REACTIONS = ['😍', '😋', '🤔', '😐', '😬', '🤢'];

export default function ThinkScreen() {
  const navigation = useNavigation<Nav>();
  const { tasting, reset } = useWineTasting();

  const [liked, setLiked] = useState<boolean | null>(tasting.liked ?? null);
  const [rating, setRating] = useState<number | null>(tasting.rating ?? null);
  const [emoji, setEmoji] = useState<string>(tasting.notes?.match(/^(😍|😋|🤔|😐|😬|🤢)/)?.[0] ?? '');
  const [notes, setNotes] = useState(tasting.notes ?? '');

  const handleDone = async () => {
    const wine: Wine = {
      ...(tasting as Wine),
      id: tasting.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: tasting.createdAt ?? new Date().toISOString(),
      liked,
      rating,
      notes,
    };

    try {
      await saveWine(wine);
      reset();
      navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'MyTastings' }] });
    } catch {
      Alert.alert('Error', 'Could not save your tasting. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Step 4: Think" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <InfoModal
            title="Step 4: Think"
            body="Reflect on what you tasted. Did you enjoy it? Rate it and add any personal notes."
          />
        </View>
        <Text style={styles.heading}>Your Thoughts?</Text>

        {/* Liked / Disliked */}
        <Text style={styles.sectionLabel}>Did You Like It?</Text>
        <View style={styles.likeRow}>
          <TouchableOpacity
            style={[styles.likeBtn, liked === true && styles.likeBtnActive]}
            onPress={() => setLiked(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.likeBtnEmoji}>👍</Text>
            <Text style={[styles.likeBtnText, liked === true && { color: Colors.liked }]}>
              YES!
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dislikeBtn, liked === false && styles.dislikeBtnActive]}
            onPress={() => setLiked(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.likeBtnEmoji}>👎</Text>
            <Text style={[styles.likeBtnText, liked === false && { color: Colors.disliked }]}>
              NO
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rating */}
        <Text style={styles.sectionLabel}>Rating (out of 10):</Text>
        <View style={styles.ratingRow}>
          {RATINGS.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.ratingBtn, rating === r && styles.ratingBtnActive]}
              onPress={() => setRating(r)}
              activeOpacity={0.8}
            >
              <Text style={[styles.ratingText, rating === r && styles.ratingTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emoji Reaction */}
        <Text style={styles.sectionLabel}>Reaction:</Text>
        <View style={styles.emojiRow}>
          {EMOJI_REACTIONS.map(e => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
              onPress={() => setEmoji(emoji === e ? '' : e)}
              activeOpacity={0.8}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <Text style={styles.sectionLabel}>Notes:</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          placeholder="Add any tasting notes, pairings, or memories..."
          placeholderTextColor={Colors.textMuted}
          textAlignVertical="top"
        />

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.nextBar}>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneBtnText}>DONE — SAVE WINE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  topRow: { alignItems: 'center', marginBottom: 8 },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.text,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    textDecorationLine: 'underline',
    marginBottom: 12,
    marginTop: 4,
  },
  likeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  likeBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.liked,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  likeBtnActive: {
    backgroundColor: Colors.likedBg,
  },
  dislikeBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.disliked,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  dislikeBtnActive: {
    backgroundColor: Colors.dislikedBg,
  },
  likeBtnEmoji: { fontSize: 28 },
  likeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.textMuted,
  },
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  ratingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  ratingBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  ratingTextActive: {
    color: Colors.white,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  emojiBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  emojiText: { fontSize: 26 },
  notesInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.white,
    minHeight: 100,
    marginBottom: 8,
  },
  nextBar: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
