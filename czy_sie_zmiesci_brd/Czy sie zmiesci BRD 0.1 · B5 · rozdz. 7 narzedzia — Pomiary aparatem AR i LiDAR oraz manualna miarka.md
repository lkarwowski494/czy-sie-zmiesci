# **Czy się zmieści? (FitCheck) BRD 0.1 — Część B5**

## **Rozdział 7: Wymagania Funkcjonalne — Pomiary Aparatem i Miarka Manualna (BR-POM-001…BR-POM-030)**

---

### **BR-POM-001: Precyzyjna miarka manualna z klawiaturą i suwakami**
* **Opis:** Główny, niezawodny mechanizm wprowadzania wymiarów przestrzeni i ładunków w warunkach polowych (parking podziemny, piwnica, brak światła). Posiada podwójne sterowanie: bezpośrednie pole numeryczne oraz suwaki krokowe ($\pm 1\text{ cm}$, $\pm 5\text{ cm}$).
* **Persona:** Tomasz (P1), Janusz (P6).
* **Priorytet:** **MUST** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Formularz dodawania nowego przedmiotu.
  * **WHEN:** Użytkownik przesuwa suwak lub wpisuje z klawiatury `124`.
  * **THEN:** Wartość zostaje zaktualizowana w czasie rzeczywistym z natychmiastowym przeliczeniem objętości w litrach i odświeżeniem podglądu bryły prostopadłościanu.

---

### **BR-POM-002: Ekranowa linijka referencyjna (On-Screen Calibrated Ruler)**
* **Opis:** Narzędzie awaryjne wykorzystujące dokładną fizyczną gęstość pikseli (PPI) wyświetlacza danego modelu iPhone'a. Pozwala na przyłożenie małego przedmiotu (do $15\text{ cm}$) bezpośrednio do krawędzi ekranu w celu natychmiastowego odczytu długości.
* **Persona:** Kasia (P2), Piotr (P4).
* **Priorytet:** **SHOULD** | **Etap:** **MVP**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Uruchomiony moduł ekranowej linijki na iPhone 15 ($460\text{ ppi}$).
  * **WHEN:** Użytkownik przykłada kartę płatniczą ($85,6\text{ mm}$).
  * **THEN:** Odczyt na podziałce milimetrowej wynosi dokładnie $85,6\text{ mm} \pm 0,5\text{ mm}$.

---

### **BR-POM-003: Szybki pomiar kartonu dwoma punktami ARKit (Etap 1.1)**
* **Opis:** Dla urządzeń wyposażonych w czujnik LiDAR lub zaawansowany procesor ARKit, użytkownik może wyznaczyć wymiary prostopadłościanu poprzez dotknięcie dwóch przeciwległych wierzchołków w przestrzeni rozszerzonej rzeczywistości.
* **Persona:** Marek (P3), Kasia (P2).
* **Priorytet:** **SHOULD** | **Etap:** **1.1**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Dobre oświetlenie sceny (> 100 luksów) i urządzenie z LiDAR (iPhone 12 Pro lub nowszy).
  * **WHEN:** Użytkownik wskazuje wierzchołek $A(x_1, y_1, z_1)$ oraz wierzchołek przeciwległy $B(x_2, y_2, z_2)$.
  * **THEN:** Aplikacja automatycznie dopasowuje prostopadłościan zorientowany do podłoża i wpisuje wyliczone $Dł, Szer, Wys$ do formularza z tolerancją błędu $\le 2\%$.

---

### **BR-POM-004: Ostrzeżenie o warunkach środowiskowych AR**
* **Opis:** W przypadku zbyt słabego oświetlenia, braku tekstury na podłodze (jednolity czarny welur) lub gwałtownych ruchów aparatu, moduł AR natychmiast wyświetla komunikat i sugeruje przełączenie na bazę modeli lub miarkę ręczną.
* **Persona:** Tomasz (P1).
* **Priorytet:** **MUST** (dla modułu AR) | **Etap:** **1.1**
* **Kryteria Akceptacji (Gherkin):**
  * **GIVEN:** Poziom oświetlenia w bagażniku spada poniżej progu stabilności ARKit.
  * **WHEN:** Czujnik wykrywa stan `ARCamera.TrackingState.limited(reason: .insufficientFeatures)`.
  * **THEN:** Na ekranie pojawia się wyraźny żółty baner: *„Za ciemno na pomiar aparatem. Przełącz na szybki wybór modelu z listy”*.
