import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { auth } from "../firebase";

export default function RecordECGButton({ esp32IP }) {
  const [loading, setLoading] = useState(false);

  const recordECG = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://${esp32IP}/ecg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          duration: 5, // seconds of ECG capture
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "ECG captured and uploaded!");
      } else {
        Alert.alert("Error", "Failed to send request to ESP32");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not connect to ESP32");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, loading && { backgroundColor: "#999" }]}
      onPress={recordECG}
      disabled={loading}
    >
      <Text style={styles.text}>{loading ? "Recording..." : "Record ECG"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#B22222",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
