# **Czy się zmieści? (FitCheck) — Wymagania biznesowe (BRD), wersja robocza 0.1, 15.10.2026**

**Status:** wersja robocza do akceptacji właściciela. Sprawy produktowe czekają na Twoje decyzje (sekcja 4, DEC-01…DEC-41). Sprawy merytoryczne (geometria 3D, optymalizacja bin packing, normy ISO/VDA, wytyczne załadunku, prawo przewozowe) rozstrzyga badacz według 5-szczeblowej hierarchii źródeł. Każdą decyzję merytoryczną możesz zawetować. **Autor:** analityk biznesowy studia Apps4Brew. Części A–D napisali analitycy i badacz merytoryczny.

---

## **1. Jak czytać ten dokument**

### **Części dokumentu**

| Plik | Rozdziały | Zawartość |
| :--- | :--- | :--- |
| **00-streszczenie** (ten plik) | — | Streszczenie dla właściciela, warianty pierwszej wersji (DEC-01), jedna lista decyzji (DEC-01…DEC-41), warunki wstępne, spis treści, statystyka objętości |
| **00b-decyzje** | — | Pełna lista 41 decyzji produktowych i technicznych z kontekstem, opcjami, rekomendacjami i kompromisami |
| **00c-sprzecznosci** | — | Zidentyfikowane sprzeczności założeń, errata, nieścisłości norm VDA vs wymiary rzeczywiste |
| **A1** | 1–3 | Tożsamość produktu, wizja i 16 zasad produktu (ZP-01…ZP-16), persony P1–P8, 15 scenariuszy życiowych SYT-01…SYT-15 |
| **A2** | 4–6.1 | Analiza rynku, luka konkurencyjna, model przychodu, cennik PL/EU/US, unit economics |
| **A3a, A3b, A3c** | 6.2–6.5 | Tabela zakresu Z-001…Z-240 z etapami (MVP, 1.1, 1.2, 2.x), nakład pracy agenta, kalendarz, warianty wydań |
| **A4** | 13, 15 | Metryki KPI bez śledzenia użytkownika, strategia marketingowa, ASO w 35 językach |
| **B1–B6** | 7 (Narzędzia) | 215 wymagań funkcjonalnych (BR-POJ, BR-LAD, BR-PAK, BR-MAS, BR-KAT, BR-AR, BR-ZAK, BR-SYS, BR-DOST) |
| **C1–C4** | 7 (Nauka), 8, 8.P | 72 wymagania modułu nauki, Szkoła Pakowania, reguły dziedzinowe RD-01…RD-32 z wektorami testowymi, proces weryfikacji 8.P |
| **D1–D3** | 9–12, 14, 16 | 110 wymagań niefunkcjonalnych (NFR), wytyczne Apple, architektura offline, model SQLite, rejestr 45 ryzyk (RYZ-01…RYZ-45) |

---

### **Oznaczenia identyfikatorów**

> * **BR-[KOD]-nnn**: wymaganie funkcjonalne (np. `BR-PAK-001`). Zawiera: opis, powiązaną personę, mierzalne kryteria akceptacji Gherkin (Given-When-Then), priorytet (**MUST / SHOULD / COULD**) oraz etap wdrożenia (**MVP / 1.1 / 1.2 / 2.x / badanie / nigdy**).
> * **NFR-[KOD]-nnn**: wymaganie niefunkcjonalne. Kody: `OFF` (100% offline), `I18N` (lokalizacja 35 języków), `DOST` (dostępność WCAG/VoiceOver), `WYG` (interfejs/design Apple HIG), `WYD` (wydajność silnika 3D min. 60 FPS), `DANE` (integralność bazy SQLite), `BEZP` (prywatność i ochrona danych), `INT` (spójność interakcji wg katalogu), `ZEG` (kompan Apple Watch), `TEST` (pokrycie testami).
> * **RD-nn**: reguła dziedzinowa (rachunek geometryczny, fizyka ładunku, norma ISO 3832, regulacje drogowe art. 61 PoRD). Każda z wektorami testowymi.
> * **RYZ-nn**: ryzyko z oceną prawdopodobieństwa (1–5), skutku (1–5), wagą i strategią mitygacji.
> * **DEC-nn**: decyzja produktowa lub architektoniczna dla właściciela.
> * **ZP-nn**: nienaruszalna zasada produktu (Zasady Projektowe Apps4Brew).

