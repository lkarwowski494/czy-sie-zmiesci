import {
  escapeCsvCell,
  formatCsv,
  buildBackup,
  wasStateCorrupt,
  recordCorruptState,
  resetCorruptFlag,
  parseAndValidateBackup,
  AUTO_RE,
  SAFETY_RE,
  poolKey,
  rotatePool,
  AUTO_KEEP,
} from '../backup';
import * as FileSystem from 'expo-file-system/legacy';

describe('Backup Rotations, Corrupt State & CSV Escape (BR-TEST-022, BR-TEST-023, NFR-SEC-015)', () => {
  beforeEach(() => {
    resetCorruptFlag();
    jest.clearAllMocks();
  });

  describe('escapeCsvCell — Formula Injection Protection (RD-ENG-10 / NFR-SEC-015)', () => {
    it('poprzedza niebezpieczne znaki startowe apostrofem', () => {
      expect(escapeCsvCell('=SUM(A1:A5)')).toBe("\"'=SUM(A1:A5)\"");
      expect(escapeCsvCell('+cmd|\' /C calc\'!A0')).toBe("\"'+cmd|' /C calc'!A0\"");
      expect(escapeCsvCell('-HYPERLINK("http://attacker.com")')).toBe(
        "\"'-HYPERLINK(\"\"http://attacker.com\"\")\""
      );
      expect(escapeCsvCell('@IMPORTXML("url")')).toBe("\"'@IMPORTXML(\"\"url\"\")\"");
      expect(escapeCsvCell('\tmalicious')).toBe("\"'\tmalicious\"");
      expect(escapeCsvCell('\rmalicious')).toBe("\"'\rmalicious\"");
    });

    it('nie modyfikuje zwykłych liczb ujemnych', () => {
      expect(escapeCsvCell('-12.5')).toBe('-12.5');
      expect(escapeCsvCell('-100')).toBe('-100');
      expect(escapeCsvCell(-42)).toBe('-42');
    });

    it('podwaja wewnętrzne cudzysłowy i opakowuje w cudzysłów', () => {
      const text = 'Szafa "Kallax", szeroka';
      expect(escapeCsvCell(text)).toBe('"Szafa ""Kallax"", szeroka"');
    });

    it('formatCsv generuje poprawną strukturę CSV', () => {
      const headers = ['Nazwa', 'Wymiary', 'Waga'];
      const rows = [
        ['Paczka 1', '100x50x30 cm', '15 kg'],
        ['=cmd|calc', '-10.5', '2 kg'],
      ];
      const csv = formatCsv(headers, rows);
      expect(csv).toContain('Nazwa,Wymiary,Waga');
      expect(csv).toContain("\"'=cmd|calc\"");
      expect(csv).toContain('-10.5');
    });
  });

  describe('Ochrona uszkodzonego stanu (BR-TEST-023)', () => {
    it('wykrywa uszkodzony stan i rejestruje kopię state_corrupt_*', () => {
      expect(wasStateCorrupt()).toBe(false);

      expect(() => parseAndValidateBackup('{ uszkodzony json')).toThrow();
      expect(wasStateCorrupt()).toBe(true);

      const envelope = buildBackup({
        custom_spaces: [],
        user_cargo_items: [],
        pack_sessions: [],
        pack_session_items: [],
        relocation_projects: [],
        rooms: [],
        room_fixtures: [],
        access_pathways: [],
        relocation_items: [],
        garage_profiles: [],
        towbar_roof_configs: [],
      });

      // Pole recovery zawiera surową treść
      expect(envelope.recovery).toBe('{ uszkodzony json');
    });

    it('pozwala na zresetowanie flagi uszkodzenia po przywróceniu', () => {
      recordCorruptState('trash');
      expect(wasStateCorrupt()).toBe(true);
      resetCorruptFlag();
      expect(wasStateCorrupt()).toBe(false);
    });
  });

  describe('Dwie rozdzielne pule kopii i rotacja do 10 plików (RD-ENG-12 / BR-TEST-022)', () => {
    it('rotacja jednej puli nie narusza plików z drugiej puli', async () => {
      const dir = '/var/mobile/Documents/Backup/';
      // Symuluj 12 plików auto i 12 plików safety w tym samym katalogu
      const files: string[] = [];
      for (let i = 1; i <= 12; i++) {
        const sec = String(i).padStart(2, '0');
        files.push(`fitcheck-2026-10-15-1200${sec}.json`);
        files.push(`fitcheck-przed-importem-2026-10-15-1200${sec}.json`);
      }

      (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValue(files);

      // Rotuj tylko pulę auto
      await rotatePool(dir, AUTO_RE);

      // Usunięte powinny być tylko 2 najstarsze pliki z puli auto
      const deletedFiles = (FileSystem.deleteAsync as jest.Mock).mock.calls.map((c) => c[0]);
      expect(deletedFiles).toContain(`${dir}fitcheck-2026-10-15-120001.json`);
      expect(deletedFiles).toContain(`${dir}fitcheck-2026-10-15-120002.json`);

      // Żaden plik safety nie mógł zostać usunięty!
      const safetyDeleted = deletedFiles.some((f) => f.includes('fitcheck-przed-'));
      expect(safetyDeleted).toBe(false);
    });

    it('obsługuje przyrostki -2, -3 dla kolizji w tej samej sekundzie', () => {
      const match1 = AUTO_RE.exec('fitcheck-2026-10-15-123045.json');
      const match2 = AUTO_RE.exec('fitcheck-2026-10-15-123045-2.json');
      const match3 = AUTO_RE.exec('fitcheck-2026-10-15-123045-3.json');

      expect(match1).not.toBeNull();
      expect(match2).not.toBeNull();
      expect(match3).not.toBeNull();

      expect(poolKey(match1!)).toBe('2026-10-15-123045-001');
      expect(poolKey(match2!)).toBe('2026-10-15-123045-002');
      expect(poolKey(match3!)).toBe('2026-10-15-123045-003');
    });
  });
});
