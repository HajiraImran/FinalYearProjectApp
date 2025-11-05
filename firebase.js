// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDyYagqqbxkIe4X46jUhp1_DDcx6lEPhBE",
  authDomain: "trilyte-37e53.firebaseapp.com",
  projectId: "trilyte-37e53",
  storageBucket: "trilyte-37e53.appspot.com",
  messagingSenderId: "435271900733",
  appId: "1:435271900733:web:c1b8af9e755017786a5454",
  databaseURL: "https://trilyte-37e53-default-rtdb.firebaseio.com/",
};

// ✅ Initialize app (prevent duplicates)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  auth = getAuth(app); // fallback if already initialized
}

// ✅ Initialize Realtime Database
export const db = getDatabase(app);
export { auth };
export default app;
