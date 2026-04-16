import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Platform, Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ALL = ['Music', 'Travel', 'Gym', 'Movies', 'Reading', 'Cooking', 'Art', 'Dancing', 'Photography', 'Yoga', 'Modelling', 'Travelling'];

const Chip = React.memo(({ label, active, onPress }) => (
  <TouchableOpacity
    style={[ch.chip, active && ch.chipActive]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Text style={[ch.chipText, active && ch.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
));

export const InterestChips = React.memo(({ interests, onSave }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(interests);

  const toggle = (item) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    onSave(selected);
    setModalVisible(false);
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
        {interests.map((item, i) => (
          <View key={i} style={[ch.chip, ch.chipActive]}>
            <Text style={[ch.chipText, ch.chipTextActive]}>{item}</Text>
          </View>
        ))}
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
            <Text style={ch.hint}>Select up to 8 interests</Text>
            <View style={ch.chipsRow}>
              {ALL.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  active={selected.includes(item)}
                  onPress={() => toggle(item)}
                />
              ))}
            </View>
            <TouchableOpacity style={ch.saveBtn} onPress={handleSave}>
              <Text style={ch.saveBtnText}>Save ({selected.length} selected)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium';
const PINK = '#E94057';

const ch = StyleSheet.create({
  container: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 18, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111', fontFamily: FONT_MED },
  edit: { fontSize: 13, color: PINK, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  chipActive: { backgroundColor: '#FFF0F3', borderColor: PINK },
  chipText: { fontSize: 13, color: '#666', fontFamily: FONT },
  chipTextActive: { color: PINK, fontWeight: '700' },
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
