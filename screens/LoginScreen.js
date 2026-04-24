import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

// ── DESIGN TOKENS (app-wide) ──
const T = {
  bg:           "#FAFAF9",
  surface:      "#FFFFFF",
  crimson:      "#B22222",
  crimsonDark:  "#7A0000",
  text1:        "#111827",
  text2:        "#374151",
  text3:        "#6B7280",
  text4:        "#9CA3AF",
  border:       "#E5E7EB",
  borderLight:  "#F3F4F6",
  errorTint:    "#FEF2F2",
  errorBorder:  "#FECACA",
};

export default function LoginScreen({ navigation }) {
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [loading,       setLoading]       = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [focusedField,  setFocusedField]  = useState(null);
  const [fieldError,    setFieldError]    = useState("");

  const handleLogin = async () => {
    setFieldError("");

    if (!email.trim() || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFieldError("Please enter your email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFieldError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigation handled by onAuthStateChanged in root navigator
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        err.code === "auth/user-not-found"  ? "No account found with this email." :
        err.code === "auth/wrong-password"  ? "Incorrect password. Please try again." :
        err.code === "auth/invalid-email"   ? "Invalid email address." :
        err.code === "auth/too-many-requests" ? "Too many attempts. Please try later." :
        "Sign in failed. Please check your credentials.";
      setFieldError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => [
    s.input,
    focusedField === field && s.inputFocused,
    fieldError && s.inputError,
  ];

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── TOP BRAND ── */}
          <MotiView
            from={{ opacity: 0, translateY: -12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500 }}
            style={s.brandWrap}
          >
            <View style={s.brandIcon}>
              <Ionicons name="pulse" size={18} color="#fff" />
            </View>
            <Text style={s.brandText}>
              Tri<Text style={s.brandBold}>lyte</Text>
            </Text>
          </MotiView>

          {/* ── HERO IMAGE ── */}
          <MotiView
            from={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 80, delay: 100 }}
            style={s.imageWrap}
          >
            <LinearGradient
              colors={["#1a0505", "#5c0d0d", "#8B1010"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.imageCircle}
            >
              <View style={s.imageRing1} />
              <View style={s.imageRing2} />
              <Image
                source={require("../assets/ECGS.png")}
                style={s.ecgImage}
                resizeMode="contain"
              />
            </LinearGradient>
          </MotiView>

          {/* ── HEADLINE ── */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 480, delay: 180 }}
            style={s.headlineWrap}
          >
            <Text style={s.headline}>Welcome back</Text>
            <Text style={s.subheadline}>Sign in to your Trilyte account</Text>
          </MotiView>

          {/* ── FORM ── */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 480, delay: 260 }}
            style={s.form}
          >
            {/* Email field */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Email</Text>
              <View style={[s.inputWrap, focusedField === "email" && s.inputWrapFocused, fieldError && s.inputWrapError]}>
                <View style={s.inputIcon}>
                  <Ionicons name="mail-outline" size={17} color={focusedField === "email" ? T.crimson : T.text4} />
                </View>
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor={T.text4}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setFieldError(""); }}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  style={s.inputText}
                />
              </View>
            </View>

            {/* Password field */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Password</Text>
              <View style={[s.inputWrap, focusedField === "password" && s.inputWrapFocused, fieldError && s.inputWrapError]}>
                <View style={s.inputIcon}>
                  <Ionicons name="lock-closed-outline" size={17} color={focusedField === "password" ? T.crimson : T.text4} />
                </View>
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={T.text4}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setFieldError(""); }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  style={s.inputText}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  style={s.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={17}
                    color={T.text4}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Inline error */}
            {fieldError ? (
              <MotiView
                from={{ opacity: 0, translateY: -4 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 280 }}
                style={s.errorBox}
              >
                <Ionicons name="alert-circle-outline" size={14} color={T.crimson} />
                <Text style={s.errorText}>{fieldError}</Text>
              </MotiView>
            ) : null}

            {/* Forgot password */}
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              activeOpacity={0.7}
              style={s.forgotWrap}
            >
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign in button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.87}
              style={[s.ctaBtn, loading && { opacity: 0.75 }]}
            >
              <LinearGradient
                colors={[T.crimson, T.crimsonDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.ctaGrad}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={s.ctaText}>Sign In</Text>
                    <View style={s.ctaArrow}>
                      <Ionicons name="arrow-forward" size={16} color={T.crimson} />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>

          {/* ── DIVIDER ── */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 400, delay: 400 }}
            style={s.dividerRow}
          >
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </MotiView>

          {/* ── SIGN UP ── */}
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay: 460 }}
            style={s.signupWrap}
          >
            <Text style={s.signupPrompt}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")} activeOpacity={0.7}>
              <Text style={s.signupLink}>Create account</Text>
            </TouchableOpacity>
          </MotiView>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── STYLES ──
