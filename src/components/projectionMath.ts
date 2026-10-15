/**
 * Czy się zmieści? (FitCheck) — Matematyka Rzutowania Przestrzennego (2.5D Izometria, Rzut z Góry, Rzut z Boku)
 * Czyste funkcje matematyczne do wizualizacji załadunku bagażnika w czasie rzeczywistym.
 */

import { Dimensions3D, Position3D, TrunkGeometry } from '../domain/geometry/types';

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface IsometricBox2D {
  readonly itemId: string;
  readonly color: string;
  readonly basePolygon: readonly Point2D[];
  readonly topPolygon: readonly Point2D[];
  readonly frontPolygon: readonly Point2D[];
  readonly sidePolygon: readonly Point2D[];
  readonly center2D: Point2D;
  readonly sequenceOrder: number;
}

export const ISO_COS_30 = Math.cos(Math.PI / 6); // ~0.866
export const ISO_SIN_30 = Math.sin(Math.PI / 6); // 0.5

/**
 * Przekształcenie punktu 3D (x: wzdłuż auta, y: poprzecznie, z: wysokość od podłogi)
 * na współrzędne ekranowe 2D w rzucie izometrycznym.
 */
export function project3DToIsometric(
  pos: Position3D,
  scale: number,
  origin: Point2D
): Point2D {
  // Izometria: X idzie w prawo-dół (30°), Y idzie w lewo-dół (30°), Z idzie pionowo w górę
  const screenX = origin.x + (pos.xMm * ISO_COS_30 - pos.yMm * ISO_COS_30) * scale;
  const screenY = origin.y + (pos.xMm * ISO_SIN_30 + pos.yMm * ISO_SIN_30 - pos.zMm) * scale;

  return { x: Math.round(screenX), y: Math.round(screenY) };
}

/**
 * Obliczenie rzutu prostopadłościanu 3D na płaszczyznę 2D w rzucie izometrycznym
 */
export function calculateIsometricBox(
  pos: Position3D,
  dims: Dimensions3D,
  scale: number,
  origin: Point2D,
  itemId: string,
  sequenceOrder: number,
  color: string = '#38BDF8'
): IsometricBox2D {
  const x0 = pos.xMm;
  const x1 = pos.xMm + dims.lengthMm;
  const y0 = pos.yMm;
  const y1 = pos.yMm + dims.widthMm;
  const z0 = pos.zMm;
  const z1 = pos.zMm + dims.heightMm;

  // 8 wierzchołków bryły
  const p000 = project3DToIsometric({ xMm: x0, yMm: y0, zMm: z0 }, scale, origin);
  const p100 = project3DToIsometric({ xMm: x1, yMm: y0, zMm: z0 }, scale, origin);
  const p110 = project3DToIsometric({ xMm: x1, yMm: y1, zMm: z0 }, scale, origin);
  const p010 = project3DToIsometric({ xMm: x0, yMm: y1, zMm: z0 }, scale, origin);

  const p001 = project3DToIsometric({ xMm: x0, yMm: y0, zMm: z1 }, scale, origin);
  const p101 = project3DToIsometric({ xMm: x1, yMm: y0, zMm: z1 }, scale, origin);
  const p111 = project3DToIsometric({ xMm: x1, yMm: y1, zMm: z1 }, scale, origin);
  const p011 = project3DToIsometric({ xMm: x0, yMm: y1, zMm: z1 }, scale, origin);

  return {
    itemId,
    color,
    sequenceOrder,
    basePolygon: [p000, p100, p110, p010],
    topPolygon: [p001, p101, p111, p011],
    frontPolygon: [p100, p110, p111, p101],
    sidePolygon: [p010, p110, p111, p011],
    center2D: {
      x: Math.round((p000.x + p111.x) / 2),
      y: Math.round((p000.y + p111.y) / 2),
    },
  };
}

/**
 * Obliczenie rzutu z góry (Top-Down Floorplan)
 */
export function projectToTopView(
  pos: Position3D,
  dims: Dimensions3D,
  canvasWidth: number,
  trunk: TrunkGeometry
): { x: number; y: number; width: number; height: number } {
  const scale = canvasWidth / trunk.widthMaxMm;
  return {
    x: Math.round(pos.yMm * scale),
    y: Math.round(pos.xMm * scale),
    width: Math.round(dims.widthMm * scale),
    height: Math.round(dims.lengthMm * scale),
  };
}

/**
 * Obliczenie rzutu z boku (Side View ze skosem dachu)
 */
export function projectToSideView(
  pos: Position3D,
  dims: Dimensions3D,
  canvasWidth: number,
  trunk: TrunkGeometry
): { x: number; y: number; width: number; height: number } {
  const scale = canvasWidth / trunk.lengthFloorMm;
  const canvasHeight = trunk.heightRoofMm * scale;
  return {
    x: Math.round(pos.xMm * scale),
    y: Math.round(canvasHeight - (pos.zMm + dims.heightMm) * scale),
    width: Math.round(dims.lengthMm * scale),
    height: Math.round(dims.heightMm * scale),
  };
}
