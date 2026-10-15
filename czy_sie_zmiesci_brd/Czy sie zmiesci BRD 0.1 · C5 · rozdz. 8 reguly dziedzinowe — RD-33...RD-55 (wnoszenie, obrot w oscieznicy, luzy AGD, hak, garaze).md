# **Czy się zmieści? (FitCheck) BRD 0.1 — Część C5**

## **Rozdział 8: Reguły dziedzinowe — RD-33…RD-55 (Wnoszenie, ościeżnice, luzy AGD, hak, garaże, skrajnie)**

Niniejszy rozdział definiuje sformalizowane matematycznie reguły dziedzinowe z kryteriami akceptacji Gherkin, wzorami fizycznymi oraz twardymi wektorami testowymi dla weryfikacji wymiarowej przeprowadzek, lokali, mebli i pojazdów.

---

### **RD-33: Wnoszenie przez ościeżnicę drzwiową z ograniczeniami klamki i skrzydła**
* **Formuła:**
  Efektywne światło przejścia $S_{\text{efekt}}$ w otworze drzwiowym:
  $$S_{\text{efekt}} = S_{\text{drzwi\_nominal}} - \Delta_{\text{ościeżnica}} - \delta_{\text{klamka}}(\theta) - \delta_{\text{skrzydło}}(\theta)$$
  gdzie:
  * $\Delta_{\text{ościeżnica}} = 20\,\text{mm}$ (wręby ościeżnicy),
  * $\delta_{\text{klamka}}(\theta) = 60\,\text{mm}$ przy kącie otwarcia $\theta = 90^\circ$, lub $0\,\text{mm}$ przy $\theta \ge 135^\circ$,
  * $\delta_{\text{skrzydło}}(\theta) = 45\,\text{mm}$ (grubość skrzydła) przy $\theta = 90^\circ$, lub $0\,\text{mm}$ przy $\theta = 180^\circ$.
* **Warunek przejścia:**
  $$\min(D_{\text{mebel}}, S_{\text{mebel}}, W_{\text{mebel}}) \le S_{\text{efekt}} - 2 \cdot L_{\text{dłoń}}$$
  gdzie $L_{\text{dłoń}} = 50\,\text{mm}$ (margines na dłonie tragarzy wg normy ergonomicznej EN 1005-2).
* **Wektor testowy T-RD-33:**
  * *Wejście:* Drzwi 80 cm, $\theta = 90^\circ$, lodówka $70 \times 70 \times 185\,\text{cm}$.
  * *Rachunek:* $S_{\text{efekt}} = 800 - 20 - 60 - 45 = 675\,\text{mm}$.
  * *Ocena:* $700\,\text{mm} > 675\,\text{mm} \implies$ **KOLIZJA**. Wymagany demontaż skrzydła drzwi z zawiasów ($S_{\text{efekt}} = 780\,\text{mm} > 700\,\text{mm}$).

---

### **RD-34: Obrót mebla na spoczniku klatki schodowej (Moving Sofa Problem 3D)**
* **Formuła:**
  Dla biegu schodów o szerokości $W_1$, spocznika o szerokości $W_2$ pod kątem $90^\circ$ i wysokości sufitu $H_{\text{spocznik}}$:
  Dla prostopadłościanu o wymiarach $L \times W \times H$:
  Jeżeli przedmiot jest transportowany poziomo, maksymalna długość dopuszczalna:
  $$L_{\text{max\_2D}} = (W_1^{2/3} + W_2^{2/3})^{3/2}$$
  Jeżeli $L > L_{\text{max\_2D}}$, algorytm sprawdza możliwość uniesienia mebla do pionu pod kątem $\phi$:
  $$\sqrt{L^2 \sin^2\phi + H^2 \cos^2\phi} \le H_{\text{spocznik}} - \Delta_{\text{bezpieczeństwa}}$$
