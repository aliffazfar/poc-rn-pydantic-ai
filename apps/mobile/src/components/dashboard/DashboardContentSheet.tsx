import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SharedValue} from 'react-native-reanimated';
import {colors} from '../../themes/colors';
import {uiLog} from '../../lib/logger';
import {ChevronHandle} from './ChevronHandle';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

// Constants - exported for use in other components
export const SHEET_PEEK_HEIGHT = 50; // Height when peeked - showing chat
const HEADER_GAP = 5; // Gap between header and sheet when expanded

export interface DashboardContentSheetRef {
  /** Go to peek state (show chat) */
  peek: () => void;
  /** Expand to full (show dashboard) */
  expand: () => void;
}

interface DashboardContentSheetProps {
  /** Called when snap point changes - index 0 = peek, index 1 = expanded */
  onSnapChange?: (index: number) => void;
  /** Animated index shared value from parent - enables live drag animations */
  animatedIndex: SharedValue<number>;
  /** Dashboard content */
  children: React.ReactNode;
  /** Top inset for the sheet (usually header height) */
  topInset?: number;
}

/**
 * Bottom sheet containing dashboard content using @gorhom/bottom-sheet.
 *
 * Features:
 * - Custom ChevronHandle that animates based on sheet position
 * - Dragging disabled when dashboard is fully expanded (user must tap Ask AI)
 * - The sheet starts expanded and peeks to reveal the chat
 * - Uses parent-provided animatedIndex for live drag animations
 */
export const DashboardContentSheet = forwardRef<
  DashboardContentSheetRef,
  DashboardContentSheetProps
>(function DashboardContentSheet({onSnapChange, animatedIndex, children, topInset = 0}, ref) {
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  
  // Track if sheet is expanded to disable dragging
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate snap points based on screen height
  const expandedHeight = SCREEN_HEIGHT - topInset - HEADER_GAP;
  const snapPoints = [SHEET_PEEK_HEIGHT, expandedHeight];

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    peek: () => {
      uiLog.info('Sheet: going to peek');
      sheetRef.current?.snapToIndex(0);
    },
    expand: () => {
      uiLog.info('Sheet: expanding');
      sheetRef.current?.snapToIndex(1);
    },
  }));

  const handleSheetChanges = (index: number) => {
    uiLog.info(`Sheet snap changed: index=${index}`);
    setIsExpanded(index === 1);
    onSnapChange?.(index);
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={1} // Start expanded
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      // Wire parent's animated index for live animation updates during drag
      animatedIndex={animatedIndex}
      enablePanDownToClose={false}
      // Disable handle dragging when expanded - user must tap Ask AI to peek
      enableHandlePanningGesture={!isExpanded}
      // Disable content dragging always - scroll handled by BottomSheetScrollView
      enableContentPanningGesture={false}
      topInset={topInset}
      backgroundStyle={styles.sheetBackground}
      handleComponent={ChevronHandle}
      style={styles.sheet}
    >
      {/* Scrollable Dashboard Content */}
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 16,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  sheet: {
  },
  sheetBackground: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
