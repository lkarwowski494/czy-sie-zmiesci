# **Czy się zmieści? (FitCheck) BRD 0.1 — Część C2**

## **Rozdział 8: Reguły Dziedzinowe — Geometria 3D, VDA i Skosy (RD-01…RD-16)**

Wszystkie reguły dziedzinowe są deterministycznymi formułami matematycznymi. Każda reguła posiada formalny wektor testowy, który musi być weryfikowany w ramach automatycznych testów jednostkowych (`tests/domain-rules.test.ts`).

---

### **RD-01: Warunek bezkolizyjności brył 3D (No-Overlap Constraint)**
* **Szczebel hierarchii:** Szczebel 1 (Matematyka i stereometria).
* **Formuła:**
  Dwa prostopadłościany $A$ i $B$ o współrzędnych narożników bazowych $(x_A, y_A, z_A)$, $(x_B, y_B, z_B)$ i wymiarach $(w_A, d_A, h_A)$, $(w_B, d_B, h_B)$ nie kolidują wtedy i tylko wtedy, gdy:
  $$(x_A + w_A \le x_B) \lor (x_B + w_B \le x_A) \lor (y_A + d_A \le y_B) \lor (y_B + d_B \le y_A) \lor (z_A + h_A \le z_B) \lor (z_B + h_B \le z_A)$$
* **Wektor testowy RD-01-V1:**
  * **Wejście:** $A: (0, 0, 0), [50, 40, 30]$; $B: (50, 0, 0), [30, 40, 30]$.
  * **Oczekiwany wynik:** `Overlap = false` (stykają się ścianami $x=50$, brak kolizji objętościowej).
* **Wektor testowy RD-01-V2:**
  * **Wejście:** $A: (0, 0, 0), [50, 40, 30]$; $B: (49, 10, 10), [20, 20, 20]$.
  * **Oczekiwany wynik:** `Overlap = true` (kolizja o głębokości $1\text{ cm}$ w osi X).

---

### **RD-02: Generowanie punktów ekstremalnych (Extreme Points 3D)**
* **Szczebel hierarchii:** Szczebel 3 (Publikacje naukowe: Crainic et al.).
* **Formuła:**
  Wstawienie prostopadłościanu $k$ w punkcie $(x_k, y_k, z_k)$ o wymiarach $(w_k, d_k, h_k)$ generuje do 3 nowych potencjalnych punktów ekstremalnych:
  $$EP_1 = (x_k + w_k, y_k, z_k), \quad EP_2 = (x_k, y_k + d_k, z_k), \quad EP_3 = (x_k, y_k, z_k + h_k)$$
  Każdy punkt jest rzutowany na sąsiednie ścianki wcześniej umieszczonych brył w celu zapewnienia podparcia grawitacyjnego (brak zawieszenia w powietrzu).
* **Wektor testowy RD-02-V1:**
  * **Wejście:** Pusta przestrzeń $[100, 100, 100]$, wstawienie klocka $[40, 30, 20]$ w $(0,0,0)$.
  * **Oczekiwany wynik:** Zbiór aktywnych punktów: $EP = \{(40, 0, 0), (0, 30, 0), (0, 0, 20)\}$.

---

### **RD-03: Kąt natarcia otworu załadunkowego (Aperture Passage Test)**
* **Szczebel hierarchii:** Szczebel 1 (Rzutowanie 2D).
* **Formuła:**
  Przedmiot o wymiarach $(a, b, c)$ przejdzie przez prostokątny otwór klapy $(W_{\text{ap}}, H_{\text{ap}})$ wtedy i tylko wtedy, gdy istnieje przynajmniej jedna para jego krawędzi $(u, v) \in \{a, b, c\}^2, u \ne v$, taka że:
  $$\min(u, v) \le \min(W_{\text{ap}}, H_{\text{ap}}) \land \max(u, v) \le \max(W_{\text{ap}}, H_{\text{ap}})$$
  Dla przedmiotów sztywnych rotacja skośna dopuszczalna jest w granicach przekątnej otworu $D_{\text{ap}} = \sqrt{W_{\text{ap}}^2 + H_{\text{ap}}^2}$.
