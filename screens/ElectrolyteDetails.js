import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Electrolyte Details</Text>

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
 // Change this target as needed
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 60, // give space below the button
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 40,
    color: "#B22222",
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
    backgroundColor: "#B22222", // Deep red accent
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
