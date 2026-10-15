# **Czy się zmieści? (FitCheck) BRD 0.1 — 00b Jedna lista decyzji**

## **4. Jedna lista decyzji dla właściciela (DEC-01…DEC-41)**

**Zasada:** Blok I rozstrzyga architekturę i zakres przed startem prac programistycznych. Blok II określa kluczowe zasady produktu w pierwszych 2 tygodniach. Blok III ustala warunki wydania w App Store. Blok IV dotyczy rozwoju w wersjach 1.1+.  
Decyzje oznaczone symbolem ⚙ to decyzje techniczno-produktowe z jednoznaczną rekomendacją analityka.

---

### **Blok I — Przed startem budowy (Tydzień 0)**

#### **DEC-01 Jaki zakres ma pierwsza wersja (MVP)?**
* **Kontekst:** Pełne spektrum wymagań (172 BR) to 35–52 dni pracy agenta. Część funkcji to zaawansowana optymalizacja wielowymiarowa lub rozbudowane animacje AR.
* **Opcje:**
  * *(a) Pełne MVP (172 BR)* — 4–6 tyg. kalendarza.
  * *(b+) MVP okrojone: 124 MUST + 8 tanich wyjątków (132 BR)* — 3–4 tyg. (Rekomendacja).
  * *(b) Tylko MUST (124 BR)* — 3–4 tyg., ale bez widżetów i wsparcia dla Family Sharing.
  * *(c) Wariant z zaawansowanym skanerem AR/LiDAR w 1.0 (148 BR)* — 6–8 tyg., wysokie ryzyko opóźnienia przez kalibrację kamery.
  * *(d) Czysty kalkulator geometryczny (96 BR)* — wysokie ryzyko odrzucenia przez Apple (wytyczna 4.3).
* **Rekomendacja:** **Opcja (b+)**.
* **Uzasadnienie:** Daje pełną odporność na zarzut prostego kalkulatora (wytyczna 4.3), kompletny silnik 3D z bazą 60 aut, paczkomatami i meblami oraz pełne wsparcie dla wytycznych App Store w 3–4 tygodnie.

---

#### **DEC-02 Skanowanie kamerą ARKit / LiDAR w MVP czy w wersji 1.1?**
* **Kontekst:** Pomiary kamerą budzą zachwyt na filmach promocyjnych, ale w praktyce w słabo oświetlonym bagażniku lub na czarnym dywaniku ARKit ma błąd pomiaru rzędu 5–12%, a LiDAR jest dostępny wyłącznie w modelach Pro/Pro Max (ok. 22% użytkowników iPhone'a).
* **Opcje:**
  * *A) AR/LiDAR w wersji 1.1, a w MVP intuicyjny kreator manualny z suwakami i predefiniowaną bazą* (Rekomendacja).
  * *B) AR/LiDAR od wersji 1.0 w pełnym zakresie:* przesuwa wydanie o min. 3 tygodnie.
  * *C) Zewnętrzne biblioteki AR:* ryzyko bloatware i zależności firm trzecich.
* **Rekomendacja:** **Opcja A**. W MVP użytkownicy dostają natychmiastowy wynik z bazy modeli i suwaków bez walki z kalibracją kamery w ciemnym garażu.

---

#### **DEC-03 Aplikacja towarzysząca na Apple Watch w MVP?**
* **Kontekst:** Gdy użytkownik pakuje kartony do bagażnika pod sklepem lub nosi walizki, ma zajęte ręce. Wyjmowanie telefonu z kieszeni przy każdej paczce jest niewygodne.
* **Opcje:**
  * *A) Pełna aplikacja towarzysząca na watchOS:* lista paczek do załadunku z kolejnością pakowania i haptycznym odhaczaniem („Zapakowane”, koronka Digital Crown) (Rekomendacja).
  * *B) Brak zegarka w MVP:* oszczędność 3 dni, ale utrata unikalnego wyróżnika w marketingu Apple.
* **Rekomendacja:** **Opcja A**. Identycznie jak w Oczko i Napar, watchOS podnosi prestiż aplikacji i chroni przed odrzuceniem w App Store.

---

#### **DEC-04 ⚙ Bundle ID aplikacji**
* **Kontekst:** Identyfikator pakietu w ekosystemie Apple jest niezmienny po pierwszym wdrożeniu do App Store Connect.
* **Opcje:**
  * *A) `com.apps4brew.fitcheck`* — neutralny, międzynarodowy, odporny na lokalne zmiany nazwy handlowej (Rekomendacja).
  * *B) `com.apps4brew.czysiezmiesci`* — specyficzny dla rynku polskiego, utrudnia ekspansję globalną.
