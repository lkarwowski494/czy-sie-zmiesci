# **Czy się zmieści? (FitCheck) BRD 0.1 — Część A3b**

## **Rozdział 6.2: Tabela Zakresu Funkcjonalnego — Część 2 (Z-081…Z-190)**

Tabela definiuje granice funkcjonalne systemu w obszarach: silnik kombinatoryczny 3D, kontrola masy i bezpieczeństwa, wizualizacja graficzna, obsługa zegarka Apple Watch, integracja systemowa iOS, a także moduły przeprowadzek, wymiarowania lokali, wnęk ściennych, garaży i sprzętu specjalistycznego.

---

### **Tabela Zakresu: Silnik 3D, Masa i Wizualizacja (Z-081…Z-120)**

| ID | Moduł | Nazwa funkcji | Opis i zachowanie | Priorytet | Etap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Z-081** | Algorytm 3D | Deterministyczny solver Extreme Points | Algorytm wyznaczający punkty wstawienia paczek w trójwymiarowej siatce współrzędnych | **MUST** | MVP |
| **Z-082** | Algorytm 3D | Sortowanie wstępne Best-Fit Decreasing | Wkładanie w pierwszej kolejności paczek o największej objętości lub masie | **MUST** | MVP |
| **Z-083** | Algorytm 3D | Automatyczne testowanie 6 orientacji | Sprawdzanie obrotów w osiach XYZ dla paczek bez restrykcji pionu | **MUST** | MVP |
| **Z-084** | Algorytm 3D | Zasada ciężkich na dno (Fizyka ładunku) | Wymuszenie umieszczania przedmiotów o największej gęstości/masie bezpośrednio na podłodze | **MUST** | MVP |
| **Z-085** | Algorytm 3D | Obsługa strefy skosu tylnej szyby | Odrzucanie punktów wstawienia kolidujących ze skośną płaszczyzną klapy | **MUST** | MVP |
| **Z-086** | Algorytm 3D | Strefa zwężenia nadkoli | Zezwalanie na szerokie przedmioty tylko przed lub za nadkolami | **MUST** | MVP |
| **Z-087** | Algorytm 3D | Bufor luzu technologicznego ($\epsilon = 15\text{ mm}$) | Automatyczne dodawanie $15\text{ mm}$ do każdego wymiaru paczki na swobodę manewru | **MUST** | MVP |
| **Z-088** | Algorytm 3D | Wykrywanie przedmiotów niemieszczących się | Precyzyjne wskazanie, która paczka z listy nie weszła i dlaczego (wymiar vs waga) | **MUST** | MVP |
| **Z-089** | Algorytm 3D | Generowanie kolejności załadunku | Ustalenie kolejności wkładania (od ściany kanapy do progu klapy) | **MUST** | MVP |
| **Z-090** | Masa i DMC | Sumator masy ładunku | Ciągłe sumowanie masy wszystkich dodanych przedmiotów w czasie rzeczywistym | **MUST** | MVP |
| **Z-091** | Masa i DMC | Ostrzeżenie o przekroczeniu ładowności | Wyświetlenie bursztynowego/czerwonego paska stanu przy zbliżaniu się do limitu ładowności | **MUST** | MVP |
| **Z-092** | Masa i DMC | Odliczenie masy pasażerów | Formularz: liczba pasażerów w kabinie $\times$ średnia waga ($75\text{ kg}$) | **MUST** | MVP |
| **Z-093** | Masa i DMC | Wyliczenie środka ciężkości (CoG) | Wskaźnik, czy środek ciężkości ładunku nie znajduje się zbyt daleko za tylną osią | **SHOULD** | MVP |
| **Z-094** | Masa i DMC | Ostrzeżenie o widoczności w lusterkach | Informacja o przekroczeniu linii dolnej krawędzi szyb i zasłonięciu lusterka wstecznego | **MUST** | MVP |
| **Z-095** | Wizualizacja | Interaktywny podgląd 3D (SceneKit/Metal) | Pełny obrót sceny palcem (360°), przybliżanie (pinch-to-zoom) i pochylanie | **MUST** | MVP |
| **Z-096** | Wizualizacja | Rzut ortogonalny z góry (Top-Down 2D) | Przełączenie na czysty techniczny rzut z góry z wymiarami pozostałych szczelin | **MUST** | MVP |
| **Z-097** | Wizualizacja | Rzut od strony klapy (Rear View 2D) | Przekrój poprzeczny pokazujący poziom załadunku względem linii szyb i sufitu | **MUST** | MVP |
| **Z-098** | Wizualizacja | Tryb rentgenowski (X-Ray / Przezroczystość) | Suwak przezroczystości bryły samochodu i zewnętrznych paczek | **SHOULD** | MVP |
| **Z-099** | Wizualizacja | Animacja krok-po-kroku (Kreator pakowania) | Suwak lub przyciski „Krok dalej / Wstecz” animujące wkładanie paczek jedna po drugiej | **MUST** | MVP |
| **Z-100** | Wizualizacja | Kolorystyczne kodowanie statusu | Kolor zielony (zmieści się idealnie), żółty (na styk < 2 cm), czerwony (kolizja) | **MUST** | MVP |

