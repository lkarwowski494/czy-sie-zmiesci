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
| **Kopie Zapasowe** | JSON Schema v2, 10 rotacyjnych kopii w `Documents/Backup/`, kopie bezpieczeństwa przed importem/resetem | Zero utraty danych (ZP-06, Apps4Brew SEC-09) |
| **i18n** | 100% symetria tłumaczeń PL / EN (403 teksty w kodzie, 556 par w słowniku `i18n.en.ts`) | Pełna dwujęzyczność bez braków |
| **Jakość i Testy** | 64 pakiety testów, 11 277 testów passing, 100% pokrycia domeny (`src/domain/`), 0 błędów TS | Standard 9 warstw weryfikacji jakości |

---

## 📅 Dziennik Decyzji (Chronologicznie)

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
