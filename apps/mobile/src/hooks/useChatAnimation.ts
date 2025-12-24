import { useState, useEffect } from 'react';
import { logger } from '../lib/logger';
import {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  SharedValue,
  AnimatedStyle,
  Extrapolation,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface UseChatAnimationProps {
  topInset: number;
}

interface UseChatAnimationReturn {
  animateToChat: () => void;
  animateToDashboard: () => void;
  isChatMode: boolean;
  isChatContentVisible: boolean; // Controls whether chat content is rendered
  avatarStyle: AnimatedStyle<ViewStyle>;
  closeStyle: AnimatedStyle<ViewStyle>;
  pillStyle: AnimatedStyle<ViewStyle>;
  titleStyle: AnimatedStyle<ViewStyle>;
  bellStyle: AnimatedStyle<ViewStyle>;
  chatContentStyle: AnimatedStyle<ViewStyle>;
  progress: SharedValue<number>;
}

export function useChatAnimation({
  topInset: _topInset,
}: UseChatAnimationProps): UseChatAnimationReturn {
  const [isChatMode, setIsChatMode] = useState(false);
  const [isChatContentVisible, setIsChatContentVisible] = useState(false);

  // Main progress shared value - driven by sheet's animatedIndex via useAnimatedReaction in App.tsx
  // Progress 0 = dashboard mode (sheet expanded), Progress 1 = chat mode (sheet peeked)
  const progress = useSharedValue(0);

  // Effect to log animation state changes for POC
  useEffect(() => {
    logger.debug(
      `[useChatAnimation] Chat mode: ${isChatMode}, Content visible: ${isChatContentVisible}`
    );
  }, [isChatMode, isChatContentVisible]);

  const animateToChat = () => {
    logger.info('[useChatAnimation] Transitioning to Chat mode');
    setIsChatMode(true);
    setIsChatContentVisible(true);
  };

  const animateToDashboard = () => {
    logger.info('[useChatAnimation] Transitioning to Dashboard mode');
    setIsChatMode(false);
  };

  // Avatar -> Close X animation (smooth fade in/out)
  // Progress 0 = dashboard (avatar visible), 1 = chat (close visible)
  const avatarStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(
        progress.value,
        [0, 0.4],
        [1, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0, 0.4],
            [0, -4],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const closeStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(
        progress.value,
        [0.3, 0.7],
        [0, 1],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0.3, 0.7],
            [4, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  // Pill -> Title animation (smooth fade in/out)
  const pillStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(
        progress.value,
        [0, 0.4],
        [1, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0, 0.4],
            [0, -2],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(
        progress.value,
        [0.3, 0.7],
        [0, 1],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0.3, 0.7],
            [2, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  // Bell -> New Chat animation (smooth fade in/out)
  const bellStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(
        progress.value,
        [0, 0.4],
        [1, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0, 0.4],
            [0, -2],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  // Chat content fade - visible when progress > 0.1
  const chatContentStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(
        progress.value,
        [0, 0.5],
        [0, 1],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0, 0.5],
            [8, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return {
    animateToChat,
    animateToDashboard,
    isChatMode,
    isChatContentVisible,
    avatarStyle,
    closeStyle,
    pillStyle,
    titleStyle,
    bellStyle,
    chatContentStyle,
    progress,
  };
}