* **Wektor testowy T-RD-34:**
  * *Wejście:* $W_1 = 1.10\,\text{m}, W_2 = 1.10\,\text{m}$, kanapa $L = 2.20\,\text{m}, W = 0.90\,\text{m}, H = 0.85\,\text{m}, H_{\text{spocznik}} = 2.30\,\text{m}$.
  * *Rachunek:* $L_{\text{max\_2D}} = (1.1^{2/3} + 1.1^{2/3})^{3/2} \approx 3.11\,\text{m}$ dla linii nieskończenie cienkiej. Przy szerokości $W = 0.90\,\text{m}$ szerokość wolna wynosi jedynie $1.10 - 0.90 = 0.20\,\text{m}$.
  * *Ocena:* Wykrycie kolizji narożnika; konieczność pionizacji pod kątem $65^\circ$.

---

### **RD-35: Przestrzenna przekątna kabiny windy**
* **Formuła:**
  Maksymalna długość sztywnego pręta/blatu mieszczącego się w prostopadłościennej kabinie windy o wymiarach $D \times S \times W$:
  $$\mathcal{D}_{\text{kabina}} = \sqrt{D^2 + S^2 + W^2} - \Delta_{\text{manewr}}$$
  gdzie $\Delta_{\text{manewr}} = 50\,\text{mm}$.
* **Wektor testowy T-RD-35:**
  * *Wejście:* Kabina 4-osobowa: $D = 1.20\,\text{m}, S = 0.90\,\text{m}, W = 2.10\,\text{m}$. Blat $L = 2.60\,\text{m}$.
  * *Rachunek:* $\mathcal{D} = \sqrt{1.20^2 + 0.90^2 + 2.10^2} = \sqrt{1.44 + 0.81 + 4.41} = \sqrt{6.66} \approx 2.58\,\text{m}$.
  * *Ocena:* $2.60\,\text{m} > 2.58\,\text{m} \implies$ **NIE ZMIEŚCI SIĘ**.

---

### **RD-36: Dylatacja montażowa listew przypodłogowych**
* **Formuła:**
  Efektywna szerokość wnęki meblowej przy posadzce $S_{\text{wnęka\_efekt}}$:
  $$S_{\text{wnęka\_efekt}} = S_{\text{ściany}} - 2 \cdot G_{\text{listwa}}$$
  Domyślna wartość $G_{\text{listwa}} = 20\,\text{mm}$ (standardowa listwa MDF/PVC z dylatacją podłogi pływającej).
* **Wektor testowy T-RD-36:**
  * *Wejście:* Wnęka ścienna $S_{\text{ściany}} = 1515\,\text{mm}$, szafa PAX $S_{\text{szafa}} = 1500\,\text{mm}$.
  * *Rachunek:* $S_{\text{wnęka\_efekt}} = 1515 - (2 \times 20) = 1475\,\text{mm}$.
  * *Ocena:* $1500\,\text{mm} > 1475\,\text{mm} \implies$ **KOLIZJA**. Wymagane podcięcie listew.

---

### **RD-37: Odstęp wentylacyjny skraplacza lodówki wolnostojącej**
* **Formuła:**
  Minimalna głębokość wnęki na lodówkę:
  $$G_{\text{wnęka\_min}} = G_{\text{lodówka}} + \delta_{\text{wentyl\_tył}}$$
  gdzie $\delta_{\text{wentyl\_tył}} \ge 50\,\text{mm}$ dla odprowadzenia ciepła ze skraplacza sprężarkowego.
  Minimalna szerokość wnęki: $S_{\text{wnęka\_min}} = S_{\text{lodówka}} + 2 \times 20\,\text{mm}$.
* **Wektor testowy T-RD-37:**
  * *Wejście:* Lodówka $G = 650\,\text{mm}$, wnęka w meblach kuchennych $G_{\text{wnęka}} = 660\,\text{mm}$.
  * *Rachunek:* $660 - 650 = 10\,\text{mm} < 50\,\text{mm}$.
  * *Ocena:* **BŁĄD WENTYLACJI** — ryzyko przegrzania agregatu i utraty gwarancji producenta.

---

