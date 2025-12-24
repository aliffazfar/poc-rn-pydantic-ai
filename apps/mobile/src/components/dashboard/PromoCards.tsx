import React, {useRef} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import {PromoItem} from '../../lib/types';
import {uiLog} from '../../lib/logger';

const CARD_WIDTH = 160;

interface PromoCardProps extends PromoItem {
  onPress?: () => void;
}

export function PromoCard({
  title,
  description,
  icon,
  bgColor,
  textColor,
  subTextColor,
  actionText,
  onPress,
}: PromoCardProps) {
  const handlePress = () => {
    uiLog.info(`Promo card clicked: ${title}`);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      className="mr-3.5 h-[180px] w-[160px] overflow-hidden rounded-2xl p-4"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background Decorative Icon */}
      <View className="absolute -right-4 -bottom-4 scale-[2.2] opacity-[0.08]">
        <View style={{ opacity: 0.08 }}>{icon}</View>
      </View>

      {/* Top: Icon Container */}
      <View className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
        {icon}
      </View>

      {/* Middle: Content */}
      <View className="mb-2 flex-1">
        <Text
          className="mb-1 text-[15px] font-bold leading-tight tracking-tight"
          style={{ color: textColor }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className="text-[11px] font-semibold leading-snug opacity-90"
          style={{ color: subTextColor }}
          numberOfLines={3}
        >
          {description}
        </Text>
      </View>

      {/* Bottom: Action Button */}
      {actionText && (
        <View className="flex-row items-center gap-0.5">
          <Text className="text-[11px] font-semibold tracking-wider text-[#4460e9]">
            {actionText}
          </Text>
          <ChevronRight size={14} color={'#4460e9'} strokeWidth={3} />
        </View>
      )}
    </TouchableOpacity>
  );
}

interface PromoCardsContainerProps {
  children: React.ReactNode;
}

export function PromoCardsContainer({children}: PromoCardsContainerProps) {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingHorizontal: 16, paddingLeft: 8}}
      snapToInterval={CARD_WIDTH + 14}
      decelerationRate="fast">
      {children}
    </ScrollView>
  );
}
