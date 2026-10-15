# **Czy się zmieści? (FitCheck) BRD 0.1 — Część C3**

## **Rozdział 8: Reguły Dziedzinowe — Masa, Stabilność, Ościeżnice i Prawo (RD-17…RD-32)**

---

### **RD-17: Bilans ładowności netto pojazdu**
* **Szczebel hierarchii:** Szczebel 2 (Świadectwo homologacji typu pojazdu, Rozporządzenie UE 1230/2012).
* **Formuła:**
  Dopuszczalna ładowność netto na bagaż w pojeździe wynosi:
  $$M_{\text{cargo\_max}} = \text{DMC} - M_{\text{curb}} - (N_{\text{passengers}} \cdot 75\text{ kg})$$
  gdzie $\text{DMC}$ to dopuszczalna masa całkowita (pole F.2 dowodu rejestracyjnego), $M_{\text{curb}}$ to masa własna z kierowcą 75 kg (pole G), a $N_{\text{passengers}}$ to liczba dodatkowych pasażerów.
* **Wektor testowy RD-17-V1:**
  * **Wejście:** $\text{DMC} = 1950\text{ kg}$, $M_{\text{curb}} = 1400\text{ kg}$, kierowca + 3 pasażerów ($N_{\text{passengers}} = 3$).
  * **Oczekiwany wynik:** $M_{\text{cargo\_max}} = 1950 - 1400 - (3 \cdot 75) = 550 - 225 = 325\text{ kg}$. Załadowanie $350\text{ kg}$ generuje przekroczenie o $25\text{ kg}$ (alert czerwony).

---

### **RD-18: Wzdłużne położenie środka ciężkości ładunku (Center of Gravity CoG)**
* **Szczebel hierarchii:** Szczebel 3 (Podręczniki dynamiki pojazdów: Zanger & Kraemer).
* **Formuła:**
  Dla zbioru $N$ paczek o masach $m_i$ i odległościach wzdłużnych $x_i$ od linii oparcia tylnej kanapy:
  $$X_{\text{CoG}} = \frac{\sum_{i=1}^N m_i \cdot x_i}{\sum_{i=1}^N m_i}$$
  Bezpieczny zakres środka ciężkości bagażu: $X_{\text{CoG}} \le 0,45 \cdot L_{\text{floor}}$ (środek ciężkości powinien znajdować się przed osią tylną lub maksymalnie blisko oparcia kanapy).
* **Wektor testowy RD-18-V1:**
  * **Wejście:** $L_{\text{floor}} = 100\text{ cm}$. Paczka A ($50\text{ kg}$) w $x=10\text{ cm}$, Paczka B ($10\text{ kg}$) w $x=90\text{ cm}$.
  * **Oczekiwany wynik:** $X_{\text{CoG}} = \frac{50 \cdot 10 + 10 \cdot 90}{60} = \frac{500 + 900}{60} = 23,33\text{ cm} \le 45\text{ cm} \implies$ `Status = Bezpieczny`.

---

### **RD-19: Siła bezwładności ładunku wg normy PN-EN 12195-1**
* **Szczebel hierarchii:** Szczebel 2 (Norma europejska PN-EN 12195-1).
* **Formuła:**
  Maksymalna siła bezwładności działająca na ładunek podczas hamowania awaryjnego (kierunek wzdłużny w przód):
  $$F_{x, \text{fwd}} = c_x \cdot m \cdot g \quad \text{gdzie } c_x = 0,8$$
  W kierunku poprzecznym (skręt) oraz w tył (przyspieszanie):
  $$F_y = 0,5 \cdot m \cdot g, \quad F_{x, \text{bwd}} = 0,5 \cdot m \cdot g$$
* **Wektor testowy RD-19-V1:**
  * **Wejście:** Niezabezpieczona walizka $m = 25\text{ kg}$, przyspieszenie ziemskie $g = 9,81\text{ m/s}^2$.
  * **Oczekiwany wynik:** $F_{x, \text{fwd}} = 0,8 \cdot 25 \cdot 9,81 = 196,2\text{ N} \approx 20\text{ kG}$ przy hamowaniu $0,8g$.
  * **Przy zderzeniu miejskim (opóźnienie $20g$):** $F = 20 \cdot 25 \cdot 9,81 \approx 4905\text{ N}$ (odpowiednik nacisku pół tony!).

