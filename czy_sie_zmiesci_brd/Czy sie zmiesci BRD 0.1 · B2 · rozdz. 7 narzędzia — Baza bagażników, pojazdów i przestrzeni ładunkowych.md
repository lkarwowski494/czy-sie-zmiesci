# **Czy się zmieści? (FitCheck) BRD 0.1 — Część B2**

## **Rozdział 7: Wymagania Funkcjonalne — Baza Pojazdów i Przestrzeni (BR-POJ-001…BR-POJ-035)**

---

### **BR-POJ-001: Predefiniowana baza 60 top modeli aut w MVP**
* **Opis:** Aplikacja zawiera wbudowaną lokalną bazę SQLite z 60 najpopularniejszymi modelami samochodów na rynku polskim i europejskim (segmenty B, C, D, SUV, Kombi). Każdy model posiada zweryfikowane wymiary 7-parametrowe.
* **Persona:** Tomasz (P1), Kasia (P2), Agnieszka (P5).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Użytkownik wchodzi do zakładki „Garaż”.
  * **WHEN:** Wybiera z listy: *Skoda $\to$ Octavia IV $\to$ Combi*.
  * **THEN:** Aplikacja ładuje parametry: $L_{\text{floor}} = 105\text{ cm}$, $L_{\text{folded}} = 178\text{ cm}$, $W_{\text{min}} = 101\text{ cm}$, $W_{\text{max}} = 125\text{ cm}$, $H_{\text{roof}} = 82\text{ cm}$, $H_{\text{shelf}} = 52\text{ cm}$, kąt szyby $38^\circ$.
  * **THEN:** Na ekranie pojawia się trójwymiarowy model bryły bagażnika z naniesionymi wymiarami.

---

### **BR-POJ-002: Dynamiczna zmiana konfiguracji siedzeń (Fotele rozłożone / złożone)**
* **Opis:** Przełącznik w widoku auta natychmiastowo przelicza dostępną długość podłogi oraz kubaturę załadunkową w zależności od położenia oparć tylnej kanapy.
* **Persona:** Kasia (P2), Bartek (P7).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Załadowany profil auta z rozłożoną kanapą ($L_{\text{floor}} = 90\text{ cm}$).
  * **WHEN:** Użytkownik przełącza suwak na pozycję „Fotele złożone”.
  * **THEN:** Długość podłogi zwiększa się do wartości $L_{\text{folded}} = 165\text{ cm}$, bryła 3D wydłuża się animacyjnie w 250 ms, a liczba miejsc pasażerskich spada z 5 do 2.

---

### **BR-POJ-003: Obsługa złożenia przedniego fotela pasażera (Ładunki długie)**
* **Opis:** W modelach samochodów wyposażonych fabrycznie w składane oparcie fotela pasażera (np. Skoda, Dacia, Volvo), aplikacja udostępnia tryb „Długi ładunek”, rozszerzający prawą stronę przestrzeni do $270\text{ cm}$.
* **Persona:** Janusz (P6), Bartek (P7).
* **Priorytet:** **SHOULD** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Samochód z obsługą składania przedniego fotela.
  * **WHEN:** Aktywowana jest opcja „Pasażer na płasko”.
  * **THEN:** W prawej strefie pojawia się korytarz załadunkowy o długości min. $260\text{ cm}$, umożliwiający włożenie paczek szaf $236\text{ cm}$ lub nart.

---

### **BR-POJ-004: Zdefiniowanie własnego pojazdu ręcznie (Manual Custom Space)**
* **Opis:** Jeśli modelu auta nie ma w bazie, użytkownik może zdefiniować własny profil, wpisując podstawowe wymiary (długość, szerokość między nadkolami, wysokość, wymiary otworu).
* **Persona:** Janusz (P6).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Brak auta użytkownika na liście predefiniowanej.
  * **WHEN:** Użytkownik wybiera „Dodaj własny pojazd” i podaje nazwę oraz 4 podstawowe wymiary.
  * **THEN:** Profil zostaje zapisany w SQLite i staje się w pełni dostępny do symulacji pakowania 3D.

---

### **BR-POJ-005: Boks dachowy i ograniczenie nośności dachu**
* **Opis:** Możliwość dodania profilu boksu dachowego (o zmiennej wysokości klina) wraz z automatycznym limitem nośności dachu (zwykle $50\text{ kg}$ lub $75\text{ kg}$ zgodnie z instrukcją pojazdu).
* **Persona:** Tomasz (P1).
* **Priorytet:** **SHOULD** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Dodany boks dachowy o pojemności $400\text{ l}$ i limicie masy $50\text{ kg}$.
  * **WHEN:** Użytkownik przypisuje do boksu ładunki o łącznej masie $58\text{ kg}$.
  * **THEN:** Wyświetlane jest ostrzeżenie: *„Przekroczono nośność belek dachowych o 8 kg! Ryzyko uszkodzenia dachu przy hamowaniu”*.

---

### **BR-POJ-006: Profile przestrzeni domowych (Windy i Drzwi)**
* **Opis:** Baza gotowych profili przestrzeni architektonicznych: Winda Typ 1 (wielka płyta: $100 \times 100 \times 205\text{ cm}$, drzwi $80\text{ cm}$), Winda Typ 2 (nowe budownictwo: $140 \times 110 \times 210\text{ cm}$), Ościeżnica 70/80/90 cm.
* **Persona:** Agnieszka (P5).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Przedmiot o wymiarach $120 \times 70 \times 85\text{ cm}$.
  * **WHEN:** Użytkownik wybiera test: „Winda mała (wielka płyta)”.
  * **THEN:** Aplikacja weryfikuje przekątną wejścia i podłogi windy, informując, czy mebel wejdzie na stojąco lub po przekątnej.
