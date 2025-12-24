import React, { useRef } from 'react';
import { View, StatusBar } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Animated, {
  useSharedValue,
  useAnimatedReaction,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import './global.css';

// Components
import {
  AnimatedHeader,
  ANIMATED_HEADER_HEIGHT,
  SHEET_PEEK_HEIGHT,
  BalanceCard,
  PromoCard,
  PromoCardsContainer,
  LinkAccountCard,
  AccountsSection,
  DashboardContentSheet,
  ChatScreen,
  ToolCallRenderer,
  MeshGradientBackground,
} from './components';
import type { DashboardContentSheetRef } from './components';

// Hooks
import { useChatAnimation, useJomKiraChat, useToolCallActions } from './hooks';

// Types and Utils
import { logger } from './lib/logger';
import { DEFAULT_INITIAL_BALANCE } from './lib/constants';
import {
  DASHBOARD_ACTIONS,
  PROMO_DATA,
  createMockAccounts,
} from './lib/mockData';
import { BankingState, ToolCall } from './lib/types';

function AppContent() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<DashboardContentSheetRef>(null);
  // Track if we triggered animation programmatically to avoid double-triggering
  const isProgrammaticAnimation = useRef(false);

  // Shared value for sheet's animated index - created here so we can use it in animations
  // Index 0 = peek (chat visible), Index 1 = expanded (dashboard visible)
  const sheetAnimatedIndex = useSharedValue(1); // Start expanded

  // Calculate animated header height including status bar
  const headerHeight = ANIMATED_HEADER_HEIGHT + insets.top;

  // Header animation state - includes progress shared value for live drag sync
  const {
    animateToChat,
    animateToDashboard,
    avatarStyle,
    closeStyle,
    pillStyle,
    titleStyle,
    bellStyle,
    chatContentStyle,
    isChatContentVisible,
    progress,
  } = useChatAnimation({ topInset: insets.top });

  // Sync sheet's animated index to progress for live drag animations
  // This runs on UI thread and updates progress as user drags the sheet
  // Sheet index 0 = peek (chat visible) = progress 1
  // Sheet index 1 = expanded (dashboard visible) = progress 0
  useAnimatedReaction(
    () => sheetAnimatedIndex.value,
    (sheetIndex, previousSheetIndex) => {
      // Skip if the value hasn't changed significantly
      if (
        previousSheetIndex !== null &&
        Math.abs(sheetIndex - previousSheetIndex) < 0.001
      )
        return;
      // Invert: index 0 (peek) -> progress 1 (chat), index 1 (expanded) -> progress 0 (dashboard)
      progress.value = interpolate(
        sheetIndex,
        [0, 1],
        [1, 0],
        Extrapolation.CLAMP
      );
    },
    [progress]
  );

  const {
    messages,
    toolCalls,
    isLoading,
    sessionId,
    bankingState,
    sendMessage,
    initSession,
  } = useJomKiraChat({
    initialBalance: DEFAULT_INITIAL_BALANCE,
    onError: (error) => logger.error('Chat error', error),
  });

  const {
    handleTransferApprove,
    handleTransferDecline,
    handleTransferEdit,
    handleBillPaymentApprove,
    handleBillPaymentDecline,
  } = useToolCallActions({ sendMessage });

  const handleAskAIClick = () => {
    logger.info('Chat opened via Ask AI');
    isProgrammaticAnimation.current = true;
    animateToChat();
    sheetRef.current?.peek();

    if (!sessionId && messages.length === 0) {
      initSession();
    }
  };

  const handleCloseChat = () => {
    logger.info('Chat closed');
    isProgrammaticAnimation.current = true;
    animateToDashboard();
    sheetRef.current?.expand();
  };

  const handleSnapChange = (index: number) => {
    if (isProgrammaticAnimation.current) {
      isProgrammaticAnimation.current = false;
      logger.info(
        `Sheet snap (programmatic): index=${index}, skipping animation`
      );
      return;
    }

    if (index === 0) {
      logger.info('Sheet dragged to peek - chat visible');
      animateToChat();
    } else {
      logger.info('Sheet dragged to expanded - dashboard visible');
      animateToDashboard();
    }
  };

  const handlePromoClick = (title: string, id?: string) => {
    logger.info(`Promo card clicked: ${title}`, { id });
    if (id === 'jomkira-ai') {
      handleAskAIClick();
    }
  };

  const renderToolCalls = (calls?: ToolCall[], state?: BankingState) => {
    const activeCalls = calls || toolCalls;
    const activeState = state || bankingState;

    logger.debug('Rendering tool calls:', {
      hasProvidedCalls: !!calls,
      providedCount: calls?.length,
      globalCount: toolCalls.length,
      renderingCount: activeCalls.length,
    });

    if (activeCalls.length === 0) {
      return null;
    }

    return (
      <ToolCallRenderer
        toolCalls={activeCalls}
        bankingState={activeState}
        onTransferApprove={handleTransferApprove}
        onTransferDecline={handleTransferDecline}
        onTransferEdit={handleTransferEdit}
        onBillPaymentApprove={handleBillPaymentApprove}
        onBillPaymentDecline={handleBillPaymentDecline}
      />
    );
  };

  return (
    <View className="flex-1">
      {/* Mesh Gradient Background - renders as absolute positioned Skia Canvas */}
      <MeshGradientBackground />
      <StatusBar barStyle="light-content" />

      {/* 1. Animated Header - Fixed at the top, outside the sheet */}
      <AnimatedHeader
        onAskAIClick={handleAskAIClick}
        onCloseChat={handleCloseChat}
        avatarStyle={avatarStyle}
        closeStyle={closeStyle}
        pillStyle={pillStyle}
        titleStyle={titleStyle}
        bellStyle={bellStyle}
      />

      {/* 2. Chat Content - Stays behind the sheet */}
      <View style={{ flex: 1, marginTop: headerHeight }}>
        {isChatContentVisible && (
          <Animated.View style={[{ flex: 1 }, chatContentStyle]}>
            <ChatScreen
              messages={messages}
              toolCalls={toolCalls}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              renderToolCalls={renderToolCalls}
              bottomOffset={SHEET_PEEK_HEIGHT}
            />
          </Animated.View>
        )}
      </View>

      {/* 3. Dashboard Sheet - Slides over the chat */}
      <DashboardContentSheet
        ref={sheetRef}
        onSnapChange={handleSnapChange}
        animatedIndex={sheetAnimatedIndex}
        topInset={headerHeight}
      >
        {/* Balance Card */}
        <View className="px-2">
          <BalanceCard
            balance={bankingState.balance}
            actions={DASHBOARD_ACTIONS}
          />
        </View>

        {/* Promo Cards */}
        <PromoCardsContainer>
          {PROMO_DATA.map((card) => (
            <PromoCard
              key={card.id}
              {...card}
              onPress={() => handlePromoClick(card.title, card.id)}
            />
          ))}
        </PromoCardsContainer>

        {/* DuitNow Link Section */}
        <View className="px-2">
          <LinkAccountCard />
        </View>

        {/* Accounts Section */}
        <AccountsSection
          title="Accounts"
          accounts={createMockAccounts(bankingState.balance)}
          onAccountClick={(account) =>
            logger.info(`Account clicked: ${account.id}`)
          }
        />
      </DashboardContentSheet>
    </View>
  );
}

// Main App component wraps AppContent with providers
export default function App() {
  return (
    <GestureHandlerRootView className="flex flex-1">
      <KeyboardProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
