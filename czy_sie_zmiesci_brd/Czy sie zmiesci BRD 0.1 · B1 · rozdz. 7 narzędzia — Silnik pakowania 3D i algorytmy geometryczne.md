# **Czy się zmieści? (FitCheck) BRD 0.1 — Część B1**

## **Rozdział 7: Wymagania Funkcjonalne — Silnik Pakowania 3D (BR-PAK-001…BR-PAK-040)**

---

### **BR-PAK-001: Wyznaczanie punktów wstawienia (Extreme Points 3D Solver)**
* **Opis:** Silnik obliczeniowy musi w czasie rzeczywistym generować zbiór dopuszczalnych punktów wstawienia $EP = \{(x_i, y_i, z_i)\}$ w przestrzeni trójwymiarowej dla nowo dodawanego prostopadłościanu, zgodnie z algorytmem Crainica, Perboliego i Peirano.
* **Persona:** Tomasz (P1), Kasia (P2).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Zdefiniowana przestrzeń ładunkowa $S$ oraz lista $N$ paczek o znanych wymiarach.
  * **WHEN:** Użytkownik uruchamia przeliczenie załadunku.
  * **THEN:** Czas wygenerowania siatki punktów i ułożenia dla $N \le 20$ wynosi $\le 35\text{ ms}$ na urządzeniu referencyjnym (iPhone 11).
  * **THEN:** Żaden prostopadłościan nie nachodzi na inny prostopadłościan ani nie przekracza granicy przestrzeni ($V_i \cap V_j = \emptyset$).

---

### **BR-PAK-002: Wstępne sortowanie paczek (Best-Fit Decreasing)**
* **Opis:** Przed przystąpieniem do alokacji przestrzennej algorytm musi posortować zbiór przedmiotów malejąco według kryterium: (1) masa jednostkowa, (2) objętość $V = a \cdot b \cdot c$, (3) najdłuższa krawędź $\max(a, b, c)$.
* **Persona:** Tomasz (P1), Janusz (P6).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Zbiór paczek o zróżnicowanej objętości i wadze.
  * **WHEN:** Rozpoczyna się faza sortowania algorytmu.
  * **THEN:** Paczki ciężkie i o największej kubaturze trafiają na początek kolejki alokacji.
  * **THEN:** Paczki kruche i lekkie otrzymują priorytet na końcu kolejki, uniemożliwiając ich podłożenie pod spód.

---

### **BR-PAK-003: Testowanie dopuszczalnych orientacji przestrzennych (6 Rotacji)**
* **Opis:** Dla przedmiotów z flagą `allow_rotation_xyz = true` silnik sprawdza wszystkie 6 permutacji wymiarów: $(a,b,c)$, $(a,c,b)$, $(b,a,c)$, $(b,c,a)$, $(c,a,b)$, $(c,b,a)$, wybierając orientację minimalizującą zmarnowaną przestrzeń w danej osi.
* **Persona:** Kasia (P2), Piotr (P4).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Przedmiot bez restrykcji pionowych o wymiarach $80 \times 40 \times 25\text{ cm}$.
  * **WHEN:** Algorytm szuka dopuszczalnego punktu wstawienia.
  * **THEN:** Jeśli przedmiot nie mieści się w orientacji nominalnej, ale mieści się po obrocie w rzucie bocznym lub pionowym, zostaje zaakceptowany i umieszczony w orientacji dopasowanej.

---

### **BR-PAK-004: Blokada rotacji dla ładunków wrażliwych (Pion i Poziom)**
* **Opis:** Przedmioty oznaczone flagą `allow_rotation_z_only` (np. lodówki, pralki, telewizory) mogą być obracane wyłącznie w osi pionowej Z (2 orientacje: $a \times b$ lub $b \times a$). Oś wysokości $c$ musi pozostać ściśle prostopadła do podłogi.
* **Persona:** Agnieszka (P5).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Przedmiot oznaczony jako „Pralka” ($60 \times 60 \times 85\text{ cm}$, pion wymagany).
  * **WHEN:** Przestrzeń ma wysokość $80\text{ cm}$ (zbyt mała w pionie, ale wystarczająca na leżąco).
  * **THEN:** Algorytm odrzuca wstawienie pralki, oznacza ją statusem kolizji wysokościowej i nie próbuje położyć jej na boku.

