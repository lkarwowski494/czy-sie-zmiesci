# **Czy się zmieści? (FitCheck) BRD 0.1 — Część B9**

## **Rozdział 7: Wymagania narzędziowe — Garaże, skrajnie dachowe, haki i sprzęt rekreacyjny (BR-GAR)**

Moduł odpowiada za analizę dopasowania pojazdu do wąskich garaży i miejsc parkingowych, skrajni pionowej przy wjazdach do obiektów podziemnych z bagażnikami dachowymi, kontrolę nośności haka holowniczego, transportu rowerów, sprzętu sportowego i klatek dla zwierząt.

---

### **BR-GAR-001 Weryfikacja szerokości auta z lusterkami i strefy wysiadania w garażu**
* **Opis:** Porównanie całkowitej szerokości pojazdu z rozłożonymi i złożonymi lusterkami bocznymi (szerokość wg dowodu rejestracyjnego powiększona o $20–28\,\text{cm}$) ze światłem bramy garażowej oraz weryfikacja strefy uchylenia drzwi kierowcy (min. $65\,\text{cm}$ wolnej przestrzeni od słupa lub ściany do bezpiecznego wysiadania).
* **Persona:** P14 (Grzegorz), P1 (Tomasz).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given garaż jednostanowiskowy o szerokości wjazdu bramy 225 cm i szerokości wnętrza 265 cm z filarem po lewej stronie
  When użytkownik wybiera samochód o szerokości w katalogu 186 cm (szerokość z rozłożonymi lusterkami: 212 cm, ze złożonymi: 194 cm)
  Then system informuje: "Margines wjazdu w bramie: 13 cm z rozłożonymi lusterkami (rekomendowane złożenie lusterek przed wjazdem)"
  And oblicza strefę boczną po zaparkowaniu centralnym: (265 - 186) / 2 = 39.5 cm
  And wyświetla alarm ergonomiczny: "Zbyt wąsko na swobodne wysiadanie (wymagane min. 65 cm do otwarcia drzwi na 1. zapadkę). Konieczne zaparkowanie bliżej prawej ściany (asymetria 25 cm / 54 cm)"
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-GAR-002 Kolizja podniesionej klapy bagażnika z sufitem garażu i bramą segmentową**
* **Opis:** Weryfikacja maksymalnej wysokości otwarcia elektrycznej lub manualnej klapy bagażnika w górę ($H_{\text{klapa\_max}}$, sięgającej $205–225\,\text{cm}$ w SUV-ach i vanach) w odniesieniu do wysokości stropu garażu, napędu podsufitowego bramy lub prowadnic otwartej bramy segmentowej.
* **Persona:** P14 (Grzegorz), P1.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given garaż podziemny o wysokości sufitu 215 cm i prowadnicach otwartej bramy na wysokości 208 cm
  When użytkownik parkuje tyłem samochód typu SUV z klapą bagażnika unoszącą się na wysokość 220 cm
  Then system generuje czerwony alert kolizyjny: "Ryzyko uszkodzenia klapy! Maksymalne otwarcie (220 cm) przekracza skrajnię bramy (208 cm) o 12 cm"
  And podaje instrukcję techniczną: "Zaprogramuj ogranicznik wysokości otwarcia klapy elektrycznej w aucie lub zachowaj min. 80 cm dystansu od ściany tylnej"
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-GAR-003 Wysokość całkowita pojazdu z boxem dachowym a skrajnie wjazdowe (1.9m / 2.0m / 2.1m)**
* **Opis:** Automatyczne sumowanie wysokości bazowej pojazdu ($H_{\text{auto}}$), wysokości belek bazowych poprzecznych ($H_{\text{belki}}$, typowo $8–12\,\text{cm}$) oraz wysokości boxa dachowego lub rowerów na dachu ($H_{\text{ladunek}}$) z uwzględnieniem tolerancji ugięcia zawieszenia i porównanie z ograniczeniami znaków B-16 na parkingach podziemnych.
* **Persona:** P11 (Krzysztof), P1 (Tomasz).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given samochód kombi o wysokości 148 cm
  And zamontowane belki dachowe Thule WingBar (wysokość 10 cm) oraz box dachowy o wysokości 42 cm
  When system weryfikuje łączną wysokość zestawu
  Then oblicza sumaryczną wysokość dynamiczną: 148 + 10 + 42 + 3 (bufor bezpieczeństwa) = 203 cm
  And wyświetla wyraźny status dla typowych skrajni:
    | Obiekt | Znak drogowy | Możliwość wjazdu | Margines |
    | Parking podziemny CH | 2.10 m | ZEZWOLONY | +7 cm |
    | Parking hotelowy | 2.00 m | ZAKAZANY | -3 cm (KOLIZJA) |
    | Garaż miejski | 1.90 m | ZAKAZANY | -13 cm (KOLIZJA) |
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-GAR-004 Kontrola nacisku pionowego na kulę haka holowniczego (Parametr S)**
* **Opis:** Weryfikacja dopuszczalnego nacisku pionowego na kulę haka ($S$, najczęściej $50\,\text{kg}, 75\,\text{kg}$ lub $100\,\text{kg}$) przy montażu platform rowerowych. System sumuje masę platformy (np. $16–21\,\text{kg}$) oraz masę rowerów (tradycyjne $12–15\,\text{kg}$, e-bike $23–27\,\text{kg}$ bez baterii).
* **Persona:** P11 (Krzysztof).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given hak holowniczy o dopuszczalnym nacisku pionowym S = 75 kg
  And użytkownik montuje platformę na 3 rowery o masie własnej 19 kg
  When dodaje ładunek: 2x rower elektryczny (2x 24 kg) + 1x rower dziecięcy (11 kg)
  Then system oblicza całkowity nacisk na kulę: 19 + 48 + 11 = 78 kg
  And generuje alarm krytyczny: "Przekroczenie nośności pionowej haka o 3 kg! Ryzyko pęknięcia mocowania kuli lub odkształcenia podłużnicy przy uderzeniu w nierówność drogową"
  And rekomenduje: "Zdemontuj baterie z rowerów elektrycznych na czas transportu (oszczędność ok. 7 kg: masa spadnie do 71 kg < 75 kg)"
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-GAR-005 Dopuszczalny zwis ładunku poza obrys pojazdu (art. 61 PoRD)**
* **Opis:** Weryfikacja wymiarowa przewozu długich elementów na dachu lub z otwartą klapą (kajaki, deski windsurfingowe/SUP, belki, drabiny) zgodnie z polskim i europejskim prawem o ruchu drogowym:
  * Zwis z przodu: max $0.5\,\text{m}$ od przedniej płaszczyzny obrysu pojazdu i nie więcej niż $1.5\,\text{m}$ od siedzenia kierowcy.
  * Zwis z tyłu: max $2.0\,\text{m}$ od tylnej płaszczyzny obrysu pojazdu.
  * Wymóg oznakowania: chorągiewka czerwona lub pasy biało-czerwone, w nocy światło czerwone.
