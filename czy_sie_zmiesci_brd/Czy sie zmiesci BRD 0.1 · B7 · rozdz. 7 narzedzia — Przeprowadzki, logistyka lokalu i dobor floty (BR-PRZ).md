# **Czy się zmieści? (FitCheck) BRD 0.1 — Część B7**

## **Rozdział 7: Wymagania narzędziowe — Przeprowadzki, logistyka lokalu i dobór floty (BR-PRZ)**

Moduł odpowiada za kompleksowe planowanie i weryfikację przestrzenną przeprowadzek mieszkań, domów, biur oraz magazynowania mienia w boksach self-storage i komórkach lokatorskich.

---

### **BR-PRZ-001 Inwentaryzacja mebli i mienia lokalu**
* **Opis:** Użytkownik może utworzyć listę całego dobytku z podziałem na pomieszczenia źródłowe (Salon, Sypialnia, Kuchnia, Przedpokój, Piwnica, Garaż) z szybkim wyborem typowych mebli i szacowaniem liczby kartonów przeprowadzkowych (S, M, L, XL).
* **Persona:** P9 (Michał i Karolina), P7 (Bartek), P5 (Agnieszka).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given użytkownik tworzy nowy projekt przeprowadzki "Mieszkanie 52m2 -> Nowy Dom"
  When dodaje pomieszczenie "Salon" i wybiera predefiniowane bryły: "Narożnik L 240x160x85", "Stół rozkładany 140x90x75", "4x Krzesło", "Szafka RTV 180x45x50", "12x Karton L (60x40x40)"
  Then system oblicza sumaryczną kubaturę salonu: 4.82 m³ oraz szacowaną masę całkowitą: 310 kg
  And agreguje te wartości do globalnego bilansu całego projektu przeprowadzki
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-PRZ-002 Szacowanie kubatury na podstawie metrażu lokalu**
* **Opis:** System oferuje empiryczny kalkulator szacunkowej kubatury mienia ($m^3$) na podstawie powierzchni lokalu ($m^2$), liczby domowników oraz stopnia umeblowania (minimalistyczny, standardowy, gęsty).
* **Persona:** P9, P7.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given użytkownik nie posiada szczegółowej inwentaryzacji każdego mebla
  When podaje powierzchnię mieszkania: 60 m², liczbę osób: 3 oraz wskaźnik zagracenia: "Standardowy"
  Then algorytm wylicza szacunkową kubaturę transportową: 24.0 m³ (przelicznik: 0.40 m³/m²)
  And sugeruje minimalną liczbę standardowych kartonów przeprowadzkowych (M/L): 45 sztuk
  And wskazuje rekomendowany typ pojazdu dostawczego
  ```
* **Priorytet:** SHOULD.
* **Etap:** MVP.

---

### **BR-PRZ-003 Dobór pojazdu dostawczego i floty przeprowadzkowej (kat. B)**
* **Opis:** Baza danych znormalizowanych pojazdów dostawczych do 3.5 t DMC: Van blaszak krótki (L1H1, ~7.5 $m^3$), średni (L2H2, ~10.5 $m^3$), długi (L3H2, ~13 $m^3$), superdługi (L4H3, ~17 $m^3$) oraz kontener meblowy z windą załadowczą (Plandeka/Kontener 8-paletowy, ~20–22 $m^3$).
* **Persona:** P9, P7, P12.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given łączna kubatura inwentarza wynosi 18.5 m³, a masa całkowita 1 450 kg
  When użytkownik otwiera moduł "Dobór pojazdu dostawczego"
  Then system informuje, że pojedynczy kurs busem L2H2 (pojemność 10.5 m³) nie pomieści mienia (wymaga min. 2 kursów)
  And proponuje alternatywnie: 1 kurs kontenerem 20 m³ z windą hydrauliczną (kat. B, ładowność 1 100 kg)
  And generuje ostrzeżenie o przekroczeniu ładowności o 350 kg dla kontenera (wymóg podziału na 2 kursy ze względów wagowych)
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-PRZ-004 Kalkulator liczby kursów i optymalizacja logistyki**
* **Opis:** System porównuje scenariusze: wykonanie $N$ kursów posiadanym autem osobowym/kombi vs wypożyczenie vana na 4h/24h vs wynajęcie ekipy przeprowadzkowej, uwzględniając koszty paliwa, opłatę za wypożyczenie vana oraz czas załadunku.
* **Persona:** P7 (Bartek), P9 (Michał).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given odległość między starym a nowym mieszkaniem wynosi 25 km
  And łączna objętość mienia wynosi 12 m³
  When użytkownik porównuje scenariusze: "Skoda Octavia Combi (bagażnik 0.64 m³)" vs "Wynajem busa L2H2 na 4h (150 zł)"
  Then system wylicza: kombi wymaga 19 kursów (950 km, czas jazdy ok. 16h, koszt paliwa ok. 450 zł)
  And rekomenduje wypożyczenie busa L2H2: 1 kurs (50 km, koszt łączny z paliwem: 175 zł, oszczędność: 275 zł i 14h pracy)
  ```
* **Priorytet:** SHOULD.
* **Etap:** 1.1.

---

### **BR-PRZ-005 Kolejność załadunku mebli przeprowadzkowych (Zasada 4 Fazy)**
* **Opis:** Algorytm kolejkowania pakowania przestrzeni ładunkowej busa według reguł sztuki przeprowadzkowej:
  1. *Faza 1 (Ściana grodziowa):* Ciężkie sprzęty AGD (pralka, lodówka, zmywarka) oraz pionowe płyty meblowe spięte pasami.
  2. *Faza 2 (Podstawa):* Ciężkie meble skrzyniowe, komody, stoły blatami do dołu lub boku.
  3. *Faza 3 (Warstwa średnia i wypełnienia):* Kartony z książkami na dole, kartony z odzieżą i szkłem na górze, materace wzdłuż ścian bocznych.
  4. *Faza 4 (Próg tylnej klapy):* Rzeczy pierwszej potrzeby („Karton Pierwszej Nocy” — czajnik, pościel, ładowarki, dokumenty, podstawowe narzędzia).
