import React from 'react';
import {StyleSheet, View} from 'react-native';
import {BottomSheetHandleProps} from '@gorhom/bottom-sheet';
import Animated, {
  interpolate,
  useAnimatedStyle,
  Extrapolation,
} from 'react-native-reanimated';
import {ChevronUp} from 'lucide-react-native';
import {colors} from '../../themes/colors';

/**
 * Custom handle component for the dashboard bottom sheet.
 * 
 * Renders a chevron-up icon that animates based on sheet position:
 * - At peek (index 0): Chevron fully visible, full size
 * - During drag: Chevron shrinks and fades
 * - At expanded (index 1): Chevron completely hidden
 */
export function ChevronHandle({animatedIndex}: BottomSheetHandleProps) {
  // Animate based on sheet index:
  // index 0 = peek (chat visible) -> chevron fully visible
  // index 1 = expanded (dashboard visible) -> chevron hidden
  
  const containerStyle = useAnimatedStyle(() => {
    // Opacity: visible at 0, hidden at 1
    const opacity = interpolate(
      animatedIndex.value,
      [0, 0.5, 1],
      [1, 0.3, 0],
      Extrapolation.CLAMP
    );
    
    // Scale: full size at 0, shrink to 0 at 1
    const scale = interpolate(
      animatedIndex.value,
      [0, 0.7, 1],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );
    
    // Height: animate the container height
    const height = interpolate(
      animatedIndex.value,
      [0, 0.8, 1],
      [40, 20, 0],
      Extrapolation.CLAMP
    );
    
    return {
      opacity,
      transform: [{scale}],
      height,
    };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.handleWrapper}>
        <ChevronUp size={24} color={colors.textMuted} strokeWidth={2} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handleWrapper: {
    paddingVertical: 8,
  },
});
