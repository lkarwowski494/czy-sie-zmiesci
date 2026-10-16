import {
  SpaceSharePayload,
  encodeSpaceDeepLink,
  decodeSpaceDeepLink,
  utf8ToBase64,
  base64ToUtf8,
} from '../deep-links';

describe('deep-links (Zadanie C4)', () => {
  const samplePayload: SpaceSharePayload = {
    v: 1,
    type: 'custom_space',
    name: 'Bagażnik Skoda Octavia IV Combi',
    dimensions: {
      lengthMm: 1050,
      widthMm: 1010,
      heightMm: 720,
      volumeLiters: 640,
    },
    features: {
      wheelArches: true,
      passThroughHole: true,
      maxWeightKg: 100,
      notes: 'Zmierzone z podniesioną podwójną podłogą',
    },
    items: [
      {
        name: 'Wózek dziecięcy Cybex',
        lengthMm: 850,
        widthMm: 550,
        heightMm: 350,
        weightKg: 12,
      },
    ],
    createdAt: '2026-10-16T10:00:00.000Z',
  };

  describe('UTF-8 Base64 roundtrip', () => {
    it('encodes and decodes strings with Polish diacritics', () => {
      const polishText = 'Zażółć gęślą jaźń — Bagażnik z podwójną podłogą';
      const b64 = utf8ToBase64(polishText);
      const decoded = base64ToUtf8(b64);
      expect(decoded).toBe(polishText);
    });
  });

  describe('encodeSpaceDeepLink & decodeSpaceDeepLink', () => {
    it('produces valid fitcheck://space URI and restores payload exactly', () => {
      const link = encodeSpaceDeepLink(samplePayload);
      expect(link).toMatch(/^fitcheck:\/\/space\?v=1&d=/);

      const result = decodeSpaceDeepLink(link);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.payload.name).toBe('Bagażnik Skoda Octavia IV Combi');
        expect(result.payload.dimensions.lengthMm).toBe(1050);
        expect(result.payload.dimensions.volumeLiters).toBe(640);
        expect(result.payload.features?.notes).toBe('Zmierzone z podniesioną podwójną podłogą');
        expect(result.payload.items?.[0].name).toBe('Wózek dziecięcy Cybex');
      }
    });

    it('rejects links with wrong protocol or invalid format', () => {
      expect(decodeSpaceDeepLink('').success).toBe(false);
      expect(decodeSpaceDeepLink('https://example.com/space').success).toBe(false);
      expect(decodeSpaceDeepLink('fitcheck://other?v=1&d=abc').success).toBe(false);
      expect(decodeSpaceDeepLink('fitcheck://space').success).toBe(false);
    });

    it('rejects unsupported protocol version', () => {
      const link = 'fitcheck://space?v=2&d=eyJ2IjoxfQ%3D%3D';
      const result = decodeSpaceDeepLink(link);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Nieobsługiwana wersja');
      }
    });

    it('rejects corrupted payload or missing fields', () => {
      const badBase64Link = 'fitcheck://space?v=1&d=bad_base64_data';
      const result = decodeSpaceDeepLink(badBase64Link);
      expect(result.success).toBe(false);

      // Missing dimensions
      const incomplete = { v: 1, name: 'Test' };
      const badDataLink = `fitcheck://space?v=1&d=${utf8ToBase64(JSON.stringify(incomplete))}`;
      const resIncomplete = decodeSpaceDeepLink(badDataLink);
      expect(resIncomplete.success).toBe(false);
    });
  });
});
