import { Heart, ExternalLink, Clock } from 'lucide-react';
import type { PublicGoodsProject, ImpactEvent } from '../lib/supabase';

interface ImpactFeedProps {
  projects: PublicGoodsProject[];
  recentEvents: Array<ImpactEvent & { project?: PublicGoodsProject }>;
}

export function ImpactFeed({ projects, recentEvents }: ImpactFeedProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'just now';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-orange-400" />
        <h3 className="text-xl font-bold text-white">Public Goods Impact</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-orange-500/30 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{project.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <div>
                <div className="text-lg font-bold text-orange-400">
                  {project.total_received.toFixed(2)} ETH
                </div>
                <div className="text-xs text-slate-400">Total Received</div>
              </div>
              {project.website_url && (
                <a
                  href={project.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-700 pt-6">
        <h4 className="text-sm font-semibold text-slate-300 mb-4">Recent Impact Events</h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentEvents.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No impact events yet</p>
          ) : (
            recentEvents.map((event) => (
              <div
                key={event.id}
                className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <span className="text-white font-medium">
                        {event.project?.name || 'Public Goods Project'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Received <span className="text-emerald-400 font-medium">{event.amount.toFixed(4)} ETH</span> from yield donations
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {formatTime(event.created_at)}
                  </div>
                </div>
                {event.transaction_hash && (
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <a
                      href={`https://etherscan.io/tx/${event.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      View on Etherscan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