const CIRCLE = 130;

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: T.bg },
  scroll: {
    alignItems: "center",
    paddingHorizontal: 26,
    paddingTop: 18,
    paddingBottom: 40,
  },

  // Brand
  brandWrap: { flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "flex-start", marginBottom: 24 },
  brandIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: T.crimson, justifyContent: "center", alignItems: "center" },
  brandText: { fontSize: 22, fontWeight: "300", color: T.text1, letterSpacing: 0.3 },
  brandBold: { fontWeight: "800", color: T.crimson },

  // Hero image
  imageWrap:  { marginBottom: 26 },
  imageCircle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imageRing1: {
    position: "absolute",
    width: CIRCLE * 0.84,
    height: CIRCLE * 0.84,
    borderRadius: CIRCLE * 0.42,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  imageRing2: {
    position: "absolute",
    width: CIRCLE * 0.62,
    height: CIRCLE * 0.62,
    borderRadius: CIRCLE * 0.31,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  ecgImage: { width: CIRCLE * 0.64, height: CIRCLE * 0.64 },

  // Headline
  headlineWrap: { alignItems: "center", marginBottom: 28 },
  headline:    { fontSize: 26, fontWeight: "800", color: T.text1, letterSpacing: -0.5 },
  subheadline: { fontSize: 14, color: T.text3, fontWeight: "400", marginTop: 5 },

  // Form
  form: { width: "100%" },

  fieldWrap:  { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: T.text2, marginBottom: 7, marginLeft: 2 },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapFocused: { borderColor: T.crimson, backgroundColor: "#FFFBFB" },
  inputWrapError:   { borderColor: T.errorBorder, backgroundColor: T.errorTint },
  inputIcon: { marginRight: 10 },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: T.text1,
    fontWeight: "400",
  },
  eyeBtn: { padding: 4 },

  // Inline error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.errorTint,
    borderWidth: 1,
    borderColor: T.errorBorder,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  errorText: { fontSize: 13, color: T.crimson, fontWeight: "500", flex: 1 },

  // Forgot
  forgotWrap: { alignSelf: "flex-end", marginBottom: 18, marginTop: 2 },
  forgotText: { fontSize: 13, color: T.crimson, fontWeight: "600" },

  // CTA
  ctaBtn:  { width: "100%", borderRadius: 16, overflow: "hidden" },
  ctaGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  ctaText:  { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.2 },
  ctaArrow: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center", alignItems: "center",
  },

  // Divider
  dividerRow:  { flexDirection: "row", alignItems: "center", gap: 12, width: "100%", marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: T.border },
  dividerText: { fontSize: 12, color: T.text4, fontWeight: "500" },

  // Sign up
  signupWrap:   { flexDirection: "row", alignItems: "center", gap: 6 },
  signupPrompt: { fontSize: 14, color: T.text3 },
  signupLink:   { fontSize: 14, fontWeight: "700", color: T.crimson },
});