### **RD-38: Kąt otwarcia drzwi chłodziarki do wysunięcia szuflad**
* **Formuła:**
  Jeżeli lodówka przylega bokiem do ściany prostopadłej ($d_{\text{ściana}} < 80\,\text{mm}$), maksymalny kąt otwarcia wynosi $\theta_{\text{max}} = 90^\circ$.
  Do swobodnego wysunięcia szuflad zamrażarki bez zaczepiania o uszczelkę drzwiową wymagane jest:
  $$\theta_{\text{wymagany}} \ge 115^\circ \quad \text{lub} \quad d_{\text{ściana}} \ge 80\,\text{mm}$$
* **Wektor testowy T-RD-38:**
  * *Wejście:* $d_{\text{ściana}} = 20\,\text{mm}$, próba pełnego wysunięcia dolnego kosza.
  * *Ocena:* **BLOKADA SZUFLADY**.

---

### **RD-39: Głębokość instalacyjna pralki z przyłączami hydraulicznymi**
* **Formuła:**
  $$G_{\text{pralka\_instal}} = G_{\text{katalog}} + \Delta_{\text{wąż\_odpływ}} + \Delta_{\text{drzwi\_wypukłość}}$$
  gdzie:
  * $\Delta_{\text{wąż\_odpływ}} = 80\,\text{mm}$ (kolano odpływowe i wąż dopływowy ze złączką AquaStop),
  * $\Delta_{\text{drzwi\_wypukłość}} = 35\,\text{mm}$ (krzywizna szyby frontowej drzwiczek).
* **Wektor testowy T-RD-39:**
  * *Wejście:* Pralka „Slim” o głębokości katalogowej $450\,\text{mm}$, szafka łazienkowa o głębokości $500\,\text{mm}$.
  * *Rachunek:* $G_{\text{instal}} = 450 + 80 + 35 = 565\,\text{mm}$.
  * *Ocena:* $565\,\text{mm} > 500\,\text{mm} \implies$ **BRAK MOŻLIWOŚCI ZAMKNIĘCIA FRONTU**.

---

### **RD-40: Ergonomiczne strefy otwarcia mebli i ergonomii (Functional Clearances)**
* **Formuły buforów:**
  * Szafa z drzwiami uchylnymi: $B_{\text{szafa}} = S_{\text{skrzydło}} + 400\,\text{mm}$.
  * Szuflady łóżka/komody: $B_{\text{szuflada}} = G_{\text{wysuw}} + 450\,\text{mm}$.
  * Krzesło przy stole jadalnym: $B_{\text{krzesło}} = 750\,\text{mm}$ (odsunięcie), $B_{\text{przejście}} = 1000\,\text{mm}$ (ciąg komunikacyjny).
* **Wektor testowy T-RD-40:**
  * *Wejście:* Odległość krawędzi stołu od ściany: $700\,\text{mm}$.
  * *Ocena:* **ZBYT CIASNO** (brak możliwości swobodnego wstania od stołu bez uderzenia plecami w ścianę).

---

### **RD-41: Skrajnia garażowa i strefa wysiadania kierowcy**
* **Formuła:**
  Minimalna szerokość stanowiska garażowego do bezpiecznego opuszczenia auta:
  $$S_{\text{garaż\_min}} = S_{\text{auto\_karoseria}} + \Delta_{\text{pasażer\_luz}} + \Delta_{\text{kierowca\_wysiadanie}}$$
  gdzie:
  * $\Delta_{\text{pasażer\_luz}} \ge 250\,\text{mm}$ (odstęp od ściany prawej),
  * $\Delta_{\text{kierowca\_wysiadanie}} \ge 650\,\text{mm}$ (uchylenie drzwi na 1. stopień zapadki ogranicznika drzwi wg wytycznych projektowych garaży).
