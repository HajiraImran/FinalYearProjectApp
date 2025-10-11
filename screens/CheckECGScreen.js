import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function CheckECGScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Main Heading */}
      <Text style={styles.mainHeading}>Electrolyte Imbalance</Text>

      {/* Top Section with Images */}
      <View style={styles.topSection}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/12rms.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.imageText}>Ensure your ECG device is ready.</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/ecg222.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.imageText}>Place ECG sensors correctly.</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.heading}>Right Arm</Text>
        <Text style={styles.description}>
          Place the electrode on the right arm.
        </Text>

        <Text style={styles.heading}>Left Arm</Text>
        <Text style={styles.description}>
          Place the electrode on the inside of the left upper arm, mirroring the
          position on the right arm.
        </Text>

        <Text style={styles.heading}>Right / Left Leg</Text>
        <Text style={styles.description}>
          Place the electrode on the lower part of the right or left leg, just
          above the ankle.
        </Text>
      </View>

      {/* Red Warning */}
      <Text style={styles.warning}>Stay still while recording</Text>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ElectrolyteDetails")}
      >
        <Text style={styles.buttonText}>Check Electrolyte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 30, // keeps balanced spacing
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#B22222",
    marginTop: 70, // 👈 heading moved slightly down
    marginBottom: 10,
    textAlign: "center",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    width: "100%",
    marginTop: 20,
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: "center",
    width: "45%",
  },
  image: {
    width: 130,
    height: 110,
    marginBottom: 20,
  },
  imageText: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
  instructionsContainer: {
    width: "100%",
    marginTop: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "900",
    color: "#B22222",
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
    textAlign: "justify",
    marginTop: 2,
  },
  warning: {
    fontSize: 20,
    fontWeight: "700",
    color: "#B22222",
    textAlign: "center",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#B22222",
    paddingVertical: 12,
    borderRadius: 40,
    alignItems: "center",
    width: "85%",
    marginBottom: 60, // 👈 button moved slightly up
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
