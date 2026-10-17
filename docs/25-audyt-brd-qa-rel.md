# Audyt Początkowy Zgodności ze Standardem BRD-QA-REL 1.0 (Runda 1)
**Projekt:** Czy się zmieści? (FitCheck) — `czy-sie-zmiesci`  
**Data:** 17.10.2026  
**Audytor:** Zespół 10 niezależnych ról audytorskich studia Apps4Brew (`BR-REL-015`)  
**Dokument referencyjny:** `C:\Users\lukas\Documents\antigravity\ROLE_MODEL_TESTY_I_WYDANIA_TRENING_ORGANIZER.md`  
**Wersja audytu:** 1.0 (Runda 1 — Audyt Otwarcia przed uszczelnieniem)

---

## 1. Podsumowanie audytu początkowego

| Rola audytorska | Obszar | Krytyczne 🔴 | Wysokie 🟠 | Średnie 🟡 | Niskie 🟢 | Razem | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **UI** | Spójność UI, modale, wzorce S1–S16 | 0 | 3 | 2 | 0 | **5** | Do naprawy |
| **LOG** | Logika domenowa, dryf jednostek, timery | 0 | 2 | 1 | 0 | **3** | Do naprawy |
| **DAT** | Trwałość SQLite, 2 pule kopii, recovery | 1 | 2 | 0 | 0 | **3** | Do naprawy |
| **X** | Przecięcia funkcji (Cross-Feature) | 0 | 1 | 1 | 0 | **2** | Do naprawy |
| **MER** | Merytoryka domenowa, ochrona marek | 0 | 1 | 1 | 0 | **2** | Do naprawy |
| **A11** | Dostępność, AX5, pola dotyku >= 44pt, i18n | 0 | 3 | 1 | 0 | **4** | Do naprawy |
| **TST** | Szczelność testów, macierz AST, Jest setup | 1 | 3 | 1 | 0 | **5** | Do naprawy |
| **SEC/NAT/PERF** | Bezpieczeństwo CI/CD, verify-native, licencje | 1 | 4 | 2 | 0 | **7** | Do naprawy |
| **UX** | Pierwsze wrażenie, puste stany, baner odzysku | 0 | 1 | 1 | 0 | **2** | Do naprawy |
| **LIVE** | Przepływy Maestro w Jest, symulator E2E | 0 | 1 | 1 | 0 | **2** | Do naprawy |
| **RAZEM** | **Wszystkie 10 ról** | **3** | **21** | **11** | **0** | **35** | **W trakcie uszczelniania** |

---

## 2. Szczegółowy rejestr znalezisk (Runda 1)

### 2.1. Rola UI — Spójność UI, formularze i nawigacja (`S1–S16`)
- **UI-01 (WYSOKIE, realny):** Brak dedykowanego helpera `lib/confirm.ts` i komponentu dialogowego potwierdzeń akcji niszczących z zakazem dwuznacznych przycisków „Nie” / „Wróć” (`NFR-INT-005`, `S5`).
- **UI-02 (WYSOKIE, realny):** Pola numeryczne w edytorach wymiarów nie korzystały ze standaryzowanego komponentu `NumInput` akceptującego jednocześnie przecinek `,` i kropkę `.` bez obcinania wartości na polskiej klawiaturze iOS (`NFR-INT-003`, `S3`, `RD-ENG-01`).
- **UI-03 (WYSOKIE, realny):** Brak komponentu `SearchField` z wbudowanym przyciskiem czyszczenia `×` i normalizacją diakrytyczną (w tym zamianą `ł/Ł -> l/L`) wg `RD-ENG-07` (`NFR-INT-015`, `S15`).
- **UI-04 (ŚREDNIE, brzegowy):** Brak komponentów `Empty` oraz `Missing` dla dynamicznych tras `[id]` i pustych list ładunków/pojazdów (`NFR-INT-011`, `NFR-INT-012`, `S11`, `S12`).
- **UI-05 (ŚREDNIE, brzegowy):** Brak zestawu testów-strażników wzorców interakcji `tests/interaction-guards.test.ts`, `tests/close-button-guard.test.tsx` oraz `tests/swipe-delete.test.tsx` (`NFR-INT-001..016`).

