import React from 'react';
import {View, Text} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import {ChatMessage} from '../../lib/types';
import {colors} from '../../themes/colors';

interface AssistantMessageProps {
  message?: ChatMessage;
  isLoading?: boolean;
  subComponent?: React.ReactNode;
}

function LoadingDot({delay}: {delay: number}) {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(withTiming(-6, {duration: 400}), -1, true),
    );
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View
      style={[animatedStyle, {backgroundColor: colors.primaryAlpha70}]}
      className="h-2 w-2 rounded-full"
    />
  );
}

export function AssistantMessage({
  message,
  isLoading,
  subComponent,
}: AssistantMessageProps) {
  const hasContent = message?.content && message.content.trim().length > 0;
  const hasBubble = hasContent || isLoading;

  // Do not render anything if there is no content, not loading, and no subComponent
  if (!hasContent && !isLoading && !subComponent) {
    return null;
  }

  return (
    <View className="mb-4">
      {/* Only render the bubble if there is content or loading */}
      {hasBubble && (
        <View className="items-start">
          <View className=" max-w-[85%] rounded-2xl rounded-bl-sm  bg-[#292940]/40 px-3.5 py-2.5">
            {hasContent && (
              <Text className="text-white text-[15px] font-medium leading-relaxed">
                {message?.content}
              </Text>
            )}
            {isLoading && (
              <View className="flex-row gap-1.5 py-1">
                <LoadingDot delay={0} />
                <LoadingDot delay={150} />
                <LoadingDot delay={300} />
              </View>
            )}
          </View>
        </View>
      )}
      {/* Reduce top margin when there's no bubble above */}
      {subComponent && (
        <View className={hasBubble ? 'mt-3' : ''}>{subComponent}</View>
      )}
    </View>
  );
}