* **Wektor testowy T-RD-41:**
  * *Wejście:* Auto o szerokości $1850\,\text{mm}$, garaż o szerokości wewnętrznej $2400\,\text{mm}$.
  * *Rachunek:* Dostępna przestrzeń boczna przy parkowaniu centralnym: $(2400 - 1850) / 2 = 275\,\text{mm}$.
  * *Ocena:* $275\,\text{mm} < 650\,\text{mm} \implies$ **KOLIZJA PRZY WYSIADANIU**.

---

### **RD-42: Całkowita wysokość wjazdu z boxem dachowym**
* **Formuła:**
  $$H_{\text{zestaw}} = H_{\text{auto\_nieobciążone}} + H_{\text{belki}} + H_{\text{box}} + \Delta_{\text{margines\_dynamiczny}}$$
  gdzie $\Delta_{\text{margines\_dynamiczny}} = 30\,\text{mm}$ (kompensacja kołysania nadwozia na progach zwalniających).
* **Wektor testowy T-RD-42:**
  * *Wejście:* Auto $1550\,\text{mm}$, belki $90\,\text{mm}$, box $410\,\text{mm}$, wjazd z tabliczką „B-16: 2.0 m” ($2000\,\text{mm}$).
  * *Rachunek:* $H_{\text{zestaw}} = 1550 + 90 + 410 + 30 = 2080\,\text{mm} = 2.08\,\text{m}$.
  * *Ocena:* $2.08\,\text{m} > 2.00\,\text{m} \implies$ **ZAKAZ WJAZDU — KOLIZJA**.

---

### **RD-43: Wysokość otwarcia klapy bagażnika w garażu**
* **Formuła:**
  Warunek bezkolizyjnego otwarcia klapy bagażnika:
  $$H_{\text{klapa\_otwarta}} \le \min(H_{\text{strop}}, H_{\text{prowadnice\_bramy}}) - 50\,\text{mm}$$
* **Wektor testowy T-RD-43:**
  * *Wejście:* SUV z klapą na wysokość $2180\,\text{mm}$, prowadnice bramy segmentowej na wysokości $2100\,\text{mm}$.
  * *Ocena:* **KOLIZJA O 130 MM**.

---

### **RD-44: Bilans nacisku pionowego na kulę haka holowniczego (S)**
* **Formuła:**
  $$M_{\text{bagażnik\_hak}} = M_{\text{uchwyt}} + \sum_{i=1}^N M_{\text{rower}_i} \le S_{\text{homologacja\_haka}}$$
  oraz warunek momentu gnącego:
  $$d_{\text{środek\_masy}} \le d_{\text{max\_producenta\_haka}}$$
* **Wektor testowy T-RD-44:**
  * *Wejście:* $S = 75\,\text{kg}$, platforma na 3 rowery $18\,\text{kg}$, dwa rowery e-bike po $25\,\text{kg}$ i rower tradycyjny $14\,\text{kg}$.
  * *Rachunek:* $18 + 50 + 14 = 82\,\text{kg}$.
  * *Ocena:* $82\,\text{kg} > 75\,\text{kg} \implies$ **PRZECIĄŻENIE O 7 KG**.

---

### **RD-45: Zwis ładunku poza obrys pojazdu (art. 61 ust. 6 PoRD)**
* **Formuła:**
  * Zwis przedni: $Z_{\text{przód}} \le 500\,\text{mm}$ od przedniej krawędzi obrysu pojazdu oraz $\le 1500\,\text{mm}$ od siedzenia kierowcy.
  * Zwis tylny: $Z_{\text{tył}} \le 2000\,\text{mm}$ od tylnej płaszczyzny obrysu pojazdu.
  * Szerokość całkowita z ładunkiem: $S_{\text{łączna}} \le 2550\,\text{mm}$, a ładunek nie może wystawać z żadnej strony na więcej niż $230\,\text{mm}$.
* **Wektor testowy T-RD-45:**
  * *Wejście:* Rury kanalizacyjne 3.0 m wystające z tyłu auta o 2.2 m za zderzak.
  * *Ocena:* **PRZEKROCZENIE PRZEPISÓW O 20 CM — ZAKAZ JAZDY**.

---

