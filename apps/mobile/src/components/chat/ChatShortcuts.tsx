import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { logger } from '../../lib/logger';
import { ShinyGradientText } from '../common/ShinyGradientText';

interface ChatShortcutsProps {
  onShortcutPress?: (id: string, label: string) => void;
}

const SHORTCUTS_GRID = [
  // Row 1
  [
    { label: 'What can JomKira AI do?', emoji: '✨', id: 'what_can_do' },
    { label: 'Pay via screenshot', emoji: '📱', id: 'pay_screenshot' },
  ],
  // Row 2
  [
    { label: 'Pay @someone', emoji: '📨', id: 'pay_someone' },
    { label: 'Upload file and pay', emoji: '🧾', id: 'upload_pay' },
  ],
  // Row 3
  [
    { label: 'Snap and pay', emoji: '📸', id: 'snap_pay' },
    { label: 'Show latest transfers', emoji: '💵', id: 'latest_transfers' },
  ],
];

interface ShortcutButtonProps {
  emoji: string;
  label: string;
  onPress: () => void;
}

function ShortcutButton({ emoji, label, onPress }: ShortcutButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-2.5 rounded-xl bg-white/10 px-4 py-3"
    >
      <Text className="text-lg">{emoji}</Text>
      <Text className="text-[14px] font-semibold text-white">{label}</Text>
    </TouchableOpacity>
  );
}

export function ChatShortcuts({ onShortcutPress }: ChatShortcutsProps) {
  const handleShortcutPress = (id: string, label: string) => {
    logger.info(`Shortcut pressed: ${id}`, { label });
    onShortcutPress?.(id, label);
  };

  return (
    <View className="items-center">
      <Text className="mb-5 text-center text-2xl font-semibold tracking-tight text-white">
        How can I help you?
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 24,
          paddingRight: 48,
        }}
      >
        <View className="gap-2.5 -ml-2.5">
          {SHORTCUTS_GRID.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-2.5">
              {row.map((shortcut) => (
                <ShortcutButton
                  key={shortcut.id}
                  emoji={shortcut.emoji}
                  label={shortcut.label}
                  onPress={() =>
                    handleShortcutPress(shortcut.id, shortcut.label)
                  }
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity className="mt-5 flex-row items-center justify-center gap-1.5">
        <Text className="text-sm font-medium text-white/40">Learn how to</Text>
        <ShinyGradientText text="use JomKira AI" />
        <ArrowRight size={16} color="rgba(255, 255, 255, 0.5)" />
      </TouchableOpacity>
    </View>
  );
}
