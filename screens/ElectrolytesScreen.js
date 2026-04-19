import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";

// ── THEME ──
const C = {
  bg: "#F6F7FA",
  surface: "#FFFFFF",
  crimson: "#B22222",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  // Status colors
  normalBg: "#F0FDF4",
  normalBorder: "#BBF7D0",
  normalText: "#15803D",
  normalIcon: "#16A34A",
  lowBg: "#FEF2F2",
  lowBorder: "#FECACA",
  lowText: "#B91C1C",
  highBg: "#FEF2F2",
  highBorder: "#FECACA",
  highText: "#B91C1C",
  criticalBg: "#FEF2F2",
  criticalBorder: "#FECACA",
  criticalText: "#B91C1C",
};

// ── HELPERS ──
const getStatusMeta = (level) => {
  if (!level) return { type: "pending", label: "Pending", color: C.textMuted, bg: "#F9FAFB", border: C.border };
  const l = level.toUpperCase();
  if (l.includes("CRITICAL") || l.includes("VERY HIGH") || l.includes("VERY LOW"))
    return { type: "critical", label: level, color: C.criticalText, bg: C.criticalBg, border: C.criticalBorder };
  if (l.includes("HIGH"))
    return { type: "high", label: level, color: C.highText, bg: C.highBg, border: C.highBorder };
  if (l.includes("LOW"))
    return { type: "low", label: level, color: C.lowText, bg: C.lowBg, border: C.lowBorder };
  if (l.includes("NORMAL"))
    return { type: "normal", label: "Normal", color: C.normalText, bg: C.normalBg, border: C.normalBorder };
  return { type: "pending", label: level, color: C.textMuted, bg: "#F9FAFB", border: C.border };
};

const ELECTROLYTE_META = {
  Potassium: {
    symbol: "K⁺",
    icon: "flask-outline",
    unit: "mEq/L",
    color: "#7C3AED",
    tint: "#EDE9FE",
  },
  Calcium: {
    symbol: "Ca²⁺",
    icon: "diamond-outline",
    unit: "mg/dL",
    color: "#0369A1",
    tint: "#E0F2FE",
  },
  Magnesium: {
    symbol: "Mg²⁺",
    icon: "leaf-outline",
    unit: "mg/dL",
    color: "#065F46",
    tint: "#ECFDF5",
  },
};

// ── RECOMMENDATION CONFIG ──
const getRec = (type, statusType) => {
  const config = {
    Potassium: {
      low: {
        icon: "nutrition-outline",
        title: "Increase Intake",
        body: "Add bananas, apricots, and spinach to your diet. Pumpkin & sunflower seeds help restore levels naturally.",
      },
      high: {
        icon: "remove-circle-outline",
        title: "Reduce Intake",
        body: "Limit bananas, potatoes and high-potassium seeds temporarily. Increase daily water intake.",
      },
      normal: {
        icon: "checkmark-circle-outline",
        title: "Keep It Up",
        body: "Continue a balanced diet with a variety of seeds to maintain these healthy levels.",
      },
      critical: {
        icon: "warning-outline",
        title: "Urgent Attention Needed",
        body: "Your potassium is at a critical level. Seek medical care immediately — this can affect heart rhythm.",
      },
    },
    Calcium: {
      low: {
        icon: "nutrition-outline",
        title: "Increase Intake",
        body: "Include milk, yogurt, and fortified cereals. Chia & sesame seeds are excellent natural sources.",
      },
      high: {
        icon: "remove-circle-outline",
        title: "Reduce Intake",
        body: "Limit dairy products and calcium supplements. Avoid excessive seed consumption temporarily.",
      },
      normal: {
        icon: "checkmark-circle-outline",
        title: "Keep It Up",
        body: "Your calcium is well-balanced. Maintain a varied diet to keep bones and heart healthy.",
      },
      critical: {
        icon: "warning-outline",
        title: "Urgent Attention Needed",
        body: "Critical calcium levels can cause muscle spasms or cardiac issues. Please seek immediate care.",
      },
    },
    Magnesium: {
      low: {
        icon: "nutrition-outline",
        title: "Increase Intake",
        body: "Incorporate whole grains and leafy greens. Flax (alsi) & hemp seeds are ideal natural sources.",
      },
      high: {
        icon: "remove-circle-outline",
        title: "Reduce Intake",
        body: "Limit nuts, seeds, and dark chocolate temporarily. Stay hydrated throughout the day.",
      },
      normal: {
        icon: "checkmark-circle-outline",
        title: "Keep It Up",
        body: "Magnesium levels are healthy. Continue current dietary habits and stay active.",
      },
      critical: {
        icon: "warning-outline",
        title: "Urgent Attention Needed",
        body: "Severe magnesium imbalance affects nerve and muscle function. Contact a doctor immediately.",
      },
    },
  };
  return config[type]?.[statusType] || null;
};

