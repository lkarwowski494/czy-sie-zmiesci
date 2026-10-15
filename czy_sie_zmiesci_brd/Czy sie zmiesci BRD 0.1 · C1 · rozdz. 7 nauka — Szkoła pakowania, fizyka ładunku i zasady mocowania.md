# **Czy się zmieści? (FitCheck) BRD 0.1 — Część C1**

## **Rozdział 7: Wymagania Funkcjonalne — Szkoła Pakowania i Edukacja (BR-EDU-001…BR-EDU-030)**

Moduł edukacyjny stanowi kluczowy wyróżnik chroniący FitCheck przed zarzutem bycia „prostym kalkulatorem” (wytyczna Apple 4.3). Uczy kierowców fizyki transportu, przepisów prawa drogowego oraz profesjonalnych technik bezpiecznego mocowania ładunku.

---

### **BR-EDU-001: Baza lekcji „Szkoła Bezpiecznego Ładunku” (Karty Technik)**
* **Opis:** Zestaw 15 zwięzłych, bogato ilustrowanych kart wiedzy opartych na normach PN-EN 12195-1 oraz wytycznych Inspekcji Transportu Drogowego (ITD):
  1. *Fizyka gwałtownego hamowania (dlaczego walizka staje się pociskiem o masie 500 kg).*
  2. *Zasada „Form-Fit”: blokowanie ładunku o stałe elementy nadwozia (oparcie kanapy, nadkola).*
  3. *Użycie pasów ściągających z napinaczem (odróżnienie pasów mocujących od ekspanderów elastycznych).*
  4. *Prawidłowe rozmieszczenie masy a sterowność auta (dociążenie osi skrętnej).*
  5. *Zasady przewozu przedmiotów długich (oznakowanie chorągiewką, limity wystawania: 2 m z tyłu, 0,5 m z przodu).*
  6. *Przewóz butli gazowych, gaśnic i płynów eksploatacyjnych.*
  7. *Zasady bezpiecznego korzystania z boksu dachowego (podatność na boczny wiatr).*
* **Persona:** Tomasz (P1), Janusz (P6), Bartek (P7).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Użytkownik wchodzi do zakładki „Szkoła”.
  * **WHEN:** Wybiera lekcję „Mocowanie ładunku oparciem kanapy”.
  * **THEN:** Wyświetla się tekst podzielony na 3 krótkie akapity z interaktywnym diagramem wektorowym SVG pokazującym wektory sił bezwładności.
  * **THEN:** Całość działa w 100% offline, a tekst spełnia wymagania VoiceOver.

---

### **BR-EDU-002: Interaktywny symulator siły zderzenia (Crash Physics Simulator)**
* **Opis:** Narzędzie edukacyjne, w którym użytkownik może wybrać masę przedmiotu (np. laptop 2 kg, zgrzewka wody 9 kg, walizka 20 kg) oraz prędkość pojazdu (50 km/h, 90 km/h, 140 km/h). Symulator wylicza energię kinetyczną $E_k = \frac{m v^2}{2}$ oraz siłę uderzenia przy opóźnieniu $25g$.
* **Persona:** Tomasz (P1), Agnieszka (P5).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Wybrana masa $9\text{ kg}$ (zgrzewka wody mineralnej) i prędkość $50\text{ km/h}$ ($13,89\text{ m/s}$).
  * **WHEN:** Użytkownik przesuwa suwak prędkości.
  * **THEN:** Aplikacja wyświetla: *Energia kinetyczna: 868 dżuli. Przy zderzeniu zgrzewka uderza w fotel z siłą odpowiadającą masie ok. 225 kg.*

---

### **BR-EDU-003: Quiz weryfikacji wiedzy kierowcy (5 pytań z powtórkami)**
* **Opis:** Krótki test wiedzy sprawdzający znajomość przepisów art. 61 Kodeksu Drogowego i zasad zabezpieczania ładunku, z natychmiastowym wyjaśnieniem poprawnych odpowiedzi i odnośnikami do podstawy prawnej.
* **Persona:** Bartek (P7).
* **Priorytet:** **SHOULD** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Rozpoczęcie quizu w aplikacji.
  * **WHEN:** Użytkownik odpowiada na pytanie o dopuszczalną odległość wystawania ładunku z tyłu pojazdu.
  * **THEN:** Po zaznaczeniu błędnej odpowiedzi ($1,5\text{ m}$) system podświetla poprawną ($2\text{ m}$) i cytuje art. 61 ust. 6 pkt 2 ustawy Prawo o Ruchu Drogowym.
