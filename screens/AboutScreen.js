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
import { LinearGradient } from "expo-linear-gradient";

export default function ElectrolyteScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Scroll Content */}
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
          Its portable and user-friendly design makes it suitable for hospitals,
          clinics, and home healthcare environments.
        </Text>
      </ScrollView>

      {/* 🔹 Fixed Bottom Button with Maroon Gradient */}
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 700 }}
        style={styles.fixedButtonContainer}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("ElectrolyteDetails")}
          activeOpacity={0.85}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            // Maroon Gradient Colors: Light Maroon to Deep Maroon
            colors={["#B22222", "#800000", "#4D0000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Get Details</Text>
          </LinearGradient>
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
    paddingBottom: 12,
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
    paddingBottom: 100, 
  },

  image: {
    width: 230,
    height: 230,
    marginTop: 20,
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
    lineHeight: 24,
    color: "#333",
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    width: "90%",
  },
  buttonWrapper: {
    borderRadius: 40,
    overflow: "hidden", 
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 0.8,
  },
});