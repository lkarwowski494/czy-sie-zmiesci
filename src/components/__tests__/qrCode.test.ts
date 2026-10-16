/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('View', props),
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => React.createElement('Svg', props),
    Path: (props: any) => React.createElement('Path', props),
    Rect: (props: any) => React.createElement('Rect', props),
  };
});

import { generateQrMatrix, computeQrPathData } from '../QrCodeSvg';

describe('QrCodeSvg & computeQrPathData (Zadanie C4)', () => {
  it('generates a square boolean matrix from deep link URI', () => {
    const deepLink = 'fitcheck://space?v=1&d=eyJ2IjoxLCJuYW1lIjoiVGVzdCJ9';
    const matrix = generateQrMatrix(deepLink, 'M');

    expect(matrix.size).toBeGreaterThanOrEqual(21);
    expect(matrix.modules.length).toBe(matrix.size);
    expect(matrix.modules[0].length).toBe(matrix.size);

    // QR position detection patterns in top-left corner must be true
    expect(matrix.modules[0][0]).toBe(true);
    expect(matrix.modules[0][1]).toBe(true);
    expect(matrix.modules[0][2]).toBe(true);
  });

  it('supports various error correction levels', () => {
    const text = 'fitcheck://space?v=1';
    const matrixL = generateQrMatrix(text, 'L');
    const matrixH = generateQrMatrix(text, 'H');

    expect(matrixL.size).toBeGreaterThanOrEqual(21);
    expect(matrixH.size).toBeGreaterThanOrEqual(21);
  });

  it('computes valid SVG pathData and moduleCount', () => {
    const res = computeQrPathData('fitcheck://space?v=1&d=sample');
    expect(res.moduleCount).toBeGreaterThanOrEqual(21);
    expect(res.pathData).toContain('M');
    expect(res.pathData).toContain('h1v1h-1z');
  });

  it('falls back gracefully on empty or invalid value', () => {
    const res = computeQrPathData('');
    expect(res.moduleCount).toBeGreaterThanOrEqual(21);
    expect(res.pathData).toBeTruthy();
  });
});