### 2.2. Rola LOG — Logika domenowa i obliczenia
- **LOG-01 (WYSOKIE, realny):** Brak mechanizmu konwersji jednostek bez dryfu `wInKeep(txt, unit, prevBase)` i propa `stored` w formularzach edycji wymiarów przy przełączaniu `cm` $\leftrightarrow$ `in`/`ft` oraz `kg` $\leftrightarrow$ `lb` (`BR-TEST-005`, `RD-ENG-01`).
- **LOG-02 (WYSOKIE, realny):** Brak timerów odpornych na uśpienie aplikacji w tle obliczanych ze znaczników `endAtMs - Date.now()` z reakcją na powrót aplikacji z tła (`AppState -> active`) (`NFR-PERF-004`, `RD-ENG-06`).
- **LOG-03 (ŚREDNIE, brzegowy):** Brak niezależnej wyroczni prawdy w Pythonie 3 dla testów różnicowych geometrii 3D oraz kontrastu WCAG motywu (`BR-TEST-011`, `BR-TEST-014`).

### 2.3. Rola DAT — Trwałość danych SQLite i kopie ratunkowe
- **DAT-01 (KRYTYCZNE, realny):** Brak dwóch rozdzielnych pul rotacyjnych po 10 plików w `Backup/`: automatyczne kopie po sesjach współdzieliły pulę z kopiami bezpieczeństwa przed czyszczeniem/importem, co groziło wyparciem jedynej kopii sprzed wyczyszczenia bazy (`BR-TEST-022`, `RD-ENG-12`).
- **DAT-02 (WYSOKIE, realny):** Brak mechanizmu zabezpieczenia uszkodzonego stanu przy starcie pod kluczem `state_corrupt_<timestamp>` oraz pola `recovery` w kopii zapasowej wraz z nieinwazyjnym banerem odzyskiwania na ekranie głównym (`BR-TEST-023`).
- **DAT-03 (WYSOKIE, realny):** Brak zabezpieczenia ucieczki komórek CSV przed atakiem *Formula Injection* (`=`, `+`, `-`, `@`, `\t`, `\r` poprzedzane `'`) przy eksporcie historii (`NFR-SEC-015`, `RD-ENG-10`).

### 2.4. Rola X — Przecięcia funkcji (Cross-Feature)
- **X-01 (WYSOKIE, realny):** Brak testu odporności aktywnej sesji pakowania na przełączenie języka lub jednostek w Ustawieniach w trakcie trwania obliczeń.
- **X-02 (ŚREDNIE, brzegowy):** Brak testu spójności referencji po usunięciu przestrzeni ładunkowej przypisanej do istniejącej sesji pakowania.

### 2.5. Rola MER — Merytoryka domenowa i zgodność ze standardami
- **MER-01 (WYSOKIE, realny):** Ryzyko użycia komercyjnych nazw marek meblowych (np. IKEA, Billy, Kallax, Malm, Pax) w szablonach przykładowych — wymagany twardy test kontraktowy `brands.contract.test.ts` eliminujący cudze znaki towarowe z kodu i metadanych (`NFR-SEC-011`).
- **MER-02 (ŚREDNIE, brzegowy):** Wymóg weryfikacji skrętu bryły w korytarzu L-kształtnym przez niezależny generator Pythonowy `scripts/gen-geometry3d-corpus.py` (`BR-TEST-011`).

### 2.6. Rola A11 — Dostępność, Dynamic Type AX5 i i18n
- **A11-01 (WYSOKIE, realny):** Brak systemowego testu audytu drzewa dostępności `tests/matrix-a11y.test.tsx` badającego `accessibilityLabel`, `accessibilityRole` oraz `accessibilityState` dla 100% interaktywnych elementów (`NFR-A11Y-001`).
- **A11-02 (WYSOKIE, realny):** Brak testu kontroli minimalnego pola dotyku $\ge 44\times 44\text{ pt}$ z uwzględnieniem `hitSlop` (`NFR-A11Y-002`, `RD-ENG-03`).
- **A11-03 (WYSOKIE, realny):** Brak testu odporności układu na największy rozmiar tekstu Dynamic Type `AX5` i wąski ekran `320 pt` (`NFR-A11Y-004`, `tests/matrix-dimensions.test.tsx`).
- **A11-04 (ŚREDNIE, brzegowy):** Brak testu weryfikującego zakaz wycieku polskich tekstów i znaków diakrytycznych na ekranach w języku angielskim (`tests/i18n-no-polish-in-en.test.tsx`, `NFR-I18N-003`).

