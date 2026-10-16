/**
 * Czy się zmieści? (FitCheck) — Wektorowy Komponent Kodów QR SVG (Zadanie C4, DEC-20)
 * Renderowanie wektorowe SVG kodów QR offline bez zewnętrznych serwisów sieciowych.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import QRCode from 'qrcode';

export interface QrCodeSvgProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Generuje dwuwymiarową macierz logiczną modułów QR kodu (do testów i wizualizacji)
 */
export function generateQrMatrix(
  value: string,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'
): { size: number; modules: boolean[][] } {
  const qr = QRCode.create(value, { errorCorrectionLevel });
  const size = qr.modules.size;
  const matrix: boolean[][] = [];

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      row.push(Boolean(qr.modules.get(r, c)));
    }
    matrix.push(row);
  }

  return { size, modules: matrix };
}

/**
 * Oblicza ścieżkę SVG pathData i liczbę modułów dla podanej wartości
 */
export function computeQrPathData(
  value: string,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'
): { pathData: string; moduleCount: number } {
  try {
    const qr = QRCode.create(value || 'fitcheck://empty', { errorCorrectionLevel });
    const count = qr.modules.size;
    let d = '';

    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.modules.get(row, col)) {
          d += `M${col},${row}h1v1h-1z `;
        }
      }
    }

    return { pathData: d, moduleCount: count };
  } catch {
    return { pathData: '', moduleCount: 21 };
  }
}

/**
 * Komponent wektorowy SVG renderujący ostry kod QR w dowolnej skali
 */
export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  value,
  size = 200,
  color = '#000000',
  backgroundColor = '#FFFFFF',
  style,
  testID,
}) => {
  const { pathData, moduleCount } = useMemo(() => computeQrPathData(value), [value]);

  if (!pathData) {
    return null;
  }

  return (
    <View style={[styles.container, { width: size, height: size }, style]} testID={testID}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${moduleCount} ${moduleCount}`}
      >
        <Rect width={moduleCount} height={moduleCount} fill={backgroundColor} />
        <Path d={pathData} fill={color} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
