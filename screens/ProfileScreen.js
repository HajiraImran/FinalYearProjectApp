import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
  Animated,
  Easing,
} from "react-native";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged, updateProfile } from "firebase/auth";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setName(u.displayName || "");
        setEmail(u.email || "");
      }
    });
    return unsubscribe;
  }, []);

  const toggleEdit = () => {
    Animated.timing(fadeAnim, {
      toValue: editing ? 1 : 0.8,
      duration: 250,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => setEditing(!editing));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged Out", "You have been signed out successfully.");
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a valid name.");
      return;
    }

    try {
      await updateProfile(auth.currentUser, { displayName: name });
      Alert.alert("✅ Updated", "Profile name updated successfully!");
      setEditing(false);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={
            user?.photoURL
              ? { uri: user.photoURL }
              : require("../assets/profile.png")
          }
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>

      {/* Title */}
      <Text style={styles.heading}>Profile Settings</Text>

      {/* Profile Info Card */}
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        {/* Full Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#888"
            />
          ) : (
            <Text style={styles.value}>{name || "Not set"}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email Address</Text>
          <Text style={[styles.value, { color: "#666" }]}>{email}</Text>
        </View>

        {/* Edit / Save Button */}
        {editing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>💾 Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={toggleEdit}>
            <Text style={styles.buttonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8F9FB",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 40, // slightly reduced top padding
    paddingHorizontal: 25,
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10, // closer to heading
    marginTop: 60, // moves avatar lower (fixes white space)
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: "#B22222",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#B22222",
    textAlign: "center",
    marginBottom: 25,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 5,
  },
  value: {
    fontSize: 17,
    color: "#111",
    paddingVertical: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#111",
  },
  editButton: {
    backgroundColor: "#B22222",
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: "center",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#2E8B57",
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#B22222",
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: "center",
    width: "100%",
    marginTop: 40,
    marginBottom: 30, // reduced to balance bottom space
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: "#B22222",
    fontSize: 16,
    fontWeight: "600",
  },
});
