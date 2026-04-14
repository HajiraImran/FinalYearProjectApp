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
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { ref, onValue, off, get } from "firebase/database";
import { auth, db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, MotiText } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {  
  const [user, setUser] = useState(null);
  const [latestECG, setLatestECG] = useState(null);
  const [latestResults, setLatestResults] = useState(null);
  const [isEspOnline, setIsEspOnline] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // New Loading State

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchLatestData(u.uid);
        checkDeviceStatus();
      }
    });
    return unsubscribe;
  }, []);

  const checkDeviceStatus = () => {
    const statusRef = ref(db, "esp32_status/ip");
    onValue(statusRef, (snapshot) => {
      setIsEspOnline(snapshot.exists());
    });
  };

  const fetchLatestData = (uid) => {
    const ecgRef = ref(db, `users/${uid}/ecg_data`);
    onValue(ecgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setLatestECG(entries[0]);
      }
    });

    const resRef = ref(db, `users/${uid}/latest_results`);
    onValue(resRef, (snapshot) => {
      if (snapshot.exists()) {
        setLatestResults(snapshot.val());
      }
    });

    return () => {
      off(ecgRef);
      off(resRef);
    };
  };

  // 🔥 INSTANT RECORD LOGIC
  const handleRecordECG = async () => {
    if (!user || isRecording) return;

    // 1. Instant Connection Check
    if (!isEspOnline) {
      Alert.alert("Device Offline", "Check your ECG device connection and try again.");
      return;
    }

    setIsRecording(true); // Start Spinner

    try {
      const snapshot = await get(ref(db, "esp32_status/ip"));
      const ip = snapshot.val();

      if (ip) {
        // Instant Alert after confirming IP exists
        Alert.alert("Action Sent", "ECG recording has been triggered on your device.");
        
        // Background request to ESP32
        const response = await fetch(`http://${ip}/capture?uid=${user.uid}`);
        if (!response.ok) throw new Error("ESP32 Busy");
      }
    } catch (err) {
      Alert.alert("Connection Error", "Device is online but could not be reached via local IP.");
    } finally {
      setIsRecording(false); // Stop Spinner
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "--:--";
    let correctedTs = ts;
    if (ts < 1000000000) correctedTs = ts + 946684800; 
    const date = new Date(correctedTs * (correctedTs < 10000000000 ? 1000 : 1));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={["#F0F4F8", "#FFFFFF"]} style={StyleSheet.absoluteFill} />

      {/* Header Bar */}
      <View style={styles.topHeader}>
        <Text style={styles.brandText}>Tri<Text style={styles.brandBold}>lyte</Text></Text>
        <TouchableOpacity onPress={() => signOut(auth)}>
          <Ionicons name="person-circle" size={38} color="#B22222" />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.greetingSection}>
          <MotiText from={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={styles.greeting}>Hello,</MotiText>
          <Text style={styles.userName}>{user?.displayName || "Patient"}</Text>
        </View>

        <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.statusBanner}>
          <View style={[styles.dot, { backgroundColor: isEspOnline ? "#4CAF50" : "#FF5252" }]} />
          <Text style={styles.statusText}>
            Device {isEspOnline ? "Connected" : "Disconnected"}
          </Text>
        </MotiView>

        <MotiView from={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 200 }} style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Latest Reading</Text>
            <Ionicons name="stats-chart" size={20} color="#B22222" />
          </View>

          {latestECG ? (
            <View>
              <LineChart
                data={{ datasets: [{ data: latestECG.values ? latestECG.values.slice(0, 80) : [0] }] }}
                width={width - 80}
                height={160}
                chartConfig={chartConfig}
                bezier
                withDots={false}
                style={styles.chart}
              />
              <View style={styles.statsRow}>
                <StatItem label="Timestamp" value={formatTimestamp(latestECG?.timestamp)} />
                <StatItem label="Samples" value={latestECG?.values?.length || 0} />
                <StatItem 
                   label="Status" 
                   value={latestResults?.Overall_Status ? String(latestResults.Overall_Status) : "Analyzing..."} 
                   color={latestResults?.Overall_Status === "Normal" ? "#4CAF50" : "#B22222"} 
                />
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="pulse" size={50} color="#DDD" />
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          )}
        </MotiView>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {/* ActionButton with Loading Logic */}
          <ActionButton 
            onPress={handleRecordECG} 
            icon="pulse-outline" 
            label="New Scan" 
            color="#B22222" 
            loading={isRecording} 
          />
          <ActionButton 
            onPress={() => navigation.navigate("History")} 
            icon="calendar-outline" 
            label="History" 
            color="#4A90E2" 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 🔥 Updated StatItem and ActionButton Components
const StatItem = ({ label, value, color = "#333" }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={styles.statLabel}>{label || ""}</Text>
    <Text style={[styles.statValue, { color }]}>{value ? String(value) : "--"}</Text>
  </View>
);

const ActionButton = ({ icon, label, onPress, color, loading }) => (
  <TouchableOpacity 
    style={[styles.gridBtn, loading && { opacity: 0.7 }]} 
    onPress={onPress}
    disabled={loading}
  >
    <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons name={icon} size={28} color={color} />
      )}
    </View>
    <Text style={styles.gridLabel}>{label}</Text>
  </TouchableOpacity>
);

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(178, 34, 34, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 0,
  propsForBackgroundLines: { strokeDasharray: "" },
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F0F4F8" },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8EE",
    elevation: 3,
    marginTop: 40,
  },
  brandText: { fontSize: 24, color: "#2C3E50" },
  brandBold: { fontWeight: "900", color: "#B22222" },
  greetingSection: { paddingHorizontal: 25, marginTop: 20, marginBottom: 15 },
  greeting: { fontSize: 16, color: "#7F8C8D", fontWeight: "500" },
  userName: { fontSize: 26, fontWeight: "800", color: "#2C3E50" },
  statusBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", alignSelf: "flex-start", marginHorizontal: 25, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: "#E1E8EE", marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 12, fontWeight: "600", color: "#7F8C8D" },
  mainCard: { backgroundColor: "#fff", marginHorizontal: 25, borderRadius: 24, padding: 20, elevation: 5 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#2C3E50" },
  chart: { marginVertical: 8, borderRadius: 16, marginLeft: -15 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: "#F0F4F8" },
  statLabel: { fontSize: 12, color: "#95A5A5", marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2C3E50", marginHorizontal: 25, marginTop: 30, marginBottom: 15 },
  actionGrid: { flexDirection: "row", paddingHorizontal: 25, justifyContent: "space-between" },
  gridBtn: { backgroundColor: "#fff", width: "47%", padding: 20, borderRadius: 20, alignItems: "center", elevation: 2 },
  iconBox: { padding: 12, borderRadius: 15, marginBottom: 10 },
  gridLabel: { fontWeight: "600", color: "#444" },
  emptyState: { height: 160, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#BDC3C7", marginTop: 10, fontWeight: "500" },
});