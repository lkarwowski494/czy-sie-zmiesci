# **Czy się zmieści? (FitCheck) BRD 0.1 — 00c Sprzeczności i errata**

## **5. Zidentyfikowane sprzeczności założeń i sprostowania dziedzinowe**

Niniejszy rozdział gromadzi kluczowe pułapki pojęciowe i rozbieżności między danymi marketingowymi (katalogi samochodów, regulaminy sklepów i linii lotniczych) a fizyczną rzeczywistością. Brak ich uwzględnienia byłby źródłem błędów obliczeniowych i reklamacji użytkowników.

---

### **SPRZ-01 Objętość katalogowa VDA (ISO 3832) vs użyteczna bryła prostopadłościenna**
* **Sprzeczność:** W materiałach reklamowych samochód ma np. „600 litrów pojemności bagażnika”. Użytkownik próbuje przewieźć szafkę o wymiarach $100 \times 80 \times 50\text{ cm}$ (objętość $400\text{ dm}^3 = 400\text{ l}$) i szafka nie wchodzi.
* **Przyczyna techniczna:** Norma **ISO 3832:2002** (VDA) mierzy objętość za pomocą prostopadłościennych bloczków o wymiarach $200 \times 100 \times 50\text{ mm}$ ($1\text{ dm}^3$). Testerzy fabryczni wciskają bloczki w każdą wnękę za nadkolami, pod podłogę przy kole zapasowym i w zagłębienia tapicerki.
* **Rozstrzygnięcie w FitCheck:** Aplikacja nigdy nie traktuje litrażu VDA jako bryły ładunkowej. Obliczenia opierają się na **geometrycznej strefie użytecznej (Bounding Box z modyfikatorami skosu)**. Wartość VDA w litrach jest wyświetlana wyłącznie jako informacja poglądowa.

---

### **SPRZ-02 Przestrzeń wewnętrzna vs światło otworu załadunkowego**
* **Sprzeczność:** Wnętrze bagażnika za nadkolami ma szerokość $120\text{ cm}$ i wysokość $85\text{ cm}$. Przedmiot o wymiarach $115 \times 80 \times 60\text{ cm}$ fizycznie zmieściłby się w środku, ale nie da się go włożyć do samochodu, ponieważ klapa bagażnika i tylne lampy zwężają otwór załadunkowy do $98\text{ cm}$.
* **Przyczyna:** Tradycyjne kalkulatory sprawdzają jedynie, czy wymiary przedmiotu są mniejsze od wymiarów przestrzeni ($x_{\text{item}} < x_{\text{trunk}}$), ignorując wektor wejściowy.
* **Rozstrzygnięcie w FitCheck (Reguła RD-03):** Algorytm weryfikuje warunek przejścia przez otwór: rzut 2D przedmiotu przy optymalnym kącie natarcia musi mieścić się w obrysie otworu załadunkowego ($W_{\text{aperture}} \times H_{\text{aperture}}$). W razie blokady aplikacja wyświetla komunikat: *„Przedmiot mieści się w środku, ale nie przejdzie przez otwór klapy (otwór za wąski o 4 cm)”*.

---

### **SPRZ-03 Wymiary nominalne skrytek paczkomatowych vs rzeczywista paczka**
* **Sprzeczność:** Gabaryt B w InPost ma nominalną wysokość $19\text{ cm}$. Karton o wysokości dokładnie $190\text{ mm}$ po oklejeniu taśmą i lekkim wybrzuszeniu ma $194\text{ mm}$ i klinuje się w skrytce lub rygiel zamka nie pozwala domknąć drzwiczek.
* **Przyczyna:** Rzeczywiste pudła kartonowe pod wpływem zawartości i naprężenia taśmy klejącej ulegają deformacji sprężystej (+3 do +8 mm). Dodatkowo zamek elektromagnetyczny drzwiczek paczkomatu zabiera ok. $10\text{ mm}$ głębokości w narożniku.
* **Rozstrzygnięcie w FitCheck (Reguła RD-09):** Wprowadzenie twardego marginesu technologicznego $\Delta_{\text{paczka}} = 10\text{ mm}$ na każdym wymiarze dla automatów paczkowych. Dla Gabarytu B maksymalny zalecany wymiar kartonu wynosi $180\times 370 \times 630\text{ mm}$.

