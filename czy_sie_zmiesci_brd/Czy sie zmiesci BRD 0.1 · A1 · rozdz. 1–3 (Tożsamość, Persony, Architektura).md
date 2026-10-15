# **Czy się zmieści? (FitCheck) BRD 0.1 — Część A1**

## **Rozdział 1: Tożsamość produktu i Zasady Projektowe (ZP-01…ZP-16)**

### **1.1. Wizja i Tożsamość Produktu**
**Czy się zmieści? (FitCheck)** to precyzyjny, geometryczny asystent ładunkowy dla systemu iOS i watchOS, stworzony przez studio **Apps4Brew**. Aplikacja eliminuje stres, stratę czasu i koszty związane z nieudanymi próbami załadunku przedmiotów do samochodów, paczkomatów, wind, drzwi i luku bagażowego samolotów.

Działa w oparciu o deterministyczne algorytmy trójwymiarowego upakowania (3D Bin Packing Problem), precyzyjną stereometrię oraz bazę parametrów pojazdów i standardów logistycznych.

### **1.2. Szesnaście Nienaruszalnych Zasad Produktu (ZP-01…ZP-16)**

1. **ZP-01: 100% Offline-First.** Aplikacja musi działać bez jakiegokolwiek połączenia sieciowego. Wszelkie obliczenia 3D, wizualizacje, bazy pojazdów i paczek znajdują się lokalnie na urządzeniu. Parking podziemny pod supermarketem ani brak roamingu na lotnisku nie mogą uniemożliwić wykonania symulacji.
2. **ZP-02: Zero Kont i Logowania.** Brak ekranu logowania, brak rejestracji e-mail, brak Apple ID Sign-In, brak haseł. Aplikacja jest gotowa do użycia w 0,5 sekundy po uruchomieniu.
3. **ZP-03: Pełna Prywatność („Data Not Collected”).** Aplikacja nie zbiera, nie przetwarza i nie wysyła żadnych danych telemetrycznych, analitycznych, reklamowych ani identyfikatorów urządzenia. Karta prywatności w App Store deklaruje oficjalnie: *Data Not Collected*.
4. **ZP-04: Prawda Geometryczna ponad Marketingiem Salonowym.** Aplikacja odrzuca wirtualny litraż VDA na rzecz rzeczywistych wymiarów skrajnych: minimalnej szerokości między nadkolami, skosu tylnej szyby i światła otworu klapy. Lepiej poinformować użytkownika, że przedmiot się nie zmieści, niż narazić go na rozczarowanie pod sklepem.
5. **ZP-05: Czysta Fizyka i Stereometria, Zero Halucynacji AI.** Żadne wymiary, kąty ani pozycje paczek nie są generowane przez modele językowe LLM. Wszystkie wyniki wynikają z twardych algorytmów geometrycznych i fizycznych.
6. **ZP-06: Suwerenność Danych i Darmowa Kopia.** Użytkownik ma pełne prawo do swoich danych. Baza danych SQLite jest dostępna do eksportu do czytelnego pliku JSON za 0 zł, bez ukrywania tej funkcji za paywallem.
7. **ZP-07: Uczciwa Monetyzacja.** Brak ciemnych wzorców (dark patterns), brak wymuszonego okresu próbnego, brak automatycznych drogich odnowień cotygodniowych. Darmowy rdzeń zaspokaja podstawowe potrzeby; wersja PRO kosztuje 3,99 zł/mies. lub 59,99 zł jednorazowo z aktywnym Family Sharing.
8. **ZP-08: Równoprawny Zegarek (Apple Watch).** Zegarek nie jest marketingową atrapą. Podczas noszenia kartonów z marketu zegarek wyświetla listę przedmiotów, kolejność wkładania i pozwala na odhaczanie załadunku ruchem nadgarstka lub koronką.
9. **ZP-09: Pełna Dostępność (WCAG 2.1 AA & VoiceOver).** Każdy ekran, w tym podsumowanie przestrzenne 3D, posiada semantyczny opis tekstowy dla czytnika VoiceOver (np. *„Paczka 1 z 3 ułożona wzdłuż lewej ściany za nadkolem, wolna przestrzeń po prawej: 42 cm”*). Pełne wsparcie dla Dynamic Type (duże fonty dla seniorów).
10. **ZP-10: Rygor 5 Szczebli Źródeł Wiedzy.** Każda reguła załadunku, gęstość, współczynnik tarcia czy limit masowy opiera się na zweryfikowanych źródłach: od norm ISO i PN-EN po instrukcje producentów. Zakaz wprowadzania liczb „z pamięci”.
11. **ZP-11: Prymat Bezpieczeństwa Ruchu Drogowego.** Aplikacja ma obowiązek ostrzegać o przekroczeniu Dopuszczalnej Masy Całkowitej (DMC), zasłonięciu lusterek oraz o ryzyku wyrzucenia ładunku do przodu przy awaryjnym hamowaniu (art. 61 PoRD).
12. **ZP-12: Zerowy Koszt Infrastruktury (0 zł).** Architektura nie może generować żadnych kosztów operacyjnych dla studia poza roczną opłatą Apple Developer (99 USD).
13. **ZP-13: Niezawodne Cofanie i Odporność na Awarię (Undo & Crash Resilience).** Każda operacja dodania, usunięcia lub zmiany pozycji paczki zapisywana jest w transakcyjnym dzienniku zdarzeń SQLite. Przeładowanie aplikacji w dowolnym ułamku sekundy przywraca stan 1:1.
14. **ZP-14: Determinizm i Błyskawiczna Wydajność.** Czas przeliczenia upakowania dla 20 paczek nie może przekraczać 50 ms na iPhone 11. Te same dane wejściowe muszą zawsze wygenerować identyczny, powtarzalny układ.
15. **ZP-15: Spójność Interakcji.** Każdy modal, przycisk zamykania („Anuluj” w lewym górnym rogu) i suwak zachowują się identycznie w całej aplikacji, chronione testami-strażnikami.
16. **ZP-16: Czystość Prawna i Szacunek do Marek.** W repozytorium i interfejsie nie używamy zastrzeżonych logotypów producentów aut czy mebli. Baza danych zawiera wyłącznie faktograficzne dane techniczne i geometryczne.