---

## **2. Streszczenie dla właściciela**

### **Co to jest**
**Czy się zmieści? (FitCheck)** to prywatna, działająca w 100% offline aplikacja na iPhone'a (z asystentem na Apple Watch), która rozwiązuje odwieczny problem kierowców, majsterkowiczów, podróżnych i kupujących meble: **„Czy ten przedmiot zmieści się do mojego bagażnika / paczkomatu / windy / drzwi, a jeśli tak – jak go optymalnie ułożyć?”**.

Aplikacja zastępuje nieprecyzyjne zgadywanie i frustrujące mierzenie „na oko” precyzyjnym silnikiem geometrycznym 3D, uwzględniającym nie tylko suchą objętość w litrach (która w salonach samochodowych jest myląca), lecz **rzeczywisty kształt otworu załadunkowego, zwężenia między nadkolami, skos tylnej szyby, wysokość progu, a także limity ładowności i dopuszczalnej masy całkowitej (DMC)**.

### **Dla kogo (Persony)**
1. **Tomasz (35 l., Głowa rodziny):** Pakuje rodzinę 2+2 na 2-tygodniowe wakacje (4 walizki, wózek dziecięcy, łóżeczko turystyczne, torba plażowa). Musi wiedzieć, czy domknie klapę kombi bez zasłaniania widoku w lusterku i bez przekroczenia DMC.
2. **Kasia (28 l., Kupująca meble w IKEA/Castorama):** Stoi w dziale odbioru towaru przed 3 płaskimi paczkami szafy i zastanawia się, czy wejdą do jej hatchbacka (Toyota Yaris) po złożeniu siedzeń, czy musi zamawiać drogi transport.
3. **Marek (42 l., Kurier / Przedsiębiorca e-commerce):** Nadaje dziesiątki paczek dziennie w Paczkomatach InPost / automatach DPD. Potrzebuje błyskawicznego sprawdzenia, do jakiego gabarytu (A, B, C) kwalifikuje się nietypowy karton po uwzględnieniu 5 mm marginesu na wybrzuszenie taśmy.
4. **Piotr (31 l., Podróżnik low-cost):** Lata liniami Ryanair i Wizz Air tylko z darmowym małym plecakiem. Sprawdza, czy wypchana torba wejdzie do metalowego kosza sizer bez dopłaty 250 zł przy bramce.
5. **Agnieszka (48 l., Przeprowadzka i remont):** Kupuje lodówkę lub narożnik. Musi sprawdzić, czy mebel przejdzie przez wąską klatkę schodową z 1975 r., ościeżnicę drzwi (70 cm) i czy wejdzie do 4-osobowej windy.
6. **Marta (64 l., Działkowiczka):** Wozi kosiarkę i sadzonki; artretyzm rąk, potrzebuje dużych fontów Dynamic Type i prostego interfejsu.
7. **Ewa (39 l., Persona dostępnościowa):** Osoba niewidoma, weryfikująca aplikację przez VoiceOver.

---

### **Czym wygrywa (Przewagi rynkowe poparte faktami)**

1. **Koniec z kłamstwem „litrów w katalogu” (ISO 3832 vs Rzeczywistość):**
   * *Fakt:* Producenci aut podają litraż bagażnika mierzony kostkami $200 \times 100 \times 50\text{ mm}$ (1 litr VDA). Bagażnik 500 l nie zmieści sztywnego pudła o objętości 400 l, jeśli otwór załadunkowy ma $72\text{ cm}$, a pudło $75\text{ cm}$. FitCheck operuje na wektorach geometrycznych i realnych skosach.
2. **100% Offline i Pełna Prywatność („Data Not Collected”):**
   * *Fakt:* Aplikacje konkurencji w App Store (np. AR Measure, CamToPlan, PackPoint) wymagają rejestracji konta, wysyłają skany i wymiary do chmury oraz zawierają trackery reklamowe (Google AdMob, Meta). FitCheck działa w podziemnym parkingu pod marketem, w piwnicy i w lesie bez dostępu do sieci. Dane zostają w SQLite na telefonie.