### **RD-46: Klatka kennelowa a profil tylnej szyby**
* **Formuła:**
  Profil wysokościowy szyby $Z_{\text{szyba}}(y) = Z_0 - y \cdot \tan\alpha_{\text{szyba}}$.
  Profil klatki: $Z_{\text{klatka}}(y) = H_{\text{klatka\_baza}} + y \cdot \tan\alpha_{\text{klatka}}$.
  Warunek dopasowania: $\forall y \in [0, D_{\text{klatka}}]: Z_{\text{klatka}}(y) \le Z_{\text{szyba}}(y) - \Delta_{\text{luz}}$ ($\Delta_{\text{luz}} = 30\,\text{mm}$).
* **Wektor testowy T-RD-46:**
  * *Wejście:* Skos szyby $35^\circ$, klatka prosta bez skosu ($\alpha = 0^\circ$).
  * *Ocena:* Kolizja górnego tylnego rantu klatki z szybą na wysokości $55\,\text{cm}$.

---

### **RD-47: Dopuszczalny nacisk punktowy na podłogę bagażnika**
* **Formuła:**
  Dla aut z podwójną podłogą modułową:
  $$M_{\text{ładunek\_skupiony}} \le M_{\text{max\_półka}}$$
  gdzie $M_{\text{max\_półka}} = 120\,\text{kg}$ dla podłóg zawieszonych na bocznych szynach z tworzywa sztucznego.
* **Wektor testowy T-RD-47:**
  * *Wejście:* 6 worków zaprawy cementowej po $25\,\text{kg}$ ($150\,\text{kg}$) ułożonych w stosie na środku podłogi podwójnej.
  * *Ocena:* **RYZYKO ZAŁAMANIA PÓŁKI**.

---

### **RD-48: Skosy poddasza i wysokość użytkowa**
* **Formuła:**
  Wysokość przestrzeni poddasza w odległości $x$ od ścianki kolankowej:
  $$H(x) = H_k + x \cdot \tan\alpha$$
  Odległość do osiągnięcia pełnej wysokości stojącej ($H_{\text{stojąca}} = 1900\,\text{mm}$):
  $$x_{190} = \frac{1900 - H_k}{\tan\alpha}$$
* **Wektor testowy T-RD-48:**
  * *Wejście:* $H_k = 800\,\text{mm}, \alpha = 40^\circ \implies \tan 40^\circ \approx 0.839$.
  * *Rachunek:* $x_{190} = (1900 - 800) / 0.839 = 1100 / 0.839 \approx 1311\,\text{mm} = 1.31\,\text{m}$.

---

### **RD-49: Szacowanie kubatury mienia przeprowadzkowego**
* **Formuła:**
  $$V_{\text{mienie}} = A_{\text{lokal}} \cdot \kappa_{\text{stopień\_umeblowania}} \cdot (1 + 0.15 \cdot (N_{\text{mieszkańcy}} - 1))$$
  gdzie:
  * $\kappa_{\text{minimalistyczny}} = 0.25\,\text{m}^3/\text{m}^2$,
  * $\kappa_{\text{standardowy}} = 0.40\,\text{m}^3/\text{m}^2$,
  * $\kappa_{\text{gęsty}} = 0.55\,\text{m}^3/\text{m}^2$.
* **Wektor testowy T-RD-49:**
  * *Wejście:* $A = 50\,\text{m}^2$, Standardowy, 2 mieszkańców.
  * *Rachunek:* $V = 50 \cdot 0.40 \cdot (1 + 0.15 \cdot 1) = 20 \cdot 1.15 = 23.0\,\text{m}^3$.

---

### **RD-50: Korytarz inspekcyjny boksu self-storage**
* **Formuła:**
  Efektywna powierzchnia składowania $A_{\text{składowanie}}$ w boksie $D \times S$ z korytarzem centralnym o szerokości $W_{\text{korytarz}} = 500\,\text{mm}$:
  $$A_{\text{składowanie}} = D \cdot S - (D \cdot W_{\text{korytarz}}) = D \cdot (S - 0.50)$$
