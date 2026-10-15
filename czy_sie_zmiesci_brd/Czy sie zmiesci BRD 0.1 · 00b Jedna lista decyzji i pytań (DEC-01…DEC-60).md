# **Czy się zmieści? (FitCheck) BRD 0.1 — 00b Jedna lista decyzji (DEC-01…DEC-60)**

## **4. Jedna lista decyzji dla właściciela (DEC-01…DEC-60)**

**Zasada:** Blok I rozstrzyga architekturę i zakres przed startem prac programistycznych. Blok II określa kluczowe zasady produktu w pierwszych 2 tygodniach. Blok III ustala warunki wydania w App Store. Blok IV dotyczy rozwoju w wersjach 1.1+. Blok V dotyczy modułów przeprowadzek, lokalu, wnęk, garaży i sprzętu specjalistycznego (DEC-42…DEC-60).  
Decyzje oznaczone symbolem ⚙ to decyzje techniczno-produktowe z jednoznaczną rekomendacją analityka.

---

### **Blok I — Przed startem budowy (Tydzień 0)**

#### **DEC-01 Jaki zakres ma pierwsza wersja (MVP)?**
* **Kontekst:** Pełne spektrum wymagań (172 BR) to 35–52 dni pracy agenta.
* **Opcje:**
  * *(a) Pełne MVP (172 BR)* — 4–6 tyg. kalendarza.
  * *(b+) MVP okrojone: 124 MUST + 8 tanich wyjątków (132 BR)* — 3–4 tyg. (Rekomendacja).
  * *(b) Tylko MUST (124 BR)* — 3–4 tyg., ale bez widżetów i wsparcia dla Family Sharing.
  * *(c) Wariant z zaawansowanym skanerem AR/LiDAR w 1.0 (148 BR)* — 6–8 tyg.
  * *(d) Czysty kalkulator geometryczny (96 BR)* — wysokie ryzyko odrzucenia przez Apple (wytyczna 4.3).
* **Rekomendacja:** **Opcja (b+)**.
* **Uzasadnienie:** Daje pełną odporność na zarzut prostego kalkulatora (wytyczna 4.3), kompletny silnik 3D z bazą aut, paczkomatami, meblami, wnękami i przeprowadzkami oraz pełne wsparcie dla wytycznych App Store w 3–4 tygodnie.

---

