import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import {
  Canvas,
  BackdropBlur,
  RoundedRect,
  rrect,
  rect,
  Fill,
  LinearGradient,
  Line,
  vec,
} from '@shopify/react-native-skia';
import { colors } from '../../themes/colors';

interface GlassButtonProps {
  /** Width of the button */
  width: number;
  /** Height of the button */
  height: number;
  /** Border radius - use width/2 for circular buttons */
  borderRadius: number;
  /** Blur intensity (default: 20) */
  blurAmount?: number;
  /** Background opacity (default: 0.2) */
  backgroundOpacity?: number;
  /** Border opacity (default: 0.3) - ignored when rainbowBorder is true */
  borderOpacity?: number;
  /** Enable rainbow gradient border effect (default: false) */
  rainbowBorder?: boolean;
  /** Custom gradient colors for rainbow border [top, bottom] */
  borderGradientColors?: [string, string];
  /** Border stroke width (default: 1, or 1.5 for rainbow border) */
  borderWidth?: number;
  /** Called when button is pressed */
  onPress?: () => void;
  /** Children rendered on top of the glass effect */
  children?: React.ReactNode;
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Active opacity for touch feedback */
  activeOpacity?: number;
}

/**
 * GlassButton - A glassmorphic button with backdrop blur effect
 * using React Native Skia.
 *
 * Creates a frosted glass appearance by blurring the content behind
 * the button and overlaying a semi-transparent background.
 *
 */
export function GlassButton({
  width,
  height,
  borderRadius,
  blurAmount = 20,
  backgroundOpacity = 0.2,
  borderOpacity = 0.3,
  rainbowBorder = false,
  borderGradientColors,
  borderWidth,
  onPress,
  children,
  style,
  activeOpacity = 0.7,
}: GlassButtonProps) {
  // Create the rounded rect clip for the backdrop blur
  const clipRect = rrect(rect(0, 0, width, height), borderRadius, borderRadius);

  // Default gradient colors: cyan (top) to magenta (bottom) matching the mesh gradient
  const gradientColors = borderGradientColors || [
    colors.meshGradient.cyan,
    colors.meshGradient.violet,
  ];

  // Border stroke width - slightly thicker for rainbow effect
  const strokeWidth = borderWidth ?? (rainbowBorder ? 1.5 : 1);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      disabled={!onPress}
      style={[{ width, height }, style]}
    >
      {/* Skia Canvas for the glass effect */}
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Backdrop blur with rounded rect clip */}
        <BackdropBlur blur={blurAmount} clip={clipRect}>
          {/* Semi-transparent white fill */}
          <Fill color={`rgba(255, 255, 255, ${backgroundOpacity})`} />
        </BackdropBlur>

        {/* Border - with optional rainbow gradient */}
        {rainbowBorder ? (
          <>
            {/* Base subtle border for overall pill shape */}
            <RoundedRect
              x={0}
              y={0}
              width={width}
              height={height}
              r={borderRadius}
              color="rgba(255, 255, 255, 0.15)"
              style="stroke"
              strokeWidth={0.5}
            />
            {/* Top edge glow line - horizontal gradient: transparent → cyan → transparent */}
            <Line
              p1={vec(borderRadius, strokeWidth / 2)}
              p2={vec(width - borderRadius, strokeWidth / 2)}
              strokeWidth={strokeWidth * 1.5}
            >
              <LinearGradient
                start={vec(borderRadius, 0)}
                end={vec(width - borderRadius, 0)}
                colors={[
                  'rgba(0, 210, 255, 0)', // transparent at left
                  'rgba(0, 210, 255, 0.85)', // bright cyan at center
                  'rgba(0, 210, 255, 0)', // transparent at right
                ]}
                positions={[0.05, 0.5, 0.95]}
              />
            </Line>
            {/* Bottom edge glow line - horizontal gradient: transparent → pink → transparent */}
            <Line
              p1={vec(borderRadius, height - strokeWidth / 2)}
              p2={vec(width - borderRadius, height - strokeWidth / 2)}
              strokeWidth={strokeWidth * 1.5}
            >
              <LinearGradient
                start={vec(borderRadius, height)}
                end={vec(width - borderRadius, height)}
                colors={[
                  'rgba(236, 72, 153, 0)', // transparent at left
                  'rgba(236, 72, 153, 0.85)', // bright pink at center
                  'rgba(236, 72, 153, 0)', // transparent at right
                ]}
                positions={[0.05, 0.5, 0.95]}
              />
            </Line>
          </>
        ) : (
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={height}
            r={borderRadius}
            color={`rgba(255, 255, 255, ${borderOpacity})`}
            style="stroke"
            strokeWidth={strokeWidth}
          />
        )}
      </Canvas>

      {/* Children (text, icons) positioned on top */}
      <View style={[styles.content, { width, height }]}>{children}</View>
    </TouchableOpacity>
  );
}

/**
 * GlassPill - A pill-shaped variant of GlassButton
 * Convenience component for horizontal pill buttons like "Ask JomKira AI"
 */
interface GlassPillProps extends Omit<GlassButtonProps, 'borderRadius'> {
  /** Padding around content (default: 16) */
  paddingHorizontal?: number;
}

export function GlassPill({
  height,
  paddingHorizontal = 16,
  ...props
}: GlassPillProps) {
  return (
    <GlassButton
      {...props}
      height={height}
      borderRadius={height / 2} // Full pill shape
    />
  );
}

/**
 * GlassCircle - A circular variant of GlassButton
 * Convenience component for circular icon buttons like avatar and bell
 */
interface GlassCircleProps
  extends Omit<GlassButtonProps, 'width' | 'height' | 'borderRadius'> {
  /** Diameter of the circle */
  size: number;
}

export function GlassCircle({ size, ...props }: GlassCircleProps) {
  return (
    <GlassButton
      {...props}
      width={size}
      height={size}
      borderRadius={size / 2}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
