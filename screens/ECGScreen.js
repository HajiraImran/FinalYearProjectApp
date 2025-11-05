// screens/ECGScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { auth, db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width - 40;

export default function ECGScreen() {
  const [ecgData, setEcgData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userId = currentUser.uid;
    const ecgRef = ref(db, `users/${userId}/ecg_data`);

    const unsubscribe = onValue(ecgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const latest = Object.values(data)
          .sort((a, b) => a.timestamp - b.timestamp)
          .pop();

        if (latest && latest.values) setEcgData(latest.values);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <LinearGradient
      colors={["#fff", "#f7f7f7"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="pulse-outline" size={28} color="#B22222" />
          <Text style={styles.title}>ECG Analysis</Text>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#B22222" />
            <Text style={styles.loadingText}>Fetching your latest ECG...</Text>
          </View>
        ) : ecgData.length === 0 ? (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 700 }}
            style={styles.noDataCard}
          >
            <Ionicons name="alert-circle-outline" size={40} color="#B22222" />
            <Text style={styles.noDataText}>No ECG data available</Text>
            <Text style={styles.noDataSubtext}>
              Start recording from your device to view ECG results here.
            </Text>
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 800 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Latest ECG Graph</Text>
            <LineChart
              data={{
                labels: [],
                datasets: [{ data: ecgData }],
              }}
              width={screenWidth}
              height={250}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(178,34,34,${opacity})`,
                labelColor: () => "#333",
                propsForDots: { r: "0" },
              }}
              bezier
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              style={styles.chart}
            />
          </MotiView>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#B22222",
    marginLeft: 10,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  loadingText: {
    color: "#777",
    fontSize: 15,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    elevation: 5,
    shadowColor: "#B22222",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B22222",
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  noDataCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#B22222",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginTop: 60,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B22222",
    marginTop: 10,
  },
  noDataSubtext: {
    color: "#555",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    width: "85%",
  },
});
