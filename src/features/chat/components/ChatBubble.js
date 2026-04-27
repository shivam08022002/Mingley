import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';

// ── Gift catalogue (shared with ChatScreen) ───────────────────────────────
export const GIFTS = [
  { id: 'rose',   icon: 'flower',     label: 'Rose',   cost: 10  },
  { id: 'coffee', icon: 'cafe',       label: 'Coffee', cost: 30  },
  { id: 'dinner', icon: 'restaurant', label: 'Dinner', cost: 100 },
];

export const ChatBubble = React.memo(({ item }) => {
  const isMine = item.isMine;

  // ── Gift bubble ──────────────────────────────────────────────────────────
  if (item.type === 'gift') {
    return (
      <View style={[styles.container, isMine ? styles.containerMine : styles.containerTheirs]}>
        <View style={[styles.giftBubble, isMine ? styles.giftBubbleMine : styles.giftBubbleTheirs]}>
          <Icon name={item.icon} size={28} color="#E94057" style={styles.giftEmoji} />
          <View style={styles.giftInfo}>
            <Text style={[styles.giftLabel, isMine ? styles.giftLabelMine : styles.giftLabelTheirs]}>
              {isMine ? `You sent a ${item.giftName}` : `${item.giftName} received!`}
            </Text>
            <View style={styles.giftCostRow}>
              <Icon name="cash-outline" size={11} color={isMine ? '#E94057' : '#888'} />
              <Text style={[styles.giftCost, isMine ? styles.giftCostMine : styles.giftCostTheirs]}>
                {item.cost} coins
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.footer, isMine ? styles.footerMine : styles.footerTheirs]}>
          <Text style={styles.time}>{item.time}</Text>
          {isMine && (
            <Icon
              name={item.read ? 'checkmark-done' : 'checkmark'}
              size={16}
              color="#E94057"
              style={styles.checkIcon}
            />
          )}
        </View>
      </View>
    );
  }

  // ── Coin-transfer bubble ─────────────────────────────────────────────────
  if (item.type === 'coins') {
    return (
      <View style={[styles.container, isMine ? styles.containerMine : styles.containerTheirs]}>
        <View style={[styles.coinsBubble, isMine ? styles.coinsBubbleMine : styles.coinsBubbleTheirs]}>
          <Icon name="cash-outline" size={22} color="#F59E0B" style={{ marginRight: 8 }} />
          <View>
            <Text style={[styles.coinsAmount, isMine ? styles.coinsAmountMine : styles.coinsAmountTheirs]}>
              {item.amount} coins
            </Text>
            <Text style={styles.coinsSub}>{isMine ? 'You sent coins' : 'Coins received!'}</Text>
          </View>
        </View>
        <View style={[styles.footer, isMine ? styles.footerMine : styles.footerTheirs]}>
          <Text style={styles.time}>{item.time}</Text>
          {isMine && (
            <Icon name="checkmark-done" size={16} color="#E94057" style={styles.checkIcon} />
          )}
        </View>
      </View>
    );
  }

  // ── Standard text bubble ─────────────────────────────────────────────────
  return (
    <View style={[styles.container, isMine ? styles.containerMine : styles.containerTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs]}>
          {item.text}
        </Text>
      </View>
      <View style={[styles.footer, isMine ? styles.footerMine : styles.footerTheirs]}>
        <Text style={styles.time}>{item.time}</Text>
        {isMine && (
          <Icon
            name={item.read ? 'checkmark-done' : 'checkmark'}
            size={16}
            color="#E94057"
            style={styles.checkIcon}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.s,
    maxWidth: '80%',
  },
  containerMine: { alignSelf: 'flex-end' },
  containerTheirs: { alignSelf: 'flex-start' },

  // ── Text bubble ───────────────────────────────────────────────────────────
  bubble: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  bubbleMine: {
    backgroundColor: '#FFF0F3',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 0,
  },
  bubbleTheirs: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 16,
  },
  text: { ...TYPOGRAPHY.body, lineHeight: 22 },
  textMine: { color: '#000' },
  textTheirs: { color: '#000' },

  // ── Gift bubble ───────────────────────────────────────────────────────────
  giftBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  giftBubbleMine: {
    backgroundColor: '#FFF0F3',
    borderColor: '#FFD6DE',
    borderBottomRightRadius: 0,
  },
  giftBubbleTheirs: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E8E8E8',
    borderBottomLeftRadius: 0,
  },
  giftEmoji: { marginRight: 10 },
  giftInfo: { flexShrink: 1 },
  giftLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  giftLabelMine: { color: '#333' },
  giftLabelTheirs: { color: '#555' },
  giftCostRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  giftCost: { fontSize: 11, fontWeight: '700' },
  giftCostMine: { color: '#E94057' },
  giftCostTheirs: { color: '#888' },

  // ── Coin-transfer bubble ──────────────────────────────────────────────────
  coinsBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  coinsBubbleMine: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderBottomRightRadius: 0,
  },
  coinsBubbleTheirs: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E8E8E8',
    borderBottomLeftRadius: 0,
  },
  coinsAmount: { fontSize: 15, fontWeight: '800' },
  coinsAmountMine: { color: '#92400E' },
  coinsAmountTheirs: { color: '#333' },
  coinsSub: { fontSize: 11, color: '#888', marginTop: 1 },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
  footerMine: { justifyContent: 'flex-end' },
  footerTheirs: { justifyContent: 'flex-start' },
  time: { ...TYPOGRAPHY.caption, color: '#A0A0A0' },
  checkIcon: { marginLeft: 4 },
});
