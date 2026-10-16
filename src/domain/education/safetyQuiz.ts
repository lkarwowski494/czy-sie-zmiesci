/**
 * Czy się zmieści? (FitCheck) — Edukacja & Bezpieczeństwo Ładunku
 * Zgodność z normami PN-EN 12195-1, art. 61 Prawo o Ruchu Drogowym oraz wytycznymi ITD (BR-EDU-001, BR-EDU-003).
 */

export interface LessonCard {
  readonly id: string;
  readonly title: string;
  readonly category: 'fizyka' | 'mocowanie' | 'przepisy' | 'pojazd';
  readonly readTimeMinutes: number;
  readonly summary: string;
  readonly paragraphs: readonly string[];
  readonly standardRef: string;
  readonly icon: string;
}

export interface QuizQuestion {
  readonly id: string;
  readonly question: string;
  readonly options: readonly string[];
  readonly correctOptionIndex: number;
  readonly legalBasis: string;
  readonly explanation: string;
}

export interface QuizEvaluation {
  readonly totalQuestions: number;
  readonly answeredCount: number;
  readonly correctCount: number;
  readonly scorePercent: number;
  readonly passed: boolean;
  readonly summaryFeedback: string;
  readonly incorrectQuestionIds: readonly string[];
  readonly answersDetail: readonly {
    readonly questionId: string;
    readonly selectedIndex: number;
    readonly isCorrect: boolean;
  }[];
}

/**
 * 7 oficjalnych lekcji Szkoły Bezpiecznego Ładunku (BR-EDU-001).
 */
