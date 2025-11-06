import { useState } from 'react';
import { X, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import type { NFTLesson } from '../lib/supabase';

interface EducationalModalProps {
  lesson: NFTLesson | null;
  onClose: () => void;
  onComplete: (lessonId: string, score: number) => Promise<void>;
}

const quizQuestions = [
  {
    question: 'What is the main benefit of using a DeFi vault?',
    options: [
      'It automatically manages your assets for optimal returns',
      'It stores your crypto offline',
      'It provides insurance for all investments',
      'It requires no transaction fees',
    ],
    correct: 0,
  },
  {
    question: 'What does APY stand for?',
    options: [
      'Annual Payment Yield',
      'Annual Percentage Yield',
      'Automated Protocol Yield',
      'Average Performance Yearly',
    ],
    correct: 1,
  },
  {
    question: 'Why is diversification important in DeFi?',
    options: [
      'To maximize gas fees',
      'To reduce risk by spreading investments',
      'To increase transaction speed',
      'To earn more rewards',
    ],
    correct: 1,
  },
];

export function EducationalModal({ lesson, onClose, onComplete }: EducationalModalProps) {
  const [stage, setStage] = useState<'learning' | 'quiz' | 'results'>('learning');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lesson) return null;

  const handleStartQuiz = () => {
    setStage('quiz');
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === quizQuestions[currentQuestion].correct;
    setAnswers([...answers, isCorrect]);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setStage('results');
    }
  };

  const handleComplete = async () => {
    const score = Math.round((answers.filter((a) => a).length / quizQuestions.length) * 100);
    setIsSubmitting(true);
    try {
      await onComplete(lesson.id, score);
      onClose();
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const score = Math.round((answers.filter((a) => a).length / quizQuestions.length) * 100);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{lesson.title}</h2>
              <p className="text-sm text-slate-400">{lesson.difficulty_level}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {stage === 'learning' && (
            <div className="space-y-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed text-lg">{lesson.content}</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h3 className="text-blue-400 font-semibold mb-2">Key Takeaway</h3>
                <p className="text-slate-300 text-sm">{lesson.description}</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleStartQuiz}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all duration-200"
                >
                  Take Quiz
                </button>
              </div>
            </div>
          )}

          {stage === 'quiz' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-400">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </span>
                <div className="flex gap-2">
                  {quizQuestions.map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-1 rounded-full ${
                        i < currentQuestion
                          ? 'bg-purple-500'
                          : i === currentQuestion
                          ? 'bg-purple-400'
                          : 'bg-slate-700'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {quizQuestions[currentQuestion].question}
                </h3>

                <div className="space-y-3">
                  {quizQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedAnswer === index
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                      }`}
                    >
                      <span className="text-white">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
                </button>
              </div>
            </div>
          )}

          {stage === 'results' && (
            <div className="space-y-6">
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                    score >= 70 ? 'bg-emerald-500/20' : 'bg-orange-500/20'
                  }`}
                >
                  {score >= 70 ? (
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <XCircle className="w-10 h-10 text-orange-400" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {score >= 70 ? 'Congratulations!' : 'Keep Learning!'}
                </h3>
                <p className="text-slate-400">
                  You scored <span className="text-white font-semibold">{score}%</span> on this quiz
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 space-y-3">
                {quizQuestions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {answers[i] ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-white text-sm">{q.question}</p>
                      {!answers[i] && (
                        <p className="text-xs text-slate-400 mt-1">
                          Correct answer: {q.options[q.correct]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStartQuiz}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all duration-200"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Completing...' : 'Complete Lesson'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                style={{
                  width: `${
                    stage === 'learning'
                      ? 33
                      : stage === 'quiz'
                      ? 33 + ((currentQuestion + 1) / quizQuestions.length) * 34
                      : 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
