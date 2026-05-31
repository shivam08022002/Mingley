import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
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
        size={16} 
        color={selected ? '#FFFFFF' : '#E94057'} 
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },
  containerSelected: {
    backgroundColor: '#E94057',
    borderColor: '#E94057',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.3)',
    elevation: 4,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