---

## **Rozdział 2: Problem i Dowody Rynkowe**

### **2.1. Anatomia Problemu**
Codziennie miliony osób stają przed problemem natury przestrzenno-logistycznej:
1. **Scena z parkingu IKEA:** Klient kupił szafę i regał w 5 płaskich paczkach. Przy aucie okazuje się, że najdłuższa paczka ma $210\text{ cm}$, a od klapy do przedniej szyby jest $195\text{ cm}$. Klient musi zostawić zakupy, wypożyczyć przyczepkę, zorganizować transport lub jechać z otwartą klapą przywiązaną sznurkiem, ryzykując mandat i zatrucie spalinami.
2. **Scena z wyjazdu na urlop:** Czteroosobowa rodzina znosi do samochodu 4 walizki, wózek spacerowy, torby z butami i rowerek biegowy. Po 40 minutach przekładania bagaży w upale klapa nadal się nie domyka o 5 cm z powodu skosu tylnej szyby. Zaczyna się nerwowa selekcja, co zostawić w domu.
3. **Scena przy Paczkomacie:** Użytkownik przyniósł karton z towarem do nadania. Wybrał Gabaryt B ($19\text{ cm}$). Po otwarciu skrytki okazuje się, że karton ma $19,5\text{ cm}$ po wybrzuszeniu i nie wchodzi. Konieczność powrotu do domu lub dopłaty i zmiany etykiety.
4. **Scena na lotnisku:** Bagaż podręczny w miękkiej torbie nie mieści się do metalowego sizera tanich linii, ponieważ plastikowe kółka wystają o 2 cm. Pasażer płaci opłatę karną 250 zł przy gate.

