import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ElectrolytesScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#B22222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Electrolyte Imbalance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subHeading}>Current Electrolyte Levels</Text>

        {/* 🧂 Potassium Card */}
        <View style={[styles.card, { backgroundColor: "#D6F5E1" }]}>
          <Text style={styles.label}>🧂 Potassium (K⁺)</Text>
          <Text style={styles.value}>4.1 mmol/L</Text>
          <Text style={styles.status}>Normal</Text>
        </View>

        {/* 🧪 Calcium Card */}
        <View style={[styles.card, { backgroundColor: "#FDE2E4" }]}>
          <Text style={styles.label}>🧪 Calcium (Ca²⁺)</Text>
          <Text style={styles.value}>9.3 mg/dL</Text>
          <Text style={styles.status}>Normal</Text>
        </View>

        {/* ⚗️ Magnesium Card */}
        <View style={[styles.card, { backgroundColor: "#FFF9C4" }]}>
          <Text style={styles.label}>⚗️ Magnesium (Mg²⁺)</Text>
          <Text style={styles.value}>2.0 mg/dL</Text>
          <Text style={styles.status}>Slightly Low</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    elevation: 3,
  },
  backButton: { padding: 6, marginRight: 10 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#B22222" },
  content: { padding: 20 },
  subHeading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginBottom: 15,
  },
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  label: { fontSize: 16, color: "#B22222", fontWeight: "600" },
  value: { fontSize: 18, fontWeight: "700", marginTop: 5, color: "#333" },
  status: { fontSize: 14, color: "#444", marginTop: 5 },
});