* **Persona:** P11 (Krzysztof), P12 (Dariusz).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given auto o długości całkowitej 440 cm z belkami dachowymi
  When użytkownik dodaje deskę SUP o długości 380 cm wysuniętą do tyłu o 140 cm poza obrys zderzaka
  Then system potwierdza: "Zwis tylny 140 cm jest legalny (limit art. 61 PoRD: 200 cm)"
  And wyświetla obowiązek prawny: "Wymagane oznakowanie ładunku: czerwona chorągiewka o wymiarach min. 50x50 cm na końcu deski"
  ```
* **Priorytet:** SHOULD.
* **Etap:** MVP.

---

### **BR-GAR-006 Dopasowanie klatki kennelowej dla psa do skosu szyby bagażnika**
* **Opis:** Baza znormalizowanych aluminiowych i kompozytowych klatek transportowych dla psów ze skośną ścianą przednią i tylną (kąty od $15^\circ$ do $40^\circ$). Algorytm sprawdza, czy klatka mieści się w bagażniku bez uderzania górną krawędzią w szybę klapy lub w zagłówki kanapy.
* **Persona:** P13 (Zofia).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given bagażnik SUV-a ze skosem tylnej szyby 38°
  When użytkownik wybiera klatkę kennelową o podstawie 90x65 cm, sufitu 50x65 cm i wysokości 68 cm
  Then system symuluje styk skosów i potwierdza domknięcie klapy z bezpiecznym luzem 4.5 cm od szyby
  And weryfikuje dostęp do mechanizmu awaryjnego otwierania klatki od strony kabiny pasażerskiej
  ```
* **Priorytet:** SHOULD.
* **Etap:** MVP.

---

### **BR-GAR-007 Wytrzymałość podłogi bagażnika na nacisk punktowy (Materiały budowlane)**
* **Opis:** Weryfikacja obciążenia punktowego podłogi bagażnika w autach z podwójną podłogą, schowkami styropianowymi lub brakiem koła zapasowego (podłoga zawieszona na ramce z tworzywa sztucznego). Ostrzeżenie przed układaniem ciężkich ładunków (płytki gresowe, worki z cementem) w jednym punkcie (limit nośności półki: typowo $100–150\,\text{kg}$).
* **Persona:** P12 (Dariusz), P6 (Janusz).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given auto z podwójną podłogą bagażnika o maksymalnym dopuszczalnym obciążeniu półki górnej 120 kg
  When użytkownik dodaje ładunek: 8 paczek gresu po 25 kg (łączna masa 200 kg)
  Then system wyświetla ostrzeżenie: "Ryzyko załamania podłogi! Masa 200 kg przekracza wytrzymałość górnej półki (120 kg)"
  And podaje instrukcję techniczną: "Opuść podłogę bagażnika do poziomu dolnego lub ułóż ciężki ładunek na twardej podłodze za oparciem kanapy"
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.
