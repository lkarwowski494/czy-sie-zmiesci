# **Czy się zmieści? (FitCheck) BRD 0.1 — Część B6**

## **Rozdział 7: Wymagania Funkcjonalne — Masa, Ładowność i Bezpieczeństwo (BR-MAS-001…BR-MAS-035)**

---

### **BR-MAS-001: Automatyczny bilans masy całkowitej ładunku**
* **Opis:** System w czasie rzeczywistym sumuje masę wszystkich przedmiotów dodanych do aktywnej sesji załadunku: $M_{\text{total}} = \sum_{i=1}^N m_i$.
* **Persona:** Tomasz (P1), Janusz (P6).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Lista ładunków zawierająca 4 walizki po $20\text{ kg}$ i wózek $12\text{ kg}$.
  * **WHEN:** Użytkownik przegląda podsumowanie załadunku.
  * **THEN:** Wskaźnik masy wyświetla wartość $92\text{ kg}$ wraz z informacją o pozostałym zapasie ładowności auta.

---

### **BR-MAS-002: Weryfikacja Dopuszczalnej Masy Całkowitej (DMC) i ładowności netto**
* **Opis:** Porównanie masy sumarycznej ładunku i pasażerów z fabryczną ładownością pojazdu ($Ł_{\text{netto}} = \text{DMC} - \text{Masa Własna} - N_{\text{pasażer}} \cdot 75\text{ kg}$).
* **Persona:** Tomasz (P1), Janusz (P6).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Skoda Octavia o ładowności fabrycznej $550\text{ kg}$ z 4 osobami na pokładzie ($300\text{ kg}$). Pozostała ładowność netto na bagaż: $250\text{ kg}$.
  * **WHEN:** Użytkownik doda ładunek o masie $280\text{ kg}$ (np. płytki ceramiczne).
  * **THEN:** Pasek ładowności zmienia kolor na jaskrawoczerwony.
  * **THEN:** Wyświetla się ostrzeżenie: *„Przekroczenie dopuszczalnej ładowności o 30 kg! Zagrożenie mandatem (art. 61 PoRD) oraz wydłużeniem drogi hamowania”*.

---

### **BR-MAS-003: Wyliczanie wzdłużnego położenia środka ciężkości (CoG)**
* **Opis:** Wyznaczenie współrzędnej wzdłużnej środka masy ładunku: $X_{\text{CoG}} = \frac{\sum m_i \cdot x_i}{\sum m_i}$ w odniesieniu do osi tylnej samochodu.
* **Persona:** Tomasz (P1).
* **Priorytet:** **SHOULD** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Załadowane 2 ciężkie walizki ($2 \times 30\text{ kg}$) umieszczone przy samej klapie załadunkowej za tylną osią, podczas gdy przód bagażnika jest pusty.
  * **WHEN:** Silnik analizuje stabilność pojazdu.
  * **THEN:** Aplikacja wyświetla podpowiedź optymalizacyjną: *„Przesuń najcięższe torby pod oparcie tylnej kanapy, aby dociążyć przednią oś i zachować stabilność toru jazdy”*.

---

### **BR-MAS-004: Ostrzeżenie o widoczności wstecznej (Linia Szyb)**
* **Opis:** Monitorowanie wysokości ładunku względem dolnej linii okien tylnych.
* **Persona:** Tomasz (P1), Kasia (P2).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Przedmioty ułożone powyżej wysokości rolety bagażnika ($H > H_{\text{shelf}}$).
  * **WHEN:** Załadunek zasłania światło tylnej szyby.
  * **THEN:** Aplikacja wyświetla żółty wskaźnik: *„Widok w lusterku wstecznym zasłonięty. Upewnij się, że prawe i lewe lusterko zewnętrzne są prawidłowo ustawione (art. 61 ust. 2 pkt 2 PoRD)”*.

---

### **BR-MAS-005: Obliczenie siły bezwładności ładunku przy zderzeniu (Kalkulator Bezpieczeństwa)**
* **Opis:** Moduł edukacyjno-ostrzegawczy wyliczający siłę naporu luźnego ładunku na oparcia foteli przy gwałtownym hamowaniu z opóźnieniem $0,8g$ lub zderzeniu przy $50\text{ km/h}$ (przeciążenie rzędu $20g$–$30g$).
* **Persona:** Tomasz (P1), Agnieszka (P5).
* **Priorytet:** **SHOULD** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Niezabezpieczona walizka o masie $20\text{ kg}$ położona na samej górze stosu.
  * **WHEN:** Użytkownik dotyka ikony informacji o bezpieczeństwie.
  * **THEN:** Aplikacja wyświetla przelicznik fizyczny: *„Przy zderzeniu czołowym przy prędkości 50 km/h ta walizka uderzy w oparcie z siłą odpowiadającą masie ok. 600 kg. Zabezpiecz ją pasami lub opuść na podłogę”*.
