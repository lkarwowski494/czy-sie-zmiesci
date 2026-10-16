import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Share,
  Alert,
} from 'react-native';
import { QrCodeSvg } from '../../src/components/QrCodeSvg';
import { encodeSpaceDeepLink, SpaceSharePayload } from '../../src/lib/deep-links';
import {
  useUnitSystem,
  formatDimension,
  formatDimensions3D,
  formatVolume,
  formatWeight,
} from '../../src/lib/unit-converter';
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
import { Apps4BrewPassModal } from '../../src/components/Apps4BrewPassModal';
import { useAppAccess } from '../../src/services/app-access';
import { getDatabaseService, triggerAutoBackup } from '../../src/data/db';
import { t, useLang } from '../../src/lib/i18n';

export default function CatalogScreen() {
  useLang();
  const unitSystem = useUnitSystem();
  const access = useAppAccess();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

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

  // Udostępnianie
  const [sharingSpace, setSharingSpace] = useState<SpaceSharePayload | null>(null);
  const [shareLink, setShareLink] = useState<string>('');

  // Własne przedmioty z SQLite
  const [customItems, setCustomItems] = useState<Array<{
    id: string;
    name: string;
    category: string;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    weight_kg: number;
  }>>([]);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'karton' | 'walizka' | 'mebel_ikea' | 'agd' | 'sport'>('karton');
  const [newItemLength, setNewItemLength] = useState('60');
  const [newItemWidth, setNewItemWidth] = useState('40');
  const [newItemHeight, setNewItemHeight] = useState('40');
  const [newItemWeight, setNewItemWeight] = useState('10');

  useEffect(() => {
    try {
      const db = getDatabaseService();
      const items = db.getCargoItems();
      const userItems = items
        .filter((it: any) => !it.is_preset)
        .map((it: any) => ({
          id: String(it.id),
          name: String(it.name),
          category: String(it.category),
          length_cm: Number(it.length_cm),
          width_cm: Number(it.width_cm),
          height_cm: Number(it.height_cm),
          weight_kg: Number(it.weight_kg),
        }));
      setCustomItems(userItems);
    } catch {
      // fallback
    }
  }, []);

  const handleSaveCustomCargoItem = () => {
    if (!access.canCreate) {
      setIsPaywallOpen(true);
      return;
    }
    if (!newItemName.trim()) {
      Alert.alert(t('Błąd'), t('Podaj nazwę przedmiotu'));
      return;
    }
    const length_cm = parseFloat(newItemLength) || 50;
    const width_cm = parseFloat(newItemWidth) || 40;
    const height_cm = parseFloat(newItemHeight) || 30;
    const weight_kg = parseFloat(newItemWeight) || 5;

    try {
      const db = getDatabaseService();
      const id = `user_item_${Date.now()}`;
      db.insertCustomCargoItem({
        id,
        name: newItemName.trim(),
        category: newItemCategory,
        length_cm,
        width_cm,
        height_cm,
        weight_kg,
      });
      setCustomItems((prev) => [
        ...prev,
        {
          id,
          name: newItemName.trim(),
          category: newItemCategory,
          length_cm,
          width_cm,
          height_cm,
          weight_kg,
        },
      ]);
      triggerAutoBackup();
      access.recordProject();
      setIsAddItemModalOpen(false);
      setNewItemName('');
      Alert.alert(t('Sukces'), t('Dodano własny ładunek do bazy SQLite.'));
    } catch (err: any) {
      Alert.alert(t('Błąd zapisu'), err?.message ?? 'SQLite error');
    }
  };

  const selectedVehicle = POPULAR_VEHICLES_PRESETS.find((v) => v.id === selectedVehicleId) ?? POPULAR_VEHICLES_PRESETS[0];

  const handleShareVehicleSpace = (v: (typeof POPULAR_VEHICLES_PRESETS)[0]) => {
    const payload: SpaceSharePayload = {
      v: 1,
      type: 'vehicle_space',
      name: `${v.make} ${v.model} (${v.generation})`,
      dimensions: {
        lengthMm: v.trunk.lengthFloorMm,
        widthMm: v.trunk.widthMinMm,
        heightMm: v.trunk.heightRoofMm,
        volumeLiters: v.vdaVolumeLiters,
      },
      features: {
        wheelArches: true,
        passThroughHole: false,
        maxWeightKg: v.specs.grossVehicleWeightKg - v.specs.curbWeightKg,
        notes: `${v.bodyType}, próg załadunku: ${v.trunk.thresholdHeightMm} mm, dach: ${v.specs.maxRoofLoadKg} kg, hak: ${v.specs.maxTowbarLoadKg} kg`,
      },
      createdAt: new Date().toISOString(),
    };
    const link = encodeSpaceDeepLink(payload);
    setSharingSpace(payload);
    setShareLink(link);
  };

  const allCargoItems = [
    ...CARGO_ITEMS_PRESETS,
    ...customItems.map((ci) => ({
      id: ci.id,
      name: ci.name,
      category: ci.category as any,
      dimensionsMm: {
        lengthMm: ci.length_cm * 10,
        widthMm: ci.width_cm * 10,
        heightMm: ci.height_cm * 10,
      },
      weightKg: ci.weight_kg,
      description: t('Własny przedmiot użytkownika'),
      isFragile: false,
      allowStacking: true,
    })),
  ];

  const filteredCargo = allCargoItems.filter((item) => {
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
          <Text style={styles.title}>{t('Katalog Standardów & Baza')}</Text>
          <Text style={styles.subtitle}>
            {t('Paczkomaty, linie lotnicze, 350+ aut, fizyka ładunku i miarka')}
          </Text>
        </View>

        {!access.canCreate && (
          <TouchableOpacity
            style={styles.readOnlyBanner}
            onPress={() => setIsPaywallOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.readOnlyBannerText}>
              🔒 {t('Przeglądasz katalog w trybie do odczytu. Aktywuj Apps4Brew Pass ($0.99), aby dodawać własne przedmioty.')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Sekcja 0: Szybki Multi-Checker (BR-LOT-001) */}
        <View style={styles.card}>
          <MultiCheckerMatrixView />
        </View>

        {/* Sekcja 1: Paczkomaty InPost */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 {t('Weryfikator Paczkomatów InPost (RD-09)')}</Text>
          <Text style={styles.infoText}>{t('Wymiary Twojej paczki w cm (Dł. × Szer. × Wys.):')}</Text>
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
            <Text style={styles.resultLabel}>{t('Rekomendowana skrytka:')}</Text>
            <Text
              style={[
                styles.resultHighlight,
                parcelResult.fits ? styles.successText : styles.alertText,
              ]}
            >
              {parcelResult.fits
                ? `${t('Gabaryt')} ${parcelResult.recommendedSize} (${
                    parcelResult.recommendedSize === 'A'
                      ? '8 × 38 × 64 cm'
                      : parcelResult.recommendedSize === 'B'
                      ? '19 × 38 × 64 cm'
                      : '41 × 38 × 64 cm'
                  })`
                : t('PRZEKRACZA GABARYT C (Nie zmieści się)')}
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
          <Text style={styles.cardTitle}>✈️ {t('Sizer Linii Lotniczych (IATA / Cabin Bag)')}</Text>
          <Text style={styles.infoText}>{t('Wybierz linię lotniczą i wymiary walizki z kółkami:')}</Text>

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
              {isSoft
                ? t('👜 Miękka torba (Można upchnąć w sizerze +2 cm)')
                : t('🧳 Sztywna walizka skorupowa (Zero tolerancji)')}
            </Text>
          </TouchableOpacity>

          <View style={styles.resultBox}>
            <Text style={styles.statusRow}>
              {t('Przedmiot osobisty (pod fotel):')}{' '}
              <Text
                style={[
                  styles.bold,
                  aviationResult.fitsFreeSmallBag ? styles.successText : styles.alertText,
                ]}
              >
                {aviationResult.fitsFreeSmallBag ? t('MIEŚCI SIĘ') : t('ZA DUŻY')}
              </Text>
            </Text>
            <Text style={styles.statusRow}>
              {t('Bagaż kabinowy (nad głową):')}{' '}
              <Text
                style={[
                  styles.bold,
                  aviationResult.fitsPriorityCabinBag ? styles.successText : styles.alertText,
                ]}
              >
                {aviationResult.fitsPriorityCabinBag ? t('MIEŚCI SIĘ') : t('WYMAGA DOPŁATY')}
              </Text>
            </Text>
            {aviationResult.warnings.map((w, i) => (
              <Text key={i} style={styles.warningText}>
                • {w}
              </Text>
            ))}
          </View>
        </View>

        {/* Sekcja 3: Szkoła Pakowania & Crash Simulator (BR-EDU-001, BR-EDU-002) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💥 {t('Szkoła Pakowania & Fizyka Zderzenia (BR-EDU)')}</Text>
          <Text style={styles.infoText}>
            {t('Niezamocowany ładunek w czasie zderzenia przy przeciążeniu 25g (Euro NCAP) zachowuje się jak pocisk:')}
          </Text>

          {/* Szybki wybór masy */}
          <View style={styles.quickPresetRow}>
            {[
              { labelKey: 'Laptop (2 kg)', val: '2' },
              { labelKey: 'Zgrzewka wody (9 kg)', val: '9' },
              { labelKey: 'Walizka L (20 kg)', val: '20' },
              { labelKey: 'Worek cementu (25 kg)', val: '25' },
            ].map((p) => (
              <TouchableOpacity
                key={p.val}
                style={[styles.smallChip, crashMassKg === p.val && styles.smallChipActive]}
                onPress={() => setCrashMassKg(p.val)}
              >
                <Text style={[styles.smallChipText, crashMassKg === p.val && styles.smallChipTextActive]}>
                  {t(p.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Wybór prędkości */}
          <View style={styles.speedRow}>
            {[
              { labelKey: '50 km/h (Miasto)', speed: 50 },
              { labelKey: '90 km/h (Trasa)', speed: 90 },
              { labelKey: '140 km/h (Autostrada)', speed: 140 },
            ].map((s) => (
              <TouchableOpacity
                key={s.speed}
                style={[styles.speedBtn, crashSpeedKmh === s.speed && styles.speedBtnActive]}
                onPress={() => setCrashSpeedKmh(s.speed)}
              >
                <Text style={[styles.speedBtnText, crashSpeedKmh === s.speed && styles.speedBtnTextActive]}>
                  {t(s.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Wynik fizyczny */}
          <View style={[styles.resultBox, styles.crashAlertBox]}>
            <View style={styles.crashMetricsRow}>
              <View style={styles.crashMetric}>
                <Text style={styles.crashMetricVal}>{crashPhysics.kineticEnergyJoules} J</Text>
                <Text style={styles.crashMetricLbl}>{t('Energia Kinetyczna')}</Text>
              </View>
              <View style={styles.crashMetric}>
                <Text style={[styles.crashMetricVal, { color: '#F87171' }]}>
                  {formatWeight(crashPhysics.equivalentImpactMassKg, unitSystem)}
                </Text>
                <Text style={styles.crashMetricLbl}>{t('Siła uderzenia (25g)')}</Text>
              </View>
            </View>
            <Text style={styles.crashAdvisoryText}>⚠️ {crashPhysics.safetyAdvisory}</Text>
          </View>

          {/* Wymogi mocowania pasami (PN-EN 12195-1) */}
          <Text style={[styles.cardSubtitle, { marginTop: 12 }]}>
            🪢 {t('Wymogi Mocowania Pasami (Norma PN-EN 12195-1)')}
          </Text>
          <View style={styles.surfaceRow}>
            {[
              { labelKey: 'Mata gumowa (μ=0.6)', val: 'RUBBER_MAT' as TrunkFrictionSurface },
              { labelKey: 'Welur (μ=0.3)', val: 'CARPET_VELOUR' as TrunkFrictionSurface },
              { labelKey: 'Plastik (μ=0.2)', val: 'PLASTIC_SLICK' as TrunkFrictionSurface },
            ].map((sf) => (
              <TouchableOpacity
                key={sf.val}
                style={[styles.surfaceChip, frictionSurface === sf.val && styles.surfaceChipActive]}
                onPress={() => setFrictionSurface(sf.val)}
              >
                <Text style={[styles.surfaceChipText, frictionSurface === sf.val && styles.surfaceChipTextActive]}>
                  {t(sf.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.lashingSummaryBox}>
            <Text style={styles.lashingSummaryText}>
              {t('Wymagana siła opasania:')} <Text style={styles.bold}>{lashingResult.minimumLashingCapacityDaN} daN</Text>
              {'\n'}{t('Zalecana liczba pasów:')} <Text style={styles.bold}>{lashingResult.recommendedStrapsCount} pas(y)</Text> (LC 250 daN)
            </Text>
          </View>

          {/* Protokół AGD */}
          <Text style={[styles.cardSubtitle, { marginTop: 14 }]}>
            ❄️ {t('Zasady Przewozu AGD i Czas Odstania Płynów')}
          </Text>
          <View style={styles.quickPresetRow}>
            {[
              { labelKey: 'Lodówka', val: 'REFRIGERATOR' as const },
              { labelKey: 'Pralka', val: 'WASHING_MACHINE' as const },
              { labelKey: 'TV OLED', val: 'TV_OLED' as const },
            ].map((tp) => (
              <TouchableOpacity
                key={tp.val}
                style={[styles.smallChip, applianceType === tp.val && styles.smallChipActive]}
                onPress={() => setApplianceType(tp.val)}
              >
                <Text style={[styles.smallChipText, applianceType === tp.val && styles.smallChipTextActive]}>
                  {t(tp.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.surfaceRow}>
            {[
              { labelKey: 'Pionowo (Upright)', val: 'UPRIGHT' as ApplianceTransportOrientation },
              { labelKey: 'Pochylenie 45°', val: 'TILTED_45_DEG' as ApplianceTransportOrientation },
              { labelKey: 'Na płasko (Flat)', val: 'HORIZONTAL_FLAT' as ApplianceTransportOrientation },
            ].map((o) => (
              <TouchableOpacity
                key={o.val}
                style={[styles.surfaceChip, applianceOrient === o.val && styles.surfaceChipActive]}
                onPress={() => setApplianceOrient(o.val)}
              >
                <Text style={[styles.surfaceChipText, applianceOrient === o.val && styles.surfaceChipTextActive]}>
                  {t(o.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.applianceAlertBox}>
            <Text style={styles.applianceHoursText}>
              ⏱️ {t('Wymagany czas odstania przed włączeniem:')} <Text style={styles.bold}>{applianceProtocol.minimumSettlingHours} godz.</Text>
            </Text>
            {applianceProtocol.requiresTransitBolts && (
              <Text style={styles.transitBoltAlert}>
                🔒 {t('Wymóg założenia blokad transportowych bębna!')}
              </Text>
            )}
            {applianceProtocol.criticalWarnings.map((w, i) => (
              <Text key={i} style={styles.applianceWarnItem}>
                • {w}
              </Text>
            ))}
          </View>

          {/* Poradnik Eksperta */}
          <SafetyEducationView />
        </View>

        {/* Sekcja 4: Asystent Miarki & Tolerancja Pomiaru */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📏 {t('Asystent Miarki & Marginesy Niepewności (BR-POM)')}</Text>
          <Text style={styles.infoText}>
            {t('Wprowadź zmierzony wymiar i wybierz narzędzie, aby uwzględnić margines błędu:')}
          </Text>

          <View style={styles.measInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={measNominalCm}
              onChangeText={setMeasNominalCm}
              keyboardType="numeric"
            />
            <Text style={styles.unitText}>cm</Text>
          </View>

          {/* Narzędzie pomiarowe */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolScroll}>
            {(
              [
                { id: 'MANUAL_TAPE', labelKey: 'Taśma zwijana (±5 mm)' },
                { id: 'LASER_METER', labelKey: 'Dalmierz laserowy (±2 mm)' },
                { id: 'AR_LIDAR', labelKey: 'Apple LiDAR / AR (±15 mm)' },
                { id: 'VISUAL_ESTIMATE', labelKey: 'Na oko (±50 mm)' },
              ] as const
            ).map((tl) => (
              <TouchableOpacity
                key={tl.id}
                style={[styles.toolChip, measTool === tl.id && styles.toolChipActive]}
                onPress={() => setMeasTool(tl.id)}
              >
                <Text style={[styles.toolChipText, measTool === tl.id && styles.toolChipTextActive]}>
                  {t(tl.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.toleranceBox}>
            <Text style={styles.toleranceHeader}>
              {t('Przedział niepewności (±{pct}%):', { pct: toleranceResult.uncertaintyPercentage })}
            </Text>
            <View style={styles.toleranceRow}>
              <View style={styles.tolItem}>
                <Text style={styles.tolVal}>{formatDimension(toleranceResult.minMm / 10, unitSystem)}</Text>
                <Text style={styles.tolLbl}>{t('Minimalny')}</Text>
              </View>
              <View style={styles.tolItem}>
                <Text style={[styles.tolVal, { color: '#38BDF8' }]}>
                  {formatDimension(toleranceResult.nominalMm / 10, unitSystem)}
                </Text>
                <Text style={styles.tolLbl}>{t('Nominalny')}</Text>
              </View>
              <View style={styles.tolItem}>
                <Text style={[styles.tolVal, { color: '#FBBF24' }]}>
                  {formatDimension(toleranceResult.maxMm / 10, unitSystem)}
                </Text>
                <Text style={styles.tolLbl}>{t('Konserwatywny (max)')}</Text>
              </View>
            </View>
          </View>

          {/* Wzorce kalibracyjne */}
          <Text style={[styles.cardSubtitle, { marginTop: 12 }]}>
            💳 {t('Standardowe Przedmioty Odniesienia (Kalibracja)')}
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
            🔄 {t('Szybki Konwerter Jednostek')}
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
                  {t('Z {u}', { u })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Fizyczna linijka ekranowa 1:1 */}
          <ScreenRuler />
        </View>

        {/* Sekcja 5: Baza Modeli Pojazdów (Presets) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚗 {t('Geometria Bagażników — Baza Pojazdów (B2)')}</Text>
          <Text style={styles.infoText}>{t('Wybierz model, aby zobaczyć realne wymiary użytkowe:')}</Text>

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
                <Text style={styles.specLabel}>{t('Dł. podłogi')}</Text>
                <Text style={styles.specValue}>{formatDimension(selectedVehicle.trunk.lengthFloorMm / 10, unitSystem)}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{t('Szer. min (nadkola)')}</Text>
                <Text style={styles.specValue}>{formatDimension(selectedVehicle.trunk.widthMinMm / 10, unitSystem)}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{t('Otwór załadunku')}</Text>
                <Text style={styles.specValue}>
                  {formatDimension(selectedVehicle.trunk.apertureWidthMm / 10, unitSystem)} × {formatDimension(selectedVehicle.trunk.apertureHeightMm / 10, unitSystem)}
                </Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{t('Próg załadunku')}</Text>
                <Text style={styles.specValue}>{formatDimension(selectedVehicle.trunk.thresholdHeightMm / 10, unitSystem)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.shareSpaceBtn}
              onPress={() => handleShareVehicleSpace(selectedVehicle)}
              accessibilityLabel="Udostępnij wymiary przestrzeni za pomocą kodu QR lub linku"
            >
              <Text style={styles.shareSpaceBtnText}>📲 {t('Udostępnij Przestrzeń (Wektorowy Kod QR / Link)')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sekcja 6: Katalog Paczek Meblowych i Ładunków (Presets + SQLite) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛋️ {t('Katalog Mebli, Kartonów i AGD (B3)')}</Text>

          {/* Przycisk dodawania własnego ładunku do SQLite */}
          <TouchableOpacity
            style={styles.addCustomItemBtn}
            onPress={() => {
              if (!access.canCreate) {
                setIsPaywallOpen(true);
                return;
              }
              setIsAddItemModalOpen(true);
            }}
          >
            <Text style={styles.addCustomItemBtnText}>➕ {t('Dodaj Własny Przedmiot do SQLite')}</Text>
          </TouchableOpacity>

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
                    ? t('Wszystkie')
                    : cat === 'karton'
                    ? `📦 ${t('Kartony')}`
                    : cat === 'walizka'
                    ? `🧳 ${t('Walizki')}`
                    : cat === 'mebel_ikea'
                    ? `🛋️ ${t('Meble IKEA')}`
                    : cat === 'agd'
                    ? `⚡ ${t('AGD/RTV')}`
                    : `🚲 ${t('Sport')}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.cargoList}>
            {filteredCargo.map((item) => (
              <View key={item.id} style={styles.cargoCard}>
                <View style={styles.cargoRow}>
                  <Text style={styles.cargoItemTitle}>{item.name}</Text>
                  <Text style={styles.cargoWeight}>{formatWeight(item.weightKg, unitSystem)}</Text>
                </View>
                <Text style={styles.cargoDims}>
                  📏 {formatDimensions3D(item.dimensionsMm.lengthMm / 10, item.dimensionsMm.widthMm / 10, item.dimensionsMm.heightMm / 10, unitSystem)}
                </Text>
                <Text style={styles.cargoDesc}>{item.description}</Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.tagBadge}>{t('Kategoria:')} {item.category}</Text>
                  {item.isFragile && <Text style={[styles.tagBadge, styles.fragileBadge]}>{t('KRUCHE')}</Text>}
                  {item.allowStacking ? (
                    <Text style={[styles.tagBadge, styles.stackBadge]}>{t('MOŻNA PIĘTROWAĆ')}</Text>
                  ) : (
                    <Text style={[styles.tagBadge, styles.noStackBadge]}>{t('NIE PIĘTROWAĆ')}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal Dodawania Własnego Przedmiotu */}
      <Modal
        visible={isAddItemModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddItemModalOpen(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsAddItemModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>{t('Anuluj')}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('Nowy Ładunek (SQLite)')}</Text>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={handleSaveCustomCargoItem}
              >
                <Text style={[styles.modalCancelText, { color: '#10B981', fontWeight: '800' }]}>
                  {t('Zapisz')}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text style={styles.label}>{t('Nazwa przedmiotu:')}</Text>
              <TextInput
                style={[styles.input, { textAlign: 'left', marginBottom: 12 }]}
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="np. Stolik kawowy"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>{t('Kategoria:')}</Text>
              <View style={[styles.hScroll, { marginBottom: 12 }]}>
                {(['karton', 'walizka', 'mebel_ikea', 'agd', 'sport'] as const).map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.filterPill, newItemCategory === c && styles.filterPillActive]}
                    onPress={() => setNewItemCategory(c)}
                  >
                    <Text style={[styles.filterPillText, newItemCategory === c && styles.filterPillTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>{t('Wymiary (Dł. × Szer. × Wys. w cm):')}</Text>
              <View style={[styles.inputRow, { marginBottom: 12 }]}>
                <TextInput
                  style={styles.input}
                  value={newItemLength}
                  onChangeText={setNewItemLength}
                  keyboardType="numeric"
                  placeholder="Dł"
                />
                <Text style={styles.xText}>×</Text>
                <TextInput
                  style={styles.input}
                  value={newItemWidth}
                  onChangeText={setNewItemWidth}
                  keyboardType="numeric"
                  placeholder="Szer"
                />
                <Text style={styles.xText}>×</Text>
                <TextInput
                  style={styles.input}
                  value={newItemHeight}
                  onChangeText={setNewItemHeight}
                  keyboardType="numeric"
                  placeholder="Wys"
                />
              </View>

              <Text style={styles.label}>{t('Waga (kg):')}</Text>
              <TextInput
                style={[styles.input, { marginBottom: 16 }]}
                value={newItemWeight}
                onChangeText={setNewItemWeight}
                keyboardType="numeric"
                placeholder="np. 10"
              />

              <TouchableOpacity
                style={[styles.shareSpaceBtn, { backgroundColor: '#10B981' }]}
                onPress={handleSaveCustomCargoItem}
              >
                <Text style={styles.shareSpaceBtnText}>💾 {t('Zapisz do Bazy SQLite')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal Udostępniania Przestrzeni przez Kod QR i Deep Link */}
      <Modal
        visible={Boolean(sharingSpace)}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSharingSpace(null)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSharingSpace(null)}
                accessibilityLabel="Zamknij okno udostępniania"
              >
                <Text style={styles.modalCancelText}>{t('Anuluj')}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('Udostępnij Przestrzeń')}</Text>
              <View style={{ width: 60 }} />
            </View>

            {sharingSpace && (
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <Text style={styles.qrSpaceName}>{sharingSpace.name}</Text>
                <Text style={styles.qrSpaceDims}>
                  {formatDimensions3D(
                    sharingSpace.dimensions.lengthMm / 10,
                    sharingSpace.dimensions.widthMm / 10,
                    sharingSpace.dimensions.heightMm / 10,
                    unitSystem
                  )}
                  {sharingSpace.dimensions.volumeLiters
                    ? ` • ${formatVolume(sharingSpace.dimensions.volumeLiters, unitSystem)}`
                    : ''}
                </Text>

                {/* Wektorowy Kod QR SVG */}
                <View style={styles.qrWrapper}>
                  <QrCodeSvg
                    value={shareLink}
                    size={220}
                    color="#0F172A"
                    backgroundColor="#FFFFFF"
                  />
                </View>

                <Text style={styles.qrInstruction}>
                  {t('Zeskanuj ten kod z drugiego telefonu aparatem lub otwórz aplikacją Czy się zmieści?.')}
                </Text>

                <View style={styles.deepLinkBox}>
                  <Text style={styles.deepLinkLabel}>{t('Protokół Deep Link:')}</Text>
                  <Text style={styles.deepLinkText} numberOfLines={2}>
                    {shareLink}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalShareBtn}
                  onPress={async () => {
                    try {
                      await Share.share({
                        title: sharingSpace.name,
                        message: `Wymiary przestrzeni dla ${sharingSpace.name}:\n${shareLink}`,
                      });
                    } catch {
                      // ignore dismiss
                    }
                  }}
                >
                  <Text style={styles.modalShareBtnText}>📤 {t('Udostępnij Link w Innej Aplikacji')}</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal Paywalla impulsowego */}
      <Apps4BrewPassModal
        visible={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
      />
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
  readOnlyBanner: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  readOnlyBannerText: {
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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
  label: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
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
  addCustomItemBtn: {
    backgroundColor: '#065F46',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  addCustomItemBtnText: {
    color: '#ECFDF5',
    fontWeight: '700',
    fontSize: 13,
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
  shareSpaceBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  shareSpaceBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalCancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '600',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  modalScroll: {
    padding: 20,
    alignItems: 'center',
  },
  qrSpaceName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  qrSpaceDims: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  qrInstruction: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  deepLinkBox: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    marginBottom: 16,
  },
  deepLinkLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  deepLinkText: {
    color: '#34D399',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  modalShareBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  modalShareBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
