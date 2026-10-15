# Czy się zmieści? (FitCheck) — Apps4Brew

> **Asystent pakowania bagażnika, ładunku i mebli, symulacja 3D bin packing oraz weryfikacja wymiarowa offline.**

Aplikacja z rodziny **Apps4Brew** rozwiązująca problem załadunku przedmiotów do samochodów osobowych, automatów paczkowych, wind i luku bagażowego samolotów.

---

## Główne Cechy Produktu

* **100% Offline-First:** Działa w garażu podziemnym, lesie i na lotnisku bez dostępu do Internetu.
* **Prywatność („Data Not Collected”):** Zero kont, zero rejestracji, brak zewnętrznych trackerów analitycznych i reklamowych. Wszystkie dane przechowywane lokalnie w SQLite.
* **Fizyka i Geometria 3D:** Deterministyczny solver 3D (Extreme Points + Guillotine) uwzględniający skosy tylnej szyby, przewężenia nadkoli oraz światło otworu załadunkowego klapy.
* **Bezpieczeństwo i Przepisy (DMC):** Kontrola dopuszczalnej ładowności, nacisków na osie oraz ostrzeganie o ograniczeniu widoczności zgodnie z art. 61 Prawa o Ruchu Drogowym.
* **Asystent Apple Watch:** Samodzielna aplikacja na watchOS 11 ułatwiająca załadunek przy zajętych rękach (kolejność wkładania, haptyczne odhaczanie).
* **Szkoła Pakowania:** Moduł edukacyjny wyjaśniający fizykę zderzeń, mocowanie ładunku i zasady bezpiecznego transportu.

---

## Dokumentacja Biznesowa i Techniczna (BRD 0.1)

Kompletna dokumentacja wymagań biznesowych znajduje się w katalogu [`czy_sie_zmiesci_brd/`](./czy_sie_zmiesci_brd/):

* [00 START — Streszczenie, warianty MVP, spis treści](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%2000%20START%20—%20streszczenie,%20warianty%20MVP,%20spis%20treści.md)
* [00b Jedna lista decyzji (DEC-01…DEC-41)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%2000b%20Jedna%20lista%20decyzji%20i%20pytań%20(DEC-01…DEC-41).md)
* [00c Sprzeczności i errata](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%2000c%20Sprzeczności%20i%20errata.md)
* [A1 Tożsamość, persony P1–P8, scenariusze SYT-01–15](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20A1%20·%20rozdz.%201–3%20(Tożsamość,%20Persony,%20Architektura).md)
* [A2 Rynek, luka konkurencyjna, model przychodu i cennik](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20A2%20·%20rozdz.%204–6.1%20(Rynek,%20Model%20przychodu,%20Zakres).md)
* [A3a Tabela zakresu cz. 1: Pojazdy, bagażniki, katalog mebli](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20A3a%20·%20rozdz.%206.2%20tabela%20zakresu%20cz.%201%20(Kalkulator,%20Geometria,%20Baza%20Aut).md)
* [A3b Tabela zakresu cz. 2: Algorytm 3D, masa, Apple Watch, platforma](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20A3b%20·%20rozdz.%206.2%20tabela%20zakresu%20cz.%202%20(Algorytm%203D,%20AR,%20Eksport,%20Platforma).md)
* [A3c Etapy, nakład pracy agenta, warianty wydań](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20A3c%20·%20rozdz.%206.3–6.5%20(Etapy,%20Nakład%20pracy,%20Warianty).md)
* [A4 KPI bez śledzenia, marketing i ASO (35 języków)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20A4%20·%20rozdz.%2013,%2015%20(KPI%20bez%20śledzenia,%20Marketing,%20ASO).md)
* [B1 Silnik pakowania 3D (BR-PAK)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20B1%20·%20rozdz.%207%20narzędzia%20—%20Silnik%20pakowania%203D%20i%20algorytmy%20geometryczne.md)
* [B2 Baza aut i przestrzeni (BR-POJ)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20B2%20·%20rozdz.%207%20narzędzia%20—%20Baza%20bagażników,%20pojazdów%20i%20przestrzeni%20ładunkowych.md)
* [B3 Katalog mebli, AGD i walizek (BR-KAT)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20B3%20·%20rozdz.%207%20narzędzia%20—%20Katalog%20mebli%20(IKEA%20itp.),%20kartonów%20i%20walizek.md)
* [B4 Paczkomaty i linie lotnicze (BR-LOT)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20B4%20·%20rozdz.%207%20narzędzia%20—%20Paczkomaty,%20skrytki%20i%20wymogi%20linii%20lotniczych.md)
* [B5 Pomiary i miarka manualna (BR-POM)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20B5%20·%20rozdz.%207%20narzedzia%20—%20Pomiary%20aparatem%20AR%20i%20LiDAR%20oraz%20manualna%20miarka.md)
* [B6 Kontrola masy i DMC (BR-MAS)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20B6%20·%20rozdz.%207%20narzedzia%20—%20Kontrola%20masy,%20DMC,%20rozklad%20naciskow%20i%20bezpieczenstwo.md)
* [C1 Szkoła Pakowania i edukacja (BR-EDU)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20C1%20·%20rozdz.%207%20nauka%20—%20Szkoła%20pakowania,%20fizyka%20ładunku%20i%20zasady%20mocowania.md)
* [C2 Reguły dziedzinowe: Geometria i VDA (RD-01…RD-16)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20C2%20·%20rozdz.%208%20reguły%20dziedzinowe%20—%20RD-01…RD-16%20(geometria%203D,%20VDA,%20skosy).md)
* [C3 Reguły dziedzinowe: Masa i prawo (RD-17…RD-32)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20C3%20·%20rozdz.%208%20reguły%20dziedzinowe%20—%20RD-17…RD-32%20(rozkład%20masy,%20stabilność,%20ościeżnice).md)
* [C4 Proces treści merytorycznych i decyzje badacza (D1…D22)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20C4%20·%20rozdz.%208.P%20proces%20treści%20merytorycznych%20i%20decyzje%20badacza%20D1…D22.md)
* [D1 Wymagania niefunkcjonalne (NFR) i wytyczne Apple](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20D1%20·%20rozdz.%209–10%20wymagania%20niefunkcjonalne%20(NFR)%20i%20zgodność%20z%20Apple.md)
* [D2 Architektura i model danych SQLite (DDL)](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20D2%20·%20rozdz.%2011–12%20architektura,%20model%20danych%20SQLite%20i%20przenośność.md)
* [D3 Rejestr ryzyk (RYZ-01…RYZ-45) i pytania otwarte](./czy_sie_zmiesci_brd/Czy%20sie%20zmiesci%20BRD%200.1%20·%20D3%20·%20rozdz.%2014,%2016%20rejestr%20ryzyk%20(RYZ-01…RYZ-45)%20i%20otwarte%20pytania.md)