---

### **SPRZ-04 Wymiar bagażu podręcznego linii lotniczych vs lotniskowy sizer metalowy**
* **Sprzeczność:** Regulamin linii lotniczej (np. Ryanair) podaje dopuszczalny wymiar małego bagażu $40 \times 20 \times 25\text{ cm}$. Pasażer kupuje torbę o tych wymiarach, ale wystające twarde kółka lub uchwyt powiększają ją do $44\text{ cm}$ i pasażer płaci karę 250 zł przy bramce.
* **Przyczyna:** Metalowy kosz pomiarowy (sizer) na lotnisku jest bezwzględny. Wymiar musi obejmować wszystkie elementy wystające (kółka, rączki, kieszenie zewnętrzne). Jednocześnie sizer Ryanaira w rzeczywistości ma wymiar ok. $42 \times 20,5 \times 30\text{ cm}$ (uwzględnia minimalny luz fabryczny kosza).
* **Rozstrzygnięcie w FitCheck (Reguła RD-14):** Formularz dodawania walizki zawiera obowiązkowy monit: *„Wymiar z kółkami i rączką”* oraz przełącznik: *„Torba miękka (możliwa kompresja)”* vs *„Walizka twarda (sztywna skorupa)”*.

---

### **SPRZ-05 Szerokość drzwi budowlanych: skrzydło vs światło ościeżnicy**
* **Sprzeczność:** W opisie mieszkania widnieje „drzwi 80-tki”. Kupujący zamawia kanapę o głębokości $78\text{ cm}$ w przekonaniu, że przejdzie. Kanapa nie przechodzi, ponieważ skrzydło otwarte pod kątem $90^\circ$ oraz wystająca klamka zwężają rzeczywiste światło przejścia do $72\text{ cm}$.
* **Przyczyna:** Oznaczenie „drzwi 80” odnosi się do szerokości skrzydła w felcu. Rzeczywista szerokość w świetle ościeżnicy (zgodnie z Warunkami Technicznymi Dz.U. 2019 poz. 1065) wynosi ok. $78\text{ cm}$, a przy obecności skrzydła nieotwierającego się do pełnych $180^\circ$ – zaledwie $72–74\text{ cm}$.
* **Rozstrzygnięcie w FitCheck (Reguła RD-22):** Przy weryfikacji wnoszenia mebli kalkulator pyta: *„Czy skrzydło drzwi można zdjąć z zawiasów?”*. Jeśli nie, odejmuje automatycznie $6\text{ cm}$ od szerokości otworu.

---

### **SPRZ-06 Masa własna pojazdu a dopuszczalna ładowność (DMC)**
* **Sprzeczność:** Dowód rejestracyjny podaje masę własną $1400\text{ kg}$ i DMC $1950\text{ kg}$ (ładowność teoretyczna $550\text{ kg}$). Kierowca uważa, że może załadować $550\text{ kg}$ płytek ceramicznych z Castoramy.
* **Przyczyna:** Masa własna (pozycja G w dowodzie) zgodnie z normą unijną zawiera masę kierowcy ($75\text{ kg}$) i zbiornik paliwa zalany w 90%. Jednak w aucie jedzie 4 dorosłych pasażerów ($4 \times 80\text{ kg} = 320\text{ kg}$). Rzeczywista ładowność na bagaż spada do $230\text{ kg}$! Załadowanie $550\text{ kg}$ płytek oznacza przekroczenie DMC o ponad $300\text{ kg}$, ryzyko pęknięcia sprężyn zawieszenia i mandat z art. 61 PoRD.
* **Rozstrzygnięcie w FitCheck (Reguła RD-18):** Moduł ładowności obliguje do podania liczby pasażerów w pojeździe i automatycznie odejmuje ich masę od dopuszczalnej ładowności.