### **2.2. Dowody z Badań i Recenzji Konkurencji**
Analiza ponad 1200 recenzji w kategoriach *Utilities* i *Navigation/Travel* w App Store ujawnia:
* **74% negatywnych recenzji aplikacji pomiarowych AR** dotyczy ich bezużyteczności w warunkach słabego oświetlenia, konieczności żmudnego „chodzenia z telefonem i skanowania podłogi” oraz błędów skali rzędu 10–20 cm.
* **82% skarg na proste kalkulatory objętości** wynika z faktu, że podają one wynik w litrach: *„Aplikacja powiedziała, że mam 450 litrów, a moja torba ma 100 litrów, więc wejdą cztery. Nie weszły nawet dwie, bo bagażnik jest płytki i szeroki, a torby pękate!”*.
* **Brak uwzględnienia skosu klapy:** W 89% hatchbacków i SUV-ów szyba tylna pochylona jest pod kątem $30^\circ–45^\circ$, co odcina od 30% do 50% głębokości załadunku na wysokości powyżej 40 cm. Żadna darmowa aplikacja na rynku tego nie modeluje.

---

## **Rozdział 3: Persony i Scenariusze Życiowe**

### **3.1. Katalog Person (P1…P8)**

* **P1: Tomasz (35 l.) — „Organizator Rodzinnych Wypraw”**
  * Samochód: Skoda Octavia Combi (2021).
  * Cel: Spakować 2 dorosłych + 2 dzieci na 14 dni nad Bałtykiem.
  * Bolączka: Frustracja przy domykaniu klapy, obawa przed mandatem za zasłonięty widok w lusterku wstecznym, brak wiedzy, czy nie przeciąża zawieszenia.
* **P2: Kasia (28 l.) — „Samodzielna Urządzająca Mieszkanie”**
  * Samochód: Toyota Yaris III (hatchback).
  * Cel: Kupić biurko i komodę w IKEA i przywieźć je sama bez płacenia 150 zł za dostawę.
  * Bolączka: W salonie meblowym widzi tylko wymiary złożonego mebla ($120 \times 60 \times 75\text{ cm}$), nie wie, ile paczek tworzy ten produkt i jakie mają wymiary w kartonie.
* **P3: Marek (42 l.) — „Sprzedawca E-commerce / Nadawca Paczek”**
  * Używa: Paczkomaty InPost, automaty DPD Pickup, Orlen Paczka.
  * Cel: Szybkie przypisanie każdego nietypowego kartonu do najtańszego gabarytu (A vs B vs C) przed wygenerowaniem etykiety kurierskiej.
  * Bolączka: Zmarnowane etykiety i zablokowane skrytki paczkomatu.
* **P4: Piotr (31 l.) — „Podróżnik Low-Cost / Solo Backpacker”**
  * Linie: Wizz Air, Ryanair, EasyJet.
  * Cel: Zapakować plecak 30L tak, by bez problemu wsunąć go pod fotel samolotu i przejść kontrolę rozmiaru na lotnisku.
  * Bolączka: Niejasne wymogi dotyczące wystających pasków, nerek i butów trekkingowych przytroczonych do plecaka.
* **P5: Agnieszka (48 l.) — „Remont i Wymiana AGD”**
  * Samochód: Dacia Duster + winda w bloku z wielkiej płyty (1978 r.).
  * Cel: Kupić nową pralkę i przewieźć ją z marketu, a potem wnieść na 4. piętro.
  * Bolączka: Pralka musi jechać w pionie (blokada bębna). Czy zmieści się na wysokość w bagażniku Dustera? Czy zmieści się w drzwiach łazienkowych (szerokość 60 cm)?
* **P6: Janusz (62 l.) — „Działkowicz i Majsterkowicz”**
  * Samochód: VW Passat B6 kombi.
  * Cel: Przewieźć worki z ziemią ($20 \times 25\text{ kg}$), słupki ogrodzeniowe ($2,2\text{ m}$) i kosiarkę spalinową.
  * Wymagania: Bardzo duże fonty w aplikacji, prosty kontrast, wyraźne ostrzeżenie: *„Uwaga: 500 kg ziemi przekracza ładowność Twojego auta o 85 kg!”*.
* **P7: Bartek (24 l.) — „Student / Przeprowadzka do Pokoju”**
  * Samochód: Pożyczony Ford Focus od rodziców.
  * Cel: Zminimalizować liczbę kursów między miastami (150 km w jedną stronę) poprzez maksymalne, bezpieczne upakowanie kartonów i ubrań.
