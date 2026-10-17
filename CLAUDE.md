# CLAUDE.md — Wytyczne Inżynieryjne dla Czy się zmieści? (FitCheck)

## 📌 Kontrakt Obowiązkowy
Przed uznaniem jakiegokolwiek zadania lub wydania za ukończone, **musisz wczytać i spełnić wszystkie kryteria z [docs/20-definicja-ukonczenia.md](file:///c:/Users/lukas/Documents/antigravity/joyful-oppenheimer/docs/20-definicja-ukonczenia.md)**.
Nigdy nie deklaruj ukończenia zadania bez uruchomienia i przejścia polecenia `npm run verify` na zielono.

---

## 🚀 Główne Polecenia Projektu

```bash
# Główna bramka weryfikacyjna (wszystkie testy i audyty)
npm run verify

# Uruchomienie pełnego zestawu testów
npm test

# Skaner macierzy testów AST (wymagane 100% pokrycia)
node scripts/test-matrix.mjs --check

# Weryfikacja kompletności i higieny i18n
npm run check:i18n

# Weryfikacja licencji zależności produkcyjnych
npm run check:licenses

# Weryfikacja niezmienników projektu iOS
npm run verify:native

# Weryfikacja wyroczni domenowych Pythona
node scripts/check-corpus.mjs
```

---

## 🛡️ Twarde Niezmienniki Architektoniczne

1. **100% Offline-First:**
   - Zakaz używania `fetch`, `axios`, telemetrii (Firebase, Sentry, Amplitude, AdMob).
   - Wszystkie obliczenia i bazy danych działają wyłącznie lokalnie.

2. **Czystość Konsoli i Testów:**
   - 0 ostrzeżeń `act()` w testach.
   - 0 nieprzechwyconych wywołań `console.error` i `console.warn` (`jest.setup.after-env.js`).

3. **Strażnicy Interakcji S1–S16:**
   - Zakaz podwójnego tapnięcia (`S1`).
   - Potwierdzenia przy destrukcyjnych akcjach i porzucaniu formularzy (`S2`, `S3`, `lib/confirm.ts`).
   - Jawny krzyżyk `×` zamknięcia każdego modalu (`S4`).
   - Zakaz generycznych przycisków „Tak” / „Nie” (`S5`).
   - Obsługa `keyboardShouldPersistTaps="handled"` we wszystkich `ScrollView` (`S6`).
   - Komponent `NumInput` dla liczb z przecinkiem i kropką (`S15`).

4. **Trwałość i Bezpieczeństwo Danych:**
   - Dwie niezależne pule po 10 kopii zapasowych (`fitcheck-` vs `fitcheck-przed-importem-` / `-czyszczeniem-`).
   - Envelope `state_corrupt_*` z zachowaniem surowego stanu w `recovery`.
   - Ochrona przed dryfem zaokrągleń `wInKeep` (`RD-ENG-01`).

5. **Dostępność i Skrajne Ekrany:**
   - Minimalne pole dotyku $\ge 44 \times 44\text{ pt}$.
   - Kontrast WCAG AA $\ge 4.5:1$ (mały tekst) i $\ge 3:1$ (duży tekst).
   - Obsługa skalowania Apple Dynamic Type `AX5` i ekranu `320 pt`.
