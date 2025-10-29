import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function ResetSuccessScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/ECGS.png")} // Replace with your own image (like a checkmark)
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.heading}>Password Reset Email Sent ✅</Text>
      <Text style={styles.subtext}>
        We have sent a password reset link to your email. 
        Please check your inbox (or spam folder) and follow the link to update your password.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("Login")}
      >
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#B22222",
    marginBottom: 10,
    textAlign: "center",
  },
  subtext: {
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#B22222",
    padding: 14,
    borderRadius: 40,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