const REC_STYLES = {
  normal: { bg: C.normalBg, border: C.normalBorder, color: C.normalText },
  low: { bg: C.lowBg, border: C.lowBorder, color: C.lowText },
  high: { bg: C.highBg, border: C.highBorder, color: C.highText },
  critical: { bg: C.criticalBg, border: C.criticalBorder, color: C.criticalText },
};

// ── RANGE BAR ──
const RangeBar = ({ value, range, statusType }) => {
  const match = range?.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  if (!match || !value) return null;
  const lo = parseFloat(match[1]);
  const hi = parseFloat(match[2]);
  const v = parseFloat(value);
  const pct = Math.min(Math.max(((v - lo) / (hi - lo)) * 100, 0), 100);
  const barColor =
    statusType === "normal" ? C.normalIcon : C.criticalText;

  return (
    <View style={bar.wrap}>
      <View style={bar.labels}>
        <Text style={bar.lText}>{match[1]}</Text>
        <Text style={bar.lText}>{match[2]}</Text>
      </View>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
        <View style={[bar.cursor, { left: `${pct}%`, borderColor: barColor }]} />
      </View>
    </View>
  );
};
const bar = StyleSheet.create({
  wrap: { marginTop: 12 },
  labels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  lText: { fontSize: 10, color: C.textMuted, fontWeight: "500" },
  track: { height: 4, backgroundColor: "#F1F5F9", borderRadius: 4, position: "relative", overflow: "visible" },
  fill: { height: 4, borderRadius: 4, position: "absolute", top: 0, left: 0 },
  cursor: { position: "absolute", top: -5, width: 14, height: 14, borderRadius: 7, backgroundColor: C.surface, borderWidth: 2, marginLeft: -7 },
});