#### **DEC-02 Skanowanie kamerą ARKit / LiDAR w MVP czy w wersji 1.1?**
* **Kontekst:** Pomiary kamerą budzą zachwyt na filmach promocyjnych, ale w praktyce w słabo oświetlonym bagażniku lub na czarnym dywaniku ARKit ma błąd pomiaru rzędu 5–12%, a LiDAR jest dostępny wyłącznie w modelach Pro/Pro Max (ok. 22% użytkowników iPhone'a).
* **Rekomendacja:** **Opcja A (AR/LiDAR w 1.1, manualny suwak i baza w MVP)**.

---

#### **DEC-03 Aplikacja towarzysząca na Apple Watch w MVP?**
* **Kontekst:** Gdy użytkownik pakuje kartony do bagażnika pod sklepem lub nosi meble, ma zajęte ręce.
* **Rekomendacja:** **Opcja A (Pełna aplikacja towarzysząca na watchOS w MVP)** z kolejnością wkładania, haptyką i obsługą Cyfrowej Koronki.

---

#### **DEC-04 ⚙ Bundle ID aplikacji**
* **Rekomendacja:** `com.apps4brew.fitcheck`.

---

#### **DEC-05 ⚙ Repozytorium kodu i organizacja GitHub**
* **Rozstrzygnięcie:** Praca prowadzona w publicznym repozytorium `lkarwowski494/czy-sie-zmiesci` zgodnie z zasadami zerowych kosztów CI w GitHub Actions (inwariant Treningu).

---

#### **DEC-06 ⚙ Hierarchia źródeł wiedzy dla przestrzeni ładunkowej i fizyki transportu**
* **Rozstrzygnięcie:** 5 szczebli autorytatywnych (Stereometria 3D $\rightarrow$ Normy ISO/DIN/PN-EN $\rightarrow$ Publikacje recenzowane i ITD $\rightarrow$ Dokumentacje techniczne $\rightarrow$ Doświadczenia praktyków).

---

#### **DEC-07 ⚙ Minimalna wersja iOS / watchOS**
* **Rekomendacja:** **iOS 18 / watchOS 11**.

---

#### **DEC-08 ⚙ Wybór technologii renderowania 3D**
* **Rekomendacja:** **Lekki natywny renderer SceneKit / Metal** zoptymalizowany pod prymitywy prostopadłościenne (RAM < 45 MB, 60 FPS).

---

#### **DEC-09 ⚙ Architektura trwałości danych i kopia zapasowa**
* **Rekomendacja:** **SQLite (WAL mode) + eksport/import JSON za 0 zł**.

---

### **Blok II — Kluczowe zasady produktu (Tydzień 1–2)**

#### **DEC-10 Model wejścia i polityka darmowego rdzenia**
* **Rozstrzygnięcie:** Free Core (1 auto/przestrzeń, do 3 przedmiotów, Paczkomaty, sizer lotniczy) + PRO (nielimitowane auta, meble, moduł przeprowadzek, wnęki, Apple Watch, zaawansowany solver).

#### **DEC-11 Cennik i waluty**
* **Rozstrzygnięcie:** 3,99 zł/mies., 19,99 zł/rok, 59,99 zł lifetime (PL); 0,99 € / 4,99 € / 14,99 € (EU/US). Family Sharing aktywny.

#### **DEC-12 Sposób modelowania nieregularnego bagażnika (Model „Trapezoid-Arch”)**
* **Rozstrzygnięcie:** 7-parametrowy model geometryczny ($L_{\text{floor}}, L_{\text{roof}}, W_{\text{min}}, W_{\text{max}}, H_{\text{roof}}, H_{\text{shelf}}, \text{aperture}$).

#### **DEC-13 Ochrona przed uszkodzeniem i orientacja paczek („GÓRA / DÓŁ”)**
* **Rozstrzygnięcie:** Flagi `allow_rotation_xyz`, `allow_rotation_z_only` (AGD/RTV) oraz `fragile`.

#### **DEC-14 Ostrzeganie o DMC i prawie drogowym**
* **Rozstrzygnięcie:** Automatyczny bilans masy z odwołaniem do art. 61 ust. 1 i 2 Prawa o Ruchu Drogowym.

---

### **Blok III — Przed publikacją w App Store**

* **DEC-15 Nazwa aplikacji w sklepach:**
  * Polska: **Czy się zmieści? — kalkulator bagażnika i paczek 3D**
  * Międzynarodowa: **FitCheck: 3D Cargo & Trunk Pack Assistant**
* **DEC-16 Brak znaków towarowych w kodzie i opisach:** Faktograficzne dane bez logotypów.
* **DEC-17 Weryfikacja deklaracji prywatności Apple Privacy Manifest:** **„Data Not Collected”**.

---

### **Blok IV — Wersje 1.1 i 2.x**

* **DEC-18 (1.1):** Integracja z Apple ARKit dla urządzeń z LiDAR.
* **DEC-19 (1.1):** Rozszerzenie bazy pojazdów do 350 modeli.
* **DEC-20 (1.2):** Zaawansowany planer tras przeprowadzkowych z uwzględnieniem natężenia ruchu.
* **DEC-21 (2.0):** Lokalna wymiana planu załadunku przez AirDrop / MultipeerConnectivity.

---

### **Blok V — Przeprowadzki, Wymiarowanie Lokalu, Garaże i Sprzęt Specjalistyczny (DEC-42…DEC-60)**

#### **DEC-42 ⚙ Algorytm analizy wnoszenia mebli po schodach i przez drzwi (Moving Sofa Heuristic)**
* **Kontekst:** Analityczne rozwiązanie ciągłego problemu Moving Sofa jest otwartym problemem matematyki. W praktyce inżynierskiej meble są bryłami sztywnymi z możliwością obrotu w przestrzeni 3D.
* **Rozstrzygnięcie:** Zastosowanie dyskretnej heurystyki trajektorii obrotu bryły w rzutach 2D i 3D z krokiem kątowym $\Delta\theta = 5^\circ$ oraz obowiązkowym marginesem dłoni tragarza $L_{\text{dłoń}} = 50\,\text{mm}$ z każdej strony.

#### **DEC-43 Domyślna dylatacja listew przypodłogowych i krzywizny tynków**
* **Kontekst:** Meble zakupione na styk wnęki (np. szafa 150 cm we wnękę 150 cm) klinują się przy podłodze o listwy przypodłogowe.
* **Rozstrzygnięcie:** System domyślnie odejmuje $20\,\text{mm}$ z każdej strony wnęki ($40\,\text{mm}$ łącznie) na listwy przypodłogowe, chyba że użytkownik wyraźnie odznaczy opcję *„Brak listew / montaż przed listwami”*.

#### **DEC-44 Weryfikacja dylatacji wentylacyjnej urządzeń AGD**
* **Kontekst:** Brak odstępu za lodówką wolnostojącą prowadzi do przegrzania agregatu i odmowy uznania gwarancji przez serwis.
* **Rozstrzygnięcie:** Aplikacja automatycznie wymusza dodanie min. $50\,\text{mm}$ luzu wentylacyjnego z tyłu dla lodówek wolnostojących oraz min. $20\,\text{mm}$ po bokach, a także informuje o minimalnym kącie otwarcia drzwi ($115^\circ$) do wyjęcia szuflad zamrażarki.

#### **DEC-45 Ergonomiczne strefy otwarcia mebli (Functional Clearances)**
* **Kontekst:** Mebel może zmieścić się w pokoju, ale uniemożliwić korzystanie z niego (brak możliwości wysunięcia szuflad lub otwarcia drzwi szafy).
* **Rozstrzygnięcie:** Wprowadzenie „stref aktywnych”: $70\,\text{cm}$ dla drzwi szafy uchylnej, $90\,\text{cm}$ dla szuflad (z uwzględnieniem stojącego człowieka) oraz $75\,\text{cm}$ dla odsunięcia krzesła od stołu.

#### **DEC-46 Kontrola nacisku pionowego haka holowniczego (Parametr S)**
* **Kontekst:** Nowoczesne rowery elektryczne (e-bike) ważą po 25 kg. Platforma na 3 rowery z 2 e-bike'ami potrafi ważyć 75–80 kg, przekraczając dopuszczalny nacisk kuli haka ($S = 50–75\,\text{kg}$).
* **Rozstrzygnięcie:** Aplikacja zawiera dedykowany moduł bilansu nacisku na hak z automatyczną bazą limitów $S$ dla aut osobowych i ostrzeżeniem przed ryzykiem urwania kuli haka.

#### **DEC-47 Algorytm skrajni dachowej i wysokości wjazdu (1.9m / 2.0m / 2.1m)**
* **Kontekst:** Wjazd autem z boxem dachowym lub rowerami na dachu do parkingu podziemnego często kończy się zerwaniem dachu lub uszkodzeniem instalacji tryskaczowej.
* **Rozstrzygnięcie:** Wprowadzenie kalkulatora całkowitej wysokości zestawu ($H_{\text{auto}} + H_{\text{belki}} + H_{\text{ładunek}} + 3\,\text{cm}$ buforu dynamicznego) z czytelnym wskaźnikiem dopuszczenia dla znaków B-16: 1.9 m, 2.0 m, 2.1 m.

#### **DEC-48 Geometria skrajni garażowej i strefa wysiadania kierowcy**
* **Kontekst:** Szerokość auta podawana w dowodzie rejestracyjnym nie uwzględnia lusterek bocznych (+20–28 cm). Samochód może wjechać do garażu, ale kierowca nie jest w stanie otworzyć drzwi.
* **Rozstrzygnięcie:** Model garażowy uwzględnia szerokość z rozłożonymi i złożonymi lusterkami oraz weryfikuje strefę min. $65\,\text{cm}$ wolnej przestrzeni od słupa/ściany do otwarcia drzwi kierowcy na 1. stopień zapadki.

#### **DEC-49 Kąt otwarcia klapy bagażnika pod sufitem garażu**
* **Kontekst:** Elektryczne klapy SUV-ów otwierają się na wysokość 210–225 cm, uderzając w prowadnice bramy segmentowej lub sufit.
* **Rozstrzygnięcie:** Walidacja maksymalnego punktu uniesienia klapy ($H_{\text{klapa\_max}}$) z sugerowaniem programowania ogranicznika wysokości klapy.

#### **DEC-50 Modelowanie boksów Self-Storage i korytarza dostępowego**
* **Kontekst:** Upakowanie boksu magazynowego pod sufit uniemożliwia dostanie się do rzeczy potrzebnych w trakcie remontu.
* **Rozstrzygnięcie:** Opcjonalna funkcja rezerwacji korytarza inspekcyjnego o szerokości $50\,\text{cm}$ w boksie magazynowym.

#### **DEC-51 Klasyfikacja flot przeprowadzkowych kat. B**
* **Rozstrzygnięcie:** Baza standardowych pojazdów dostawczych dostępnych na prawo jazdy kat. B: Blaszak L1H1 ($7.5\,\text{m}^3$), L2H2 ($10.5\,\text{m}^3$), L3H2 ($13\,\text{m}^3$), L4H3 ($17\,\text{m}^3$) oraz Plandeka/Kontener meblowy z windą ($20–22\,\text{m}^3$).

#### **DEC-52 Dopuszczalny nacisk punktowy na podłogę bagażnika**
* **Rozstrzygnięcie:** Ograniczenie masy skupionej do $120–150\,\text{kg}$ dla aut z podwójną podłogą zawieszoną na elementach styropianowych/plastikowych przy transporcie materiałów budowlanych.

#### **DEC-53 Klatki kennelowe dla psów**
* **Rozstrzygnięcie:** Modelowanie klatek aluminiowych ze skośnymi ścianami przednimi i tylnymi ($15^\circ–40^\circ$) pod kątem domknięcia klapy bagażnika.

#### **DEC-54 Dopuszczalny zwis ładunku poza obrys auta (art. 61 ust. 6 PoRD)**
* **Rozstrzygnięcie:** Weryfikacja zwisu ładunku dachowego: przód max $0.5\,\text{m}$ (i $1.5\,\text{m}$ od fotela kierowcy), tył max $2.0\,\text{m}$, wymóg chorągiewki czerwonej.

#### **DEC-55 Nośność relingów dachowych i belek poprzecznych**
* **Rozstrzygnięcie:** Weryfikacja sumarycznej masy belek, boxa i bagażu względem fabrycznej nośności dachu (50 kg, 75 kg, 100 kg).

#### **DEC-56 Modelowanie wind osobowych (PN-EN 81-70)**
* **Rozstrzygnięcie:** Przestrzenna przekątna kabiny 3D z tolerancją manewrową $5\,\text{cm}$ na blat kuchenny, profile i materace.

#### **DEC-57 Wskaźnik kąta nachylenia skosów poddasza**
* **Rozstrzygnięcie:** Wyznaczanie linii wysokości stojącej ($190\,\text{cm}$) i strefy niskiej ($140\,\text{cm}$) na podstawie wysokości ścianki kolankowej i kąta połaci dachu.

#### **DEC-58 Rzeczywista głębokość pralki z podłączeniem hydraulicznym**
* **Rozstrzygnięcie:** Dodawanie automatycznego buforu $+80\,\text{mm}$ do głębokości katalogowej pralki na wąż AquaStop i syfon podtynkowy.

#### **DEC-59 Kolejność załadunku przy przeprowadzkach (Zasada 4 Fazy)**
* **Rozstrzygnięcie:** Algorytm generuje plan załadunku busa: Faza 1 (ściana grodziowa, ciężkie AGD), Faza 2 (meble skrzyniowe), Faza 3 (kartony i wypełnienia), Faza 4 (Karton Pierwszej Nocy przy klapie).

#### **DEC-60 Kopia zapasowa planów przeprowadzek i lokali (Eksport JSON za 0 zł)**
* **Rozstrzygnięcie:** Wszystkie plany przeprowadzek, wymiary lokali, mebli i wnęk zapisywane są w SQLite i eksportowalne do pliku JSON w ramach 100% suwerenności danych.
