import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Linking // Phone call ya web ke liye
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase"; 
import { ref, onValue } from "firebase/database";

export default function ElectrolytesScreen({ navigation }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return setLoading(false);
    const resRef = ref(db, `users/${user.uid}/latest_results`);
    const unsubscribe = onValue(resRef, (snap) => {
      if (snap.exists()) setResults(snap.val());
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getStatusColor = (level) => {
    if (!level) return "#F5F5F5"; 
    const l = level.toUpperCase();
    if (l.includes("NORMAL")) return "#D6F5E1"; 
    if (l.includes("CRITICAL") || l.includes("VERY")) return "#FFEBEE"; // Light Red for danger
    return "#FDE2E4"; 
  };

  // 🔥 Helper: Check if status is dangerous
  const isCritical = (level) => {
    if (!level) return false;
    const l = level.toUpperCase();
    return l.includes("CRITICAL") || l.includes("VERY HIGH") || l.includes("VERY LOW");
  };

  const renderRecommendation = (type, level) => {
    if (!level) return null;
    const status = level.toUpperCase();

    // --- Case 1: Agar Level LOW hai (Action + Recovery Food) ---
    if (status.includes("LOW")) {
      let seeds = type === "Potassium" ? "Pumpkin & Sunflower seeds" : 
                  type === "Calcium" ? "Chia & Sesame (Til) seeds" : "Flax (Alsi) & Hemp seeds";
      
      let advice = type === "Potassium" ? "Bananas, Apricots, and Spinach." : 
                   type === "Calcium" ? "Milk, Yogurt, and Fortified cereals." : 
                   "Whole grains and Leafy greens.";

      return (
        <View style={[styles.recBox, { backgroundColor: '#E3F2FD', borderColor: '#2196F3', borderWidth: 1 }]}>
          <Ionicons name="medical" size={16} color="#0D47A1" />
          <Text style={[styles.recText, { color: "#0D47A1" }]}>
            <Text style={{ fontWeight: "bold" }}>Action (Low):</Text> Increase intake of {advice} Also, include <Text style={{ fontWeight: "bold" }}>{seeds}</Text> in your daily diet to restore levels naturally.
          </Text>
        </View>
      );
    }

    // --- Case 2: Agar Level HIGH hai (Restriction + Warning) ---
    if (status.includes("HIGH")) {
      let avoid = type === "Potassium" ? "Bananas, Potatoes and high-potassium Seeds." : 
                  type === "Calcium" ? "Dairy products and Calcium supplements." : 
                  "Nuts, Seeds, and Dark Chocolate.";

      return (
        <View style={[styles.recBox, { backgroundColor: '#FFF3E0', borderColor: '#FF9800', borderWidth: 1 }]}>
          <Ionicons name="alert-circle" size={16} color="#E65100" />
          <Text style={[styles.recText, { color: "#E65100" }]}>
            <Text style={{ fontWeight: "bold" }}>Action (High):</Text> {avoid} <Text style={{ fontWeight: "bold" }}>Restrict seed consumption</Text> temporarily as they are dense in electrolytes. Increase water intake.
          </Text>
        </View>
      );
    }

    // --- Case 3: Agar Normal hai ---
    if (status.includes("NORMAL")) {
      return (
        <View style={[styles.recBox, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50', borderWidth: 1 }]}>
          <Ionicons name="checkmark-circle" size={16} color="#1B5E20" />
          <Text style={[styles.recText, { color: "#1B5E20" }]}>
            <Text style={{ fontWeight: "bold" }}>Maintenance:</Text> Continue a balanced diet including a variety of seeds to maintain these healthy levels.
          </Text>
        </View>
      );
    }

    return null;
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#B22222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Electrolyte Analysis</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subHeading}>Detailed Results</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#B22222" style={{ marginTop: 50 }} />
        ) : results ? (
          <>
            {["Potassium", "Calcium", "Magnesium"].map((item) => {
              const data = results[item];
              const critical = isCritical(data?.Level);
              
              return (
                <View key={item} style={[styles.card, { backgroundColor: getStatusColor(data?.Level) }]}>
                  <View style={styles.cardTop}>
                    <Text style={styles.label}>{item}</Text>
                    <Text style={styles.value}>{data?.Value || "--"}</Text>
                  </View>
                  <Text style={[styles.status, critical && {color: '#D32F2F'}]}>
                    {data?.Level || "Pending"} {critical && "⚠️"}
                  </Text>
                  <Text style={styles.range}>Standard: {data?.Range}</Text>
                  
                  {renderRecommendation(item, data?.Level)}

                  {/* 🔥 Emergency Button */}
                  {critical && (
                    <TouchableOpacity 
                      style={styles.doctorBtn}
                      onPress={() => Linking.openURL('tel:1122')} // Emergency number
                    >
                      <Ionicons name="medical" size={18} color="#fff" />
                      <Text style={styles.doctorBtnText}>Emergency: Consult Doctor</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </>
        ) : (
          <Text style={styles.noData}>No data available.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 55, paddingBottom: 15, paddingHorizontal: 20, backgroundColor: "#fff", elevation: 3 },
  backButton: { padding: 6, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#B22222" },
  content: { padding: 20 },
  subHeading: { fontSize: 18, fontWeight: "600", color: "#555", marginBottom: 15 },
  card: { borderRadius: 16, padding: 18, marginBottom: 15, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16, color: "#B22222", fontWeight: "700" },
  value: { fontSize: 22, fontWeight: "900", color: "#222" },
  status: { fontSize: 15, color: "#333", marginTop: 5, fontWeight: "700" },
  range: { fontSize: 12, color: "#666", marginTop: 2 },
  recBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 10, padding: 10, marginTop: 12 },
  recText: { fontSize: 13, color: "#2E7D32", marginLeft: 8, flex: 1 },
  
  // 🔥 Doctor Button Styles
  doctorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  doctorBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },
  noData: { textAlign: 'center', marginTop: 50, color: '#999' },
});