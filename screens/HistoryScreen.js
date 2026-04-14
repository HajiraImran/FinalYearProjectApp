import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../firebase";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const historyRef = ref(db, `users/${user.uid}/ecg_data`);
    
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        setHistory(formattedData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => {
    // 🔥 TIME FIX: Null check and Offset correction
    let ts = item?.timestamp;
    if (!ts) return null; // Agar timestamp nahi hai to item render na karein

    if (ts < 1000000000) { 
        ts += 946684800; 
    }
    
    const dateObj = new Date(ts * 1000);
    const dateStr = dateObj.toLocaleDateString('en-GB'); 
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 🔥 String conversion to prevent "Text strings" error
    const getVal = (res) => {
      if (!res || !res.Value) return "--";
      return String(res.Value).split(' ')[0];
    };

    return (
      <View style={styles.tableRow}>
        <Text style={[styles.cell, styles.dateCell]}>{String(dateStr)}</Text>
        <Text style={[styles.cell, styles.timeCell]}>{String(timeStr)}</Text>
        
        <Text style={[styles.cell, styles.valueCell, styles.redText]}>
            {getVal(item.results?.Potassium)}
        </Text>
        <Text style={[styles.cell, styles.valueCell, styles.redText]}>
            {getVal(item.results?.Calcium)}
        </Text>
        <Text style={[styles.cell, styles.valueCell, styles.greenText]}>
            {getVal(item.results?.Magnesium)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F8F9FA", "#FFFFFF"]} style={StyleSheet.absoluteFill} />
      
      <View style={styles.headerBar}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#B22222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical History</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.dateCell]}>Date</Text>
        <Text style={[styles.headerText, styles.timeCell]}>Time</Text>
        <Text style={[styles.headerText, styles.valueCell]}>K+</Text>
        <Text style={[styles.headerText, styles.valueCell]}>Ca+</Text>
        <Text style={[styles.headerText, styles.valueCell]}>Mg</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#B22222" />
          <Text style={styles.loaderText}>Loading Records...</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={{ marginTop: 50 }}>
               <Text style={styles.emptyText}>No records found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    marginTop: 40,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "900", 
    color: "#B22222", 
    marginTop: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#B22222',
  },
  headerText: {
    fontWeight: '800',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  cell: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
    color: '#444'
  },
  redText: { color: '#d32f2f', fontWeight: '700' },
  greenText: { color: '#556b2f', fontWeight: '700' },
  dateCell: { flex: 2.5 },
  timeCell: { flex: 2 },
  valueCell: { flex: 1.5 },
  listContainer: { paddingBottom: 30 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#666', fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 16 }
});