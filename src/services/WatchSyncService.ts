/**
 * Czy się zmieści? (FitCheck) — WatchSyncService (watchOS 11 Companion, DEC-03, DEC-31)
 * Przygotowanie zoptymalizowanego snapshotu sekwencji załadunkowej dla Apple Watch (Wolne Ręce).
 */

import { PackedPlacement } from '../domain/geometry/types';
import { DatabaseService } from '../data/db/database';

export type WatchHapticType = 'STEP_COMPLETED' | 'HEAVY_ITEM_WARNING' | 'FRAGILE_ITEM_WARNING' | 'SESSION_FINISHED';

export interface WatchCargoMeta {
  readonly id: string;
  readonly name: string;
  readonly weightKg: number;
  readonly isFragile?: boolean;
}

export interface WatchStep {
  readonly stepIndex: number;
  readonly itemId: string;
  readonly itemName: string;
  readonly dimensionsCm: string; // np. "60 × 40 × 40 cm"
  readonly weightKg: number;
  readonly isFragile: boolean;
  readonly isHeavy: boolean; // >= 20 kg -> wymóg wnoszenia w 2 osoby (BHP)
  readonly positionDescription: string; // np. "Podłoga przy grodzi (lewa strona)"
  readonly recommendedHaptic: WatchHapticType;
  readonly isPacked: boolean;
}

export interface WatchSessionSnapshot {
  readonly sessionId: string;
  readonly vehicleName: string;
  readonly totalItemsCount: number;
  readonly packedItemsCount: number;
  readonly progressPercentage: number;
  readonly totalWeightKg: number;
  readonly currentStepIndex: number;
  readonly steps: readonly WatchStep[];
  readonly lastUpdatedTimestamp: number;
}

export class WatchSyncService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Generuje zoptymalizowany pod kątem pamięci podręcznej zegarka snapshot sesji
   */
  public generateWatchSnapshot(
    sessionId: string,
    vehicleName: string,
    packedPlacements: readonly PackedPlacement[],
    cargoCatalog: readonly WatchCargoMeta[]
  ): WatchSessionSnapshot {
    const itemMap = new Map(cargoCatalog.map((c) => [c.id, c]));
    const dbItems = this.db.getSessionItems(sessionId);
    const dbPackedMap = new Map(dbItems.map((row) => [String(row.id), Boolean(row.is_packed)]));

    // Sortowanie kroków: najpierw gródź (pos.x blisko 0), potem wyżej i ku klapie
    const sortedPlacements = [...packedPlacements].sort((a, b) => {
      if (a.positionMm.xMm !== b.positionMm.xMm) {
        return a.positionMm.xMm - b.positionMm.xMm; // Od przodu do tyłu
      }
      return a.positionMm.zMm - b.positionMm.zMm; // Od podłogi w górę
    });

    let packedCount = 0;
    let totalWeight = 0;

    const steps: WatchStep[] = sortedPlacements.map((placement, idx) => {
      const meta = itemMap.get(placement.itemId);
      const isFragile = meta?.isFragile ?? false;
      const weightKg = meta?.weightKg ?? 10;
      const isHeavy = weightKg >= 20;
      const isPacked = dbPackedMap.get(placement.itemId) ?? false;

      if (isPacked) packedCount++;
      totalWeight += weightKg;

      let posDesc = 'Środek przestrzeni ładunkowej';
      if (placement.positionMm.xMm < 300) {
        posDesc = 'Przy samej ścianie grodziowej';
      } else if (placement.positionMm.zMm === 0) {
        posDesc = 'Płasko na podłodze bagażnika';
      } else if (placement.positionMm.zMm > 400) {
        posDesc = 'Górna warstwa załadunku';
      }

      let haptic: WatchHapticType = 'STEP_COMPLETED';
      if (isFragile) {
        haptic = 'FRAGILE_ITEM_WARNING';
      } else if (isHeavy) {
        haptic = 'HEAVY_ITEM_WARNING';
      }

      return {
        stepIndex: idx + 1,
        itemId: placement.itemId,
        itemName: meta?.name ?? `Przedmiot #${idx + 1}`,
        dimensionsCm: `${Math.round(placement.orientedDimensionsMm.lengthMm / 10)} × ${Math.round(
          placement.orientedDimensionsMm.widthMm / 10
        )} × ${Math.round(placement.orientedDimensionsMm.heightMm / 10)} cm`,
        weightKg,
        isFragile,
        isHeavy,
        positionDescription: posDesc,
        recommendedHaptic: haptic,
        isPacked,
      };
    });

    const totalCount = steps.length;
    const progressPct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;
    const firstUnpackedIdx = steps.findIndex((s) => !s.isPacked);
    const currentStepIndex = firstUnpackedIdx >= 0 ? firstUnpackedIdx + 1 : totalCount;

    return {
      sessionId,
      vehicleName,
      totalItemsCount: totalCount,
      packedItemsCount: packedCount,
      progressPercentage: progressPct,
      totalWeightKg: totalWeight,
      currentStepIndex,
      steps,
      lastUpdatedTimestamp: Date.now(),
    };
  }

  /**
   * Odhaczenie kroku ruchem koronki (Digital Crown) lub tapnięciem na Apple Watch
   */
  public toggleWatchStepPacked(
    sessionId: string,
    itemId: string,
    isPacked: boolean
  ): { isFinished: boolean; nextHaptic: WatchHapticType } {
    this.db.toggleSessionItemPacked(itemId, isPacked);

    const items = this.db.getSessionItems(sessionId);
    const allPacked = items.length > 0 && items.every((i) => Boolean(i.is_packed));

    return {
      isFinished: allPacked,
      nextHaptic: allPacked ? 'SESSION_FINISHED' : 'STEP_COMPLETED',
    };
  }
}
