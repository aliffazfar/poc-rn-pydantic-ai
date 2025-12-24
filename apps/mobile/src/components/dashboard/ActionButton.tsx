import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {ActionButtonItem} from '../../lib/types';
import {colors} from '../../themes/colors';
import {uiLog} from '../../lib/logger';

export function ActionButton({label, Icon, onPress, id}: ActionButtonItem) {
  const handlePress = () => {
    uiLog.info(`Action button clicked: ${label}`, {id});
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="items-center gap-3"
      activeOpacity={0.7}>
      <View className="bg-[#032ce6] h-15 w-15 items-center justify-center rounded-full shadow-lg elevation-4">
        <Icon
          color="#FFFFFF"
          width={28}
          height={28}
          strokeWidth={2}
        />
      </View>
      <Text className="text-text-secondary text-[11px] font-medium tracking-wide">
        {label}
      </Text>
    </TouchableOpacity>
  );
}
