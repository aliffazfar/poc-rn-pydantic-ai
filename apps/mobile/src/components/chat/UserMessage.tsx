import React from 'react';
import { View, Text, Image } from 'react-native';
import { ChatMessage } from '../../lib/types';

interface UserMessageProps {
  message: ChatMessage;
}

export function UserMessage({ message }: UserMessageProps) {
  const hasImage = message.image;

  return (
    <View className="mb-4 items-end">
      <View className="max-w-[85%] items-end gap-2">
        {hasImage && (
          <View className="border-white/40 w-64 overflow-hidden rounded-xl border bg-slate-800/50 shadow-sm">
            <Image
              source={{
                uri: `data:image/${message.image?.format.replace(
                  'jpg',
                  'jpeg'
                )};base64,${message.image?.bytes}`,
              }}
              className="h-48 w-full"
              resizeMode="cover"
            />
          </View>
        )}
        {message.content && (
          <View className="bg-primary rounded-2xl rounded-br-sm px-3.5 py-2.5 shadow-md elevation-4">
            <Text className="text-white text-[15px] font-medium leading-relaxed">
              {message.content}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
