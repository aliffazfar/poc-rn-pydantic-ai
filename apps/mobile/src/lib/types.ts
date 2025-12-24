import { ComponentType } from 'react';
import { SvgProps } from 'react-native-svg';

export interface TransferDetails {
  recipient_name: string;
  bank_name: string;
  account_number: string;
  amount: number;
  reference?: string;
}

export interface BillDetails {
  biller_name: string;
  account_number: string;
  amount: number;
  due_date?: string;
  reference_number?: string;
}

export interface BankingState {
  balance: number;
  pending_transfer: TransferDetails | null;
  pending_bill: BillDetails | null;
  transaction_history: string[];
  status:
    | 'idle'
    | 'confirming_transfer'
    | 'confirming_bill'
    | 'completed'
    | 'error';
}

export interface PromoItem {
  id?: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  subTextColor: string;
  actionText?: string;
}

export interface AccountItem {
  id: string;
  name: string;
  subtitle?: string;
  amount: number;
  badge?: string;
  iconBgColor: string;
  iconColor?: string;
  Icon: ComponentType<SvgProps>;
}

export interface ActionButtonItem {
  id: string;
  label: string;
  Icon: ComponentType<SvgProps>;
  onPress?: () => void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: {
    format: string;
    bytes: string;
  };
  toolCalls?: ToolCall[];
  bankingState?: BankingState;
}

export interface ToolCall {
  tool_name: string;
  args: Record<string, unknown>;
  status: 'executing' | 'complete';
}

/**
 * Interface for the chat API response from the backend.
 * Provides consistency for parsing message, tool calls and state updates.
 */
export interface ChatAPIResponse {
  session_id?: string;
  message: { content: string };
  tool_calls?: ToolCall[];
  state?: BankingState;
}
