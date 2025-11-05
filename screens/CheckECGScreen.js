import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MotiView, MotiText } from "moti";
import { Ionicons } from "@expo/vector-icons";

export default function CheckECGScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* 🔹 Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#B22222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Electrolyte Imbalance</Text>
      </View>

      {/* 🔹 Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, duration: 600 }}
          style={styles.topSection}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/12rms.png")}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.imageText}>
              Ensure your ECG device is ready.
            </Text>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/ecg222.png")}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.imageText}>Place ECG sensors correctly.</Text>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, duration: 700 }}
          style={styles.instructionsContainer}
        >
          <Text style={styles.heading}>Right Arm</Text>
          <Text style={styles.description}>
            Place the electrode on the right arm.
          </Text>

          <Text style={styles.heading}>Left Arm</Text>
          <Text style={styles.description}>
            Place the electrode on the inside of the left upper arm, mirroring
            the position on the right arm.
          </Text>

          <Text style={styles.heading}>Right / Left Leg</Text>
          <Text style={styles.description}>
            Place the electrode on the lower part of the right or left leg, just
            above the ankle.
          </Text>
        </MotiView>

        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 800, duration: 800, type: "timing" }}
          style={styles.warning}
        >
          ⚠️ Stay still while recording
        </MotiText>

        {/* ✅ Button moved inside ScrollView for natural placement */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 1000, duration: 600, type: "timing" }}
          style={{ width: "100%", marginTop: 30, marginBottom: 40 }}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ElectrolytesScreen")}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Check Electrolyte</Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
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

  // ScrollView Content
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40, // ✅ reduced padding
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    marginBottom: 30,
  },
  imageContainer: {
    alignItems: "center",
    width: "45%",
  },
  image: {
    width: 130,
    height: 110,
    marginBottom: 15,
  },
  imageText: {
    fontSize: 13,
    color: "#444",
    textAlign: "center",
  },
  instructionsContainer: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 14,
    padding: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    marginBottom: 20,
  },
  heading: {
    fontSize: 17,
    fontWeight: "700",
    color: "#B22222",
    marginTop: 10,
  },
  description: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    textAlign: "justify",
    marginTop: 2,
  },
  warning: {
    fontSize: 15,
    fontWeight: "700",
    color: "#B22222",
    textAlign: "center",
    marginTop: 10,
  },

  // ✅ Button styling
  button: {
    backgroundColor: "#B22222",
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: "center",
    width: "100%",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 17,
    letterSpacing: 0.5,
  },
});
