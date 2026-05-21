import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useChatStore } from '../store/useChatStore';
import { BottomSheetContainer } from './common/BottomSheetContainer';

import { walletService } from '../services/apiServices';

export const DepositModal = ({ visible, onClose }) => {
  const [utrIdText, setUtrIdText] = useState('');
  const [amount, setAmount] = useState('');

  const handleDepositSubmit = async () => {
    if (!utrIdText.trim()) { Alert.alert('Error', 'Please enter your UTR ID.'); return; }
    if (!amount.trim()) { Alert.alert('Error', 'Please enter amount.'); return; }
    
    try {
      await walletService.deposit({
        utrId: utrIdText,
        screenshotUrl: 'mock-screenshot-url', // Should be uploaded to storage
        requestedCoins: parseInt(amount, 10),
      });
      Alert.alert('Success', 'Deposit request submitted. Your coins will reflect soon.');
      onClose();
      setUtrIdText('');
      setAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
      Alert.alert('Error', error.message || 'Deposit failed');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BottomSheetContainer onClose={onClose} height={500}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : ''} style={{ width: '100%', flex: 1 }}>
          <Text style={styles.modalTitle}>Deposit Coins</Text>
          <Text style={styles.depositNote}>1. Scan QR or transfer to bank details.</Text>
          <Text style={styles.depositNote}>2. Submit UTR ID and upload screenshot.</Text>
          <View style={styles.qrContainer}>
            <Icon name="qr-code-outline" size={80} color="#333" />
            <Text style={styles.bankDetailsText}>Acc: 1234567890</Text>
            <Text style={styles.bankDetailsText}>IFSC: MING999 • UPI: mingley@axl</Text>
          </View>
          <TextInput style={styles.amountInput} placeholder="Enter Amount" placeholderTextColor="#A0A0A0" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          <TextInput style={styles.amountInput} placeholder="Enter Payment UTR ID" placeholderTextColor="#A0A0A0" value={utrIdText} onChangeText={setUtrIdText} />
          <TouchableOpacity style={[styles.modalActionBtn, (!utrIdText || !amount) && styles.modalActionBtnDisabled]} onPress={handleDepositSubmit} disabled={!utrIdText || !amount}>
            <Text style={styles.modalActionBtnText}>Upload Screenshot & Submit</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </BottomSheetContainer>
    </Modal>
  );
};

export const CashoutModal = ({ visible, onClose }) => {
  const [cashoutInputText, setCashoutInputText] = useState('');
  const [bankOrUpiText, setBankOrUpiText] = useState('');
  const wallet = useChatStore((s) => s.wallet);
  const withdrawCoins = useChatStore((s) => s.withdrawCoins);

  const handleWithdraw = async () => {
    const amount = parseInt(cashoutInputText, 10);
    if (!bankOrUpiText.trim()) { Alert.alert('Error', 'Please enter your Bank Details or UPI ID.'); return; }
    
    try {
      await walletService.withdraw({
        coins: amount,
        bankOrUpi: bankOrUpiText,
      });
      onClose();
      setCashoutInputText('');
      setBankOrUpiText('');
      Alert.alert('Success', `${amount} coins withdrawn to ${bankOrUpiText}.`);
    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert('Error', error.message || 'Withdrawal failed');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BottomSheetContainer onClose={onClose} height={460}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : ''} style={{ width: '100%', flex: 1 }}>
          <Text style={styles.modalTitle}>Withdraw Coins</Text>
          <Text style={styles.modalSub}>Available: <Text style={styles.modalSubBold}>{wallet.coins} coins</Text></Text>
          <Text style={styles.cashoutNote}>Rs 1 per coin will be credited within 3-5 business days.</Text>
          <TextInput style={styles.amountInput} placeholder="Bank Details or UPI ID" placeholderTextColor="#A0A0A0" value={bankOrUpiText} onChangeText={setBankOrUpiText} />
          <TextInput style={styles.amountInput} placeholder="Enter coins to withdraw" placeholderTextColor="#A0A0A0" keyboardType="numeric" value={cashoutInputText} onChangeText={setCashoutInputText} />
          {cashoutInputText !== '' && parseInt(cashoutInputText, 10) > wallet.coins && (
            <Text style={styles.cashoutError}>Insufficient coins.</Text>
          )}
          <TouchableOpacity
            style={[styles.modalActionBtn, styles.cashoutBtn, (!cashoutInputText || parseInt(cashoutInputText, 10) > wallet.coins || !bankOrUpiText) && styles.modalActionBtnDisabled]}
            onPress={handleWithdraw}
            disabled={!cashoutInputText || parseInt(cashoutInputText, 10) > wallet.coins || !bankOrUpiText}
          >
            <Icon name="cash-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.modalActionBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </BottomSheetContainer>
    </Modal>
  );
};