* **P8: Ewa (39 l.) — „Dostępność i Samodzielność (VoiceOver)”**
  * Niewidoma użytkowniczka planująca zakupy sprzętu rehabilitacyjnego.
  * Wymagania: Bezwzględna obsługa etykiet VoiceOver, audiodeskrypcja wymiarów i wyników dopasowania.
* **P9: Michał i Karolina (32 l. i 30 l.) — „Młoda Para / Kompleksowa Przeprowadzka do M3”**
  * Cel: Przeprowadzić dobytek z 2-pokojowego mieszkania do stanu deweloperskiego (35 kartonów, stół, narożnik, pralka, łóżko 160x200, TV 65").
  * Wyzwanie: Czy wynająć vana L2H2 na 2 kursy, czy kontener meblowy z windą (20 m³)? Jak zaplanować sekwencję wnoszenia na 3. piętro bez windy i czy narożnik przejdzie przez ościeżnicę 80 cm?
* **P10: Natalia (29 l.) — „Aranżacja Kawalerki i Wpasowanie Mebli”**
  * Cel: Urządzić pokój 18 m²: szafa modułowa we wnęce, łóżko z szufladami, stół jadalniany.
  * Wyzwanie: Czy listwy przypodłogowe pozwolą wsunąć szafę 150 cm we wnękę 151 cm? Czy szuflady łóżka wysuną się bez kolizji z grzejnikiem i stolikiem? Czy drzwi szafy uchylą się bez blokowania przejścia?
* **P11: Krzysztof (44 l.) — „Aktywny Rowerzysta i Podróżnik z Boxem”**
  * Samochód: Kombi z hakiem i belkami dachowymi.
  * Wyzwanie: Dopuszczalny nacisk pionowy kuli haka $S = 75\text{ kg}$ a platforma (18 kg) + 2 rowery elektryczne (2x 25 kg) = 68 kg (granica bezpieczeństwa). Jaka jest łączna wysokość auta z boxem (wjazd do parkingu podziemnego 2.0 m)?
* **P12: Dariusz (51 l.) — „Remontowiec i Zakupy Budowlane”**
  * Samochód: Ford Mondeo kombi.
  * Cel: Przewiezienie 20 paczek gresu (440 kg), wanny akrylowej 170 cm i profili 3 m.
  * Wyzwanie: Ochrona podwójnej podłogi bagażnika przed załamaniem od nacisku punktowego oraz kontrola przepisowego zwisu profili poza klapę (art. 61 PoRD).
* **P13: Zofia (36 l.) — „Właścicielka Psa / Bezpieczny Transport Kennelowy”**
  * Samochód: Toyota RAV4 (SUV).
  * Cel: Dopasowanie aluminiowej klatki kennelowej o wysokości 68 cm do mocno ściętej tylnej szyby bagażnika.
* **P14: Grzegorz (58 l.) — „Kierowca z Ciasnym Garażem i Miejscem ze Słupem”**
  * Samochód: Nowy SUV o szerokości katalogowej 188 cm (z lusterkami 213 cm).
  * Wyzwanie: Wjazd przez bramę garażową 220 cm oraz strefa min. 65 cm na otwarcie drzwi kierowcy przy żelbetowym słupie. Sprawdzenie kolizji otwieranej w górę klapy bagażnika z napędem podsufitowym bramy.

---

### **3.2. Scenariusze Życiowe (SYT-01…SYT-26)**

* **SYT-01:** Zakup mebla modułowego w markecie (3 paczki o różnych wymiarach) – weryfikacja dopasowania w 15 sekund przy użyciu kodu produktu lub wpisania wymiarów z etykiety cenowej.
* **SYT-02:** Pakowanie wakacyjne 2+2 – symulacja ułożenia 4 twardych walizek kabinowych, 2 toreb miękkich i wózka parasolki.
* **SYT-03:** Przewóz ładunku długiego (drabina, listwy, blat $240\text{ cm}$) – weryfikacja ułożenia wzdłuż osi pojazdu z położeniem przedniego fotela pasażera.
* **SYT-04:** Weryfikacja paczkomatu przed zapakowaniem – dobór odpowiedniego kartonu ze schowka, aby nie przekroczyć Gabarytu A ($8\text{ cm}$).
* **SYT-05:** Odprawa na lotnisku – szybki test bagażu przed podejściem do stanowiska *Drop-off*.
* **SYT-06:** Wnoszenie mebla przez zabiegową klatkę schodową – analiza promienia skrętu długiego elementu.
* **SYT-07:** Kontrola ładowności przed wyjazdem ze składu budowlanego – kalkulator sumarycznej masy cementu, kleju i gipsu w relacji do DMC auta.
* **SYT-08:** Załadunek z asystentem Apple Watch – odhaczanie kolejnych walizek znoszonych do garażu.
* **SYT-09:** Pakowanie boxa dachowego (trumny) – optymalizacja przestrzeni o zmiennym profilu aerodynamicznym.
* **SYT-10:** Zmiana samochodu w wypożyczalni – szybkie porównanie bagażnika zarezerwowanego auta z bagażami stojącymi na wózku lotniskowym.
* **SYT-11:** Transport lodówki z agregatem – wymuszenie pozycji pionowej lub ostrzeżenie o maksymalnym dopuszczalnym kącie przechyłu ($45^\circ$).
* **SYT-12:** Sprawdzenie windy osobowej w nowo odbieranym mieszkaniu – czy wejdzie blat kuchenny $280\text{ cm}$ po przekątnej.
* **SYT-13:** Szybki pomiar awaryjny – brak miarki fizycznej, pomiar kartonu za pomocą interaktywnej miarki ekranowej lub aparatu.
* **SYT-14:** Eksport instrukcji pakowania dla małżonka/znajomego – wygenerowanie jednoekranowej grafiki PNG z rzutem 3D i kolejnością wkładania paczek.
* **SYT-15:** Pakowanie bagażnika z zachowaniem widoczności – automatyczne ograniczenie wysokości załadunku do linii dolnej krawędzi szyb tylnych.
* **SYT-16:** Planowanie kompleksowej przeprowadzki M3 – inwentaryzacja mebli z podziałem na pokoje, obliczenie łącznej kubatury $m^3$ i dobór wielkości vana (L2H2 vs L3H2) oraz liczby kursów.
* **SYT-17:** Wnoszenie monolitycznego narożnika przez drzwi 80 cm i spocznik schodów – symulacja obrotu mebla (Moving Sofa Problem) i kolizji z klamką oraz balustradą.
* **SYT-18:** Pasowanie szafy modułowej we wnękę ścienną – uwzględnienie grubości listew przypodłogowych (-2 cm na stronę) i ewentualnych krzywizn tynku.
* **SYT-19:** Ergonomia sypialni i ciągi komunikacyjne – weryfikacja kolizji wysuwanych szuflad łóżka ze stolikiem nocnym i grzejnikiem oraz strefy uchylenia drzwi szafy.
* **SYT-20:** Montaż lodówki we wnęce kuchennej – weryfikacja tylnego odstępu wentylacyjnego skraplacza (min. 5 cm) oraz kąta otwarcia drzwi min. 115° na wyjęcie szuflad zamrażalnika.
* **SYT-21:** Montaż pralki w szafie gospodarczej – dodanie naddatku instalacyjnego +8 cm na wąż AquaStop i syfon oraz sprawdzenie promienia otwarcia frontu.
* **SYT-22:** Bagażnik rowerowy na hak a limit nacisku pionowego $S$ – automatyczny bilans masy platformy i rowerów elektrycznych z alarmem przeciążenia kuli haka.
* **SYT-23:** Wysokość całkowita pojazdu z boxem dachowym lub rowerami a wjazd do parkingu podziemnego (znaki B-16: 1.9 m / 2.0 m / 2.1 m).
* **SYT-24:** Parkowanie w wąskim garażu ze słupem – weryfikacja szerokości z rozłożonymi i złożonymi lusterkami oraz strefy min. 65 cm na otwarcie drzwi kierowcy.
* **SYT-25:** Transport klatki kennelowej dla psa – symulacja styku ściętej ściany klatki ze skosem tylnej szyby SUV-a z zachowaniem luzu 3 cm.
* **SYT-26:** Wynajem komórki w Self-Storage – optymalizacja sztaplowania kartonów w boksie 5 m² z zachowaniem korytarza inspekcyjnego o szerokości 50 cm.
