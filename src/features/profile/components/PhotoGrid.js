import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Dimensions, Platform, Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const COLS = 4;
const GAP = 8;
const THUMB = (width - 32 - GAP * (COLS - 1)) / COLS;

const PhotoItem = React.memo(({ uri, onPress }) => (
  <TouchableOpacity style={st.thumb} onPress={onPress} activeOpacity={0.85}>
    <FastImage source={{ uri }} style={st.img} />
  </TouchableOpacity>
));

const AddButton = React.memo(({ onPress }) => (
  <TouchableOpacity style={[st.thumb, st.addBtn]} onPress={onPress} activeOpacity={0.8}>
    <Icon name="add" size={28} color="#E4415C" />
  </TouchableOpacity>
));

export const PhotoGrid = React.memo(({ photos, onAdd, onPressPhoto, onEditLabel }) => {
  const handleAdd = useCallback(() => {
    Alert.alert('Add Photo', 'This would open your camera roll.', [
      { text: 'Camera Roll (mock)', onPress: () => onAdd?.('https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [onAdd]);

  const data = [...photos, '__add__'];

  return (
    <View style={st.container}>
      <View style={st.header}>
        <Text style={st.title}>My Photos</Text>
        <TouchableOpacity onPress={onEditLabel}>
          <Text style={st.edit}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={st.grid}>
        {data.map((item, idx) =>
          item === '__add__' ? (
            <AddButton key="add" onPress={handleAdd} />
          ) : (
            <PhotoItem key={`${item}-${idx}`} uri={item} onPress={() => onPressPhoto?.(idx)} />
          )
        )}
      </View>
    </View>
  );
});

const st = StyleSheet.create({
  container: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 18, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  title: {
    fontSize: 16, fontWeight: '700', color: '#111',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  edit: { fontSize: 13, color: '#E4415C', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  thumb: { width: THUMB, height: THUMB, borderRadius: 12, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  addBtn: {
    backgroundColor: '#FFF0F3',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#F0D0D6', borderStyle: 'dashed',
    borderRadius: 12,
  },
});
