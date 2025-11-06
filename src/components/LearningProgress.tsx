import { Award, CheckCircle, Zap } from 'lucide-react';

interface LearningProgressProps {
  currentLevel: 'beginner' | 'intermediate' | 'expert';
  completedLessons: number;
  totalLessons: number;
  onNextLesson: () => void;
}

export function LearningProgress({
  currentLevel,
  completedLessons,
  totalLessons,
  onNextLesson,
}: LearningProgressProps) {
  const progress = (completedLessons / totalLessons) * 100;

  const levelConfig = {
    beginner: { label: 'Beginner', gradient: 'from-[#00D4FF] to-[#0099FF]', textColor: 'text-[#00D4FF]' },
    intermediate: { label: 'Intermediate', gradient: 'from-[#84FF00] to-[#66CC00]', textColor: 'text-[#84FF00]' },
    expert: { label: 'Expert', gradient: 'from-[#FF6B00] to-[#FF0080]', textColor: 'text-[#FF0080]' },
  };

  const config = levelConfig[currentLevel];

  return (
    <div className="glass-effect glass-hover rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Your Learning Journey</h3>
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${config.gradient} bg-opacity-20 rounded-lg`}>
          <Zap className="w-4 h-4 text-white" />
          <span className={`font-semibold text-white`}>{config.label}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-300">Learning Progress</span>
            <span className="text-sm font-semibold text-white">
              {completedLessons} / {totalLessons} Lessons
            </span>
          </div>
          <div className="h-3 glass-effect rounded-full overflow-hidden relative">
            <div
              className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500 rounded-full shimmer`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center glass-effect rounded-xl p-3 transform hover:scale-105 transition-all">
            <div className="text-2xl font-bold text-[#00D4FF]">{completedLessons}</div>
            <div className="text-xs text-slate-400">Completed</div>
          </div>
          <div className="text-center glass-effect rounded-xl p-3 transform hover:scale-105 transition-all">
            <div className="text-2xl font-bold text-[#84FF00]">{totalLessons - completedLessons}</div>
            <div className="text-xs text-slate-400">Remaining</div>
          </div>
          <div className="text-center glass-effect rounded-xl p-3 transform hover:scale-105 transition-all">
            <div className="text-2xl font-bold gradient-text">{Math.round(progress)}%</div>
            <div className="text-xs text-slate-400">Progress</div>
          </div>
        </div>

        {completedLessons < totalLessons && (
          <button
            onClick={onNextLesson}
            className="w-full py-3 btn-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Continue Learning
          </button>
        )}

        {completedLessons === totalLessons && (
          <div className="text-center p-4 glass-effect rounded-xl card-glow animate-celebrate">
            <Award className="w-8 h-8 text-[#84FF00] mx-auto mb-2 animate-pulse" />
            <p className="gradient-text font-semibold">All lessons completed!</p>
            <p className="text-sm text-slate-400 mt-1">You're a DeFi expert now</p>
          </div>
        )}
      </div>
    </div>
  );
}
