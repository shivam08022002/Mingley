import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TYPOGRAPHY, SPACING } from '../../../constants/theme';

export const Chip = ({ label, icon, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon 
        name={icon} 
        size={20} 
        color={selected ? '#FFFFFF' : '#E4415C'} 
        style={styles.icon} 
      />
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    marginBottom: 12,
  },
  containerSelected: {
    backgroundColor: '#E4415C',
    borderColor: '#E4415C',
    shadowColor: '#E4415C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    ...TYPOGRAPHY.body,
    color: '#000000',
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