---

### **Tabela Zakresu: Apple Watch, Platforma i Eksport (Z-121…Z-160)**

| ID | Moduł | Nazwa funkcji | Opis i zachowanie | Priorytet | Etap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Z-121** | Apple Watch | Samodzielna aplikacja watchOS 11 | Aplikacja działająca na nadgarstku, synchronizowana lokalnie z iPhone | **MUST** | MVP |
| **Z-122** | Apple Watch | Lista kontrolna załadunku (Checklist) | Wyświetlanie listy przedmiotów posortowanych wg optymalnej kolejności wkładania | **MUST** | MVP |
| **Z-123** | Apple Watch | Odhaczanie załadunku (Haptic Feedback) | Stuknięcie w ekran lub obrót Digital Crown oznacza paczkę jako „Załadowana” | **MUST** | MVP |
| **Z-124** | Apple Watch | Widżet Smart Stack na zegarku | Widżet pokazujący: *„Załadowano 3 z 5 paczek (pozostało: Wózek)”* | **SHOULD** | MVP |
| **Z-125** | System | Interaktywny widżet ekranu blokady iOS 18 | Szybki podgląd wolnej przestrzeni wybranego auta bezpośrednio z Lock Screen | **SHOULD** | MVP |
| **Z-126** | System | Control Center Controls (iOS 18) | Dedykowany kafelek w Centrum Sterowania do natychmiastowego otwarcia miarki | **SHOULD** | MVP |
| **Z-127** | System | Live Activities / Dynamic Island | Pasek postępu załadunku wyświetlany na Dynamic Island podczas pakowania auta | **COULD** | 1.1 |
| **Z-128** | Eksport | Eksport planu do pojedynczego obrazu PNG | Wygenerowanie estetycznej infografiki z rzutem 3D, wymiarami i listą paczek | **MUST** | MVP |
| **Z-129** | Eksport | Eksport szczegółowego raportu do PDF | Raport techniczny z rzutami, masami i ostrzeżeniami prawnymi (np. dla ubezpieczyciela) | **SHOULD** | 1.1 |
| **Z-130** | Eksport | Udostępnienie planu przez systemowy Share Sheet | Wysyłka planu załadunku przez Wiadomości, WhatsApp, AirDrop, Drukuj | **MUST** | MVP |
| **Z-131** | Kopia | Eksport całej bazy SQLite do pliku JSON | Kopia bezpieczeństwa aut, przestrzeni i ładunków w standardzie Apps4Brew (0 zł) | **MUST** | MVP |
| **Z-132** | Kopia | Import i transakcyjne przywrócenie bazy z JSON | Odtworzenie stanu aplikacji po reinstalacji lub zmianie telefonu | **MUST** | MVP |
| **Z-133** | Płatności | Obsługa StoreKit 2 (In-App Purchases) | Natywne zakupy w aplikacji: Subskrypcja miesięczna, roczna z 14-dniowym trialem | **MUST** | MVP |
| **Z-134** | Płatności | Zakup dożywotni (Non-Consumable Lifetime) | Jednorazowa opłata odblokowująca wszystkie funkcje na zawsze | **MUST** | MVP |
| **Z-135** | Płatności | Obsługa Apple Family Sharing | Automatyczne udostępnienie licencji PRO członkom Chmury Rodzinnej | **MUST** | MVP |
| **Z-136** | Dostępność | Pełne udźwiękowienie VoiceOver | Odczytywanie wymiarów, ostrzeżeń kolizyjnych i instrukcji krok-po-kroku | **MUST** | MVP |
| **Z-137** | Dostępność | Wsparcie dla Dynamic Type | Prawidłowe skalowanie fontów do rozmiarów XXL dla osób słabowidzących | **MUST** | MVP |
| **Z-138** | Dostępność | Tryb wysokiego kontrastu (High Contrast UI) | Podbicie krawędzi modeli 3D i obrysów dla pracy w pełnym słońcu | **MUST** | MVP |
| **Z-139** | Języki | Lokalizacja w 35 językach | Pełny słownik pojęć motoryzacyjnych i wymiarowych w 35 językach App Store | **MUST** | MVP |
| **Z-140** | Języki | Obsługa jednostek metrycznych i imperialnych | Przełącznik cm / mm / kg $\leftrightarrow$ cale / stopy / funty (rynek US/UK) | **MUST** | MVP |

