import React from 'react';
import { View, Text, StyleSheet, Modal, Platform, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useToastStore } from '../../store/useToastStore';

const { width } = Dimensions.get('window');

export const Toast = () => {
  const { visible, message, type, hideToast } = useToastStore();

  if (!visible) return null;

  const iconName = (() => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  })();

  const iconColor = (() => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#E94057';
      case 'info':
      default:
        return '#0284C7';
    }
  })();

  const title = (() => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'info':
      default:
        return 'Notice';
    }
  })();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={hideToast}
    >
      <View style={styles.overlay}>
        <View style={styles.toastBox}>
          <View style={[styles.iconWrap, { backgroundColor: iconColor + '15' }]}>
            <Icon name={iconName} size={36} color={iconColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: Math.min(width * 0.8, 320),
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  message: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
});
