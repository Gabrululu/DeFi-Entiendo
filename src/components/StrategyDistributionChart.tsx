import { useState } from 'react';
import { Info } from 'lucide-react';
import type { VaultStrategy } from '../lib/supabase';

interface StrategyDistributionChartProps {
  strategies: VaultStrategy[];
  onLearnMore: (strategy: VaultStrategy) => void;
}

export function StrategyDistributionChart({
  strategies,
  onLearnMore,
}: StrategyDistributionChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const colors = [
    { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
    { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500' },
    { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500' },
  ];

  const total = strategies.reduce((sum, s) => sum + s.allocation_percentage, 0);
  let currentAngle = -90;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-6">Strategy Distribution</h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 200 200" className="transform -rotate-90">
            {strategies.map((strategy, index) => {
              const percentage = (strategy.allocation_percentage / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;

              const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
              const y2 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`,
              ].join(' ');

              const colorClass = colors[index % colors.length];
              const isHovered = hoveredIndex === index;

              return (
                <g key={strategy.id}>
                  <path
                    d={pathData}
                    fill={`rgba(${
                      index === 0
                        ? '59, 130, 246'
                        : index === 1
                        ? '139, 92, 246'
                        : '16, 185, 129'
                    }, ${isHovered ? '0.8' : '0.4'})`}
                    stroke={`rgba(${
                      index === 0
                        ? '59, 130, 246'
                        : index === 1
                        ? '139, 92, 246'
                        : '16, 185, 129'
                    }, 1)`}
                    strokeWidth="2"
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              );
            })}
            <circle
              cx="100"
              cy="100"
              r="50"
              fill="rgb(15, 23, 42)"
              stroke="rgb(51, 65, 85)"
              strokeWidth="2"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {strategies.reduce((sum, s) => sum + s.allocation_percentage, 0)}%
              </div>
              <div className="text-sm text-slate-400">Allocated</div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 w-full">
          {strategies.map((strategy, index) => {
            const colorClass = colors[index % colors.length];
            return (
              <div
                key={strategy.id}
                className={`bg-slate-900/50 border ${
                  hoveredIndex === index ? colorClass.border : 'border-slate-700'
                } rounded-xl p-4 transition-all duration-200 cursor-pointer hover:border-opacity-100`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colorClass.bg}`}></div>
                    <span className="font-semibold text-white">{strategy.name}</span>
                  </div>
                  <button
                    onClick={() => onLearnMore(strategy)}
                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Info className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    {strategy.allocation_percentage}% allocation
                  </span>
                  <span className={`text-sm font-medium ${colorClass.text}`}>
                    {strategy.current_apy}% APY
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
