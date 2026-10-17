# Czy się zmieści? (FitCheck) — Rejestr Decyzji Projektowych (DECISIONS.md)

> **Zasada Reguły 6:** Dokument roboczy krótki (stan bieżący z datami). Przed podaniem faktów o projekcie (ceny, limity, decyzje) sprawdzaj ten dokument, nie pamięć.

---

## 📌 Stan Bieżący Projektu (Stan na: 2026-10-17)

| Obszar | Bieżąca Decyzja / Stan | Uzasadnienie / Standard |
|---|---|---|
| **Zasady ogólne** | Wdrożone 10 Zasad Uniwersalnych w [CLAUDE.md](file:///c:/Users/lukas/Documents/antigravity/joyful-oppenheimer/CLAUDE.md) | Standard pracy ze studiem |
| **Moduły i Role** | Moduł: *Aplikacje*, Moduł: *Research*, Zasady gier, 7 aktywnych ról | Dokument „Biblioteka zasad i ról” z Dysku |
| **Design System** | `@apps4craft/ui` (`github:lkarwowski494/apps4craft-ui`) | Spójność rodziny Apps4Craft Studio |
| **Kolorystyka** | Ciemny bazalt ceramiczny (`#121214`), akcent anodowanego tytanu (`#38BDF8`) | Oficjalna paleta FitCheck |
| **Architektura danych** | 100% Offline-First, SQLite (expo-sqlite WAL), Zero-Telemetry, Zero-Cloud | Brak analityki, prywatność 100% |
| **Bezpieczeństwo UI** | `useSafeAreaInsets()`, min. strefa kliku $44 \times 44\,\text{pt}$, `hitSlop: \pm 12\,\text{pt}` | Ergonomia warsztatowa, brak kolizji z wyspą/paskiem iOS |
| **Nawigacja (The Purge)** | 4 kluczowe zakładki: Symulator 3D, Katalog, Wnętrza, Garaż (Ustawienia w nagłówku) | Eliminacja szumu i zbędnych kalkulatorów oszczędności |
| **Onboarding** | 1-ekranowy modal z wyborem profilu rytuału (`daily`, `architect`, `expedition`) | Adaptacja interfejsu do potrzeb rzemieślnika |
| **Kopie Zapasowe** | JSON Schema v2, 2 pule po 10 rotacyjnych kopii (`fitcheck-` vs `przed-importem`/`-czyszczeniem` z `-2`), ochrona uszkodzonego stanu `state_corrupt_*` z kopertą odzyskiwania, ucieczka CSV przed wstrzyknięciem formuł | Zero utraty danych (ZP-06, BR-TEST-022, BR-TEST-023, NFR-SEC-015) |
| **i18n** | 100% symetria tłumaczeń PL / EN (403 teksty w kodzie, 556 par w słowniku `i18n.en.ts`), brak polskich pozostałości w EN | Pełna dwujęzyczność bez braków (NFR-I18N-001..008) |
| **Jakość i Wydania** | Standard Role-Model BRD-QA-REL 1.0: 84 pakiety testów, 11 401 testów passing, 100% AST macierzy testów (685/685: EKRAN, UI, TEKST, LOGIKA, WYMIAR w `docs/22-macierz-testow.md`), 0 otwartych znalezisk krytycznych/wysokich w audycie 10 ról (`docs/25-audyt-brd-qa-rel.md`), 100% zielony `npm run verify` | Najwyższy reżim testów i wydań studyjnych |

---

## 📅 Dziennik Decyzji (Chronologicznie)

### 2026-10-17 — Uszczelnienie do standardu Role-Model BRD-QA-REL 1.0 (Fazy 1–4, 10 ról audytorskich)
- **Decyzja:** Przeprowadzenie pełnego uszczelnienia projektu według wymagań studyjnych `ROLE_MODEL_TESTY_I_WYDANIA_TRENING_ORGANIZER.md`:
  1. **KROK 1 (Audyt Runda 1):** Przeprowadzono audyt 10 niezależnych ról audytorskich (`UI`, `LOG`, `DAT`, `X`, `MER`, `A11`, `TST`, `SEC/NAT/PERF`, `UX`, `LIVE` zgodnie z `BR-REL-015`), zidentyfikowano 35 znalezisk i zarejestrowano w [docs/25-audyt-brd-qa-rel.md](file:///c:/Users/lukas/Documents/antigravity/joyful-oppenheimer/docs/25-audyt-brd-qa-rel.md).
  2. **KROK 2 (Wdrożenie Faz 1–4):**
     - *Faza 1:* Twardy zakaz ostrzeżeń `act()` i `console.error` w `jest.setup.after-env.js` (`BR-TEST-018`), deterministyczny `PROP_SEED`, funkcja `wInKeep` w `unit-converter.ts` i `NumInput.tsx` zabezpieczające przed dryfem przecinek/kropka (`RD-ENG-01`, `BR-TEST-005`), dwie rozdzielne pule po 10 kopii zapasowych (`kopia` vs `przed-importem`/`-czyszczeniem` z `-2`, `BR-TEST-022`), ochrona uszkodzonego stanu `state_corrupt_*` z kopertą odzyskiwania (`BR-TEST-023`), timery odporne na tło `endAtMs - Date.now()` (`NFR-PERF-004`), bezpieczny CSV (`escapeCsvCell`, `NFR-SEC-015`), komponenty `Empty`, `Missing`, `RecoveryBanner`, `SearchField`.
     - *Faza 2:* Testy własnościowe `fast-check` ze stanowym generatorem kroków otwierających (`BR-TEST-006..010`), wyrocznie prawdy w Pythonie (`scripts/gen-geometry3d-corpus.py`, `scripts/gen-theme-contrast-corpus.py`, `scripts/check-corpus.mjs`, `BR-TEST-011..014`), 16 strażników interakcji S1–S16 (`tests/interaction-guards.test.ts`, `close-button-guard.test.tsx`, `swipe-delete.test.tsx`, `lib/confirm.ts`, `NFR-INT-001..016`), higiena i18n (`check:i18n`, brak martwych kluczy, brak polskich tekstów w EN `tests/i18n-no-polish-in-en.test.tsx`, `NFR-I18N-001..008`), audyt dostępności (touch $\ge 44\,\text{pt}$, WCAG AA, AX5 dynamic type, $320\,\text{pt}$ viewport, `tests/matrix-a11y.test.tsx`, `tests/matrix-dimensions.test.tsx`, `NFR-A11Y-001..008`).
     - *Faza 3:* Skaner AST `scripts/test-matrix.mjs` z wycinaniem komentarzy, importów i tytułów testów (`BR-TEST-028..031`), generujący [docs/22-macierz-testow.md](file:///c:/Users/lukas/Documents/antigravity/joyful-oppenheimer/docs/22-macierz-testow.md) na poziomie **100.0% pokrycia we wszystkich 5 kategoriach (685/685: 5 EKRAN, 367 UI, 200 TEKST, 91 LOGIKA, 22 WYMIAR)**, oraz runner przepływów Maestro (`tests/maestro-runner.ts`, `tests/maestro-flows.test.tsx`) dla poniedziałku, niedzieli i 23:55 UTC (`BR-TEST-037`).
     - *Faza 4:* Weryfikator 20 niezmienników iOS na Linuksie `scripts/verify-native.mjs` (`RD-ENG-05`, `BR-REL-014`), statyczne strony `site/index.html`, `site/privacy.html`, `site/support.html` + workflow Pages (`BR-REL-019..020`), strażnik publicznego repozytorium `tests/public-repo.test.ts`, `tests/brands.contract.test.ts`, skaner licencji `scripts/licenses.mjs`, reguły `.gitleaks.toml` + skrypt `gitleaks-range.sh`, CI workflows (`ci.yml`, `tests-tz.yml` z 7 strefami czasowymi, `testflight.yml`, `e2e-ios.yml`, `select-xcode.sh`), dokumentacja wydawnicza (`docs/15-app-store.md`, `docs/18-przekazanie.md`, `docs/20-definicja-ukonczenia.md`), oraz uniwersalna komenda bramkowa `npm run verify`.
  3. **KROK 3 (Naprawa i Dogrywka Runda 2):** Wdrożenie 35 testów regresyjnych w `tests/audit-fixes.test.tsx` (35/35 passing, z identyfikatorami znalezisk `UI-01..05`, `LOG-01..03`, `DAT-01..03`, `X-01..02`, `MER-01..02`, `A11-01..04`, `TST-01..05`, `SEC-01..07`, `UX-01..02`, `LIVE-01..02`), zamknięcie wszystkich znalezisk w Rundzie 2 audytu 10 agentów (0 otwartych KRYTYCZNE i WYSOKIE).
- **Zasób:** `ROLE_MODEL_TESTY_I_WYDANIA_TRENING_ORGANIZER.md`, [docs/25-audyt-brd-qa-rel.md](file:///c:/Users/lukas/Documents/antigravity/joyful-oppenheimer/docs/25-audyt-brd-qa-rel.md), [docs/22-macierz-testow.md](file:///c:/Users/lukas/Documents/antigravity/joyful-oppenheimer/docs/22-macierz-testow.md).


### 2026-10-17 — Włączenie Modułów i Ról z „Biblioteki zasad i ról” (Odkrycie Ról)
- **Decyzja:** Zgodnie z Regułą 10 i procedurą „Odkrycia ról na starcie projektu”, włączenie do projektu dwóch modułów dziedzinowych: *Moduł: aplikacje (oprogramowanie)* oraz *Moduł: research i treści merytoryczne*, wraz z 3 zasadami ogólnymi z modułu gier (jedno źródło prawdy z generatorami, „udokumentowane” ≠ „zaimplementowane/zweryfikowane”, warianty i archiwa obok kanonu).
- **Katalog 7 aktywnych ról:**
  1. *Koordynator / Główny Architekt* (mocny model) — sesja główna, zarządzanie architekturą i spójnością gałęzi, jedyny commit i push na wspólnej gałęzi po przejściu kontroli.
  2. *Badacz merytoryczny* (mocny model) — stereometria, normy techniczne (ISO 3832 VDA, PN-EN 12195-1, PoRD, IATA), sprawdzanie źródeł z datą.
  3. *Programista* (tańszy model) — TDD, potwierdzenie czerwonego testu na kodzie przed poprawką, minimalny zakres zmian.
  4. *Projektant UX* (mocny model) — ergonomia warsztatowa blatu roboczego/bagażnika, Safe Area, standaryzacja `@apps4craft/ui`.
  5. *Audytor / Tester E2E* (mocny/tańszy model) — 9 warstw weryfikacji jakości, testy brzegowe i regresyjne.
  6. *Tłumacz* (tańszy model) — 100% symetria słownika `i18n.en.ts`, typografia rzemieślnicza.
  7. *Sekretarz dokumentacji* (tańszy model) — prowadzenie `DECISIONS.md` z datami i opcjami, synchronizacja `CLAUDE.md`.
- **Zasób źródłowy na Dysku:** Dokument `Biblioteka zasad i ról` (ID: `1a9PD_1dVpY5Ct3XTkJPQoB-3iqPwVD__wbL7Fe-xOUw`).

### 2026-10-17 — Wdrożenie 10 Zasad Uniwersalnych i Rejestru Decyzji
- **Decyzja:** Oficjalne przyjęcie i zapisanie w [CLAUDE.md](file:///c:/Users/lukas/Documents/antigravity/joyful-oppenheimer/CLAUDE.md) oraz w niniejszym pliku [DECISIONS.md](file:///c:/Users/lukas/Documents/antigravity/joyful-oppenheimer/DECISIONS.md) 10 Zasad Uniwersalnych (decyzje dla właściciela, dowód zamiast deklaracji, zakaz zgadywania, sprawdzanie zapisu decyzji, szacowanie czasu agenta, odkrycie ról z Biblioteki na Dysku).
- **Zasób:** [CLAUDE.md](file:///c:/Users/lukas/Documents/antigravity/joyful-oppenheimer/CLAUDE.md), [DECISIONS.md](file:///c:/Users/lukas/Documents/antigravity/joyful-oppenheimer/DECISIONS.md).

### 2026-10-17 — Standaryzacja Front-Endu: Pakiet `@apps4craft/ui` i Oficjalna Ikona
- **Decyzja:** Zastąpienie rozproszonych komponentów interfejsu wspólnym pakietem `@apps4craft/ui` (`CraftHeader`, `CraftModal`, `CraftButton`, `CraftStatDisplay`, `CraftCard` oraz wektorowe herby rodziny: Napar, Piekarz, Słoik, Masaż, Ferment, FitCheck).
- **Identyfikacja wizualna:** Oficjalna kwadratowa ikona iOS 1024×1024 w głębokim bazalcie `#121214` z wytłoczonym w tytanie symbolem suwmiarki i sześcianu przestrzennego (`assets/icon.png`, `assets/adaptive-icon.png`).
- **Kompatybilność npm:** Wprowadzenie `.npmrc` z flagą `legacy-peer-deps=true` oraz upgrade CI do Node.js 22.

### 2026-10-17 — Rozbudowa Pakietu Testów (11 277 testów, 64 pakiety)
- **Decyzja:** Wdrożenie rygorystycznych testów front-endowych i domenowych:
  1. `applianceClearanceView.test.ts`: testy dylatacji wentylacji lodówki (min. 50 mm tył, 20 mm bok), naddatków montażowych pralki (80 mm hydraulika, 35 mm drzwiczki), timera odstoju sprężarki (24h/12h/2h).
  2. `multiCheckerMatrixView.test.ts`: weryfikacja automatów paczkowych (InPost A/B/C 25 kg, Orlen, DPD, Pocztex) i 10 linii lotniczych ze współczynnikiem kompresji miękkiej torby 0.90.
  3. `screenRulerAndTapeAssistant.test.ts`: kalibracja 1:1 ekranowej linijki pod PPI (460 PPI OLED) i tolerancje narzędzi pomiarowych.
  4. `craftUiComponents.test.ts`: testy klikalności, haptyki i renderowania wektorowych SVG.
  5. `settingsScreenLogic.test.ts`: logika profili rytuału, bezpieczeństwa kopii SQLite i synchronizacji Apple Watch.
  6. `i18nCompletenessGuard.test.ts`: automatyczny strażnik integralności słownika PL/EN.
  7. `zeroNetworkTelemetryGuard.test.ts`: weryfikacja braku SDK śledzących i zero wywołań sieciowych.
  8. `staircaseRotation.test.ts`, `elevatorDiagonal.test.ts`, `vdaCalculator.test.ts`, `aviationSizers.test.ts`: poszerzone testy stereometrii.

### 2026-10-16 — Audyt Rzemieślniczy i „The Craft Purge”
- **Decyzja:** Kasacja gadżetowych funkcji rozpraszających (zbędny kalkulator oszczędności PLN, formularze ankiet przed załadunkiem) na rzecz czystych narzędzi warsztatowych.
- **Redukcja Bottom Tabs:** Zawężenie dolnego paska nawigacji do 4 zakładek, przeniesienie konfiguracji do Ustawień w nagłówku.
- **Tryb Aktywnego Skupienia:** Wdrożenie `ActiveFocusModeModal` z wielkimi cyframi „Sacred Numbers” czytelnymi z blatu roboczego i instrukcjami krok po kroku.

### 2026-10-15 — Monorepo i Architektura Offline-First
- **Decyzja:** 100% bazy w lokalnym SQLite (WAL mode). Żadnych zewnętrznych baz w chmurze, logowania wymuszonego przez sieć ani przesyłania danych gabarytów użytkownika.
- **Publiczne repozytorium (ADR-031):** Bezwzględny zakaz commitowania sekretów, kluczy, certyfikatów i danych osobowych.
