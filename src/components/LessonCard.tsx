import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Award, CheckCircle, Loader2 } from 'lucide-react';
import { CONTRACTS } from '../contracts/addresses';
import ProgressTrackerABI from '../contracts/abis/ProgressTracker.json';

interface LessonCardProps {
  lessonId: number;
  title: string;
  description: string;
  difficulty: string;
  points: number;
}

export function LessonCard({ title, description, difficulty, points }: LessonCardProps) {
  const { address } = useAccount();
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleCompleteLesson = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (quizScore < 70) {
      alert('You need at least 70% to pass. Try again!');
      return;
    }

    setIsCompleting(true);

    try {
      // Record completion in ProgressTracker
      writeContract({
        address: CONTRACTS.sepolia.progressTracker,
        abi: ProgressTrackerABI.abi,
        functionName: 'recordAction',
        args: [
          address,
          1, // ActionType.COMPLETE_LESSON
          points
        ],
      });
    } catch (error) {
      console.error('Error completing lesson:', error);
      setIsCompleting(false);
    }
  };

  if (isSuccess) {
    // NFT will be minted automatically by ProgressTracker if eligible
    setTimeout(() => {
      setIsCompleting(false);
      alert('Lesson completed! Check your wallet for NFT certificate.');
    }, 1000);
  }

  return (
    <div className="card hover:border-blue-500/50 transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <span className={`px-3 py-1 text-xs rounded-full ${
          difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
          difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {difficulty}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Award className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-slate-300">{points} points</span>
      </div>

      {!showQuiz ? (
        <button
          onClick={() => setShowQuiz(true)}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Start Lesson
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-slate-300 mb-3">Quiz: What is an ERC-4626 vault?</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="quiz" onChange={() => setQuizScore(100)} />
                <span className="text-slate-300">A standardized vault for yield-bearing tokens</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="quiz" onChange={() => setQuizScore(0)} />
                <span className="text-slate-300">A type of NFT</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="quiz" onChange={() => setQuizScore(0)} />
                <span className="text-slate-300">A wallet</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleCompleteLesson}
            disabled={isCompleting || isLoading || quizScore === 0}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            {(isCompleting || isLoading) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed!
              </>
            ) : (
              'Complete Lesson'
            )}
          </button>
        </div>
      )}
    </div>
  );
}