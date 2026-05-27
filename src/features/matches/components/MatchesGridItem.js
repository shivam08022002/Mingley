import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image as FastImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';

export const MatchesGridItem = ({ match, onPress, onChat, onDecline }) => {
  const user = match.matchedUser || match.user || match;
  const isOnline = user.isOnline;
  const lastActive = user.lastActiveAt;

  const formatLastActive = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <FastImage source={{ uri: user.avatar || user.image }} style={styles.image} />
      
      {/* Online Status Badge */}
      <View style={styles.statusBadge}>
        <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#A0A0A0' }]} />
        <Text style={styles.statusText}>{isOnline ? 'Online' : formatLastActive(lastActive) || 'Offline'}</Text>
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.gradient}
      />

      {/* Name & age */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {user.fullName || user.name}{user.age ? `, ${user.age}` : ''}
        </Text>
      </View>

      {/* Action row */}
      <View style={styles.actionsRow}>
        {/* Decline */}
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={(e) => { e.stopPropagation?.(); onDecline && onDecline(match); }}
          activeOpacity={0.8}
        >
          <Icon name="close" size={20} color="#FF4D67" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Chat */}
        <TouchableOpacity
          style={[styles.actionButton, styles.chatButton]}
          onPress={(e) => { e.stopPropagation?.(); onChat && onChat(match); }}
          activeOpacity={0.8}
        >
          <Icon name="chatbubble-ellipses" size={20} color="#8A2BE2" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    margin: 8,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    position: 'relative',
    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  image: { width: '100%', height: '100%' },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    zIndex: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 58,
    left: 12,
    right: 12,
  },
  name: {
    ...TYPOGRAPHY.h3,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  actionsRow: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  actionButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#F0F0F0',
  },
  declineButton: {},
  chatButton: {},
});
