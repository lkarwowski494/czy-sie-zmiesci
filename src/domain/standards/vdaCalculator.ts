/**
 * Czy się zmieści? (FitCheck) — Reguła RD-01: Przelicznik litrażu normy ISO 3832 / VDA (kostki 200x100x50 mm)
 */

export interface VdaCalculationResult {
  readonly vdaBlocksCount: number;
  readonly vdaVolumeLiters: number;
  readonly geometricRawVolumeLiters: number;
  readonly wastedVolumeLossPct: number;
}

export const VDA_BLOCK_DIMENSIONS_MM = {
  lengthMm: 200,
  widthMm: 100,
  heightMm: 50,
};

export const VDA_BLOCK_VOLUME_MM3 = 1_000_000; // 1 dm³ = 1 litr

export function calculateVdaCapacity(
  trunkDimensionsMm: { readonly lengthMm: number; readonly widthMm: number; readonly heightMm: number }
): VdaCalculationResult {
  const blocksX = Math.floor(trunkDimensionsMm.lengthMm / VDA_BLOCK_DIMENSIONS_MM.lengthMm);
  const blocksY = Math.floor(trunkDimensionsMm.widthMm / VDA_BLOCK_DIMENSIONS_MM.widthMm);
  const blocksZ = Math.floor(trunkDimensionsMm.heightMm / VDA_BLOCK_DIMENSIONS_MM.heightMm);

  const vdaBlocksCount = blocksX * blocksY * blocksZ;
  const vdaVolumeLiters = vdaBlocksCount; // 1 bloczek = 1 litr

  const rawVolumeMm3 =
    trunkDimensionsMm.lengthMm * trunkDimensionsMm.widthMm * trunkDimensionsMm.heightMm;
  const geometricRawVolumeLiters = Math.round(rawVolumeMm3 / 1_000_000);

  const lossPct = geometricRawVolumeLiters > 0
    ? Math.round(((geometricRawVolumeLiters - vdaVolumeLiters) / geometricRawVolumeLiters) * 100)
    : 0;

  return {
    vdaBlocksCount,
    vdaVolumeLiters,
    geometricRawVolumeLiters,
    wastedVolumeLossPct: lossPct,
  };
}
