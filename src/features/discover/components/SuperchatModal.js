import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Platform,
  Dimensions, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useChatStore } from '../../../store/useChatStore';
import { BottomSheetContainer } from '../../../components/common/BottomSheetContainer';

const { height } = Dimensions.get('window');

const Section = ({ label, children }) => (
  <View style={s.section}>
    <Text style={s.sectionLabel}>{label}</Text>
    {children}
  </View>
);

export const SuperchatModal = ({ visible, onClose, user }) => {
  const [message, setMessage] = useState('');
  const [coinAmount, setCoinAmount] = useState('500');
  const [isLoading, setIsLoading] = useState(false);
  const { wallet, sendSuperchat, fetchWalletBalance, setDepositModalVisible } = useChatStore();

  React.useEffect(() => {
    if (visible) {
      fetchWalletBalance();
    }
  }, [visible, fetchWalletBalance]);

  const handleSendSuperchat = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message.');
      return;
    }

    const amount = parseInt(coinAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid coin amount.');
      return;
    }

    if (wallet.coins < amount) {
      Alert.alert('Error', 'Insufficient coins. Please top up.');
      return;
    }

    setIsLoading(true);
    try {
      await sendSuperchat(user.id || user._id, message, amount);
      Alert.alert('Success', `Superchat sent successfully! 🚀`);
      onClose();
      setMessage('');
      setCoinAmount('500');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send superchat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BottomSheetContainer 
        height={height * 0.85} 
        onClose={onClose}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.headerRow}>
            <TouchableOpacity style={s.backButton} onPress={onClose}>
              <Icon name="chevron-back" size={22} color="#333" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center', marginRight: 44 }}>
              <Text style={s.title}>Send Superchat</Text>
            </View>
          </View>

          <Text style={s.subtitle}>Direct message to {user?.fullName || user?.name || 'User'}</Text>

          <View style={s.promoBanner}>
            <Icon name="shield-checkmark" size={20} color="#E94057" />
            <Text style={s.promoText}>Send a Superchat. If you don't get a reply, you'll get a full refund!</Text>
          </View>

          <Section label="Your Balance">
            <View style={s.balanceCard}>
              <View style={s.coinsBadge}>
                <Icon name="logo-bitcoin" size={16} color="#FFD700" />
                <Text style={s.coinsText}>{wallet.coins} Coins</Text>
              </View>
              <TouchableOpacity onPress={() => {
                onClose();
                setDepositModalVisible(true);
              }}>
                <Text style={s.topUpBtn}>Top Up</Text>
              </TouchableOpacity>
            </View>
          </Section>

          <Section label="Superchat Amount">
            <View style={s.inputContainer}>
              <Icon name="flash" size={20} color="#7C3AED" style={s.inputIcon} />
              <TextInput
                style={s.amountInput}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={coinAmount}
                onChangeText={setCoinAmount}
                placeholderTextColor="#BBB"
              />
              <Text style={{ fontWeight: '600', color: '#E94057' }}>Coins</Text>
            </View>
          </Section>

          <Section label="Your Message">
            <TextInput
              style={s.textArea}
              placeholder="Say something nice..."
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              placeholderTextColor="#BBB"
            />
          </Section>

          <TouchableOpacity 
            style={s.sendBtnWrap} 
            onPress={handleSendSuperchat}
            disabled={isLoading || !message.trim()}
          >
            <LinearGradient
              colors={['#E94057', '#8A2387']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.sendBtn}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={s.sendBtnText}>Send Superchat</Text>
                  <Icon name="flash" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetContainer>
    </Modal>
  );
};

const FONT = Platform.OS === 'ios' ? 'System' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'System' : 'sans-serif-medium';

const s = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    fontFamily: FONT_MED,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontFamily: FONT,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  promoText: {
    flex: 1,
    fontSize: 13,
    color: '#E94057',
    fontWeight: '600',
    lineHeight: 18,
  },
  amountDisplay: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  amountValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E94057',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
    fontFamily: FONT_MED,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 16,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: FONT_MED,
  },
  topUpBtn: {
    fontSize: 14,
    color: '#E94057',
    fontWeight: '600',
    fontFamily: FONT_MED,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: FONT,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#333',
    fontFamily: FONT,
  },
  sendBtnWrap: {
    borderRadius: 100,
    overflow: 'hidden',
    marginTop: 8,
  },
  sendBtn: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: FONT_MED,
  },
});
