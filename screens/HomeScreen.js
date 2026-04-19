import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  StatusBar,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { ref, onValue, off, get } from "firebase/database";
import { auth, db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, MotiText } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

// ─────────────────────────────────────────────
// DESIGN TOKENS — single source of truth
// ─────────────────────────────────────────────
const T = {
  // Core palette
  bg:           "#FAFAF9",   // warm off-white
  surface:      "#FFFFFF",
  surfaceWarm:  "#FDF7F7",   // faint blush for primary card
  crimson:      "#B22222",
  crimsonDark:  "#7A0000",

  // Semantic
  success:       "#15803D",
  successTint:   "#F0FDF4",
  successBorder: "#86EFAC",
  error:         "#B91C1C",
  errorTint:     "#FEF2F2",
  errorBorder:   "#FECACA",

  // Text scale
  text1: "#111827",
  text2: "#374151",
  text3: "#6B7280",
  text4: "#9CA3AF",

  // Borders
  border:      "#E5E7EB",
  borderLight: "#F3F4F6",
};

// ─────────────────────────────────────────────
// CHART CONFIG
// ─────────────────────────────────────────────
const ecgChartConfig = {
  backgroundGradientFrom:        "transparent",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo:          "transparent",
  backgroundGradientToOpacity:   0,
  color: (opacity = 1) => `rgba(255, 130, 130, ${opacity})`,
  strokeWidth:   1.8,
  decimalPlaces: 0,
  propsForBackgroundLines: { stroke: "transparent" },
};

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────
const HeroStat = ({ icon, label, value }) => (
  <View style={s.heroStatItem}>
    <Ionicons name={icon} size={13} color="rgba(255,255,255,0.4)" />
    <Text style={s.heroStatLabel}>{label}</Text>
    <Text style={s.heroStatValue}>{value}</Text>
  </View>
);

