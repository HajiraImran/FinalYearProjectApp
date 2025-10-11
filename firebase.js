// firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// Agar Firestore future mein chahiye ho:
// import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyYagqqbxkIe4X46jUhp1_DDcx6lEPhBE",
  authDomain: "trilyte-37e53.firebaseapp.com",
  projectId: "trilyte-37e53",
  storageBucket: "trilyte-37e53.firebasestorage.app",
  messagingSenderId: "435271900733",
  appId: "1:435271900733:web:c1b8af9e755017786a5454"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// ✅ If using Firestore in future:
// export const db = getFirestore(app);

export default app;
