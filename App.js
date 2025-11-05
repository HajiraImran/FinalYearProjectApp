import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";



// Screens
import SplashScreen from "./screens/SplashScreen";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetSuccessScreen from "./screens/ResetSuccessScreen";
import AboutScreen from "./screens/AboutScreen";
import ElectrolyteDetails from "./screens/ElectrolyteDetails";
import CheckECGScreen from "./screens/CheckECGScreen";
import HomeScreen from "./screens/HomeScreen";
import ECGScreen from "./screens/ECGScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ElectrolytesScreen from "./screens/ElectrolytesScreen"; // ✅ add this line






const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Bottom Tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "About") iconName = "information-circle";
          else if (route.name === "ECG") iconName = "pulse";
          else if (route.name === "Electrolytes") iconName = "flask";
          else if (route.name === "Profile") iconName = "person-circle";
           

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#B22222",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
      <Tab.Screen name="Electrolytes" component={CheckECGScreen} />
      <Tab.Screen name="ECG" component={ECGScreen} /> 
      {/* You can choose which screen shows under this tab */}
      <Tab.Screen name="Profile" component={ProfileScreen} /> 
      
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#B22222" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetSuccess" component={ResetSuccessScreen} />
            
          </>
        ) : (
          <>
            {/* ✅ Main tabs */}
            <Stack.Screen name="MainTabs" component={MainTabs} />
            {/* ✅ Stack screens for navigation from buttons */}
            <Stack.Screen name="ElectrolyteDetails" component={ElectrolyteDetails} />
            <Stack.Screen name="ElectrolytesScreen" component={ElectrolytesScreen} />
            <Stack.Screen name="CheckECG" component={CheckECGScreen} />
            <Stack.Screen name="ECGScreen" component={ECGScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
