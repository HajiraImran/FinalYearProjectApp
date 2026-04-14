import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { auth } from "../firebase";
import { useNavigation } from "@react-navigation/native"; // Navigation ke liye

export default function RecordECGButton({ esp32IP }) {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const recordECG = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    if (!esp32IP) {
      Alert.alert("Error", "ESP32 IP address not found");
      return;
    }

    setLoading(true);

    try {
      // 👉 ESP32 code ke mutabiq GET request aur /capture use karna hai
      // URL: http://192.168.0.108/capture?uid=TnY3...
      const response = await fetch(`http://${esp32IP}/capture?uid=${currentUser.uid}`, {
        method: "GET", 
      });

      const text = await response.text();

      if (response.ok) {
        Alert.alert(
          "Success ✅",
          "ECG Recorded. Processing results...",
          [
            { 
              text: "View History", 
              onPress: () => navigation.navigate("History") // Result dekhne ke liye navigate karein
            }
          ]
        );
        console.log("ESP32 response:", text);
      } else {
        Alert.alert("ESP32 Error", text || "Request failed");
      }

    } catch (error) {
      console.log("Fetch Error:", error);
      Alert.alert(
        "Connection Failed", 
        "Make sure your phone and ESP32 are on the same WiFi (TP-Link_A870)"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.disabled]}
      onPress={recordECG}
      disabled={loading}
    >
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color="#fff" size="small" />
          <Text style={styles.text}> Recording... (5s)</Text>
        </View>
      ) : (
        <Text style={styles.text}>Start ECG Scan</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#B22222",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
    marginVertical: 15,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabled: {
    backgroundColor: "#d3d3d3",
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
});