* **Rekomendacja:** **Opcja A (`com.apps4brew.fitcheck`)**.

---

#### **DEC-05 ⚙ Repozytorium kodu i organizacja GitHub**
* **Kontekst:** Repozytorium zostało założone jako `lkarwowski494/czy-sie-zmiesci`.
* **Rozstrzygnięcie:** Praca prowadzona w publicznym repozytorium `lkarwowski494/czy-sie-zmiesci` zgodnie z zasadami zerowych kosztów CI w GitHub Actions (inwariant Treningu).

---

#### **DEC-06 ⚙ Hierarchia źródeł wiedzy dla przestrzeni ładunkowej i fizyki transportu**
* **Kontekst:** Aplikacja wylicza parametry ładowności, naciski osi i zgodność z normami bagażowymi.
* **Opcje:**
  * *A) 5 szczebli autorytatywnych:*
    1. Rachunek matematyczny, stereometria 3D, algorytmy kombinatoryczne (Extreme Points, Guillotine 3D).
    2. Międzynarodowe normy techniczne (ISO 3832:2002, DIN 70020, PN-EN 12195-1 dot. mocowania ładunków, regulacje IATA, regulaminy operatorów pocztowych).
    3. Publikacje recenzowane i podręczniki inżynierii transportu (Martello & Vigo, Crainic, Zasady Bezpiecznego Załadunku ITD).
    4. Dokumentacje fabryczne producentów pojazdów i mebli (manuale techniczne, homologacje homologacyjne mas i nacisków osi, katalogi wymiarowe IKEA).
    5. Doświadczenia praktyków i kierowców (triki załadunkowe — zawsze wyraźnie oznaczone jako heurystyka).
* **Rekomendacja:** **Opcja A**.

---

#### **DEC-07 ⚙ Minimalna wersja iOS / watchOS**
* **Opcje:**
  * *A) iOS 17 / watchOS 10* — większa baza starych urządzeń, brak nowoczesnych kontrolek ekranu blokady.
  * *B) iOS 18 / watchOS 11* — wsparcie dla Interactive Controls na ekranie blokady, Smart Stack Interactive Widgets, najnowsze API SwiftData/SceneKit (Rekomendacja).
* **Rekomendacja:** **Opcja B**. Zapewnia najdłuższy cykl życia produktu i idealne dopasowanie do standardów Apple w 2026 r.

---

#### **DEC-08 ⚙ Wybór technologii renderowania 3D**
* **Opcje:**
  * *A) Lekki, natywny renderer SceneKit / Metal zoptymalizowany pod prymitywy prostopadłościenne:* zero zależności zewnętrznych, zużycie pamięci RAM < 45 MB, 60 FPS na każdym iPhone (Rekomendacja).
  * *B) WebView + Three.js:* łatwe w prototypowaniu, ale wysoki narzut na baterię, wolny start i ryzyko odrzucenia za brak natywnego wyglądu.
* **Rekomendacja:** **Opcja A**.

---

#### **DEC-09 ⚙ Architektura trwałości danych i kopia zapasowa**
* **Opcje:**
  * *A) SQLite (WAL mode) + eksport/import pełnego stanu do czystego pliku JSON:* 100% offline, brak konieczności konfiguracji serwera, użytkownik sam kontroluje swoje dane (Rekomendacja).
  * *B) CloudKit / Firebase:* wymaga logowania, generuje koszty i łamie zasadę „Data Not Collected”.
* **Rekomendacja:** **Opcja A**.

---

### **Blok II — Kluczowe zasady produktu (Tydzień 1–2)**

#### **DEC-10 Model wejścia i polityka darmowego rdzenia**
* **Rozstrzygnięcie:**
  * W wersji bezpłatnej (Free Core) użytkownik otrzymuje:
    - Zapisanie 1 własnego pojazdu / przestrzeni domowej.
    - Testowanie do 3 przedmiotów w jednym załadunku.
    - Pełny katalog Paczkomatów (InPost, Orlen, DPD) i 5 linii lotniczych.
    - Podstawowy podgląd 3D.
  * Wersja PRO (odblokowywana subskrypcją 3,99 zł/mies. / 19,99 zł/rok lub zakupem jednorazowym 59,99 zł):
    - Nielimitowana liczba aut i przestrzeni (garaż, schowek dachowy, przyczepa, pokój, winda).
    - Zaawansowany algorytm upakowania nielimitowanej liczby paczek (3D Bin Packing).
    - Baza ponad 100 gotowych modeli aut oraz mebli.
    - Kalkulator DMC i nacisków osi.
    - Asystent na Apple Watch i eksport planu załadunku do PDF/PNG.

