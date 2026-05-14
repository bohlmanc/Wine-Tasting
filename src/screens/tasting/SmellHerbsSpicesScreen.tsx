import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SmellHerbsSpicesScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Step 2: Smell" />
      <View style={styles.container}>
        <Text style={styles.heading}>Herbs & Spices</Text>
        <Text style={styles.subheading}>Choose a category:</Text>

        <View style={styles.cards}>
          <TouchableOpacity
            style={[styles.card, { borderColor: Colors.herbsColor }]}
            onPress={() => navigation.navigate('SmellHerbSpiceDetail', { category: 'Herbs' })}
            activeOpacity={0.8}
          >
            <Text style={[styles.cardLabel, { color: Colors.herbsColor }]}>HERBS</Text>
            <Text style={styles.cardDesc}>Eucalyptus, Mint, Thyme & more</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { borderColor: Colors.herbsColor }]}
            onPress={() => navigation.navigate('SmellHerbSpiceDetail', { category: 'Spices' })}
            activeOpacity={0.8}
          >
            <Text style={[styles.cardLabel, { color: Colors.herbsColor }]}>SPICES</Text>
            <Text style={styles.cardDesc}>Pepper, Cinnamon, Vanilla & more</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: Colors.herbsColor }]}
          onPress={() => navigation.navigate('SmellMain')}
        >
          <Text style={[styles.backBtnText, { color: Colors.herbsColor }]}>BACK TO AROMAS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.text,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  cards: {
    gap: 16,
  },
  card: {
    borderWidth: 2.5,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  cardLabel: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backBtn: {
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
