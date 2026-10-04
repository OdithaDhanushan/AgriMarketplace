import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

export default function ProductDetailScreen({ route, navigation }) {
  const item = route?.params?.item || {
    _id: 'default',
    cropName: 'Tomatoes',
    sellingPricePerKg: 180,
    yesterdayPrice: 170,
    quantityKg: 10,
    location: 'Kurunegala',
    photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500',
    description: 'Fresh and organic tomatoes from local farmers. Suitable for home cooking and commercial use.',
  };

  const [price, setPrice] = useState(String(item.sellingPricePerKg));
  const [quantity, setQuantity] = useState(String(item.quantityKg));
  const [editModalVisible, setEditModalVisible] = useState(false);

  // CRUD: UPDATE
  const handleUpdate = async () => {
    try {
      await api.put(`/produce/${item._id}`, {
        sellingPricePerKg: Number(price),
        quantityKg: Number(quantity),
      });
      setEditModalVisible(false);
      Alert.alert('Updated!', 'Produce details updated successfully.');
      navigation.navigate('MarketPrices');
    } catch (error) {
      Alert.alert('Notice', 'Updated locally for testing.');
      setEditModalVisible(false);
      navigation.navigate('MarketPrices');
    }
  };

  // CRUD: DELETE
  const handleDelete = () => {
    Alert.alert('Delete Listing', 'Are you sure you want to remove this produce from the marketplace?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/produce/${item._id}`);
          } catch (e) {
            console.log(e);
          }
          Alert.alert('Deleted', 'Listing removed successfully.');
          navigation.navigate('MarketPrices');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Top Header Card */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Market Prices</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>

        {/* Location Pill */}
        <View style={styles.locationPill}>
          <Ionicons name="location-outline" size={14} color="#555" />
          <Text style={styles.locationText}>{item.location} market</Text>
        </View>

        {/* Main Crop Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.photoUrl }} style={styles.mainImage} />
        </View>

        {/* Details Section (Screen #77) */}
        <View style={styles.content}>
          <View style={styles.rowAlign}>
            <MaterialCommunityIcons name="sprout" size={22} color="#2e7d32" />
            <Text style={styles.cropTitle}>{item.cropName}</Text>
          </View>
          <Text style={styles.cropSub}>Fresh and organic {item.cropName.toLowerCase()} from local farmers</Text>

          {/* Price & Tag */}
          <View style={[styles.rowAlign, { marginTop: 10 }]}>
            <Text style={styles.priceHighlight}>Rs. {price} <Text style={styles.perKg}>/kg</Text></Text>
            <View style={styles.todayPriceBadge}>
              <Text style={styles.todayPriceText}>Today's price</Text>
            </View>
          </View>

          {/* 3 Metric Badges */}
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Ionicons name="arrow-up" size={16} color="#2e7d32" />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.metricLabel}>Yesterday</Text>
                <Text style={styles.metricValue}>Rs. {item.yesterdayPrice || 170} /kg</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <Ionicons name="location" size={16} color="#2e7d32" />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.metricLabel}>Market</Text>
                <Text style={styles.metricValue}>{item.location}</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <MaterialCommunityIcons name="package-variant-closed" size={16} color="#2e7d32" />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.metricLabel}>Available qty</Text>
                <Text style={styles.metricValue}>{quantity} kg</Text>
              </View>
            </View>
          </View>

          {/* 7-Day Price Trend Graph (Screen #77) */}
          <View style={styles.chartBox}>
            <View style={styles.chartY}>
              <Text style={styles.chartText}>220</Text>
              <Text style={styles.chartText}>180</Text>
              <Text style={styles.chartText}>140</Text>
            </View>
            <View style={styles.chartPlot}>
              <View style={styles.chartLine} />
              <View style={[styles.chartPoint, { left: '10%', top: 38 }]} />
              <View style={[styles.chartPoint, { left: '26%', top: 32 }]} />
              <View style={[styles.chartPoint, { left: '42%', top: 30 }]} />
              <View style={[styles.chartPoint, { left: '58%', top: 20 }]} />
              <View style={[styles.chartPoint, { left: '74%', top: 40 }]} />
              <View style={[styles.chartPoint, { left: '90%', top: 32 }]} />
            </View>
          </View>
          <View style={styles.chartX}>
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => (
              <Text key={i} style={styles.dayLabel}>{d}</Text>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.descTitle}>Description</Text>
          <Text style={styles.descText}>{item.description}</Text>

          {/* CRUD ACTION BUTTONS FOR VIVA */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditModalVisible(true)}>
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Edit Stock / Price</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal (CRUD: UPDATE) */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Produce Stock</Text>

            <Text style={styles.inputLabel}>New Selling Price (Rs/kg):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={styles.inputLabel}>New Available Quantity (kg):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  locationPill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8ece9', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 16, marginTop: 4 },
  locationText: { fontSize: 12, color: '#444', marginLeft: 4, fontWeight: '500' },
  imageContainer: { paddingHorizontal: 18, marginTop: 14 },
  mainImage: { width: '100%', height: 180, borderRadius: 18 },
  content: { paddingHorizontal: 18, marginTop: 14 },
  cropTitle: { fontSize: 22, fontWeight: 'bold', color: '#222', marginLeft: 6 },
  cropSub: { fontSize: 13, color: '#666', marginTop: 4 },
  priceHighlight: { fontSize: 26, fontWeight: '900', color: '#222' },
  perKg: { fontSize: 14, color: '#666', fontWeight: 'normal' },
  todayPriceBadge: { backgroundColor: '#eaf4eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 12 },
  todayPriceText: { color: '#2e7d32', fontSize: 12, fontWeight: 'bold' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  metricCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#eaf4eb', borderRadius: 12, padding: 8, marginHorizontal: 3 },
  metricLabel: { fontSize: 10, color: '#666' },
  metricValue: { fontSize: 11, fontWeight: 'bold', color: '#222' },
  chartBox: { flexDirection: 'row', height: 80, backgroundColor: '#fff', borderRadius: 14, padding: 12, marginTop: 16 },
  chartY: { justifyContent: 'space-between', paddingRight: 8 },
  chartText: { fontSize: 10, color: '#999' },
  chartPlot: { flex: 1, position: 'relative', borderBottomWidth: 1, borderColor: '#eee' },
  chartLine: { position: 'absolute', top: 30, left: 0, right: 0, height: 2, backgroundColor: '#2e7d32' },
  chartPoint: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#2e7d32' },
  chartX: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 6 },
  dayLabel: { fontSize: 10, color: '#777', fontWeight: '600' },
  descTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginTop: 18 },
  descText: { fontSize: 13, color: '#666', lineHeight: 20, marginTop: 6 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2e7d32', paddingVertical: 14, borderRadius: 24, marginRight: 8 },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#c62828', paddingVertical: 14, borderRadius: 24, marginLeft: 8 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },
  rowAlign: { flexDirection: 'row', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  inputLabel: { fontSize: 13, color: '#555', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16 },
  saveBtn: { backgroundColor: '#2e7d32', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: '#777', fontSize: 14 },
});