import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { validateInPostLocker } from '../../src/domain/standards/parcelLockers';
import { validateAviationSizer, AirlineCode } from '../../src/domain/standards/aviationSizers';

export default function CatalogScreen() {
  // Stan dla Paczkomatu
  const [pLen, setPLen] = useState('40');
  const [pWidth, setPWidth] = useState('30');
  const [pHeight, setPHeight] = useState('15');

  // Stan dla Linii Lotniczych
  const [bLen, setBLen] = useState('55');
  const [bWidth, setBWidth] = useState('38');
  const [bHeight, setBHeight] = useState('20');
  const [isSoft, setIsSoft] = useState(false);
  const [airline, setAirline] = useState<AirlineCode>('ryanair');

  const parcelResult = validateInPostLocker(
    {
      lengthMm: (parseFloat(pLen) || 0) * 10,
      widthMm: (parseFloat(pWidth) || 0) * 10,
      heightMm: (parseFloat(pHeight) || 0) * 10,
    },
    5.0
  );

  const aviationResult = validateAviationSizer(
    {
      length: (parseFloat(bLen) || 0) * 10,
      width: (parseFloat(bWidth) || 0) * 10,
      height: (parseFloat(bHeight) || 0) * 10,
    },
    isSoft,
    airline
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Katalog Standardów</Text>
          <Text style={styles.subtitle}>Paczkomaty, sizery lotnicze, normy VDA</Text>
        </View>

        {/* Sekcja Paczkomaty InPost */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Weryfikator Paczkomatów InPost (RD-09)</Text>
          <Text style={styles.infoText}>Wymiary Twojej paczki w cm (Dł. × Szer. × Wys.):</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={pLen}
              onChangeText={setPLen}
              keyboardType="numeric"
              placeholder="Dł"
              placeholderTextColor="#64748B"
            />
            <Text style={styles.xText}>×</Text>
            <TextInput
              style={styles.input}
              value={pWidth}
              onChangeText={setPWidth}
              keyboardType="numeric"
              placeholder="Szer"
              placeholderTextColor="#64748B"
            />
            <Text style={styles.xText}>×</Text>
            <TextInput
              style={styles.input}
              value={pHeight}
              onChangeText={setPHeight}
              keyboardType="numeric"
              placeholder="Wys"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Dopasowanie do skrytki:</Text>
            <Text
              style={[
                styles.resultHighlight,
                parcelResult.fits ? styles.successText : styles.alertText,
              ]}
            >
              {parcelResult.fits
                ? `Pasuje do Gabarytu ${parcelResult.recommendedSize}`
                : 'Za duża na paczkomat!'}
            </Text>
            {parcelResult.warnings.map((w: string, i: number) => (
              <Text key={i} style={styles.warningText}>
                • {w}
              </Text>
            ))}
          </View>
        </View>

        {/* Sekcja Bagaż Lotniczy */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✈️ Sizer Lotniczy (RD-14)</Text>
          <Text style={styles.infoText}>Wybierz linię lotniczą:</Text>
          <View style={styles.airlineSelector}>
            {(['ryanair', 'wizzair', 'lot', 'easyjet'] as AirlineCode[]).map(al => (
              <TouchableOpacity
                key={al}
                style={[styles.airlineBtn, airline === al && styles.airlineBtnActive]}
                onPress={() => setAirline(al)}
              >
                <Text
                  style={[
                    styles.airlineBtnText,
                    airline === al && styles.airlineBtnTextActive,
                  ]}
                >
                  {al.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.infoText, { marginTop: 12 }]}>
            Wymiary torby w cm (Dł. × Szer. × Wys.):
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={bLen}
              onChangeText={setBLen}
              keyboardType="numeric"
            />
            <Text style={styles.xText}>×</Text>
            <TextInput
              style={styles.input}
              value={bWidth}
              onChangeText={setBWidth}
              keyboardType="numeric"
            />
            <Text style={styles.xText}>×</Text>
            <TextInput
              style={styles.input}
              value={bHeight}
              onChangeText={setBHeight}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsSoft(!isSoft)}
          >
            <Text style={styles.checkboxText}>{isSoft ? '☑️' : '⬜'}</Text>
            <Text style={styles.toggleLabel}>
              Miękka torba (uwzględnia kompresję 10%)
            </Text>
          </TouchableOpacity>

          <View style={styles.resultBox}>
            <Text style={styles.statusRow}>
              Darmowy pod fotel:{' '}
              <Text
                style={{
                  fontWeight: '700',
                  color: aviationResult.fitsFreeSmallBag ? '#34D399' : '#F87171',
                }}
              >
                {aviationResult.fitsFreeSmallBag ? 'MIEŚCI SIĘ ✅' : 'NIE MIEŚCI SIĘ ❌'}
              </Text>
            </Text>
            <Text style={styles.statusRow}>
              Duży podręczny (Priority):{' '}
              <Text
                style={{
                  fontWeight: '700',
                  color: aviationResult.fitsPriorityCabinBag ? '#34D399' : '#F87171',
                }}
              >
                {aviationResult.fitsPriorityCabinBag ? 'MIEŚCI SIĘ ✅' : 'NIE MIEŚCI SIĘ ❌'}
              </Text>
            </Text>
            {aviationResult.warnings.map((w: string, i: number) => (
              <Text key={i} style={styles.warningText}>
                • {w}
              </Text>
            ))}
            {aviationResult.recommendations.map((r: string, i: number) => (
              <Text key={i} style={styles.recommendationText}>
                💡 {r}
              </Text>
            ))}
          </View>
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
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  xText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  resultBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#0F172A',
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  resultHighlight: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  successText: {
    color: '#34D399',
  },
  alertText: {
    color: '#F87171',
  },
  subtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  warningText: {
    fontSize: 11,
    color: '#FBBF24',
    marginTop: 4,
  },
  recommendationText: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 4,
  },
  airlineSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  airlineBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  airlineBtnActive: {
    backgroundColor: '#0284C7',
  },
  airlineBtnText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  airlineBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxText: {
    fontSize: 16,
    marginRight: 6,
  },
  toggleLabel: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  statusRow: {
    color: '#E2E8F0',
    fontSize: 13,
    marginBottom: 4,
  },
});
