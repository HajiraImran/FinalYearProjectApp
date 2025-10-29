import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2; // Two cards per row with padding

export default function HomeScreen({ navigation }) {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // No manual navigation needed; App.js handles auth state
    } catch (err) {
      console.log("Logout Error:", err.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingVertical: 20 }}>
      {/* Greeting with Separator */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Hello,</Text>
        <Text style={styles.greetingName}>{user?.displayName || "User"}</Text>
        <View style={styles.separator} />
      </View>

      {/* Action Cards */}
      <View style={styles.cardGrid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("ECG")}
        >
          <Ionicons name="pulse" size={40} color="#B22222" />
          <Text style={styles.cardText}>Check ECG</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Electrolytes")}
        >
          <Ionicons name="flask" size={40} color="#B22222" />
          <Text style={styles.cardText}>Electrolytes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("About")}
        >
          <Ionicons name="information-circle" size={40} color="#B22222" />
          <Text style={styles.cardText}>About App</Text>
        </TouchableOpacity>
      </View>

      {/* Graph / Stats Card */}
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>ECG Trends</Text>
        <View style={styles.graphPlaceholder}>
          <Text style={{ color: "#aaa" }}>Graph / Stats Placeholder</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 20,
  },
  greetingContainer: {
    marginBottom: 20,
    marginTop: 40,
  },
  greeting: {
    fontSize: 18,
    color: "#555",
  },
  greetingName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#B22222",
    marginTop: 4,
  },
  separator: {
    height: 2,
    backgroundColor: "#ccc",
    width: "100%",
    marginVertical: 15,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 25,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#B22222",
    textAlign: "center",
  },
  graphCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B22222",
    marginBottom: 12,
  },
  graphPlaceholder: {
    height: 150,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#B22222",
    paddingVertical: 14,
    paddingHorizontal: 80,
    borderRadius: 50,
    marginBottom: 30,
    alignSelf: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
