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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons"; // Feather add kiya camera icon ke liye
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../firebase"; // Ensure db is imported if needed
import { signOut, onAuthStateChanged, updateProfile } from "firebase/auth";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

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

  // 📸 Image Picker Function
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Gallery access is required to change profile picture.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUploading(true);
      try {
        // Firebase update logic
        await updateProfile(auth.currentUser, { photoURL: result.assets[0].uri });
        setUser({ ...auth.currentUser, photoURL: result.assets[0].uri });
        Alert.alert("Success", "Profile picture updated!");
      } catch (error) {
        Alert.alert("Error", "Failed to update image.");
      } finally {
        setImageUploading(false);
      }
    }
  };

  const toggleEdit = () => {
    setEditing(!editing);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
          try { await signOut(auth); } catch (e) { console.log(e); }
        }
      },
    ]);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.mainContainer}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
            <View style={styles.avatarWrapper}>
              <Image
                source={user?.photoURL ? { uri: user.photoURL } : require("../assets/profile.png")}
                style={styles.avatar}
              />
              {/* 📸 Floating Camera Button */}
              <View style={styles.cameraIconContainer}>
                {imageUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="camera" size={16} color="#fff" />
                )}
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.displayName || "New User"}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* Profile Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Account Settings</Text>
            <TouchableOpacity onPress={editing ? handleSave : toggleEdit}>
              {loading ? (
                <ActivityIndicator size="small" color="#B22222" />
              ) : (
                <Text style={styles.editLink}>{editing ? "Save" : "Edit"}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[styles.inputWrapper, !editing && styles.inputDisabled]}>
              <Ionicons name="person-outline" size={18} color="#666" style={styles.icon} />
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                editable={editing} 
                placeholder="Name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, styles.inputDisabled]}>
              <Ionicons name="mail-outline" size={18} color="#666" style={styles.icon} />
              <TextInput 
                style={styles.input} 
                value={email} 
                editable={false} 
                color="#666" 
              />
              <MaterialIcons name="lock-outline" size={16} color="#999" />
            </View>
          </View>
        </Animated.View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.logoutWrapper} 
          onPress={handleLogout} 
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#B22222", "#800000", "#4D0000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="logout" size={20} color="#fff" />
              <Text style={styles.buttonText}>Sign Out</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.4</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: "center", marginTop: 50, marginBottom: 30 },
  avatarWrapper: { 
    elevation: 8, 
    shadowColor: "#000", 
    shadowOpacity: 0.2, 
    shadowRadius: 10,
    position: 'relative' // Camera icon ke liye zaroori hai
  },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: "#fff" },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#B22222',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 5,
  },
  userName: { fontSize: 24, fontWeight: "800", color: "#1F2937", marginTop: 15 },
  userEmail: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 24, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#374151" },
  editLink: { color: "#B22222", fontWeight: "700", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 16 },
  inputDisabled: { backgroundColor: "#F3F4F6", borderColor: "#F3F4F6" },
  icon: { marginRight: 12 },
  input: { flex: 1, height: 50, fontSize: 16, color: "#111827" },
  logoutWrapper: { marginTop: 30 },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 10 },
  versionText: { textAlign: "center", color: "#D1D5DB", fontSize: 12, marginTop: 30 },
});