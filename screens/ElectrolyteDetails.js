import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ElectrolyteDetails({ navigation }) {
  const electrolytes = [
    {
      name: "Potassium (K⁺)",
      info: "Helps regulate heartbeat, muscle contractions, and nerve signals. Imbalance can lead to irregular heart rhythms.",
      color: "#E0FFF5", // very light sea green
    },
    {
      name: "Calcium (Ca²⁺)",
      info: "Essential for strong bones and teeth, supports heart contractions, and helps blood clotting and muscle function.",
      color: "#FFE6EB", // soft light pink
    },
    {
      name: "Magnesium (Mg²⁺)",
      info: "Supports muscle and nerve function, regulates blood pressure, and helps maintain heart rhythm.",
      color: "#FFFDE0", // soft lemon yellow
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🔙 Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#B22222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Electrolyte Details</Text>
      </View>

      {/* 🔹 Scroll Content */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {electrolytes.map((item, index) => (
          <View key={index} style={[styles.card, { backgroundColor: item.color }]}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardText}>{item.info}</Text>
          </View>
        ))}

        {/* ✅ Get Started Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CheckECG")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#B22222",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    paddingBottom: 80,
  },
  card: {
    width: "100%",
    padding: 18,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#222",
  },
  cardText: {
    fontSize: 16,
    color: "#333",
    textAlign: "justify",
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#B22222",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 40,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
});