#### **DEC-11 Cennik i waluty**
* **Rozstrzygnięcie:**
  * Tier 1 (PL): 3,99 zł/mies., 19,99 zł/rok, 59,99 zł zakup dożywotni.
  * Tier 1 (EU): 0,99 € / mies., 4,99 € / rok, 14,99 € lifetime.
  * Tier 1 (US): 0,99 $ / mies., 4,99 $ / rok, 14,99 $ lifetime.
  * Brak jakichkolwiek mikrotransakcji typu „odblokuj ten samochód za 1 $”. Pełna przejrzystość.

#### **DEC-12 Sposób modelowania nieregularnego bagażnika (Model „Trapezoid-Arch”)**
* **Kontekst:** Żaden bagażnik nie jest idealnym sześcianem. Występują nadkola, skośna tylna kanapa i pochylona klapa bagażnika.
* **Opcje:**
  * *A) 7-parametrowy model geometryczny (Box + Skosy + Nadkola):*
    1. $L_{\text{floor}}$ (długość podłogi).
    2. $L_{\text{roof}}$ (długość na wysokości dachu / półki).
    3. $W_{\text{min}}$ (szerokość minimalna między nadkolami).
    4. $W_{\text{max}}$ (szerokość maksymalna za nadkolami).
    5. $H_{\text{roof}}$ (wysokość do dachu).
    6. $H_{\text{shelf}}$ (wysokość do rolety).
    7. $W_{\text{aperture}}, H_{\text{aperture}}$ (wymiary światła otworu klapy).
  * *B) Uproszczony prostopadłościan o objętości VDA:* drastycznie przekłamuje rzeczywistość (nie wejdzie to, co program pokaże jako „mieszczące się”).
* **Rekomendacja:** **Opcja A**. 7 parametrów precyzyjnie odwzorowuje 98% europejskich aut osobowych.

#### **DEC-13 Ochrona przed uszkodzeniem i orientacja paczek („GÓRA / DÓŁ”)**
* **Rozstrzygnięcie:** Każdy przedmiot w katalogu i dodawany ręcznie posiada flagę orientacji:
  * `allow_rotation_xyz` (pełna dowolność – np. miękka torba podróżna).
  * `allow_rotation_z_only` (wolno obracać tylko w poziomie, góra musi pozostać górą – np. pralka, lodówka, telewizor, donice).
  * `fragile` (zakaz kładzenia ciężkich przedmiotów na wierzchu – współczynnik nacisku $P_{\text{max}} = 0$).

#### **DEC-14 Ostrzeganie o DMC i prawie drogowym**
* **Rozstrzygnięcie:** Aplikacja automatycznie przelicza masę dodanych przedmiotów. Jeśli suma mas przekracza deklarowaną ładowność pojazdu lub powoduje przekroczenie DMC, na ekranie pojawia się wyraźny alert w kolorze bursztynowym/czerwonym z odwołaniem do art. 61 ust. 1 i 2 Prawa o Ruchu Drogowym.

---

### **Blok III — Przed publikacją w App Store**

* **DEC-15 Nazwa aplikacji w sklepach:**
  * Polska: **Czy się zmieści? — kalkulator bagażnika i paczek 3D**
  * Międzynarodowa: **FitCheck: 3D Cargo & Trunk Pack Assistant**
* **DEC-16 Brak znaków towarowych w kodzie i opisach:**
  * W opisach i kodzie stosujemy neutralne oznaczenia modeli (np. „popularny czeski liftback segmentu C”, a w bazie danych neutralne, faktograficzne dane wymiarowe bez użycia zastrzeżonych logotypów graficznych).
* **DEC-17 Weryfikacja deklaracji prywatności Apple Privacy Manifest:**
  * Deklaracja: **„Data Not Collected”**. 0 identyfikatorów, 0 ciasteczek, 0 śledzenia.

---

### **Blok IV — Wersje 1.1 i 2.x**

* **DEC-18 (1.1):** Integracja z Apple ARKit dla urządzeń z LiDAR do automatycznego zdejmowania 7 parametrów bagażnika.
* **DEC-19 (1.1):** Rozszerzenie bazy pojazdów do 250 modeli (w tym auta dostawcze, busy, skrzynie pick-up).
* **DEC-20 (1.2):** Dedykowany tryb planowania przeprowadzek (podział na pokoje i kolejne kursy samochodu).
* **DEC-21 (2.0):** Lokalna wymiana planu załadunku między telefonami przez AirDrop / MultipeerConnectivity (0 serwerów chmurowych).
