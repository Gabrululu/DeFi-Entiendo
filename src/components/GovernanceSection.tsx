import { Vote, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { GovernanceProposal } from '../lib/supabase';

interface GovernanceSectionProps {
  proposals: GovernanceProposal[];
  onVote: (proposalId: string, vote: 'for' | 'against') => Promise<void>;
  hasVoted: (proposalId: string) => boolean;
}

export function GovernanceSection({ proposals, onVote, hasVoted }: GovernanceSectionProps) {
  const getTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 1) return `${diffDays} days left`;
    if (diffHours > 0) return `${diffHours} hours left`;
    return 'Ending soon';
  };

  const getVotePercentages = (proposal: GovernanceProposal) => {
    const total = proposal.votes_for + proposal.votes_against;
    if (total === 0) return { forPercentage: 50, againstPercentage: 50 };

    return {
      forPercentage: (proposal.votes_for / total) * 100,
      againstPercentage: (proposal.votes_against / total) * 100,
    };
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Vote className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Community Governance</h3>
      </div>

      <div className="space-y-4">
        {proposals.map((proposal) => {
          const { forPercentage, againstPercentage } = getVotePercentages(proposal);
          const userHasVoted = hasVoted(proposal.id);
          const isActive = proposal.status === 'active';

          return (
            <div
              key={proposal.id}
              className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">{proposal.title}</h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        proposal.status === 'active'
                          ? 'bg-blue-500/20 text-blue-400'
                          : proposal.status === 'passed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {proposal.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{proposal.description}</p>

                  {isActive && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {getTimeRemaining(proposal.ends_at)}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-emerald-400 font-medium">For</span>
                      <span className="text-white">{proposal.votes_for} votes</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${forPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-emerald-400 w-12 text-right">
                    {forPercentage.toFixed(0)}%
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-400 font-medium">Against</span>
                      <span className="text-white">{proposal.votes_against} votes</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${againstPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-red-400 w-12 text-right">
                    {againstPercentage.toFixed(0)}%
                  </div>
                </div>
              </div>

              {isActive && !userHasVoted && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => onVote(proposal.id, 'for')}
                    className="flex-1 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Vote For
                  </button>
                  <button
                    onClick={() => onVote(proposal.id, 'against')}
                    className="flex-1 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Vote Against
                  </button>
                </div>
              )}

              {userHasVoted && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-center text-sm text-slate-400">
                    You have already voted on this proposal
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
