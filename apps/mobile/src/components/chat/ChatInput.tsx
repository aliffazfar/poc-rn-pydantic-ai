import React, {useState, useRef} from 'react';
import {View, Text, TextInput, TouchableOpacity, Image} from 'react-native';
import {
  Plus,
  ImageIcon,
  AtSign,
  ArrowUp,
  Wallet,
  X,
  Sparkles,
} from 'lucide-react-native';
import {
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import {colors} from '../../themes/colors';
import {uiLog} from '../../lib/logger';

interface ChatInputProps {
  inProgress: boolean;
  onSend: (text: string, image?: {format: string; bytes: string}) => void;
  keyboardProgress: SharedValue<number>;
  bottomInset: number;
}

const PROMO_BANNER_HEIGHT = 48; // Slimmer banner like Ryt app

// Dark blue glassmorphic colors matching Ryt app
const GLASS_BG = 'rgba(25, 30, 55, 0.85)'; // Dark navy with transparency
const GLASS_BORDER = 'rgba(255, 255, 255, 0.12)'; // Subtle white border

export function ChatInput({
  inProgress,
  onSend,
  keyboardProgress,
  bottomInset,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    format: string;
    bytes: string;
    uri: string;
  } | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleImageSelect = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.base64 && asset.uri) {
            const format = asset.type?.split('/')[1] || 'jpeg';
            setSelectedImage({
              format,
              bytes: asset.base64,
              uri: asset.uri,
            });
            uiLog.info('Image selected for chat', {
              format,
              bytes: asset.base64,
              uri: asset.uri,
            });
          }
        }
      }
    );
  };

  const handleSubmit = () => {
    if ((inputValue.trim() || selectedImage) && !inProgress) {
      uiLog.info('Chat message submitted', {
        hasText: !!inputValue.trim(),
        hasImage: !!selectedImage,
      });

      const imageData = selectedImage
        ? { format: selectedImage.format, bytes: selectedImage.bytes }
        : undefined;

      onSend(inputValue.trim(), imageData);
      setInputValue('');
      setSelectedImage(null);
    }
  };

  // Animate promo banner height and opacity based on keyboard progress
  const promoBannerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        keyboardProgress.value,
        [0, 0.3],
        [PROMO_BANNER_HEIGHT, 0]
      ),
      opacity: interpolate(keyboardProgress.value, [0, 0.2], [1, 0]),
      marginBottom: interpolate(keyboardProgress.value, [0, 0.3], [16, 0]),
    };
  });

  // Animate bottom padding: safe area when keyboard closed, 0 when open
  const containerStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: interpolate(
        keyboardProgress.value,
        [0, 0.3],
        [bottomInset, 0]
      ),
    };
  });

  return (
    <Animated.View style={containerStyle} className="shrink-0 px-4 pt-2">
      {/* Promo Banner - slimmer dark glassmorphic style like Ryt app */}
      <Animated.View
        style={[
          promoBannerStyle,
          {
            overflow: 'hidden',
            backgroundColor: GLASS_BG,
            borderColor: GLASS_BORDER,
            borderWidth: 1,
          },
        ]}
        className="flex-row items-center gap-3 rounded-xl px-3"
      >
        <View
          className="h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }}
        >
          <Wallet size={14} color={colors.textInverse} />
        </View>
        <View className="flex-1">
          <Text className="text-[11px] font-semibold text-white">
            Snap and pay with JomKira AI, get up to RM 5
          </Text>
        </View>
        <Text className="text-white">›</Text>
      </Animated.View>

      {/* Input Area - dark glassmorphic style */}
      <View>
        <View
          className="flex-row items-center gap-2 rounded-xl px-4 py-3"
          style={{
            backgroundColor: GLASS_BG,
            borderColor: GLASS_BORDER,
            borderWidth: 1,
          }}
        >
          <TextInput
            ref={inputRef}
            value={inputValue}
            onChangeText={setInputValue}
            editable={!inProgress}
            placeholder="Ask JomKira AI"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            className="flex-1 text-[14px] font-medium"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            onSubmitEditing={handleSubmit}
            returnKeyType="send"
          />
        </View>

        {/* Image Preview */}
        {selectedImage && (
          <View className="relative mb-1 mt-3">
            <Image
              source={{ uri: selectedImage.uri }}
              className="h-32 w-32 rounded-xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.error }}
            >
              <X size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Icons - muted white colors for dark theme */}
        <View className="mt-3 flex-row items-center justify-between px-1">
          <View className="flex-row items-center gap-5">
            <TouchableOpacity>
              <Plus size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleImageSelect}>
              <ImageIcon size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity>
              <AtSign size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Sparkles size={20} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={inProgress}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{
              backgroundColor: !inProgress
                ? colors.primary
                : 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <ArrowUp
              size={18}
              color={
                !inProgress ? colors.textInverse : 'rgba(255, 255, 255, 0.5)'
              }
              strokeWidth={3}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