---

### **Tabela Zakresu: Przeprowadzki, Lokale, Garaże i Sprzęt Specjalistyczny (Z-161…Z-190)**

| ID | Moduł | Nazwa funkcji | Opis i zachowanie | Priorytet | Etap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Z-161** | Przeprowadzki | Inwentaryzacja mebli lokalu per pokój | Tworzenie listy mienia z grupowaniem na Salon, Kuchnię, Sypialnię i szacunkiem masy | **MUST** | MVP |
| **Z-162** | Przeprowadzki | Szacowanie kubatury z powierzchni $m^2$ | Przelicznik $m^2 \rightarrow m^3$ na podstawie stopnia zagracenia lokalu i liczby mieszkańców | **SHOULD** | MVP |
| **Z-163** | Przeprowadzki | Dobór pojazdu dostawczego kat. B | Rekomendacja vana (L1H1, L2H2, L3H2, L4H3, kontener z windą) do objętości i masy mienia | **MUST** | MVP |
| **Z-164** | Przeprowadzki | Porównanie kursów osobówką vs van | Rachunek ekonomiczny: paliwo i czas dla $N$ kursów kombi vs wynajem busa | **SHOULD** | 1.1 |
| **Z-165** | Przeprowadzki | Sekwencja załadunku busa (Zasada 4 Fazy) | Podział ładunku na: gródź (AGD), podstawa (meble), wypełnienia, próg (Karton 1. Nocy) | **MUST** | MVP |
| **Z-166** | Przeprowadzki | Boks Self-Storage ze ścieżką inspekcyjną | Dobór metrażu boksu z zachowaniem korytarza pieszego o szerokości 50 cm | **SHOULD** | MVP |
| **Z-167** | Lokal / Wnęki | Weryfikacja przejścia przez ościeżnicę drzwi | Efektywne światło drzwi z uwzględnieniem klamki i kąta otwarcia skrzydła (90° vs 180°) | **MUST** | MVP |
| **Z-168** | Lokal / Wnęki | Symulator wnoszenia po schodach (Moving Sofa) | Geometryczna weryfikacja obrotu mebla na spoczniku w kształcie litery L i U w 3D | **MUST** | MVP |
| **Z-169** | Lokal / Wnęki | Wymiarowanie kabiny i drzwi windy | Obliczenie przestrzennej przekątnej windy $\sqrt{D^2+S^2+W^2}$ dla blatów i profili | **MUST** | MVP |
| **Z-170** | Lokal / Wnęki | Wnęka ścienna z odliczeniem listew | Domyślne odejmowanie $40\,\text{mm}$ na listwy przypodłogowe przy posadzce | **MUST** | MVP |
| **Z-171** | Lokal / Wnęki | Detekcja kolizji z grzejnikami i parapetami | Wykrywanie odstających elementów instalacji ściennej w strefie montażu mebla | **SHOULD** | MVP |
| **Z-172** | Lokal / Wnęki | Ergonomiczne strefy otwarcia mebli | Modelowanie wolnej strefy: 70 cm dla drzwi szafy, 90 cm dla szuflad komody | **MUST** | MVP |
| **Z-173** | AGD / Kuchnia | Dylatacja wentylacyjna lodówki wolnostojącej | Wymóg min. 5 cm wolnej przestrzeni z tyłu dla skraplacza i 2 cm po bokach | **MUST** | MVP |
| **Z-174** | AGD / Kuchnia | Weryfikacja kąta otwarcia drzwi chłodziarki | Sprawdzanie, czy kąt otwarcia $\ge 115^\circ$ pozwala wysunąć szuflady zamrażarki | **MUST** | MVP |
| **Z-175** | AGD / Łazienka | Głębokość montażowa pralki z przyłączami | Dodawanie naddatku instalacyjnego $+80\,\text{mm}$ do katalogowej głębokości korpusu | **MUST** | MVP |
| **Z-176** | Lokal / Wnęki | Pasowanie mebli pod skosami poddasza | Obliczenie linii wysokości 140 cm i 190 cm w zależności od ścianki kolankowej i kąta | **SHOULD** | 1.1 |
| **Z-177** | AGD / Kuchnia | Strefa opuszczenia klapy zmywarki/piekarnika | Weryfikacja odległości naprzeciwległych mebli min. 105 cm na opuszczenie frontu i stanięcie | **SHOULD** | 1.1 |
| **Z-178** | Garaż / Skrajnie | Szerokość auta z lusterkami vs brama garażu | Baza szerokości pojazdów z rozłożonymi i złożonymi lusterkami bocznymi | **MUST** | MVP |
| **Z-179** | Garaż / Skrajnie | Strefa wysiadania kierowcy w garażu | Sprawdzanie min. 65 cm wolnej przestrzeni od słupa do uchylenia drzwi kierowcy | **MUST** | MVP |
| **Z-180** | Garaż / Skrajnie | Kolizja otwartej klapy bagażnika z sufitem | Porównanie punktu szczytowego otwartej klapy SUV-a z prowadnicami bramy segmentowej | **MUST** | MVP |
| **Z-181** | Garaż / Skrajnie | Sumator wysokości z boxem dachowym | Sprawdzanie dopuszczenia wjazdu do parkingów podziemnych (1.9 m, 2.0 m, 2.1 m) | **MUST** | MVP |
| **Z-182** | Haki / Rowery | Kontrola nacisku pionowego kuli haka (S) | Sumowanie masy platformy i rowerów elektrycznych z alarmem przeciążenia kuli haka | **MUST** | MVP |
| **Z-183** | Prawo drogowe | Weryfikacja zwisu ładunku poza obrys auta | Kontrola limitów art. 61 ust. 6 PoRD (0.5 m z przodu, 2 m z tyłu) z wymogiem chorągiewki | **SHOULD** | MVP |
| **Z-184** | Zwierzęta | Dopasowanie klatki kennelowej do skosu szyby | Weryfikacja styku skośnych ścian aluminiowej klatki dla psa z szybą klapy bagażnika | **SHOULD** | MVP |
| **Z-185** | Budowlane | Ochrona podwójnej podłogi bagażnika | Ostrzeżenie przed przekroczeniem nośności punktowej (max 120-150 kg) przy płytkach i cemencie | **MUST** | MVP |
| **Z-186** | Eksport | Raport planu przeprowadzki do druku PDF | Generowanie kart opisowych na kartony i meble z podziałem na pokoje | **SHOULD** | 1.1 |
| **Z-187** | Garaż / Skrajnie | Kontrola limitu nośności belek i relingów | Bilans masy belek, boxa i bagażu względem fabrycznej nośności dachu (50/75/100 kg) | **MUST** | MVP |
| **Z-188** | BHP | Limit obciążenia ręcznego zespołu tragarzy | Kontrola normy BHP (max 50 kg/os.) przy znoszeniu ciężkich monolitów (pianino, sejf) | **MUST** | MVP |
| **Z-189** | AGD | Timer odstania oleju w sprężarce lodówki | Obowiązkowe odliczenie 12h po transporcie chłodziarki na płasko przed podłączeniem | **SHOULD** | MVP |
| **Z-190** | Ergonomia | Bufor dłoni tragarzy w przewężeniach | Wymóg min. 50 mm wolnego luzu z każdej strony mebla w drzwiach i na schodach | **MUST** | MVP |
