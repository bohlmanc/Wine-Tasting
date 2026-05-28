import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../navigation/navigationRef';
import { Colors } from '../constants/colors';

// TODO: Change to __DEV__ before shipping to production
const SHOW_DEV_REPORTER = true;

const STORAGE_KEY = '@debug_reports';

interface DebugReport {
  id: string;
  timestamp: string;
  screen: string;
  note: string;
}

async function loadReports(): Promise<DebugReport[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveReport(report: DebugReport): Promise<void> {
  const existing = await loadReports();
  existing.unshift(report);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

async function clearAllReports(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

function formatReportsForEmail(reports: DebugReport[]): string {
  if (reports.length === 0) return 'No reports saved.';
  const nl = '\r\n';
  const body = reports
    .map(
      (r, i) =>
        `--- Report ${i + 1} ---${nl}Screen: ${r.screen}${nl}Time: ${new Date(r.timestamp).toLocaleString()}${nl}Note: ${r.note}`
    )
    .join(`${nl}${nl}`);
  return `=== Wine Pocket Pal Bug Reports ===${nl}Exported: ${new Date().toLocaleString()}${nl}${nl}${body}`;
}

async function openMailWithReports(reports: DebugReport[]): Promise<void> {
  const subject = `Wine Pocket Pal – Bug Reports (${reports.length})`;
  const body = formatReportsForEmail(reports);
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  await Linking.openURL(url);
}

export default function DevReporter() {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [note, setNote] = useState('');
  const [reports, setReports] = useState<DebugReport[]>([]);

  if (!SHOW_DEV_REPORTER) return null;

  const currentScreen = navigationRef.isReady()
    ? (navigationRef.getCurrentRoute()?.name ?? 'Unknown')
    : 'Unknown';

  const handleOpen = () => {
    setNote('');
    setViewMode(false);
    setModalVisible(true);
  };

  const handleReport = async () => {
    if (!note.trim()) return;
    await saveReport({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      screen: currentScreen,
      note: note.trim(),
    });
    setModalVisible(false);
    setNote('');
  };

  const handleViewSaved = async () => {
    setReports(await loadReports());
    setViewMode(true);
  };

  const handleClearAll = async () => {
    await clearAllReports();
    setReports([]);
  };

  const handleExportAll = () => openMailWithReports(reports);

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={handleOpen} activeOpacity={0.8}>
        <Text style={styles.fabText}>🐛</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.sheet}>
            {!viewMode ? (
              <>
                <Text style={styles.title}>Report Issue</Text>
                <Text style={styles.screenLabel}>
                  Screen: <Text style={styles.screenName}>{currentScreen}</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Describe the issue..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={4}
                  value={note}
                  onChangeText={setNote}
                  autoFocus
                />
                <View style={styles.row}>
                  <TouchableOpacity onPress={handleViewSaved} style={styles.btnSecondary}>
                    <Text style={styles.btnSecondaryText}>View Saved</Text>
                  </TouchableOpacity>
                  <View style={styles.rowRight}>
                    <TouchableOpacity
                      style={styles.btnCancel}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.btnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnReport, !note.trim() && styles.btnDisabled]}
                      onPress={handleReport}
                      disabled={!note.trim()}
                    >
                      <Text style={styles.btnReportText}>Report</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.title}>Saved Reports ({reports.length})</Text>
                <ScrollView style={styles.reportList}>
                  {reports.length === 0 ? (
                    <Text style={styles.emptyText}>No reports yet.</Text>
                  ) : (
                    reports.map((r) => (
                      <View key={r.id} style={styles.reportItem}>
                        <Text style={styles.reportMeta}>
                          {r.screen} · {new Date(r.timestamp).toLocaleString()}
                        </Text>
                        <Text style={styles.reportNote}>{r.note}</Text>
                      </View>
                    ))
                  )}
                </ScrollView>
                <View style={styles.row}>
                  <TouchableOpacity onPress={handleClearAll} style={styles.btnSecondary}>
                    <Text style={[styles.btnSecondaryText, { color: Colors.disliked }]}>
                      Clear All
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.rowRight}>
                    <TouchableOpacity
                      onPress={handleExportAll}
                      style={styles.btnSecondary}
                      disabled={reports.length === 0}
                    >
                      <Text
                        style={[
                          styles.btnSecondaryText,
                          { color: Colors.btnView },
                          reports.length === 0 && styles.btnDisabled,
                        ]}
                      >
                        Export All
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnCancel}
                      onPress={() => setViewMode(false)}
                    >
                      <Text style={styles.btnCancelText}>Back</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 9999,
  },
  fabText: {
    fontSize: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  screenLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  screenName: {
    fontWeight: '600',
    color: Colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.surface,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    gap: 8,
  },
  btnSecondary: {
    padding: 8,
  },
  btnSecondaryText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  btnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  btnCancelText: {
    fontSize: 14,
    color: Colors.text,
  },
  btnReport: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnReportText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  reportList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  reportItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 10,
  },
  reportMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  reportNote: {
    fontSize: 14,
    color: Colors.text,
  },
});
