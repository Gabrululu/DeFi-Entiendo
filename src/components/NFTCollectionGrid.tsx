import { Lock, CheckCircle, BookOpen, Sparkles } from 'lucide-react';
import type { NFTLesson, UserNFTProgress } from '../lib/supabase';

interface NFTCollectionGridProps {
  lessons: NFTLesson[];
  userProgress: Map<string, UserNFTProgress>;
  onStartLesson: (lesson: NFTLesson) => void;
}

export function NFTCollectionGrid({
  lessons,
  userProgress,
  onStartLesson,
}: NFTCollectionGridProps) {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'text-[#00D4FF] bg-[#00D4FF]/20';
      case 'intermediate':
        return 'text-[#84FF00] bg-[#84FF00]/20';
      case 'expert':
        return 'text-[#FF6B00] bg-[#FF6B00]/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="glass-effect glass-hover rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-[#FF0080]" />
        <h3 className="text-xl font-bold text-white">Educational NFT Collection</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => {
          const progress = userProgress.get(lesson.id);
          const isUnlocked = progress?.unlocked || false;
          const isCompleted = progress?.completed_at != null;

          return (
            <div
              key={lesson.id}
              className={`group relative glass-effect rounded-xl p-5 transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ${
                isUnlocked
                  ? 'hover:shadow-xl hover:shadow-[#FF0080]/20'
                  : 'opacity-50'
              } ${isCompleted ? 'animate-celebrate' : ''}`}
              onClick={() => isUnlocked && onStartLesson(lesson)}
            >
              <div className="relative mb-4">
                <div
                  className={`w-full h-32 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-[#00D4FF]/20 via-[#84FF00]/20 to-[#FF6B00]/20'
                      : 'bg-slate-800'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-12 h-12 text-[#84FF00]" />
                  ) : isUnlocked ? (
                    <BookOpen className="w-12 h-12 gradient-text" />
                  ) : (
                    <Lock className="w-12 h-12 text-slate-600" />
                  )}
                </div>

                {isCompleted && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#84FF00] to-[#00D4FF] text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse-glow">
                    Completed
                  </div>
                )}

                {isUnlocked && !isCompleted && (
                  <div className="absolute inset-0 rounded-lg shimmer opacity-30"></div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-white group-hover:gradient-text transition-all">
                    {lesson.title}
                  </h4>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2">{lesson.description}</p>

                <div className="flex items-center justify-between pt-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium ${getDifficultyColor(
                      lesson.difficulty_level
                    )}`}
                  >
                    {lesson.difficulty_level}
                  </span>

                  {isUnlocked && !isCompleted && (
                    <span className="text-xs gradient-text font-medium">Start →</span>
                  )}
                  {!isUnlocked && (
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
