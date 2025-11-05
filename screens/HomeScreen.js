import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { ref, onValue, off, get } from "firebase/database";
import { auth, db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [latestECG, setLatestECG] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchLatestECG(u.uid);
    });
    return unsubscribe;
  }, []);

  const fetchLatestECG = (uid) => {
    const ecgRef = ref(db, `users/${uid}/ecg_data`);
    onValue(ecgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.values(data).sort(
          (a, b) => b.timestamp - a.timestamp
        );
        setLatestECG(entries[0]);
      } else setLatestECG(null);
    });
    return () => off(ecgRef);
  };

  const getESP32IP = async () => {
    try {
      const snapshot = await get(ref(db, "esp32_status/ip"));
      if (snapshot.exists()) return snapshot.val();
      Alert.alert("Error", "ESP32 IP not found in Firebase.");
      return null;
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to fetch ESP32 IP.");
      return null;
    }
  };

  const handleRecordECG = async () => {
    if (!user) return;
    try {
      const ESP32_IP = await getESP32IP();
      if (!ESP32_IP) return;

      const response = await fetch(`http://${ESP32_IP}/capture?uid=${user.uid}`);
      if (response.ok) {
        Alert.alert("Success", "ECG capture triggered.");
      } else {
        Alert.alert("Error", "Failed to trigger ECG capture.");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not connect to ESP32.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged Out", "You have been signed out successfully.");
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <LinearGradient colors={["#fff", "#f8f8f8"]} style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back,</Text>
            <Text style={styles.greetingName}>{user?.displayName || "User"}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={26} color="#B22222" />
          </TouchableOpacity>
        </View>

        {/* ECG Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.summaryCard}
        >
          {latestECG?.values?.length ? (
            <>
              <Text style={styles.summaryTitle}>Recent ECG Overview</Text>
              <Text style={styles.summaryText}>
                📅 {new Date(latestECG.timestamp).toLocaleString()}
              </Text>
              <Text style={styles.summaryText}>
                💓 Samples: {latestECG.values.length}
              </Text>
              <LineChart
                data={{ labels: [], datasets: [{ data: latestECG.values }] }}
                width={width - 60}
                height={120}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(178,34,34,${opacity})`,
                  propsForDots: { r: "0" },
                }}
                bezier
                withDots={false}
                withInnerLines={false}
                withOuterLines={false}
                style={{ borderRadius: 12, marginTop: 10 }}
              />
            </>
          ) : (
            <>
              <Text style={styles.summaryTitle}>No ECG Data Yet</Text>
              <Text style={styles.summaryText}>
                Record your first ECG to see the summary here.
              </Text>
            </>
          )}
        </MotiView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleRecordECG}>
            <Ionicons name="pulse-outline" size={22} color="#fff" />
            <Text style={styles.actionText}>Record ECG</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#555" }]}
          >
            <Ionicons name="time-outline" size={22} color="#fff" />
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
  },
  greeting: { fontSize: 16, color: "#777" },
  greetingName: { fontSize: 24, fontWeight: "700", color: "#B22222" },
  logoutIcon: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 8,
    elevation: 3,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#B22222",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginTop: 25,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B22222",
    marginBottom: 8,
  },
  summaryText: { fontSize: 15, color: "#333" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 35,
    paddingHorizontal: 10,
  },
  actionBtn: {
    backgroundColor: "#B22222",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    elevation: 3,
  },
  actionText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
});
