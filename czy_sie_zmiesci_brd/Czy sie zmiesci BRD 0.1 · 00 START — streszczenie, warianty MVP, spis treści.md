# **Czy się zmieści? (FitCheck) — Wymagania biznesowe (BRD), wersja robocza 0.1, 15.10.2026**

**Status:** wersja robocza do akceptacji właściciela. Sprawy produktowe czekają na Twoje decyzje (sekcja 4, DEC-01…DEC-60). Sprawy merytoryczne (geometria 3D, optymalizacja bin packing, normy ISO/VDA, wytyczne załadunku, prawo przewozowe, kinematyka wnoszenia mebli Moving Sofa, montaż AGD, fizyka haka holowniczego) rozstrzyga badacz według 5-szczeblowej hierarchii źródeł. Każdą decyzję merytoryczną możesz zawetować. **Autor:** analityk biznesowy studia Apps4Brew. Części A–D napisali analitycy i badacz merytoryczny.

---

## **1. Jak czytać ten dokument**

### **Części dokumentu (Kompletny rejestr 27 modułów)**

| Plik | Rozdziały | Zawartość |
| :--- | :--- | :--- |
| **00-streszczenie** (ten plik) | — | Streszczenie dla właściciela, warianty pierwszej wersji (DEC-01), warunki wstępne, spis treści, statystyka objętości |
| **00b-decyzje** | — | Pełna lista 60 decyzji produktowych i technicznych (DEC-01…DEC-60) z kontekstem, opcjami, rekomendacjami i kompromisami |
| **00c-sprzecznosci** | — | Zidentyfikowane sprzeczności założeń (SPRZ-01…SPRZ-12), errata, pułapki VDA, listew przypodłogowych, AGD i lusterek |
| **A1** | 1–3 | Tożsamość produktu, wizja i 16 zasad produktu (ZP-01…ZP-16), persony P1–P14, 26 scenariuszy życiowych SYT-01…SYT-26 |
| **A2** | 4–6.1 | Analiza rynku (motoryzacja, DIY, e-commerce, przeprowadzki, AGD), luka konkurencyjna, model przychodu, cennik PL/EU/US |
| **A3a, A3b, A3c** | 6.2–6.5 | Tabela zakresu Z-001…Z-190 z etapami (MVP, 1.1, 1.2, 2.x), nakład pracy agenta, kalendarz, warianty wydań |
| **A4** | 13, 15 | Metryki KPI bez śledzenia użytkownika, strategia marketingowa, ASO w 35 językach |
| **B1–B6** | 7 (Narzędzia) | Wymagania narzędziowe pojazdów, pakowania 3D, mebli, paczkomatów, linii lotniczych, miarki i kontroli masy DMC |
| **B7** | 7 (Narzędzia) | Wymagania narzędziowe przeprowadzek, inwentaryzacji lokalu i doboru floty dostawczej kat. B (BR-PRZ) |
| **B8** | 7 (Narzędzia) | Wymagania wymiarowania lokalu, ościeżnic drzwi, wnoszenia po schodach, wind, wnęk i luzów AGD (BR-LOK) |
| **B9** | 7 (Narzędzia) | Wymagania garaży, skrajni dachowych, nośności haka z rowerami e-bike i klatek kennelowych (BR-GAR) |
| **C1–C4** | 7 (Nauka), 8, 8.P | Szkoła Pakowania, reguły dziedzinowe RD-01…RD-32 z wektorami testowymi, proces weryfikacji 8.P i decyzje D1…D22 |
| **C5** | 8 (Reguły) | Sformalizowane reguły dziedzinowe RD-33…RD-55 (wnoszenie, obrót w ościeżnicy, luzy AGD, hak $S$, garaże) |
| **D1–D4** | 9–12, 14, 16, 17 | 110 wymagań NFR, zgodność Apple HIG, model SQLite (13 tabel DDL), rejestr 60 ryzyk (RYZ-01…RYZ-60) i 9 warstw jakości testów |

---

### **Oznaczenia identyfikatorów**

