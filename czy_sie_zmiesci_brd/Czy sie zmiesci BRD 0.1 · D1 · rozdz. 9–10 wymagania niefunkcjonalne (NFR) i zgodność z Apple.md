# **Czy się zmieści? (FitCheck) BRD 0.1 — Część D1**

## **Rozdział 9: Wymagania Niefunkcjonalne (NFR)**

Wymagania niefunkcjonalne stanowią twarde kryteria inżynieryjne weryfikowane automatycznie w pipeline CI/CD przed każdym wdrożeniem.

---

### **9.1. Offline i Samowystarczalność (NFR-OFF)**
* **NFR-OFF-001:** Wszystkie funkcje aplikacji (kalkulator 3D, baza 60 pojazdów, katalog mebli, paczkomaty, Szkoła Pakowania) muszą działać w 100% bez połączenia z Internetem (tryb samolotowy).
* **NFR-OFF-002:** Aplikacja nie może wykonywać żadnych zapytań HTTP/HTTPS w tle w celach innych niż weryfikacja zakupu przez natywne API Apple StoreKit 2.
* **NFR-OFF-003:** Czas startu aplikacji w trybie zimnym (Cold Launch) na urządzeniu referencyjnym (iPhone 11) wynosi poniżej **600 ms**.

---

### **9.2. Lokalizacja i Internacjonalizacja (NFR-I18N)**
* **NFR-I18N-001:** Interfejs użytkownika, komunikaty błędów oraz audiodeskrypcja dostępne są w **35 językach** oficjalnie wspieranych przez App Store.
* **NFR-I18N-002:** Wszystkie teksty ekranowe pobierane są wyłącznie przez funkcję lokalizacyjną `t(key)` ze słowników typowanych TypeScript (`lib/i18n.*.ts`). Skrypt `npm run check:i18n` blokuje commity z brakującymi kluczami tłumaczeń.
* **NFR-I18N-003:** Pełna obsługa jednostek metrycznych ($\text{cm}, \text{m}, \text{kg}, \text{litry}$) oraz imperialnych ($\text{in}, \text{ft}, \text{lb}, \text{cu ft}$). Formatowanie liczb respektuje lokalne ustawienia regionalne (przecinek vs kropka dziesiętna).

---

### **9.3. Dostępność Cyfrowa (NFR-DOST)**
* **NFR-DOST-001:** Zgodność ze standardem **WCAG 2.1 na poziomie AA**. Minimalny współczynnik kontrastu tekstu do tła wynosi $4,5:1$ (dla dużego tekstu $3,0:1$).
* **NFR-DOST-002 (VoiceOver):** Każdy element interaktywny i każda paczka w trójwymiarowym podglądzie posiada semantyczną etykietę `accessibilityLabel`, wskazówkę `accessibilityHint` oraz wartość `accessibilityValue` (np. *„Paczka 1: Szafka, wymiary 80 na 40 na 60 centymetrów, ułożona przy lewej ścianie. Stuknij dwukrotnie, aby edytować”*).
* **NFR-DOST-003 (Dynamic Type):** Interfejs w pełni wspiera systemowe powiększanie czcionek do najwyższych rozmiarów dostępnościowych (Accessibility XXL) bez obcinania tekstu ani nakładania się przycisków.

---

### **9.4. Wydajność i Efektywność Energetyczna (NFR-WYD)**
* **NFR-WYD-001:** Silnik kombinatoryczny Extreme Points wylicza pełne ułożenie dla 20 paczek w czasie poniżej **35 ms** na procesorze Apple A13 Bionic (iPhone 11).
* **NFR-WYD-002:** Scena 3D renderowana za pomocą SceneKit/Metal utrzymuje stabilne **60 klatek na sekundę (60 FPS)** podczas obracania i przybliżania modelu bez zauważalnych zacięć (Zero Frame Drops).
* **NFR-WYD-003:** Maksymalne zużycie pamięci operacyjnej RAM nie może przekraczać **45 MB** podczas aktywnej symulacji 3D.
* **NFR-WYD-004:** Rozmiar pobieranej aplikacji z App Store (ipa download size) nie może przekraczać **25 MB**.

---

### **9.5. Bezpieczeństwo i Prywatność (NFR-BEZP)**
* **NFR-BEZP-001:** Karta prywatności App Store zawiera wyłącznie deklarację: **Data Not Collected**.
* **NFR-BEZP-002:** Aplikacja nie prosi o żadne uprawnienia systemowe poza aparatem fotograficznym (wyłącznie dla opcjonalnego modułu AR/miarki w wersji 1.1) oraz Bluetooth (wyłącznie dla Apple Watch Connectivity).
* **NFR-BEZP-003:** Brak jakichkolwiek zewnętrznych bibliotek śledzących (0 SDK reklamowych, 0 analityki firm trzecich).

---

### **9.6. Integralność Danych (NFR-DANE)**
* **NFR-DANE-001:** Baza danych działa w silniku SQLite z włączonym trybem księgowania **WAL (Write-Ahead Logging)** oraz weryfikacją kluczy obcych (`PRAGMA foreign_keys = ON`).
* **NFR-DANE-002:** Nagłe zamknięcie aplikacji (ubicie procesu przez system w tle lub rozładowanie baterii) w dowolnym momencie nie może doprowadzić do uszkodzenia pliku bazy ani utraty wcześniej zatwierdzonych rekordów.
* **NFR-DANE-003:** Każda zmiana struktury bazy danych odbywa się przez wersjonowane, dwukierunkowe migracje schema (pliki migracji weryfikowane testami w CI).

---

### **9.7. Zegarek Apple Watch (NFR-ZEG)**
* **NFR-ZEG-001:** Kompan na watchOS działa płynnie i niezależnie od stanu telefonu po wcześniejszym przesłaniu aktywnej sesji załadunku.
* **NFR-ZEG-002:** Każde odhaczenie załadowanej paczki generuje haptyczne potwierdzenie typu `.success` (charakterystyczne podwójne stuknięcie na nadgarstku).

---

## **Rozdział 10: Zgodność z Wytycznymi Apple (App Store Review Guidelines)**

| Wytyczna Apple | Zagrożenie | Zastosowana obrona w FitCheck |
| :--- | :--- | :--- |
| **4.3(a) & 4.3(b) Spam / Simple Utility** | Odrzucenie jako prosty kalkulator prostopadłościanów | Implementacja zaawansowanego silnika SceneKit 3D, bazy 60 aut, paczkomatów, modułu kontroli DMC, asystenta na Apple Watch oraz Szkoły Bezpiecznego Ładunku. |
| **2.1 App Completeness** | Błędy i crashe w nieprzetestowanych scenariuszach | Pokrycie testami automatycznymi $\ge 90\%$, testy E2E Maestro na symulatorze iOS, testy regresyjne. |
| **3.1.2 Subscriptions** | Niejasne warunki okresu próbnego | Pełna przejrzystość na ekranie zakupu: informacja o cenie po 14 dniach, brak automatycznego zaznaczania najdroższej opcji, natywny widok StoreKit 2. |
| **5.1.1 Privacy Collection** | Niezgodność z deklaracją App Privacy | Test automatyczny skanujący zlinkowane biblioteki pod kątem obecności zabronionych symboli IDFA, AdSupport, Firebase. |
| **5.2.1 Intellectual Property** | Zastrzeżone logotypy marek samochodowych | W aplikacji nie stosuje się zastrzeżonych znaków graficznych marek aut ani mebli. Nazwy modeli użyte są wyłącznie tekstowo w celach faktograficznych. |
