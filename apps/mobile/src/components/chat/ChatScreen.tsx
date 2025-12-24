import React, { useRef, forwardRef } from 'react';
import { View, ScrollViewProps } from 'react-native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import {
  KeyboardStickyView,
  KeyboardAwareScrollView,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BankingState, ChatMessage, ToolCall } from '../../lib/types';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { ChatInput } from './ChatInput';
import { ChatShortcuts } from './ChatShortcuts';

interface ChatScreenProps {
  messages: ChatMessage[];
  toolCalls: ToolCall[];
  isLoading: boolean;
  onSendMessage: (
    text: string,
    image?: { format: string; bytes: string }
  ) => void;
  renderToolCalls?: (
    calls?: ToolCall[],
    state?: BankingState
  ) => React.ReactNode;
  bottomOffset?: number; // Space for peeked sheet
}

// Forward ref component for KeyboardAwareScrollView integration with FlashList
// Using 'any' for ref type as FlashList expects ScrollView ref but KeyboardAwareScrollView has extended ref
const RenderScrollComponent = forwardRef<any, ScrollViewProps>((props, ref) => (
  <KeyboardAwareScrollView {...props} ref={ref} />
));

export function ChatScreen({
  messages,
  toolCalls,
  isLoading,
  onSendMessage,
  renderToolCalls,
  bottomOffset = 0,
}: ChatScreenProps) {
  const flashListRef = useRef<FlashListRef<ChatMessage>>(null);
  const insets = useSafeAreaInsets();
  const { progress } = useReanimatedKeyboardAnimation();

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.role === 'user') {
      return <UserMessage message={item} />;
    }

    // For historical messages, render their attached tool calls if they exist
    const subComponent =
      item.toolCalls && item.toolCalls.length > 0
        ? renderToolCalls?.(item.toolCalls, item.bankingState)
        : undefined;

    return (
      <AssistantMessage
        message={item}
        isLoading={false}
        subComponent={subComponent}
      />
    );
  };

  // Scroll to end when new messages arrive
  const scrollToEnd = () => {
    flashListRef.current?.scrollToEnd({ animated: true });
  };

  // Check if we should show empty state (shortcuts)
  const isEmpty = messages.length === 0;

  return (
    <View className="flex-1">
      {/* Show ChatShortcuts when no messages - renders OUTSIDE FlashList for proper centering */}
      {isEmpty ? (
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingBottom: 250, // Account for sticky input overlay
          }}
          keyboardShouldPersistTaps="handled"
        >
          <ChatShortcuts
            onShortcutPress={(id, label) => onSendMessage(label)}
          />
        </KeyboardAwareScrollView>
      ) : (
        /* Chat messages list with KeyboardAwareScrollView integration */
        <FlashList
          ref={flashListRef}
          data={messages}
          renderItem={renderMessage}
          renderScrollComponent={RenderScrollComponent}
          keyExtractor={(item: ChatMessage) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + bottomOffset + 200, // Extra space for input + promo banner + sheet
          }}
          onContentSizeChange={scrollToEnd}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <>
              {isLoading && <AssistantMessage isLoading />}
              {toolCalls.length > 0 && renderToolCalls?.()}
            </>
          }
        />
      )}

      {/* Sticky input that follows keyboard - positioned absolutely at bottom */}
      <KeyboardStickyView
        className="absolute right-0 left-0"
        style={{ bottom: bottomOffset }}
        offset={{ closed: 0, opened: insets.bottom }}
      >
        <View>
          <ChatInput
            onSend={onSendMessage}
            inProgress={isLoading}
            keyboardProgress={progress}
            bottomInset={insets.bottom - 10}
          />
        </View>
      </KeyboardStickyView>
    </View>
  );
}
