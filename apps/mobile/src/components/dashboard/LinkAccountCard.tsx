import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Link as LinkIcon, ChevronRight} from 'lucide-react-native';
import {colors} from '../../themes/colors';
import {uiLog} from '../../lib/logger';

interface LinkAccountCardProps {
  completedSteps?: number;
  totalSteps?: number;
  onLinkClick?: () => void;
}

export function LinkAccountCard({
  completedSteps = 3,
  totalSteps = 6,
  onLinkClick,
}: LinkAccountCardProps) {
  const handleLinkClick = () => {
    uiLog.info('Link DuitNow ID clicked');
    onLinkClick?.();
  };

  return (
    <View className="flex-row items-center justify-between rounded-2xl bg-white p-5">
      <View className="flex-row items-center gap-4">
        <View className="border-primary-dark h-12 w-12 items-center justify-center rounded-full border-2">
          <LinkIcon size={20} color={colors.primaryDark} />
        </View>
        <View>
          <Text className="text-text-primary text-[15px] font-bold">
            Link DuitNow ID
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <Text className="text-text-secondary text-xs">
              {completedSteps} of {totalSteps} completed
            </Text>
            <ChevronRight size={12} color={colors.textSecondary} />
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleLinkClick}
        className="border-primary-dark bg-surface h-9 items-center justify-center rounded-full border-2 px-5"
      >
        <Text className="text-primary-dark text-xs font-bold">Link now</Text>
      </TouchableOpacity>
    </View>
  );
}