* **Wektor testowy RD-03-V1:**
  * **Wejście:** Otwór klapy $W_{\text{ap}} = 100\text{ cm}$, $H_{\text{ap}} = 75\text{ cm}$. Przedmiot $a=110, b=70, c=50\text{ cm}$.
  * **Oczekiwany wynik:** `Passes = true` (przechodzi na wprost przekrojem $70 \times 50\text{ cm}$, długość $110\text{ cm}$ wsuwana w głąb).
* **Wektor testowy RD-03-V2:**
  * **Wejście:** Otwór klapy $100 \times 75\text{ cm}$. Przedmiot $a=105, b=80, c=40\text{ cm}$.
  * **Oczekiwany wynik:** `Passes = true` (po obrocie w osi podłużnej o $35^\circ$ rzut mieści się w świetle przekątnej $125\text{ cm}$).

---

### **RD-04: Metoda blokowa ISO 3832:2002 (Kalkulacja VDA)**
* **Szczebel hierarchii:** Szczebel 2 (Norma międzynarodowa ISO 3832).
* **Formuła:**
  Objętość VDA wyliczana jest jako liczba modułowych prostopadłościanów $200 \times 100 \times 50\text{ mm}$ ($V_{\text{block}} = 1\text{ dm}^3 = 1\text{ l}$), które mieszczą się w przestrzeni bagażnika poniżej dolnej krawędzi szyb:
  $$V_{\text{VDA}} = \sum_{k=1}^M 1\text{ litr} \le V_{\text{geom}}$$
* **Wektor testowy RD-04-V1:**
  * **Wejście:** Idealny prostopadłościan $1000 \times 1000 \times 500\text{ mm}$.
  * **Oczekiwany wynik:** Objętość geometryczna: $500\text{ l}$. Objętość VDA: dokładnie $500$ bloczków ($5 \times 10 \times 10 = 500\text{ l}$).
* **Wektor testowy RD-04-V2:**
  * **Wejście:** Bagażnik z nadkolami o wymiarach nieregularnych (objętość płynna $460\text{ l}$).
  * **Oczekiwany wynik:** Objętość VDA: $412\text{ l}$ (różnica $48\text{ l}$ w szczelinach niedostępnych dla bloczka $200 \times 100 \times 50$).

---

### **RD-05: Redukcja głębokości skosem tylnej szyby (Slanted Tailgate Cut)**
* **Szczebel hierarchii:** Szczebel 1 (Trygonometria płaska).
* **Formuła:**
  Dla bagażnika o długości podłogi $L_{\text{floor}}$, wysokości do rolety $H_{\text{shelf}}$ i kącie pochylenia szyby $\alpha$ mierzonej od pionu, maksymalna głębokość załadunku na wysokości $z > H_{\text{shelf}}$ wynosi:
  $$L(z) = L_{\text{floor}} - (z - H_{\text{shelf}}) \cdot \tan(\alpha)$$
* **Wektor testowy RD-05-V1:**
  * **Wejście:** $L_{\text{floor}} = 100\text{ cm}$, $H_{\text{shelf}} = 50\text{ cm}$, $\alpha = 45^\circ$ ($\tan(45^\circ) = 1,0$).
  * **Punkt testowy:** Wysokość $z = 70\text{ cm}$ (20 cm ponad roletę).
  * **Oczekiwany wynik:** $L(70) = 100 - (70 - 50) \cdot 1,0 = 80\text{ cm}$. Pudło o długości $85\text{ cm}$ koliduje o $5\text{ cm}$.

---

### **RD-06: Geometria strefy nadkoli (Wheel Arch Constraints)**
* **Szczebel hierarchii:** Szczebel 1 (Podział strefowy).
* **Formuła:**
  Dla nadkoli zlokalizowanych w przedziale wzdłużnym $[x_{\text{arch\_start}}, x_{\text{arch\_end}}]$ o wysokości $H_{\text{arch}}$, dopuszczalna szerokość $W(x, z)$ wynosi:
  $$W(x, z) = \begin{cases} W_{\text{min}}, & \text{dla } x \in [x_{\text{arch\_start}}, x_{\text{arch\_end}}] \land z < H_{\text{arch}} \\ W_{\text{max}}, & \text{w pozostałych przypadkach} \end{cases}$$
