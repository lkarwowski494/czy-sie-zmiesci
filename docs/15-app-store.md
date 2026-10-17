# Metadane App Store i TestFlight — Czy się zmieści? (FitCheck)

Dokument wydawniczy zgodny z wymaganiem `BR-REL-021`.

---

## 1. Karta Produktu w App Store Connect

### Język podstawowy: Polski (`pl-PL`)

- **Nazwa aplikacji:** `Czy się zmieści?`
- **Podtytuł (max 30 znaków):** `Pakowanie bagażnika i paczek` (28 znaków)
- **Kategoria główna:** Narzędzia (*Utilities*)
- **Kategoria poboczna:** Styl życia (*Lifestyle*)
- **Klasyfikacja wiekowa:** 4+ (brak treści dla dorosłych, przemocy, hazardu)
- **Tekst promocyjny (max 170 znaków):**
  `Błyskawicznie sprawdź, czy meble, paczki i zakupy zmieszczą się w bagażniku Twojego auta, paczkomacie lub bagażu podręcznym samolotu. 100% offline i prywatnie.` (157 znaków)
- **Słowa kluczowe (max 100 znaków, po przecinku bez spacji):**
  `bagażnik,paczkomat,inpost,meble,przeprowadzka,wymiary,pomiary,dmc,ładowność,auto,samochód,paka,vda` (96 znaków)
- **Adres URL wsparcia (Support URL):** `https://lkarwowski494.github.io/czy-sie-zmiesci/support.html`
- **Adres URL polityki prywatności (Privacy Policy URL):** `https://lkarwowski494.github.io/czy-sie-zmiesci/privacy.html`
- **Prawa autorskie:** `© 2026 Apps4Brew Studio`

### Język angielski (`en-US`)

- **Name:** `FitCheck - Will It Fit?`
- **Subtitle (max 30 chars):** `Trunk & Parcel Fit Calculator` (29 chars)
- **Promotional text (max 170 chars):**
  `Instantly check if boxes, furniture and luggage fit into your car trunk, parcel lockers, or airline carry-on. 100% offline and private.` (136 chars)
- **Keywords (max 100 chars):**
  `trunk,boot,luggage,parcel,locker,cargo,payload,dimension,moving,packer,measure,car,storage` (90 chars)

---

## 2. Co Testować w TestFlight (Notatki Wersji)

Wklej do pola **„What to Test”** przy publikacji buildu do TestFlight:

```text
Wydanie 1.0 (Build 10+):
- Dodawanie i edycja własnych pojazdów w Garażu (wymiary progów, nadkoli i dachu).
- Weryfikacja jednoczesna gabarytów w 4 sieciach paczkomatów i 10 liniach lotniczych.
- Kontrola masy całkowitej pojazdu i dopuszczalnej ładowności (DMC).
- Kalkulator kubatury przeprowadzkowej i rekomendacja floty transportowej.
- Asystent kalibracji miarki ekranowej z kartą płatniczą i tolerancją błędu.
- Działanie w trybie Offline oraz eksport/import kopii zapasowej JSON.
```

---

## 3. Konfiguracja Sekretów GitHub Actions

W ustawieniach repozytorium GitHub (**Settings → Secrets and variables → Actions**):

| Nazwa Sekretu | Wartość |
|---|---|
| `APPLE_TEAM_ID` | `8NQ9GHY8GF` |
| `ASC_KEY_ID` | Identyfikator klucza API z App Store Connect (np. `2X9R4274HG`) |
| `ASC_ISSUER_ID` | UUID wystawcy z App Store Connect |
| `ASC_KEY_P8_BASE64` | Zawartość pliku `AuthKey_*.p8` zakodowana w Base64 |
