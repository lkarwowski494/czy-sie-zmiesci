# **Czy się zmieści? (FitCheck) BRD 0.1 — Część A2**

## **Rozdział 4: Analiza Rynku, Konkurencja i Luka Rynkowa**

### **4.1. Wielkość i Charakterystyka Rynku**
Rynek docelowy aplikacji obejmuje trzy nakładające się segmenty użytkowników w Europie i Ameryce Północnej:
1. **Właściciele samochodów osobowych i SUV-ów:** W Unii Europejskiej zarejestrowanych jest ponad **250 milionów samochodów osobowych** (wg danych ACEA). Średnio 4–6 razy w roku kierowca staje przed nietypowym wyzwaniem załadunkowym (wakacje, zakupy gabarytowe, przewóz opon sezonowych, remont, przewóz choinki).
2. **Klienci sieci meblowych i DIY (zrób to sam):** Sama sieć IKEA odnotowuje rocznie ponad **800 milionów wizyt** w sklepach stacjonarnych na świecie. Około 68% klientów decyduje się na odbiór własny mebli w płaskich paczkach (*flat-pack*) z magazynu samoobsługowego.
3. **Użytkownicy automatów paczkowych i tanich linii lotniczych:** W Polsce sieć InPost posiada ponad **24 000 Paczkomatów**, a rynek e-commerce generuje ponad miliard przesyłek rocznie. Linie Ryanair i Wizz Air przewożą ponad **200 milionów pasażerów rocznie**, z czego ponad 70% podróżuje wyłącznie z darmowym małym bagażem podręcznym.

---

### **4.2. Macierz Konkurencji**

| Aplikacja / Narzędzie | Model cenowy | Offline? | Prywatność (App Privacy) | Baza modeli aut | Silnik 3D Bin Packing | Paczkomaty / Linie | Podgląd Apple Watch |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CamToPlan / AR Plan 3D** | Subskrypcja 49,99 zł/rok | Częściowo | Śledzenie (AdMob, Meta) | Brak (0) | Brak (tylko rzut podłogi) | Brak | Brak |
| **PackPoint Travel** | Freemium + 14,99 zł | Tak | E-mail, Analytics | Brak | Brak (tylko lista checklist) | Brak | Podgląd listy |
| **CargoWiz / 3D Bin Packing Web** | B2B (od 200 $/mies.) | Nie (web) | Chmura B2B | Flota TIR / Kontenery | Tak (profesjonalny) | Brak | Brak |
| **Miarka Apple (Natywna)** | 0 zł | Tak | Pełna prywatność | Brak | Brak (tylko pojedyncza linia) | Brak | Brak |
| **Czy się zmieści? (FitCheck)** | **Darmowy rdzeń + 19,99 zł/rok / 59,99 zł raz** | **100% Offline** | **Data Not Collected (0 zł serwer)** | **Tak (60 aut w MVP, 250 w 1.1)** | **Tak (Extreme Points 3D)** | **Tak (InPost, Orlen, DPD, Ryanair, Wizz Air)** | **Pełna asysta załadunku** |

---

### **4.3. Luka Rynkowa (Dlaczego FitCheck wygra)**
* **Brak mostu między wymiarami sklepowymi a bagażnikiem:** Obecnie użytkownik w sklepie meblowym musi ręcznie mierzyć paczki, pamiętać wymiary bagażnika swojego auta (o ile je zna) i w głowie wyobrażać sobie ich układ przestrzenny.
* **Fałszywe poczucie bezpieczeństwa z litrów VDA:** Dostępne w internecie kalkulatory operują wyłącznie na litrach (pojemności katalogowej), co prowadzi do drastycznych pomyłek (walizka $120\text{ l}$ wchodzi do bagażnika $400\text{ l}$ tylko wtedy, gdy pasują jej krawędzie, a nie objętość).
* **Niezależność od drogiego sprzętu i światła:** Konkurencyjne rozwiązania oparte wyłącznie na ARKit zawodzą w ciemnym garażu podziemnym lub przy czarnej tapicerce auta (brak punktów charakterystycznych dla SLAM). FitCheck bazuje na matematycznej bazie modeli i parametrach wprowadzanych suwakami.

---

## **Rozdział 5: Model Przychodu, Cennik i Unit Economics**

### **5.1. Struktura Oferty**
Aplikacja wdraża sprawdzony w projektach Apps4Brew (Oczko, Napar) model **Freemium z Uczciwym Rdzeniem**:
1. **Darmowy Rdzeń (Free Tier — bez ograniczeń czasowych):**
   * Zdefiniowanie 1 profilu pojazdu lub przestrzeni domowej.
   * Symulacja załadunku do 3 przedmiotów jednocześnie.
   * Pełny dostęp do wymiarów automatów paczkowych (InPost, DPD, Orlen) i 5 popularnych linii lotniczych.
   * Ręczna miarka wymiarów z kalkulatorem objętości brutto.
   * Podstawowe artykuły Szkoły Pakowania.