export const CARGO_SCHOOL_LESSONS: readonly LessonCard[] = [
  {
    id: 'les-01-fizyka-hamowania',
    title: 'Fizyka gwałtownego hamowania i zderzenia',
    category: 'fizyka',
    readTimeMinutes: 2,
    summary: 'Dlaczego niezabezpieczona walizka o masie 20 kg przy zderzeniu uderza z masą 500 kg.',
    paragraphs: [
      'Zgodnie z zasadami dynamiki Newtona, ciało w ruchu zachowuje swoją prędkość aż do zadziałania siły zewnętrznej. Podczas zderzenia czołowego przy prędkości 50 km/h opóźnienie sięga 25g (norma Euro NCAP).',
      'Oznacza to, że mała butelka wody (1,5 kg) staje się pociskiem wywierającym siłę uderzenia odpowiadającą ciężarowi niemal 38 kg, a walizka 20 kg – siłę odpowiadającą 500 kg. Oparcie tylnej kanapy nie zawsze wytrzyma takie obciążenie bez blokady.',
      'Dlatego najcięższe przedmioty należy bezwzględnie dosuwać bezpośrednio do oparcia kanapy (zasada Form-Fit), uniemożliwiając im nabranie prędkości względnej w kabinie.',
    ],
    standardRef: 'PN-EN 12195-1, Euro NCAP 25g Protocol',
    icon: '⚡',
  },
  {
    id: 'les-02-form-fit',
    title: 'Zasada Form-Fit: Blokowanie ładunku',
    category: 'mocowanie',
    readTimeMinutes: 2,
    summary: 'Wykorzystanie stałych elementów nadwozia, oparcia kanapy i nadkoli do eliminacji luzów.',
    paragraphs: [
      'Najbezpieczniejszym i najtańszym sposobem mocowania jest blokowanie kształtowe (Form-Fit). Polega ono na dosunięciu ładunku do przedniej ściany bagażnika (tyłu oparć foteli) oraz ścian bocznych i nadkoli.',
      'Każdy centymetr wolnej przestrzeni przed ładunkiem działa jak rozbieg podczas hamowania. Jeśli ładunek przylega ściśle do oparcia, siła bezwładności jest natychmiast przenoszona na konstrukcję nośną pojazdu bez udarowego uderzenia.',
      'Pozostałe szczeliny należy wypełnić lekkimi wypełniaczami (zwinięte koce, puste torby, pianki) lub spiąć ładunek pasami transportowymi.',
    ],
    standardRef: 'PN-EN 12195-1 pkt 5.2 (Ryglowanie kształtowe)',
    icon: '🧱',
  },
  {
    id: 'les-03-pasy-napinacz',
    title: 'Pasy z napinaczem vs gumy elastyczne',
    category: 'mocowanie',
    readTimeMinutes: 3,
    summary: 'Dlaczego ekspandery gumowe są zabronione do mocowania ciężkich ładunków.',
    paragraphs: [
      'Ekspandery gumowe (tzw. "pająki" z metalowymi haczykami) pod wpływem przeciążenia rozciągają się i pękają, zamieniając się w niebezpieczne proce. Zgodnie z wytycznymi ITD nadają się wyłącznie do przytrzymywania plandek przed trzepotaniem na wietrze.',
      'Do mocowania ładunków w bagażniku i na przyczepie dopuszczone są wyłącznie pasy z napinaczem (grzechotką) zgodne z normą PN-EN 12195-2 o określonej zdolności mocowania LC (Lashing Capacity) oraz standardowej sile napięcia STF.',
      'Pasy należy kotwiczyć wyłącznie do fabrycznych punktów mocowania w podłodze bagażnika (uszy transportowe ISO), a nigdy do plastikowych uchwytów tapicerki.',
    ],
    standardRef: 'PN-EN 12195-2 (Pasy mocujące z włókien syntetycznych)',
    icon: '🪢',
  },
  {
    id: 'les-04-rozklad-masy',
    title: 'Rozkład masy a stabilność i sterowność pojazdu',
    category: 'pojazd',
    readTimeMinutes: 2,
    summary: 'Wpływ dźwigni za tylną osią na odciążenie kół skrętnych i drogę hamowania.',
    paragraphs: [
      'Bagażnik samochodu znajduje się w całości za tylną osią pojazdu. Każdy kilogram umieszczony na samym końcu kufra działa na zasadzie dźwigni, odciążając przednie koła kierowane.',
      'Znaczące odciążenie przedniej osi wydłuża drogę hamowania, pogarsza precyzję kierowania i sprawia, że reflektory świecą w niebo, oślepiając kierowców z naprzeciwka (wymagana regulacja korektora świateł).',
      'Złota reguła pakowania: najcięższe bagaże na samo dno i maksymalnie do przodu (tuż za oparciem kanapy). Lekkie rzeczy na wierzch.',
    ],
    standardRef: 'ECE R48 (Regulacja świateł), PN-ISO 1176',
    icon: '⚖️',
  },
  {
    id: 'les-05-przewoz-dlugich',
    title: 'Przepisy przewozu przedmiotów długich (art. 61 PoRD)',
    category: 'przepisy',
    readTimeMinutes: 3,
    summary: 'Maksymalne limity wystawania ładunku z przodu i z tyłu oraz obowiązkowe oznakowanie.',
    paragraphs: [
      'Polskie prawo drogowe (art. 61 ustawy Prawo o ruchu drogowym) precyzyjnie określa zasady wystawania ładunku poza obrys pojazdu.',
      'Z tyłu pojazdu ładunek może wystawać maksymalnie na 2 metry od tylnej płaszczyzny obrysu pojazdu. Ponadto ładunek wystający na więcej niż 0,5 m z tyłu musi być oznakowany chorągiewką barwy czerwonej (min. 50x50 cm) lub pasami biało-czerwonymi. W warunkach niedostatecznej widoczności wymagane jest czerwone światło.',
      'Z przodu pojazdu ładunek może wystawać maksymalnie na 0,5 metra od przedniej płaszczyzny obrysu i nie więcej niż 1,5 metra od siedzenia kierującego.',
    ],
    standardRef: 'Art. 61 ust. 6 pkt 1-2 Dz.U. 2023 poz. 1047 (PoRD)',
    icon: '📏',
  },
  {
    id: 'les-06-butle-agd-plyny',
    title: 'Bezpieczny transport butli gazowych, AGD i płynów',
    category: 'przepisy',
    readTimeMinutes: 3,
    summary: 'Zasady wentylacji butli LPG/propan, protokół lodówek i pralki z blokadą bębna.',
    paragraphs: [
      'Butle z gazem (propan-butan, turystyczne) wolno przewozić wyłącznie w pozycji pionowej z dokręconym zaworem i zaślepką bezpieczeństwa. Zabrania się ich przewozu w szczelnie zamkniętym bagażniku sedana bez wymiany powietrza.',
      'Pralki wymagają wkręcenia fabrycznych śrub transportowych blokujących bęben. Przewóz bez śrub grozi zerwaniem amortyzatorów i uszkodzeniem zbiornika na pierwszej nierówności.',
      'Lodówki powinny być przewożone pionowo. Przy transporcie na boku (zawsze stroną tłoczną sprężarki do góry) bezwzględnie należy odczekać 12-24 godziny przed włączeniem zasilania, aby olej spłynął do agregatu.',
    ],
    standardRef: 'Wytyczne producentów AGD i Rozporządzenie ADR (wyłączenie dla osób prywatnych 1.1.3.1a)',
    icon: '🧊',
  },
  {
    id: 'les-07-boks-dachowy',
    title: 'Boks dachowy i bagażniki rowerowe: aerodynamika',
    category: 'pojazd',
    readTimeMinutes: 2,
    summary: 'Limit nośności dachu, podatność na boczny wiatr i maksymalne obciążenie pionowe haka.',
    paragraphs: [
      'Maksymalne dopuszczalne obciążenie dachu większości aut osobowych wynosi od 50 do 75 kg (rzadko 100 kg w dużych SUV-ach). Do tej wagi wlicza się masę belek bazowych oraz masę samego boksu dachowego (często ok. 15-20 kg)!',
      'Ładunek na dachu podnosi środek ciężkości pojazdu, co drastycznie zwiększa przechyły w zakrętach i podatność na podmuchy bocznego wiatru przy wyjeździe z lasu lub wyprzedzaniu ciężarówki.',
      'Dla bagażników rowerowych na hak kluczowy jest nacisk pionowy S (zazwyczaj 50-75 kg). Ciężkie rowery elektryczne z baterią (25 kg/szt.) szybko przekraczają ten limit, grożąc deformacją haka.',
    ],
    standardRef: 'Instrukcja obsługi pojazdu (Dach) i Regulamin EKG ONZ nr 55 (Hak)',
    icon: '🚲',
  },
];

