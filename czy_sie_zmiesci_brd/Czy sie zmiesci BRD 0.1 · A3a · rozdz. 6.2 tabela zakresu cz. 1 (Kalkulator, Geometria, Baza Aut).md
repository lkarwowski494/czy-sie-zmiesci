# **Czy się zmieści? (FitCheck) BRD 0.1 — Część A3a**

## **Rozdział 6.2: Tabela Zakresu Funkcjonalnego — Część 1 (Z-001…Z-080)**

Tabela definiuje granice funkcjonalne systemu w obszarach: modelowanie przestrzeni ładunkowej, baza pojazdów, parametry geometryczne oraz katalog ładunków.

### **Oznaczenia w tabeli:**
* **Priorytet:** **MUST** (krytyczne dla działania wariantu), **SHOULD** (istotna wartość dodana), **COULD** (funkcja pożądana, higiena UI).
* **Etap:** **MVP (1.0)**, **1.1**, **1.2**, **2.x**, **badanie** (R&D), **nigdy** (funkcje odrzucone z zasady ZP).

---

### **Tabela Zakresu: Przestrzenie Ładunkowe i Pojazdy (Z-001…Z-040)**

| ID | Moduł | Nazwa funkcji | Opis i zachowanie | Priorytet | Etap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Z-001** | Przestrzeń | Szybki prostopadłościan | Wprowadzenie $Dł \times Szer \times Wys$ bez definiowania pojazdu (kalkulator ad-hoc) | **MUST** | MVP |
| **Z-002** | Przestrzeń | 7-parametrowy model bagażnika | Modelowanie podłogi, dachu, zwężenia nadkoli, wysokości progu i skosu szyby | **MUST** | MVP |
| **Z-003** | Przestrzeń | Kąt pochylenia tylnej szyby | Uwzględnienie redukcji głębokości na wysokości powyżej linii rolety bagażnika | **MUST** | MVP |
| **Z-004** | Przestrzeń | Ograniczenie otworu załadunkowego | Weryfikacja światła otworu klapy ($W_{\text{aperture}} \times H_{\text{aperture}}$) jako bramki wejściowej | **MUST** | MVP |
| **Z-005** | Przestrzeń | Wysokość wewnętrznego progu | Modelowanie progu załadunkowego (uskok między zderzakiem a podłogą: $0–18\text{ cm}$) | **SHOULD** | MVP |
| **Z-006** | Przestrzeń | Przełącznik: Fotele rozłożone / złożone | Dynamiczna zmiana długości podłogi ($L_{\text{floor}}$ z $100\text{ cm}$ na $175\text{ cm}$) | **MUST** | MVP |
| **Z-007** | Przestrzeń | Dzielona kanapa 60/40 | Możliwość złożenia tylko lewej lub prawej części oparcia kanapy z zachowaniem 1-2 miejsc | **SHOULD** | 1.1 |
| **Z-008** | Przestrzeń | Położenie fotela pasażera z przodu | Zwiększenie długości w osi prawej strony do $260–280\text{ cm}$ na przedmioty długie | **SHOULD** | MVP |
| **Z-009** | Przestrzeń | Schowek pod podłogą bagażnika | Osobna podprzestrzeń na małe przedmioty (zamiast koła zapasowego lub wkładka styropianowa) | **COULD** | 1.1 |
| **Z-010** | Baza Aut | Predefiniowana baza 60 top modeli aut | Gotowe presety wymiarów najpopularniejszych aut w PL i UE (Skoda, VW, Toyota, Dacia, Ford) | **MUST** | MVP |
| **Z-011** | Baza Aut | Wyszukiwanie auta po marce i roczniku | Filtrowanie listy: Marka $\to$ Model $\to$ Generacja / Typ nadwozia (Kombi, Hatchback, SUV) | **MUST** | MVP |
| **Z-012** | Baza Aut | Zapisanie własnego auta jako domyślnego | Trwałe powiązanie profilu samochodu w SQLite, natychmiastowe ładowanie przy starcie | **MUST** | MVP |
| **Z-013** | Baza Aut | Obsługa wielu aut w garażu (PRO) | Możliwość przełączania między autem miejskim, kombi rodzinnym a busem | **MUST** | MVP (PRO) |
| **Z-014** | Baza Aut | Rozszerzenie bazy do 250 aut | Baza obejmująca modele niszowe, auta dostawcze (Kangoo, Berlingo, Transit) | **SHOULD** | 1.1 |
| **Z-015** | Baza Aut | Baza amerykańska (Pick-upy i duże SUV-y) | Ford F-150, Chevrolet Tahoe, Dodge Ram na rynek USA | **COULD** | 1.2 |
| **Z-016** | Baza Aut | Ręczna korekta wymiarów fabrycznych | Użytkownik może skorygować fabryczną szerokość o $\pm 2\text{ cm}$ po własnym pomiarze | **MUST** | MVP |
| **Z-017** | Przestrzeń | Boks dachowy (Trumna) | Definiowanie przestrzeni na dachu z uwzględnieniem aerodynamicznego profilu klina | **SHOULD** | MVP |
| **Z-018** | Przestrzeń | Przyczepka towarowa lekka | Wymiary typowych przyczepek lekkich ($205 \times 115 \times 35\text{ cm}$) | **SHOULD** | 1.1 |
| **Z-019** | Przestrzeń | Schowek / Bagażnik przedni (Frunk EV) | Profile przednich bagażników aut elektrycznych (Tesla Model 3/Y, Kia EV6) | **COULD** | 1.1 |
| **Z-020** | Przestrzeń | Winda osobowa w budynku | Predefiniowane wymiary wind starych (wielka płyta) i nowych (dźwig 8-osobowy) | **MUST** | MVP |
| **Z-021** | Przestrzeń | Drzwi i ościeżnice domowe | Weryfikacja przejścia przez światło ościeżnicy 70, 80, 90 cm z uwzględnieniem skrzydła | **MUST** | MVP |
| **Z-022** | Przestrzeń | Spocznik klatki schodowej | Sprawdzenie obrotu długich przedmiotów (blaty, rury, materace) | **SHOULD** | 1.2 |
| **Z-023** | Przestrzeń | Skrytki Paczkomatów (InPost) | Gabaryty A ($8\text{ cm}$), B ($19\text{ cm}$), C ($41\text{ cm}$) ze skrajnią bezpieczeństwa | **MUST** | MVP |
| **Z-024** | Przestrzeń | Automaty Orlen Paczka i DPD Pickup | Wymiary skrytek konkurencyjnych sieci kurierskich w Polsce | **MUST** | MVP |
| **Z-025** | Przestrzeń | Kosze bagażowe linii lotniczych | Wymiary sizerów: Ryanair, Wizz Air, LOT, Lufthansa, EasyJet | **MUST** | MVP |
| **Z-026** | Przestrzeń | Eksport profilu auta do pliku JSON | Zapisanie wymiarów własnego rzadkiego auta i przesłanie znajomemu | **SHOULD** | 1.1 |
| **Z-027** | Przestrzeń | Kopia zapasowa bazy przestrzeni w SQLite | Niezmienna trwałość lokalna, zero utraty danych po restarcie | **MUST** | MVP |
| **Z-028** | Przestrzeń | Skanowanie przestrzeni lidarem (ARKit) | Automatyczny obrys siatki bagażnika za pomocą czujnika LiDAR w iPhone Pro | **SHOULD** | 1.1 |
| **Z-029** | Przestrzeń | Skanowanie fotogrametryczne bez LiDAR | Tworzenie chmury punktów ze zwykłego aparatu | **NIGDY** | ZP-14 (niestabilne, błędy >15%) |
| **Z-030** | Przestrzeń | Wyświetlanie objętości w litrach (VDA) | Wyliczenie objętości geometrycznej oraz odpowiednika kostek ISO 3832 | **MUST** | MVP |

