import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';

interface InfoModalProps {
  title: string;
  body: string;
  funFact?: string;
}

export default function InfoModal({ title, body, funFact }: InfoModalProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.infoBtn} onPress={() => setVisible(true)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Text style={styles.infoBtnText}>i</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.infoIconSmall}><Text style={styles.infoIconText}>i</Text></View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setVisible(false)}>
                <Text style={styles.closeText}>X</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
            {funFact && (
              <>
                <Text style={styles.funFactLabel}>FUN FACT:</Text>
                <Text style={styles.body}>{funFact}</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  infoBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.infoBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#EEF4FF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.infoBlue,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.infoBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#444',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.infoBlue,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  funFactLabel: {
    fontSize: 15,
    fontWeight: '800',
    textDecorationLine: 'underline',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
});
