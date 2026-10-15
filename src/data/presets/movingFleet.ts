/**
 * Czy się zmieści? (FitCheck) — Baza Pojazdów Floty Przeprowadzkowej i Self-Storage (RD-49, RD-50, B7)
 */

export interface VanSpecPreset {
  readonly id: string;
  readonly code: 'L1H1' | 'L2H2' | 'L3H2' | 'L4H3' | 'BOX_20M3';
  readonly name: string;
  readonly categoryB: boolean; // Dostępny na zwykłe prawo jazdy kat. B (DMC <= 3.5t)
  readonly cargoLengthMm: number;
  readonly cargoWidthMm: number;
  readonly cargoWidthBetweenArchesMm: number;
  readonly cargoHeightMm: number;
  readonly cargoVolumeM3: number;
  readonly maxPayloadKg: number;
  readonly hasTailLift: boolean;
  readonly typicalExamples: readonly string[];
  readonly bestFor: string;
}

export const MOVING_FLEET_PRESETS: readonly VanSpecPreset[] = [
  {
    id: 'van-l1h1',
    code: 'L1H1',
    name: 'Furgon Kompaktowy L1H1',
    categoryB: true,
    cargoLengthMm: 2600,
    cargoWidthMm: 1870,
    cargoWidthBetweenArchesMm: 1420,
    cargoHeightMm: 1660,
    cargoVolumeM3: 8.0,
    maxPayloadKg: 1350,
    hasTailLift: false,
    typicalExamples: ['Renault Trafic L1H1', 'Ford Transit Custom', 'VW Transporter T6.1'],
    bestFor: 'Małe przeprowadzki kawalerki, pojedyncze zakupy mebli, kartony i AGD',
  },
  {
    id: 'van-l2h2',
    code: 'L2H2',
    name: 'Furgon Średni L2H2 (Złoty Standard)',
    categoryB: true,
    cargoLengthMm: 3120,
    cargoWidthMm: 1870,
    cargoWidthBetweenArchesMm: 1420,
    cargoHeightMm: 1930,
    cargoVolumeM3: 11.5,
    maxPayloadKg: 1400,
    hasTailLift: false,
    typicalExamples: ['Fiat Ducato L2H2', 'Renault Master L2H2', 'Peugeot Boxer L2H2'],
    bestFor: 'Mieszkanie 1-2 pokojowe (do 45 m²), transport lodówki w pionie, sofy do 3m',
  },
  {
    id: 'van-l3h2',
    code: 'L3H2',
    name: 'Furgon Długi L3H2 (Maxi)',
    categoryB: true,
    cargoLengthMm: 3700,
    cargoWidthMm: 1870,
    cargoWidthBetweenArchesMm: 1420,
    cargoHeightMm: 1930,
    cargoVolumeM3: 13.0,
    maxPayloadKg: 1300,
    hasTailLift: false,
    typicalExamples: ['Mercedes Sprinter L3H2', 'Iveco Daily 35S', 'Fiat Ducato Maxi'],
    bestFor: 'Mieszkanie 2-3 pokojowe (do 65 m²), szafy w paczkach, duże komplety meblowe',
  },
  {
    id: 'van-l4h3',
    code: 'L4H3',
    name: 'Furgon Ekstra Długi i Wysoki L4H3 (Jumbo)',
    categoryB: true,
    cargoLengthMm: 4070,
    cargoWidthMm: 1870,
    cargoWidthBetweenArchesMm: 1420,
    cargoHeightMm: 2170,
    cargoVolumeM3: 17.0,
    maxPayloadKg: 1150,
    hasTailLift: false,
    typicalExamples: ['Renault Master L4H3', 'Iveco Daily Maxi', 'Mercedes Sprinter Extra Long'],
    bestFor: 'Duże mieszkanie 70-90 m², wysokie regały montowane w pionie, meble biurowe',
  },
  {
    id: 'van-box-20m3',
    code: 'BOX_20M3',
    name: 'Kontener Meblowy 20 m³ z Windą Załadowczą',
    categoryB: true,
    cargoLengthMm: 4200,
    cargoWidthMm: 2100,
    cargoWidthBetweenArchesMm: 2100, // Proste ściany bez nadkoli!
    cargoHeightMm: 2200,
    cargoVolumeM3: 19.4,
    maxPayloadKg: 950, // Winda zabiera ok. 350-400 kg z ładowności
    hasTailLift: true,
    typicalExamples: ['Iveco Daily Kontener', 'Renault Master Plandeka/Kontener'],
    bestFor: 'Dom jednorodzinny lub mieszkanie > 80 m², ciężkie pianina, sejfy, palety',
  },
];