* **Wektor testowy RD-06-V1:**
  * **Wejście:** $W_{\text{min}} = 100\text{ cm}$, $W_{\text{max}} = 125\text{ cm}$, $H_{\text{arch}} = 30\text{ cm}$, strefa $[30, 70\text{ cm}]$.
  * **Paczka:** Szerokość $110\text{ cm}$ wstawiona na podłodze ($z=0$) na pozycji $x=40\text{ cm}$.
  * **Oczekiwany wynik:** `Collision = true` (przekroczenie $W_{\text{min}}$ o $10\text{ cm}$).
  * **Paczka ta sama na wysokości $z=35\text{ cm}$:** `Collision = false` (leży powyżej linii nadkoli).

---

### **RD-07: Przekątna przestrzenna prostopadłościanu (Space Diagonal)**
* **Szczebel hierarchii:** Szczebel 1 (Twierdzenie Pitagorasa w 3D).
* **Formuła:**
  Maksymalna długość sztywnego pręta/paczki, która może zmieścić się w przestrzeni prostopadłościennej o wymiarach $(A, B, C)$:
  $$D_{\text{space}} = \sqrt{A^2 + B^2 + C^2}$$
* **Wektor testowy RD-07-V1:**
  * **Wejście:** Przestrzeń windy $A=100\text{ cm}, B=100\text{ cm}, C=200\text{ cm}$.
  * **Oczekiwany wynik:** $D = \sqrt{10000 + 10000 + 40000} = \sqrt{60000} \approx 244,95\text{ cm}$. Listwa o długości $240\text{ cm}$ mieści się po przekątnej przestrzennej.

---

### **RD-08: Skrajnia technologiczna paczkomatu (Locker Clearance)**
* **Szczebel hierarchii:** Szczebel 2 (Regulamin operatora pocztowego + mechanika zamka).
* **Formuła:**
  Dla skrytki o wymiarach nominalnych $(W_{\text{nom}}, H_{\text{nom}}, D_{\text{nom}})$, maksymalny dopuszczalny wymiar kartonu wynosi:
  $$W_{\text{safe}} = W_{\text{nom}} - 10\text{ mm}, \quad H_{\text{safe}} = H_{\text{nom}} - 10\text{ mm}, \quad D_{\text{safe}} = D_{\text{nom}} - 15\text{ mm}$$
* **Wektor testowy RD-08-V1:**
  * **Wejście:** Gabaryt B InPost ($H_{\text{nom}} = 190\text{ mm}$).
  * **Oczekiwany wynik:** $H_{\text{safe}} = 180\text{ mm}$. Karton $185\text{ mm}$ otrzymuje status ostrzeżenia żółtego.

---

### **RD-09: Współczynnik kompresji toreb miękkich (Soft Bag Compression)**
* **Szczebel hierarchii:** Szczebel 5 (Praktyka i testy laboratoryjne).
* **Formuła:**
  Dla ładunków oznaczonych flagą `is_soft_bag = true`, najmniejszy wymiar może ulec zmniejszeniu o współczynnik kompresji $k_{\text{comp}} \in [0,85; 1,00]$ (maksymalnie 15% ugięcia pod wpływem dociśnięcia):
  $$c_{\text{eff}} = c \cdot k_{\text{comp}}$$
* **Wektor testowy RD-09-V1:**
  * **Wejście:** Miękka torba sportowa o grubości $22\text{ cm}$ sprawdzana w sizerze lotniczym o głębokości $20\text{ cm}$.
  * **Oczekiwany wynik:** $c_{\text{eff}} = 22 \cdot 0,85 = 18,7\text{ cm} \le 20\text{ cm} \implies$ `Passes = true` (zmieści się po dociśnięciu ręką).

---

### **RD-10: Współczynnik wykorzystania przestrzeni (Packing Density $\eta$)**
* **Szczebel hierarchii:** Szczebel 1 (Rachunek stereometryczny).
* **Formuła:**
  $$\eta = \frac{\sum_{i=1}^N V_{\text{item}, i}}{V_{\text{trunk\_usable}}} \times 100\%$$
* **Wektor testowy RD-10-V1:**
  * **Wejście:** Objętość bagażnika użyteczna: $400\text{ l}$. Objętość 3 spakowanych walizek: $120\text{ l} + 80\text{ l} + 60\text{ l} = 260\text{ l}$.
  * **Oczekiwany wynik:** $\eta = \frac{260}{400} \times 100\% = 65,0\%$. Pozostała wolna przestrzeń na miękkie pakunki: $140\text{ l}$ (35%).
