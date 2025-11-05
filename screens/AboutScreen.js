import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

export default function AboutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* 🔹 Header with Back Button and Title */}
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
        <Image
          source={require("../assets/ECGS.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.subHeading}>Detect Imbalances</Text>

        <Text style={styles.description}>
          Trilyte is a non-invasive, real-time monitoring system that uses ECG
          signals to detect potassium, calcium, and magnesium imbalances.
        </Text>
        <Text style={styles.description}>
          It provides accurate, real-time insights into electrolyte levels
          without the need for invasive blood tests.
        </Text>
        <Text style={styles.description}>
          Trilyte’s portable and user-friendly design makes it suitable for use
          in hospitals, clinics, and home healthcare environments.
        </Text>
      </ScrollView>

      {/* 🔹 Fixed Bottom Button */}
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 700 }}
        style={styles.fixedButtonContainer}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("ElectrolyteDetails")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Details</Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
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

  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 100, // space for button
  },
  image: {
    width: 220,
    height: 220,
    marginTop: 15,
  },
  subHeading: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    color: "#555",
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    textAlign: "justify",
    width: "100%",
    marginTop: 15,
    lineHeight: 25,
    color: "#333",
  },

  // 🔹 Fixed Bottom Button
  fixedButtonContainer: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    width: "90%",
  },
  button: {
    backgroundColor: "#B22222",
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: "center",
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