const MetricTile = ({ icon, label, value, unit, accent }) => (
  <View style={[s.metricTile, { borderLeftColor: accent }]}>
    <View style={[s.metricIconBox, { backgroundColor: accent + "18" }]}>
      <Ionicons name={icon} size={18} color={accent} />
    </View>
    <Text style={s.metricLabel}>{label}</Text>
    <View style={s.metricValueRow}>
      <Text style={[s.metricValue, { color: accent }]}>{value}</Text>
      {unit ? <Text style={s.metricUnit}>{unit}</Text> : null}
    </View>
  </View>
);

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [user,          setUser]          = useState(null);
  const [latestECG,     setLatestECG]     = useState(null);
  const [latestResults, setLatestResults] = useState(null);
  const [isEspOnline,   setIsEspOnline]   = useState(false);
  const [isRecording,   setIsRecording]   = useState(false);
  const [currentTime,   setCurrentTime]   = useState(new Date());

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) { fetchLatestData(u.uid); checkDeviceStatus(); }
    });
    const clock = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => { unsubAuth(); clearInterval(clock); };
  }, []);

  const checkDeviceStatus = () => {
    onValue(ref(db, "esp32_status/ip"), (snap) => setIsEspOnline(snap.exists()));
  };

  const fetchLatestData = (uid) => {
    const ecgRef = ref(db, `users/${uid}/ecg_data`);
    const resRef = ref(db, `users/${uid}/latest_results`);
    onValue(ecgRef, (snap) => {
      const data = snap.val();
      if (data) {
        const entries = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setLatestECG(entries[0]);
      }
    });
    onValue(resRef, (snap) => { if (snap.exists()) setLatestResults(snap.val()); });
    return () => { off(ecgRef); off(resRef); };
  };

  const handleRecordECG = async () => {
    if (!user || isRecording) return;
    if (!isEspOnline) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({ type: "error", text1: "Device Offline", text2: "Check your Trilyte device power.", position: "top" });
      return;
    }
    Alert.alert("Prepare for Scan", "Ensure electrodes are attached and stay still.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Begin Scan",
        onPress: async () => {
          setIsRecording(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          try {
            const snap = await get(ref(db, "esp32_status/ip"));
            const ip   = snap.val();
            if (ip) {
              const res = await fetch(`http://${ip}/capture?uid=${user.uid}`);
              if (res.ok) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Toast.show({ type: "success", text1: "Recording Complete ✓", text2: "ECG results updated.", visibilityTime: 4000 });
              } else throw new Error("busy");
            }
          } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Toast.show({ type: "info", text1: "Connection Lost", text2: "Ensure phone and device share the same Wi-Fi." });
          } finally { setIsRecording(false); }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear local state first
              setLatestECG(null);
              setLatestResults(null);
              setIsEspOnline(false);
              setUser(null);
              // Firebase signOut triggers onAuthStateChanged(null) in your
              // root navigator, which handles the redirect automatically.
              await signOut(auth);
            } catch {
              Toast.show({
                type: "error",
                text1: "Sign Out Failed",
                text2: "Please try again.",
                position: "top",
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "--:--";
    let t = ts < 1000000000 ? ts + 946684800 : ts;
    return new Date(t * (t < 10000000000 ? 1000 : 1))
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const bpm = latestResults?.BPM ? Math.round(latestResults.BPM) : null;
  const bpmLabel = !bpm ? "No Data" : bpm < 60 ? "Low" : bpm <= 100 ? "Normal" : "Elevated";

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={T.surface} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View>
          <Text style={s.brand}>
            Tri<Text style={s.brandBold}>lyte</Text>
          </Text>
          <Text style={s.headerDate}>
            {currentTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.75} style={s.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color={T.text3} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} activeOpacity={0.8} style={s.avatarWrap}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={s.avatarImg} />
            ) : (
              <LinearGradient colors={[T.crimson, T.crimsonDark]} style={s.avatarFallback}>
                <Text style={s.avatarInitial}>{(user?.displayName || "P")[0].toUpperCase()}</Text>
              </LinearGradient>
            )}
            <View style={[s.statusDot, { backgroundColor: isEspOnline ? T.success : T.error }]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── GREETING ── */}
        <MotiView
          from={{ opacity: 0, translateY: -8 }} animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 480 }}
          style={s.greetBlock}
        >
          <Text style={s.greetSub}>{getGreeting()},</Text>
          <Text style={s.greetName}>{user?.displayName?.split(" ")[0] || "Patient"}</Text>
        </MotiView>

        {/* ── STATUS CHIP ── */}
        <MotiView
          from={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 380, delay: 60 }}
          style={[s.chip, {
            backgroundColor: isEspOnline ? T.successTint  : T.errorTint,
            borderColor:     isEspOnline ? T.successBorder : T.errorBorder,
          }]}
        >
          <View style={[s.chipDot, { backgroundColor: isEspOnline ? T.success : T.error }]} />
          <Text style={[s.chipText, { color: isEspOnline ? T.success : T.error }]}>
            {isEspOnline ? "Device Ready" : "Device Offline"}
          </Text>
        </MotiView>

        {/* ── HERO CARD ── */}
        <MotiView
          from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 100 }}
        >
          <LinearGradient
            colors={["#150202", "#420808", "#6E0E0E"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.ring1} />
            <View style={s.ring2} />

            <View style={s.heroTop}>
              <View>
                <Text style={s.heroEyebrow}>Heart Rate</Text>
                <View style={s.heroBpmRow}>
                  <Text style={s.heroBpm}>{bpm ?? "--"}</Text>
                  <Text style={s.heroUnit}>BPM</Text>
                </View>
                <View style={s.heroPill}>
                  <Text style={s.heroPillText}>{bpmLabel}</Text>
                </View>
              </View>
              <View style={s.heroIconBox}>
                <Ionicons name="heart" size={26} color="rgba(255,255,255,0.88)" />
              </View>
            </View>

            {latestECG?.values ? (
              <View style={s.heroChartWrap}>
                <LineChart
                  data={{ datasets: [{ data: latestECG.values.slice(0, 100) }] }}
                  width={width - 82}
                  height={88}
                  chartConfig={ecgChartConfig}
                  bezier withDots={false}
                  withInnerLines={false} withOuterLines={false}
                  withXLabels={false} withYLabels={false}
                  style={{ marginLeft: -18 }}
                />
              </View>
            ) : (
              <View style={s.heroEmpty}>
                <Ionicons name="pulse-outline" size={34} color="rgba(255,255,255,0.18)" />
                <Text style={s.heroEmptyText}>No ECG data yet</Text>
              </View>
            )}

            <View style={s.heroFooter}>
              <HeroStat icon="time-outline"             label="Last Scan" value={formatTimestamp(latestECG?.timestamp)} />
              <View style={s.heroDiv} />
              <HeroStat icon="analytics-outline"        label="Samples"   value={latestECG?.values ? `${latestECG.values.length}` : "--"} />
              <View style={s.heroDiv} />
              <HeroStat icon="shield-checkmark-outline" label="Status"    value={bpm ? bpmLabel : "N/A"} />
            </View>
          </LinearGradient>
        </MotiView>

        {/* ── ACTIONS ── */}
        <Text style={s.sectionLabel}>Actions</Text>
        <View style={s.actionRow}>
          <MotiView
            from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay: 200 }}
            style={s.actionWrap}
          >
            <TouchableOpacity onPress={handleRecordECG} disabled={isRecording} activeOpacity={0.82}
              style={[s.actionCard, s.actionPrimary]}>
              <LinearGradient colors={[T.crimson, T.crimsonDark]} style={s.actionIcon}>
                {isRecording
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Ionicons name="pulse-outline" size={21} color="#fff" />}
              </LinearGradient>
              <Text style={s.actionTitle}>{isRecording ? "Recording…" : "New Scan"}</Text>
              <Text style={s.actionSub}>Capture ECG</Text>
              {isRecording && (
                <View style={s.liveBadge}>
                  <View style={s.liveDot} />
                  <Text style={s.liveText}>LIVE</Text>
                </View>
              )}
            </TouchableOpacity>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay: 260 }}
            style={s.actionWrap}
          >
            <TouchableOpacity onPress={() => navigation.navigate("History")} activeOpacity={0.82} style={s.actionCard}>
              <View style={[s.actionIcon, { backgroundColor: "#F0EDE8" }]}>
                <Ionicons name="calendar-outline" size={21} color={T.text2} />
              </View>
              <Text style={s.actionTitle}>History</Text>
              <Text style={s.actionSub}>Past readings</Text>
            </TouchableOpacity>
          </MotiView>
        </View>

        {/* ── METRICS ── */}
        {latestResults && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay: 320 }}
          >
            <Text style={s.sectionLabel}>Quick Metrics</Text>
            <View style={s.metricsRow}>
              <MetricTile
                icon="heart-outline"
                label="Heart Rate"
                value={bpm ?? "--"}
                unit="bpm"
                accent={T.crimson}
              />
              <MetricTile
                icon="pulse-outline"
                label="Samples"
                value={latestECG?.values ? latestECG.values.length : "--"}
                unit="pts"
                accent="#7C3AED"
              />
            </View>
          </MotiView>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  // Header
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 22, paddingVertical: 13,
    backgroundColor: T.surface,
    borderBottomWidth: 1, borderBottomColor: T.border,
  },
  brand:      { fontSize: 22, fontWeight: "300", color: T.text1, letterSpacing: 0.3 },
  brandBold:  { fontWeight: "800", color: T.crimson },
  headerDate: { fontSize: 12, color: T.text4, fontWeight: "500", marginTop: 2 },

  avatarWrap:     { position: "relative" },
  headerRight:    { flexDirection: "row", alignItems: "center", gap: 10 },
  logoutBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: T.borderLight,
    justifyContent: "center", alignItems: "center",
  },
  avatarImg:      { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: T.borderLight },
  avatarFallback: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
  avatarInitial:  { fontSize: 17, fontWeight: "700", color: "#fff" },
  statusDot: {
    position: "absolute", bottom: 0, right: 0,
    width: 11, height: 11, borderRadius: 6,
    borderWidth: 2, borderColor: T.surface,
  },

  // Scroll
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 52 },

  // Greeting
  greetBlock: { marginBottom: 14 },
  greetSub:   { fontSize: 14, color: T.text4, fontWeight: "500" },
  greetName:  { fontSize: 30, fontWeight: "800", color: T.text1, letterSpacing: -0.8, marginTop: 1 },

  // Chip
  chip: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    paddingHorizontal: 11, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, marginBottom: 18,
  },
  chipDot:  { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  chipText: { fontSize: 12, fontWeight: "600" },

  // Hero
  hero:       { borderRadius: 24, padding: 20, overflow: "hidden", marginBottom: 4 },
  ring1: {
    position: "absolute", width: 200, height: 200, borderRadius: 100,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", top: -70, right: -50,
  },
  ring2: {
    position: "absolute", width: 300, height: 300, borderRadius: 150,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.03)", top: -120, right: -100,
  },
  heroTop:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  heroEyebrow:  { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 },
  heroBpmRow:   { flexDirection: "row", alignItems: "flex-end", gap: 5 },
  heroBpm:      { fontSize: 58, fontWeight: "800", color: "#fff", lineHeight: 64, letterSpacing: -2.5 },
  heroUnit:     { fontSize: 17, fontWeight: "500", color: "rgba(255,255,255,0.55)", marginBottom: 10 },
  heroPill:     { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.13)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 7 },
  heroPillText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.85)" },
  heroIconBox:  { width: 50, height: 50, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center" },
  heroChartWrap:{ marginTop: 8, marginBottom: 2, opacity: 0.88 },
  heroEmpty:    { height: 88, justifyContent: "center", alignItems: "center", gap: 7 },
  heroEmptyText:{ fontSize: 13, color: "rgba(255,255,255,0.28)", fontWeight: "500" },
  heroFooter: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: 14, paddingTop: 13,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.09)",
  },
  heroStatItem:  { flex: 1, alignItems: "center", gap: 3 },
  heroStatLabel: { fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: "500", marginTop: 2 },
  heroStatValue: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.88)" },
  heroDiv:       { width: 1, backgroundColor: "rgba(255,255,255,0.09)" },

  // Section label
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: T.text4,
    textTransform: "uppercase", letterSpacing: 1.1,
    marginTop: 28, marginBottom: 13,
  },

  // Action cards
  actionRow:    { flexDirection: "row", gap: 11 },
  actionWrap:   { flex: 1 },
  actionCard: {
    backgroundColor: T.surface,
    borderRadius: 20, padding: 17,
    borderWidth: 1, borderColor: T.border,
    minHeight: 138, justifyContent: "space-between",
  },
  actionPrimary: { backgroundColor: T.surfaceWarm, borderColor: "#F5C8C8" },
  actionIcon:    { width: 46, height: 46, borderRadius: 13, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  actionTitle:   { fontSize: 15, fontWeight: "700", color: T.text1, marginTop: 5 },
  actionSub:     { fontSize: 12, color: T.text4, fontWeight: "500", marginTop: 2 },
  liveBadge:     { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7 },
  liveDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: T.error },
  liveText:      { fontSize: 10, fontWeight: "800", color: T.error, letterSpacing: 0.8 },

  // Metric tiles
  metricsRow:     { flexDirection: "row", gap: 11 },
  metricTile: {
    flex: 1, backgroundColor: T.surface,
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: T.border,
    borderLeftWidth: 3,
  },
  metricIconBox:  { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  metricLabel:    { fontSize: 11, fontWeight: "600", color: T.text4, marginBottom: 4 },
  metricValueRow: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  metricValue:    { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  metricUnit:     { fontSize: 12, fontWeight: "600", color: T.text4, marginBottom: 3 },
});