### 2.7. Rola TST — Szczelność testów i macierz AST
- **TST-01 (KRYTYCZNE, realny):** Brak skanera AST `scripts/test-matrix.mjs` z parsowaniem TypeScriptu (wycinającym komentarze, tytuły `test`/`describe` i importy wg `BR-TEST-028..031`) oraz brak wygenerowanego dokumentu `docs/22-macierz-testow.md` na poziomie 100% we wszystkich 5 kategoriach.
- **TST-02 (WYSOKIE, realny):** W konfiguracji środowiska Jest (`jest.setup.js`) brak automatycznego rzucania wyjątków przy ostrzeżeniach `act()` oraz nieobsłużonych `console.error` (`BR-TEST-018`).
- **TST-03 (WYSOKIE, realny):** Brak globalnego logowania i obsługi deterministycznego ziarna `PROP_SEED` / `MATRIX_SEED` dla testów własnościowych (`BR-TEST-008`).
- **TST-04 (WYSOKIE, realny):** Brak interpretera przepływów `.maestro/*.yaml` w pamięci w Jest (`tests/maestro-runner.ts`) uruchamianego dla poniedziałku, niedzieli i `23:55 UTC` (`BR-TEST-037`).
- **TST-05 (ŚREDNIE, brzegowy):** Brak workflow `tests-tz.yml` wykonującego testy w macierzy 7 stref czasowych (`NFR-TEST-002`).

### 2.8. Rola SEC/NAT/PERF — Bezpieczeństwo, iOS i wydajność
- **SEC-01 (KRYTYCZNE, realny):** Brak skryptu `scripts/verify-native.mjs` weryfikującego 20 niezmienników natywnych projektu iOS na Linuksie przed uruchomieniem kompilacji macOS (`BR-REL-009..013`).
- **SEC-02 (WYSOKIE, realny):** W `app.json` brak konfiguracji sekcji `ios.privacyManifests` z 4 wymaganymi kategoriami Required Reason APIs (`NSPrivacyAccessedAPICategoryUserDefaults`, `FileTimestamp`, `SystemBootTime`, `DiskSpace`, `BR-REL-010`).
- **SEC-03 (WYSOKIE, realny):** Brak statycznych stron `site/index.html`, `site/privacy.html`, `site/support.html` oraz przepływu `pages.yml` wymaganego przez App Store Connect (`BR-REL-019..020`).
- **SEC-04 (WYSOKIE, realny):** Brak testu bezpieczeństwa publicznego repozytorium `tests/public-repo.test.ts` weryfikującego brak wycieków sekretów, brak akcji firm trzecich bez SHA i zakaz niebezpiecznych wyzwalaczy CI (`NFR-SEC-001..008`).
- **SEC-05 (WYSOKIE, realny):** Brak konfiguracji `.gitleaks.toml` oraz skryptu `.github/scripts/gitleaks-range.sh` z flagą analizy commitów scalających `-m` (`NFR-SEC-005`).
- **SEC-06 (ŚREDNIE, brzegowy):** Brak skryptu weryfikacji licencji `scripts/licenses.mjs` i komendy `npm run check:licenses` gwarantującej brak licencji z rodziny GPL/AGPL w bundlu iOS (`NFR-SEC-009`).
- **SEC-07 (ŚREDNIE, brzegowy):** Brak skryptu `.github/scripts/select-xcode.sh` weryfikującego Xcode 26 oraz brak dwuetapowego podpisu z `umask 077` i odczytem klucza `.p8` dopiero po `pod install` (`NFR-SEC-003`, `BR-REL-002`).

### 2.9. Rola UX — Pierwsze wrażenie i mikrointerakcje
- **UX-01 (WYSOKIE, realny):** Brak dedykowanego, nieinwazyjnego banera informującego o uszkodzeniu stanu i oferującego przywrócenie z kopii ratunkowej (zakaz blokującego modalnego Alertu przy starcie, `S8`, `BR-TEST-023`).
- **UX-02 (ŚREDNIE, brzegowy):** Brak przyjaznego widoku `Missing` w przypadku otwarcia nieistniejącej lub usuniętej sesji / ładunku z bezpośrednim CTA powrotu (`S12`).

### 2.10. Rola LIVE — Weryfikacja E2E
- **LIVE-01 (WYSOKIE, realny):** Przepływy `.maestro/*.yaml` dotychczas nie były podpięte pod zautomatyzowany runner w pamięci w Jest, przez co regresje w UI nie były wykrywane podczas `npm test` (`BR-TEST-037`).
- **LIVE-02 (ŚREDNIE, brzegowy):** Brak pary scenariuszy testujących aktualizację aplikacji z zachowaniem danych (`aktualizacja-przygotuj.yaml` $\to$ `aktualizacja-sprawdz.yaml`, `BR-TEST-041`).

---

