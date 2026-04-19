import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";
import { auth, db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { MotiView } from "moti";

const { width: screenWidth } = Dimensions.get("window");

// ── THEME ──
const C = {
  bg: "#F6F7FA",
  surface: "#FFFFFF",
  crimson: "#B22222",
  crimsonTint: "#FFF5F5",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  success: "#15803D",
  successTint: "#F0FDF4",
  successBorder: "#BBF7D0",
  errorTint: "#FEF2F2",
  errorBorder: "#FECACA",
  error: "#B91C1C",
};

// ── RANGE BAR ── renders a visual fill indicator
const RangeBar = ({ value, range, color }) => {
  if (!value || !range) return null;
  const match = range.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  if (!match) return null;
  const lo = parseFloat(match[1]);
  const hi = parseFloat(match[2]);
  const v = parseFloat(value);
  const pct = Math.min(Math.max(((v - lo) / (hi - lo)) * 100, 0), 100);
  const inRange = v >= lo && v <= hi;
  return (
    <View style={bar.track}>
      <View
        style={[
          bar.fill,
          {
            width: `${pct}%`,
            backgroundColor: inRange ? C.success : C.error,
          },
        ]}
      />
      <View style={[bar.cursor, { left: `${pct}%` }]} />
    </View>
  );
};

const bar = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    marginTop: 10,
    position: "relative",
    overflow: "visible",
  },
  fill: { height: 4, borderRadius: 4 },
  cursor: {
    position: "absolute",
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.textSecondary,
    marginLeft: -6,
  },
});

// ── LAB CARD ──
const LabCard = ({ title, Value, Level, Range, iconType, iconName, delay = 0 }) => {
  const isNormal =
    Level?.toUpperCase().includes("NORMAL") ||
    Level?.toUpperCase().includes("WITHIN");
  const statusColor = isNormal ? C.success : C.error;
  const statusTint = isNormal ? C.successTint : C.errorTint;
  const statusBorder = isNormal ? C.successBorder : C.errorBorder;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 420, delay }}
      style={styles.labCard}
    >
      {/* Left: icon */}
      <View style={styles.labIconWrap}>
        {iconType === "FontAwesome5" && (
          <FontAwesome5 name={iconName} size={18} color={C.crimson} />
        )}
        {iconType === "MaterialCommunityIcons" && (
          <MaterialCommunityIcons name={iconName} size={20} color={C.crimson} />
        )}
        {iconType === "Ionicons" && (
          <Ionicons name={iconName} size={20} color={C.crimson} />
        )}
      </View>

      {/* Middle: title + range bar */}
      <View style={styles.labMid}>
        <Text style={styles.labTitle}>{title}</Text>
        <Text style={styles.labRange}>
          Ref: {Range || "—"}
        </Text>
        <RangeBar value={Value} range={Range} color={statusColor} />
      </View>

      {/* Right: value + badge */}
      <View style={styles.labRight}>
        <Text style={[styles.labValue, { color: statusColor }]}>
          {Value || "—"}
        </Text>
        <View
          style={[
            styles.labBadge,
            { backgroundColor: statusTint, borderColor: statusBorder },
          ]}
        >
          <View
            style={[styles.labBadgeDot, { backgroundColor: statusColor }]}
          />
          <Text style={[styles.labBadgeText, { color: statusColor }]}>
            {isNormal ? "Normal" : Level || "Pending"}
          </Text>
        </View>
      </View>
    </MotiView>
  );
};

// ── STAT CHIP ──
const StatChip = ({ label, value, icon }) => (
  <View style={styles.statChip}>
    <Ionicons name={icon} size={14} color={C.textMuted} />
    <Text style={styles.statChipLabel}>{label}</Text>
    <Text style={styles.statChipValue}>{value}</Text>
  </View>
);

