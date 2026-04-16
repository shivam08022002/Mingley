import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING } from '../../../constants/theme';

export const ActionButtons = ({ onDislike, onLike, onSuperlike }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={onDislike}>
        <Icon name="close" size={32} color="#E86B32" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.largeButton]} onPress={onLike}>
        <Icon name="heart" size={40} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={onSuperlike}>
        <Icon name="star" size={32} color="#8A2BE2" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.l,
    marginVertical: SPACING.xl,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  smallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  largeButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E94057',
  },
});
