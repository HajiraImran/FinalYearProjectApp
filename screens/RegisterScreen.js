import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

// ── DESIGN TOKENS ──
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
  errorTint:    "#FEF2F2",
  errorBorder:  "#FECACA",
  successTint:  "#F0FDF4",
  successBorder:"#86EFAC",
  successText:  "#15803D",
};

// ── PASSWORD STRENGTH ──
const getPasswordStrength = (pw) => {
  if (!pw) return null;
  if (pw.length < 6)  return { label: "Too short",  color: "#EF4444", pct: 20 };
  if (pw.length < 8)  return { label: "Weak",       color: "#F97316", pct: 40 };
  const hasUpper   = /[A-Z]/.test(pw);
  const hasNum     = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
  if (score === 0) return { label: "Fair",     color: "#EAB308", pct: 55 };
  if (score === 1) return { label: "Good",     color: "#84CC16", pct: 72 };
  if (score >= 2)  return { label: "Strong",   color: T.successText, pct: 100 };
  return null;
};

// ── FIELD COMPONENT ──
const Field = ({ label, icon, placeholder, value, onChangeText, onFocus, onBlur,
  focused, error, secureEntry, showToggle, onToggle, keyboardType, autoCapitalize }) => (
  <View style={s.fieldWrap}>
    <Text style={s.fieldLabel}>{label}</Text>
    <View style={[
      s.inputWrap,
      focused && s.inputWrapFocused,
      error  && s.inputWrapError,
    ]}>
      <View style={s.inputIcon}>
        <Ionicons name={icon} size={17} color={focused ? T.crimson : T.text4} />
      </View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={T.text4}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        secureTextEntry={secureEntry}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "sentences"}
        autoCorrect={false}
        style={s.inputText}
      />
      {showToggle && (
        <TouchableOpacity onPress={onToggle} style={s.eyeBtn} activeOpacity={0.7}>
          <Ionicons name={secureEntry ? "eye-off-outline" : "eye-outline"} size={17} color={T.text4} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ── SCREEN ──
export default function RegisterScreen({ navigation }) {
  const [username,     setUsername]     = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused,      setFocused]      = useState(null);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState(false);

  const strength = getPasswordStrength(password);

  const validate = () => {
    if (!username.trim())  return "Please enter a username.";
    if (!email.trim())     return "Please enter your email address.";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) return "Please enter a valid email address.";
    if (!password)         return "Please enter a password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleRegister = async () => {
    setError("");
    const validationError = validate();
    if (validationError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: username.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
      // onAuthStateChanged in root navigator handles redirect automatically
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        err.code === "auth/email-already-in-use" ? "An account with this email already exists." :
        err.code === "auth/invalid-email"         ? "Invalid email address." :
        err.code === "auth/weak-password"         ? "Password is too weak. Add numbers or symbols." :
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => { if (error) setError(""); };

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── BRAND ── */}
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
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.imageCircle}
            >
              <View style={s.ir1} />
              <View style={s.ir2} />
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
            <Text style={s.headline}>Create account</Text>
            <Text style={s.subheadline}>Start monitoring your cardiac health</Text>
          </MotiView>

          {/* ── FORM ── */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 480, delay: 260 }}
            style={s.form}
          >
            <Field
              label="Full Name"
              icon="person-outline"
              placeholder="Ahmed Khan"
              value={username}
              onChangeText={(v) => { setUsername(v); clearError(); }}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              focused={focused === "name"}
              error={!!error}
            />

            <Field
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              value={email}
              onChangeText={(v) => { setEmail(v); clearError(); }}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              focused={focused === "email"}
              error={!!error}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Field
              label="Password"
              icon="lock-closed-outline"
              placeholder="Min. 6 characters"
              value={password}
              onChangeText={(v) => { setPassword(v); clearError(); }}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              focused={focused === "password"}
              error={!!error}
              secureEntry={!showPassword}
              showToggle
              onToggle={() => setShowPassword((p) => !p)}
              autoCapitalize="none"
            />

            {/* Password strength bar */}
            {password.length > 0 && strength && (
              <MotiView
                from={{ opacity: 0, translateY: -4 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 260 }}
                style={s.strengthWrap}
              >
                <View style={s.strengthTrack}>
                  <View style={[s.strengthFill, { width: `${strength.pct}%`, backgroundColor: strength.color }]} />
                </View>
                <Text style={[s.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
              </MotiView>
            )}

            {/* Inline error */}
            {error ? (
              <MotiView
                from={{ opacity: 0, translateY: -4 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 280 }}
                style={s.errorBox}
              >
                <Ionicons name="alert-circle-outline" size={14} color={T.crimson} />
                <Text style={s.errorText}>{error}</Text>
              </MotiView>
            ) : null}

            {/* Success state */}
            {success ? (
              <MotiView
                from={{ opacity: 0, translateY: -4 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 280 }}
                style={s.successBox}
              >
                <Ionicons name="checkmark-circle-outline" size={14} color={T.successText} />
                <Text style={s.successText}>Account created! Taking you in…</Text>
              </MotiView>
            ) : null}

            {/* CTA */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading || success}
              activeOpacity={0.87}
              style={[s.ctaBtn, (loading || success) && { opacity: 0.75 }]}
            >
              <LinearGradient
                colors={[T.crimson, T.crimsonDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.ctaGrad}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={s.ctaText}>Create Account</Text>
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
            from={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 400, delay: 420 }}
            style={s.dividerRow}
          >
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </MotiView>

          {/* ── LOGIN LINK ── */}
          <MotiView
            from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay: 480 }}
            style={s.loginWrap}
          >
            <Text style={s.loginPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")} activeOpacity={0.7}>
              <Text style={s.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </MotiView>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── STYLES ──
const CIRCLE = 120;

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: T.bg },
  scroll: {
    alignItems: "center",
    paddingHorizontal: 26,
    paddingTop: 18,
    paddingBottom: 40,
  },

  // Brand
  brandWrap: { flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "flex-start", marginBottom: 22 },
  brandIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: T.crimson, justifyContent: "center", alignItems: "center" },
  brandText: { fontSize: 22, fontWeight: "300", color: T.text1, letterSpacing: 0.3 },
  brandBold: { fontWeight: "800", color: T.crimson },

  // Hero image
  imageWrap:   { marginBottom: 22 },
  imageCircle: { width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  ir1: { position: "absolute", width: CIRCLE * 0.84, height: CIRCLE * 0.84, borderRadius: CIRCLE * 0.42, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  ir2: { position: "absolute", width: CIRCLE * 0.62, height: CIRCLE * 0.62, borderRadius: CIRCLE * 0.31, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  ecgImage: { width: CIRCLE * 0.62, height: CIRCLE * 0.62 },

  // Headline
  headlineWrap: { alignItems: "center", marginBottom: 24 },
  headline:     { fontSize: 26, fontWeight: "800", color: T.text1, letterSpacing: -0.5 },
  subheadline:  { fontSize: 14, color: T.text3, fontWeight: "400", marginTop: 5 },

  // Form
  form: { width: "100%" },

  fieldWrap:  { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: T.text2, marginBottom: 7, marginLeft: 2 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.border,
    borderRadius: 14, paddingHorizontal: 14, height: 52,
  },
  inputWrapFocused: { borderColor: T.crimson, backgroundColor: "#FFFBFB" },
  inputWrapError:   { borderColor: T.errorBorder, backgroundColor: T.errorTint },
  inputIcon:  { marginRight: 10 },
  inputText:  { flex: 1, fontSize: 15, color: T.text1 },
  eyeBtn:     { padding: 4 },

  // Password strength
  strengthWrap:  { flexDirection: "row", alignItems: "center", gap: 10, marginTop: -6, marginBottom: 10 },
  strengthTrack: { flex: 1, height: 3, backgroundColor: T.border, borderRadius: 3, overflow: "hidden" },
  strengthFill:  { height: 3, borderRadius: 3 },
  strengthLabel: { fontSize: 11, fontWeight: "700", minWidth: 48, textAlign: "right" },

  // Error
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: T.errorTint, borderWidth: 1, borderColor: T.errorBorder,
    borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, marginBottom: 12,
  },
  errorText: { fontSize: 13, color: T.crimson, fontWeight: "500", flex: 1 },

  // Success
  successBox: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: T.successTint, borderWidth: 1, borderColor: T.successBorder,
    borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, marginBottom: 12,
  },
  successText: { fontSize: 13, color: T.successText, fontWeight: "500", flex: 1 },

  // CTA
  ctaBtn:  { width: "100%", borderRadius: 16, overflow: "hidden" },
  ctaGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 12 },
  ctaText: { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.2 },
  ctaArrow:{ width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.92)", justifyContent: "center", alignItems: "center" },

  // Divider
  dividerRow:  { flexDirection: "row", alignItems: "center", gap: 12, width: "100%", marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: T.border },
  dividerText: { fontSize: 12, color: T.text4, fontWeight: "500" },

  // Login link
  loginWrap:   { flexDirection: "row", alignItems: "center", gap: 6 },
  loginPrompt: { fontSize: 14, color: T.text3 },
  loginLink:   { fontSize: 14, fontWeight: "700", color: T.crimson },
});