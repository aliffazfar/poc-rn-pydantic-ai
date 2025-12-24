import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Check } from 'lucide-react-native';
import { InChatPaymentCard } from './InChatPaymentCard';
import { BankingState, ToolCall } from '../../lib/types';
import { colors } from '../../themes/colors';
import { uiLog } from '../../lib/logger';

interface ToolCallRendererProps {
  toolCalls: ToolCall[];
  bankingState?: BankingState;
  onTransferApprove: (args: Record<string, unknown>) => void;
  onTransferDecline: () => void;
  onTransferEdit: () => void;
  onBillPaymentApprove: (args: Record<string, unknown>) => void;
  onBillPaymentDecline: () => void;
}

export function ToolCallRenderer({
  toolCalls,
  bankingState,
  onTransferApprove,
  onTransferDecline,
  onTransferEdit,
  onBillPaymentApprove,
  onBillPaymentDecline,
}: ToolCallRendererProps) {
  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  return (
    <>
      {toolCalls.map((toolCall, index) => {
        uiLog.info(
          `🛠️ ToolCallRenderer: Processing [${index}] ${toolCall.tool_name}`,
          {
            status: toolCall.status,
            args: toolCall.args,
            bankingStateStatus: bankingState?.status,
          }
        );

        // Show loading state while executing
        if (toolCall.status === 'executing') {
          return (
            <View
              key={index}
              className="mx-4 my-2 items-center rounded-xl p-4"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="mt-2 text-sm text-slate-500">
                Processing {toolCall.tool_name}...
              </Text>
            </View>
          );
        }

        // Render appropriate card based on tool name
        switch (toolCall.tool_name) {
          case 'prepare_transfer':
            return (
              <InChatPaymentCard
                key={index}
                type="transfer"
                amount={Number(toolCall.args.amount || 0)}
                reference={
                  toolCall.args.reference
                    ? String(toolCall.args.reference)
                    : undefined
                }
                recipientName={String(toolCall.args.recipient_name || '')}
                bankName={String(toolCall.args.bank_name || '')}
                accountNumber={String(toolCall.args.account_number || '')}
                onApprove={() => onTransferApprove(toolCall.args)}
                onDecline={onTransferDecline}
                onEdit={onTransferEdit}
              />
            );

          case 'confirm_transfer': {
            // After confirmation, we show the card in a success/completed state
            const history = bankingState?.transaction_history || [];

            return (
              <View
                key={index}
                className="my-2 overflow-hidden rounded-2xl p-4"
                style={{
                  backgroundColor: 'rgba(41, 41, 64, 0.4)',
                }}
              >
                {/* Header row with check icon and title */}
                <View className="mb-2 flex-row items-center">
                  <View
                    className="mr-2 h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <Check size={14} color={colors.success} strokeWidth={3} />
                  </View>
                  <Text
                    className="text-sm font-bold"
                    style={{ color: colors.success }}
                  >
                    Transfer Completed
                  </Text>
                </View>
                {/* Transaction details */}
                <Text className="text-sm leading-5 text-white">
                  {history[history.length - 1] ||
                    'Your transfer was successful.'}
                </Text>
              </View>
            );
          }

          case 'prepare_bill_payment':
            return (
              <InChatPaymentCard
                key={index}
                type="bill"
                amount={Number(toolCall.args.amount || 0)}
                reference={
                  toolCall.args.reference
                    ? String(toolCall.args.reference)
                    : undefined
                }
                billerName={String(toolCall.args.biller_name || '')}
                billerAccountNumber={String(toolCall.args.account_number || '')}
                dueDate={
                  toolCall.args.due_date
                    ? String(toolCall.args.due_date)
                    : undefined
                }
                onApprove={() => onBillPaymentApprove(toolCall.args)}
                onDecline={onBillPaymentDecline}
                onEdit={onBillPaymentDecline} // Bill payments typically don't have edit, so decline
              />
            );

          case 'confirm_bill_payment': {
            // After confirmation, show success state for bill payment
            const history = bankingState?.transaction_history || [];

            return (
              <View
                key={index}
                className="my-2 overflow-hidden rounded-2xl p-4"
                style={{
                  backgroundColor: 'rgba(41, 41, 64, 0.4)',
                }}
              >
                {/* Header row with check icon and title */}
                <View className="mb-2 flex-row items-center">
                  <View
                    className="mr-2 h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <Check size={14} color={colors.success} strokeWidth={3} />
                  </View>
                  <Text
                    className="text-sm font-bold"
                    style={{ color: colors.success }}
                  >
                    Bill Payment Completed
                  </Text>
                </View>
                {/* Transaction details */}
                <Text className="text-sm leading-5 text-white">
                  {history[history.length - 1] ||
                    'Your bill payment was successful.'}
                </Text>
              </View>
            );
          }

          default:
            uiLog.warn(`Unknown tool call: ${toolCall.tool_name}`);
            return null;
        }
      })}
    </>
  );
}