3. **Kombinatoryczny Silnik Pakowania 3D (Extreme Points + Guillotine):**
   * Zamiast pojedynczego porównania prostopadłościanów, FitCheck rozwiązuje 3D Bin Packing Problem: pokazuje animowaną instrukcję krok-po-kroku, który przedmiot włożyć pierwszy, jak go obrócić i gdzie położyć najcięższe torby.
4. **Baza Gotowych Profili Pojazdów, Mebli i Paczkomatów:**
   * Użytkownik nie musi biegać z miarką wokół auta: wybiera markę, model i rocznik (np. Skoda Octavia IV Combi, VW Golf VII, Dacia Duster) z predefiniowanymi parametrami podłogi, nadkoli i kąta szyby.
5. **Kontrola Masy i Bezpieczeństwa (DMC i Nacisk na Osie):**
   * Żadna aplikacja kalkulatorowa nie ostrzega kierowcy, że 5 walizek i wózek przekraczają dopuszczalną ładowność samochodu osobowego (art. 61 Kodeksu Drogowego). FitCheck sumuje masę i barwi wskaźnik na czerwono.

---

### **Model przychodu i Unit Economics**
* **Model wejścia:** Darmowy rdzeń bez limitu czasowego (1 pojazd, do 3 przedmiotów w załadunku, podstawowe paczkomaty) + 14-dniowy bezpłatny okres próbny pełnej wersji PRO.
* **Ceny PRO:**
  * Subskrypcja: **0,99 € / mies.** (PL: **3,99 zł / mies.**) lub **4,99 € / rok** (PL: **19,99 zł / rok**).
  * Zakup dożywotni (Lifetime In-App Purchase): **14,99 € raz** (PL: **59,99 zł raz**).
  * Family Sharing (Chmura rodzinna) włączone domyślnie dla subskrypcji i zakupu dożywotniego.
* **Koszty stałe i krańcowe:** Koszt krańcowy każdego nowego użytkownika wynosi **0,00 zł** (brak serwera bazodanowego, brak chmurowego API AI). Koszt stały: **99 USD / rok** (konto Apple Developer), który zwraca się już przy 29 subskrypcjach rocznych w Polsce lub 10 zakupach dożywotnich.

---

### **5 najważniejszych ryzyk projektu**
1. **Odrzucenie przez Apple jako „prosty kalkulator wymiarów” (Wytyczna 4.3 App Store Review Guidelines):**
   * *Obrona:* Wersja 1.0 zawiera zaawansowaną wizualizację SceneKit/Metal 3D, silnik Extreme Points BPP, bazę gotowych pojazdów i mebli, moduł edukacyjny „Szkoła Bezpiecznego Ładunku” oraz widżety Smart Stack.
2. **Niedokładność wymiarów bagażników wynikająca z nieregularnych wytłoczeń tapicerki:**
   * *Obrona:* Wprowadzenie w bazie pojęcia „Strefy Bezpiecznej” (bounding box gwarantowany) oraz konfigurowalnego marginesu tolerancji $\epsilon = 20\text{ mm}$ (RD-04).
3. **Odpowiedzialność prawna za uszkodzenie auta lub mandat za przeładowanie:**
   * *Obrona:* Wyraźny disclamer prawny w standardzie Apps4Brew (NFR-BEZP-006): aplikacja jest narzędziem wspomagającym symulację; ostateczna odpowiedzialność spoczywa na kierowcy (art. 61 PoRD).
4. **Wydajność renderowania 3D na starszych urządzeniach (iPhone 11/12):**
   * *Obrona:* Lekki renderer wektorowy oparty na instancjonowanych prostopadłościanach z wyłączonymi kosztownymi cieniami dynamicznymi (NFR-WYD-002), gwarantujący 60 FPS.
