import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AppHeader({ title, showBack = true, onBack }: AppHeaderProps) {
  const navigation = useNavigation<Nav>();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const menuItems: { label: string; screen: keyof RootStackParamList }[] = [
    { label: 'Home', screen: 'Home' },
    { label: 'My Tastings', screen: 'MyTastings' },
    { label: 'Tasting Calendar', screen: 'TastingCalendar' },
    { label: 'Wine Tasting Guide', screen: 'WineTastingGuide' },
    { label: 'My Profile', screen: 'MyProfile' },
  ];

  return (
    <>
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={styles.hamburger}>
            <View style={styles.line} />
            <View style={styles.line} />
            <View style={styles.line} />
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setMenuVisible(false)} activeOpacity={1}>
          <View style={styles.menu}>
            {menuItems.map(item => (
              <TouchableOpacity
                key={item.screen}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate(item.screen as any);
                }}
              >
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 14,
  },
  title: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    flex: 1,
    textAlign: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  hamburger: {
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 22,
    height: 2,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menu: {
    backgroundColor: Colors.white,
    marginTop: Platform.OS === 'ios' ? 100 : 90,
    marginRight: 12,
    borderRadius: 10,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
