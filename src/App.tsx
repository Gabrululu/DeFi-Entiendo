import { useState, useEffect, useRef } from 'react';
import { useWallet } from './hooks/useWallet';
import { ConnectWalletButton } from './components/ConnectWalletButton';
import { Hero } from './components/Hero';
import { VaultDepositCard } from './components/VaultDepositCard';
import { PortfolioOverview } from './components/PortfolioOverview';
import { StrategyDistributionChart } from './components/StrategyDistributionChart';
import { LearningProgress } from './components/LearningProgress';
import { NFTCollectionGrid } from './components/NFTCollectionGrid';
import { EducationalModal } from './components/EducationalModal';
import { ImpactFeed } from './components/ImpactFeed';
import { GovernanceSection } from './components/GovernanceSection';
import { MobileNav } from './components/MobileNav';
import { supabase } from './lib/supabase';
import type {
  VaultStrategy,
  NFTLesson,
  UserNFTProgress,
  PublicGoodsProject,
  ImpactEvent,
  GovernanceProposal,
} from './lib/supabase';
import { Coins } from 'lucide-react';

function App() {
  const { address, isConnecting, connect, disconnect } = useWallet();
  const [strategies, setStrategies] = useState<VaultStrategy[]>([]);
  const [lessons, setLessons] = useState<NFTLesson[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserNFTProgress>>(new Map());
  const [projects, setProjects] = useState<PublicGoodsProject[]>([]);
  const [impactEvents, setImpactEvents] = useState<Array<ImpactEvent & { project?: PublicGoodsProject }>>([]);
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<NFTLesson | null>(null);
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set());

  const [userBalance, setUserBalance] = useState(5.2345);
  const [vaultBalance, setVaultBalance] = useState(3.5678);
  const [depositedAmount, setDepositedAmount] = useState(3.5);
  const [yieldGenerated, setYieldGenerated] = useState(0.0678);
  const [impactCreated, setImpactCreated] = useState(0.0425);

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: strategiesData } = await supabase
      .from('vault_strategies')
      .select('*')
      .order('allocation_percentage', { ascending: false });

    const { data: lessonsData } = await supabase
      .from('nft_lessons')
      .select('*')
      .order('order_index');

    const { data: projectsData } = await supabase
      .from('public_goods_projects')
      .select('*')
      .order('total_received', { ascending: false });

    const { data: eventsData } = await supabase
      .from('impact_events')
      .select('*, project_id')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: proposalsData } = await supabase
      .from('governance_proposals')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (strategiesData) setStrategies(strategiesData);
    if (lessonsData) {
      setLessons(lessonsData);
      const progressMap = new Map();
      lessonsData.forEach((lesson, index) => {
        progressMap.set(lesson.id, {
          id: `progress-${lesson.id}`,
          user_id: 'demo-user',
          lesson_id: lesson.id,
          unlocked: index === 0,
          completed_at: null,
          quiz_score: 0,
          created_at: new Date().toISOString(),
        });
      });
      setUserProgress(progressMap);
    }
    if (projectsData) setProjects(projectsData);
    if (eventsData && projectsData) {
      const eventsWithProjects = eventsData.map((event) => ({
        ...event,
        project: projectsData.find((p) => p.id === event.project_id),
      }));
      setImpactEvents(eventsWithProjects);
    }
    if (proposalsData) setProposals(proposalsData);
  };

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeposit = async (amount: number) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setUserBalance((prev) => prev - amount);
    setVaultBalance((prev) => prev + amount);
    setDepositedAmount((prev) => prev + amount);
  };

  const handleWithdraw = async (amount: number) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setUserBalance((prev) => prev + amount);
    setVaultBalance((prev) => prev - amount);
    setDepositedAmount((prev) => prev - amount);
  };

  const handleLearnMore = (strategy: VaultStrategy) => {
    alert(`${strategy.name}\n\n${strategy.description}\n\nCurrent APY: ${strategy.current_apy}%`);
  };

  const handleStartLesson = (lesson: NFTLesson) => {
    const progress = userProgress.get(lesson.id);
    if (progress?.unlocked) {
      setSelectedLesson(lesson);
    }
  };

  const handleCompleteLesson = async (lessonId: string, score: number) => {
    const newProgress = new Map(userProgress);
    const progress = newProgress.get(lessonId);
    if (progress) {
      progress.completed_at = new Date().toISOString();
      progress.quiz_score = score;
    }

    const currentIndex = lessons.findIndex((l) => l.id === lessonId);
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      const nextProgress = newProgress.get(nextLesson.id);
      if (nextProgress) {
        nextProgress.unlocked = true;
      }
    }

    setUserProgress(newProgress);
    setSelectedLesson(null);
  };

  const handleVote = async (proposalId: string, vote: 'for' | 'against') => {
    if (!address) {
      alert('Please connect your wallet to vote');
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              votes_for: vote === 'for' ? p.votes_for + 1 : p.votes_for,
              votes_against: vote === 'against' ? p.votes_against + 1 : p.votes_against,
            }
          : p
      )
    );

    setVotedProposals((prev) => new Set(prev).add(proposalId));
  };

  const hasVoted = (proposalId: string) => votedProposals.has(proposalId);

  const completedLessons = Array.from(userProgress.values()).filter((p) => p.completed_at).length;
  const currentAPY = strategies.length > 0 ? 8.5 : 0;

  const navigateToSection = (section: string) => {
    const sections: { [key: string]: HTMLElement | null } = {
      vault: dashboardRef.current,
      learn: dashboardRef.current,
      strategies: dashboardRef.current,
      impact: dashboardRef.current,
      governance: dashboardRef.current,
    };

    sections[section]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="sticky top-0 z-40 glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#00D4FF] via-[#84FF00] to-[#FF6B00] rounded-xl animate-float">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">DeFi Entiendo</span>
            </div>
            <ConnectWalletButton
              address={address}
              isConnecting={isConnecting}
              onConnect={connect}
              onDisconnect={disconnect}
            />
          </div>
        </div>
      </nav>

      <Hero onExplore={scrollToDashboard} />

      <div ref={dashboardRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 mb-20 md:mb-0">
        <PortfolioOverview
          depositedAmount={depositedAmount}
          vaultValue={vaultBalance}
          yieldGenerated={yieldGenerated}
          impactCreated={impactCreated}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VaultDepositCard
            userBalance={userBalance}
            vaultBalance={vaultBalance}
            currentAPY={currentAPY}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
          />
          <LearningProgress
            currentLevel="beginner"
            completedLessons={completedLessons}
            totalLessons={lessons.length}
            onNextLesson={() => {
              const nextUncompletedLesson = lessons.find((lesson) => {
                const progress = userProgress.get(lesson.id);
                return progress?.unlocked && !progress?.completed_at;
              });
              if (nextUncompletedLesson) {
                handleStartLesson(nextUncompletedLesson);
              }
            }}
          />
        </div>

        <StrategyDistributionChart strategies={strategies} onLearnMore={handleLearnMore} />

        <NFTCollectionGrid
          lessons={lessons}
          userProgress={userProgress}
          onStartLesson={handleStartLesson}
        />

        <ImpactFeed projects={projects} recentEvents={impactEvents} />

        <GovernanceSection proposals={proposals} onVote={handleVote} hasVoted={hasVoted} />
      </div>

      <footer className="glass-effect border-t border-white/10 mt-16 mb-20 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-400 text-sm">
            <p className="mb-2 gradient-text font-semibold">DeFi Entiendo - Learn, Earn, and Fund Public Goods</p>
            <p className="text-xs text-slate-500">
              This is a demo application showcasing gamified DeFi education
            </p>
          </div>
        </div>
      </footer>

      <MobileNav onNavigate={navigateToSection} />

      <EducationalModal
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
        onComplete={handleCompleteLesson}
      />
    </div>
  );
}

export default App;
