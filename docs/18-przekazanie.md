# Dziennik Inżynieryjny i Dokument Przekazania — Czy się zmieści? (FitCheck)

Dokument żywy projektu prowadzony zgodnie z wymaganiem `BR-REL-018`.

---

## 1. Stan Bieżący Projektu (Stan na: 17.10.2026)

- **Aplikacja:** Czy się zmieści? (FitCheck)
- **Wersja:** `1.0.0`
- **Build Base:** `10`
- **Bundle ID:** `com.apps4brew.fitcheck`
- **Status wydawniczy:** Gotowa do wydania produkcyjnego TestFlight / App Store Connect.
- **Macierz testów AST (BR-TEST-028):** **684 / 684 (100.0%)**
  - EKRAN: 5/5 (100.0%)
  - UI: 367/367 (100.0%)
  - TEKST: 200/200 (100.0%)
  - LOGIKA: 90/90 (100.0%)
  - WYMIAR: 22/22 (100.0%)
- **Testy jednostkowe i integracyjne:** 81 zestawów testowych (wszystkie zielone).
- **Zależności:** 100% licencji permisywnych (MIT, ISC, Apache-2.0, BSD). Zero copyleft.
- **Audyt 10 agentów (BR-REL-015):** Runda 1 zakończona (35 znalezisk), Runda 2 wdrożona.

---

## 2. Kluczowe Komendy Inżynieryjne

| Cel | Komenda |
|---|---|
| Główna weryfikacja (wszystkie bramki) | `npm run verify` |
| Uruchomienie pełnego zestawu testów | `npm test` |
| Skaner macierzy testów AST | `node scripts/test-matrix.mjs --check` |
| Weryfikacja słowników i18n | `npm run check:i18n` |
| Weryfikacja licencji produkcyjnych | `npm run check:licenses` |
| Weryfikacja niezmienników natywnych iOS | `npm run verify:native` |
| Wyrocznie Pythona dla geometrii i kontrastu | `node scripts/check-corpus.mjs` |

---

## 3. Rejestr Decyzji Architektonicznych i Produktowych

- **DEC-01 (17.10.2026):** Architektura 100% Offline-First. Wszystkie dane i obliczenia przechowywane lokalnie w SQLite / AsyncStorage. Całkowity zakaz telemetrii sieciowej.
- **DEC-02 (17.10.2026):** Dwie rozdzielne pule po 10 kopii zapasowych (`fitcheck-` vs `fitcheck-przed-importem-` / `-czyszczeniem-` z indeksem `-2`) zapobiegające wyparciu automatycznych backupów.
- **DEC-03 (17.10.2026):** Envelope uszkodzonego stanu `state_corrupt_*` z banerem odzyskiwania i zachowaniem surowego JSON w polu `recovery`.
- **DEC-04 (17.10.2026):** Konwersja bez dryfu zaokrągleń `wInKeep` (`RD-ENG-01`) zapobiegająca degradacji liczb przy wielokrotnej zmianie jednostek metrycznych/imperialnych.
- **DEC-05 (17.10.2026):** Komponent `NumInput` z jednolitym traktowaniem kropki i przecinka (`S15` / `NFR-INT-003`).
- **DEC-06 (17.10.2026):** Wymuszenie `keyboardShouldPersistTaps="handled"` we wszystkich listach i widokach przewijanych (`S6`).
- **DEC-07 (17.10.2026):** Centralny pomocnik `confirmDialog` z wymuszeniem precyzyjnych etykiet akcji i zakazem generycznych przycisków „Tak” / „Nie” (`S5`).
- **DEC-08 (17.10.2026):** Podwójna niezależna wyrocznia w Pythonie dla obliczeń 3D i kontrastu kolorów WCAG (`BR-TEST-011..014`).

---

## 4. Chronologia Rund Wdrożeniowych

- **Runda 1 (Audyt Początkowy):**
  Przeprowadzono pełny audyt 10 ról audytorskich. Zidentyfikowano 35 problemów i spisano je w `docs/25-audyt-brd-qa-rel.md`.
- **Runda 2 (Uszczelnienie Domeny i Rdzenia — Faza 1):**
  Wdrożono `prop-seed`, blokadę `act()`/`console.error` w Jest, podwójne pule kopii zapasowych, obsługę uszkodzonego stanu, `wInKeep`, `NumInput`, timery odporne na uśpienie oraz ucieczkę CSV.
- **Runda 3 (Wyrocznie i Strażnicy Interakcji — Faza 2):**
  Napisano generatory i wyrocznie Pythona (`geometry3d-corpus.json`, `theme-contrast-corpus.json`), zaimplementowano testy strażników interakcji `S1–S16`, testy a11y (WCAG AA, AX5, 320 pt), testy czystości i18n.
- **Runda 4 (Macierz AST i Przepływy Maestro — Faza 3):**
  Zbudowano dedykowany skaner AST `scripts/test-matrix.mjs` z wycinaniem komentarzy i importów (`BR-TEST-028..031`), dopisano testy tras, logiki i wymiarów, osiągając 100.0% pokrycia (684/684). Zaimplementowano interpreter przepływów Maestro w Jest dla poniedziałku, niedzieli i 23:55 UTC.
- **Runda 5 (Natywna Konfiguracja iOS, Witryna i Bezpieczeństwo — Faza 4):**
  Wdrożono `scripts/verify-native.mjs`, `PrivacyInfo.xcprivacy` w `app.json`, statyczne strony w `site/`, potoki GitHub Actions (`ci.yml`, `tests-tz.yml`, `testflight.yml`, `pages.yml`, `e2e-ios.yml`), skanery licencji i marek oraz dokumenty wydawnicze.
