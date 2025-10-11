import React from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';


export default function SplashScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.appName}>Trilyte</Text>
      </View>

      <View style={styles.middle}>
        <Text style={styles.quote}>Detect Electrolyte Imbalance with ECG.</Text>
        <Image source={require("../assets/Hearts.png")} style={styles.heart} resizeMode="contain" />
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, justifyContent:"space-between", alignItems:"center", padding:20},
  top: {marginTop:20},
  appName: {fontSize:70, fontWeight:"100", color: "#B22222"},
  middle: {alignItems:"center", width:"100%"},
  quote: {fontSize:22, marginBottom:20, textAlign:"center", color:"black"},
  heart: {width:180, height:180},
  bottom: {width:"100%", marginBottom:40},
  button: {backgroundColor:"#B22222", padding:14, borderRadius:40, alignItems:"center"},
  buttonText: {color:"#fff", fontWeight:"600", fontSize:16}
});