import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../firebase";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const ranges = {
    Potassium: { min: 3.5, max: 5.0 },
    Calcium: { min: 8.5, max: 10.5 },
    Magnesium: { min: 1.7, max: 2.2 }
  };

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

  const getStatusStyle = (type, value) => {
    const val = parseFloat(value);
    if (isNaN(val)) return styles.defaultText;
    const range = ranges[type];
    if (val < range.min || val > range.max) return styles.redText; 
    return styles.greenText;
  };

  const exportPDF = async () => {
    if (history.length === 0) {
      Alert.alert("Empty", "No records found.");
      return;
    }

    const tableRows = history.map((item) => {
      let ts = item?.timestamp;
      if (ts < 1000000000) ts += 946684800; 
      const dateObj = new Date(ts * 1000);
      const kVal = item.results?.Potassium?.Value || "--";
      const caVal = item.results?.Calcium?.Value || "--";
      const mgVal = item.results?.Magnesium?.Value || "--";

      const getColor = (val, type) => {
        const v = parseFloat(val);
        if(isNaN(v)) return '#444';
        return (v < ranges[type].min || v > ranges[type].max) ? '#B22222' : '#2E7D32';
      };

      return `
        <tr>
          <td>${dateObj.toLocaleDateString('en-GB')}</td>
          <td>${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
          <td style="color: ${getColor(kVal, 'Potassium')}; font-weight: bold;">${kVal}</td>
          <td style="color: ${getColor(caVal, 'Calcium')}; font-weight: bold;">${caVal}</td>
          <td style="color: ${getColor(mgVal, 'Magnesium')}; font-weight: bold;">${mgVal}</td>
        </tr>`;
    }).join("");

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 30px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #B22222; padding-bottom: 10px; margin-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #eee; padding: 10px; border: 1px solid #ddd; }
            td { padding: 10px; border: 1px solid #ddd; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo"><span style="color: #000;">Tri</span><span style="color: #B22222;">lyte</span></div>
            <div style="font-size: 16px; color: #666;">Medical History Report</div>
          </div>
          <p>Patient ID: ${auth.currentUser?.email}</p>
          <table>
            <tr><th>Date</th><th>Time</th><th>K+</th><th>Ca+</th><th>Mg</th></tr>
            ${tableRows}
          </table>
        </body>
      </html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (e) { Alert.alert("Error", "PDF failed."); }
  };

  const renderItem = ({ item }) => {
    let ts = item?.timestamp;
    if (!ts) return null;
    if (ts < 1000000000) ts += 946684800; 
    const dateObj = new Date(ts * 1000);
    const getVal = (res) => res?.Value ? String(res.Value).split(' ')[0] : "--";
    const kVal = getVal(item.results?.Potassium);
    const caVal = getVal(item.results?.Calcium);
    const mgVal = getVal(item.results?.Magnesium);

    return (
      <View style={styles.tableRow}>
        <Text style={[styles.cell, styles.dateCell]}>{dateObj.toLocaleDateString('en-GB')}</Text>
        <Text style={[styles.cell, styles.timeCell]}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={[styles.cell, styles.valueCell, getStatusStyle('Potassium', kVal)]}>{kVal}</Text>
        <Text style={[styles.cell, styles.valueCell, getStatusStyle('Calcium', caVal)]}>{caVal}</Text>
        <Text style={[styles.cell, styles.valueCell, getStatusStyle('Magnesium', mgVal)]}>{mgVal}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F8F9FA", "#FFFFFF"]} style={StyleSheet.absoluteFill} />
      
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#B22222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical History</Text>
        
        {/* Download button placed to match original header symmetry */}
        <TouchableOpacity onPress={exportPDF} style={styles.downloadButton}>
          <Ionicons name="download-outline" size={24} color="#B22222" />
        </TouchableOpacity>
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
          ListEmptyComponent={<Text style={styles.emptyText}>No records found.</Text>}
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
  downloadButton: {
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
  headerText: { fontWeight: '800', fontSize: 14, color: '#333', textAlign: 'center', marginTop: 2 },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  cell: { fontSize: 13, textAlign: 'center', fontWeight: '600' },
  defaultText: { color: '#444' },
  redText: { color: '#D32F2F', fontWeight: '800' },
  greenText: { color: '#2E7D32', fontWeight: '800' },
  dateCell: { flex: 2.5 },
  timeCell: { flex: 2 },
  valueCell: { flex: 1.5 },
  listContainer: { paddingBottom: 30 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#666', fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 50 }
});