---

### **Tabela Zakresu: Katalog Przedmiotów i Mebli (Z-041…Z-080)**

| ID | Moduł | Nazwa funkcji | Opis i zachowanie | Priorytet | Etap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Z-041** | Ładunek | Szybkie dodanie prostopadłościanu | Formularz: Długość, Szerokość, Wysokość (cm), Waga (kg) | **MUST** | MVP |
| **Z-042** | Ładunek | Etykieta i kolor przedmiotu | Nadanie nazwy (np. „Walizka Kasi”) i wybór koloru z palety 8 kontrastowych barw | **MUST** | MVP |
| **Z-043** | Ładunek | Ograniczenie orientacji („Nie obracać”) | Wymuszenie pozycji pionowej (lodówki, telewizory, rośliny, chemia) | **MUST** | MVP |
| **Z-044** | Ładunek | Oznaczenie przedmiotu jako „Kruchy” (Fragile) | Algorytm zakazuje kładzenia innych przedmiotów na tej paczce ($P_{\text{max}} = 0$) | **MUST** | MVP |
| **Z-045** | Ładunek | Podatność na ściskanie (Torby miękkie) | Flaga pozwalająca na redukcję jednego z wymiarów o max 15% przy upakowaniu | **SHOULD** | MVP |
| **Z-046** | Ładunek | Katalog mebli: Szafy IKEA PAX | Baza paczek składowych popularnych szerokości (paczki $236\text{ cm}$, $201\text{ cm}$) | **MUST** | MVP |
| **Z-047** | Ładunek | Katalog mebli: Regały BILLY | Wymiary paczek regałów pojedynczych i podwójnych z nadstawkami | **MUST** | MVP |
| **Z-048** | Ładunek | Katalog mebli: Komody MALM | Płaskie paczki komód 3-, 4- i 6-szufladowych | **MUST** | MVP |
| **Z-049** | Ładunek | Katalog mebli: Sofy i narożniki modułowe | Rozbicie narożnika (np. FRIHETEN / KIVIK) na 3–4 paczki gabarytowe | **SHOULD** | MVP |
| **Z-050** | Ładunek | Katalog AGD: Pralki i suszarki standard | Wymiary nominalne $60 \times 60 \times 85\text{ cm}$ z uwzględnieniem kartonu i styropianu | **MUST** | MVP |
| **Z-051** | Ładunek | Katalog AGD: Lodówki wolnostojące | Wymiary typowe (wys. 160–200 cm) z blokadą pozycji leżącej (ochrona sprężarki) | **MUST** | MVP |
| **Z-052** | Ładunek | Katalog AGD: Zmywarki 45 cm i 60 cm | Wymiary w kartonie fabrycznym | **MUST** | MVP |
| **Z-053** | Ładunek | Katalog RTV: Telewizory w kartonie (55"–75") | Cienkie, wysokie pudła z bezwzględnym zakazem kładzenia na płasko | **MUST** | MVP |
| **Z-054** | Ładunek | Standardowe walizki lotnicze (S, M, L) | Presety walizek: Kabinowa (55 cm), Średnia (68 cm), Duża (78 cm) z kołami | **MUST** | MVP |
| **Z-055** | Ładunek | Wózki dziecięce (Gondola / Spacerówka) | Wymiary po złożeniu stelaża + osobna gondola | **SHOULD** | MVP |
| **Z-056** | Ładunek | Rowery po demontażu przedniego koła | Uproszczony obrys roweru szosowego / MTB do przewozu w kabinie | **COULD** | 1.1 |
| **Z-057** | Ładunek | Opony samochodowe (kpl. 4 szt.) | Rozmiary popularne (195/65R15, 205/55R16, 225/45R17) pakowane w słupki | **SHOULD** | MVP |
| **Z-058** | Ładunek | Materiały budowlane w workach (25 kg) | Cement, klej do płytek, gips – wymiary spłaszczonego worka | **MUST** | MVP |
| **Z-059** | Ładunek | Płyty gipsowe i OSB (120x260 cm) | Weryfikacja przewozu płyt wielkoformatowych z ostrzeżeniem o wystawaniu | **SHOULD** | 1.1 |
| **Z-060** | Ładunek | Zapisywanie własnych zestawów ładunku | Możliwość zapisania szablonu „Wakacje lato”, „Opony zima”, „Sprzęt biwak” | **SHOULD** | MVP |
| **Z-061** | Ładunek | Skanowanie kodu kreskowego EAN mebla | Wyszukanie wymiarów paczki z lokalnej bazy na podstawie kodu kreskowego | **COULD** | 1.2 |
| **Z-062** | Ładunek | Generowanie ładunków przez AI (Vision) | Rozpoznawanie wymiarów mebla ze zdjęcia aparatu | **NIGDY** | ZP-05 (błędy perspektywy) |
