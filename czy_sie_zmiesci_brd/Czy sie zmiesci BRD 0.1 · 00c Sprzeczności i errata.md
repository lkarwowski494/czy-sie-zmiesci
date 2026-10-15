# **Czy się zmieści? (FitCheck) BRD 0.1 — 00c Sprzeczności i errata**

## **5. Zidentyfikowane sprzeczności założeń i sprostowania dziedzinowe**

Niniejszy rozdział gromadzi kluczowe pułapki pojęciowe i rozbieżności między danymi marketingowymi (katalogi samochodów, regulaminy sklepów, wymiary mebli, specyfikacje deweloperskie) a fizyczną rzeczywistością. Brak ich uwzględnienia byłby źródłem błędów obliczeniowych, uszkodzeń mienia i reklamacji użytkowników.

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
* **Rozstrzygnięcie w FitCheck (Reguła RD-22, RD-33):** Przy weryfikacji wnoszenia mebli kalkulator pyta: *„Czy skrzydło drzwi można zdjąć z zawiasów?”*. Jeśli nie, odejmuje automatycznie $6\text{ cm}$ od szerokości otworu na klamkę i grubość skrzydła.

---

### **SPRZ-06 Masa własna pojazdu a dopuszczalna ładowność (DMC)**
* **Sprzeczność:** Dowód rejestracyjny podaje masę własną $1400\text{ kg}$ i DMC $1950\text{ kg}$ (ładowność teoretyczna $550\text{ kg}$). Kierowca uważa, że może załadować $550\text{ kg}$ płytek ceramicznych z Castoramy.
* **Przyczyna:** Masa własna (pozycja G w dowodzie) zgodnie z normą unijną zawiera masę kierowcy ($75\text{ kg}$) i zbiornik paliwa zalany w 90%. Jednak w aucie jedzie 4 dorosłych pasażerów ($4 \times 80\text{ kg} = 320\text{ kg}$). Rzeczywista ładowność na bagaż spada do $230\text{ kg}$! Załadowanie $550\text{ kg}$ płytek oznacza przekroczenie DMC o ponad $300\text{ kg}$, ryzyko pęknięcia sprężyn zawieszenia i mandat z art. 61 PoRD.
* **Rozstrzygnięcie w FitCheck (Reguła RD-18):** Moduł ładowności obliguje do podania liczby pasażerów w pojeździe i automatycznie odejmuje ich masę od dopuszczalnej ładowności.

---

### **SPRZ-07 Szerokość katalogowa pojazdu vs rzeczywisty wjazd do garażu (Lusterka boczne)**
* **Sprzeczność:** W danych homologacyjnych i w dowodzie rejestracyjnym szerokość samochodu wynosi np. $1840\,\text{mm}$. Światło wjazdu do garażu ma $2000\,\text{mm}$. Kierowca próbuje wjechać i urywa lusterko boczne.
* **Przyczyna:** Przepisy homologacyjne podają szerokość nadwozia bez lusterek bocznych! Rozłożone lusterka powiększają szerokość auta o $200–280\,\text{mm}$ (np. z $1840\,\text{mm}$ do $2090\,\text{mm}$).
* **Rozstrzygnięcie w FitCheck (Reguła RD-41):** Baza danych aut zawiera dwie wartości: szerokość z rozłożonymi lusterkami oraz szerokość ze złożonymi lusterkami. Weryfikator wjazdu do garażu ostrzega przed kolizją i wskazuje konieczność złożenia lusterek przed wjazdem.

---

### **SPRZ-08 Wymiar nominalny wnęki ściennej vs listwy przypodłogowe i piony grzewcze**
* **Sprzeczność:** Kupujący zamawia szafę o szerokości $150\,\text{cm}$ do wnęki o szerokości zmierzonej miarką $151\,\text{cm}$. Po dostawie szafa nie wchodzi, ponieważ przy posadzce zamontowane są listwy przypodłogowe o grubości $20\,\text{mm}$ z każdej strony, zwężając dół wnęki do $147\,\text{cm}$.
* **Przyczyna:** Pomiary wnęk często wykonuje się na wysokości klatki piersiowej, ignorując detale wykończeniowe przy podłodze oraz odchyłki tynków od pionu.
* **Rozstrzygnięcie w FitCheck (Reguła RD-36):** Kreator wnęki domyślnie odejmuje $40\,\text{mm}$ na listwy przypodłogowe i obliguje do podania pomiaru w 3 punktach: przy podłodze, w połowie wysokości i pod sufitem.

