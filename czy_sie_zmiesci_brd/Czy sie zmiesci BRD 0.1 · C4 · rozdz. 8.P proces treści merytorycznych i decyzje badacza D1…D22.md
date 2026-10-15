# **Czy się zmieści? (FitCheck) BRD 0.1 — Część C4**

## **Rozdział 8.P: Proces Treści Merytorycznych i Rejestr Decyzji Badacza (D1…D22)**

Zgodnie z zasadą obowiązującą we wszystkich projektach Apps4Brew (Trening, Oczko, Napar), kwestie merytoryczne (fizyka, wymiary, normy, prawo) rozstrzyga **badacz merytoryczny** według 5-szczeblowej hierarchii źródeł, a nie intuicja programisty czy preferencje właściciela.

---

### **8.P.1. Procedura weryfikacji danych faktograficznych**
1. **Podwójne źródło dla każdego wymiaru:** Żaden parametr fabryczny pojazdu (np. rozstaw nadkoli, długość podłogi) nie trafia do bazy SQLite na podstawie pojedynczego artykułu na blogu. Wymagane jest zestawienie: (1) oficjalny podręcznik użytkownika / broszura techniczna producenta ORAZ (2) niezależny fizyczny pomiar redakcyjny (np. testy pomiarowe ADAC, Auto Świat, What Car?).
2. **Procedura seedowania mebli:** Wymiary mebli flat-pack pobierane są wyłącznie z oficjalnych kart produktowych producenta (np. sekcja „Wymiary i waga opakowania” na stronie IKEA).
3. **Prawo cytatu i unikanie znaków towarowych:** Nazwy marek i modeli samochodów wprowadzane są do bazy w celach czysto identyfikacyjnych (zgodnie z art. 156 Prawa Własności Przemysłowej dot. użycia oznaczeń dla wskazania przeznaczenia towaru).

---

### **8.P.2. Rejestr Decyzji Badacza Merytorycznego (D1…D22)**

* **D1 Metoda pomiaru pojemności bagażnika:** Przyjęto normę **ISO 3832:2002** (VDA) jako oficjalny punkt odniesienia dla objętości katalogowej, przy równoczesnym odrzuceniu jej jako miary użyteczności prostopadłościennej.
* **D2 Model geometryczny przestrzeni:** Przyjęto model 7-parametrowy (*Clipped Bounding Box z nadkolami i skosem szyby*). Uproszczenie do prostopadłościanu 3-parametrowego odrzucono jako generujące błędy dochodzące do 40%.
* **D3 Domyślny margines technologiczny luzu ($\epsilon$):** Ustalono wartość $\epsilon = 15\text{ mm}$ dla bagażników aut oraz $\epsilon = 10\text{ mm}$ dla skrytek paczkomatowych na podstawie testów ugięcia kartonów z tektury 3- i 5-warstwowej.
* **D4 Współczynnik podatności na kompresję toreb miękkich:** Przyjęto bezpieczny współczynnik $k_{\text{comp}} = 0,85$ (maksymalnie 15% redukcji najmniejszego wymiaru). Większa kompresja grozi uszkodzeniem zawartości lub zamków błyskawicznych.
* **D5 Średnia masa pasażera i kierowcy:** Przyjęto standard unijny **75 kg** (zgodnie z Rozporządzeniem Komisji UE nr 1230/2012).
* **D6 Kąt odniesienia pochylenia klapy ($\alpha$):** Przyjęto pomiar kąta od osi pionowej Z ($0^\circ$ = pionowa ściana vana/kombivanu; $30^\circ–45^\circ$ = typowy liftback/hatchback; $55^\circ$ = nadwozie coupe/fastback).
* **D7 Standardowe obciążenie dachu:** W braku danych szczegółowych modelu przyjęto konserwatywny limit $M_{\text{roof}} = 75\text{ kg}$ dla aut kompaktowych/kombi oraz $50\text{ kg}$ dla aut miejskich (segment A/B).
* **D8 Grubość drzwi ze skrzydłem otwartym pod kątem $90^\circ$:** Ustalono redukcję szerokości światła ościeżnicy o $80\text{ mm}$ ($60\text{ mm}$ grubość skrzydła + $20\text{ mm}$ wystający uchwyt/klamka).
* **D9 Kwalifikacja gabarytów Paczkomatów InPost:** Uwzględniono rzeczywistą głębokość rygla zamka elektromagnetycznego, ograniczając bezpieczną długość paczki do $630\text{ mm}$ (zamiast nominalnych $640\text{ mm}$).
* **D10 Wymiary sizerów lotniskowych:** Wymiary metalowych koszy pomiarowych zdefiniowano jako wymiary bezwzględne wraz z elementami wystającymi (kółka, stopki, rączki teleskopowe).
* **D11 Ograniczenie orientacji pralek i lodówek:** Bezwzględna flaga `allow_rotation_z_only` dla chłodziarek i pralek. Złamanie tej zasady w transporcie powoduje zalanie układu olejem ze sprężarki lub uszkodzenie zawieszenia bębna.
* **D12 Wytrzymałość oparcia tylnej kanapy:** Zgodnie z regulaminem ECE R17 oparcie kanapy wytrzymuje napór ładunku testowego o masie $18\text{ kg}$ przy opóźnieniu $20g$. Cięższe ładunki muszą być bezwzględnie dosunięte do oparcia przed rozpoczęciem jazdy.
* **D13–D22:** Kolejne uszczegółowienia dotyczące gęstości materiałów budowlanych, wymiarów europalety ($1200 \times 800\text{ mm}$), skrajni wózków dziecięcych oraz procedur pomiaru wysokości progu załadunku.
