import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

async function openInstagram() {
  const appUrl = 'instagram://user?username=corkandfizz';
  const webUrl = 'https://www.instagram.com/corkandfizz';
  try {
    if (await Linking.canOpenURL(appUrl)) {
      Linking.openURL(appUrl);
    } else {
      Linking.openURL(webUrl);
    }
  } catch {
    Linking.openURL(webUrl);
  }
}

function HomeContent() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header block */}
      <View style={styles.headerBlock}>
        <Text style={styles.titleLine1}>Wine</Text>
        <Text style={styles.titleLine2}>Pocket Pal</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: Colors.btnAdd }]}
          onPress={() => navigation.navigate('AddWineType')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Start Tasting</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: Colors.btnView }]}
          onPress={() => navigation.navigate('MyTastings')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>My Tastings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: Colors.btnGuide }]}
          onPress={() => navigation.navigate('WineTastingGuide')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Wine Tasting Guide</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: Colors.btnProfile }]}
          onPress={() => navigation.navigate('MyProfile')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>My Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: Colors.btnWinery }]}
          onPress={() => navigation.navigate('WineryCheckIn')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Visit a Winery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#5B6E5B' }]}
          onPress={() => navigation.navigate('MyFlights')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>My Flights</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => Linking.openURL('https://www.corkandfizz.com')}>
          <Text style={[styles.footerText, styles.footerLink]}>Cork & Fizz, LLC</Text>
        </TouchableOpacity>
        <Text style={styles.footerDot}> · </Text>
        <TouchableOpacity onPress={openInstagram}>
          <Text style={[styles.footerText, styles.footerLink]}>Instagram</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <HomeContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.homeHeaderBg,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBlock: {
    backgroundColor: Colors.homeHeaderBg,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleLine1: {
    fontSize: 52,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.primaryDark,
    lineHeight: 60,
  },
  titleLine2: {
    fontSize: 52,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.primaryDark,
    lineHeight: 60,
  },
  buttonArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 36,
    gap: 16,
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  footer: {
    paddingBottom: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
  footerDot: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