---

### **SPRZ-09 Głębokość katalogowa pralki vs głębokość montażowa z instalacją hydrauliczną**
* **Sprzeczność:** Klient kupuje pralkę o głębokości katalogowej $60\,\text{cm}$ do szafy o głębokości $62\,\text{cm}$. Drzwi szafy nie zamykają się o $6\,\text{cm}$.
* **Przyczyna:** Producenci AGD podają głębokość samego blatu lub obudowy blaszanej, pomijając wystające z tyłu złącza węża dopływowego i odpływowego ($+50–80\,\text{mm}$) oraz wypukłość szklanych drzwiczek wsadowych ($+30–40\,\text{mm}$).
* **Rozstrzygnięcie w FitCheck (Reguła RD-39):** Aplikacja automatycznie dolicza bufor hydrauliczny $+80\,\text{mm}$ do głębokości nominalnej pralki i suszarki.

---

### **SPRZ-10 Nośność haka holowniczego (Parametr S) a rowery elektryczne (e-bike)**
* **Sprzeczność:** Kierowca instaluje platformę na 3 rowery na haku holowniczym o uciągu $1800\,\text{kg}$ i ładuje 3 rowery elektryczne, po czym hak ulega pęknięciu na wyboju.
* **Przyczyna:** Masa przyczepy (uciąg poziomy $D$) nie ma nic wspólnego z naciskiem pionowym na kulę ($S$). Typowy hak ma limit pionowy $S = 75\,\text{kg}$. Sama platforma waży $18–20\,\text{kg}$, a 3 rowery elektryczne $3 \times 25\,\text{kg} = 75\,\text{kg}$. Łącznie: $95\,\text{kg}$ nacisku pionowego na ramieniu $70\,\text{cm}$, co przekracza limit o 27% i generuje potężny moment gnący!
* **Rozstrzygnięcie w FitCheck (Reguła RD-44):** Moduł bagażnika rowerowego weryfikuje twardy limit $S$ i ostrzega przed przeciążeniem kuli haka.

---

### **SPRZ-11 Kąt otwarcia drzwi chłodziarki a wysunięcie szuflad zamrażarki**
* **Sprzeczność:** Lodówka wstawiona we wnękę kuchenną otwiera się pod kątem $90^\circ$ (do krawędzi ściany). Użytkownik nie może wysunąć dolnej szuflady zamrażarki na lód i warzywa.
* **Przyczyna:** Grube drzwi chłodziarek z uszczelką magnetyczną wymagają kąta otwarcia min. $115^\circ$ (lub min. $80\,\text{mm}$ odstępu od ściany prostopadłej), aby wewnętrzne szuflady mogły ominąć profil drzwi.
* **Rozstrzygnięcie w FitCheck (Reguła RD-38):** Formularz weryfikacji AGD sprawdza odległość zawiasu od bocznej ściany i ostrzega o blokadzie szuflad.

---

### **SPRZ-12 Klatka kennelowa dla psa vs profil tylnej szyby SUV-a**
* **Sprzeczność:** Klatka kennelowa o wymiarach $90 \times 65 \times 68\,\text{cm}$ mieści się na podłodze bagażnika, ale klapa samochodu nie daje się zamknąć, rozbijając szybę o górny narożnik klatki.
* **Przyczyna:** Tylna szyba w SUV-ach i hatchbackach opada pod kątem $30^\circ–45^\circ$. Klatki dla psów muszą posiadać skośną ścianę tylną odpowiadającą kątowi klapy.
* **Rozstrzygnięcie w FitCheck (Reguła RD-46):** Baza klatek kennelowych uwzględnia kąt ścięcia przedniego i tylnego oraz weryfikuje dopasowanie do trójwymiarowego profilu szyby.
