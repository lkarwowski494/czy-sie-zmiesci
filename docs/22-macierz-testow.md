# 22 · Macierz Pokrycia Testowego (AST Skaner BR-TEST-028..031)

Data generacji: **2026-10-17T12:23:22.769Z**
Wynik globalny: **685/685 (100.0%)**

## 1. Podsumowanie Kategorii Pokrycia

| Kategoria | Liczba elementów | Pokryte | Pokrycie % | Status |
| :--- | :---: | :---: | :---: | :---: |
| **EKRAN** | 5 | 5 | **100.0%** | ✅ |
| **UI** | 367 | 367 | **100.0%** | ✅ |
| **TEKST** | 200 | 200 | **100.0%** | ✅ |
| **LOGIKA** | 91 | 91 | **100.0%** | ✅ |
| **WYMIAR** | 22 | 22 | **100.0%** | ✅ |
| **SUMA** | **685** | **685** | **100.0%** | ✅ |

## 2. Szczegółowy Rejestr Elementów

### Kategoria: EKRAN (5/5)

| Identyfikator / Klucz | Źródło | Pokrycie | Dowód testowy |
| :--- | :--- | :---: | :--- |
| `(tabs)/catalog` | `app/(tabs)/catalog.tsx` | ✅ | tests/matrix-routes.test.tsx, src/components/__tests__/craftPurgeVerification.test.ts |
| `(tabs)/garage` | `app/(tabs)/garage.tsx` | ✅ | tests/matrix-routes.test.tsx |
| `(tabs)/index` | `app/(tabs)/index.tsx` | ✅ | tests/matrix-routes.test.tsx |
| `(tabs)/relocation` | `app/(tabs)/relocation.tsx` | ✅ | tests/matrix-routes.test.tsx, src/components/__tests__/craftPurgeVerification.test.ts |
| `(tabs)/settings` | `app/(tabs)/settings.tsx` | ✅ | tests/matrix-routes.test.tsx, src/components/__tests__/craftPurgeVerification.test.ts |

### Kategoria: UI (367/367)

