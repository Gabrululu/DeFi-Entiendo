/*
  # DeFi Entiendo Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique) - User's connected wallet
      - `username` (text) - Optional display name
      - `learning_level` (text) - Current level: beginner, intermediate, expert
      - `total_deposited` (numeric) - Total amount deposited in vault
      - `yield_earned` (numeric) - Total yield generated
      - `impact_created` (numeric) - Total donated to public goods
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `nft_lessons`
      - `id` (uuid, primary key)
      - `title` (text) - Lesson title
      - `description` (text) - What users will learn
      - `content` (text) - Full lesson content
      - `difficulty_level` (text) - beginner, intermediate, expert
      - `order_index` (int) - Display order
      - `image_url` (text) - NFT image
      - `created_at` (timestamptz)
    
    - `user_nft_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `lesson_id` (uuid, foreign key to nft_lessons)
      - `unlocked` (boolean) - Whether NFT is unlocked
      - `completed_at` (timestamptz) - When lesson was completed
      - `quiz_score` (int) - Score on quiz
      - `created_at` (timestamptz)
    
    - `vault_strategies`
      - `id` (uuid, primary key)
      - `name` (text) - Strategy name (Aave, Compound, etc)
      - `allocation_percentage` (numeric) - % of vault allocated
      - `current_apy` (numeric) - Current APY
      - `description` (text) - Strategy explanation
      - `logo_url` (text) - Protocol logo
      - `updated_at` (timestamptz)
    
    - `public_goods_projects`
      - `id` (uuid, primary key)
      - `name` (text) - Project name
      - `description` (text) - Brief description
      - `logo_url` (text) - Project logo
      - `total_received` (numeric) - Total donations received
      - `website_url` (text)
      - `created_at` (timestamptz)
    
    - `impact_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `project_id` (uuid, foreign key to public_goods_projects)
      - `amount` (numeric) - Donation amount
      - `transaction_hash` (text) - Blockchain tx hash
      - `created_at` (timestamptz)
    
    - `governance_proposals`
      - `id` (uuid, primary key)
      - `title` (text) - Proposal title
      - `description` (text) - Full proposal details
      - `votes_for` (int) - Number of votes for
      - `votes_against` (int) - Number of votes against
      - `status` (text) - active, passed, rejected
      - `ends_at` (timestamptz) - Voting deadline
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for lesson content and vault strategies
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text DEFAULT '',
  learning_level text DEFAULT 'beginner',
  total_deposited numeric DEFAULT 0,
  yield_earned numeric DEFAULT 0,
  impact_created numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create nft_lessons table
CREATE TABLE IF NOT EXISTS nft_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  difficulty_level text DEFAULT 'beginner',
  order_index int NOT NULL,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nft_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons"
  ON nft_lessons FOR SELECT
  TO authenticated
  USING (true);

-- Create user_nft_progress table
CREATE TABLE IF NOT EXISTS user_nft_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES nft_lessons(id) ON DELETE CASCADE,
  unlocked boolean DEFAULT false,
  completed_at timestamptz,
  quiz_score int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_nft_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_nft_progress FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own progress"
  ON user_nft_progress FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own progress"
  ON user_nft_progress FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create vault_strategies table
CREATE TABLE IF NOT EXISTS vault_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  allocation_percentage numeric NOT NULL,
  current_apy numeric NOT NULL,
  description text NOT NULL,
  logo_url text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vault_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view strategies"
  ON vault_strategies FOR SELECT
  TO authenticated
  USING (true);

-- Create public_goods_projects table
CREATE TABLE IF NOT EXISTS public_goods_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  logo_url text DEFAULT '',
  total_received numeric DEFAULT 0,
  website_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public_goods_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects"
  ON public_goods_projects FOR SELECT
  TO authenticated
  USING (true);

-- Create impact_events table
CREATE TABLE IF NOT EXISTS impact_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public_goods_projects(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  transaction_hash text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE impact_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view impact events"
  ON impact_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create impact events"
  ON impact_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create governance_proposals table
CREATE TABLE IF NOT EXISTS governance_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  votes_for int DEFAULT 0,
  votes_against int DEFAULT 0,
  status text DEFAULT 'active',
  ends_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proposals"
  ON governance_proposals FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample data for vault strategies
INSERT INTO vault_strategies (name, allocation_percentage, current_apy, description, logo_url) VALUES
  ('Aave', 40, 7.2, 'Lending protocol providing stable yields through overcollateralized loans', ''),
  ('Compound', 35, 8.9, 'Algorithmic money market protocol with dynamic interest rates', ''),
  ('Uniswap V4', 25, 9.8, 'Concentrated liquidity provision in decentralized exchange pools', '')
ON CONFLICT DO NOTHING;

-- Insert sample NFT lessons
INSERT INTO nft_lessons (title, description, content, difficulty_level, order_index, image_url) VALUES
  ('Intro to Vaults', 'Learn what DeFi vaults are and how they work', 'A DeFi vault is a smart contract that automatically manages your crypto assets across different protocols to maximize returns while minimizing risk. Think of it like a robo-advisor for crypto!', 'beginner', 1, ''),
  ('How Lending Works', 'Understand the mechanics of DeFi lending protocols', 'DeFi lending allows you to earn interest by lending your crypto to borrowers who provide collateral. The interest rates are determined by supply and demand, making them dynamic and often higher than traditional savings accounts.', 'beginner', 2, ''),
  ('Understanding Yield', 'Master the concept of APY and yield generation', 'Yield in DeFi comes from various sources: lending interest, trading fees, and protocol rewards. APY (Annual Percentage Yield) includes compounding, showing the true earning potential over a year.', 'intermediate', 3, ''),
  ('Liquidity Pools 101', 'Discover how automated market makers create trading markets', 'Liquidity pools are smart contracts holding two or more tokens that enable decentralized trading. Providers earn fees from every trade, proportional to their share of the pool.', 'intermediate', 4, ''),
  ('Risk Management', 'Learn to identify and mitigate DeFi risks', 'DeFi risks include smart contract bugs, impermanent loss, and market volatility. Diversification, audited protocols, and understanding the mechanisms you use are key to managing these risks.', 'expert', 5, '')
ON CONFLICT DO NOTHING;

-- Insert sample public goods projects
INSERT INTO public_goods_projects (name, description, logo_url, total_received, website_url) VALUES
  ('Ethereum Development', 'Supporting core Ethereum protocol development and research', '', 15420.50, 'https://ethereum.org'),
  ('DeFi Education Fund', 'Creating free educational resources for DeFi newcomers worldwide', '', 8950.25, ''),
  ('Open Source Tools', 'Building and maintaining open-source DeFi development tools', '', 12100.75, '')
ON CONFLICT DO NOTHING;

-- Insert sample governance proposals
INSERT INTO governance_proposals (title, description, votes_for, votes_against, status, ends_at) VALUES
  ('Increase Aave Allocation to 45%', 'Proposal to increase Aave allocation from 40% to 45% due to improved yields and reduced risk profile', 342, 89, 'active', now() + interval '7 days'),
  ('Add New Public Goods Partner', 'Vote to add "Climate Action DAO" as a new recipient of vault yield donations', 521, 45, 'active', now() + interval '5 days')
ON CONFLICT DO NOTHING;