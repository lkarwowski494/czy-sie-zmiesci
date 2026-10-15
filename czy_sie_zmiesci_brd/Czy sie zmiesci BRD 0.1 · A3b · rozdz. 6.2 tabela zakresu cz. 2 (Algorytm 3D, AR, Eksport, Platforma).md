# **Czy się zmieści? (FitCheck) BRD 0.1 — Część A3b**

## **Rozdział 6.2: Tabela Zakresu Funkcjonalnego — Część 2 (Z-081…Z-160)**

Tabela definiuje granice funkcjonalne systemu w obszarach: silnik kombinatoryczny 3D, kontrola masy i bezpieczeństwa, wizualizacja graficzna, obsługa zegarka Apple Watch, widżety oraz integracja systemowa iOS.

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