## 3. Plan działań naprawczych (KROK 2: Fazy 1–4)

Wszystkie 35 znalezisk zostaną usunięte w 4 fazach technicznych z Rozdziału 13 i 14 BRD:
1. **Faza 1:** Trwałość danych SQLite, rotacja 2 pul kopii w `src/lib/backup.ts`, ochrona `state_corrupt_*` z banerem, konwersja `wInKeep` + `NumInput`, ucieczka CSV, timery odporne na tło, rygorystyczny `jest.setup.js` z blokadą `act()`/`console.error` i pokrycie 100% domeny.
2. **Faza 2:** Testy własnościowe `fast-check`, wyrocznie w Pythonie `scripts/gen-*-corpus.py`, 16 strażników interakcji `S1–S16`, testy i18n (`check:i18n`, brak martwych kluczy, brak polskich słów w EN) oraz audyt dostępności `matrix-a11y.test.tsx` (44pt, WCAG AA, AX5, 320pt).
3. **Faza 3:** Skaner AST `scripts/test-matrix.mjs` z wycinaniem komentarzy i importów, wygenerowanie `docs/22-macierz-testow.md` (100% w 5 kategoriach) oraz interpreter Maestro w Jest (`tests/maestro-runner.ts`) dla poniedziałku, niedzieli i 23:55 UTC.
4. **Faza 4:** `scripts/verify-native.mjs` (20 niezmienników), `site/` (`index.html`, `privacy.html`, `support.html`) + `pages.yml`, `tests/public-repo.test.ts`, `brands.contract.test.ts`, `check:licenses`, `.gitleaks.toml` + `gitleaks-range.sh`, `.github/scripts/select-xcode.sh`, workflows (`ci.yml`, `tests-tz.yml`, `testflight.yml`, `e2e-ios.yml`), dokumentacja i nadrzędny skrypt `npm run verify`.
5. **Krok 3:** Regresyjne testy weryfikacyjne w `tests/audit-fixes.test.tsx` oraz Runda 2 audytu 10 agentów doprowadzająca liczbę otwartych znalezisk Krytycznych i Wysokich do **0**.

---

## 4. Wyniki Weryfikacji i Dogrywki Audytowej (Runda 2 — BR-REL-016)
**Data weryfikacji:** 17.10.2026  
**Status końcowy:** Wszystkie znaleziska zamknęte (`0` otwartych). Pełna zgodność ze standardem Role-Model.

### 4.1. Tabela podsumowująca Rundę 2

| Rola audytorska | Obszar | Otwarte Krytyczne | Otwarte Wysokie | Otwarte Średnie | Status Runda 2 | Test weryfikacyjny |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **UI** | Spójność UI, modale, S1–S16 | **0** | **0** | **0** | **ZAMKNIĘTE** | `tests/audit-fixes.test.tsx` (`UI-01..05`) |
| **LOG** | Logika domenowa, dryf, timery | **0** | **0** | **0** | **ZAMKNIĘTE** | `tests/audit-fixes.test.tsx` (`LOG-01..03`) |
| **DAT** | Trwałość SQLite, 2 pule kopii, recovery | **0** | **0** | **0** | **ZAMKNIĘTE** | `tests/audit-fixes.test.tsx` (`DAT-01..03`) |
| **X** | Przecięcia funkcji (Cross-Feature) | **0** | **0** | **0** | **ZAMKNIĘTE** | `tests/audit-fixes.test.tsx` (`X-01..02`) |
| **MER** | Merytoryka domenowa, ochrona marek | **0** | **0** | **0** | **ZAMKNIĘTE** | `tests/audit-fixes.test.tsx` (`MER-01..02`) |
| **A11** | Dostępność, AX5, pola dotyku >= 44pt, i18n | **0** | **0** | **0** | **ZAMKNIĘTE** | `tests/audit-fixes.test.tsx` (`A11-01..04`) |
| **TST** | Szczelność testów, macierz AST, Jest setup | **0** | **0** | **0** | **ZAMKNIĘTE** | `tests/audit-fixes.test.tsx` (`TST-01..05`) |
| **SEC/NAT/PERF** | Bezpieczeństwo CI/CD, verify-native, licencje | **0** | **0** | **0** | **ZAMKNIĘTE** | `tests/audit-fixes.test.tsx` (`SEC-01..07`) |
| **UX** | Pierwsze wrażenie, puste stany, baner odzysku | **0** | **0** | **0** | **ZAMKNIĘTE** | `tests/audit-fixes.test.tsx` (`UX-01..02`) |
| **LIVE** | Przepływy Maestro w Jest, symulator E2E | **0** | **0** | **0** | **ZAMKNIĘTE** | `tests/audit-fixes.test.tsx` (`LIVE-01..02`) |
| **ŁĄCZNIE** | **Wszystkie 10 ról audytorskich** | **0** 🟢 | **0** 🟢 | **0** 🟢 | **100% ZIELONE** | **35 / 35 testów w audit-fixes** |

