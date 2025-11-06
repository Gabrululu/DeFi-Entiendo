import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  wallet_address: string;
  username: string;
  learning_level: 'beginner' | 'intermediate' | 'expert';
  total_deposited: number;
  yield_earned: number;
  impact_created: number;
  created_at: string;
  updated_at: string;
};

export type NFTLesson = {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty_level: 'beginner' | 'intermediate' | 'expert';
  order_index: number;
  image_url: string;
  created_at: string;
};

export type UserNFTProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  unlocked: boolean;
  completed_at: string | null;
  quiz_score: number;
  created_at: string;
};

export type VaultStrategy = {
  id: string;
  name: string;
  allocation_percentage: number;
  current_apy: number;
  description: string;
  logo_url: string;
  updated_at: string;
};

export type PublicGoodsProject = {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  total_received: number;
  website_url: string;
  created_at: string;
};

export type ImpactEvent = {
  id: string;
  user_id: string;
  project_id: string;
  amount: number;
  transaction_hash: string;
  created_at: string;
};

export type GovernanceProposal = {
  id: string;
  title: string;
  description: string;
  votes_for: number;
  votes_against: number;
  status: 'active' | 'passed' | 'rejected';
  ends_at: string;
  created_at: string;
};
