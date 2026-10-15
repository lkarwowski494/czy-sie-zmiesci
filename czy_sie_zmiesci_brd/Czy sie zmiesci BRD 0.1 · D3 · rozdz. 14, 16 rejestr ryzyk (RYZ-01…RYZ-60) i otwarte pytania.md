# **Czy się zmieści? (FitCheck) BRD 0.1 — Część D3**

## **Rozdział 14: Rejestr Ryzyk Projektu (RYZ-01…RYZ-60)**

Każde ryzyko oceniane jest w skali 1–5 pod kątem Prawdopodobieństwa ($P$) i Skutku ($S$). Wskaźnik ryzyka $W = P \times S$. Wartości $W \ge 15$ stanowią ryzyka krytyczne wymagające bezwzględnych działań zapobiegawczych w architekturze.

---

### **14.1. Ryzyka Produktowe i Sklepowe (Apple App Store)**

| ID | Nazwa ryzyka | P | S | W | Działanie zapobiegawcze / Mitygacja |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RYZ-01** | Odrzucenie przez Apple z wytycznej 4.3(b) (Prosty kalkulator) | 3 | 5 | **15** | Budowa zaawansowanego modułu 3D SceneKit, bazy aut, Szkoły Pakowania, modułu DMC, przeprowadzek i Apple Watch w wersji 1.0. |
| **RYZ-02** | Odrzucenie z wytycznej 5.2.1 (Znaki towarowe aut i marek meblowych) | 3 | 4 | **12** | Brak logotypów marek w grafice; w kodzie i bazie wyłącznie faktograficzne dane tekstowe w ramach prawa do uczciwego opisu (*fair use*). |
| **RYZ-03** | Reklamacja użytkownika za zarysowanie auta lub uszkodzenie mebla | 2 | 5 | **10** | Domyślny margines technologiczny $\epsilon = 15\text{ mm}$ + widoczny disclamer prawny w standardzie Apps4Brew (narzędzie wspomagające). |
| **RYZ-04** | Złe oceny w App Store z powodu trudnej obsługi widoku 3D przez seniorów | 3 | 4 | **12** | Oprócz podglądu 3D udostępnienie prostych rzutów płaskich 2D (z góry, od klapy) oraz dużych przycisków pomocniczych. |
| **RYZ-05** | Spadek konwersji przy braku tańszej subskrypcji tygodniowej | 2 | 3 | 6 | Zgodnie z filozofią Apps4Brew odrzucenie ciemnych wzorców tygodniowych; obrona uczciwą subskrypcją roczną z 14-dniowym trialem. |

---

### **14.2. Ryzyka Algorytmiczne i Geometryczne**

| ID | Nazwa ryzyka | P | S | W | Działanie zapobiegawcze / Mitygacja |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RYZ-11** | Niewykrycie kolizji przy skrajnym kącie klapy bagażnika | 2 | 5 | **10** | Dedykowane testy jednostkowe z wektorami skrajnymi (RD-05); funkcja obcinania Bounding Boxa z marginesem bezpieczeństwa. |
| **RYZ-12** | Przekroczenie limitu czasu obliczeń dla dużej liczby paczek ($N > 30$) | 2 | 4 | 8 | Algorytm heurystyczny Extreme Points z ograniczeniem czasu wykonywania (Time-budgeting) do maksymalnie $50\text{ ms}$. |
| **RYZ-13** | Niezgodność wymiarów rzeczywistych auta po lifcie | 4 | 3 | **12** | Oznaczenie roku i generacji w bazie danych; możliwość ręcznej modyfikacji szerokości przez użytkownika ($\pm 5\text{ cm}$). |
| **RYZ-14** | Błędne upakowanie paczek kruchych pod ciężkimi kartonami | 1 | 5 | 5 | Rygorystyczny warunek w sortowaniu (RD-02) uniemożliwiający alokację paczki `fragile` jako podstawy podparcia. |
| **RYZ-15** | Błąd zaokrągleń w obliczeniach zmiennoprzecinkowych | 1 | 4 | 4 | Wewnętrzne obliczenia w milimetrach na liczbach całkowitych (Integer arithmetic), konwersja na cm w UI. |

