import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { auth, db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";

const screenWidth = Dimensions.get("window").width;

/* ------------------- Enhanced Lab Card ------------------- */
const LabCard = ({ title, Value, Level, Range, iconType, iconName }) => {
  const isNormal = Level?.toUpperCase().includes("NORMAL");

  return (
    <MotiView 
      from={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={styles.labCard}
    >
      <View style={styles.labIconContainer}>
        {iconType === "FontAwesome5" && <FontAwesome5 name={iconName} size={20} color="#B22222" />}
        {iconType === "MaterialCommunityIcons" && <MaterialCommunityIcons name={iconName} size={24} color="#B22222" />}
        {iconType === "Ionicons" && <Ionicons name={iconName} size={22} color="#B22222" />}
      </View>
      
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.labTitle}>{title}</Text>
        <Text style={styles.labRange}>Range: {Range || "--"}</Text>
      </View>
      
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.labValue}>{Value || "--"}</Text>
        <View style={[styles.statusBadge, { backgroundColor: isNormal ? "#E8F5E9" : "#FFEBEE" }]}>
          <Text style={[styles.statusBadgeText, { color: isNormal ? "#2E7D32" : "#C62828" }]}>
            {Level || "PENDING"}
          </Text>
        </View>
      </View>
    </MotiView>
  );
};

export default function ECGScreen({ navigation }) {
  const [ecgData, setEcgData] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return setLoading(false);

    const uid = user.uid;
    const ecgRef = ref(db, `users/${uid}/ecg_data`);
    const resRef = ref(db, `users/${uid}/latest_results`);

    const unsubECG = onValue(ecgRef, (snap) => {
      const data = snap.val();
      if (data) {
        const keys = Object.keys(data);
        const latestKey = keys.sort((a, b) => data[b].timestamp - data[a].timestamp)[0];
        const latestEntry = data[latestKey];
        if (latestEntry?.values) setEcgData(latestEntry.values.slice(0, 100));
      }
    });

    const unsubRes = onValue(resRef, (snap) => {
      if (snap.exists()) setResults(snap.val());
      setLoading(false);
    });

    return () => { unsubECG(); unsubRes(); };
  }, []);

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={["#FDFDFD", "#F4F7F9"]} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnostics</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#B22222" />
            <Text style={styles.loadingText}>Synchronizing...</Text>
          </View>
        ) : (
          <>
            {/* ECG Section */}
            <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.chartCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardMainTitle}>ECG Waveform</Text>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LATEST</Text>
                </View>
              </View>

              {ecgData.length > 0 ? (
                <LineChart
                  data={{ datasets: [{ data: ecgData }] }}
                  width={screenWidth - 70}
                  height={180}
                  chartConfig={chartConfig}
                  bezier
                  withDots={false}
                  withInnerLines={false}
                  style={styles.chart}
                />
              ) : (
                <View style={styles.emptyChart}><Text style={styles.noDataText}>Waiting for pulse...</Text></View>
              )}
            </MotiView>

            {/* Electrolytes Section */}
            <Text style={styles.gridTitle}>Electrolyte Balance</Text>
            
            <LabCard 
              title="Potassium (K⁺)" 
              iconType="MaterialCommunityIcons" 
              iconName="flask-round-bottom" 
              {...results?.Potassium} 
            />
            
            <LabCard 
              title="Calcium (Ca²⁺)" 
              iconType="FontAwesome5" 
              iconName="bone" 
              {...results?.Calcium} 
            />
            
            <LabCard 
              title="Magnesium (Mg²⁺)" 
              iconType="Ionicons" 
              iconName="leaf-outline" 
              {...results?.Magnesium} 
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(178, 34, 34, ${opacity})`,
  strokeWidth: 2.5,
  fillShadowGradientFrom: "#B22222",
  fillShadowGradientTo: "#fff",
  fillShadowGradientFromOpacity: 0.1,
  decimalPlaces: 0,
  labelColor: () => `transparent`,
  propsForBackgroundLines: { strokeWidth: 0 },
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FDFDFD" },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#2C3E50' },
  backBtn: { padding: 5 },
  scrollContent: { padding: 20 },
  
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 15,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginBottom: 25,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  cardMainTitle: { fontSize: 16, fontWeight: '700', color: '#2C3E50' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F1F1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#B22222', marginRight: 6 },
  liveText: { fontSize: 10, fontWeight: '900', color: '#B22222' },
  chart: { marginLeft: -15, marginTop: 10 },

  gridTitle: { fontSize: 18, fontWeight: '800', color: '#2C3E50', marginBottom: 15, marginLeft: 5 },

  labCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F3F5'
  },
  labIconContainer: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FDF2F2', justifyContent: 'center', alignItems: 'center' },
  labTitle: { fontSize: 15, fontWeight: '700', color: '#2C3E50' },
  labRange: { fontSize: 11, color: '#95A5A5', marginTop: 2 },
  labValue: { fontSize: 20, fontWeight: '900', color: '#2C3E50' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },

  loaderContainer: { marginTop: 120, alignItems: 'center' },
  loadingText: { marginTop: 15, color: '#7F8C8D', fontWeight: '500' },
  noDataText: { color: '#BDC3C7', padding: 40, textAlign: 'center' }
});