5. **Ryzyko prawne znaków towarowych marek samochodów i producentów mebli:**
   * *Obrona:* Zasada czystego kodu: w kodzie i w App Store neutralne deskryptory; brak logotypów marek; nazwy producentów wyłącznie jako dane faktograficzne zgodne z prawem do uczciwego opisu zgodności (fair use).

---

### **Co blokuje wydanie (Kryteria Release Gatekeeper)**
* Jakakolwiek awaria (crash) silnika geometrii lub utrata danych lokalnych SQLite.
* Wykrycie jakiegokolwiek zewnętrznego SDK analitycznego lub reklamowego naruszającego status „Data Not Collected”.
* Brak wsparcia dla VoiceOver lub brak kontrastu WCAG 2.1 AA na ekranach kalkulatora.
* Niezgodność wyliczeń algorytmu 3D z wektorami testowymi RD-01…RD-32 (tolerancja błędu: 0,0%).
* Brak ostrzeżenia o konieczności zachowania widoczności w lusterkach bocznych.

---

## **3. Warianty pierwszej wersji (DEC-01)**

| Cecha / Wariant | (a) Pełne MVP z BRD | (b+) MVP okrojone: MUST + 6 wyjątków (REKOMENDACJA) | (b) MVP okrojone: tylko MUST | (c) (b+) z pełnym skanowaniem LiDAR/AR | (d) Samo narzędzie obliczeniowe |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Liczba BR w 1.0** | **172 BR** (B: 142 + C: 30) | **132 BR** (124 MUST + 8 wyjątków) | **124 BR** (B: 98 + C: 26) | **148 BR** (132 + 16 AR) | **96 BR** (tylko narzędzie, bez nauki) |
| **Co użytkownik dostaje** | Pełny silnik 3D, baza 100 aut, paczkomaty, linie lotnicze, meble, kalkulator DMC, moduł nauki, eksport PDF z planem, widgety, Apple Watch | Silnik 3D, baza 60 top aut, paczkomaty A/B/C, 10 linii lotniczych, meble popularne, kontrola wagi, Szkoła Pakowania, widżet blokady | Rdzeń 3D, manualne wymiary auta, paczkomaty, podstawowe meble, bez widżetów i zegarka | Pełne (b+) oraz skanowanie przestrzeni kamerą ARKit/LiDAR | Czysty kalkulator bez bazy aut i bez modułu nauki |
| **Co przechodzi do 1.1** | — | 40 BR (funkcje SHOULD/COULD, zaawansowany AR) | 48 BR | — | Cała baza aut i moduł edukacyjny |
| **Ryzyko odrzucenia (Apple 4.3)** | Bardzo niskie | **Niskie** (wyróżnik: silnik 3D + fizyka + edukacja) | Średnie | Bardzo niskie | **Wysokie** (odrzucenie jako prosty kalkulator) |
| **Szacowany nakład pracy** | 35–52 dni agenta | **28–42 dni agenta** | 25–38 dni agenta | 45–68 dni agenta | 18–28 dni agenta |
| **Czas kalendarzowy** | 4–6 tygodni | **3–4 tygodnie** | 3–4 tygodnie | 6–8 tygodni | 2–3 tygodnie |

**Rekomendowane 8 wyjątków dodanych do wariantu (b+):**
1. `BR-PAK-015`: Ochrona przed kolizją elementów w rzucie izometrycznym 3D.
2. `BR-MAS-004`: Automatyczne wyliczanie pozostałej ładowności po dodaniu pasażerów.
3. `BR-KAT-008`: Predefiniowane gabaryty Paczkomatów InPost (A, B, C) z uwzględnieniem tolerancji rygla.
4. `BR-KAT-012`: Wymiary bagażu podręcznego Top 5 linii (Ryanair, Wizz Air, LOT, Lufthansa, EasyJet).
5. `BR-ZEG-002`: Podgląd listy spakowanych rzeczy i odhaczanie na Apple Watch („Spakowane do bagażnika”).
6. `BR-SYS-008`: Kontrolka na ekranie blokady iOS 18 (szybkie sprawdzenie wymiaru).
7. `BR-ZAK-003`: 14-dniowy pełny darmowy okres próbny PRO.
8. `BR-ZAK-009`: Obsługa Apple Family Sharing.