// ── ELECTROLYTE CARD ──
const ElectrolyteCard = ({ name, data, delay }) => {
  const meta = ELECTROLYTE_META[name];
  const status = getStatusMeta(data?.Level);
  const rec = getRec(name, status.type);
  const recStyle = REC_STYLES[status.type] || REC_STYLES.normal;
  const isCritical = status.type === "critical";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 430, delay }}
      style={styles.card}
    >
      {/* Card Header Row */}
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconWrap, { backgroundColor: meta.tint }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>
        <View style={styles.cardHeaderMid}>
          <Text style={styles.cardName}>{name}</Text>
          <Text style={[styles.cardSymbol, { color: meta.color }]}>{meta.symbol}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <Text style={[styles.cardValue, { color: status.type === "pending" ? C.textMuted : C.textPrimary }]}>
            {data?.Value || "—"}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Range Bar */}
      {data?.Range ? (
        <>
          <Text style={styles.rangeLabel}>Reference: {data.Range}</Text>
          <RangeBar value={data?.Value} range={data?.Range} statusType={status.type} />
        </>
      ) : (
        <Text style={styles.rangeLabel}>No reference range available</Text>
      )}

      {/* Recommendation */}
      {rec && (
        <View style={[styles.recBox, { backgroundColor: recStyle.bg, borderColor: recStyle.border }]}>
          <View style={[styles.recIconWrap, { backgroundColor: recStyle.color + "18" }]}>
            <Ionicons name={rec.icon} size={16} color={recStyle.color} />
          </View>
          <View style={styles.recContent}>
            <Text style={[styles.recTitle, { color: recStyle.color }]}>{rec.title}</Text>
            <Text style={[styles.recBody, { color: recStyle.color + "CC" }]}>{rec.body}</Text>
          </View>
        </View>
      )}

      {/* Emergency Button */}
      {isCritical && (
        <TouchableOpacity
          style={styles.emergencyBtn}
          onPress={() => Linking.openURL("tel:1122")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#B91C1C", "#7F1D1D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.emergencyGrad}
          >
            <View style={styles.emergencyIconWrap}>
              <Ionicons name="call" size={16} color="#fff" />
            </View>
            <View>
              <Text style={styles.emergencyTitle}>Emergency Services</Text>
              <Text style={styles.emergencySub}>Tap to call 1122 immediately</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" style={{ marginLeft: "auto" }} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </MotiView>
  );
};

// ── MAIN SCREEN ──
export default function ElectrolytesScreen({ navigation }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return setLoading(false);
    const resRef = ref(db, `users/${user.uid}/latest_results`);
    const unsub = onValue(resRef, (snap) => {
      if (snap.exists()) setResults(snap.val());
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const criticalCount = results
    ? ["Potassium", "Calcium", "Magnesium"].filter((k) =>
        getStatusMeta(results[k]?.Level).type === "critical"
      ).length
    : 0;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Electrolytes</Text>
          <Text style={styles.headerSub}>Detailed analysis</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={C.crimson} />
          <Text style={styles.loaderText}>Loading results…</Text>
        </View>
      ) : !results ? (
        <View style={styles.loaderWrap}>
          <Ionicons name="flask-outline" size={48} color={C.border} />
          <Text style={styles.loaderText}>No data available</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── CRITICAL BANNER ── */}
          {criticalCount > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: -8 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.criticalBanner}
            >
              <View style={styles.criticalBannerIcon}>
                <Ionicons name="warning" size={18} color={C.criticalText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.criticalBannerTitle}>
                  {criticalCount} Critical Result{criticalCount > 1 ? "s" : ""}
                </Text>
                <Text style={styles.criticalBannerSub}>
                  Please seek medical attention as soon as possible.
                </Text>
              </View>
            </MotiView>
          )}

          {/* ── SECTION LABEL ── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Markers</Text>
            <Text style={styles.sectionCount}>3 electrolytes</Text>
          </View>

          {/* ── CARDS ── */}
          {["Potassium", "Calcium", "Magnesium"].map((name, i) => (
            <ElectrolyteCard
              key={name}
              name={name}
              data={results[name]}
              delay={i * 70}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── STYLES ──
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

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
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.textPrimary, letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: C.textMuted, fontWeight: "500", marginTop: 1 },

  loaderWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 14 },
  loaderText: { fontSize: 14, color: C.textMuted, fontWeight: "500" },

  scrollContent: { padding: 18, paddingBottom: 50 },

  // Critical banner
  criticalBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.criticalBg,
    borderWidth: 1,
    borderColor: C.criticalBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  criticalBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
  },
  criticalBannerTitle: { fontSize: 14, fontWeight: "700", color: C.criticalText },
  criticalBannerSub: { fontSize: 12, color: C.criticalText + "AA", fontWeight: "500", marginTop: 2 },

  // Section
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionCount: { fontSize: 11, fontWeight: "600", color: C.textMuted },

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardHeaderMid: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "700", color: C.textPrimary, letterSpacing: -0.2 },
  cardSymbol: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  cardHeaderRight: { alignItems: "flex-end", gap: 6 },
  cardValue: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },

  divider: { height: 1, backgroundColor: C.border, marginBottom: 12 },

  rangeLabel: { fontSize: 11, color: C.textMuted, fontWeight: "500" },

  // Recommendation box
  recBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 14,
  },
  recIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  recContent: { flex: 1 },
  recTitle: { fontSize: 13, fontWeight: "700", marginBottom: 3 },
  recBody: { fontSize: 12, lineHeight: 18, fontWeight: "400" },

  // Emergency button
  emergencyBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 14,
  },
  emergencyGrad: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  emergencyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyTitle: { fontSize: 14, fontWeight: "700", color: "#fff" },
  emergencySub: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: "500", marginTop: 1 },
});