import {
  CARGO_SCHOOL_LESSONS,
  SAFETY_QUIZ_QUESTIONS,
  evaluateQuizAnswers,
} from '../education/safetyQuiz';

describe('SafetyQuiz & Cargo School Domain (BR-EDU-001, BR-EDU-003)', () => {
  describe('CARGO_SCHOOL_LESSONS', () => {
    it('contains all 7 core lessons with required metadata and non-empty content', () => {
      expect(CARGO_SCHOOL_LESSONS.length).toBe(7);
      for (const lesson of CARGO_SCHOOL_LESSONS) {
        expect(lesson.id).toBeTruthy();
        expect(lesson.title).toBeTruthy();
        expect(lesson.paragraphs.length).toBeGreaterThanOrEqual(3);
        expect(lesson.readTimeMinutes).toBeGreaterThan(0);
        expect(lesson.standardRef).toBeTruthy();
        expect(['fizyka', 'mocowanie', 'przepisy', 'pojazd']).toContain(lesson.category);
      }
    });

    it('covers key regulations including PN-EN 12195, Euro NCAP, and art. 61 PoRD', () => {
      const allText = CARGO_SCHOOL_LESSONS.map((l) => `${l.title} ${l.summary} ${l.paragraphs.join(' ')} ${l.standardRef}`).join(' ');
      expect(allText).toContain('PN-EN 12195');
      expect(allText).toContain('art. 61');
      expect(allText).toContain('Form-Fit');
      expect(allText).toContain('25g');
    });
  });

  describe('SAFETY_QUIZ_QUESTIONS', () => {
    it('contains 5 standard verification questions', () => {
      expect(SAFETY_QUIZ_QUESTIONS.length).toBe(5);
      for (const q of SAFETY_QUIZ_QUESTIONS) {
        expect(q.id).toBeTruthy();
        expect(q.question).toBeTruthy();
        expect(q.options.length).toBe(4);
        expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctOptionIndex).toBeLessThan(q.options.length);
        expect(q.legalBasis).toBeTruthy();
        expect(q.explanation).toBeTruthy();
      }
    });
  });

  describe('evaluateQuizAnswers', () => {
    it('handles empty answers (none answered)', () => {
      const result = evaluateQuizAnswers({});
      expect(result.totalQuestions).toBe(5);
      expect(result.answeredCount).toBe(0);
      expect(result.correctCount).toBe(0);
      expect(result.scorePercent).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.summaryFeedback).toContain('Odpowiedziano na 0 z 5 pytań');
      expect(result.incorrectQuestionIds).toEqual([]);
      expect(result.answersDetail).toEqual([]);
    });

    it('handles partially answered quiz', () => {
      const partialAnswers = {
        'q-01-wystawanie-tyl': 2, // poprawna
        'q-02-oznakowanie-ladunku': 1, // niepoprawna
      };
      const result = evaluateQuizAnswers(partialAnswers);
      expect(result.answeredCount).toBe(2);
      expect(result.correctCount).toBe(1);
      expect(result.scorePercent).toBe(20);
      expect(result.passed).toBe(false);
      expect(result.summaryFeedback).toContain('Odpowiedziano na 2 z 5 pytań');
      expect(result.incorrectQuestionIds).toEqual(['q-02-oznakowanie-ladunku']);
      expect(result.answersDetail.length).toBe(2);
    });

    it('evaluates 100% perfect score correctly', () => {
      const perfectAnswers: Record<string, number> = {};
      for (const q of SAFETY_QUIZ_QUESTIONS) {
        perfectAnswers[q.id] = q.correctOptionIndex;
      }
      const result = evaluateQuizAnswers(perfectAnswers);
      expect(result.answeredCount).toBe(5);
      expect(result.correctCount).toBe(5);
      expect(result.scorePercent).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.summaryFeedback).toContain('100% poprawnych odpowiedzi');
      expect(result.incorrectQuestionIds).toHaveLength(0);
    });

    it('evaluates passing score (4/5, 80%) correctly', () => {
      const passingAnswers: Record<string, number> = {
        'q-01-wystawanie-tyl': 2,
        'q-02-oznakowanie-ladunku': 0,
        'q-03-wystawanie-przod': 1,
        'q-04-mocowanie-gumami': 2,
        'q-05-lodowka-transport': 0, // błąd (powinno być 2)
      };
      const result = evaluateQuizAnswers(passingAnswers);
      expect(result.correctCount).toBe(4);
      expect(result.scorePercent).toBe(80);
      expect(result.passed).toBe(true);
      expect(result.summaryFeedback).toContain('Świetny wynik: 4/5 (80%)');
      expect(result.incorrectQuestionIds).toEqual(['q-05-lodowka-transport']);
    });

    it('evaluates failing score (3/5 or less) when all are answered', () => {
      const failingAnswers: Record<string, number> = {
        'q-01-wystawanie-tyl': 0, // błąd
        'q-02-oznakowanie-ladunku': 0, // ok
        'q-03-wystawanie-przod': 0, // błąd
        'q-04-mocowanie-gumami': 2, // ok
        'q-05-lodowka-transport': 1, // błąd
      };
      const result = evaluateQuizAnswers(failingAnswers);
      expect(result.correctCount).toBe(2);
      expect(result.scorePercent).toBe(40);
      expect(result.passed).toBe(false);
      expect(result.summaryFeedback).toContain('wymagane min. 80%');
      expect(result.incorrectQuestionIds).toEqual([
        'q-01-wystawanie-tyl',
        'q-03-wystawanie-przod',
        'q-05-lodowka-transport',
      ]);
    });
  });
});
