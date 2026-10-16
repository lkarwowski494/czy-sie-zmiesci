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
import { POPULAR_VEHICLES_PRESETS } from '../../src/data/presets/vehicles';
import { CARGO_ITEMS_PRESETS } from '../../src/data/presets/cargoItems';
import {
  calculateCrashPhysics,
  calculateLashingRequirements,
  evaluateApplianceTransportProtocol,
  TrunkFrictionSurface,
  ApplianceTransportOrientation,
} from '../../src/domain/physics/crashPhysicsSimulator';
import {
  calculateToleranceBounds,
  convertLength,
  STANDARD_REFERENCE_OBJECTS,
  MeasurementTool,
} from '../../src/domain/measuring/tapeMeasureAssistant';
import { SafetyEducationView } from '../../src/components/SafetyEducationView';
import { MultiCheckerMatrixView } from '../../src/components/MultiCheckerMatrixView';
import { ScreenRuler } from '../../src/components/ScreenRuler';

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

  // Stan dla Crash Simulator (BR-EDU-002)
  const [crashMassKg, setCrashMassKg] = useState('9');
  const [crashSpeedKmh, setCrashSpeedKmh] = useState(50);
  const [frictionSurface, setFrictionSurface] = useState<TrunkFrictionSurface>('RUBBER_MAT');
  const [applianceType, setApplianceType] = useState<'REFRIGERATOR' | 'WASHING_MACHINE' | 'TV_OLED'>('REFRIGERATOR');
  const [applianceOrient, setApplianceOrient] = useState<ApplianceTransportOrientation>('HORIZONTAL_FLAT');

  // Stan dla Asystenta Miarki (BR-POM-001)
  const [measNominalCm, setMeasNominalCm] = useState('120');
  const [measTool, setMeasTool] = useState<MeasurementTool>('MANUAL_TAPE');
  const [convertVal, setConvertVal] = useState('100');
  const [convertFrom, setConvertFrom] = useState<'cm' | 'in' | 'm' | 'ft'>('cm');
  const [convertTo, setConvertTo] = useState<'cm' | 'in' | 'm' | 'ft'>('in');

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

  // Kalkulacja fizyki zderzenia
  const parsedCrashMass = Math.max(0.1, parseFloat(crashMassKg) || 1);
  const crashPhysics = calculateCrashPhysics(parsedCrashMass, crashSpeedKmh);
  const lashingResult = calculateLashingRequirements(parsedCrashMass, frictionSurface);
  const applianceProtocol = evaluateApplianceTransportProtocol(applianceType, applianceOrient);

  // Kalkulacja tolerancji pomiaru
  const parsedNominalMm = Math.max(1, (parseFloat(measNominalCm) || 10) * 10);
  const toleranceResult = calculateToleranceBounds(parsedNominalMm, measTool);

  const convertedResult = convertLength(
    Math.max(0, parseFloat(convertVal) || 0),
    convertFrom,
    convertTo
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Katalog Standardów & Baza</Text>
          <Text style={styles.subtitle}>Paczkomaty, linie lotnicze, 350+ aut, fizyka ładunku i miarka</Text>
        </View>

        {/* Sekcja 0: Szybki Multi-Checker (BR-LOT-001) */}
        <View style={styles.card}>
          <MultiCheckerMatrixView />
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
            <Text style={styles.resultLabel}>Rekomendowana skrytka:</Text>
            <Text
              style={[
                styles.resultHighlight,
                parcelResult.fits ? styles.successText : styles.alertText,
              ]}
            >
              {parcelResult.fits
                ? `Gabaryt ${parcelResult.recommendedSize} (${
                    parcelResult.recommendedSize === 'A'
                      ? '8 × 38 × 64 cm'
                      : parcelResult.recommendedSize === 'B'
                      ? '19 × 38 × 64 cm'
                      : '41 × 38 × 64 cm'
                  })`
                : 'PRZEKRACZA GABARYT C (Nie zmieści się)'}
            </Text>
            {parcelResult.warnings.map((w, idx) => (
              <Text key={idx} style={styles.resultDetails}>
                • {w}
              </Text>
            ))}
          </View>
        </View>

        {/* Sekcja 2: Sizer Linii Lotniczych */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✈️ Sizer Linii Lotniczych (IATA / Cabin Bag)</Text>
          <Text style={styles.infoText}>Wybierz linię lotniczą i wymiary walizki z kółkami:</Text>

          {/* Wybór linii */}
          <View style={styles.airlineRow}>
            {(['ryanair', 'wizzair', 'lot', 'lufthansa', 'easyjet'] as const).map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.airlineBtn, airline === a && styles.airlineBtnActive]}
                onPress={() => setAirline(a)}
              >
                <Text style={[styles.airlineBtnText, airline === a && styles.airlineBtnTextActive]}>
                  {a.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={bLen}
              onChangeText={setBLen}
              keyboardType="numeric"
              placeholder="Dł"
              placeholderTextColor="#64748B"
            />
            <Text style={styles.xText}>×</Text>
            <TextInput
              style={styles.input}
              value={bWidth}
              onChangeText={setBWidth}
              keyboardType="numeric"
              placeholder="Szer"
              placeholderTextColor="#64748B"
            />
            <Text style={styles.xText}>×</Text>
            <TextInput
              style={styles.input}
              value={bHeight}
              onChangeText={setBHeight}
              keyboardType="numeric"
              placeholder="Wys"
              placeholderTextColor="#64748B"
            />
          </View>

          <TouchableOpacity
            style={[styles.softToggle, isSoft && styles.softToggleActive]}
            onPress={() => setIsSoft(!isSoft)}
          >
            <Text style={styles.softToggleText}>
              {isSoft ? '🎒 Miękka torba (Można ścisnąć do 10%)' : '🧳 Sztywna walizka (Zero ugięcia)'}
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
          </View>
        </View>

        {/* Sekcja 3: Szkoła Pakowania & Crash Simulator (BR-EDU-001, BR-EDU-002) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💥 Szkoła Pakowania & Fizyka Zderzenia (BR-EDU)</Text>
          <Text style={styles.infoText}>
            Niezamocowany ładunek w czasie zderzenia przy przeciążeniu 25g (Euro NCAP) zachowuje się jak pocisk:
          </Text>

          {/* Szybki wybór masy */}
          <View style={styles.quickPresetRow}>
            {[
              { label: 'Laptop (2 kg)', val: '2' },
              { label: 'Zgrzewka wody (9 kg)', val: '9' },
              { label: 'Walizka L (20 kg)', val: '20' },
              { label: 'Worek cementu (25 kg)', val: '25' },
            ].map((p) => (
              <TouchableOpacity
                key={p.val}
                style={[styles.smallChip, crashMassKg === p.val && styles.smallChipActive]}
                onPress={() => setCrashMassKg(p.val)}
              >
                <Text style={[styles.smallChipText, crashMassKg === p.val && styles.smallChipTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Wybór prędkości */}
          <View style={styles.speedRow}>
            {[
              { label: '50 km/h (Miasto)', speed: 50 },
              { label: '90 km/h (Trasa)', speed: 90 },
              { label: '140 km/h (Autostrada)', speed: 140 },
            ].map((s) => (
              <TouchableOpacity
                key={s.speed}
                style={[styles.speedBtn, crashSpeedKmh === s.speed && styles.speedBtnActive]}
                onPress={() => setCrashSpeedKmh(s.speed)}
              >
                <Text style={[styles.speedBtnText, crashSpeedKmh === s.speed && styles.speedBtnTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Wynik fizyczny */}
          <View style={[styles.resultBox, styles.crashAlertBox]}>
            <View style={styles.crashMetricsRow}>
              <View style={styles.crashMetric}>
                <Text style={styles.crashMetricVal}>{crashPhysics.kineticEnergyJoules} J</Text>
                <Text style={styles.crashMetricLbl}>Energia Kinetyczna</Text>
              </View>
              <View style={styles.crashMetric}>
                <Text style={[styles.crashMetricVal, { color: '#F87171' }]}>
                  {crashPhysics.equivalentImpactMassKg} kg
                </Text>
                <Text style={styles.crashMetricLbl}>Siła uderzenia (25g)</Text>
              </View>
            </View>
            <Text style={styles.crashAdvisoryText}>⚠️ {crashPhysics.safetyAdvisory}</Text>
          </View>

          {/* Wymogi mocowania pasami (PN-EN 12195-1) */}
          <Text style={[styles.cardSubtitle, { marginTop: 12 }]}>
            🪢 Wymogi Mocowania Pasami (Norma PN-EN 12195-1)
          </Text>
          <View style={styles.surfaceRow}>
            {[
              { label: 'Mata gumowa (μ=0.6)', val: 'RUBBER_MAT' as TrunkFrictionSurface },
              { label: 'Welur (μ=0.3)', val: 'CARPET_VELOUR' as TrunkFrictionSurface },
              { label: 'Plastik (μ=0.2)', val: 'PLASTIC_SLICK' as TrunkFrictionSurface },
            ].map((sf) => (
              <TouchableOpacity
                key={sf.val}
                style={[styles.surfaceChip, frictionSurface === sf.val && styles.surfaceChipActive]}
                onPress={() => setFrictionSurface(sf.val)}
              >
                <Text style={[styles.surfaceChipText, frictionSurface === sf.val && styles.surfaceChipTextActive]}>
                  {sf.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.lashingSummaryBox}>
            <Text style={styles.lashingSummaryText}>
              Wymagana siła opasania: <Text style={styles.bold}>{lashingResult.minimumLashingCapacityDaN} daN</Text>
              {'\n'}Zalecana liczba pasów: <Text style={styles.bold}>{lashingResult.recommendedStrapsCount} pas(y)</Text> (LC 250 daN)
            </Text>
          </View>

          {/* Protokół AGD */}
          <Text style={[styles.cardSubtitle, { marginTop: 14 }]}>
            ❄️ Zasady Przewozu AGD i Czas Odstania Płynów
          </Text>
          <View style={styles.quickPresetRow}>
            {[
              { label: 'Lodówka', val: 'REFRIGERATOR' as const },
              { label: 'Pralka', val: 'WASHING_MACHINE' as const },
              { label: 'TV OLED', val: 'TV_OLED' as const },
            ].map((t) => (
              <TouchableOpacity
                key={t.val}
                style={[styles.smallChip, applianceType === t.val && styles.smallChipActive]}
                onPress={() => setApplianceType(t.val)}
              >
                <Text style={[styles.smallChipText, applianceType === t.val && styles.smallChipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.surfaceRow}>
            {[
              { label: 'Pionowo (Upright)', val: 'UPRIGHT' as ApplianceTransportOrientation },
              { label: 'Pochylenie 45°', val: 'TILTED_45_DEG' as ApplianceTransportOrientation },
              { label: 'Na płasko (Flat)', val: 'HORIZONTAL_FLAT' as ApplianceTransportOrientation },
            ].map((o) => (
              <TouchableOpacity
                key={o.val}
                style={[styles.surfaceChip, applianceOrient === o.val && styles.surfaceChipActive]}
                onPress={() => setApplianceOrient(o.val)}
              >
                <Text style={[styles.surfaceChipText, applianceOrient === o.val && styles.surfaceChipTextActive]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.applianceAlertBox}>
            <Text style={styles.applianceHoursText}>
              ⏱️ Wymagany czas odstania przed włączeniem: <Text style={styles.bold}>{applianceProtocol.minimumSettlingHours} godz.</Text>
            </Text>
            {applianceProtocol.requiresTransitBolts && (
              <Text style={styles.transitBoltAlert}>
                🔒 Wymóg założenia blokad transportowych bębna!
              </Text>
            )}
            {applianceProtocol.criticalWarnings.map((w, i) => (
              <Text key={i} style={styles.applianceWarnItem}>
                • {w}
              </Text>
            ))}
          </View>
        </View>

        {/* Sekcja Edukacji: Szkoła Bezpiecznego Ładunku & Quiz (BR-EDU-001, BR-EDU-003) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎓 Szkoła Ładunku & Quiz Prawny (BR-EDU)</Text>
          <Text style={styles.infoText}>
            Normy PN-EN 12195, Kodeks Drogowy (art. 61 PoRD) oraz zasady ryglowania Form-Fit:
          </Text>
          <SafetyEducationView />
        </View>

        {/* Sekcja 4: Asystent Miarki & Kalibrator Ekranowy (BR-POM) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📏 Asystent Miarki & Tolerancje (BR-POM)</Text>
          <Text style={styles.infoText}>
            Wprowadź pomiar i wybierz metodę pomiaru, aby wyznaczyć wymiar konserwatywny (maxMm):
          </Text>

          <View style={styles.measInputRow}>
            <TextInput
              style={[styles.input, { flex: 2 }]}
              value={measNominalCm}
              onChangeText={setMeasNominalCm}
              keyboardType="numeric"
              placeholder="Wymiar w cm"
              placeholderTextColor="#64748B"
            />
            <Text style={styles.unitText}>cm</Text>
          </View>

          {/* Wybór narzędzia */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolScroll}>
            {[
              { label: 'Dalmierz Laser (±0.5%)', val: 'LASER_METER' as MeasurementTool },
              { label: 'Miarka Taśmowa (±1%)', val: 'MANUAL_TAPE' as MeasurementTool },
              { label: 'LiDAR iPhone (±2%)', val: 'AR_LIDAR' as MeasurementTool },
              { label: 'Aparat AR (±5%)', val: 'AR_CAMERA' as MeasurementTool },
              { label: 'Wzrokowo (±10%)', val: 'VISUAL_ESTIMATE' as MeasurementTool },
            ].map((tool) => (
              <TouchableOpacity
                key={tool.val}
                style={[styles.toolChip, measTool === tool.val && styles.toolChipActive]}
                onPress={() => setMeasTool(tool.val)}
              >
                <Text style={[styles.toolChipText, measTool === tool.val && styles.toolChipTextActive]}>
                  {tool.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.toleranceBox}>
            <Text style={styles.toleranceHeader}>
              Przedział niepewności (±{toleranceResult.uncertaintyPercentage}%):
            </Text>
            <View style={styles.toleranceRow}>
              <View style={styles.tolItem}>
                <Text style={styles.tolVal}>{(toleranceResult.minMm / 10).toFixed(1)} cm</Text>
                <Text style={styles.tolLbl}>Minimalny</Text>
              </View>
              <View style={styles.tolItem}>
                <Text style={[styles.tolVal, { color: '#38BDF8' }]}>
                  {(toleranceResult.nominalMm / 10).toFixed(1)} cm
                </Text>
                <Text style={styles.tolLbl}>Nominalny</Text>
              </View>
              <View style={styles.tolItem}>
                <Text style={[styles.tolVal, { color: '#FBBF24' }]}>
                  {(toleranceResult.maxMm / 10).toFixed(1)} cm
                </Text>
                <Text style={styles.tolLbl}>Konserwatywny (max)</Text>
              </View>
            </View>
          </View>

          {/* Wzorce kalibracyjne */}
          <Text style={[styles.cardSubtitle, { marginTop: 12 }]}>
            💳 Standardowe Przedmioty Odniesienia (Kalibracja)
          </Text>
          <View style={styles.refObjectsList}>
            {STANDARD_REFERENCE_OBJECTS.map((obj) => (
              <View key={obj.id} style={styles.refObjItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.refObjName}>{obj.name}</Text>
                  <Text style={styles.refObjDesc}>{obj.description}</Text>
                </View>
                <Text style={styles.refObjDim}>
                  {obj.lengthMm} mm {obj.widthMm ? `× ${obj.widthMm} mm` : ''}
                </Text>
              </View>
            ))}
          </View>

          {/* Szybki konwerter */}
          <Text style={[styles.cardSubtitle, { marginTop: 12 }]}>
            🔄 Szybki Konwerter Jednostek
          </Text>
          <View style={styles.convertRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={convertVal}
              onChangeText={setConvertVal}
              keyboardType="numeric"
            />
            <Text style={styles.convertEquals}>
              {convertFrom} = <Text style={styles.bold}>{convertedResult}</Text> {convertTo}
            </Text>
          </View>
          <View style={styles.unitPillsRow}>
            {(['cm', 'in', 'm', 'ft'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitPill, convertFrom === u && styles.unitPillActive]}
                onPress={() => {
                  setConvertFrom(u);
                  if (convertTo === u) {
                    setConvertTo(u === 'cm' ? 'in' : 'cm');
                  }
                }}
              >
                <Text style={[styles.unitPillText, convertFrom === u && styles.unitPillTextActive]}>
                  Z {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Fizyczna linijka ekranowa 1:1 */}
          <ScreenRuler />
        </View>

        {/* Sekcja 5: Baza Modeli Pojazdów (Presets) */}
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
                <Text style={styles.specValue}>{selectedVehicle.trunk.lengthFloorMm / 10} cm</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Szer. min (nadkola)</Text>
                <Text style={styles.specValue}>{selectedVehicle.trunk.widthMinMm / 10} cm</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Otwór załadunku</Text>
                <Text style={styles.specValue}>
                  {selectedVehicle.trunk.apertureWidthMm / 10} × {selectedVehicle.trunk.apertureHeightMm / 10} cm
                </Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Próg załadunku</Text>
                <Text style={styles.specValue}>{selectedVehicle.trunk.thresholdHeightMm / 10} cm</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sekcja 6: Katalog Paczek Meblowych i Ładunków (Presets) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛋️ Katalog Mebli, Kartonów i AGD (B3)</Text>

          {/* Filtry kategorii */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            {(['wszystkie', 'karton', 'walizka', 'mebel_ikea', 'agd', 'sport'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterPill, cargoFilter === cat && styles.filterPillActive]}
                onPress={() => setCargoFilter(cat)}
              >
                <Text style={[styles.filterPillText, cargoFilter === cat && styles.filterPillTextActive]}>
                  {cat === 'wszystkie'
                    ? 'Wszystkie'
                    : cat === 'karton'
                    ? '📦 Kartony'
                    : cat === 'walizka'
                    ? '🧳 Walizki'
                    : cat === 'mebel_ikea'
                    ? '🛋️ Meble IKEA'
                    : cat === 'agd'
                    ? '⚡ AGD/RTV'
                    : '🚲 Sport'}
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
                  📏 {item.dimensionsMm.lengthMm / 10} × {item.dimensionsMm.widthMm / 10} ×{' '}
                  {item.dimensionsMm.heightMm / 10} cm
                </Text>
                <Text style={styles.cargoDesc}>{item.description}</Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.tagBadge}>Kategoria: {item.category}</Text>
                  {item.isFragile && <Text style={[styles.tagBadge, styles.fragileBadge]}>KRUCHE</Text>}
                  {item.allowStacking ? (
                    <Text style={[styles.tagBadge, styles.stackBadge]}>MOŻNA PIĘTROWAĆ</Text>
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
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 6,
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
  resultDetails: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
  successText: {
    color: '#34D399',
  },
  alertText: {
    color: '#F87171',
  },
  airlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  airlineBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  airlineBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  airlineBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  airlineBtnTextActive: {
    color: '#FFFFFF',
  },
  softToggle: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  softToggleActive: {
    borderColor: '#0284C7',
    backgroundColor: '#0369A1',
  },
  softToggleText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  statusRow: {
    color: '#CBD5E1',
    fontSize: 13,
    marginBottom: 4,
  },
  warningText: {
    color: '#FBBF24',
    fontSize: 11,
    marginTop: 2,
  },
  quickPresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  smallChip: {
    backgroundColor: '#0F172A',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  smallChipActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#0C4A6E',
  },
  smallChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  smallChipTextActive: {
    color: '#FFFFFF',
  },
  speedRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  speedBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  speedBtnActive: {
    borderColor: '#EF4444',
    backgroundColor: '#451A1A',
  },
  speedBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  speedBtnTextActive: {
    color: '#FCA5A5',
  },
  crashAlertBox: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  crashMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  crashMetric: {
    alignItems: 'center',
  },
  crashMetricVal: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  crashMetricLbl: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  crashAdvisoryText: {
    color: '#FDE68A',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  surfaceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  surfaceChip: {
    backgroundColor: '#0F172A',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  surfaceChipActive: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B',
  },
  surfaceChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  surfaceChipTextActive: {
    color: '#6EE7B7',
  },
  lashingSummaryBox: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  lashingSummaryText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  applianceAlertBox: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  applianceHoursText: {
    color: '#BAE6FD',
    fontSize: 13,
    marginBottom: 4,
  },
  transitBoltAlert: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  applianceWarnItem: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  measInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  unitText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  toolScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  toolChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toolChipActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#0C4A6E',
  },
  toolChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  toolChipTextActive: {
    color: '#FFFFFF',
  },
  toleranceBox: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  toleranceHeader: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 6,
  },
  toleranceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tolItem: {
    alignItems: 'center',
  },
  tolVal: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '800',
  },
  tolLbl: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  refObjectsList: {
    gap: 6,
    marginBottom: 10,
  },
  refObjItem: {
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refObjName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  refObjDesc: {
    color: '#64748B',
    fontSize: 10,
  },
  refObjDim: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  convertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  convertEquals: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  unitPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  unitPill: {
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  unitPillActive: {
    borderColor: '#0284C7',
    backgroundColor: '#0284C7',
  },
  unitPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  unitPillTextActive: {
    color: '#FFFFFF',
  },
  hScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  vehiclePill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  vehiclePillActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#0C4A6E',
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
  filterPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterPillActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#0369A1',
  },
  filterPillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
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
