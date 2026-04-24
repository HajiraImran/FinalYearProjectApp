import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");
const CIRCLE = width * 0.52;

const T = {
  bg:          "#FAFAF9",
  surface:     "#FFFFFF",
  crimson:     "#B22222",
  crimsonDark: "#7A0000",
  text1:       "#111827",
  text2:       "#374151",
  text3:       "#6B7280",
  text4:       "#9CA3AF",
  border:      "#E5E7EB",
};

export default function SplashScreen({ navigation, user }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(user ? "MainTabs" : "Login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.replace(user ? "MainTabs" : "Login");
  };

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>

      {/* ── BRAND ── */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 550, delay: 80 }}
        style={s.brandRow}
      >
        <View style={s.brandDot} />
        <Text style={s.brandText}>
          Tri<Text style={s.brandBold}>lyte</Text>
        </Text>
      </MotiView>

      {/* ── HERO ── */}
      <MotiView
        from={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 90, delay: 150 }}
        style={s.heroWrap}
      >
        {/* Single clean ring */}
        <View style={s.ring}>
          <LinearGradient
            colors={["#1e0404", "#5c0d0d", "#8B1010"]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.circle}
          >
            <View style={s.circleInnerRing} />
            <Image
              source={require("../assets/Hearts.png")}
              style={s.heartImg}
              resizeMode="contain"
            />
          </LinearGradient>
        </View>
      </MotiView>

      {/* ── COPY ── */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 520, delay: 320 }}
        style={s.copyWrap}
      >
        <Text style={s.headline}>
          ECG-powered{"\n"}electrolyte detection
        </Text>
        <Text style={s.sub}>
          Personal cardiac monitoring, right in your pocket.
        </Text>
      </MotiView>

      {/* ── THREE PILLS ── */}
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 480, delay: 460 }}
        style={s.pillRow}
      >
        {[
          { icon: "pulse-outline",            label: "ECG Analysis" },
          { icon: "flask-outline",            label: "Electrolytes" },
          { icon: "shield-checkmark-outline", label: "Secure"       },
        ].map(({ icon, label }) => (
          <View key={label} style={s.pill}>
            <Ionicons name={icon} size={13} color={T.crimson} />
            <Text style={s.pillText}>{label}</Text>
          </View>
        ))}
      </MotiView>

      {/* ── CTA ── */}
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 580 }}
        style={s.ctaSection}
      >
        <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.87} style={s.ctaBtn}>
          <LinearGradient
            colors={[T.crimson, T.crimsonDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaGrad}
          >
            <Text style={s.ctaText}>Get Started</Text>
            <View style={s.ctaArrow}>
              <Ionicons name="arrow-forward" size={16} color={T.crimson} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={s.footerNote}>
          By continuing you agree to our{" "}
          <Text style={s.footerLink}>Terms of Service</Text>
        </Text>
      </MotiView>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 14,
  },

  // Brand
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 9,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.crimson,
  },
  brandText: {
    fontSize: 24,
    fontWeight: "300",
    color: T.text1,
    letterSpacing: 0.2,
  },
  brandBold: {
    fontWeight: "800",
    color: T.crimson,
  },

  // Hero
  heroWrap: { alignItems: "center" },
  ring: {
    width: CIRCLE + 20,
    height: CIRCLE + 20,
    borderRadius: (CIRCLE + 20) / 2,
    borderWidth: 1,
    borderColor: "#F0C8C8",
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  circleInnerRing: {
    position: "absolute",
    width: CIRCLE * 0.72,
    height: CIRCLE * 0.72,
    borderRadius: CIRCLE * 0.36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  heartImg: {
    width: CIRCLE * 0.60,
    height: CIRCLE * 0.60,
  },

  // Copy
  copyWrap: { alignItems: "center", gap: 10 },
  headline: {
    fontSize: 28,
    fontWeight: "800",
    color: T.text1,
    textAlign: "center",
    letterSpacing: -0.7,
    lineHeight: 35,
  },
  sub: {
    fontSize: 14,
    color: T.text3,
    textAlign: "center",
    lineHeight: 21,
    fontWeight: "400",
  },

  // Pills
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: T.text2,
  },

  // CTA
  ctaSection: {
    width: "100%",
    alignItems: "center",
    gap: 13,
  },
  ctaBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  ctaGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  footerNote: {
    fontSize: 12,
    color: T.text4,
    textAlign: "center",
  },
  footerLink: {
    color: T.crimson,
    fontWeight: "600",
  },
});