> * **BR-[KOD]-nnn**: wymaganie funkcjonalne (np. `BR-PAK-001`, `BR-PRZ-001`, `BR-LOK-001`, `BR-GAR-001`). Zawiera: opis, powiązaną personę, mierzalne kryteria akceptacji Gherkin (Given-When-Then), priorytet (**MUST / SHOULD / COULD**) oraz etap wdrożenia (**MVP / 1.1 / 1.2 / 2.x / badanie / nigdy**).
> * **NFR-[KOD]-nnn**: wymaganie niefunkcjonalne. Kody: `OFF` (100% offline), `I18N` (lokalizacja 35 języków), `DOST` (dostępność WCAG/VoiceOver), `WYG` (interfejs/design Apple HIG), `WYD` (wydajność silnika 3D min. 60 FPS), `DANE` (integralność bazy SQLite), `BEZP` (prywatność i ochrona danych), `INT` (spójność interakcji wg katalogu), `ZEG` (kompan Apple Watch), `TEST` (pokrycie testami).
> * **RD-nn**: reguła dziedzinowa (rachunek geometryczny, fizyka ładunku, norma ISO 3832, regulacje drogowe art. 61 PoRD, mechanika wnoszenia mebli). Każda z twardymi wektorami testowymi.
> * **RYZ-nn**: ryzyko z oceną prawdopodobieństwa (1–5), skutku (1–5), wagą i strategią mitygacji.
> * **DEC-nn**: decyzja produktowa lub architektoniczna dla właściciela.
> * **ZP-nn**: nienaruszalna zasada produktu (Zasady Projektowe Apps4Brew).

---

## **2. Streszczenie dla właściciela**

### **Co to jest**
**Czy się zmieści? (FitCheck)** to prywatna, działająca w 100% offline aplikacja na iPhone'a (z asystentem na Apple Watch), która kompleksowo adresuje **wszystkie dylematy przestrzenne i wymiarowe codziennego życia**:
1. *„Czy ten mebel / kartony wejdą do mojego samochodu?”* (symulacja 3D ze skosami szyby i nadkolami).
2. *„Czy mebel przejdzie przez ościeżnicę drzwi i spocznik ciasnej klatki schodowej?”* (Moving Sofa Problem 3D).
3. *„Czy szafa wejdzie we wnękę ścienną po uwzględnieniu listew przypodłogowych i grzejnika?”* (Room Clearance).
4. *„Czy lodówka ma wystarczający odstęp wentylacyjny, a jej drzwi pozwolą wysunąć szuflady zamrażarki?”* (AGD Clearance).
5. *„Jakiego busa dostawczego potrzebuję na przeprowadzkę M3 i w jakiej kolejności układać meble?”* (Relocation Planner).
6. *„Czy samochód z rozłożonymi lusterkami wjedzie do garażu i czy kierowca będzie mógł otworzyć drzwi przy słupie?”* (Garage Fit).
7. *„Czy auto z boxem dachowym lub rowerami wjedzie na parking podziemny o skrajni 2.0 m?”* (Height Clearance).
8. *„Czy waga platformy rowerowej z 2 rowerami elektrycznymi nie przekroczy nośności kuli haka $S$?”* (Towbar Physics).
9. *„Czy przesyłka wejdzie do Paczkomatu InPost Gabaryt B z marginesem na wybrzuszenie taśmy?”* (Parcel Locker Sizer).
10. *„Czy plecak podręczny zmieści się w metalowym sizerze linii Ryanair / Wizz Air?”* (Aviation Sizer).

---

