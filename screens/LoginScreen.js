import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Sign in the user with Firebase Auth
      await signInWithEmailAndPassword(auth, email.trim(), password);

      // ✅ Inform App.js that login was successful
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      Alert.alert("Login Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ✅ Top Image */}
        <Image
          source={require("../assets/ECGS.png")}
          style={styles.topImage}
          resizeMode="contain"
        />

        {/* ✅ Title */}
        <Text style={styles.title}>Login</Text>

        {/* ✅ Inputs */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        {/* ✅ Button */}
        {loading ? (
          <ActivityIndicator size="large" color="#B22222" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}

        {/* ✅ Link to Register */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 12 }}
        >
          <Text style={{ color: "#555" }}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  topImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    marginTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 20,
    color: "#B22222",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 40,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#B22222",
    padding: 14,
    borderRadius: 40,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
