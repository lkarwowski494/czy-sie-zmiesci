import { wInKeep } from '../unit-converter';

describe('wInKeep — Inwariant braku dryfu zaokrągleń (BR-TEST-005 / RD-ENG-01)', () => {
  it('zachowuje dokładną wartość bazową gdy wpisano tę samą liczbę w jednostkach imperialnych', () => {
    // 61.23 kg to 135.0 lb
    const prevKg = 61.23;
    const kept = wInKeep('135', 'lb', prevKg);
    expect(kept).toBe(61.23); // zero dryfu, a nie 61.25 kg!

    const keptWithComma = wInKeep('135,0', 'lb', prevKg);
    expect(keptWithComma).toBe(61.23);
  });

  it('przelicza poprawnie nową wartość gdy użytkownik zmienił liczbę', () => {
    const prevKg = 61.23;
    const updated = wInKeep('140', 'lb', prevKg);
    // 140 lb / 2.2046226218 = 63.50 kg
    expect(updated).toBe(63.5);
  });

  it('obsługuje wymiary liniowe cm i in bez dryfu', () => {
    // 100 cm = 39.4 in
    const prevCm = 100;
    const kept = wInKeep('39.4', 'in', prevCm);
    expect(kept).toBe(100);

    const keptComma = wInKeep('39,4', 'in', prevCm);
    expect(keptComma).toBe(100);

    // Zmiana na 45 in -> 45 * 2.54 = 114.3 cm
    const changed = wInKeep('45', 'in', prevCm);
    expect(changed).toBe(114.3);
  });

  it('obsługuje kropkę i przecinek na polskiej klawiaturze iOS', () => {
    expect(wInKeep('80,5', 'kg', 80)).toBe(80.5);
    expect(wInKeep('80.5', 'kg', 80)).toBe(80.5);
  });

  it('weryfikuje 100 cykli otwarcia i ponownego zapisu bez dryfu (drift === 0)', () => {
    let currentBase = 123.45; // cm
    for (let i = 0; i < 100; i++) {
      // Wyświetlana wartość w calach: 123.45 / 2.54 = 48.6 in
      const displayedInches = (currentBase / 2.54).toFixed(1);
      // Użytkownik zatwierdza formularz bez zmian:
      currentBase = wInKeep(displayedInches, 'in', currentBase);
    }
    expect(currentBase).toBe(123.45);
  });
});
