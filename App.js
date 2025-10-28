// App.js
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Screens
import SplashScreen from "./screens/SplashScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import AboutScreen from "./screens/AboutScreen";
import ElectrolyteDetails from "./screens/ElectrolyteDetails";
import CheckECGScreen from "./screens/CheckECGScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen"; // ✅ Added

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false); // track login event

  // ✅ Listen for Firebase authentication state
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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // 👇 Show this flow when user is NOT logged in
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLoginSuccess={() => setJustLoggedIn(true)} // ✅ Pass callback
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen} // ✅ Added Forgot Password screen
            />
          </>
        ) : justLoggedIn ? (
          // 👇 User just logged in → Go to About first
          <>
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen
              name="ElectrolyteDetails"
              component={ElectrolyteDetails}
            />
            <Stack.Screen name="CheckECG" component={CheckECGScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        ) : (
          // 👇 Already logged in before → Go directly to Home
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen
              name="ElectrolyteDetails"
              component={ElectrolyteDetails}
            />
            <Stack.Screen name="CheckECG" component={CheckECGScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}