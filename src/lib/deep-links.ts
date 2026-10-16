/**
 * Czy się zmieści? (FitCheck) — Offline Peer-to-Peer Deep Links (Zadanie C4, DEC-20)
 * Protokół wymiany modeli przestrzeni, bagażników i mebli:
 * fitcheck://space?v=1&d=<base64>
 */

export interface SpaceSharePayload {
  v: 1;
  type: 'custom_space' | 'vehicle_space' | 'cargo_set' | 'roof_box';
  name: string;
  dimensions: {
    lengthMm: number;
    widthMm: number;
    heightMm: number;
    volumeLiters?: number;
  };
  features?: {
    wheelArches?: boolean;
    passThroughHole?: boolean;
    maxWeightKg?: number;
    notes?: string;
  };
  items?: Array<{
    name: string;
    lengthMm: number;
    widthMm: number;
    heightMm: number;
    weightKg?: number;
  }>;
  createdAt: string;
}

export type DecodeSpaceResult =
  | { success: true; payload: SpaceSharePayload }
  | { success: false; error: string };

/**
 * Bezpieczne kodowanie UTF-8 do Base64 (wspiera polskie znaki diakrytyczne)
 */
export function utf8ToBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64');
  }
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

/**
 * Bezpieczne dekodowanie Base64 do UTF-8
 */
export function base64ToUtf8(b64: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf8');
  }
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(b64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * Koduje model przestrzeni do formatu Deep Link `fitcheck://space?v=1&d=<base64>`
 */
export function encodeSpaceDeepLink(payload: SpaceSharePayload): string {
  const jsonStr = JSON.stringify(payload);
  const base64Data = utf8ToBase64(jsonStr);
  return `fitcheck://space?v=1&d=${encodeURIComponent(base64Data)}`;
}

/**
 * Dekoduje i weryfikuje link `fitcheck://space?v=1&d=<base64>`
 */
export function decodeSpaceDeepLink(url: string): DecodeSpaceResult {
  if (!url || typeof url !== 'string') {
    return { success: false, error: 'Nieprawidłowy lub pusty URL linku' };
  }

  // Weryfikacja protokołu
  if (!url.startsWith('fitcheck://space')) {
    return { success: false, error: 'Nieznany protokół — oczekiwano schematu fitcheck://space' };
  }

  try {
    const queryIdx = url.indexOf('?');
    if (queryIdx === -1) {
      return { success: false, error: 'Brak parametrów w linku (wymagany parametr d=)' };
    }

    const queryString = url.substring(queryIdx + 1);
    const params = new URLSearchParams(queryString);
    const version = params.get('v');
    const rawData = params.get('d');

    if (version !== '1') {
      return { success: false, error: `Nieobsługiwana wersja protokołu: v${version ?? 'brak'}` };
    }

    if (!rawData) {
      return { success: false, error: 'Brak zakodowanych danych modelu (parametr d)' };
    }

    const jsonString = base64ToUtf8(decodeURIComponent(rawData));
    const parsed = JSON.parse(jsonString) as SpaceSharePayload;

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Błędna struktura danych modelu' };
    }

    if (parsed.v !== 1) {
      return { success: false, error: 'Wersja payloadu niezgodna z v1' };
    }

    if (!parsed.name || typeof parsed.name !== 'string') {
      return { success: false, error: 'Brak nazwy przestrzeni w danych' };
    }

    if (
      !parsed.dimensions ||
      typeof parsed.dimensions.lengthMm !== 'number' ||
      typeof parsed.dimensions.widthMm !== 'number' ||
      typeof parsed.dimensions.heightMm !== 'number'
    ) {
      return { success: false, error: 'Brak prawidłowych wymiarów (lengthMm, widthMm, heightMm)' };
    }

    if (
      parsed.dimensions.lengthMm <= 0 ||
      parsed.dimensions.widthMm <= 0 ||
      parsed.dimensions.heightMm <= 0
    ) {
      return { success: false, error: 'Wymiary muszą być dodatnimi liczbami' };
    }

    return { success: true, payload: parsed };
  } catch (err: any) {
    return {
      success: false,
      error: `Błąd podczas dekodowania linku: ${err.message ?? String(err)}`,
    };
  }
}
