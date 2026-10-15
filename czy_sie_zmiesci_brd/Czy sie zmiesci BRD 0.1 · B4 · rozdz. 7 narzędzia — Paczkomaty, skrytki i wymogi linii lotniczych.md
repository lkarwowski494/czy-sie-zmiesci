# **Czy się zmieści? (FitCheck) BRD 0.1 — Część B4**

## **Rozdział 7: Wymagania Funkcjonalne — Paczkomaty i Linie Lotnicze (BR-LOT-001…BR-LOT-030)**

---

### **BR-LOT-001: Jednoczesna weryfikacja macierzowa (Multi-Checker Matrix)**
* **Opis:** Po wpisaniu przez użytkownika 3 wymiarów paczki ($Dł \times Szer \times Wys$) oraz opcjonalnej masy, aplikacja na jednym ekranie podsumowującym wyświetla status kwalifikacji do wszystkich standardów paczkomatowych i lotniczych jednocześnie.
* **Persona:** Marek (P3), Piotr (P4).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Użytkownik wpisuje wymiary paczki $36 \times 24 \times 17\text{ cm}$, masa $4\text{ kg}$.
  * **WHEN:** Aplikacja renderuje wyniki porównania.
  * **THEN:** Paczkomat InPost: Zielony kafelek **Gabaryt B** (zapas wysokości: $2\text{ cm}$).
  * **THEN:** Ryanair: Czerwony kafelek dla małego bagażu (przekroczona głębokość $24\text{ cm} > 20\text{ cm}$), Zielony dla Priority ($55 \times 40 \times 20\text{ cm}$).
  * **THEN:** Wizz Air: Zielony kafelek dla małego bagażu ($40 \times 30 \times 20\text{ cm}$).

---

### **BR-LOT-002: Precyzyjna obsługa sieci Paczkomatów InPost**
* **Opis:** Weryfikacja wymiarów względem oficjalnych skrytek InPost z uwzględnieniem bezpiecznego marginesu technologicznego:
  * **Gabaryt A:** $80 \times 380 \times 640\text{ mm}$, max $25\text{ kg}$ (zalecany bezpieczny max: $70 \times 370 \times 630\text{ mm}$).
  * **Gabaryt B:** $190 \times 380 \times 640\text{ mm}$, max $25\text{ kg}$ (zalecany bezpieczny max: $180 \times 370 \times 630\text{ mm}$).
  * **Gabaryt C:** $410 \times 380 \times 640\text{ mm}$, max $25\text{ kg}$ (zalecany bezpieczny max: $400 \times 370 \times 630\text{ mm}$).
* **Persona:** Marek (P3).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Paczka o wymiarach $195\text{ mm} \times 350\text{ mm} \times 400\text{ mm}$.
  * **WHEN:** Użytkownik sprawdza przydatność do Gabarytu B.
  * **THEN:** System wskazuje przekroczenie dopuszczalnej wysokości o $5\text{ mm}$ i automatycznie kwalifikuje paczkę do Gabarytu C, ostrzegając przed próbą wciśnięcia do B.

---

### **BR-LOT-003: Obsługa automatów Orlen Paczka, DPD Pickup i Pocztex**
* **Opis:** Obsługa standardów skrytek alternatywnych operatorów kurierskich działających w Polsce:
  * Orlen Paczka (S: $8 \times 38 \times 60$, M: $19 \times 38 \times 60$, L: $41 \times 38 \times 60\text{ cm}$).
  * DPD Pickup Station (maksymalna długość $50\text{ cm}$, limit wagi do $31,5\text{ kg}$).
* **Persona:** Marek (P3).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Paczka o długości $62\text{ cm}$.
  * **WHEN:** Porównywane są automaty InPost vs Orlen Paczka.
  * **THEN:** InPost: Mieści się (skrytka $64\text{ cm}$). Orlen: Nie mieści się (skrytka $60\text{ cm}$).

---

### **BR-LOT-004: Standardy bagażowe 10 popularnych linii lotniczych**
* **Opis:** Oficjalne wymiary sizerów lotniskowych dla: Ryanair, Wizz Air, PLL LOT, Lufthansa, EasyJet, KLM, Air France, British Airways, Norwegian, SAS.
* **Persona:** Piotr (P4).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Torba o wymiarach $42 \times 30 \times 18\text{ cm}$.
  * **WHEN:** Użytkownik wybiera linię „Ryanair (darmowy mały podręczny)”.
  * **THEN:** System wyświetla status ostrzegawczy (wysokość $42\text{ cm} > 40\text{ cm}$), informując: *„Wymiar przekracza regulamin o 2 cm. Jeśli torba jest miękka, zmieści się po ugnieceniu; sztywna walizka zostanie odrzucona”*.
