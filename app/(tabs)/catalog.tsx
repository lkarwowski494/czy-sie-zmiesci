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
import { POPULAR_VEHICLES_PRESETS, VehiclePreset } from '../../src/data/presets/vehicles';
import { CARGO_ITEMS_PRESETS, ExtendedCargoItemPreset } from '../../src/data/presets/cargoItems';

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

  // Stan dla Przeglądarki Pojazdów
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(POPULAR_VEHICLES_PRESETS[0].id);

  // Stan dla Przeglądarki Paczek
  const [cargoFilter, setCargoFilter] = useState<'wszystkie' | 'karton' | 'walizka' | 'mebel_ikea' | 'agd' | 'sport'>('wszystkie');

  const selectedVehicle = POPULAR_VEHICLES_PRESETS.find((v) => v.id === selectedVehicleId) ?? POPULAR_VEHICLES_PRESETS[0];

  const filteredCargo = CARGO_ITEMS_PRESETS.filter((item) => {
    if (cargoFilter === 'wszystkie') return true;
    return item.category === cargoFilter;
  });

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
          <Text style={styles.title}>Katalog Standardów & Baza</Text>
          <Text style={styles.subtitle}>Paczkomaty, linie lotnicze, 350+ modeli aut i gotowe meble</Text>
        </View>

        {/* Sekcja 1: Paczkomaty InPost */}
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

        {/* Sekcja 2: Sizery Linii Lotniczych */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✈️ Sizer Linii Lotniczych (RD-10)</Text>

          <View style={styles.airlineSelector}>
            {(['ryanair', 'wizzair', 'lot', 'lufthansa', 'easyjet'] as AirlineCode[]).map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.airlineBtn, airline === a && styles.airlineBtnActive]}
                onPress={() => setAirline(a)}
              >
                <Text
                  style={[
                    styles.airlineBtnText,
                    airline === a && styles.airlineBtnTextActive,
                  ]}
                >
                  {a.toUpperCase()}
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

        {/* Sekcja 3: Baza Modeli Pojazdów (Presets) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚗 Geometria Bagażników — Baza Pojazdów (B2)</Text>
          <Text style={styles.infoText}>Wybierz model, aby zobaczyć realne wymiary użytkowe:</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            {POPULAR_VEHICLES_PRESETS.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.vehiclePill, selectedVehicle.id === v.id && styles.vehiclePillActive]}
                onPress={() => setSelectedVehicleId(v.id)}
              >
                <Text
                  style={[
                    styles.vehiclePillText,
                    selectedVehicle.id === v.id && styles.vehiclePillTextActive,
                  ]}
                >
                  {v.make} {v.model}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.vehicleDetailsBox}>
            <View style={styles.vehicleHeaderRow}>
              <View>
                <Text style={styles.vehicleName}>
                  {selectedVehicle.make} {selectedVehicle.model}
                </Text>
                <Text style={styles.vehicleSub}>{selectedVehicle.generation} ({selectedVehicle.productionYears})</Text>
              </View>
              <View style={styles.vdaBadge}>
                <Text style={styles.vdaNumber}>{selectedVehicle.vdaVolumeLiters}</Text>
                <Text style={styles.vdaUnit}>L VDA</Text>
              </View>
            </View>

            <View style={styles.specsGrid}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Dł. podłogi</Text>
                <Text style={styles.specValue}>{Math.round(selectedVehicle.trunk.lengthFloorMm / 10)} cm</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Między nadkolami</Text>
                <Text style={styles.specValue}>{Math.round(selectedVehicle.trunk.widthMinMm / 10)} cm</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Wys. do dachu</Text>
                <Text style={styles.specValue}>{Math.round(selectedVehicle.trunk.heightRoofMm / 10)} cm</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Światło otworu</Text>
                <Text style={styles.specValue}>
                  {Math.round(selectedVehicle.trunk.apertureWidthMm / 10)} × {Math.round(selectedVehicle.trunk.apertureHeightMm / 10)} cm
                </Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Nośność dachu</Text>
                <Text style={styles.specValue}>{selectedVehicle.specs.maxRoofLoadKg} kg</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Nacisk na hak S</Text>
                <Text style={styles.specValue}>{selectedVehicle.specs.maxTowbarLoadKg} kg</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sekcja 4: Baza Paczek, Mebli & AGD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛋️ Baza Paczek, Mebli & AGD (B3)</Text>
          <Text style={styles.infoText}>Gotowe paczki flat-pack (IKEA), AGD i kartony:</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            {[
              { id: 'wszystkie', label: 'Wszystkie' },
              { id: 'karton', label: '📦 Kartony' },
              { id: 'walizka', label: '🧳 Walizki' },
              { id: 'mebel_ikea', label: '🪑 Meble' },
              { id: 'agd', label: '❄️ AGD/RTV' },
              { id: 'sport', label: '⚽ Sport' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.vehiclePill, cargoFilter === cat.id && styles.vehiclePillActive]}
                onPress={() => setCargoFilter(cat.id as any)}
              >
                <Text
                  style={[
                    styles.vehiclePillText,
                    cargoFilter === cat.id && styles.vehiclePillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.cargoList}>
            {filteredCargo.map((item) => (
              <View key={item.id} style={styles.cargoCard}>
                <View style={styles.cargoRow}>
                  <Text style={styles.cargoItemTitle}>{item.name}</Text>
                  <Text style={styles.cargoWeight}>{item.weightKg} kg</Text>
                </View>
                <Text style={styles.cargoDims}>
                  Wymiary: {Math.round(item.dimensionsMm.lengthMm / 10)} × {Math.round(item.dimensionsMm.widthMm / 10)} × {Math.round(item.dimensionsMm.heightMm / 10)} cm
                </Text>
                <Text style={styles.cargoDesc}>{item.description}</Text>
                <View style={styles.badgeRow}>
                  {item.rotationConstraint === 'Z_ONLY' && (
                    <Text style={styles.tagBadge}>PION WYMAGANY</Text>
                  )}
                  {item.isFragile && <Text style={[styles.tagBadge, styles.fragileBadge]}>KRUCHE</Text>}
                  {item.allowStacking ? (
                    <Text style={[styles.tagBadge, styles.stackBadge]}>SZTAFLOWALNE</Text>
                  ) : (
                    <Text style={[styles.tagBadge, styles.noStackBadge]}>NIE PIĘTROWAĆ</Text>
                  )}
                </View>
              </View>
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
  hScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  vehiclePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  vehiclePillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  vehiclePillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  vehiclePillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  vehicleDetailsBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  vehicleSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  vdaBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  vdaNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#38BDF8',
  },
  vdaUnit: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specItem: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 6,
    padding: 8,
  },
  specLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  cargoList: {
    gap: 10,
  },
  cargoCard: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cargoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cargoItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  cargoWeight: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    marginLeft: 8,
  },
  cargoDims: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 4,
    fontWeight: '600',
  },
  cargoDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  tagBadge: {
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#334155',
    color: '#CBD5E1',
  },
  fragileBadge: {
    backgroundColor: '#7F1D1D',
    color: '#FCA5A5',
  },
  stackBadge: {
    backgroundColor: '#064E3B',
    color: '#6EE7B7',
  },
  noStackBadge: {
    backgroundColor: '#451A03',
    color: '#FCD34D',
  },
});
