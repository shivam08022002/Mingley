import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { useChatStore } from '../../../store/useChatStore';
import { decodeEmoji } from '../../../utils/stringUtils';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';

// ── Gift catalogue mapping for display ─────────────────────────────────────
const GIFT_ICONS = {
  'heart': 'heart-outline',
  'rose': 'rose-outline',
  'gift box': 'gift-outline',
  'coffee date': 'cafe-outline',
  'diamond ring': 'diamond-outline',
  'dinner': 'restaurant-outline',
  'teddy bear': 'ribbon-outline',
  'castle': 'business-outline',
};

export const ChatBubble = React.memo(({ item }) => {
  if (!item) return null;
  const isMine = item.isMine;
  const deleteMessage = useChatStore(s => s.deleteChatMessage);

  const handleLongPress = () => {
    if (!isMine) return;
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMessage(item.chatId, item.id)
        }
      ]
    );
  };

  // ── Gift bubble ──────────────────────────────────────────────────────────
  if (item.type === 'gift') {
    const key = (item.giftName || '').toLowerCase();
    const iconName = item.icon || GIFT_ICONS[key] || 'gift-outline';

    return (
      <TouchableOpacity
        onLongPress={handleLongPress}
        activeOpacity={0.9}
        style={[styles.container, isMine ? styles.containerMine : styles.containerTheirs]}
      >
        <View style={[styles.giftBubble, isMine ? styles.giftBubbleMine : styles.giftBubbleTheirs]}>
          <View style={styles.giftIconWrap}>
            <Icon name={iconName} size={28} color={isMine ? '#FFFFFF' : '#E94057'} />
          </View>
          <Text style={[styles.giftLabel, isMine ? styles.giftLabelMine : styles.giftLabelTheirs]}>
            {item.giftName}
          </Text>
        </View>
        <View style={[styles.footer, isMine ? styles.footerMine : styles.footerTheirs]}>
          <Text style={styles.time}>{item.time}</Text>
          {isMine && (
            <Icon
              name={item.read || item.isRead ? 'checkmark-done' : 'checkmark'}
              size={16}
              color="#FFF"
              style={styles.checkIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // ── Coin-transfer bubble ──────────────────────────────────────────────────
  if (item.type === 'coins') {
    return (
      <TouchableOpacity
        onLongPress={handleLongPress}
        activeOpacity={0.9}
        style={[styles.container, isMine ? styles.containerMine : styles.containerTheirs]}
      >
        <View style={[styles.coinsBubble, isMine ? styles.coinsBubbleMine : styles.coinsBubbleTheirs]}>
          <View style={{ marginRight: 12 }}>
            <Icon name="logo-bitcoin" size={24} color={isMine ? '#FFF' : '#FFD700'} />
          </View>
          <View>
            <Text style={[styles.coinsAmount, isMine ? styles.coinsAmountMine : styles.coinsAmountTheirs]}>
              {item.amount} coins
            </Text>
            <Text style={[styles.coinsSub, isMine ? styles.coinsSubMine : styles.coinsSubTheirs]}>
              {isMine ? 'Coins sent' : 'Coins received'}
            </Text>
          </View>
        </View>
        <View style={[styles.footer, isMine ? styles.footerMine : styles.footerTheirs]}>
          <Text style={styles.time}>{item.time}</Text>
          {isMine && (
            <Icon
              name={item.read || item.isRead ? 'checkmark-done' : 'checkmark'}
              size={16}
              color="#FFF"
              style={styles.checkIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // ── Standard text bubble ─────────────────────────────────────────────────
  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      activeOpacity={0.9}
      style={[styles.container, isMine ? styles.containerMine : styles.containerTheirs]}
    >
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {item.imageUrl && item.imageUrl !== '' ? (
          <View style={styles.imageContainer}>
            <FastImage
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {item.text && item.text !== '[image]' && (
              <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs, { marginTop: 8 }]}>
                {decodeEmoji(item.text)}
              </Text>
            )}
          </View>
        ) : (
          <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs]}>
            {decodeEmoji(item.text)}
          </Text>
        )}
      </View>
      <View style={[styles.footer, isMine ? styles.footerMine : styles.footerTheirs]}>
        <Text style={styles.time}>{item.time}</Text>
        {isMine && (
          <Icon
            name={item.read || item.isRead ? 'checkmark-done' : 'checkmark'}
            size={16}
            color="#FFF" // White checkmark on pink background
            style={styles.checkIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    maxWidth: '80%',
  },
  containerMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  containerTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },

  // ── Text bubble ───────────────────────────────────────────────────────────
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: {
    backgroundColor: '#E94057', // Brand Pink
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#F3F4F6', // Light Grey
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 16,
  },
  text: { ...TYPOGRAPHY.body, fontSize: 14, lineHeight: 19 },
  textMine: { color: '#FFF' },
  textTheirs: { color: '#1F2937' },

  // ── Image bubble ──────────────────────────────────────────────────────────
  imageContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#EEE',
  },

  // ── Gift bubble ───────────────────────────────────────────────────────────
  giftBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  giftBubbleMine: {
    backgroundColor: '#E94057',
    borderColor: '#E94057',
    borderBottomRightRadius: 0,
  },
  giftBubbleTheirs: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E8E8E8',
    borderBottomLeftRadius: 0,
  },
  giftIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  giftEmoji: { marginRight: 10 },
  giftInfo: { flexShrink: 1 },
  giftLabel: { fontSize: 12, fontWeight: '600', marginBottom: 0 },
  giftLabelMine: { color: '#FFF' },
  giftLabelTheirs: { color: '#555' },
  giftCostRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  giftCost: { fontSize: 11, fontWeight: '700' },
  giftCostMine: { color: '#FFF', opacity: 0.9 },
  giftCostTheirs: { color: '#888' },

  // ── Coin-transfer bubble ──────────────────────────────────────────────────
  coinsBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  coinsBubbleMine: {
    backgroundColor: '#E94057',
    borderColor: '#E94057',
    borderBottomRightRadius: 0,
  },
  coinsBubbleTheirs: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E8E8E8',
    borderBottomLeftRadius: 0,
  },
  coinsAmount: { fontSize: 13, fontWeight: '800' },
  coinsAmountMine: { color: '#FFF' },
  coinsAmountTheirs: { color: '#333' },
  coinsSub: { fontSize: 10, marginTop: 1 },
  coinsSubMine: { color: 'rgba(255,255,255,0.7)' },
  coinsSubTheirs: { color: '#999' },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: { flexDirection: 'row', marginTop: 2, alignItems: 'center' },
  footerMine: { justifyContent: 'flex-end' },
  footerTheirs: { justifyContent: 'flex-start' },
  time: { ...TYPOGRAPHY.caption, color: '#A0A0A0' },
  checkIcon: { marginLeft: 4 },
});