export default function ECGScreen({ navigation }) {
  const [ecgData, setEcgData] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sampleCount, setSampleCount] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return setLoading(false);

    const uid = user.uid;
    const ecgRef = ref(db, `users/${uid}/ecg_data`);
    const resRef = ref(db, `users/${uid}/latest_results`);

    const unsubECG = onValue(ecgRef, (snap) => {
      const data = snap.val();
      if (data) {
        const keys = Object.keys(data);
        const latestKey = keys.sort(
          (a, b) => data[b].timestamp - data[a].timestamp
        )[0];
        const latest = data[latestKey];
        if (latest?.values) {
          setSampleCount(latest.values.length);
          setEcgData(latest.values.slice(0, 120));
        }
      }
    });

    const unsubRes = onValue(resRef, (snap) => {
      if (snap.exists()) setResults(snap.val());
      setLoading(false);
    });

    return () => {
      unsubECG();
      unsubRes();
    };
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Diagnostics</Text>
          <Text style={styles.headerSub}>ECG & Electrolytes</Text>
        </View>
        {/* Spacer mirror */}
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={C.crimson} />
          <Text style={styles.loaderText}>Synchronizing data…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── ECG WAVEFORM CARD ── */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 480 }}
          >
            <LinearGradient
              colors={["#1a0505", "#3b0808", "#6B0F0F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ecgCard}
            >
              {/* Decorative rings */}
              <View style={styles.ring1} />
              <View style={styles.ring2} />

              {/* Card header */}
              <View style={styles.ecgHeader}>
                <View>
                  <Text style={styles.ecgLabel}>ECG Waveform</Text>
                  <Text style={styles.ecgSub}>Latest recording</Text>
                </View>
                <View style={styles.latestBadge}>
                  <View style={styles.latestDot} />
                  <Text style={styles.latestText}>LATEST</Text>
                </View>
              </View>

              {/* Chart or empty */}
              {ecgData.length > 0 ? (
                <LineChart
                  data={{ datasets: [{ data: ecgData }] }}
                  width={screenWidth - 72}
                  height={130}
                  chartConfig={ecgChartConfig}
                  bezier
                  withDots={false}
                  withInnerLines={false}
                  withOuterLines={false}
                  withXLabels={false}
                  withYLabels={false}
                  style={{ marginLeft: -18, marginTop: 6 }}
                />
              ) : (
                <View style={styles.ecgEmpty}>
                  <Ionicons
                    name="pulse-outline"
                    size={34}
                    color="rgba(255,255,255,0.2)"
                  />
                  <Text style={styles.ecgEmptyText}>Waiting for pulse…</Text>
                </View>
              )}

              {/* Footer chips */}
              <View style={styles.ecgFooter}>
                <StatChip
                  icon="analytics-outline"
                  label="Samples"
                  value={`${sampleCount}`}
                />
                <View style={styles.ecgFooterDiv} />
                <StatChip
                  icon="heart-outline"
                  label="BPM"
                  value={
                    results?.BPM ? `${Math.round(results.BPM)}` : "—"
                  }
                />
                <View style={styles.ecgFooterDiv} />
                <StatChip
                  icon="checkmark-circle-outline"
                  label="Rhythm"
                  value="Sinus"
                />
              </View>
            </LinearGradient>
          </MotiView>

          {/* ── SECTION LABEL ── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Electrolyte Balance</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>3 markers</Text>
            </View>
          </View>

          {/* ── INFO STRIP ── */}
          <View style={styles.infoStrip}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={C.textMuted}
            />
            <Text style={styles.infoText}>
              Values compared to standard reference ranges
            </Text>
          </View>

          {/* ── LAB CARDS ── */}
          <LabCard
            title="Potassium (K⁺)"
            iconType="MaterialCommunityIcons"
            iconName="flask-round-bottom"
            delay={60}
            {...results?.Potassium}
          />
          <LabCard
            title="Calcium (Ca²⁺)"
            iconType="FontAwesome5"
            iconName="bone"
            delay={120}
            {...results?.Calcium}
          />
          <LabCard
            title="Magnesium (Mg²⁺)"
            iconType="Ionicons"
            iconName="leaf-outline"
            delay={180}
            {...results?.Magnesium}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── CHART CONFIG ──
const ecgChartConfig = {
  backgroundGradientFrom: "transparent",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "transparent",
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(255, 110, 110, ${opacity})`,
  strokeWidth: 1.8,
  decimalPlaces: 0,
  propsForBackgroundLines: { stroke: "transparent" },
};

// ── STYLES ──
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { alignItems: "center" },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.textPrimary,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: "500",
    marginTop: 1,
  },

  // Loader
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  loaderText: {
    fontSize: 14,
    color: C.textMuted,
    fontWeight: "500",
  },

  // Scroll
  scrollContent: {
    padding: 18,
    paddingBottom: 50,
  },

  // ECG card
  ecgCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    position: "relative",
    marginBottom: 6,
  },
  ring1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    top: -80,
    right: -50,
  },
  ring2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
    top: -130,
    right: -100,
  },
  ecgHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  ecgLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.2,
  },
  ecgSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "500",
    marginTop: 3,
  },
  latestBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  latestDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF6B6B",
  },
  latestText: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.8,
  },
  ecgEmpty: {
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  ecgEmptyText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "500",
  },
  ecgFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 14,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  ecgFooterDiv: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  // Stat Chip (inside dark card)
  statChip: { alignItems: "center", gap: 3, flex: 1 },
  statChipLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "500",
    marginTop: 2,
  },
  statChipValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
  },

  // Section header
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 26,
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textMuted,
  },

  // Info strip
  infoStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  infoText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "400",
  },

  // Lab Card
  labCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  labIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  labMid: { flex: 1 },
  labTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textPrimary,
    letterSpacing: -0.2,
  },
  labRange: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  labRight: { alignItems: "flex-end", gap: 6, flexShrink: 0 },
  labValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  labBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  labBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  labBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});