---

### **14.3. Ryzyka Prawne i Ruchu Drogowego**

| ID | Nazwa ryzyka | P | S | W | Działanie zapobiegawcze / Mitygacja |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RYZ-21** | Mandat kierowcy za przeładowanie samochodu (przekroczenie DMC) | 3 | 4 | **12** | Wyraźny wskaźnik masy i alarm czerwony przy przekroczeniu DMC (art. 61 ust. 1 PoRD); odliczenie pasażerów. |
| **RYZ-22** | Mandat za brak oznakowania wystającego ładunku powyżej 0,5 m | 2 | 3 | 6 | Automatyczny komunikat: *„Ładunek wystaje o 70 cm – wymagana czerwona chorągiewka (art. 61 ust. 6 pkt 2 PoRD)”*. |
| **RYZ-23** | Ryzyko roszczeń odszkodowawczych w jurysdykcji USA | 2 | 5 | **10** | Standardowa klauzula wyłączenia odpowiedzialności (Warranty & Liability Disclaimer) zatwierdzona w regulaminie EULA. |

---

### **14.4. Ryzyka Sprzętowe, Zegarkowe i Sensoryczne**

| ID | Nazwa ryzyka | P | S | W | Działanie zapobiegawcze / Mitygacja |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RYZ-31** | Zerwanie łączności WatchConnectivity podczas pakowania w podziemiu | 3 | 3 | 9 | Zegarek posiada kopię aktywnej sesji załadunku w lokalnym magazynie watchOS i działa w pełni autonomicznie bez telefonu. |
| **RYZ-32** | Niedokładność pomiaru ARKit na czarnym dywanie bagażnika | 4 | 3 | **12** | Opcja AR w 1.1; w MVP podstawą jest manualny formularz z suwakami i predefiniowana baza aut. |
| **RYZ-33** | Przegrzewanie urządzenia i drenaż baterii przy renderowaniu 3D | 2 | 3 | 6 | Użycie lekkich shaderów Metal bez cieni wolumetrycznych i wyłączanie pętli renderowania przy scenie statycznej. |

---

### **14.5. Ryzyka Przeprowadzek, Lokali, Wnęk i Sprzętu Specjalistycznego (RYZ-46…RYZ-60)**

