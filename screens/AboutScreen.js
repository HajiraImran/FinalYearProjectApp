import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";

export default function AboutScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* ECG Image */}
      <Image
        source={require("../assets/ECGS.png")} // Replace later
        style={styles.image}
        resizeMode="contain"
      />

      {/* Main Heading */}
      <Text style={styles.heading}>Electrolyte Imbalance</Text>

      {/* Subheading */}
      <Text style={styles.subHeading}>Detect Imbalances</Text>

      {/* Description (Left aligned) */}
      <Text style={styles.description}>
        Trilyte is a non-invasive, real-time monitoring system that uses ECG signals to detect potassium, calcium, and magnesium imbalances.Trilyte aims to assist clinicians and patients by offering accurate, real-time insights into electrolyte levels without the need for invasive blood tests.
Its portable and user-friendly design makes it suitable for use in hospitals, clinics, and home healthcare settings.
      </Text>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ElectrolyteDetails")}
      >
        <Text style={styles.buttonText}>Get Details</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  image: {
    width: 220,
    height: 220,
    marginTop: 30,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
    color: "#B22222",
  },
  subHeading: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    color: "#555",
  },
  description: {
  fontSize: 18,
  textAlign: "justify", // 👈 This is the key
  width: "100%",
  marginTop: 20,
  lineHeight: 26,
  color: "#333",
},

  button: {
    backgroundColor: "#B22222",
    padding: 14,
    borderRadius: 50,
    alignItems: "center",
    width: "100%",
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
