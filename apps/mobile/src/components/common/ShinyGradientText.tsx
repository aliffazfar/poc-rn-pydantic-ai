import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import {
  Canvas,
  Text as SkiaText,
  matchFont,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import { logger } from '../../lib/logger';

interface ShinyGradientTextProps {
  text: string;
  fontSize?: number;
  fontWeight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  colors?: string[];
  positions?: number[];
  extraWidth?: number;
}

export function ShinyGradientText({
  text,
  fontSize = 14,
  fontWeight = 'bold',
  colors = ['#888888', '#FFFFFF', '#888888'],
  positions = [0, 0.5, 1],
  extraWidth = 10,
}: ShinyGradientTextProps) {
  const fontFamily = Platform.select({
    ios: 'Helvetica',
    default: 'sans-serif',
  });

  const font = useMemo(
    () => matchFont({ fontFamily, fontSize, fontWeight }),
    [fontFamily, fontSize, fontWeight]
  );

  const textWidth = useMemo(() => font?.getTextWidth(text) ?? 90, [font, text]);
  const height = fontSize * 1.4; // Enough space for descenders and padding

  if (!font) {
    logger.warn('ShinyGradientText: Font not ready');
    return null;
  }

  return (
    <Canvas style={{ width: textWidth + extraWidth, height }}>
      <SkiaText text={text} x={0} y={fontSize} font={font}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(textWidth, 0)}
          colors={colors}
          positions={positions}
        />
      </SkiaText>
    </Canvas>
  );
}