export const VerifyModal = ({ visible, onClose }) => {
  const [idProofUrl, setIdProofUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleVerify = async () => {
    if (!idProofUrl.trim()) {
      Alert.alert('Error', 'Please enter ID proof URL');
      return;
    }
    if (!agreed) {
      Alert.alert('Error', 'Please agree to the Terms of Service to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      await walletService.verifyAccount({ idProofUrl });
      Alert.alert('Success', 'Verification request submitted! A 50-coin bonus will be credited to your account once your verification is approved.');
      onClose();
      setIdProofUrl('');
      setAgreed(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BottomSheetContainer onClose={onClose} height={520}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : ''} style={{ width: '100%', flex: 1, paddingHorizontal: 20 }}>
          <View style={{ alignItems: 'center', marginVertical: 25 }}>
            <View style={styles.verifyIconCircle}>
              <Icon name="shield-checkmark" size={42} color="#E94057" />
            </View>
            <Text style={styles.modalTitle}>Identity Verification</Text>
            <Text style={styles.verifyBonusText}>
              Get a 50-coin bonus credited to your account after successful verification!
            </Text>
          </View>
          
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.inputLabel}>ID Proof Document URL</Text>
            <TextInput 
              style={styles.amountInput} 
              placeholder="https://example.com/your-id.jpg" 
              placeholderTextColor="#A0A0A0" 
              value={idProofUrl} 
              onChangeText={setIdProofUrl}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Icon name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text style={styles.verifyDisclaimer}>
              I agree to the Terms of Service regarding identity verification.
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalActionBtn, (!idProofUrl || !agreed || isLoading) && styles.modalActionBtnDisabled]} 
            onPress={handleVerify} 
            disabled={!idProofUrl || !agreed || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.modalActionBtnText}>Submit for Verification</Text>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </BottomSheetContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#777', marginBottom: 20 },
  modalSubBold: { fontWeight: '700', color: '#E94057' },
  amountInput: {
    borderWidth: 1.5, borderColor: '#F0F0F0', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#111',
    marginBottom: 16, backgroundColor: '#FAFAFA',
  },
  modalActionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#E94057', paddingVertical: 14, borderRadius: 14,
  },
  modalActionBtnDisabled: { backgroundColor: '#D0D0D0' },
  modalActionBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  cashoutBtn: { backgroundColor: '#059669' },
  cashoutNote: {
    fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 18,
    backgroundColor: '#F0FDF4', padding: 10, borderRadius: 10,
  },
  cashoutError: { fontSize: 12, color: '#DC2626', marginBottom: 8, marginTop: -8 },
  depositNote: {
    fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 4, paddingHorizontal: 10,
  },
  qrContainer: {
    alignItems: 'center', backgroundColor: '#F9F9F9', padding: 20,
    borderRadius: 12, marginVertical: 16, width: '100%'
  },
  bankDetailsText: { fontSize: 12, color: '#555', marginTop: 6, fontWeight: '600' },
  verifyIconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF0F3',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  verifyBonusText: {
    fontSize: 14, color: '#4B5563', textAlign: 'center', lineHeight: 20,
    marginTop: 4, paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 22, height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#E94057',
    borderColor: '#E94057',
  },
  verifyDisclaimer: {
    fontSize: 12, color: '#6B7280', flex: 1,
    lineHeight: 18,
  },
});