### **Dla kogo (14 Zweryfikowanych Person P1…P14)**
1. **Tomasz (35 l., Głowa rodziny):** Pakuje rodzinę 2+2 na 2-tygodniowe wakacje (4 walizki, wózek, torby, rowery).
2. **Kasia (28 l., Kupująca meble w IKEA):** Weryfikuje, czy paczki płaskie wejdą do małego hatchbacka.
3. **Marek (42 l., E-commerce / Nadawca):** Błyskawiczny dobór gabarytu Paczkomatu A/B/C z buforem rygla.
4. **Piotr (31 l., Podróżnik Low-Cost):** Weryfikuje wypchany plecak w lotniskowych sizerach Ryanair i Wizz Air.
5. **Agnieszka (48 l., Remont i wymiana AGD):** Sprawdza wniesienie pralki i lodówki po schodach i przez drzwi 70 cm.
6. **Janusz (62 l., Działkowicz):** Przewozi worki ziemi, słupki i kosiarkę; kontrola DMC i duże fonty.
7. **Bartek (24 l., Student):** Przeprowadzka do pokoju przy minimalnej liczbie kursów.
8. **Ewa (39 l., Persona Dostępnościowa):** Osoba niewidoma weryfikująca aplikację przez audiodeskrypcję VoiceOver.
9. **Michał i Karolina (32 l. i 30 l., Przeprowadzka do nowego lokalu):** Inwentaryzacja mebli M3, dobór vana L2H2 i wnoszenie na 3. piętro.
10. **Natalia (29 l., Aranżacja małego mieszkania):** Pasowanie szafy we wnękę z listwami i strefy ergonomiczne wysuwu szuflad łóżka.
11. **Krzysztof (44 l., Rowerzysta i podróżnik):** Kontrola limitu nacisku pionowego haka ($S = 75\text{ kg}$) dla e-bike'ów i skrajnia boxa dachowego.
12. **Dariusz (51 l., Zakupy budowlane):** Kontrola punktowego nacisku na podłogę bagażnika (płytki, cement) i zwisu ładunku (art. 61 PoRD).
13. **Zofia (36 l., Właścicielka psa):** Dopasowanie skośnej klatki kennelowej do kąta szyby bagażnika SUV-a.
14. **Grzegorz (58 l., Ciasny garaż ze słupem):** Weryfikacja szerokości z lusterkami, strefy wysiadania (min. 65 cm) i uniesienia klapy.

---

### **3. Podsumowanie Statystyk Objętości Dokumentacji BRD 0.1**

* **Liczba plików specyfikacji:** **27 plików** w katalogu `czy_sie_zmiesci_brd/`
* **Łączna liczba linii:** **2 905 linii**
* **Łączna liczba słów:** **29 284 słowa**
* **Łączna liczba znaków ze spacjami:** **213 698 znaków**
* **Znormalizowana objętość (1 800 znaków ze spacjami / stronę):** **118,72 strony** (odpowiednik ~115 stron znormalizowanego druku technicznego A4)

---

### **Warianty pierwszej wersji (DEC-01)**

| Cecha / Wariant | (a) Pełne spektrum z BRD | (b+) MVP optymalne (REKOMENDACJA) | (b) Tylko MUST | (c) (b+) z LiDAR/AR | (d) Czysty kalkulator |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Liczba BR w 1.0** | **232 BR** | **156 BR** (146 MUST + 10 wyjątków) | **146 BR** | **172 BR** | **96 BR** |
| **Co użytkownik dostaje** | Silnik 3D, auta, meble, paczkomaty, lotniska, przeprowadzki, wnęki, schody, garaże, hak $S$, Apple Watch, eksport PDF | Silnik 3D, baza 60 aut, paczkomaty A/B/C, 10 linii lotniczych, meble, wnęki z listwami, schody, wjazd do garażu, hak $S$, kontrola DMC, Szkoła Pakowania, Apple Watch | Rdzeń 3D, manualne wymiary auta, meble, bez widżetów i zegarka | Pełne (b+) oraz skanowanie przestrzeni kamerą ARKit/LiDAR | Czysty kalkulator bez bazy i modułów edukacyjnych |
| **Ryzyko Apple 4.3** | Bardzo niskie | **Niskie** (silnik 3D + fizyka + przeprowadzki + edukacja) | Średnie | Bardzo niskie | **Wysokie** (odrzucenie) |
| **Nakład pracy agenta** | 45–60 dni agenta | **32–45 dni agenta** | 28–40 dni agenta | 50–70 dni agenta | 20–30 dni agenta |
| **Czas kalendarzowy** | 5–7 tygodni | **4–5 tygodni** | 3–4 tygodnie | 6–8 tygodni | 2–3 tygodnie |
