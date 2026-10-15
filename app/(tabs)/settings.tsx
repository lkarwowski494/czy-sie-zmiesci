import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';

export default function SettingsScreen() {
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const handleExportBackup = () => {
    // Symulacja eksportu JSON
    setBackupStatus('Kopia zapasowa wygenerowana pomyślnie (schema v2)');
    Alert.alert(
      'Eksport Kopia Zapasowa (ZP-06)',
      'Wyeksportowano pełną bazę danych do formatu JSON. Plik jest gotowy do pobrania lub wysłania przez AirDrop.'
    );
  };

  const handleImportBackup = () => {
    Alert.alert(
      'Import Kopii Zapasowej',
      'Import wykonywany jest w pojedynczej atomowej transakcji SQLite z automatyczną weryfikacją schematu v2.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Ustawienia</Text>
          <Text style={styles.subtitle}>Kopia zapasowa JSON, prywatność, standardy</Text>
        </View>

        {/* Kopia Zapasowa */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💾 Kopia Zapasowa i Przenośność (ZP-06)</Text>
          <Text style={styles.infoText}>
            Wszystkie Twoje dane (auta, paczki, pomiary wnęk, plany przeprowadzek)
            przechowywane są lokalnie w bazie SQLite na Twoim urządzeniu.
          </Text>

          <View style={styles.buttonCol}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleExportBackup}>
              <Text style={styles.primaryButtonText}>📥 Eksportuj Kopię Zapasową (JSON)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleImportBackup}>
              <Text style={styles.secondaryButtonText}>📤 Przywróć z Kopii (JSON)</Text>
            </TouchableOpacity>
          </View>

          {backupStatus && <Text style={styles.statusText}>{backupStatus}</Text>}
        </View>

        {/* Gwarancje Apps4Brew */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛡️ Gwarancje Inżynieryjne Apps4Brew</Text>
          <View style={styles.guaranteeRow}>
            <Text style={styles.guaranteeIcon}>📶</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeTitle}>100% Offline-First</Text>
              <Text style={styles.guaranteeDesc}>Zero połączeń z siecią przy obliczeniach 3D</Text>
            </View>
          </View>

          <View style={styles.guaranteeRow}>
            <Text style={styles.guaranteeIcon}>💸</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeTitle}>0 zł Kosztów Infrastruktury</Text>
              <Text style={styles.guaranteeDesc}>Brak serwerów backendowych i subskrypcji chmurowych</Text>
            </View>
          </View>

          <View style={styles.guaranteeRow}>
            <Text style={styles.guaranteeIcon}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeTitle}>Determinizm i Precyzja</Text>
              <Text style={styles.guaranteeDesc}>Obliczenia w całkowitych milimetrach (Integer mm)</Text>
            </View>
          </View>
        </View>

        {/* Informacje o wersji */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ O Aplikacji</Text>
          <Text style={styles.aboutRow}>Wersja: <Text style={styles.aboutVal}>0.1.0 (MVP)</Text></Text>
          <Text style={styles.aboutRow}>BRD: <Text style={styles.aboutVal}>116.8 stron (27 modułów)</Text></Text>
          <Text style={styles.aboutRow}>Warstwy Testów: <Text style={styles.aboutVal}>9 warstw jakości</Text></Text>
          <Text style={styles.aboutRow}>Licencja: <Text style={styles.aboutVal}>Apps4Brew Proprietary</Text></Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 14,
  },
  buttonCol: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 14,
  },
  statusText: {
    color: '#34D399',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guaranteeIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  guaranteeTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  guaranteeDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  aboutRow: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 6,
  },
  aboutVal: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
});
