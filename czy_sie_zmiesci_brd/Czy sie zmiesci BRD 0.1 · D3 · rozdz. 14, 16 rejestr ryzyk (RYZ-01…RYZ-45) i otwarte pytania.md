# **Czy się zmieści? (FitCheck) BRD 0.1 — Część D3**

## **Rozdział 14: Rejestr Ryzyk Projektu (RYZ-01…RYZ-45)**

Każde ryzyko oceniane jest w skali 1–5 pod kątem Prawdopodobieństwa ($P$) i Skutku ($S$). Wskaźnik ryzyka $W = P \times S$. Wartości $W \ge 15$ stanowią ryzyka krytyczne wymagające bezwzględnych działań zapobiegawczych w architekturze.

---

### **14.1. Ryzyka Produktowe i Sklepowe (Apple App Store)**

| ID | Nazwa ryzyka | P | S | W | Działanie zapobiegawcze / Mitygacja |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RYZ-01** | Odrzucenie przez Apple z wytycznej 4.3(b) (Prosty kalkulator) | 3 | 5 | **15** | Budowa zaawansowanego modułu 3D SceneKit, bazy 60 aut, Szkoły Pakowania, modułu DMC oraz integracji z Apple Watch w wersji 1.0. |
| **RYZ-02** | Odrzucenie z wytycznej 5.2.1 (Znaki towarowe aut i marek meblowych) | 3 | 4 | **12** | Brak logotypów marek w grafice; w kodzie i bazie wyłącznie faktograficzne dane tekstowe w ramach prawa do uczciwego opisu (*fair use*). |
| **RYZ-03** | Reklamacja użytkownika za zarysowanie auta lub uszkodzenie mebla | 2 | 5 | **10** | Domyślny margines technologiczny $\epsilon = 15\text{ mm}$ + widoczny disclamer prawny w standardzie Apps4Brew (narzędzie wspomagające). |
| **RYZ-04** | Złe oceny w App Store z powodu trudnej obsługi widoku 3D przez seniorów | 3 | 4 | **12** | Oprócz podglądu 3D udostępnienie prostych rzutów płaskich 2D (z góry, od klapy) oraz dużych przycisków pomocniczych. |
| **RYZ-05** | Spadek konwersji przy braku tańszej subskrypcji tygodniowej | 2 | 3 | 6 | Zgodnie z filozofią Apps4Brew odrzucenie ciemnych wzorców tygodniowych; obrona uczciwą subskrypcją roczną z 14-dniowym darmowym okresem próbnym. |

---

### **14.2. Ryzyka Algorytmiczne i Geometryczne**

| ID | Nazwa ryzyka | P | S | W | Działanie zapobiegawcze / Mitygacja |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RYZ-11** | Niewykrycie kolizji przy skrajnym kącie klapy bagażnika | 2 | 5 | **10** | Dedykowane testy jednostkowe z wektorami skrajnymi (RD-05); funkcja obcinania Bounding Boxa z marginesem bezpieczeństwa. |
| **RYZ-12** | Przekroczenie limitu czasu obliczeń dla dużej liczby paczek ($N > 30$) | 2 | 4 | 8 | Algorytm heurystyczny Extreme Points z ograniczeniem czasu wykonywania (Time-budgeting) do maksymalnie $50\text{ ms}$; w razie potrzeby odcięcie gałęzi drzewa. |
| **RYZ-13** | Niezgodność wymiarów rzeczywistych auta po lifcie (zmiana wytłoczenia tapicerki) | 4 | 3 | **12** | Oznaczenie roku i generacji w bazie danych; możliwość ręcznej modyfikacji szerokości przez użytkownika ($\pm 5\text{ cm}$). |
| **RYZ-14** | Błędne upakowanie paczek kruchych pod ciężkimi kartonami | 1 | 5 | 5 | Rygorystyczny warunek w sortowaniu (RD-02) uniemożliwiający alokację paczki `fragile` jako podstawy podparcia. |
| **RYZ-15** | Błąd zaokrągleń w obliczeniach zmiennoprzecinkowych | 1 | 4 | 4 | Wewnętrzne obliczenia w milimetrach na liczbach całkowitych (Integer arithmetic), konwersja na cm wyłącznie w warstwie prezentacji. |

