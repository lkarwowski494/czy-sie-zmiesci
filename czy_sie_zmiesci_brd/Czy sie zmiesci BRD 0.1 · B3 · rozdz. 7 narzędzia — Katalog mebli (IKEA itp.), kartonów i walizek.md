# **Czy się zmieści? (FitCheck) BRD 0.1 — Część B3**

## **Rozdział 7: Wymagania Funkcjonalne — Katalog Mebli, Paczek i Walizek (BR-KAT-001…BR-KAT-035)**

---

### **BR-KAT-001: Gotowe presety popularnych mebli płaskopaczkowych (IKEA itp.)**
* **Opis:** Wbudowany katalog popularnych mebli paczkowanych z automatycznym rozbiciem na rzeczywiste paczki handlowe (flat-pack) z podaniem ich wymiarów i wagi.
* **Persona:** Kasia (P2), Bartek (P7).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Użytkownik przegląda katalog mebli w zakładce „Katalog”.
  * **WHEN:** Wybiera „Regał BILLY ($80 \times 28 \times 202\text{ cm}$)”.
  * **THEN:** Aplikacja dodaje do listy ładunku 1 paczkę o wymiarach $205 \times 29 \times 13\text{ cm}$ i masie $35\text{ kg}$ (wymiar kartonu, a nie zmontowanego mebla).

---

### **BR-KAT-002: Obsługa produktów wielopaczkowych (Multi-Package Assembly)**
* **Opis:** Meble składające się z kilku paczek (np. szafy PAX z drzwiami, narożniki, łóżka z ramą) dodawane są do listy załadunku jako spójna grupa paczek elementarnych.
* **Persona:** Kasia (P2), Tomasz (P1).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Użytkownik wybiera z katalogu „Szafa PAX ($100 \times 58 \times 236\text{ cm}$ z drzwiami)”.
  * **WHEN:** Zatwierdza dodanie mebla do aktywnego załadunku.
  * **THEN:** Na liście ładunku pojawiają się 3 niezależne paczki: Paczka 1 (korpus boczny: $240 \times 60 \times 8\text{ cm}$, $48\text{ kg}$), Paczka 2 (półki i wieniec: $102 \times 60 \times 12\text{ cm}$, $26\text{ kg}$), Paczka 3 (drzwi: $240 \times 51 \times 5\text{ cm}$, $22\text{ kg}$).

---

### **BR-KAT-003: Katalog sprzętu AGD i RTV w fabrycznych opakowaniach**
* **Opis:** Predefiniowane profile sprzętu gospodarstwa domowego z uwzględnieniem kartonu i narożników styropianowych (+6 do +10 cm względem gabarytu samego urządzenia).
* **Persona:** Agnieszka (P5).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Pralka o wymiarze nominalnym $60 \times 60 \times 85\text{ cm}$.
  * **WHEN:** Użytkownik dodaje z katalogu „Pralka w kartonie”.
  * **THEN:** Zostaje utworzony ładunek o wymiarach $66 \times 68 \times 91\text{ cm}$, masie $68\text{ kg}$ oraz zablokowanej fladze obrotu (`allow_rotation_z_only = true`).

---

### **BR-KAT-004: Standardowe walizki i torby podróżne (S, M, L)**
* **Opis:** Zestaw typowych formatów walizek turystycznych z dokładnymi wymiarami zewnętrznymi (wraz z wysuniętymi kółkami i uchwytami).
* **Persona:** Tomasz (P1), Piotr (P4).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Użytkownik planuje wyjazd wakacyjny.
  * **WHEN:** Wybiera: „2x Walizka Duża L ($78 \times 52 \times 32\text{ cm}$)” oraz „2x Walizka Kabinowa S ($55 \times 40 \times 20\text{ cm}$)”.
  * **THEN:** Wszystkie 4 obiekty trafiają do listy ładunku z domyślną masą szacunkową ($23\text{ kg}$ dla L, $10\text{ kg}$ dla S) z możliwością jej edycji.

---

### **BR-KAT-005: Wózki dziecięce i gondole (Złożone stelaże)**
* **Opis:** Presety wózków dziecięcych: stelaż złożony na płasko + osobna bryła gondoli lub siedziska spacerówki.
* **Persona:** Tomasz (P1).
* **Priorytet:** **SHOULD** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Dodanie wózka dziecięcego 2w1.
  * **WHEN:** Użytkownik zaznacza pozycję „Wózek dziecięcy”.
  * **THEN:** Do załadunku dodawane są 2 elementy: stelaż ($75 \times 58 \times 35\text{ cm}$, masa $9\text{ kg}$) oraz gondola ($85 \times 42 \times 30\text{ cm}$, masa $5\text{ kg}$, zakaz kładzenia ciężkich rzeczy na gondoli).
