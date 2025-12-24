import { useState } from 'react';
import { ChatMessage, ToolCall, BankingState } from '../lib/types';
import {
  API_BASE_URL,
  AI_GREETING,
  DEFAULT_INITIAL_BALANCE,
} from '../lib/constants';
import { logger } from '../lib/logger';

interface UseJomKiraChatOptions {
  initialBalance?: number;
  onError?: (error: Error) => void;
}

export function useJomKiraChat({
  initialBalance = DEFAULT_INITIAL_BALANCE,
  onError,
}: UseJomKiraChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bankingState, setBankingState] = useState<BankingState>({
    balance: initialBalance,
    pending_transfer: null,
    pending_bill: null,
    transaction_history: [],
    status: 'idle',
  });

  async function sendMessage(
    text: string,
    image?: { format: string; bytes: string }
  ) {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      image,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': 'react-native',
          ...(sessionId && { 'X-Session-Id': sessionId }),
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image,
          })),
          ...(sessionId ? {} : { initial_balance: bankingState.balance }),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      logger.info('📱 Received chat response', {
        hasMessage: !!data.message,
        toolCallsCount: data.tool_calls?.length || 0,
        hasState: !!data.state,
      });

      // Store session ID
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message.content,
        toolCalls: data.tool_calls,
        bankingState: data.state,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Clear global tool calls since they are now attached to the message in history
      setToolCalls([]);

      // Update banking state
      if (data.state) {
        setBankingState(data.state);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      logger.error('Failed to send message', err);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function initSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': 'react-native',
          ...(sessionId && { 'X-Session-Id': sessionId }),
        },
        body: JSON.stringify({
          messages: [],
          initial_balance: bankingState.balance,
          is_init: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        logger.info('🆕 Session initialized silently', {
          sessionId: data.session_id,
        });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      logger.error('Failed silent initialization', err);
      onError?.(err);
    }
  }

  function clearChat() {
    setMessages([]);
    setToolCalls([]);
    setSessionId(null);
  }

  return {
    messages,
    toolCalls,
    isLoading,
    sessionId,
    bankingState,
    sendMessage,
    initSession,
    clearChat,
    setMessages,
    setToolCalls,
    setBankingState,
  };
}
