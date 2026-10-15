# **Czy się zmieści? (FitCheck) BRD 0.1 — Część B8**

## **Rozdział 7: Wymagania narzędziowe — Wymiarowanie lokalu, wnęki, schody i ościeżnice (BR-LOK)**

Moduł odpowiada za analizę drogi transportowej mebla od wejścia do budynku aż po docelowe miejsce w pokoju oraz za precyzyjne pasowanie mebli i sprzętów AGD w przestrzeni mieszkalnej z uwzględnieniem tolerancji montażowych, instalacyjnych i ergonomicznych.

---

### **BR-LOK-001 Weryfikacja przejścia przez otwór drzwiowy i ościeżnicę**
* **Opis:** Porównanie najmniejszego wymiaru przekroju poprzecznego mebla (lub wymiaru po demontażu nóżek/boków) ze światłem ościeżnicy drzwiowej, z uwzględnieniem ograniczeń powodowanych przez klamkę, zawiasy oraz kąt otwarcia skrzydła drzwiowego (90° vs 180°).
* **Persona:** P5 (Agnieszka), P9 (Michał), P2 (Kasia).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given drzwi wejściowe o wymiarach nominalnych "80 cm"
  And światło przejścia w ościeżnicy wynosi 78 cm, klamka wystaje na 6 cm, a skrzydło otwiera się pod kątem 90° (ograniczając przejście o grubość skrzydła 4 cm)
  When użytkownik sprawdza możliwość wniesienia lodówki o wymiarach 82 x 70 x 190 cm
  Then system oblicza efektywne światło drzwi: 74 cm
  And informuje, że lodówka przejdzie zorientowana bokiem (szerokość 70 cm < efektywne światło 74 cm) z marginesem 4 cm
  And generuje ostrzeżenie: "Wymagane zdemontowanie klamek lub zdjęcie skrzydła z zawiasów w razie braku luzu na dłonie tragarzy (min. 5 cm)"
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-LOK-002 Symulator obrotu na klatce schodowej i spoczniku (Moving Sofa Problem)**
* **Opis:** Geometryczny algorytm weryfikacji obrotu długich i sztywnych przedmiotów (narożniki, kanapy nierozkładane, blaty kuchenne, materace, szafy w całości) na podestach klatek schodowych (spocznikach) o kształcie prostym, w kształcie litery L (kąt 90°) oraz w kształcie litery U (kąt 180°).
* **Persona:** P9, P5, P7.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given klatka schodowa o szerokości biegu 105 cm, spocznik o wymiarach 120 x 210 cm i wysokości sufitu 240 cm
  When użytkownik weryfikuje wniesienie monolitycznej kanapy o wymiarach 220 x 95 x 85 cm
  Then algorytm symuluje trajektorię obrotu bryły w 3D (obrót w pionie i poziomie)
  And wykrywa kolizję narożnika kanapy ze skosem sufitu biegu schodowego na wysokości 195 cm
  And wyświetla wynik: "BRAK MOŻLIWOŚCI WNIESIENIA W CAŁOŚCI — wymagany demontaż boczków lub transport pionowy przez balkon/okno"
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-LOK-003 Weryfikacja kabiny i drzwi windy (osobowa vs towarowa)**
* **Opis:** Weryfikacja wymiarów wejścia do windy (drzwi teleskopowe lub wychylne) oraz przestrzennej przekątnej kabiny trójwymiarowej $\sqrt{D^2 + S^2 + W^2}$ dla przedmiotów długich (np. blat $280\,\text{cm}$, profil karnisza $300\,\text{cm}$, materac $160 \times 200\,\text{cm}$).
* **Persona:** P5, P9.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given standardowa winda osobowa 4-osobowa (szerokość drzwi: 80 cm, kabina: 90 x 120 x 210 cm)
  When użytkownik sprawdza możliwość wjechania z blatem meblowym 260 x 60 x 4 cm
  Then system oblicza maksymalną przekątną przestrzenną kabiny: sqrt(0.9² + 1.2² + 2.1²) = 2.58 m
  And informuje, że blat o długości 2.60 m NIE zmieści się w windzie (przekroczenie o 2 cm)
  And wskazuje konieczność wniesienia ręcznego po klatce schodowej
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-LOK-004 Wpasowanie we wnękę ścienną z uwzględnieniem listew przypodłogowych**
* **Opis:** Sprawdzanie, czy szafa, komoda lub regał zmieści się we wnęce ściennej, z automatycznym odliczeniem domyślnej grubości listwy przypodłogowej ($20\,\text{mm}$ na stronę) oraz tolerancji nierówności ścian tynkarskich (odchyłka od pionu).
* **Persona:** P10 (Natalia), P2 (Kasia).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given wnęka ścienna o wymiarze surowym mierzonym na wysokości 150 cm: 152.0 cm
  And zamontowane listwy przypodłogowe MDF o grubości 18 mm z każdej strony
  When użytkownik weryfikuje zakup szafy modułowej o szerokości katalogowej 150.0 cm
  Then system oblicza szerokość w świetle listew: 152.0 - (2 * 1.8) = 148.4 cm
  And wyświetla alarm kolizyjny: "Szafa 150 cm nie zmieści się przy podłodze (kolizja z listwami o 1.6 cm)"
  And podaje rekomendację techniczną: "Konieczne podcięcie listew przypodłogowych lub wybór szafy o szerokości 140 cm"
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-LOK-005 Kolizje ze stolarką okienną, parapetami i grzejnikami**
* **Opis:** Detekcja kolizji mebla z wystającymi elementami infrastruktury ściennej: parapet wystający w głąb pomieszczenia ($2–5\,\text{cm}$), kaloryfer płytowy lub żeberkowy ($10–16\,\text{cm}$ od lica ściany) oraz rury pionów grzewczych.
* **Persona:** P10 (Natalia), P9.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given ściana pod oknem o szerokości 220 cm z grzejnikiem płytowym odstającym na 12 cm na odcinku 80-180 cm
  When użytkownik planuje postawienie biurka o szerokości 140 cm i głębokości 70 cm we wskazanym narożniku
  Then system wykrywa kolizję z grzejnikiem na głębokości 58-70 cm
  And wizualizuje wymuszony odstęp biurka od ściany o 12 cm lub konieczność przesunięcia mebla
  ```
* **Priorytet:** SHOULD.
* **Etap:** MVP.

---

### **BR-LOK-006 Ergonomia i strefy funkcjonalne mebli (Functional Clearances)**
* **Opis:** System modeluje nie tylko statyczną bryłę mebla, lecz jego dynamiczną strefę funkcjonalną:
  * Drzwi szafy uchylnej: promień otwarcia skrzydła (min. $50–60\,\text{cm}$) + przejście człowieka ($40\,\text{cm}$) = bufor min. $90–100\,\text{cm}$.
  * Wysuwane szuflady komody/łóżka: głębokość wysuwu ($45–55\,\text{cm}$) + strefa klęczącego/stojącego człowieka ($45\,\text{cm}$) = bufor min. $90–100\,\text{cm}$.
  * Stół jadalniany: odsunięcie krzesła ($55\,\text{cm}$) + swobodne przejście za plecami ($40\,\text{cm}$) = bufor min. $95\,\text{cm}$ od krawędzi blatu do ściany.
* **Persona:** P10 (Natalia), P1 (Tomasz).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given sypialnia o szerokości 280 cm
  And użytkownik ustawia na przeciwległych ścianach: łóżko o długości 205 cm z szufladą boczną (wysuw 50 cm) oraz szafę z drzwiami uchylnymi (skrzydło 50 cm)
  When system sprawdza strefy funkcjonalne w korytarzu środkowym o szerokości 75 cm (280 - 205)
  Then system generuje ostrzeżenie: "Konflikt stref roboczych: pełne otwarcie drzwi szafy (50 cm) zostawia tylko 25 cm przejścia"
  And sugeruje: "Rekomendowana szafa z drzwiami przesuwnymi lub rezygnacja z bocznych szuflad łóżka"
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-LOK-007 Weryfikacja dylatacji i wentylacji lodówek wolnostojących**
* **Opis:** Walidacja odstępów technicznych wymaganych przez producentów AGD dla lodówek wolnostojących: odstęp tylny od ściany dla skraplacza (min. $50\,\text{mm}$), odstęp boczny (min. $20\,\text{mm}$) oraz kąt otwarcia drzwi (min. $115^\circ$) niezbędny do pełnego wysunięcia szuflad na warzywa i komory zamrażarki.
* **Persona:** P5 (Agnieszka), P10 (Natalia).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given lodówka wolnostojąca o szerokości 60.0 cm i głębokości 65.0 cm planowana bezpośrednio przy prostopadłej ścianie bocznej
  When użytkownik sprawdza dopasowanie we wnęce o szerokości 62.0 cm
  Then system informuje: "Szerokość wystarczająca na wsunięcie, ALE kąt otwarcia drzwi przy ścianie wyniesie maksymalnie 90°"
  And wyświetla krytyczne ostrzeżenie: "Brak możliwości wyjęcia dolnych szuflad zamrażalnika bez kolizji z uszczelką drzwi (wymagane min. 115° lub dystans 8 cm od ściany)"
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-LOK-008 Głębokość montażowa pralki i suszarki z przyłączami**
* **Opis:** Weryfikacja głębokości rzeczywistej pralki w szafie lub wnęce łazienkowej z uwzględnieniem podłączenia węża dopływowego, zaworu odcinającego i syfonu odpływowego (wymagany naddatek $+80$ do $+100\,\text{mm}$ do głębokości korpusu podanej w katalogu) oraz promienia otwarcia drzwiczek wsadu.
* **Persona:** P5 (Agnieszka), P10.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given szafa łazienkowa z drzwiami przesuwnymi o głębokości wewnętrznej 62 cm
  When użytkownik wybiera pralkę ładowaną od frontu o wymiarze katalogowym głębokości 55 cm
  Then system dodaje technologiczny bufor hydrauliczny +9 cm na wąż odpływowy i zawór kątowy
  And oblicza rzeczywistą głębokość instalacyjną: 64 cm
  And wyświetla komunikat: "Pralka nie pozwoli domknąć drzwi przesuwnych szafy (brakuje 2 cm głębokości montażowej)"
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-LOK-009 Dopasowanie do skosów poddasza i ścianek kolankowych**
* **Opis:** Modelowanie geometrii poddasza ze zdefiniowaną wysokością ścianki kolankowej ($H_k$, np. $80–120\,\text{cm}$) oraz kątem nachylenia połaci dachowej ($\alpha$, np. $30^\circ–45^\circ$). Weryfikacja, jak blisko ściany można przysunąć biurko, łóżko lub szafę bez uderzania głową o sufit.
* **Persona:** P9, P10.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given ścianka kolankowa o wysokości 90 cm i kąt dachu 35°
  When użytkownik stawia łóżko o wysokości ramy z materacem 55 cm i wezgłowiu 95 cm
  Then system oblicza, że wezgłowie o wysokości 95 cm musi być odsunięte od ścianki kolankowej o min. 7.1 cm
  And wyznacza linię wysokości stojącej człowieka (190 cm) w odległości 142.8 cm od ścianki kolankowej
  ```
* **Priorytet:** SHOULD.
* **Etap:** 1.1.

---

### **BR-LOK-010 Opuszczana klapa zmywarki i piekarnika**
* **Opis:** Modelowanie strefy otwarcia frontów uchylnych w dół (zmywarka do naczyń, piekarnik podblatowy) wymagających min. $65–70\,\text{cm}$ przestrzeni przed urządzeniem na opuszczenie klapy oraz min. $40\,\text{cm}$ na stojącego użytkownika wyjmującego naczynia.
* **Persona:** P10, P5.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given wąska kuchnia dwurzędowa z korytarzem między szafkami o szerokości 95 cm
  When użytkownik planuje montaż zmywarki 60 cm naprzeciwko szafek kuchennych
  Then system ostrzega: "Po opuszczeniu klapy zmywarki (długość 65 cm) pozostanie jedynie 30 cm wolnej przestrzeni (wymagane min. 40 cm na swobodne stanięcie przed urządzeniem)"
  ```
* **Priorytet:** SHOULD.
* **Etap:** 1.1.