* **Wektor testowy T-RD-50:**
  * *Wejście:* Boks $3.0 \times 2.0\,\text{m}$ ($6.0\,\text{m}^2$).
  * *Rachunek:* $A_{\text{składowanie}} = 3.0 \cdot (2.0 - 0.50) = 4.5\,\text{m}^2$.

---

### **RD-51: Strefa opuszczenia frontu zmywarki**
* **Formuła:**
  Wymagana odległość między liniami zabudowy kuchennej naprzeciwległej:
  $$D_{\text{kuchnia\_min}} = L_{\text{klapa\_zmywarki}} + L_{\text{osoba\_klęcząca}} = 650\,\text{mm} + 400\,\text{mm} = 1050\,\text{mm}$$
* **Wektor testowy T-RD-51:**
  * *Wejście:* Odległość szafek: $900\,\text{mm}$.
  * *Ocena:* Kolizja ergonomiczna przy wyjmowaniu dolnego kosza.

---

### **RD-52: Wytrzymałość relingów i belek dachowych**
* **Formuła:**
  $$M_{\text{belki}} + M_{\text{box}} + \sum m_{\text{bagaż}} \le \min(M_{\text{relingi\_homolog}}, M_{\text{belki\_max}})$$
  Standardowe limity fabryczne: $50\,\text{kg}, 75\,\text{kg}$ lub $100\,\text{kg}$.
* **Wektor testowy T-RD-52:**
  * *Wejście:* Limit dachu $75\,\text{kg}$, belki $5\,\text{kg}$, box pusty $18\,\text{kg}$. Ładunek: $60\,\text{kg}$.
  * *Rachunek:* $5 + 18 + 60 = 83\,\text{kg} > 75\,\text{kg} \implies$ **PRZECIĄŻENIE DACHU O 8 KG**.

---

### **RD-53: Limit obciążenia ręcznego zespołu tragarzy**
* **Formuła:**
  Maksymalna waga pojedynczego mebla/urządzenia wnoszonego ręcznie po schodach:
  $$M_{\text{monolit}} \le N_{\text{tragarze}} \cdot 50\,\text{kg}$$
  zgodnie z rozporządzeniem BHP dotyczącym prac transportowych dorywczych dla mężczyzn.
* **Wektor testowy T-RD-53:**
  * *Wejście:* Sejf $160\,\text{kg}$, zespół 2 osób ($2 \times 50 = 100\,\text{kg}$).
  * *Ocena:* **ZAKAZ WNOSZENIA RĘCZNEGO W 2 OSOBY** (wymaga min. 4 osób lub schodołazu).

---

### **RD-54: Przechył transportowy lodówki z agregatem**
* **Formuła:**
  Kąt przechyłu $\theta_{\text{przechył}} \le 45^\circ$. W razie konieczności transportu na płasko ($\theta = 90^\circ$):
  $$t_{\text{odstanie\_oleju}} \ge 12\,\text{godzin}$$
  przed włączeniem do sieci elektrycznej.
* **Wektor testowy T-RD-54:**
  * *Wejście:* Transport poziomy na boku.
  * *Ocena:* Wyświetlenie obowiązkowego timera odliczającego 12h do pierwszego uruchomienia.

---

### **RD-55: Wymagany luz dłoni tragarzy w przewężeniach**
* **Formuła:**
  Dla każdego ciągu komunikacyjnego (drzwi, zwężenia korytarzy, ościeżnice):
  $$S_{\text{przejście}} \ge S_{\text{mebel}} + 2 \cdot 50\,\text{mm}$$
* **Wektor testowy T-RD-55:**
  * *Wejście:* Korytarz $85\,\text{cm}$, kanapa $80\,\text{cm}$. Luz $5\,\text{cm}$ łącznie ($2.5\,\text{cm}$ na stronę).
  * *Ocena:* **OSTRZEŻENIE O PRZYTRZAŚNIĘCIU DŁONI I OTARCIU ŚCIANY**.