* **Persona:** P9, P7.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given użytkownik generuje plan załadunku dla 25 pozycji mebli i 30 kartonów
  When uruchamia procedurę "Sekwencja załadunku busa"
  Then system pozycjonuje pralkę i lodówkę bezpośrednio przy grodzi kabiny kierowcy
  And umieszcza "Karton Pierwszej Nocy" przy tylnych drzwiach załadunkowych z etykietą "Wyjmij jako pierwszy"
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-PRZ-006 Wymiarowanie boksu magazynowego (Self-Storage Optimizer)**
* **Opis:** Kalkulator doboru wielkości komórki lokatorskiej lub boksu w komercyjnych magazynach self-storage (rozmiary: $1\,m^2, 2\,m^2, 3\,m^2, 5\,m^2, 7.5\,m^2, 10\,m^2$ przy standardowej wysokości $2.70-3.00\,\text{m}$).
* **Persona:** P9, P6 (Janusz).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given użytkownik musi zmagazynować meble o łącznej objętości 11.2 m³ na czas remontu
  When wybiera moduł "Dobór boksu Self-Storage" z wysokością sufitu 2.70 m
  Then system wskazuje optymalny boks: 5 m² (objętość 13.5 m³) ze współczynnikiem wypełnienia 83%
  And odrzuca boks 3 m² (objętość 8.1 m³) jako zbyt mały
  And ostrzega przed boksem 4 m² ze względu na brak możliwości pozostawienia korytarza dostępowego
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.

---

### **BR-PRZ-007 Korytarz dostępowy i strefa inspekcyjna w boksie magazynowym**
* **Opis:** Algorytm sztaplowania w magazynie rezerwuje ciąg komunikacyjny o szerokości min. $50\,\text{cm}$ od drzwi wejściowych w głąb boksu, jeśli użytkownik zaznaczy opcję *„Potrzebuję dostępu do rzeczy w trakcie magazynowania”*.
* **Persona:** P9, P6.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given użytkownik zaznacza opcję "Dostęp inspekcyjny do rzeczy"
  When silnik 3D oblicza układ kartonów w boksie 3.0 x 2.0 m
  Then wzdłuż osi środkowej rezerwowany jest wolny pas podłogi o szerokości 50 cm
  And rzeczy oznaczone tagiem "#CzęstyDostęp" są lokowane na regałach lub w pierwszym rzędzie przy korytarzu
  ```
* **Priorytet:** SHOULD.
* **Etap:** 1.1.

---

### **BR-PRZ-008 Ochrona ładunku i bilans materiałów zabezpieczających**
* **Opis:** Na podstawie listy mebli i powierzchni szklanych/lakierowanych system szacuje zapotrzebowanie na materiały zabezpieczające: rolki folii stretch, folii bąbelkowej, koce przeprowadzkowe, narożniki piankowe oraz pasy transportowe.
* **Persona:** P9, P2 (Kasia).
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given lista dobytku zawiera: stół drewniany lakierowany, 2 szafki nocne, lustro 150x60 oraz TV 65 cali
  When użytkownik otwiera zakładkę "Materiały ochronne"
  Then system rekomenduje: min. 1 rolka folii bąbelkowej (50 m²), 2 koce przeprowadzkowe, 8 narożników tekturowych i 2 pasy mocujące 250 daN
  ```
* **Priorytet:** COULD.
* **Etap:** 1.2.

---

### **BR-PRZ-009 Eksport planu przeprowadzki dla ekipy tragarzy**
* **Opis:** Możliwość wygenerowania jedno- lub dwustronicowego dokumentu PDF / karty graficznej PNG z podziałem kartonów na pokoje docelowe, kolorystycznymi oznaczeniami mebli i planem załadunku busa.
* **Persona:** P9, P8.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given sporządzony plan przeprowadzki "Przeprowadzka_Krakow_2026"
  When użytkownik klika "Eksportuj instrukcję dla ekipy"
  Then aplikacja generuje plik PDF offline w czasie < 800 ms
  And dokument zawiera czytelną tabelę: Nr kartonu, Pokój docelowy, Zawartość, Ostrzeżenie "OSTROŻNIE SZKŁO"
  ```
* **Priorytet:** SHOULD.
* **Etap:** MVP.

---

### **BR-PRZ-010 Weryfikacja udźwigu windy meblowej i wózków schodowych**
* **Opis:** Weryfikacja wagi pojedynczych monolitów (pianino, szafa pancerna, lodówka side-by-side, blat kamienny) pod kątem dopuszczalnego obciążenia 2-osobowego zespołu tragarzy (norma BHP: maks. 50 kg na osobę przy pracy dorywczej) i konieczności użycia pasów transportowych lub wózka schodowego.
* **Persona:** P9, P5.
* **Kryteria akceptacji (Gherkin):**
  ```gherkin
  Given na liście mebli znajduje się "Pianino akustyczne" o wadze 210 kg
  When użytkownik weryfikuje zasoby wnoszenia
  Then system wyświetla ostrzeżenie BHP: "Wymaga min. 4 tragarzy lub wózka schodowego gąsienicowego"
  And zaznacza zakaz wnoszenia ręcznego w 2 osoby (przekroczenie limitu 50 kg/os.)
  ```
* **Priorytet:** MUST.
* **Etap:** MVP.