/**
 * 5 pytań quizowych z dokładną podstawą prawną (BR-EDU-003).
 */
export const SAFETY_QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'q-01-wystawanie-tyl',
    question: 'Ile maksymalnie może wystawać ładunek poza tylną płaszczyznę obrysu samochodu osobowego?',
    options: ['1,0 m', '1,5 m', '2,0 m', 'Dopóki nie zasłania tablicy rejestracyjnej'],
    correctOptionIndex: 2,
    legalBasis: 'Art. 61 ust. 6 pkt 2 ustawy Prawo o ruchu drogowym',
    explanation:
      'Zgodnie z art. 61 ust. 6 pkt 2 PoRD ładunek nie może wystawać z tyłu pojazdu na odległość większą niż 2 m od tylnej płaszczyzny obrysu pojazdu lub zespołu pojazdów.',
  },
  {
    id: 'q-02-oznakowanie-ladunku',
    question: 'Kiedy ładunek wystający z tyłu pojazdu musi być obowiązkowo oznakowany czerwoną chorągiewką?',
    options: [
      'Gdy wystaje na więcej niż 0,5 m poza tylną płaszczyznę obrysu',
      'Zawsze, gdy wystaje choćby o 1 cm',
      'Tylko w nocy lub podczas mgły',
      'Gdy wystaje na więcej niż 1,5 m',
    ],
    correctOptionIndex: 0,
    legalBasis: 'Art. 61 ust. 8 pkt 3 ustawy Prawo o ruchu drogowym',
    explanation:
      'Ładunek wystający z tyłu na odległość większą niż 0,5 m oznacza się chorągiewką barwy czerwonej o wymiarach co najmniej 50x50 cm lub pasami biało-czerwonymi.',
  },
  {
    id: 'q-03-wystawanie-przod',
    question: 'Jaka jest dopuszczalna maksymalna odległość wystawania ładunku z przodu pojazdu?',
    options: [
      'Ładunek w ogóle nie może wystawać z przodu',
      'Maksymalnie 0,5 m od przedniej płaszczyzny obrysu i nie więcej niż 1,5 m od siedzenia kierującego',
      'Maksymalnie 1,0 m od przedniego zderzaka',
      'Tyle samo co z tyłu, czyli 2,0 m',
    ],
    correctOptionIndex: 1,
    legalBasis: 'Art. 61 ust. 6 pkt 1 ustawy Prawo o ruchu drogowym',
    explanation:
      'Zgodnie z art. 61 ust. 6 pkt 1 PoRD ładunek wystający z przodu pojazdu nie może wystawać na odległość większą niż 0,5 m od przedniej płaszczyzny obrysu pojazdu i nie większą niż 1,5 m od siedzenia kierującego.',
  },
  {
    id: 'q-04-mocowanie-gumami',
    question: 'Czy przewożąc ciężki karton 30 kg w bagażniku można go zamocować gumowym ekspanderem z haczykiem ("pająkiem")?',
    options: [
      'Tak, pod warunkiem użycia minimum 4 gum jednocześnie',
      'Tak, jeśli jedziemy z prędkością miejską poniżej 50 km/h',
      'Nie, elastyczne gumy nie spełniają normy PN-EN 12195 i przy hamowaniu grożą zerwaniem',
      'Tak, o ile zaczepimy je o oparcie fotela',
    ],
    correctOptionIndex: 2,
    legalBasis: 'Norma PN-EN 12195-1 / PN-EN 12195-2 oraz wytyczne ITD',
    explanation:
      'Ekspandery gumowe rozciągają się i przy przeciążeniu ulegają zerwaniu lub wystrzeleniu. Ciężkie ładunki należy mocować pasami z napinaczem (grzechotką) lub blokować metodą kształtową (Form-Fit).',
  },
  {
    id: 'q-05-lodowka-transport',
    question: 'Jeśli lodówka była przewożona w pozycji leżącej na boku, ile czasu należy odczekać przed podłączeniem jej do prądu?',
    options: [
      'Można włączyć od razu, kompresor sam odpowietrzy układ',
      'Wystarczy 15 minut',
      'Minimum 12 do 24 godzin na spłynięcie oleju chłodniczego do sprężarki',
      'Dokładnie 1 godzinę',
    ],
    correctOptionIndex: 2,
    legalBasis: 'Wytyczne producentów agregatów chłodniczych (np. Danfoss, Secop) i reguła RD-44',
    explanation:
      'W pozycji leżącej olej z miski olejowej sprężarki wpływa do układu parownika. Załączenie lodówki bez odczekania 12–24h grozi zatarciem agregatu i trwałym uszkodzeniem układu chłodniczego.',
  },
];

