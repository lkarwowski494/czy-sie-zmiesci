/**
 * Czy się zmieści? (FitCheck) — Testy Rzutowania Przestrzennego (2.5D Izometria, Top, Side)
 */

import {
  project3DToIsometric,
  calculateIsometricBox,
  projectToTopView,
  projectToSideView,
} from '../projectionMath';
import { TrunkGeometry } from '../../domain/geometry/types';

describe('Projection Mathematics (Izometria 2.5D & Rzuty 2D)', () => {
  const origin = { x: 150, y: 80 };
  const scale = 0.1;

  const mockTrunk: TrunkGeometry = {
    lengthFloorMm: 1000,
    lengthRoofMm: 700,
    widthMinMm: 1000,
    widthMaxMm: 1200,
    heightRoofMm: 800,
    heightShelfMm: 500,
    apertureWidthMm: 1000,
    apertureHeightMm: 750,
    thresholdHeightMm: 50,
  };

  it('projects origin point (0, 0, 0) directly to screen origin', () => {
    const pt = project3DToIsometric({ xMm: 0, yMm: 0, zMm: 0 }, scale, origin);
    expect(pt.x).toBe(origin.x);
    expect(pt.y).toBe(origin.y);
  });

  it('projects height increase (Z axis) directly upward on screen (decreasing y)', () => {
    const pGround = project3DToIsometric({ xMm: 0, yMm: 0, zMm: 0 }, scale, origin);
    const pUp = project3DToIsometric({ xMm: 0, yMm: 0, zMm: 500 }, scale, origin);

    expect(pUp.x).toBe(pGround.x); // Pionowa oś Z nie przesuwa w poziomie
    expect(pUp.y).toBeLessThan(pGround.y); // Wyżej na ekranie to mniejsza współrzędna y
    expect(pGround.y - pUp.y).toBe(50); // 500 mm * 0.1 = 50 px
  });

  it('calculates full isometric box polygons and center', () => {
    const box = calculateIsometricBox(
      { xMm: 100, yMm: 100, zMm: 0 },
      { lengthMm: 400, widthMm: 300, heightMm: 200 },
      scale,
      origin,
      'box_1',
      1,
      '#38BDF8'
    );

    expect(box.itemId).toBe('box_1');
    expect(box.sequenceOrder).toBe(1);
    expect(box.basePolygon).toHaveLength(4);
    expect(box.topPolygon).toHaveLength(4);
    expect(box.frontPolygon).toHaveLength(4);
    expect(box.sidePolygon).toHaveLength(4);
    expect(box.center2D.x).toBeGreaterThan(0);
    expect(box.center2D.y).toBeGreaterThan(0);
  });

  it('projects top-down view properly scaling dimensions', () => {
    const rect = projectToTopView(
      { xMm: 200, yMm: 150, zMm: 0 },
      { lengthMm: 400, widthMm: 300, heightMm: 200 },
      240, // canvas width (240 / 1200 = 0.2 scale)
      mockTrunk
    );

    expect(rect.x).toBe(30); // 150 * 0.2
    expect(rect.y).toBe(40); // 200 * 0.2
    expect(rect.width).toBe(60); // 300 * 0.2
    expect(rect.height).toBe(80); // 400 * 0.2
  });

  it('projects side view properly positioning item along length and height', () => {
    const rect = projectToSideView(
      { xMm: 200, yMm: 150, zMm: 100 },
      { lengthMm: 300, widthMm: 300, heightMm: 200 },
      200, // canvas width (200 / 1000 = 0.2 scale, height = 800 * 0.2 = 160)
      mockTrunk
    );

    expect(rect.x).toBe(40); // 200 * 0.2
    expect(rect.width).toBe(60); // 300 * 0.2
    expect(rect.height).toBe(40); // 200 * 0.2
    // z + h = 100 + 200 = 300 mm. top = 160 - 300 * 0.2 = 100 px
    expect(rect.y).toBe(100);
  });
});
