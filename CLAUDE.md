# Czy się zmieści? (FitCheck) — Zasady dla Agenta

## 🌐 Zasady Uniwersalne (każdy czat, każda dziedzina)

1. **Decyzje należą do mnie:** przy każdej zmianie, naprawie lub wyborze co najmniej dwie realne opcje z kompromisem i rekomendacją. Jeśli naprawdę jest tylko jedna — powiedz wprost dlaczego.
2. **Dowód zamiast deklaracji:** „zrobione” = wynik testu, pomiar, zrzut albo przeczytane źródło z miejscem. Przy wątpliwości uruchom/sprawdź na żywo.
3. **Nie zgaduj:** liczby i twierdzenia bez potwierdzenia oznacz jako otwarte pytanie. Raporty innych modeli i streszczenia wyszukiwarki to opinia — kluczowe tezy sprawdź u źródła. Rachunek z moich danych to nie twierdzenie merytoryczne.
4. **Przed podaniem faktu o moim projekcie (ceny, limity, decyzje):** sprawdź zapis decyzji, nie pamięć (`DECISIONS.md`).
5. **Oceń realność problemu przed naprawą:** (realny / brzegowy / teoretyczny); utrata danych, prywatność i bezpieczeństwo — zawsze.
6. **Decyzje zapisuj od razu z datą:** dokument roboczy krótki (stan bieżący w `DECISIONS.md`), historia w archiwum.
7. **Wyjątki od zasad dozwolone, ale nazwane i zapisane:** ryzykowną część zastąp tańszą kontrolą, nie żadną.
8. **Ograniczenia środowiska i polityki usług sprawdź na starcie projektu.**
9. **Szacuj czas pracy jako czas agenta:** osobno: na co się czeka i co wymaga mojego czasu.
10. **Na starcie projektu:** przeczytaj „Biblioteka zasad i ról” na moim Dysku, zaproponuj pasujące moduły i role (odkrycie ról). Gdy trzeci raz powtarza się podobne zlecenie lub błąd — zaproponuj nową rolę/zasadę do biblioteki. Jeśli czat nie ma dostępu do Dysku — poproś mnie o wklejenie modułu.

---

## 🛠️ Reguły Specyficzne dla Projektu (FitCheck)

- **Repozytorium jest PUBLICZNE (ADR-031).** Nigdy nie commituj sekretów (klucze API, tokeny, certyfikaty, .p8/.p12, .env) ani danych osobowych. Przed commitem sprawdź `git diff --cached`. Logi i artefakty CI też są publiczne — nie wypisuj w nich identyfikatorów ani UDID.
- **Narzędzia: 0 zł poza opłatą Apple.** macOS w GitHub Actions jest darmowy tylko dlatego, że repo jest publiczne. Build na telefon i dla testerów: `testflight.yml` (tylko narzędzia Apple).
- **Testy przed kodem (TDD).** Każdy błąd z audytu dostaje test, który go odtwarza (`tests/regress.test.tsx`).
- **Macierz testów:** każdy ekran, element UI, komunikat, funkcja `lib/` i wartość wymiaru ma test; `npm run check:matrix` blokuje braki.
- **Katalog przepływów użytkownika:** każdy realny przepływ ma scenariusz Maestro w `.maestro/` albo wyjątek z powodem w `tests/przeplywy.json`.
- **Definicja ukończenia (DoD):** każda funkcjonalność przy wdrażaniu ma pełen zakres testów automatycznych — w standardzie 9 warstw jakości z projektu Organizer (`docs/brd/D4` i `docs/20-definicja-ukonczenia.md`).
- **W trakcie pracy:** `npm run test:fast`. Przed wypchnięciem: pełne `npm run verify` / `npm run check` (typecheck, check:i18n, jest, mutation, expo export, verify:native). Nowe teksty w UI przez `t()` i słownik `lib/i18n.en.ts`.
- **Zasada projektowa:** akcje i elementy tego samego typu działają w całej aplikacji tak samo — zamykanie okien: każde okno modalne ma widoczny, spójny przycisk „Anuluj” po lewej w nagłówku (`headerLeft`). Pilnowane testami-strażnikami (`close-button-guard.test.tsx`).
- **Liczby (progi, limity, czasy) w jednym miejscu;** dokumenty generowane z kodu, nie przepisywane ręcznie.
- **Decyzje produktowe należą do właściciela:** przedstaw co najmniej dwie opcje z kompromisami i rekomendację.
- **Szacowanie czasu:** estymacje zakładają czas pracy agenta (z pracą równoległą). Osobno czas realnego czekania (CI, Apple review). Nakład pracy agenta nie jest argumentem przeciw lepszej opcji.

---

## 🧪 9 Warstw Weryfikacji Jakości (Standard z projektu Organizer)

Zgodnie z procedurami z projektu `lkarwowski494/organizer`, w projekcie **Czy się zmieści? (FitCheck)** obowiązuje bezwzględny reżim testowy z 9 perspektyw:

1. **Czysta logika domenowa (100% Line & Branch Coverage):**
   * Moduły `src/domain/` (algorytmy 3D Extreme Points, Guillotine, CoG, aperture check, przelicznik VDA) podlegają wymogowi 100% pokrycia linii i gałęzi.
2. **Testy mutacyjne (Stryker Mutation Testing $\ge 90\%$):**
   * Weryfikacja jakości testów za pomocą mutacji kodu (`stryker.config.json`). Żaden mutant w stereometrii, tolerancjach czy limitach DMC nie może przetrwać.
3. **Testy własnościowe (Property-Based z `fast-check`):**
   * Generowanie losowych zestawów paczek i weryfikacja niezmienników matematycznych: brak kolizji $V_i \cap V_j = \emptyset$, $\sum V_i \le V_{\text{usable}}$, stabilność CoG.
4. **Niezależne korpusy referencyjne (Ground-Truth Corpora):**
   * Porównanie wyliczeń z niezależnym solverem referencyjnym (Python 3D-BPP), danymi pomiarowymi ADAC dla 60 aut oraz oficjalnymi macierzami sizerów (InPost, Ryanair, Wizz Air).
5. **Testy bazy danych i SQLite WAL:**
   * Atomowość transakcji załadunku, odporność na nagłe ubicie procesu, migracje schematu up/down, roundtrip eksportu i importu kopii zapasowej JSON.
6. **Macierz komponentów i scenariusze UI (RNTL):**
   * Każdy ekran, modal, suwak i jednostka (cm $\leftrightarrow$ in, kg $\leftrightarrow$ lb) przetestowane w stanach: pusty, wprowadzanie, sukces, kolizja, przeładowanie.
7. **E2E i regresja wizualna (Maestro na symulatorze iOS):**
   * Scenariusze w `.maestro/` symulujące realne ścieżki użytkownika (pakowanie auta, dobór paczkomatu, alarm DMC, przywrócenie kopii) z weryfikacją `pixelmatch`.
8. **Dostępność i kontrakty Apple HIG (WCAG AAA & VoiceOver):**
   * Minimalne pole dotyku $44 \times 44\,\text{pt}$, pełna audiodeskrypcja sceny 3D dla VoiceOver, Dynamic Type do rozmiarów XXL.
9. **Strażnicy architektury i wzorców interakcji:**
   * Zautomatyzowane testy statyczne: `close-button-guard.test.tsx` (przycisk Anuluj w nagłówku), `brands-contract-guard.test.ts` (zakaz znaków towarowych marek w kodzie i UI), `safety-disclaimer-guard.test.ts` (ostrzeżenia prawne).

---

## Audyty i wydania

1. **Próg wydania:** wydanie blokują tylko znaleziska KRYTYCZNE i WYSOKIE: utrata lub zepsucie danych (także migracja, import, kopia), awaria albo funkcja nie do użycia, błędne liczby lub twierdzenia merytoryczne, prywatność/bezpieczeństwo/sekrety/prawa autorskie, bariera dostępności, ryzyko odrzucenia przez Apple. ŚREDNIE i NISKIE → backlog.
2. **Jeden audyt na wydanie, bez pętli:** naprawy znalezisk sprawdza test odtwarzający + verify + E2E.
3. **Zamrożenie zakresu:** od startu audytu do wydania żadnych nowych funkcji.
4. **Ocena realności znaleziska:** realny → naprawa wg progu; brzegowy → naprawa jeśli tania lub dotyczy danych; teoretyczny → notatka.

---

## Merytoryczne podstawy (Hierarchia 5 Szczebli)

Wszystko, czego aplikacja uczy albo co twierdzi (wymiary, algorytmy, kąty, masy, dopuszczalność załadunku), musi mieć merytoryczne podstawy.

1. **Rachunek matematyczny i stereometria:** czyste wzory, algorytmy Extreme Points 3D, sprawdzone niezależnie wektorami testowymi.
2. **Normy techniczne i przepisy prawa:** ISO 3832:2002 (VDA), DIN 70020, PN-EN 12195-1, Prawo o Ruchu Drogowym (art. 61), regulacje IATA i operatorów paczkowych.
3. **Publikacje naukowe i recenzowane podręczniki:** inżynieria transportu, algorytmy kombinatoryczne 3D-BPP (Crainic, Martello, Vigo).
4. **Dokumentacja fabryczna:** oficjalne instrukcje producentów pojazdów i mebli, świadectwa homologacji.
5. **Praktyka i doświadczenie kierowców:** wyłącznie jako wskazówka, zawsze wyraźnie oznaczona.

Właściciel nie rozstrzyga kwestii merytorycznych: rozstrzyga je ta hierarchia. Właściciel decyduje o sprawach produktowych i biznesowych.
Treści cudze i znaki towarowe: w kodzie i opisach neutralne oznaczenia faktograficzne; brak zastrzeżonych logotypów graficznych.