| ID | Nazwa ryzyka | P | S | W | Działanie zapobiegawcze / Mitygacja |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RYZ-46** | Zaklinowanie monolitycznego mebla w klatce schodowej (Moving Sofa) | 3 | 5 | **15** | Algorytm symulacji obrotu 3D z wymuszonym buforem min. 5 cm na dłonie tragarzy i alertem o zakazie wnoszenia w całości. |
| **RYZ-47** | Zarysowanie ścian lub uszkodzenie ościeżnicy przy wnoszeniu mebla | 4 | 3 | **12** | Automatyczny monit o konieczności demontażu klamki i zdjęcia skrzydła drzwi z zawiasów przy braku luzu. |
| **RYZ-48** | Zatarcie agregatu chłodziarki po transporcie poziomym | 2 | 5 | **10** | Obowiązkowy ekran ostrzegawczy z timerem odliczającym 12h do pierwszego włączenia lodówki do prądu. |
| **RYZ-49** | Uszkodzenie bramy garażowej przez unoszącą się klapę bagażnika | 3 | 4 | **12** | Porównanie punktu szczytowego klapy z wysokością bramy i instrukcja programowania ogranicznika w aucie. |
| **RYZ-50** | Zerwanie boxa dachowego na wjeździe do parkingu podziemnego | 3 | 5 | **15** | Wskaźnik całkowitej wysokości z buforem dynamicznym 3 cm i wyraźnym statusem dopuszczenia dla znaków 1.9m, 2.0m, 2.1m. |
| **RYZ-51** | Pęknięcie kuli haka holowniczego przez ciężkie rowery elektryczne | 2 | 5 | **10** | Precyzyjny bilans nacisku pionowego $S$ i rekomendacja demontażu baterii e-bike'ów na czas transportu. |
| **RYZ-52** | Rozbicie szyby klapy bagażnika przez prostą klatkę dla psa | 3 | 4 | **12** | Weryfikacja styku skośnych ścian klatki kennelowej ze skosem szyby tylnej SUV-a. |
| **RYZ-53** | Załamanie podłogi podwójnej bagażnika przy zakupach budowlanych | 3 | 4 | **12** | Ostrzeżenie o przekroczeniu nośności punktowej (120 kg) przy transporcie płytek i cementu. |
| **RYZ-54** | Blokada szuflad zamrażalnika przez brak kąta otwarcia drzwi chłodziarki | 4 | 3 | **12** | Weryfikacja wymaganego kąta min. 115° lub odległości min. 8 cm od ściany prostopadłej. |
| **RYZ-55** | Brak możliwości domknięcia szafy przez wystające przyłącza pralki | 4 | 3 | **12** | Domyślne doliczanie technologicznego buforu instalacyjnego $+80\,\text{mm}$ do głębokości pralki. |
| **RYZ-56** | Kolizja ergonomiczna drzwi szafy z szufladami łóżka w sypialni | 3 | 3 | 9 | Modelowanie stref funkcjonalnych mebli z ostrzeżeniem o braku przejścia. |
| **RYZ-57** | Kolizja mebla ze skosem sufitu na poddaszu | 3 | 3 | 9 | Wyznaczanie dopuszczalnej głębokości dosunięcia mebla na podstawie kąta dachu i ścianki kolankowej. |
| **RYZ-58** | Przeładowanie busa przeprowadzkowego kat. B powyżej 3.5 t DMC | 3 | 4 | **12** | Ciągły bilans masy przeprowadzki z podziałem na kursy przy przekroczeniu ładowności busa. |
| **RYZ-59** | Niedoszacowanie kubatury mienia i konieczność dodatkowych kursów | 3 | 3 | 9 | Stosowanie empirycznego współczynnika bezpieczeństwa $+15\%$ przy szacowaniu objętości z metrażu lokalu. |
| **RYZ-60** | Uraz kręgosłupa tragarza przy wnoszeniu monolitów (> 100 kg) | 2 | 5 | **10** | Ostrzeżenie BHP o przekroczeniu dopuszczalnej wagi na osobę (50 kg/os.) i wymóg schodołazu lub 4 tragarzy. |

---

## **Rozdział 16: Rejestr Pytań Otwartych i Testów Laboratoryjnych**

* **OP-01 (Masa kierowcy w bazie aut):** Masa wg normy UE z kierowcą 75 kg i bakiem 90%. Formularz dopytuje wyłącznie o dodatkowych pasażerów.
* **OP-02 (Tolerancja skosu kanapy):** W modelach z regulowanym oparciem (np. SUV-y) przyjmujemy pozycję najbardziej pionową (maksymalny załadunek).
* **OP-03 (Paczki zmontowane vs płaskie mebli IKEA):** Użytkownik widzi nazwę i wymiary zmontowanego mebla, ale silnik kalkulatora operuje wyłącznie na wymiarach kartonów fabrycznych.
* **OP-04 (Tolerancja listew przypodłogowych):** Przyjmujemy domyślny bufor 20 mm na stronę wnęki (40 mm łącznie), chyba że użytkownik zaznaczy brak listew.
* **OP-05 (Masa baterii w rowerach elektrycznych):** Przy ostrzeżeniu o przeciążeniu haka holowniczego system sugeruje demontaż baterii e-bike (redukcja masy o 3–4 kg na rower).