2. **Pakiet PRO (Subskrypcja lub Zakup Dożywotni):**
   * Nielimitowana liczba profili samochodów, schowków dachowych, przyczep i pomieszczeń.
   * Nielimitowana liczba przedmiotów w symulacji załadunku (kombinatoryczny algorytm 3D Extreme Points).
   * Pełna baza ponad 60 modeli aut w MVP (250 w wersji 1.1) oraz mebli popularnych sieci.
   * Moduł weryfikacji Dopuszczalnej Masy Całkowitej (DMC) i nacisku na osie.
   * Asystent załadunku na Apple Watch (kolejność wkładania, haptyczne odhaczanie).
   * Eksport schematu pakowania krok-po-kroku do pliku graficznego/PDF.
   * Włączone Apple Family Sharing (do 5 członków rodziny w cenie jednej licencji).

---

### **5.2. Cennik Międzynarodowy**

| Plan | Polska (PLN) | Strefa Euro (EUR) | Stany Zjednoczone (USD) | Wielka Brytania (GBP) |
| :--- | :--- | :--- | :--- | :--- |
| **PRO Miesięczny** | 3,99 zł | 0,99 € | 0,99 $ | 0,99 £ |
| **PRO Roczny (14 dni próby)** | **19,99 zł** *(1,66 zł/mies.)* | **4,99 €** | **4,99 $** | **4,99 £** |
| **PRO Dożywotni (Lifetime IAP)** | **59,99 zł** *(opłata jednorazowa)* | **14,99 €** | **14,99 $** | **14,99 £** |

*Ceny brutto z uwzględnieniem podatku VAT/Sales Tax naliczanego i odprowadzanego bezpośrednio przez Apple.*

---

### **5.3. Unit Economics i Próg Rentowności (Break-Even Point)**
* **Koszty stałe roczne:**
  * Roczna subskrypcja Apple Developer Program: **99,00 USD** (ok. **395,00 zł**).
  * Koszt infrastruktury chmurowej: **0,00 zł** (aplikacja w 100% serverless / offline).
  * Koszt narzędzi CI/CD: **0,00 zł** (publiczne repozytorium GitHub z darmowymi maszynami macOS runner).
* **Przychód netto ze sprzedaży w App Store:**
  * Apple pobiera prowizję w programie *Small Business Program* w wysokości **15%**.
  * Po odliczeniu VAT (23% w PL) i prowizji Apple (15%), z rocznej subskrypcji **19,99 zł** do studia trafia ok. **13,81 zł netto**.
  * Z zakupu dożywotniego **59,99 zł** do studia trafia ok. **41,45 zł netto**.
* **Kalkulacja progu rentowności (BEP):**
  * Koszt 395 zł zwraca się w całości przy:
    * **29 subskrypcjach rocznych** w Polsce, LUB
    * **10 zakupach dożywotnich** rocznie!
  * Każda kolejna sprzedaż generuje **99,9% zysku czystego**, bez żadnych kosztów krańcowych serwera.

---

## **Rozdział 6.1: Architektura Zakresu i Podział na Moduły**

Zakres funkcjonalny podzielony jest na 10 logicznych filarów:
1. **Moduł M1 (Geometria i Przestrzeń):** Definiowanie brył ładunkowych (bagażnik, box dachowy, skrzynia ładunkowa, winda, ościeżnica).
2. **Moduł M2 (Katalog Pojazdów i Standardów):** Predefiniowane profile aut osobowych, kombi, SUV, paczkomatów i linii lotniczych.
3. **Moduł M3 (Katalog Ładunku i Mebli):** Baza wymiarów kartonów, walizek, sprzętu AGD i mebli z podziałem na paczki składowe.
4. **Moduł M4 (Silnik Optymalizacji 3D):** Deterministyczny solver 3D Bin Packing (Extreme Points + Guillotine Cut) z ograniczeniami fizycznymi (zakaz obrotu, nośność).
5. **Moduł M5 (Masa, Bezpieczeństwo i DMC):** Weryfikacja wagowa, rozkład masy w pojeździe, ostrzeżenia o widoczności i prawie drogowym.
6. **Moduł M6 (Edukacja — Szkoła Pakowania):** Baza wiedzy o zabezpieczaniu ładunku, pasach transportowych, fizyce zderzeń i przepisach prawa.
7. **Moduł M7 (Integracja Platformowa i Apple Watch):** Obsługa watchOS, Live Activities na ekranie blokady, widżety Smart Stack, eksport i kopia JSON.
8. **Moduł M8 (Przeprowadzki i Logistyka Lokalu — BR-PRZ):** Inwentaryzacja mebli lokalu, sumaryczna kubatura $m^3$, dobór floty dostawczej kat. B, optymalizacja boksów self-storage ze ścieżką inspekcyjną, kolejkowanie załadunku (Zasada 4 Fazy).
9. **Moduł M9 (Wymiarowanie Lokalu i Wnęk — BR-LOK):** Analiza przejść przez ościeżnice (klamka, skrzydło 90° vs 180°), wnoszenie po schodach i spocznikach (Moving Sofa), przekątna windy 3D, dylatacje listew przypodłogowych, luzy wentylacyjne lodówek, głębokość montażowa pralek, strefy ergonomiczne.
10. **Moduł M10 (Garaże, Skrajnie i Sprzęt Rekreacyjny — BR-GAR):** Szerokość auta z lusterkami vs brama garażowa, strefa wysiadania min. 65 cm, kolizja klapy z sufitem/bramą, skrajnie dachowe (1.9m/2.0m/2.1m), bilans pionowy haka holowniczego ($S$), klatki kennelowe dla psów, nacisk punktowy podłogi bagażnika.
