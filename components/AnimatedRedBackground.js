// components/AnimatedRedBackground.js
import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

const PRIMARY_RED = "#B22222";
const LIGHT_RED = "#FF6B6B";
const SOFT_RED = "#FFE5E5";
const BG_BOTTOM = "#FFFFFF";

export default function AnimatedRedBackground() {
  return (
    <>
      {/* Base soft red gradient */}
      <LinearGradient
        colors={[SOFT_RED, BG_BOTTOM]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated blob 1 */}
      <MotiView
        from={{ opacity: 0.18, translateX: -80, translateY: -40, scale: 1 }}
        animate={{ opacity: 0.4, translateX: 40, translateY: 20, scale: 1.1 }}
        transition={{
          type: "timing",
          duration: 6500,
          loop: true,
          repeatReverse: true,
        }}
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient
          colors={[LIGHT_RED, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.blob}
        />
      </MotiView>

      {/* Animated blob 2 */}
      <MotiView
        from={{ opacity: 0.12, translateX: 80, translateY: 140, scale: 0.9 }}
        animate={{
          opacity: 0.35,
          translateX: -40,
          translateY: 40,
          scale: 1.05,
        }}
        transition={{
          type: "timing",
          duration: 7500,
          loop: true,
          repeatReverse: true,
        }}
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient
          colors={[PRIMARY_RED, "transparent"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.blob}
        />
      </MotiView>
    </>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    width: "140%",
    height: "140%",
    borderRadius: 400,
  },
});