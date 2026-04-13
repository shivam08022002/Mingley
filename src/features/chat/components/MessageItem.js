import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';

export const MessageItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Dynamic wrapper testing if you need story rings */}
      <View style={styles.avatarContainer}>
          <LinearGradient
            colors={item.hasActivity ? ['#FF6B8B', '#8A2387'] : ['transparent', 'transparent']} // Active map vs simple
            style={styles.gradientRing}
          >
            <View style={[styles.imageWrapper, !item.hasActivity && { borderWidth: 0, padding: 0 }]}>
               <FastImage source={{ uri: item.image }} style={styles.image} />
            </View>
          </LinearGradient>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text 
            style={[styles.messagePreview, item.unread && styles.unreadMessagePreview]} 
            numberOfLines={1}
          >
            {item.isTyping ? 'Typing..' : item.lastMessage}
          </Text>
          {!!item.unread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    marginRight: SPACING.m,
  },
  gradientRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#000000',
  },
  time: {
    ...TYPOGRAPHY.caption,
    color: '#A0A0A0',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    ...TYPOGRAPHY.bodySecondary,
    color: '#A0A0A0',
    flex: 1,
    paddingRight: SPACING.s,
  },
  unreadMessagePreview: {
    color: '#000000',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#E4415C',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