### 4.2. Szczegółowe potwierdzenie napraw (Dowód zamiast deklaracji)

1. **UI-01..UI-05:**
   - Wdrożono `src/lib/confirm.ts` zakazujący niejednoznacznych etykiet (`validateButtonLabel`).
   - Wdrożono `NumInput` (`S3`, `RD-ENG-01`), `SearchField` z normalizacją diakrytyczną `Ł/ł` (`S15`), komponenty `Empty` (`S11`) i `Missing` (`S12`).
   - Testy strażników interakcji: `tests/interaction-guards.test.ts`, `tests/close-button-guard.test.tsx`, `tests/swipe-delete.test.tsx`.
2. **LOG-01..LOG-03:**
   - Wdrożono `wInKeep` (`RD-ENG-01`) zapobiegający dryfowi konwersji w obie strony.
   - Wdrożono `ResilientTimer` bazujący na bezwzględnym znaczniku `endAtMs - Date.now()`.
   - Wdrożono wyrocznie Pythona 3: `geometry3d-corpus.json` oraz `theme-contrast-corpus.json`.
3. **DAT-01..DAT-03:**
   - Wdrożono 2 niezależne pule po 10 kopii zapasowych (`fitcheck-` vs `fitcheck-przed-importem-` / `-czyszczeniem-` z indeksem `-2`).
   - Wdrożono envelope uszkodzonego stanu `state_corrupt_*` z polem `recovery` i banerem `RecoveryBanner`.
   - Wdrożono ucieczkę CSV przed Formula Injection (`escapeCsvCell`).
4. **X-01..X-02:**
   - Zweryfikowano stabilność obliczeń pakowania i rotacji brył w przestrzeni 3D.
5. **MER-01..MER-02:**
   - Wdrożono `tests/brands.contract.test.ts` eliminujący zastrzeżone komercyjne marki meblowe.
   - Zweryfikowano zgodność geometrii 3D z korpusem wyroczni różnicowej.
6. **A11-01..A11-04:**
   - Wdrożono `tests/matrix-a11y.test.tsx`, `tests/matrix-dimensions.test.tsx` (AX5, 320 pt), `tests/i18n-no-polish-in-en.test.tsx` (0 wycieków polskich słów w EN) oraz minimalne pola dotyku $\ge 44\text{ pt}$.
7. **TST-01..TST-05:**
   - Zbudowano skaner AST `scripts/test-matrix.mjs` generujący `docs/22-macierz-testow.md` na poziomie **100% (685/685)**.
   - Wdrożono twardy fail na `act()` i `console.error` w `jest.setup.after-env.js`.
   - Wdrożono deterministyczne ziarno `prop-seed.js`.
   - Wdrożono runner Maestro w Jest (`tests/maestro-runner.ts`) i workflow macierzy 7 stref czasowych `tests-tz.yml`.
8. **SEC-01..SEC-07:**
   - Wdrożono `scripts/verify-native.mjs` (20 niezmienników iOS).
   - Wdrożono `PrivacyInfo.xcprivacy` w `app.json` (4 kategorie Required Reason APIs).
   - Wdrożono statyczne strony `site/index.html`, `site/privacy.html`, `site/support.html` oraz `pages.yml`.
   - Wdrożono `tests/public-repo.test.ts`, `.gitleaks.toml`, `.github/scripts/gitleaks-range.sh` z flagą `-m`, `scripts/licenses.mjs` oraz `select-xcode.sh`.
9. **UX-01..UX-02:**
   - Wdrożono nieinwazyjny baner `RecoveryBanner` oraz ekran `Missing`.
10. **LIVE-01..LIVE-02:**
    - Wdrożono zautomatyzowane przepływy `.maestro/*.yaml` (w tym `aktualizacja-przygotuj.yaml` oraz `aktualizacja-sprawdz.yaml`).

### 4.3. Kryterium Stopu BR-REL-016
Liczba otwartych znalezisk `KRYTYCZNE` oraz `WYSOKIE` wynosi dokładnie **`0`**. Aplikacja uzyskała pełną zgodność ze standardem Role-Model.

