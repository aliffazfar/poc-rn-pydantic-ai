import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, X, Bell } from 'lucide-react-native';
import { colors } from '../../themes/colors';
import { GlassCircle, GlassButton } from '../common/GlassButton';

interface AnimatedHeaderProps {
  onAskAIClick: () => void;
  onCloseChat: () => void;
  userInitials?: string;
  // Animated styles from useChatAnimation hook
  avatarStyle: AnimatedStyle<ViewStyle>;
  closeStyle: AnimatedStyle<ViewStyle>;
  pillStyle: AnimatedStyle<ViewStyle>;
  titleStyle: AnimatedStyle<ViewStyle>;
  bellStyle: AnimatedStyle<ViewStyle>;
}

/**
 * Unified animated header fixed at the top of the screen.
 * It stays above the bottom sheet and handles transitions between
 * Dashboard mode and Chat mode.
 */
export function AnimatedHeader({
  onAskAIClick,
  onCloseChat,
  userInitials = 'AA',
  avatarStyle,
  closeStyle,
  pillStyle,
  titleStyle,
  bellStyle,
}: AnimatedHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: insets.top + 8,
        paddingBottom: 8,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 40,
        }}
      >
        {/* Left: Avatar <-> Close X */}
        <View
          style={{
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View style={[{ position: 'absolute' }, avatarStyle]}>
            <GlassCircle
              size={32}
              blurAmount={25}
              backgroundOpacity={0.15}
              borderOpacity={0.25}
            >
              <Text className="text-text-inverse text-xs font-extrabold">
                {userInitials}
              </Text>
            </GlassCircle>
          </Animated.View>
          <Animated.View style={[{ position: 'absolute' }, closeStyle]}>
            <TouchableOpacity
              onPress={onCloseChat}
              activeOpacity={0.7}
              className="h-8 w-8 items-center justify-center"
            >
              <X size={18} color={colors.textInverse} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Center: Pill <-> Title */}
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Animated.View style={[{ position: 'absolute' }, pillStyle]}>
            <GlassButton
              width={145}
              height={32}
              borderRadius={16}
              blurAmount={25}
              backgroundOpacity={0.15}
              rainbowBorder={true}
              onPress={onAskAIClick}
            >
              <View className="flex-row items-center gap-2">
                <Sparkles
                  size={12}
                  color={colors.textInverse}
                  fill={colors.textInverse}
                />
                <Text className="text-text-inverse text-sm font-bold">
                  Ask JomKira AI
                </Text>
              </View>
            </GlassButton>
          </Animated.View>
          <Animated.View
            style={[{ position: 'absolute' }, titleStyle]}
            className="flex-row items-center gap-1.5"
          >
            <Sparkles size={14} color={colors.textInverse} />
            <Text className="text-text-inverse text-sm font-bold">
              JomKira AI
            </Text>
            <View className="rounded border border-white/30 px-1.5 py-0.5">
              <Text className="text-text-inverse text-[10px] opacity-70">
                beta
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Right: Bell <-> New Chat */}
        <View
          style={{
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View style={[{ position: 'absolute' }, bellStyle]}>
            <GlassCircle
              size={32}
              blurAmount={25}
              backgroundOpacity={0.15}
              borderOpacity={0.25}
            >
              <Bell size={18} color={colors.textInverse} />
              <View className="absolute top-0 right-0 h-2 w-2 rounded-full border border-white bg-error" />
            </GlassCircle>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

export const ANIMATED_HEADER_HEIGHT = 40 + 8 + 8; // Row height + top/bottom padding
