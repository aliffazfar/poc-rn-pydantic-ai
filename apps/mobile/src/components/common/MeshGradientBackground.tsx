import React from 'react';
import { useWindowDimensions, StyleSheet } from 'react-native';
import {
  Canvas,
  Circle,
  BlurMask,
  Fill,
  vec,
  Group,
} from '@shopify/react-native-skia';
import { colors } from '../../themes/colors';

interface MeshGradientBackgroundProps {
  style?: object;
}

/**
 * MeshGradientBackground - Creates a beautiful multi-point mesh gradient effect
 * using React Native Skia's Canvas with blurred circles.
 *
 * The gradient mimics the design from the reference screenshots:
 * - Top Left: Bright Cyan/Turquoise (#00D2FF)
 * - Center/Top: Medium Azure (#3A7BD5)
 * - Right Side: Deep Violet/Magenta (#7022B4)
 * - Bottom: Dark Navy/Midnight (#0B0E21)
 */
export function MeshGradientBackground({ style }: MeshGradientBackgroundProps) {
  const { width, height } = useWindowDimensions();

  // Calculate circle positions relative to screen size for responsiveness
  // These positions create the mesh-like glow effect matching the design

  // Cyan glow - positioned at top-left area
  const cyanCenter = vec(width * 0.0, height * 0.0);
  const cyanRadius = width * 0.9;

  // Azure glow - positioned at center-top area
  const azureCenter = vec(width * 0.5, height * 0.08);
  const azureRadius = width * 0.7;

  // Center azure glow - brighter glow behind the "Ask AI" button
  // This creates the illuminated center effect visible in the reference
  // Smaller radius to not cover the violet on the right
  const centerGlowPos = vec(width * 0.5, height * 0.065);
  const centerGlowRadius = width * 0.35;

  // Violet glow - positioned at right side, visible on screen
  const violetCenter = vec(width * 0.85, height * 0.08);
  const violetRadius = width * 0.6;

  // Additional subtle navy-blue glow at bottom for depth
  const bottomGlowCenter = vec(width * 0.5, height * 0.6);
  const bottomGlowRadius = width * 0.9;

  return (
    <Canvas style={[StyleSheet.absoluteFill, style]}>
      {/* Base dark navy background - fills the entire canvas */}
      <Fill color={colors.meshGradient.navy} />

      {/* Blurred gradient circles - creates the mesh effect */}
      <Group>
        <BlurMask blur={100} style="normal" />

        {/* Bottom glow - subtle darker blue for depth */}
        <Circle
          c={bottomGlowCenter}
          r={bottomGlowRadius}
          color="#1a1a3e"
          opacity={0.4}
        />

        {/* Cyan glow - bright turquoise at top left */}
        <Circle
          c={cyanCenter}
          r={cyanRadius}
          color={colors.meshGradient.cyan}
          opacity={0.5}
        />

        {/* Azure glow - medium blue at center */}
        <Circle
          c={azureCenter}
          r={azureRadius}
          color={colors.meshGradient.azure}
          opacity={0.5}
        />

        {/* Violet glow - deep magenta on right side */}
        <Circle
          c={violetCenter}
          r={violetRadius}
          color={colors.meshGradient.violet}
          opacity={0.6}
        />

        {/* Center bright azure glow - illuminated area behind the button */}
        {/* Smaller radius so it doesn't cover the violet on the right */}
        <Circle
          c={centerGlowPos}
          r={centerGlowRadius}
          color="#3AA0FF"
          opacity={0.6}
        />
      </Group>
    </Canvas>
  );
}
