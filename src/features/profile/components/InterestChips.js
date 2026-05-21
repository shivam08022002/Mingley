import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Platform, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../../../services/apiServices';

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium';
const PINK = '#E94057';

const Chip = React.memo(({ label, active, icon, onPress }) => (
  <TouchableOpacity
    style={[ch.chip, active && ch.chipActive]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    {icon && (
      <Icon 
        name={icon} 
        size={14} 
        color={active ? PINK : '#666'} 
        style={{ marginRight: 6 }} 
      />
    )}
    <Text style={[ch.chipText, active && ch.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
));

export const InterestChips = React.memo(({ interests, onSave }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(interests);
  const [allInterests, setAllInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInterests = async () => {
      setLoading(true);
      try {
        const response = await userService.getInterests();
        const data = response.data?.interests || [];
        setAllInterests(data);
      } catch (error) {
        console.error('Fetch interests error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterests();
  }, []);

  const toggle = (item) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    try {
      await userService.updateInterests(selected);
      onSave(selected);
      setModalVisible(false);
    } catch (error) {
      console.error('Update interests error:', error);
      Alert.alert('Error', 'Failed to update interests');
    }
  };

  return (
    <View style={ch.container}>
      <View style={ch.header}>
        <Text style={ch.title}>Interests</Text>
        <TouchableOpacity onPress={() => { setSelected(interests); setModalVisible(true); }}>
          <Text style={ch.edit}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={ch.chipsRow}>
        {interests.map((item, i) => {
          const interestObj = allInterests.find(ai => ai.name === item);
          return (
            <View key={i} style={[ch.chip, ch.chipActive]}>
              {interestObj?.icon && (
                <Icon name={interestObj.icon} size={14} color={PINK} style={{ marginRight: 6 }} />
              )}
              <Text style={[ch.chipText, ch.chipTextActive]}>{item}</Text>
            </View>
          );
        })}
      </View>

      {/* Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={ch.overlay}>
          <View style={ch.sheet}>
            <View style={ch.handle} />
            <View style={ch.modalHeader}>
              <Text style={ch.modalTitle}>Edit Interests</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={ch.hint}>Select your interests</Text>
            {loading ? (
              <ActivityIndicator color={PINK} style={{ marginVertical: 20 }} />
            ) : (
              <View style={ch.chipsRow}>
                {allInterests.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.name}
                    icon={item.icon}
                    active={selected.includes(item.name)}
                    onPress={() => toggle(item.name)}
                  />
                ))}
              </View>
            )}
            <TouchableOpacity style={ch.saveBtn} onPress={handleSave}>
              <Text style={ch.saveBtnText}>Save ({selected.length} selected)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const ch = StyleSheet.create({
  container: {
    backgroundColor: '#fff', marginHorizontal: 8,
    borderRadius: 18, padding: 12, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111', fontFamily: FONT_MED },
  edit: { fontSize: 13, color: PINK, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8E6EA',
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
    marginRight: 4,
  },
  chipActive: {
    backgroundColor: '#FFF0F3',
    borderColor: PINK,
  },
  chipText: {
    fontSize: 11,
    color: '#666',
    fontFamily: FONT,
    fontWeight: '500',
  },
  chipTextActive: {
    color: PINK,
    fontWeight: '700',
  },
  // Modal
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40,
  },
  handle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: '#D8D8D8', alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111', fontFamily: FONT_MED },
  hint: { fontSize: 12, color: '#AAA', marginBottom: 14 },
  saveBtn: {
    marginTop: 20, backgroundColor: PINK,
    borderRadius: 18, height: 52,
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', fontFamily: FONT_MED },
});