/**
 * Ocenia odpowiedzi użytkownika na quiz wiedzy.
 */
export function evaluateQuizAnswers(
  answers: Readonly<Record<string, number>>
): QuizEvaluation {
  const totalQuestions = SAFETY_QUIZ_QUESTIONS.length;
  let correctCount = 0;
  let answeredCount = 0;
  const incorrectQuestionIds: string[] = [];
  const answersDetail: { questionId: string; selectedIndex: number; isCorrect: boolean }[] = [];

  for (const q of SAFETY_QUIZ_QUESTIONS) {
    const selected = answers[q.id];
    if (typeof selected === 'number') {
      answeredCount++;
      const isCorrect = selected === q.correctOptionIndex;
      if (isCorrect) {
        correctCount++;
      } else {
        incorrectQuestionIds.push(q.id);
      }
      answersDetail.push({
        questionId: q.id,
        selectedIndex: selected,
        isCorrect,
      });
    }
  }

  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercent >= 80; // Wymagane min. 4 z 5 (80%)

  let summaryFeedback = '';
  if (answeredCount < totalQuestions) {
    summaryFeedback = `Odpowiedziano na ${answeredCount} z ${totalQuestions} pytań.`;
  } else if (passed) {
    summaryFeedback =
      correctCount === totalQuestions
        ? '🏆 Doskonale! 100% poprawnych odpowiedzi. Znasz przepisy art. 61 PoRD i normy PN-EN 12195 jak ekspert.'
        : `👍 Świetny wynik: ${correctCount}/${totalQuestions} (${scorePercent}%). Egzamin zdany!`;
  } else {
    summaryFeedback = `⚠️ Wynik: ${correctCount}/${totalQuestions} (${scorePercent}%). Przeczytaj karty wiedzy i spróbuj ponownie (wymagane min. 80%).`;
  }

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    scorePercent,
    passed,
    summaryFeedback,
    incorrectQuestionIds,
    answersDetail,
  };
}
