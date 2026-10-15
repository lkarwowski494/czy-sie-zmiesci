# Czy się zmieści? (FitCheck) — Zasady dla Agenta

- **Repozytorium jest PUBLICZNE (ADR-031).** Nigdy nie commituj sekretów (klucze API, tokeny, certyfikaty, .p8/.p12, .env) ani danych osobowych. Przed commitem sprawdź `git diff --cached`. Logi i artefakty CI też są publiczne — nie wypisuj w nich identyfikatorów ani UDID.
- **Narzędzia: 0 zł poza opłatą Apple.** macOS w GitHub Actions jest darmowy tylko dlatego, że repo jest publiczne. Build na telefon i dla testerów: `testflight.yml` (tylko narzędzia Apple).
- **Testy przed kodem (TDD).** Każdy błąd z audytu dostaje test, który go odtwarza (`tests/regress.test.tsx`).
- **Macierz testów:** każdy ekran, element UI, komunikat, funkcja `lib/` i wartość wymiaru ma test; `npm run check:matrix` blokuje braki.
- **Katalog przepływów użytkownika:** każdy realny przepływ ma scenariusz Maestro w `.maestro/` albo wyjątek z powodem w `tests/przeplywy.json`.
- **Definicja ukończenia (DoD):** każda funkcjonalność przy wdrażaniu ma pełen zakres testów automatycznych (logika, ekran, scenariusz, macierz, niezmienniki, dane, języki/wygląd, regresja, E2E Maestro).
- **W trakcie pracy:** `npm run test:fast`. Przed wypchnięciem: pełne `npm run verify` (typecheck, check:i18n, jest, `expo export --platform ios`, verify:native). Nowe teksty w UI przez `t()` i słownik `lib/i18n.en.ts`.
- **Zasada projektowa:** akcje i elementy tego samego typu działają w całej aplikacji tak samo — zamykanie okien: każde okno modalne ma widoczny, spójny przycisk „Anuluj” po lewej w nagłówku. Pilnowane testami-strażnikami.
- **Liczby (progi, limity, czasy) w jednym miejscu;** dokumenty generowane z kodu, nie przepisywane ręcznie.
- **Decyzje produktowe należą do właściciela:** przedstaw co najmniej dwie opcje z kompromisami i rekomendację.
- **Szacowanie czasu:** estymacje zakładają czas pracy agenta (z pracą równoległą). Osobno czas realnego czekania (CI, Apple review). Nakład pracy agenta nie jest argumentem przeciw lepszej opcji.

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
