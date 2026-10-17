# Definicja Ukończenia (Definition of Done — DoD) — Czy się zmieści? (FitCheck)

Dokument kontraktowy studia Apps4Brew zgodny z wymaganiem `BR-REL-017`.
Żadna funkcja ani wydanie nie może zostać uznane za ukończone przez programistę lub agenta AI bez spełnienia poniższych kryteriów.

---

## Kryteria Jakościowe (Twarde Bramki)

1. **Pokrycie logiki domenowej (BR-TEST-002):**
   - 100% linii, gałęzi, funkcji i instrukcji w `src/domain/` i `src/lib/`.
   - Żadnych wykluczeń `/* istanbul ignore */` ani `/* c8 ignore */`.

2. **Czystość testów i brak ostrzeżeń (BR-TEST-018):**
   - 0 ostrzeżeń `act()` w konsoli testowej.
   - 0 nieobsłużonych wywołań `console.error` / `console.warn` (twardy fail w `jest.setup.after-env.js`).

3. **Macierz testów AST (BR-TEST-028..031):**
   - 100% pokrycia we wszystkich 5 kategoriach:
     - `EKRAN` (100% tras `app/`)
     - `UI` (100% komponentów i przycisków)
     - `TEKST` (100% kluczy tłumaczeń)
     - `LOGIKA` (100% funkcji domenowych)
     - `WYMIAR` (100% unii typów i skrajności)
   - Zero nieudokumentowanych wyjątków w `tests/matrix-exceptions.json`.

4. **16 Strażników interakcji S1–S16 (NFR-INT-001..016):**
   - `S1` Zakaz podwójnego tapnięcia (debouncing).
   - `S2` Potwierdzenie porzucenia brudnego formularza.
   - `S3` Potwierdzenie usunięcia elementu (swipe / delete).
   - `S4` Jawny przycisk zamknięcia `×` na każdym modalu (`testID="close-modal"`).
   - `S5` Zakaz dwuznacznych etykiet „Tak” / „Nie” (wymagane czasowniki akcji).
   - `S6`–`S16` Prawidłowe zachowanie klawiatury (`keyboardShouldPersistTaps="handled"`), stany puste i brak ślepych zaułków.

5. **Dostępność i Skrajne Wymiary (NFR-A11Y-001..008):**
   - Minimalne pole dotyku $\ge 44 \times 44\text{ pt}$.
   - Kontrast kolorów WCAG AA $\ge 4.5:1$ (dla małego tekstu) i $\ge 3:1$ (dla dużego tekstu) w jasnym i ciemnym motywie.
   - Obsługa skalowania czcionek Apple Dynamic Type `AX5` (brak obcinania tekstu).
   - Pełna czytelność i responsywność na ekranie `320 pt` szerokości (iPhone SE 1st gen).

6. **Higiena Wielojęzyczności i18n (NFR-I18N-001..008):**
   - `npm run check:i18n` przechodzi w 100% bez martwych i brakujących kluczy.
   - Zero polskich wycieków w słowniku angielskim (`tests/i18n-no-polish-in-en.test.tsx`).

7. **Trwałość danych i odporność na awarie (BR-TEST-022, BR-TEST-023):**
   - Rozdzielne pule po 10 kopii zapasowych (`fitcheck-` vs `fitcheck-przed-importem-` / `-czyszczeniem-`).
   - Ochrona uszkodzonego stanu `state_corrupt_*` z banerem i surowym JSON w polu `recovery`.
   - Konwersja bez dryfu zaokrągleń `wInKeep` (`RD-ENG-01`).

8. **Weryfikacja Natywna iOS i Bezpieczeństwo Publicznego Repozytorium (BR-REL-009..013, NFR-SEC):**
   - `node scripts/verify-native.mjs --app-json-only` kończy się kodem 0.
   - Brak kluczy prywatnych, certyfikatów i plików `.env` w repozytorium (`tests/public-repo.test.ts`).
   - Czystość marek handlowych (`tests/brands.contract.test.ts`).
   - Brak licencji copyleft (`node scripts/licenses.mjs`).
   - 100% offline — zero telemetrii sieciowej (`NFR-SEC-014`).

9. **Audyt 10 Niezależnych Agentów (BR-REL-015..016):**
   - Dokładnie **0 otwartych znalezisk KRYTYCZNYCH i WYSOKICH** w Rundzie 2.
   - Wszystkie naprawione znaleziska pokryte dedykowanymi testami w `tests/audit-fixes.test.tsx`.

10. **Bramka Główna:**
    - Polecenie `npm run verify` kończy się kodem `0` w 100% na zielono.