---

### **BR-PAK-005: Modelowanie skosu tylnej szyby w 3D (Clipped Bounding Box)**
* **Opis:** Przestrzeń nad podłogą powyżej linii dolnej krawędzi szyb ($H_{\text{shelf}}$) podlega redukcji głębokości zgodnie z kątem natarcia klapy $\alpha$. Każdy punkt wstawienia na wysokości $z > H_{\text{shelf}}$ jest ograniczony funkcją $x_{\text{max}}(z) = L_{\text{floor}} - (z - H_{\text{shelf}}) \cdot \tan(\alpha)$.
* **Persona:** Tomasz (P1), Kasia (P2).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Bagażnik typu hatchback o głębokości podłogi $90\text{ cm}$ i kącie szyby $35^\circ$.
  * **WHEN:** Użytkownik próbuje wstawić pudło o wysokości $70\text{ cm}$ i głębokości $85\text{ cm}$.
  * **THEN:** Silnik wykrywa kolizję z płaszczyzną szyby na wysokości $60\text{ cm}$ i informuje: *„Klapa nie domknie się z powodu skosu szyby (kolizja o 14 cm)”*.

---

### **BR-PAK-006: Strefa przewężenia między nadkolami (Wheel Arches Geometry)**
* **Opis:** Podłoga bagażnika podzielona jest na 3 strefy wzdłuż osi Y: strefa tylna szeroka ($W_{\text{max}}$), strefa centralna zwężona przez nadkola ($W_{\text{min}}$) oraz strefa przy kanapie.
* **Persona:** Tomasz (P1), Janusz (P6).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Przedmiot o szerokości $115\text{ cm}$ oraz bagażnik o $W_{\text{min}} = 100\text{ cm}$ i $W_{\text{max}} = 125\text{ cm}$.
  * **WHEN:** Algorytm próbuje umieścić przedmiot na podłodze.
  * **THEN:** Przedmiot zostaje ulokowany we wnęce za nadkolami lub powyżej poziomu nadkoli (o ile wysokość na to pozwala), a w strefie nadkoli umieszczane są wyłącznie przedmioty o szerokości $\le 100\text{ cm}$.

---

### **BR-PAK-007: Margines bezpieczeństwa i luz technologiczny ($\epsilon$)**
* **Opis:** Do każdego wymiaru przedmiotu dodawany jest wirtualny margines luzu $\epsilon = 15\text{ mm}$ zapobiegający klinowaniu się przedmiotów o sztywnych krawędziach.
* **Persona:** Tomasz (P1), Kasia (P2).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Wymiar skrytki paczkomatu $190\text{ mm}$ i karton o deklarowanej wysokości $190\text{ mm}$.
  * **WHEN:** Uruchamiana jest walidacja dopasowania.
  * **THEN:** System klasyfikuje karton jako „Na styk / Ryzyko zaklinowania” i sugeruje wybór większego gabarytu lub kompresję.

---

### **BR-PAK-008: Wyznaczanie optymalnej kolejności wkładania (Loading Sequence)**
* **Opis:** Algorytm generuje sekwencję kroków załadunku: w pierwszej kolejności pakowane są elementy dosunięte do oparcia kanapy (najgłębsze), następnie elementy centralne, a na końcu przedmioty przy samym progu załadunku.
* **Persona:** Tomasz (P1), Piotr (P4).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Zaakceptowany plan upakowania 6 paczek.
  * **WHEN:** Użytkownik przechodzi do widoku instrukcji załadunku.
  * **THEN:** Paczki otrzymują numery od 1 do 6; paczka oznaczona jako 1 nie może być zablokowana przez paczkę 2 podczas fizycznego wsuwania przez otwór klapy.