---

### **RD-20: Rzeczywista szerokość światła ościeżnicy drzwiowej ze skrzydłem**
* **Szczebel hierarchii:** Szczebel 2 (Warunki Techniczne budynków Dz.U. 2019 poz. 1065).
* **Formuła:**
  Dla otworu drzwiowego o szerokości nominalnej skrzydła $W_{\text{door}}$ (np. 80 cm):
  $$W_{\text{clear}} = W_{\text{door}} - 20\text{ mm} \quad (\text{ościeżnica bez skrzydła})$$
  $$W_{\text{effective}} = W_{\text{door}} - 20\text{ mm} - 60\text{ mm} = W_{\text{door}} - 80\text{ mm} \quad (\text{skrzydło otwarte pod kątem } 90^\circ)$$
* **Wektor testowy RD-20-V1:**
  * **Wejście:** Drzwi pokojowe „80” ($W_{\text{door}} = 800\text{ mm}$), skrzydło niewymontowane. Mebel o szerokości $740\text{ mm}$.
  * **Oczekiwany wynik:** $W_{\text{effective}} = 800 - 80 = 720\text{ mm}$. Mebel $740\text{ mm}$ nie przejdzie (brakuje 20 mm). Przy zdjęciu skrzydła ($780\text{ mm}$) mebel przechodzi z luzem 40 mm.

---

### **RD-21: Wystawanie ładunku poza tylny obrys (Prawo o Ruchu Drogowym art. 61)**
* **Szczebel hierarchii:** Szczebel 2 (Ustawa z dn. 20 czerwca 1997 r. — Prawo o Ruchu Drogowym).
* **Formuła:**
  Dopuszczalna długość wystawania ładunku poza tylną płaszczyznę obrysu pojazdu:
  $$L_{\text{overhang}} \le 2,0\text{ m}$$
  Warunek oznakowania: Jeśli $L_{\text{overhang}} > 0,5\text{ m}$, ładunek musi być oznaczony chorągiewką barwy czerwonej o wymiarach min. $50 \times 50\text{ cm}$ lub pasami biało-czerwonymi.
* **Wektor testowy RD-21-V1:**
  * **Wejście:** Ładunek wystający z otwartego bagażnika na odległość $0,8\text{ m}$.
  * **Oczekiwany wynik:** `Status = Dopuszczalny`, `Wymóg oznakowania = Tak (czerwona chorągiewka)`.
* **Wektor testowy RD-21-V2:**
  * **Wejście:** Deski wystające na odległość $2,25\text{ m}$.
  * **Oczekiwany wynik:** `Status = Niedopuszczalny / Nielegalny` (przekroczenie limitu $2,0\text{ m}$ o $25\text{ cm}$, zakaz jazdy).

---

### **RD-22: Warunek zachowania widoczności (Art. 61 ust. 2 pkt 2 PoRD)**
* **Szczebel hierarchii:** Szczebel 2 (Przepisy o warunkach technicznych pojazdów).
* **Formuła:**
  Ładunek może zasłaniać pole widzenia w wewnętrznym lusterku wstecznym tylko wtedy, gdy pojazd wyposażony jest w prawe i lewe lusterko zewnętrzne zapewniające wymaganą strefę widoczności:
  $$\text{RearMirrorBlocked} = \text{true} \implies (\text{LeftExteriorMirror} = \text{OK} \land \text{RightExteriorMirror} = \text{OK})$$
  Całkowicie zabronione jest jakiekolwiek zasłanianie przedniej szyby lub szyb przednich drzwi bocznych.
* **Wektor testowy RD-22-V1:**
  * **Wejście:** Stos paczek sięgający dachu pojazdu ($z = H_{\text{roof}}$).
  * **Oczekiwany wynik:** Monit bezpieczeństwa: *„Lusterko wsteczne zasłonięte. Skontroluj ustawienie prawego i lewego lusterka bocznego przed ruszeniem w trasę”*.
