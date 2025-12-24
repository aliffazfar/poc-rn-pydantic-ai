import React, {useRef} from 'react';
import {View, StatusBar} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import {
  BankingState,
  PromoItem,
  AccountItem,
  ActionButtonItem,
  ToolCall,
} from './lib/types';
import { logger } from './lib/logger';
import { colors } from './themes/colors';

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

  // Chat state management
  const {
    messages,
    toolCalls,
    isLoading,
    sessionId,
    bankingState,
    sendMessage,
    initSession,
    clearChat,
  } = useJomKiraChat({
    initialBalance: 50.43,
    onError: (error) => logger.error('Chat error', error),
  });

  const {
    handleTransferApprove,
    handleTransferDecline,
    handleTransferEdit,
    handleBillPaymentApprove,
    handleBillPaymentDecline,
  } = useToolCallActions({ sendMessage });

  // Handle "Ask AI" click from dashboard header - collapse sheet to peek
  const handleAskAIClick = () => {
    logger.info('Chat opened via Ask AI');
    // Mark as programmatic to avoid double-triggering in handleSnapChange
    isProgrammaticAnimation.current = true;
    // Trigger header animation immediately for snappier feel
    animateToChat();
    // Then animate sheet
    sheetRef.current?.peek();

    // Initialize session if needed
    if (!sessionId && messages.length === 0) {
      initSession();
    }
  };

  // Handle close chat from chat header - expand sheet back to full
  const handleCloseChat = () => {
    logger.info('Chat closed');
    // Mark as programmatic to avoid double-triggering in handleSnapChange
    isProgrammaticAnimation.current = true;
    // Trigger header animation immediately for snappier feel
    animateToDashboard();
    // Then animate sheet
    sheetRef.current?.expand();
  };

  // Handle sheet snap changes - only trigger for drag-based changes (not programmatic)
  const handleSnapChange = (index: number) => {
    // Skip if this was triggered by a programmatic animation
    if (isProgrammaticAnimation.current) {
      isProgrammaticAnimation.current = false;
      logger.info(
        `Sheet snap (programmatic): index=${index}, skipping animation`
      );
      return;
    }

    // This is a drag-based change (user dragged via chevron)
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

  const renderToolCalls = (
    calls: ToolCall[] = toolCalls,
    state: BankingState = bankingState
  ) => (
    <ToolCallRenderer
      toolCalls={calls}
      bankingState={state}
      onTransferApprove={handleTransferApprove}
      onTransferDecline={handleTransferDecline}
      onTransferEdit={handleTransferEdit}
      onBillPaymentApprove={handleBillPaymentApprove}
      onBillPaymentDecline={handleBillPaymentDecline}
    />
  );

  // Dashboard data
  const DASHBOARD_ACTIONS: ActionButtonItem[] = [
    { label: 'Scan', Icon: Scan, id: 'scan' },
    { label: 'Add money', Icon: Plus, id: 'add_money' },
    { label: 'Receive', Icon: ArrowDownLeft, id: 'receive' },
    { label: 'Transfer', Icon: ArrowUpRight, id: 'transfer' },
  ];

  const MOCK_ACCOUNTS: AccountItem[] = [
    {
      id: 'main',
      name: 'Main Account',
      amount: bankingState.balance,
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

  const PROMO_DATA: PromoItem[] = [
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
          accounts={MOCK_ACCOUNTS}
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
    <GestureHandlerRootView className='flex flex-1'>
      <KeyboardProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