| Identyfikator / Klucz | Źródło | Pokrycie | Dowód testowy |
| :--- | :--- | :---: | :--- |
| `Symulator 3D` | `src/lib/i18n.en.ts` | ✅ | tests/maestro-runner.ts, tests/matrix-routes.test.tsx, tests/matrix-translations.test.ts |
| `Katalog` | `src/lib/i18n.en.ts` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/maestro-runner.ts, tests/matrix-routes.test.tsx |
| `Wnętrza` | `src/lib/i18n.en.ts` | ✅ | tests/maestro-runner.ts, tests/matrix-routes.test.tsx, tests/matrix-translations.test.ts |
| `Garaż` | `src/lib/i18n.en.ts` | ✅ | tests/maestro-runner.ts, tests/matrix-routes.test.tsx, tests/matrix-translations.test.ts |
| `Ustawienia` | `src/lib/i18n.en.ts` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/maestro-runner.ts, tests/matrix-routes.test.tsx |
| `Anuluj` | `src/lib/i18n.en.ts` | ✅ | tests/close-button-guard.test.tsx, tests/i18n-no-polish-in-en.test.tsx, tests/matrix-translations.test.ts |
| `Zapisz` | `src/lib/i18n.en.ts` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/matrix-translations.test.ts, src/components/__tests__/craftUiComponents.test.ts |
| `Zamknij` | `src/lib/i18n.en.ts` | ✅ | tests/close-button-guard.test.tsx, tests/matrix-translations.test.ts, src/components/__tests__/craftUiComponents.test.ts |
| `Usuń` | `src/lib/i18n.en.ts` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/matrix-translations.test.ts, tests/swipe-delete.test.tsx |
| `Edytuj` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kopiuj` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Udostępnij` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/05-przeprowadzka-mieszkania.yaml |
| `Sukces` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/04-kopia-i-przywrocenie.yaml |
| `Ostrzeżenie` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kopia zapasowa` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/tests/contracts/i18nCompletenessGuard.test.ts |
| `Symulator Załadunku 3D` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/01-pelny-przeplyw-auto-meble.yaml, .maestro/03-alarm-dmc-przeladowanie.yaml |
| `⚡ Szybki Scenariusz:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🏖️ Wakacje (4 walizki)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🛋️ Zakupy IKEA` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📦 AGD + Kartony` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/03-alarm-dmc-przeladowanie.yaml |
| `Wybierz pojazd referencyjny:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Masa ładunku` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/domain/__tests__/atticAndErgonomics.test.ts, src/domain/__tests__/crashPhysicsSimulator.test.ts |
| `Status DMC` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/03-alarm-dmc-przeladowanie.yaml |
| `Wykorzystanie przestrzeni` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/01-pelny-przeplyw-auto-meble.yaml |
| `Bezpieczny` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/components/__tests__/applianceClearanceView.test.ts, src/domain/__tests__/applianceClearance.test.ts |
| `Przeciążenie!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📦 Przedmioty do zapakowania` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wszystkie` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/domain/__tests__/vanVsCarEconomics.test.ts |
| `🧳 Walizki` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📦 Kartony` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🛋️ Meble IKEA` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⚡ AGD/RTV` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🚲 Sport` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⚠️ Kruche` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `↕️ Tylko pion` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Symetria poprzeczna:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Idealna (Równomierny rozkład)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Asymetria ({offset} mm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/lib/__tests__/i18n.test.ts, src/tests/contracts/i18nCompletenessGuard.test.ts |
| `Wnętrza & Przeprowadzki` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-routes.test.tsx, tests/matrix-translations.test.ts, src/components/__tests__/settingsScreenLogic.test.ts |
| `Metraż (m²):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Liczba osób:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Minimalny` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Standard` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-routes.test.tsx, tests/matrix-translations.test.ts, src/components/__tests__/craftThemeAndOnboarding.test.ts |
| `Duży` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szacowana kubatura: {vol} m³` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Rekomendowany pojazd: {fleet}` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `▲ Ukryj Manifest 4 Fazy` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Odległość w 1 stronę (km):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Koszt vana (zł/doba):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Długość (m):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szerokość (m):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Korytarz inspekcyjny 50 cm:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Włączony (Zalecany)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wyłączony (Maks. upakowanie)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wnęka (Szer. × Głęb. w cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Rzut wnęki ściennej z góry` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/06-wneka-scienna-listwy.yaml |
| `Szerokość drzwi (cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przekrój mebla (cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zakręt L (90°)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Nawrót U (180°)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Bieg W1 (cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Spocznik W2 (cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Sufit (cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szer. drzwi windy (cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wentylacja` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pralka` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/components/__tests__/activeFocusMode.test.ts, src/components/__tests__/settingsScreenLogic.test.ts |
| `Olej w Agregacie` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Rodzaj strefy użytkowej:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🚪 Szafa (70 cm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/06-wneka-scienna-listwy.yaml |
| `🗄️ Szuflady (90 cm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🧼 Zmywarka (105 cm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🍽️ Krzesło (75 cm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🚶‍♂️ Ciąg ze stołem (100 cm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🛏️ Bok łóżka (60 cm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Strefa ergonomiczna` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/06-wneka-scienna-listwy.yaml |
| `Masa ładunku (kg):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Liczba tragarzy:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Praca dorywcza (50 kg/os.)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Praca stała (30 kg/os.)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✅ Zgodne z przepisami BHP` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `❌ ZAKAZ WNOSZENIA RĘCZNEGO!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Garaż & Hak Holowniczy` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-routes.test.tsx, tests/matrix-translations.test.ts, .maestro/07-garaz-box-dachowy.yaml |
| `Wysokość całkowita` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/07-garaz-box-dachowy.yaml |
| `Platforma na Hak & Rowery` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/07-garaz-box-dachowy.yaml |
| `W NORMIE` | `src/lib/i18n.en.ts` | ✅ | tests/maestro-runner.ts, tests/matrix-translations.test.ts, .maestro/07-garaz-box-dachowy.yaml |
| `Prywatność & Kopia Danych` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/04-kopia-i-przywrocenie.yaml |
| `Kopia Danych (JSON v2)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/04-kopia-i-przywrocenie.yaml |
| `Eksportuj Kopię (JSON v2)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/04-kopia-i-przywrocenie.yaml |
| `Przywróć z Kopii JSON` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wygląd i Jednostki` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Jednostki miar` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Metryczne (cm, kg, litry)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Imperialne (in, lbs, cu ft)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Język interfejsu` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Polski` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `English` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `O aplikacji` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wersja` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Roczny` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dostęp na Zawsze` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Miesięczny` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zakup zrealizowany!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przywrócono zakupy` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Apps4Brew Studio Pass` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Taniej niż espresso` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Aktywny okres próbny` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Okres próbny zakończony` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pełny dostęp aktywny` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Co zyskujesz w pełnej wersji?` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `NAJLEPSZY WYBÓR` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/services/__tests__/app-access.test.ts |
| `Roczny (Polecany)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przywróć Zakupy` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Własny mebel / gabaryt` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `ZAPAKUJESZ BEZ PROBLEMU!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `ZŁÓŻ TYLNĄ KANAPĘ!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `NIE ZMIEŚCI SIĘ!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `POCKET-PROOF · STORE-TO-TRUNK` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Twój samochód:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Popularne meble i AGD` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wpisz wymiary z etykiety` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Długość (cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szerokość (cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wysokość (cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapas długości: {val} cm` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapas szerokości: {val} cm` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapas wysokości: {val} cm` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Apps4Brew Pass ($0.99) →` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📦 Symulator 3D` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Brak aktywnych zakupów` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Długość` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-logic.test.ts, tests/matrix-translations.test.ts, src/domain/__tests__/tapeMeasureAssistant.test.ts |
| `✅ TAK (Bagażnik)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⚠️ ZŁÓŻ KANAPĘ` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `❌ NIE WEJDZIE` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Długość (in):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szerokość (in):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wysokość (in):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapas długości: {val}` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapas szerokości: {val}` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapas wysokości: {val}` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Podaj nazwę przedmiotu` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Błąd zapisu` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Własny przedmiot użytkownika` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Katalog Standardów & Baza` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Rekomendowana skrytka:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Gabaryt` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/components/__tests__/multiCheckerMatrixView.test.ts, src/domain/__tests__/multiCheckerMatrix.test.ts |
| `MIEŚCI SIĘ` | `src/lib/i18n.en.ts` | ✅ | tests/maestro-runner.ts, tests/matrix-translations.test.ts, .maestro/01-pelny-przeplyw-auto-meble.yaml |
| `ZA DUŻY` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Bagaż kabinowy (nad głową):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `WYMAGA DOPŁATY` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Laptop (2 kg)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zgrzewka wody (9 kg)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Walizka L (20 kg)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Worek cementu (25 kg)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `50 km/h (Miasto)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `90 km/h (Trasa)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `140 km/h (Autostrada)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Energia Kinetyczna` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Siła uderzenia (25g)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Mata gumowa (μ=0.6)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Welur (μ=0.3)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Plastik (μ=0.2)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymagana siła opasania:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zalecana liczba pasów:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pionowo (Upright)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pochylenie 45°` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Na płasko (Flat)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Taśma zwijana (±5 mm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dalmierz laserowy (±2 mm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Apple LiDAR / AR (±15 mm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Na oko (±50 mm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Nominalny` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Konserwatywny (max)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szybki Konwerter Jednostek` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Z {u}` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dł. podłogi` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szer. min (nadkola)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Otwór załadunku` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Próg załadunku` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kartony` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/03-alarm-dmc-przeladowanie.yaml |
| `Walizki` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Meble IKEA` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `AGD/RTV` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Sport` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kategoria:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `KRUCHE` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `MOŻNA PIĘTROWAĆ` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `NIE PIĘTROWAĆ` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Nowy Ładunek (SQLite)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Nazwa przedmiotu:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Waga (kg):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapisz do Bazy SQLite` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Udostępnij Przestrzeń` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Protokół Deep Link:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🏢 Garaż & Hak Holowniczy` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szybki model pojazdu:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Typ garażu / bramy:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Brama 240 / Sufit 220` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Parking 230 / B-16 2.0m` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szeroka 260 / Sufit 240` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szerokość bramy ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szer. z lusterkami ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szer. ze złożonymi ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wys. uniesionej klapy ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✅ ZMIEŚCI SIĘ` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⚠️ ZA CIASNO` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Luz po bokach: {val}` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wjazd ze złożonymi lusterkami:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⛔ KOLIZJA` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✅ BEZPIECZNIE` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `💥 UDERZY W SUFIT` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Margines nad klapą: {val}` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wys. auta ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Belki dachowe ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Box / Rowery ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Znak 2.1 m` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `WJAZD OK` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `ZAKAZ` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/components/__tests__/applianceClearanceView.test.ts, src/domain/__tests__/applianceClearance.test.ts |
| `Znak 2.0 m` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Znak 1.9 m` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pusty box + belki ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Bagaż w boxie ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zwis przód ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zwis tył ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Waga platformy ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Liczba rowerów:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Całkowity nacisk na kulę haka:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Status bezpieczeństwa:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✅ W NORMIE` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⚠️ PRZECIĄŻENIE HAKA!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dno ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dach ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wys. ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szyba (°):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Ciężar skupiony ładunku ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `np. 150 kg cementu` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⛔ RYZYKO ZAŁAMANIA PÓŁKI!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⚠️ UWAGA NA NACISK PUNKTOWY` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✅ OBCIĄŻENIE BEZPIECZNE` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `PLAN ZAŁADUNKU BAGAŻNIKA` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pojazd` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/tests/combinatorial/vehicleCargoMatrix.test.ts |
| `Status` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-dimensions.test.tsx, tests/matrix-translations.test.ts, .maestro/03-alarm-dmc-przeladowanie.yaml |
| `Bezpieczna` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Balans poprzeczny` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Idealny (symetryczny)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Asymetria {val} mm` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `poz.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wakacje (4 walizki)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zakupy IKEA` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `AGD + Kartony` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/03-alarm-dmc-przeladowanie.yaml |
| `Wybierz Samochód` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pasażerowie (poza kierowcą):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✅ WSZYSTKO SIĘ MIEŚCI!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wykorzystanie` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/01-pelny-przeplyw-auto-meble.yaml |
| `Waga ładunku` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Ładunek` | `src/lib/i18n.en.ts` | ✅ | tests/interaction-guards.test.ts, tests/matrix-translations.test.ts, src/components/__tests__/craftUiComponents.test.ts |
| `BEZPIECZNIE` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `UWAGA` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Asymetria ({val} mm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kruche` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/domain/__tests__/extremePoints.test.ts |
| `Tylko pion` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymiary:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapisz Plan Załadunku w SQLite` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Metraż lokalu:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szacowana kubatura:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `masa mienia:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Rekomendowana flota:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Boks self-storage:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szacowane kartony:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Odległość:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `w jedną stronę` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Rekomendacja:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wynajem Busa` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/05-przeprowadzka-mieszkania.yaml |
| `Kursy Osobówką` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Osobówka:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `kursów` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `koszt łączny:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Van:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `kurs` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Plan Przeprowadzki` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/services/__tests__/services.test.ts |
| `Waga mienia: ~{weight}` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kombi ({count} kursy):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Bus van ({count} kurs):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wnęka` | `src/lib/i18n.en.ts` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/matrix-translations.test.ts, src/tests/combinatorial/roomFittingExhaustive.test.ts |
| `Szafa` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-logic.test.ts, tests/matrix-translations.test.ts, src/lib/__tests__/backup-rotation.test.ts |
| `✅ Szafa mieści się we wnęce!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `❌ Kolizja! Mebel nie wejdzie` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Ścianka kolankowa ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kąt dachu (stopnie):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Drzwi` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/tests/combinatorial/doorwayExhaustive.test.ts |
| `Mebel` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/components/__tests__/visualizers.test.ts, src/tests/combinatorial/doorwayExhaustive.test.ts |
| `❌ Zablokuje się w drzwiach!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kształt klatki schodowej:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Bieg W1 ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Spocznik W2 ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Sufit ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Typowa kabina windy w bloku:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `4-osobowa (Wielka płyta)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `8-osobowa (Nowe bloki)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Towarowa / Szpitalna` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapas: +{val} cm` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Brak: {val} cm` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Masa ładunku ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `{n} os.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pralka (65 kg)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szafa dąb (90 kg)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Sejf (120 kg)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pianino (220 kg)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Obciążenie:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wnętrza & Dom` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Garaż & Hak` | `src/lib/i18n.en.ts` | ✅ | tests/maestro-runner.ts, tests/matrix-routes.test.tsx, tests/matrix-translations.test.ts |
| `Lodówka` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `TV OLED` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Załadunek` | `src/lib/i18n.en.ts` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/maestro-runner.ts, tests/matrix-routes.test.tsx |
| `Przestrzenie` | `src/lib/i18n.en.ts` | ✅ | tests/maestro-runner.ts, tests/matrix-translations.test.ts, src/components/__tests__/craftPurgeVerification.test.ts |
| `Ekwipunek` | `src/lib/i18n.en.ts` | ✅ | tests/maestro-runner.ts, tests/matrix-translations.test.ts, src/components/__tests__/craftPurgeVerification.test.ts |
| `Codzienny Transport & Zakupy` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/components/__tests__/settingsScreenLogic.test.ts |
| `Wyprawy & Przyczepa` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/components/__tests__/settingsScreenLogic.test.ts |
| `Paczkomat` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/02-szybki-test-paczkomat.yaml |
| `Bagażnik` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/lib/__tests__/deep-links.test.ts, src/services/__tests__/services.test.ts |
| `Bagaż Podręczny` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Ościeżnice & Korytarz` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Skosy Poddasza` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wnęki Meblowe` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Nacisk na Hak S` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Box Dachowy` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/07-garaz-box-dachowy.yaml |
| `Środek Ciężkości CoG` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Rozpocznij Rytuał` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `LUZ BEZPIECZEŃSTWA` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `OBCIĄŻENIE ŁADOWNOŚCI` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `POSTĘP` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kroków` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Bez kolizji` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `SPAKOWANE` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `POZYCJA W PRZESTRZENI` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `WSKAZÓWKA RZEMIEŚLNICZA` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymaga unieruchomienia` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Oznacz jako niespakowane` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Odznacz: Ładunek w aucie` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Następny krok` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Poprzedni` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Profil Rytuału` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Rodzina Apps4Craft Studio` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Tryb Skupienia (Active Focus)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Tryb Warsztatowy` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `LUZ DRZWI` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przejdzie` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zablokowanie` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/domain/__tests__/staircaseRotation.test.ts |
| `OBRÓT SCHODY` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Płaski` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pionizacja` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Brak przejścia` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `NORMA BHP` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dozwolone` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zakaz!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Aktywny` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Ta aplikacja` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zamknij tryb skupienia` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Poprzedni krok` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Nie znaleziono rekordu` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wróć do ekranu głównego` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wykryto uszkodzony stan danych` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przywróć kopię` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przywróć` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zamknij powiadomienie` | `src/lib/i18n.en.ts` | ✅ | tests/close-button-guard.test.tsx, tests/matrix-translations.test.ts |
| `Szukaj...` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wyczyść wyszukiwanie` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Eksport CSV` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |

### Kategoria: TEKST (200/200)

| Identyfikator / Klucz | Źródło | Pokrycie | Dowód testowy |
| :--- | :--- | :---: | :--- |
| `Nie udało się zapisać przedmiotu` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Deterministyczny algorytm Extreme Points & Rzuty 2.5D (RD-02)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🧊 Schemat Załadunku (Rzut 2.5D / 2D)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📋 Kolejność Załadunku (Krok po Kroku)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⚖️ Balans i Środek Ciężkości (RD-20)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📤 Udostępnij Plan Załadunku (Z-128, Z-130)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wyślij kompletny plan załadunku z kolejnością pakowania, wymiarami paczek i bilansem DMC przez Wiadomości, WhatsApp, AirDrop lub wydrukuj.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📲 Udostępnij / Kopiuj Manifest Załadunku` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kalkulator floty, wnęki z listwami, ościeżnice i schody (Moving Sofa)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🚚 Kalkulator Floty Przeprowadzkowej (RD-49)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Poziom umeblowania / zagracenia:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Boks self-storage: min. {area} m²` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Potrzebne kartony: ~{count} szt. • Waga mienia: ~{weight} kg` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `▼ Zobacz Manifest Załadunku (Zasada 4 Fazy)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/05-przeprowadzka-mieszkania.yaml |
| `📋 Zasada 4 Fazy Załadunku (FitCheck Manifest):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `1. Ciężkie AGD i korpusy szaf (Przy grodzi czołowej furgonu)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `2. Meble skrzyniowe, komody, stoły i kartony bazowe` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `3. Wypełniacze, miękkie torby, pościel (Blokowanie luzów)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `4. Karton „Pierwsza Noc” (Przy drzwiach kontenera / Wyjmowany jako 1.)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `💰 Porównanie: Osobówka vs Wynajem Busa (Z-164)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📤 Udostępnij Raport Przeprowadzki (Z-186)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/05-przeprowadzka-mieszkania.yaml |
| `📦 Boks Self-Storage & Ścieżka Inspekcyjna (RD-50)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymiary boksu magazynowego (Długość × Szerokość w metrach):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📐 Wnęka Ścienna & Listwy Przypodłogowe (RD-36)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Mebel / Szafa (Szer. × Głęb. w cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🚪 Ościeżnica Drzwiowa & Klamka (RD-33)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🪜 Schody & Spocznik (Moving Sofa 3D, RD-34)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🛗 Winda Osobowa & Przekątna 3D (RD-35)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymiary kabiny (Głęb. × Szer. × Wys. w cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przedmiot / Blat / Materac (Dł. × Szer. × Wys. w cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `❄️ Wymiarowanie Montażowe & Wentylacja AGD (RD-37…RD-51)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📐 Ergonomia Stref Mebli i Przejść (RD-51, DEC-45)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Weryfikacja minimalnych stref wysuwu szuflad, otwarcia frontów i swobody przejścia:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dostępna przestrzeń przed meblem (cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✅ Strefa ergonomiczna i swobodna` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `❌ Zbyt ciasno na swobodne użytkowanie!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `👷 Zespół Tragarzy i Normy Dźwigania BHP (RD-53, Z-188)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kontrola dopuszczalnych norm dźwigania ręcznego monolitów (pianino, sejf, szafy dębowe):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Skrajnia Bramy & Klapa Bagażnika` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/07-garaz-box-dachowy.yaml |
| `Box Dachowy vs Parking Podziemny` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/07-garaz-box-dachowy.yaml |
| `🐕 Klatka Kennelowa dla Psa a Skos Szyby (RD-46, Z-184)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🛡️ Ochrona Podwójnej Podłogi Bagażnika (RD-47, Z-185)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dziękujemy! Plan {plan} został aktywowany. Pełny dostęp bez limitów jest odblokowany.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Twój dostęp do Apps4Brew Studio Pass został pomyślnie zweryfikowany.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Bezpieczeństwo ładunku, precyzja 3D i zero zgadywania w sklepie` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Mniej niż koszt jednej kawy, by zaoszczędzić setki złotych na pomyłkach w transporcie i meblach.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pozostało {count} wolnych projektów ({days} dni do końca)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wybierz plan, aby tworzyć nowe projekty. Twoja dotychczasowa historia pozostaje ZAWSZE bezpłatna!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dziękujemy za wsparcie niezależnego studia Apps4Brew! Wszystkie funkcje bez limitów.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✓ Nielimitowane symulacje 3D bagażnika i wnoszenia mebli` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✓ Baza ponad 350 modeli samochodów i katalog wymiarów IKEA` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✓ Szybka weryfikacja w sklepie Store-to-Trunk (Pocket-Proof)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✓ Kontrola DMC, nacisku kuli haka (S) i ochrona skrajni garażowych` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Twoje zapisane samochody, meble i historia sesji pozostają ZAWSZE dostępne (Read-Only). Nigdy nie stracisz dostępu do swoich pomiarów.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `100% Offline-First · Zero Analityki i Śledzenia · Apps4Brew Studio` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Mebel mieści się w bagażniku bez składania kanapy. Zapas do klapy: {margin} cm.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Mebel jest za długi na standardowy bagażnik, ale wejdzie na płasko po złożeniu foteli (długość ładunkowa: {len} cm).` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymiary paczki przekraczają maksymalną przestrzeń ładunkową auta.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Paczka wystaje o {deficit} cm poza krawędź bagażnika nawet przy złożonej kanapie!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szerokość mebla przekracza szerokość otworu bagażnika między nadkolami.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wysokość mebla przekracza wysokość dachu bagażnika.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Błyskawiczna weryfikacja w sklepie` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wybierz auto i mebel, aby w 3 sekundy poznać werdykt przed pójściem do kasy.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zobacz ułożenie w symulatorze 3D →` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Tryb Archiwalny (Read-Only) — Dotknij, aby odblokować pełną wersję` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Twoja historia i pomiary są bezpieczne. Wybierz plan od $0.99/msc, aby tworzyć nowe załadunki.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Trial: {count} wolnych projektów ({days} dni)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⚡ Szybki Werdykt (Pocket-Proof)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Nie znaleziono wcześniejszych zakupów przypisanych do tego urządzenia.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dodano własny ładunek do bazy SQLite.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Paczkomaty, linie lotnicze, 350+ aut, fizyka ładunku i miarka` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przeglądasz katalog w trybie do odczytu. Aktywuj Apps4Brew Pass ($0.99), aby dodawać własne przedmioty.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Weryfikator Paczkomatów InPost (RD-09)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymiary Twojej paczki w cm (Dł. × Szer. × Wys.):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `PRZEKRACZA GABARYT C (Nie zmieści się)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Sizer Linii Lotniczych (IATA / Cabin Bag)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wybierz linię lotniczą i wymiary walizki z kółkami:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `👜 Miękka torba (Można upchnąć w sizerze +2 cm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🧳 Sztywna walizka skorupowa (Zero tolerancji)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przedmiot osobisty (pod fotel):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szkoła Pakowania & Fizyka Zderzenia (BR-EDU)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Niezamocowany ładunek w czasie zderzenia przy przeciążeniu 25g (Euro NCAP) zachowuje się jak pocisk:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymogi Mocowania Pasami (Norma PN-EN 12195-1)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zasady Przewozu AGD i Czas Odstania Płynów` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymagany czas odstania przed włączeniem:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymóg założenia blokad transportowych bębna!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Asystent Miarki & Marginesy Niepewności (BR-POM)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wprowadź zmierzony wymiar i wybierz narzędzie, aby uwzględnić margines błędu:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przedział niepewności (±{pct}%):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Standardowe Przedmioty Odniesienia (Kalibracja)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Geometria Bagażników — Baza Pojazdów (B2)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wybierz model, aby zobaczyć realne wymiary użytkowe:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Udostępnij Przestrzeń (Wektorowy Kod QR / Link)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Katalog Mebli, Kartonów i AGD (B3)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dodaj Własny Przedmiot do SQLite` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymiary (Dł. × Szer. × Wys. w cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zeskanuj ten kod z drugiego telefonu aparatem lub otwórz aplikacją Czy się zmieści?.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Udostępnij Link w Innej Aplikacji` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Konfiguracja garażu i haka została zapisana w bazie SQLite.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Skrajnie wjazdowe bramy, parkingi podziemne (B-16) i nacisk kuli haka S` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przeglądasz zapisane profile. Wybierz Apps4Brew Pass ($0.99), aby modyfikować i tworzyć nowe.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🚪 Skrajnia Bramy & Klapa Bagażnika (RD-41, RD-42)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wjazd z rozłożonymi lusterkami:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kolizja klapy z sufitem ({val}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🚗 Box Dachowy vs Parking Podziemny (RD-43)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wysokość całkowita (z buforem +3 cm na nierówności):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Limit nośności relingów dachowych:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🚲 Platforma na Hak & Rowery (RD-44, Nośność S)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dopuszczalny nacisk pionowy haka S (tabliczka znamionowa):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⚡ Rowery elektryczne E-Bike (~24 kg/szt.)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🚲 Rowery tradycyjne (~13 kg/szt.)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🐕 Klatka Kennelowa a Skos Szyby Bagażnika (RD-46)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymiary klatki (Dół × Góra × Wys. w cm) vs Kąt szyby klapy:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🛡️ Nośność Podwójnej Podłogi Bagażnika (RD-47)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Ochrona modułowych szyn i półki przed załamaniem przy transporcie materiałów (cement, glazura):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📦 Auto posiada podwójną / podwyższoną podłogę bagażnika (limit ~120 kg)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🚙 Zwykła stalowa podłoga fabryczna (pełna nośność bagażnika)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapisz konfigurację garażu w SQLite` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Plan załadunku został trwale zapisany w bazie SQLite i kopii zapasowej.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✅ Wszystkie przedmioty zmieszczone` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⚠️ Niektóre przedmioty nie zmieściły się` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `KOLEJNOŚĆ ZAŁADUNKU (KROK PO KROKU)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `OSTRZEŻENIA I ZALECENIA BEZPIECZEŃSTWA` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⚠️ CZĘŚĆ PRZEDMIOTÓW NIE WEJDZIE` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapakowano {packed} z {total} przedmiotów do bagażnika {car}` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Schemat Załadunku (Rzut 2.5D / 2D)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zaawansowany bilans masy i fizyka załadunku (DMC, CoG)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Balans i Środek Ciężkości (RD-20)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przedmioty do zapakowania ({count} zaznaczonych)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kolejność Załadunku (Krok po Kroku)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pozycja X/Y/Z: {x} / {y} / {z} cm` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapisz i Udostępnij Plan Załadunku (Z-128, Z-130)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapisz konfigurację w lokalnej bazie SQLite i wyślij kompletny plan załadunku przez Wiadomości, WhatsApp lub AirDrop.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Udostępnij / Kopiuj Manifest Załadunku` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Projekt przeprowadzki został trwale zapisany w bazie SQLite i kopii zapasowej.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `PLAN PRZEPROWADZKI I SEKWENCJA ZAŁADUNKU — FitCheck Manifest (Z-186, RD-49)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `ZASADA 4 FAZY ZAŁADUNKU FURGONU` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Faza 1: Ciężkie AGD (pralka, lodówka) i korpusy szaf — montowane przy grodzi czołowej furgonu` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Faza 2: Meble skrzyniowe, komody, stoły i standardowe kartony bazowe` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Faza 3: Wypełniacze, miękkie torby, pościel (blokowanie luzów w furgonie)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Faza 4: Karton „Pierwsza Noc” (przy drzwiach tylnych / wyjmowany jako 1.)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `RACHUNEK EKONOMICZNY: OSOBÓWKA VS VAN (Z-164)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `ZALECENIA BEZPIECZEŃSTWA LOGISTYCZNEGO` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `AGD chłodnicze przewoź w pionie lub odczekaj 12-24h przed włączeniem zasilania (Z-189)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Używaj pasów transportowych o wytrzymałości min. 500 daN` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zespół tragarzy: max 50 kg/osobę dorywczo wg norm BHP (Z-188)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przeglądasz kalkulacje w trybie do odczytu. Aktywuj Apps4Brew Pass ($0.99), aby edytować parametry i tworzyć nowe plany.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Kalkulator Floty Przeprowadzkowej (RD-49)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Rekomendowany pojazd: {vehicle}` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Potrzebne kartony: ~{boxes} szt.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zasada 4 Fazy Załadunku (FitCheck Manifest):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Ciężkie AGD i korpusy szaf (Przy grodzi czołowej furgonu)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Meble skrzyniowe, komody, stoły i kartony bazowe` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wypełniacze, miękkie torby, pościel (Blokowanie luzów)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Karton „Pierwsza Noc” (Przy drzwiach kontenera / Wyjmowany jako 1.)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Porównanie: Osobówka vs Wynajem Busa (Z-164)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zapisz Projekt Przeprowadzki w SQLite` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Udostępnij Raport Przeprowadzki (Z-186)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, .maestro/05-przeprowadzka-mieszkania.yaml |
| `Boks Self-Storage & Ścieżka Inspekcyjna (RD-50)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `🚶 Korytarz inspekcyjny 50 cm: AKTYWNY (Łatwy dostęp do kartonów)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `📦 Bez korytarza: Zapełnienie 100% (Ryzyko braku dostępu)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Pasowanie we Wnęce i Listwy (RD-36)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szerokość wnęki ({u}) vs Szerokość szafy ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Uwaga: Mebel mieści się u góry, ale koliduje z listwami przypodłogowymi! (Szerokość przy podłodze to {val} cm)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Skosy Poddasza & Wysokość Użytkowa (RD-48)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wysokość ścianki kolankowej i kąt połaci dachu:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Mebel pod skosem (Głęb. × Wys. \| Od ściany w cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przejście przez Drzwi i Klamka (RD-33)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Szerokość drzwi ({u}) vs Najmniejszy wymiar mebla ({u}):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✅ Przejdzie bezpiecznie z tragarzami` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Efektywne światło (klamka -6cm, skrzydło -4.5cm, dłonie -10cm): {val} cm` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Schody & Spocznik (Moving Sofa 3D, RD-34)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymiary mebla (Dł. × Szer. × Wys. w cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✅ Obrót płaski możliwy bez unoszenia` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `⤴️ Wymaga pionizacji / uniesienia pod kątem {angle}°` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `❌ Zablokowanie! Mebel zaklinuje się na schodach` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Winda Osobowa & Towarowa (Przekątna 3D, RD-35)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymiary kabiny (Gł. × Szer. × Wys. w cm) i Drzwi (cm):` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `✅ Wjedzie windą po przekątnej przestrzennej` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `❌ Zablokuje się w drzwiach windy!` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `❌ Za długi na przekątną (wymagane wnoszenie schodami)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Przekątna kabiny 3D: {diag} • Max długość z buforem 5 cm: {len}` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wymiarowanie Montażowe & Wentylacja AGD (RD-37…RD-51)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Ergonomia Stref Mebli i Przejść (RD-51, DEC-45)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Norma: {req} cm • Dostępne: {avail} cm` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Zespół Tragarzy i Normy Dźwigania BHP (RD-53, Z-188)` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Waga przekracza 150 kg — bezwzględny wymóg użycia schodołazu lub pasów nośnych na ramiona.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wybierz swój profil rzemieślniczy. Dostosujemy układ narzędzi i kalkulatorów.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Paczkomaty InPost, sizer lotniczy, bagażnik i zakupy gabarytowe` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Problem ruchomej sofy (Moving Sofa), ościeżnice, wnęki i skosy poddasza` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts, src/components/__tests__/settingsScreenLogic.test.ts |
| `Nacisk na hak (S), box dachowy, bagażnik rowerowy i rozkład masy DMC` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `100% offline • Bez konta • Zmienisz to w każdej chwili w Ustawieniach` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Rytuał Załadunku: Tryb Skupienia` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Ciężki ładunek (≥20kg) • 2 osoby` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Wybierz profil, aby dostosować układ narzędzi w aplikacji:` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Rzemieślniczy ekosystem 100% offline-first. Żadnych chmur, żadnej telemetrii.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Unieruchom pasem lub zablokuj miękkim ładunkiem.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Dosuń ściśle do krawędzi lub oparcia kanapy.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Ten element mógł zostać wcześniej usunięty.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |
| `Oryginalne dane zostały zabezpieczone. Możesz przywrócić ostatnią kopię ratunkową.` | `src/lib/i18n.en.ts` | ✅ | tests/matrix-translations.test.ts |

### Kategoria: LOGIKA (91/91)

| Identyfikator / Klucz | Źródło | Pokrycie | Dowód testowy |
| :--- | :--- | :---: | :--- |
| `wasStateCorrupt` | `src/lib/backup.ts` | ✅ | src/lib/__tests__/backup-rotation.test.ts |
| `resetCorruptFlag` | `src/lib/backup.ts` | ✅ | src/lib/__tests__/backup-rotation.test.ts |
| `recordCorruptState` | `src/lib/backup.ts` | ✅ | src/lib/__tests__/backup-rotation.test.ts |
| `getLatestCorruptRaw` | `src/lib/backup.ts` | ✅ | tests/matrix-logic.test.ts |
| `buildBackup` | `src/lib/backup.ts` | ✅ | src/components/__tests__/settingsScreenLogic.test.ts, src/lib/__tests__/backup-rotation.test.ts, src/lib/__tests__/backup.test.ts |
| `localISODate` | `src/lib/backup.ts` | ✅ | tests/matrix-logic.test.ts |
| `stampOf` | `src/lib/backup.ts` | ✅ | src/lib/__tests__/backup.test.ts |
| `poolKey` | `src/lib/backup.ts` | ✅ | src/lib/__tests__/backup-rotation.test.ts, src/lib/__tests__/backup.test.ts |
| `exportBackup` | `src/lib/backup.ts` | ✅ | tests/matrix-invariants.test.ts, src/components/__tests__/settingsScreenLogic.test.ts, src/data/db/__tests__/database.test.ts |
| `rotatePool` | `src/lib/backup.ts` | ✅ | src/lib/__tests__/backup-rotation.test.ts |
| `autoBackup` | `src/lib/backup.ts` | ✅ | src/lib/__tests__/backup.test.ts |
| `safetyBackup` | `src/lib/backup.ts` | ✅ | src/components/__tests__/settingsScreenLogic.test.ts, src/lib/__tests__/backup.test.ts |
| `parseAndValidateBackup` | `src/lib/backup.ts` | ✅ | src/components/__tests__/settingsScreenLogic.test.ts, src/lib/__tests__/backup-rotation.test.ts, src/lib/__tests__/backup.test.ts |
| `escapeCsvCell` | `src/lib/backup.ts` | ✅ | src/lib/__tests__/backup-rotation.test.ts |
| `formatCsv` | `src/lib/backup.ts` | ✅ | tests/matrix-logic.test.ts, src/lib/__tests__/backup-rotation.test.ts |
| `exportCsvHistory` | `src/lib/backup.ts` | ✅ | tests/matrix-logic.test.ts |
| `validateButtonLabel` | `src/lib/confirm.ts` | ✅ | src/lib/__tests__/confirm.test.ts |
| `confirm` | `src/lib/confirm.ts` | ✅ | tests/interaction-guards.test.ts, src/lib/__tests__/confirm.test.ts |
| `dbDirectory` | `src/lib/db-path.ts` | ✅ | src/data/db/__tests__/database.test.ts |
| `utf8ToBase64` | `src/lib/deep-links.ts` | ✅ | src/lib/__tests__/deep-links.test.ts |
| `base64ToUtf8` | `src/lib/deep-links.ts` | ✅ | src/lib/__tests__/deep-links.test.ts |
| `encodeSpaceDeepLink` | `src/lib/deep-links.ts` | ✅ | src/lib/__tests__/deep-links.test.ts |
| `decodeSpaceDeepLink` | `src/lib/deep-links.ts` | ✅ | src/lib/__tests__/deep-links.test.ts |
| `setLang` | `src/lib/i18n.ts` | ✅ | tests/matrix-logic.test.ts, src/components/__tests__/settingsScreenLogic.test.ts, src/lib/__tests__/i18n.test.ts |
| `lang` | `src/lib/i18n.ts` | ✅ | tests/matrix-logic.test.ts, src/lib/__tests__/i18n.test.ts, src/tests/contracts/i18nCompletenessGuard.test.ts |
| `useLang` | `src/lib/i18n.ts` | ✅ | tests/matrix-logic.test.ts |
| `t` | `src/lib/i18n.ts` | ✅ | tests/close-button-guard.test.tsx, tests/i18n-no-polish-in-en.test.tsx, tests/interaction-guards.test.ts |
| `normSearch` | `src/lib/search.ts` | ✅ | tests/interaction-guards.test.ts |
| `getCurrentUnitSystem` | `src/lib/unit-converter.ts` | ✅ | tests/matrix-logic.test.ts |
| `setUnitSystem` | `src/lib/unit-converter.ts` | ✅ | tests/matrix-logic.test.ts, src/components/__tests__/settingsScreenLogic.test.ts, src/lib/__tests__/unit-converter.test.ts |
| `getUnitSystem` | `src/lib/unit-converter.ts` | ✅ | src/components/__tests__/settingsScreenLogic.test.ts, src/lib/__tests__/unit-converter.test.ts |
| `useUnitSystem` | `src/lib/unit-converter.ts` | ✅ | tests/matrix-logic.test.ts |
| `mmToInches` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `inchesToMm` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `cmToInches` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `inchesToCm` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `cmToFeet` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `feetToCm` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `formatDimension` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `formatDimensions3D` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `litersToCubicFeet` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `cubicFeetToLiters` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `m3ToCubicFeet` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `cubicFeetToM3` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `formatVolume` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `formatM3` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `kgToPounds` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `poundsToKg` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `formatWeight` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/unit-converter.test.ts |
| `wInKeep` | `src/lib/unit-converter.ts` | ✅ | src/lib/__tests__/wInKeep.test.ts |
| `calculateDoorwayClearance` | `src/domain/doors-stairs/doorwayClearance.ts` | ✅ | src/domain/__tests__/doorwayClearance.test.ts, src/domain/__tests__/propertyBased.test.ts, src/tests/combinatorial/doorwayExhaustive.test.ts |
| `calculateElevatorFit` | `src/domain/doors-stairs/elevatorDiagonal.ts` | ✅ | tests/matrix-invariants.test.ts, src/domain/__tests__/elevatorDiagonal.test.ts, src/domain/__tests__/geometry-corpus.test.ts |
| `evaluateStaircaseLandingTurn` | `src/domain/doors-stairs/staircaseRotation.ts` | ✅ | src/domain/__tests__/staircaseRotation.test.ts, src/tests/benchmarks/packingPerformance.test.ts, src/tests/resilience/faultTolerance.test.ts |
| `evaluateQuizAnswers` | `src/domain/education/safetyQuiz.ts` | ✅ | src/domain/__tests__/safetyQuiz.test.ts |
| `calculateKennelBevelAngle` | `src/domain/garage/dogKennel.ts` | ✅ | src/domain/__tests__/dogKennel.test.ts |
| `evaluateDogKennelFit` | `src/domain/garage/dogKennel.ts` | ✅ | src/domain/__tests__/dogKennel.test.ts |
| `evaluateGarageFit` | `src/domain/garage/garageClearance.ts` | ✅ | src/domain/__tests__/garageClearance.test.ts |
| `evaluateRoofSetupHeight` | `src/domain/garage/garageClearance.ts` | ✅ | src/domain/__tests__/garageClearance.test.ts, src/tests/guards/architectureGuards.test.ts |
| `calculateRoofRackLoad` | `src/domain/garage/roofAndOverhang.ts` | ✅ | src/domain/__tests__/roofAndOverhang.test.ts |
| `validateCargoOverhang` | `src/domain/garage/roofAndOverhang.ts` | ✅ | src/domain/__tests__/roofAndOverhang.test.ts |
| `evaluateFalseFloorLoad` | `src/domain/garage/roofAndOverhang.ts` | ✅ | src/domain/__tests__/roofAndOverhang.test.ts |
| `evaluateTowbarLoad` | `src/domain/garage/towbarPhysics.ts` | ✅ | src/domain/__tests__/propertyBased.test.ts, src/domain/__tests__/towbarPhysics.test.ts, src/tests/combinatorial/towbarDmcMatrix.test.ts |
| `evaluateAperturePassage` | `src/domain/geometry/aperture.ts` | ✅ | src/domain/__tests__/aperture.test.ts |
| `doesOverlap` | `src/domain/geometry/extremePoints.ts` | ✅ | src/domain/__tests__/extremePoints.test.ts, src/domain/__tests__/propertyBased.test.ts, src/tests/combinatorial/vehicleCargoMatrix.test.ts |
| `isInsideTrunkBoundary` | `src/domain/geometry/extremePoints.ts` | ✅ | src/domain/__tests__/extremePoints.test.ts, src/tests/combinatorial/vehicleCargoMatrix.test.ts |
| `getOrientations` | `src/domain/geometry/extremePoints.ts` | ✅ | src/domain/__tests__/extremePoints.test.ts, src/tests/combinatorial/vehicleCargoMatrix.test.ts |
| `packItemsInTrunk` | `src/domain/geometry/extremePoints.ts` | ✅ | src/domain/__tests__/extremePoints.test.ts, src/domain/__tests__/propertyBased.test.ts, src/tests/benchmarks/packingPerformance.test.ts |
| `calculateToleranceBounds` | `src/domain/measuring/tapeMeasureAssistant.ts` | ✅ | src/components/__tests__/screenRulerAndTapeAssistant.test.ts, src/domain/__tests__/tapeMeasureAssistant.test.ts |
| `validateMeasurementSanity` | `src/domain/measuring/tapeMeasureAssistant.ts` | ✅ | src/components/__tests__/screenRulerAndTapeAssistant.test.ts, src/domain/__tests__/tapeMeasureAssistant.test.ts |
| `calculateScreenPointsForMm` | `src/domain/measuring/tapeMeasureAssistant.ts` | ✅ | src/components/__tests__/screenRulerAndTapeAssistant.test.ts, src/domain/__tests__/tapeMeasureAssistant.test.ts |
| `convertLength` | `src/domain/measuring/tapeMeasureAssistant.ts` | ✅ | src/components/__tests__/screenRulerAndTapeAssistant.test.ts, src/domain/__tests__/tapeMeasureAssistant.test.ts |
| `calculateCenterOfGravity` | `src/domain/physics/centerOfGravity.ts` | ✅ | src/domain/__tests__/centerOfGravity.test.ts, src/domain/__tests__/multiAxisStressMatrix.test.ts, src/tests/combinatorial/vehicleCargoMatrix.test.ts |
| `calculateCrashPhysics` | `src/domain/physics/crashPhysicsSimulator.ts` | ✅ | src/domain/__tests__/crashPhysicsSimulator.test.ts |
| `calculateLashingRequirements` | `src/domain/physics/crashPhysicsSimulator.ts` | ✅ | src/domain/__tests__/crashPhysicsSimulator.test.ts |
| `evaluateApplianceTransportProtocol` | `src/domain/physics/crashPhysicsSimulator.ts` | ✅ | src/domain/__tests__/crashPhysicsSimulator.test.ts |
| `calculatePayloadDMC` | `src/domain/physics/payloadDMC.ts` | ✅ | src/domain/__tests__/payloadDMC.test.ts, src/tests/combinatorial/vehicleCargoMatrix.test.ts, src/tests/contracts/standardsCompliance.test.ts |
| `compareCarVsVanRelocation` | `src/domain/relocation/vanVsCarEconomics.ts` | ✅ | src/components/__tests__/craftPurgeVerification.test.ts, src/domain/__tests__/vanVsCarEconomics.test.ts |
| `estimateRelocationVolume` | `src/domain/relocation/volumeEstimator.ts` | ✅ | src/domain/__tests__/volumeEstimator.test.ts |
| `evaluateRefrigeratorFit` | `src/domain/room-fitting/applianceClearance.ts` | ✅ | src/components/__tests__/applianceClearanceView.test.ts, src/domain/__tests__/applianceClearance.test.ts, src/tests/guards/applianceVentilationGuard.test.ts |
| `evaluateWashingMachineInstallation` | `src/domain/room-fitting/applianceClearance.ts` | ✅ | src/components/__tests__/applianceClearanceView.test.ts, src/domain/__tests__/applianceClearance.test.ts, src/tests/guards/applianceVentilationGuard.test.ts |
| `evaluateCompressorRest` | `src/domain/room-fitting/applianceClearance.ts` | ✅ | src/components/__tests__/applianceClearanceView.test.ts, src/domain/__tests__/applianceClearance.test.ts, src/tests/guards/applianceVentilationGuard.test.ts |
| `analyzeAtticSlope` | `src/domain/room-fitting/atticAndErgonomics.ts` | ✅ | src/domain/__tests__/atticAndErgonomics.test.ts, src/tests/combinatorial/roomFittingExhaustive.test.ts |
| `evaluateFurnitureUnderSlope` | `src/domain/room-fitting/atticAndErgonomics.ts` | ✅ | src/domain/__tests__/atticAndErgonomics.test.ts, src/tests/combinatorial/roomFittingExhaustive.test.ts |
| `calculateSelfStorageCapacity` | `src/domain/room-fitting/atticAndErgonomics.ts` | ✅ | src/domain/__tests__/atticAndErgonomics.test.ts |
| `evaluateFunctionalClearance` | `src/domain/room-fitting/atticAndErgonomics.ts` | ✅ | src/domain/__tests__/atticAndErgonomics.test.ts |
| `evaluatePorterManualHandling` | `src/domain/room-fitting/atticAndErgonomics.ts` | ✅ | src/domain/__tests__/atticAndErgonomics.test.ts |
| `evaluateNicheFit` | `src/domain/room-fitting/nicheCalculator.ts` | ✅ | src/domain/__tests__/nicheCalculator.test.ts, src/tests/combinatorial/roomFittingExhaustive.test.ts, src/tests/resilience/faultTolerance.test.ts |
| `validateAviationSizer` | `src/domain/standards/aviationSizers.ts` | ✅ | src/domain/__tests__/aviationSizers.test.ts, src/tests/combinatorial/sizerExhaustive.test.ts |
| `evaluateMultiCheckerMatrix` | `src/domain/standards/multiCheckerMatrix.ts` | ✅ | src/components/__tests__/multiCheckerMatrixView.test.ts, src/domain/__tests__/multiCheckerMatrix.test.ts |
| `validateInPostLocker` | `src/domain/standards/parcelLockers.ts` | ✅ | src/domain/__tests__/parcelLockers.test.ts, src/tests/combinatorial/sizerExhaustive.test.ts, src/tests/contracts/standardsCompliance.test.ts |
| `calculateVdaCapacity` | `src/domain/standards/vdaCalculator.ts` | ✅ | src/domain/__tests__/vdaCalculator.test.ts, src/tests/contracts/standardsCompliance.test.ts |

### Kategoria: WYMIAR (22/22)

| Identyfikator / Klucz | Źródło | Pokrycie | Dowód testowy |
| :--- | :--- | :---: | :--- |
| `FORBIDDEN_DIALOG_BUTTONS` | `src/lib/confirm.ts` | ✅ | src/lib/__tests__/confirm.test.ts |
| `DecodeSpaceResult` | `src/lib/deep-links.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `UnitSystem` | `src/lib/unit-converter.ts` | ✅ | tests/matrix-logic.test.ts, src/components/__tests__/settingsScreenLogic.test.ts, src/lib/__tests__/unit-converter.test.ts |
| `UnitType` | `src/lib/unit-converter.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `CARGO_SCHOOL_LESSONS` | `src/domain/education/safetyQuiz.ts` | ✅ | src/domain/__tests__/safetyQuiz.test.ts |
| `SAFETY_QUIZ_QUESTIONS` | `src/domain/education/safetyQuiz.ts` | ✅ | src/domain/__tests__/safetyQuiz.test.ts |
| `RotationConstraint` | `src/domain/geometry/types.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `MeasurementTool` | `src/domain/measuring/tapeMeasureAssistant.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `STANDARD_REFERENCE_OBJECTS` | `src/domain/measuring/tapeMeasureAssistant.ts` | ✅ | src/components/__tests__/screenRulerAndTapeAssistant.test.ts, src/domain/__tests__/tapeMeasureAssistant.test.ts |
| `TrunkFrictionSurface` | `src/domain/physics/crashPhysicsSimulator.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `ApplianceTransportOrientation` | `src/domain/physics/crashPhysicsSimulator.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `PayloadStatus` | `src/domain/physics/payloadDMC.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `ClutterLevel` | `src/domain/relocation/volumeEstimator.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `RecommendedFleetType` | `src/domain/relocation/volumeEstimator.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `TransportOrientation` | `src/domain/room-fitting/applianceClearance.ts` | ✅ | tests/matrix-dimensions.test.tsx, src/components/__tests__/applianceClearanceView.test.ts |
| `FurnitureClearanceType` | `src/domain/room-fitting/atticAndErgonomics.ts` | ✅ | src/domain/__tests__/atticAndErgonomics.test.ts |
| `AirlineCode` | `src/domain/standards/aviationSizers.ts` | ✅ | src/domain/__tests__/aviationSizers.test.ts, src/tests/combinatorial/sizerExhaustive.test.ts |
| `LockerNetwork` | `src/domain/standards/multiCheckerMatrix.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `AirlineMatrixCode` | `src/domain/standards/multiCheckerMatrix.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `POPULAR_10_AIRLINES` | `src/domain/standards/multiCheckerMatrix.ts` | ✅ | src/components/__tests__/multiCheckerMatrixView.test.ts, src/domain/__tests__/multiCheckerMatrix.test.ts |
| `LockerSize` | `src/domain/standards/parcelLockers.ts` | ✅ | tests/matrix-dimensions.test.tsx |
| `INPOST_LOCKER_LIMITS` | `src/domain/standards/parcelLockers.ts` | ✅ | src/tests/combinatorial/sizerExhaustive.test.ts, src/tests/contracts/standardsCompliance.test.ts |

