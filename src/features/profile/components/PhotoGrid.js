import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Platform, Alert, Modal, TouchableWithoutFeedback
} from 'react-native';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../../../services/apiServices';
import { useTheme } from '../../../theme/ThemeContext';

const { width } = Dimensions.get('window');
const COLS = 4;
const GAP = 8;
const THUMB = (width - 24 - GAP * (COLS - 1)) / COLS;

const PhotoItem = ({ photo, onPress, onDelete, onSetPrimary, theme }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const photoId = photo.id || photo._id || photo;
  const photoUrl = photo.url || photo;
  const isPrimary = photo.isPrimary || false;

  return (
    <>
      <TouchableOpacity 
        style={st.thumb} 
        onPress={onPress} 
        onLongPress={() => setMenuVisible(true)}
        activeOpacity={0.85}
      >
        <FastImage source={{ uri: photoUrl }} style={st.img} />
        {isPrimary && (
          <View style={[st.primaryBadge, { backgroundColor: theme.primary }]}>
            <Icon name="star" size={10} color="#FFF" />
          </View>
        )}
        <TouchableOpacity 
          style={[st.editIconBtn, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)' }]} 
          onPress={() => setMenuVisible(true)}
        >
          <Icon name="ellipsis-horizontal" size={16} color={theme.isDark ? '#FFF' : '#333'} />
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={st.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[st.menuBox, { backgroundColor: theme.cardBackground }]}>
                <Text style={[st.menuTitle, { color: theme.textPrimary }]}>Photo Options</Text>
                
                {!isPrimary && (
                  <TouchableOpacity 
                    style={st.menuItem} 
                    onPress={() => { setMenuVisible(false); onSetPrimary?.(photoId); }}
                  >
                    <Icon name="star-outline" size={20} color={theme.textPrimary} />
                    <Text style={[st.menuText, { color: theme.textPrimary }]}>Set as Primary</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={st.menuItem} 
                  onPress={() => { setMenuVisible(false); onDelete?.(photoId); }}
                >
                  <Icon name="trash-outline" size={20} color="#FF4D67" />
                  <Text style={[st.menuText, { color: '#FF4D67' }]}>Delete Photo</Text>
                </TouchableOpacity>

                <View style={[st.menuDivider, { backgroundColor: theme.sectionDivider }]} />

                <TouchableOpacity 
                  style={st.menuItem} 
                  onPress={() => setMenuVisible(false)}
                >
                  <Icon name="close" size={20} color={theme.textSecondary} />
                  <Text style={[st.menuText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const AddButton = ({ onPress, theme }) => (
  <TouchableOpacity style={[
    st.thumb, 
    st.addBtn, 
    { backgroundColor: theme.isDark ? theme.iconWrapBackground : '#FFF0F3', borderColor: theme.isDark ? theme.accent : '#F0D0D6' }
  ]} onPress={onPress} activeOpacity={0.8}>
    <Icon name="add" size={28} color={theme.accent} />
  </TouchableOpacity>
);

export const PhotoGrid = React.memo(({ photos, onAdd, onPressPhoto, onDelete, onSetPrimary, onEditLabel }) => {
  const { theme } = useTheme();
  const data = [...photos, '__add__'];

  return (
    <View style={[st.container, { backgroundColor: theme.background }]}>
      <View style={st.header}>
        <Text style={[st.title, { color: theme.textPrimary }]}>My Photos</Text>
        {photos.length > 0 && (
          <TouchableOpacity onPress={onEditLabel}>
            <Text style={[st.edit, { color: theme.accent }]}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={st.grid}>
        {data.map((item, idx) =>
          item === '__add__' ? (
            <AddButton key="add" onPress={onAdd} theme={theme} />
          ) : (
            <PhotoItem 
              key={item.id || `${item}-${idx}`} 
              photo={item} 
              onPress={() => onPressPhoto?.(idx)} 
              onDelete={onDelete}
              onSetPrimary={onSetPrimary}
              theme={theme}
            />
          )
        )}
      </View>
    </View>
  );
});

const st = StyleSheet.create({
  container: {
    backgroundColor: '#fff', marginHorizontal: 8,
    borderRadius: 18, padding: 12, marginBottom: 16,
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
  edit: { fontSize: 13, color: '#E94057', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  thumb: { width: THUMB, height: THUMB, borderRadius: 12, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#E94057',
    borderRadius: 8,
    padding: 2,
  },
  editIconBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: '#FFF0F3',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#F0D0D6', borderStyle: 'dashed',
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: 280,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
});
