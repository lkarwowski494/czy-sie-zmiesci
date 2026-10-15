/**
 * Czy się zmieści? (FitCheck) — RelocationService
 * Planowanie przeprowadzek: szacowanie floty, 4 fazy załadunku, boks self-storage (BRD B7, RD-49)
 */

import { DatabaseService } from '../data/db/database';
import {
  ClutterLevel,
  estimateRelocationVolume,
  RelocationEstimateResult,
} from '../domain/relocation/volumeEstimator';

export type MovingPhaseCategory = 'heavy_appliance' | 'base' | 'fillers' | 'first_night';

export interface PhasedInventoryGroup {
  readonly phase: MovingPhaseCategory;
  readonly phaseTitle: string;
  readonly loadingPriority: number; // 1 = ładowany na początku, 4 = na samym końcu
  readonly items: readonly Record<string, unknown>[];
  readonly totalWeightKg: number;
}

export interface PhasedLoadingPlanResult {
  readonly projectId: string;
  readonly volumeEstimation: RelocationEstimateResult;
  readonly phases: readonly PhasedInventoryGroup[];
  readonly totalInventoryItemsCount: number;
  readonly totalInventoryWeightKg: number;
  readonly recommendations: readonly string[];
}

export class RelocationService {
  constructor(private readonly db: DatabaseService) {}

  public createProject(params: {
    id: string;
    name: string;
    originAreaM2: number;
    residentsCount: number;
    clutterLevel: ClutterLevel;
  }): void {
    const estimation = estimateRelocationVolume({
      floorAreaM2: params.originAreaM2,
      residentsCount: params.residentsCount,
      clutterLevel: params.clutterLevel,
    });

    this.db.createRelocationProject({
      id: params.id,
      name: params.name,
      origin_type: 'apartment',
      origin_area_m2: params.originAreaM2,
      residents_count: params.residentsCount,
      clutter_level: params.clutterLevel,
      total_volume_m3: estimation.estimatedVolumeM3,
      total_weight_kg: estimation.estimatedWeightKg,
      recommended_vehicle_type: estimation.recommendedFleetType,
    });
  }

  public planPhasedLoading(
    projectId: string,
    cargoItemIds: readonly { itemId: string; isFirstNightBox?: boolean }[]
  ): PhasedLoadingPlanResult {
    const project = this.db.getRelocationProject(projectId);
    if (!project) {
      throw new Error(`Projekt przeprowadzki o ID ${projectId} nie istnieje`);
    }

    const estimation = estimateRelocationVolume({
      floorAreaM2: Number(project['origin_area_m2'] ?? 50),
      residentsCount: Number(project['residents_count'] ?? 2),
      clutterLevel: (project['clutter_level'] as ClutterLevel) ?? 'standard',
    });

    const allCargo = this.db.getCargoItems();

    const heavyApplianceItems: Record<string, unknown>[] = [];
    const baseItems: Record<string, unknown>[] = [];
    const fillerItems: Record<string, unknown>[] = [];
    const firstNightItems: Record<string, unknown>[] = [];

    let totalWeight = 0;

    for (const entry of cargoItemIds) {
      const item = allCargo.find(c => c['id'] === entry.itemId);
      if (!item) continue;

      const weight = Number(item['weight_kg']);
      totalWeight += weight;

      if (entry.isFirstNightBox) {
        firstNightItems.push(item);
      } else if (item['category'] === 'appliance' || weight >= 40) {
        heavyApplianceItems.push(item);
      } else if (Number(item['is_soft']) === 1 || weight < 5) {
        fillerItems.push(item);
      } else {
        baseItems.push(item);
      }
    }

    const phases: PhasedInventoryGroup[] = [
      {
        phase: 'heavy_appliance',
        phaseTitle: 'Faza 1: Ciężkie AGD i korpusy mebli (Dno / Przy grodzi)',
        loadingPriority: 1,
        items: heavyApplianceItems,
        totalWeightKg: heavyApplianceItems.reduce((sum, i) => sum + Number(i['weight_kg']), 0),
      },
      {
        phase: 'base',
        phaseTitle: 'Faza 2: Standardowe kartony i bryły stabilne',
        loadingPriority: 2,
        items: baseItems,
        totalWeightKg: baseItems.reduce((sum, i) => sum + Number(i['weight_kg']), 0),
      },
      {
        phase: 'fillers',
        phaseTitle: 'Faza 3: Wypełniacze, pościel i miękkie torby (Blokowanie luzów)',
        loadingPriority: 3,
        items: fillerItems,
        totalWeightKg: fillerItems.reduce((sum, i) => sum + Number(i['weight_kg']), 0),
      },
      {
        phase: 'first_night',
        phaseTitle: 'Faza 4: Karton „Pierwsza Noc” (Przy drzwiach kontenera / Ostatni)',
        loadingPriority: 4,
        items: firstNightItems,
        totalWeightKg: firstNightItems.reduce((sum, i) => sum + Number(i['weight_kg']), 0),
      },
    ];

    const recommendations: string[] = [
      `Rekomendowana flota: ${estimation.fleetDescription}`,
      `Optymalny boks w self-storage: min. ${estimation.recommendedSelfStorageAreaM2} m² (wysokość składowania 2.7m)`,
      'Pralkę i lodówkę zawsze mocuj pasami transportowymi bezpośrednio do grodzi czołowej furgonu',
      'Karton „Pierwsza Noc” musi być wyjęty jako pierwszy bez konieczności rozładowywania całego auta',
    ];

    return {
      projectId,
      volumeEstimation: estimation,
      phases,
      totalInventoryItemsCount: cargoItemIds.length,
      totalInventoryWeightKg: totalWeight,
      recommendations,
    };
  }

  /**
   * Generuje czytelny raport tekstowy w formacie Markdown (do druku, schowka lub eksportu pliku)
   */
  public generateMarkdownManifest(plan: PhasedLoadingPlanResult): string {
    const lines: string[] = [
      `# 🚚 Plan Przeprowadzki i Sekwencja Załadunku (FitCheck Manifest)`,
      `**Projekt:** ${plan.projectId}`,
      `**Szacowana kubatura całkowita:** ${plan.volumeEstimation.estimatedVolumeM3} m³ (${plan.volumeEstimation.estimatedWeightKg} kg)`,
      `**Rekomendowana flota:** ${plan.volumeEstimation.fleetDescription}`,
      `**Rekomendowany boks self-storage:** min. ${plan.volumeEstimation.recommendedSelfStorageAreaM2} m²`,
      `**Łączna liczba zinwentaryzowanych pozycji:** ${plan.totalInventoryItemsCount} szt. (${plan.totalInventoryWeightKg} kg)`,
      '',
      '---',
      '## 📋 Sekwencja Załadunku (Zasada 4 Fazy)',
      '',
    ];

    for (const phase of plan.phases) {
      lines.push(`### ${phase.phaseTitle}`);
      lines.push(`*Liczba przedmiotów: ${phase.items.length}, masa fazy: ${phase.totalWeightKg} kg*`);
      if (phase.items.length === 0) {
        lines.push('- *Brak przypisanych pozycji w tej fazie*');
      } else {
        for (const item of phase.items) {
          lines.push(
            `- **${item['name']}** (${item['length_cm']}×${item['width_cm']}×${item['height_cm']} cm, ${item['weight_kg']} kg)`
          );
        }
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('## 💡 Rekomendacje Bezpieczeństwa Logistycznego:');
    for (const rec of plan.recommendations) {
      lines.push(`- ${rec}`);
    }

    return lines.join('\n');
  }
}
