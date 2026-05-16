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
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { useWineTasting } from '../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AddWineTypeScreen() {
  const navigation = useNavigation<Nav>();
  const { setTastingType } = useWineTasting();

  const choose = (type: 'quick' | 'full') => {
    setTastingType(type);
    navigation.navigate('BasicInfo');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Add New Wine" />
      <View style={styles.container}>
        <View style={styles.btnArea}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Colors.btnView }]}
            onPress={() => choose('quick')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Quick Sip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Colors.btnGuide }]}
            onPress={() => choose('full')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Guided Tasting</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnArea: {
    gap: 20,
    marginBottom: 60,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 28,
    alignItems: 'center',
  },
  btnText: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
