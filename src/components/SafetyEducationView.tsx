/**
 * Czy się zmieści? (FitCheck) — Moduł Szkoły Ładunku & Quizu Wiedzy Kierowcy
 * Zgodność z normą PN-EN 12195-1, art. 61 PoRD oraz wytycznymi Apple 4.3 (BR-EDU-001, BR-EDU-003).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  CARGO_SCHOOL_LESSONS,
  SAFETY_QUIZ_QUESTIONS,
  evaluateQuizAnswers,
  LessonCard,
} from '../domain/education/safetyQuiz';

export function SafetyEducationView() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'quiz'>('lessons');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(CARGO_SCHOOL_LESSONS[0].id);

  // Stan quizu
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const selectedLesson =
    CARGO_SCHOOL_LESSONS.find((l) => l.id === selectedLessonId) || CARGO_SCHOOL_LESSONS[0];

  const currentQuestion = SAFETY_QUIZ_QUESTIONS[activeQuestionIndex];
  const selectedOptionIndex = userAnswers[currentQuestion.id];
  const isQuestionAnswered = selectedOptionIndex !== undefined;

  const quizResult = evaluateQuizAnswers(userAnswers);

  const handleSelectOption = (index: number) => {
    if (isQuestionAnswered) return; // Zapobiegaj zmianie po zaznaczeniu
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: index,
    }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setActiveQuestionIndex(0);
  };

  return (
    <View style={styles.container}>
      {/* Przełącznik zakładek */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'lessons' && styles.tabButtonActive]}
          onPress={() => setActiveTab('lessons')}
        >
          <Text style={[styles.tabText, activeTab === 'lessons' && styles.tabTextActive]}>
            🎓 Szkoła Ładunku (7 Lekcji)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'quiz' && styles.tabButtonActive]}
          onPress={() => setActiveTab('quiz')}
        >
          <Text style={[styles.tabText, activeTab === 'quiz' && styles.tabTextActive]}>
            📝 Quiz Prawny (art. 61 PoRD)
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'lessons' ? (
        /* WIDOK LEKCJI (BR-EDU-001) */
        <View style={styles.contentBox}>
          {/* Pozioma lista lekcji */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lessonScroll}>
            {CARGO_SCHOOL_LESSONS.map((lesson) => {
              const isSelected = lesson.id === selectedLessonId;
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[styles.lessonChip, isSelected && styles.lessonChipActive]}
                  onPress={() => setSelectedLessonId(lesson.id)}
                >
                  <Text style={styles.lessonChipIcon}>{lesson.icon}</Text>
                  <Text
                    style={[styles.lessonChipTitle, isSelected && styles.lessonChipTitleActive]}
                    numberOfLines={1}
                  >
                    {lesson.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Karta wybranej lekcji */}
          <View style={styles.lessonCard}>
            <View style={styles.lessonHeaderRow}>
              <Text style={styles.lessonIconLarge}>{selectedLesson.icon}</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.lessonCardTitle}>{selectedLesson.title}</Text>
                <Text style={styles.lessonMeta}>
                  ⏱️ {selectedLesson.readTimeMinutes} min czytania • 🏛️ {selectedLesson.standardRef}
                </Text>
              </View>
            </View>

            <View style={styles.summaryBadge}>
              <Text style={styles.summaryText}>{selectedLesson.summary}</Text>
            </View>

            {selectedLesson.paragraphs.map((p, idx) => (
              <Text key={idx} style={styles.paragraphText}>
                {p}
              </Text>
            ))}
          </View>
        </View>
      ) : (
        /* WIDOK QUIZU (BR-EDU-003) */
        <View style={styles.contentBox}>
          {/* Pasek postępu pytań */}
          <View style={styles.quizProgressBar}>
            {SAFETY_QUIZ_QUESTIONS.map((q, idx) => {
              const answered = userAnswers[q.id] !== undefined;
              const isCorrect = userAnswers[q.id] === q.correctOptionIndex;
              const isCurrent = idx === activeQuestionIndex;

              let dotBg = '#334155';
              if (answered) {
                dotBg = isCorrect ? '#059669' : '#DC2626';
              } else if (isCurrent) {
                dotBg = '#0284C7';
              }

              return (
                <TouchableOpacity
                  key={q.id}
                  style={[
                    styles.progressDot,
                    { backgroundColor: dotBg },
                    isCurrent && styles.progressDotCurrent,
                  ]}
                  onPress={() => setActiveQuestionIndex(idx)}
                >
                  <Text style={styles.progressDotText}>{idx + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Treść pytania */}
          <View style={styles.questionCard}>
            <Text style={styles.questionCounter}>
              Pytanie {activeQuestionIndex + 1} z {SAFETY_QUIZ_QUESTIONS.length}
            </Text>
            <Text style={styles.questionTitle}>{currentQuestion.question}</Text>

            {/* Opcje odpowiedzi */}
            <View style={styles.optionsList}>
              {currentQuestion.options.map((opt, optIdx) => {
                let optBorder = '#334155';
                let optBg = '#0F172A';
                let optTextColor = '#F8FAFC';

                if (isQuestionAnswered) {
                  if (optIdx === currentQuestion.correctOptionIndex) {
                    optBorder = '#10B981';
                    optBg = 'rgba(16, 185, 129, 0.2)';
                    optTextColor = '#34D399';
                  } else if (optIdx === selectedOptionIndex) {
                    optBorder = '#EF4444';
                    optBg = 'rgba(239, 68, 68, 0.2)';
                    optTextColor = '#F87171';
                  } else {
                    optTextColor = '#64748B';
                  }
                }

                return (
                  <TouchableOpacity
                    key={optIdx}
                    style={[
                      styles.optionButton,
                      { borderColor: optBorder, backgroundColor: optBg },
                    ]}
                    disabled={isQuestionAnswered}
                    onPress={() => handleSelectOption(optIdx)}
                  >
                    <Text style={[styles.optionText, { color: optTextColor }]}>
                      {['A', 'B', 'C', 'D'][optIdx]}. {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Wyjaśnienie i podstawa prawna po odpowiedzi */}
            {isQuestionAnswered && (
              <View style={styles.feedbackBox}>
                <Text
                  style={[
                    styles.feedbackTitle,
                    selectedOptionIndex === currentQuestion.correctOptionIndex
                      ? styles.feedbackSuccess
                      : styles.feedbackError,
                  ]}
                >
                  {selectedOptionIndex === currentQuestion.correctOptionIndex
                    ? '✅ Prawidłowa odpowiedź!'
                    : '❌ Błędna odpowiedź!'}
                </Text>
                <Text style={styles.feedbackLegal}>📜 {currentQuestion.legalBasis}</Text>
                <Text style={styles.feedbackExplanation}>{currentQuestion.explanation}</Text>

                {activeQuestionIndex < SAFETY_QUIZ_QUESTIONS.length - 1 ? (
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => setActiveQuestionIndex((prev) => prev + 1)}
                  >
                    <Text style={styles.nextButtonText}>Następne pytanie ➔</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </View>

          {/* Podsumowanie końcowe (jeśli wszystkie pytania rozwiązane) */}
          {quizResult.answeredCount === SAFETY_QUIZ_QUESTIONS.length && (
            <View style={styles.finalSummaryCard}>
              <Text style={styles.finalScoreText}>
                {quizResult.passed ? '🏆' : '⚠️'} Wynik: {quizResult.correctCount}/
                {quizResult.totalQuestions} ({quizResult.scorePercent}%)
              </Text>
              <Text style={styles.finalFeedback}>{quizResult.summaryFeedback}</Text>
              <TouchableOpacity style={styles.resetButton} onPress={handleResetQuiz}>
                <Text style={styles.resetButtonText}>🔄 Rozwiąż quiz ponownie</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#0284C7',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentBox: {
    width: '100%',
  },
  lessonScroll: {
    marginBottom: 12,
  },
  lessonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  lessonChipActive: {
    backgroundColor: '#0369A1',
    borderColor: '#38BDF8',
  },
  lessonChipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  lessonChipTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 160,
  },
  lessonChipTitleActive: {
    color: '#FFFFFF',
  },
  lessonCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  lessonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonIconLarge: {
    fontSize: 28,
  },
  lessonCardTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  lessonMeta: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  summaryText: {
    color: '#E0F2FE',
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  paragraphText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  quizProgressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressDot: {
    flex: 1,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  progressDotCurrent: {
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  progressDotText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  questionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  questionCounter: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  questionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 20,
  },
  optionsList: {
    gap: 8,
  },
  optionButton: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  feedbackBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackSuccess: {
    color: '#34D399',
  },
  feedbackError: {
    color: '#F87171',
  },
  feedbackLegal: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  feedbackExplanation: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  nextButton: {
    marginTop: 10,
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  finalSummaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  finalScoreText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  finalFeedback: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  resetButton: {
    marginTop: 10,
    backgroundColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
});
