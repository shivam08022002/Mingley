import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING } from '../../../constants/theme';

export const ActionButtons = ({ onDislike, onLike, onSuperchat }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={onDislike} activeOpacity={0.85}>
        <Icon name="close" size={32} color="#E86B32" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.largeButton]} onPress={onLike} activeOpacity={0.85}>
        <Icon name="heart" size={44} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={onSuperchat} activeOpacity={0.85}>
        <Icon name="flash" size={32} color="#7C3AED" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 12,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  smallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  largeButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E94057',
    shadowColor: '#E94057',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
});