---

### **14.3. Ryzyka Prawne i Ruchu Drogowego**

| ID | Nazwa ryzyka | P | S | W | Działanie zapobiegawcze / Mitygacja |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RYZ-21** | Mandat kierowcy za przeładowanie samochodu (przekroczenie DMC) | 3 | 4 | **12** | Wyraźny wskaźnik masy i alarm czerwony przy przekroczeniu DMC (art. 61 ust. 1 PoRD); kalkulator z uwzględnieniem liczby pasażerów. |
| **RYZ-22** | Mandat za brak oznakowania wystającego ładunku powyżej 0,5 m | 2 | 3 | 6 | Automatyczny komunikat: *„Ładunek wystaje o 70 cm – wymagana czerwona chorągiewka (art. 61 ust. 6 pkt 2 PoRD)”*. |
| **RYZ-23** | Ryzyko roszczeń odszkodowawczych w jurysdykcji USA | 2 | 5 | **10** | Standardowa klauzula wyłączenia odpowiedzialności (Warranty & Liability Disclaimer) zatwierdzona w regulaminie EULA. |

---

### **14.4. Ryzyka Sprzętowe, Zegarkowe i Sensoryczne**

| ID | Nazwa ryzyka | P | S | W | Działanie zapobiegawcze / Mitygacja |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RYZ-31** | Zerwanie łączności WatchConnectivity podczas pakowania w podziemiu | 3 | 3 | 9 | Zegarek posiada kopię aktywnej sesji załadunku w lokalnym magazynie watchOS i działa w pełni autonomicznie bez telefonu. |
| **RYZ-32** | Niedokładność pomiaru ARKit na czarnym dywanie bagażnika | 4 | 3 | **12** | Opcja AR przesunięta do wersji 1.1; w MVP podstawą jest manualny formularz z suwakami i predefiniowana baza aut. |
| **RYZ-33** | Przegrzewanie urządzenia i drenaż baterii przy renderowaniu 3D | 2 | 3 | 6 | Użycie lekkich shaderów Metal bez cieni wolumetrycznych i wyłączanie pętli renderowania, gdy scena 3D jest statyczna. |

---

## **Rozdział 16: Rejestr Pytań Otwartych i Testów Laboratoryjnych**

* **OP-01 (Masa kierowcy w bazie aut):** Czy masa własna aut w bazie ma domyślnie zawierać kierowcę 75 kg (standard DIN/UE), czy masę suchą?  
  * *Rozstrzygnięcie badacza:* Masa wg normy UE z kierowcą 75 kg i bakiem 90%. Formularz dopytuje wyłącznie o dodatkowych pasażerów.
* **OP-02 (Tolerancja skosu kanapy):** Czy kąt pochylenia tylnej kanapy jest stały, czy regulowany?  
  * *Rozstrzygnięcie badacza:* W modelach z regulowanym oparciem (np. SUV-y) przyjmujemy pozycję najbardziej pionową (maksymalny załadunek).
* **OP-03 (Paczki zmontowane vs płaskie mebli IKEA):** Czy w wyszukiwarce katalogu podawać wymiary mebla złożonego, czy paczki kartonowej?  
  * *Rozstrzygnięcie badacza:* Użytkownik widzi nazwę i wymiary zmontowanego mebla, ale silnik kalkulatora operuje wyłącznie na wymiarach kartonów fabrycznych.
* **OP-04 (Maksymalna liczba paczek w algorytmie):** Jaki jest twardy limit paczek w symulacji mobilnej?  
  * *Rozstrzygnięcie techniczne:* Limit wynosi 40 paczek, co w zupełności wystarcza dla 99,8% przeprowadzek i pakowań aut osobowych.
