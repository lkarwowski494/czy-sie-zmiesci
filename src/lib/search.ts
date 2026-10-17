/**
 * Czy się zmieści? (FitCheck) — Normalizacja wyszukiwania (RD-ENG-07 / NFR-INT-015)
 * Czysty moduł bez zależności od React / React Native (BR-TEST-001)
 */

/**
 * Normalizuje tekst wyszukiwarki:
 * - małe litery
 * - dekompozycja znaków diakrytycznych Unicode (NFD) i usunięcie znaków akcentów
 * - zamiana litery ł/Ł na l/L (Unicode NFD nie rozkłada litery ł)
 * - obcięcie białych znaków (trim)
 */
export function normSearch(s: string): string {
  if (!s || typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .replace(/[łŁ]/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
