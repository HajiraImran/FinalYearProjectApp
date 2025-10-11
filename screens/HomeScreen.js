import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function HomeScreen() {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.displayName || user?.email}</Text>
      <Text style={{marginTop:8,color:"#555"}}>Email: {user?.email}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={{color:"#fff", fontWeight:"600"}}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, justifyContent:"center", alignItems:"center", padding:20},
  welcome:{fontSize:22, fontWeight:"700"},
  button:{marginTop:30, backgroundColor:"#ff4d4d", padding:12, borderRadius:8}
});
