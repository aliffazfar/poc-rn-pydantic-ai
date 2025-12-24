import React from 'react';
import {
  Scan,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  PiggyBank,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Landmark,
} from 'lucide-react-native';
import { ActionButtonItem, AccountItem, PromoItem } from './types';
import { colors } from '../themes/colors';

/**
 * Static actions for the dashboard balance card.
 * Defined here to keep App.tsx clean and focused on logic.
 */
export const DASHBOARD_ACTIONS: ActionButtonItem[] = [
  { label: 'Scan', Icon: Scan, id: 'scan' },
  { label: 'Add money', Icon: Plus, id: 'add_money' },
  { label: 'Receive', Icon: ArrowDownLeft, id: 'receive' },
  { label: 'Transfer', Icon: ArrowUpRight, id: 'transfer' },
];

/**
 * Factory function to create mock accounts based on current balance.
 * This allows us to react to balance changes in the banking state.
 */
export const createMockAccounts = (balance: number): AccountItem[] => [
  {
    id: 'main',
    name: 'Main Account',
    amount: balance,
    badge: '3.00% p.a.',
    iconBgColor: colors.primaryDark,
    Icon: Wallet,
  },
  {
    id: 'pocket',
    name: 'Jom Pocket',
    subtitle: 'Save Pocket',
    amount: 0.0,
    badge: '3.00% p.a.',
    iconBgColor: '#2DD4BF', // teal-400
    Icon: PiggyBank,
  },
];

/**
 * Promotional data for the dashboard carousel.
 * Includes JSX elements for icons, which is why this is a .tsx file.
 */
export const PROMO_DATA: PromoItem[] = [
  {
    id: 'paylater',
    title: 'JomKira PayLater',
    description: 'Get credit limit up to RM 1,499',
    icon: <Sparkles size={20} color="#006064" />,
    bgColor: '#b6faf6',
    textColor: '#008d89',
    subTextColor: '#000000',
    actionText: 'Apply now',
  },
  {
    id: 'jomkira-ai',
    title: 'JomKira AI',
    description: 'Get RM 5 cashback!',
    icon: <Sparkles size={20} color="#c100c7" />,
    bgColor: '#ffdbff',
    textColor: '#c100c7',
    subTextColor: '#000000',
    actionText: 'Learn more',
  },
  {
    id: 'savings',
    title: 'Smart Savings',
    description: 'Earn 4.2% p.a. interest today',
    icon: <TrendingUp size={20} color="#2E7D32" />,
    bgColor: '#E8F5E9',
    textColor: '#2E7D32',
    subTextColor: '#388E3C',
    actionText: 'Save now',
  },
  {
    id: 'security',
    title: 'Card Security',
    description: 'New: Instant card lock feature',
    icon: <ShieldCheck size={20} color="#E65100" />,
    bgColor: '#FFF3E0',
    textColor: '#E65100',
    subTextColor: '#EF6C00',
    actionText: 'Secure now',
  },
  {
    id: 'fd',
    title: 'Fixed Deposit',
    description: 'Higher returns for your wealth',
    icon: <Landmark size={20} color="#1A237E" />,
    bgColor: '#E8EAF6',
    textColor: '#1A237E',
    subTextColor: '#283593',
    actionText: 'Invest now',
  },
];
