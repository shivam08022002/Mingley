import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Dimensions, Modal, Alert, ActionSheetIOS, ActivityIndicator,
  ScrollView
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { ChatBubble } from '../components/ChatBubble';
import { BottomSheetContainer } from '../../../components/common/BottomSheetContainer';
import { useChatStore } from '../../../store/useChatStore';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
};
const makeId = () => Date.now().toString();

import { userService } from '../../../services/apiServices';

// ─── Main component ───────────────────────────────────────────────────────────
export const ChatScreen = ({ navigation, route }) => {
  const routeUser = route?.params?.user || {};
  const initialChatId = route?.params?.chatId;

  const chats = useChatStore((s) => s.chats);
  const fetchChats = useChatStore((s) => s.fetchChats);

  // Resolve the actual chatId (either from params or by searching for the user in our chat list)
  const chatId = initialChatId || chats.find(c => c.user?.id === routeUser.id || c.user?.id === routeUser._id)?.chatId;

  // Use local state for the chat partner's display info
  const [partnerInfo, setPartnerInfo] = useState({
    name: routeUser.fullName || routeUser.name || 'User',
    image: routeUser.avatar || routeUser.image || 'https://via.placeholder.com/150',
    isOnline: routeUser.isOnline || false
  });

  const userId = routeUser.id || routeUser._id;

  const flatRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted]     = useState(false);
  const [sendingGift, setSendingGift] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Modal visibility
  const [giftModalVisible,    setGiftModalVisible]    = useState(false);
  const [coinsModalVisible,   setCoinsModalVisible]   = useState(false);
  const [menuModalVisible,    setMenuModalVisible]    = useState(false);
  const [reportModalVisible,  setReportModalVisible]   = useState(false);

  // Report inputs
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc]     = useState('');

  // Coin-transfer inputs
  const [coinInputText, setCoinInputText] = useState('');
  const [utrIdText, setUtrIdText]         = useState('');

  // ── Zustand ──────────────────────────────────────────────────────────────
  const currentUser           = useChatStore((s) => s.user);
  const wallet                = useChatStore((s) => s.wallet);
  const messages              = useChatStore((s) => s.messages);
  const gifts                 = useChatStore((s) => s.gifts);
  const fetchGiftCatalog      = useChatStore((s) => s.fetchGiftCatalog);
  const freeMessagesLeft      = useChatStore((s) => s.freeMessagesLeft);
  const deductCoin            = useChatStore((s) => s.deductCoin);
  const decrementFreeMessages = useChatStore((s) => s.decrementFreeMessages);
  const sendGiftAction        = useChatStore((s) => s.sendGift);
  const sendCoinsInChat       = useChatStore((s) => s.sendCoinsInChat);
  const withdrawCoins         = useChatStore((s) => s.withdrawCoins);
  const pushMessage           = useChatStore((s) => s.pushMessage);
  const clearMessages         = useChatStore((s) => s.clearMessages);
  const fetchChatMessages     = useChatStore((s) => s.fetchMessages);
  const sendChatMessage       = useChatStore((s) => s.sendChatMessage);
  const markChatAsRead        = useChatStore((s) => s.markChatAsRead);
  const getChatQuota          = useChatStore((s) => s.getChatQuota);
  const chatQuota             = useChatStore((s) => s.chatQuota);
  const setDepositModalVisible = useChatStore((s) => s.setDepositModalVisible);

  React.useEffect(() => {
    fetchGiftCatalog();
    useChatStore.getState().fetchWalletBalance();
    
    if (!initialChatId) {
      fetchChats();
    }
  }, [fetchGiftCatalog, initialChatId, fetchChats]);

  React.useEffect(() => {
    // Update partner info and fetch messages if we have a chatId
    if (chatId) {
      const loadMessages = async () => {
        setLoadingMessages(true);
        try {
          await fetchChatMessages(chatId);
          await markChatAsRead(chatId);
          await getChatQuota(chatId);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingMessages(false);
        }
      };
      loadMessages();
      
      const currentChat = chats.find(c => c.chatId === chatId);
      if (currentChat?.user) {
        setPartnerInfo({
          name: currentChat.user.fullName || currentChat.user.name,
          image: currentChat.user.avatar || currentChat.user.image,
          isOnline: currentChat.user.isOnline
        });
      }
    }
  }, [chatId, fetchChatMessages, markChatAsRead, getChatQuota, chats]);

  const isMale   = currentUser.gender === 'male';
  const isFemale = currentUser.gender === 'female';

  // Quota-based sending logic
  const hasFreeMessages = chatQuota?.freeRemaining > 0;
  const hasPaidQuota = chatQuota?.remaining > 0;
  const canAffordMessage = wallet.coins >= (chatQuota?.costPerMessage || 0);

  const canSend = chatQuota 
    ? (hasFreeMessages || (hasPaidQuota && canAffordMessage))
    : (isMale ? wallet.coins > 0 : isFemale ? freeMessagesLeft > 0 || wallet.coins > 0 : true);

  const warningText = chatQuota
    ? (!hasFreeMessages ? `Messages cost ${chatQuota.costPerMessage} coins` : null)
    : (!canSend ? 'You need coins to send messages' : null);

  const showTopUp = !canSend || (chatQuota && !hasFreeMessages && !canAffordMessage);

  const scrollToEnd = () => setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!inputText.trim() || !canSend) return;

    try {
      if (chatId) {
        await sendChatMessage(chatId, inputText.trim());
        setInputText('');
      } else {
        if (isMale) deductCoin();
        else if (isFemale) {
          if (freeMessagesLeft > 0) decrementFreeMessages();
          else deductCoin();
        }
        pushMessage({ id: makeId(), text: inputText.trim(), time: nowTime(), isMine: true, read: false, createdAt: new Date().toISOString() });
        setInputText('');
        scrollToEnd();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleSendGift = async (gift) => {
    setSendingGift(true);
    try {
      const cost = gift.coinCost || gift.price || gift.cost;
      const ok = await sendGiftAction(userId, gift.id, chatId || '', `Sent a ${gift.name}`);
      if (ok) {
        setGiftModalVisible(false);
        pushMessage({
          id: makeId(),
          type: 'gift',
          icon: gift.icon,
          giftName: gift.name,
          cost: cost,
          time: nowTime(),
          isMine: true,
          read: false,
          createdAt: new Date().toISOString()
        });
        scrollToEnd();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send gift');
    } finally {
      setSendingGift(false);
    }
  };

  const handleTransferCoins = async () => {
    const amount = parseInt(coinInputText, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    
    if (wallet.coins < amount) {
      Alert.alert('Error', 'Insufficient coins.');
      return;
    }

    try {
      await sendCoinsInChat(chatId, amount, `Sent you ${amount} coins! 💰`);
      setCoinsModalVisible(false);
      setCoinInputText('');
      scrollToEnd();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send coins');
    }
  };

  const handleDepositSubmit = () => {
    if (!utrIdText.trim()) { Alert.alert('Error', 'Please enter your UTR ID.'); return; }
    Alert.alert('Screenshot Upload', 'Please upload a screenshot of your payment.', [
      { text: 'Mock Upload', onPress: () => {
          Alert.alert('Success', 'Deposit request submitted. Your coins will reflect soon.');
          setDepositModalVisible(false);
          setUtrIdText('');
      }},
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  // ── Call picker ───────────────────────────────────────────────────────────
  const handleCallPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Voice Call', 'Video Call'], cancelButtonIndex: 0 },
        (idx) => {
          if (idx === 1) navigation.navigate('Calling', { user: partnerInfo, callType: 'audio' });
          if (idx === 2) navigation.navigate('Calling', { user: partnerInfo, callType: 'video' });
        }
      );
    } else {
      Alert.alert('Start Call', '', [
        { text: 'Voice Call', onPress: () => navigation.navigate('Calling', { user: partnerInfo, callType: 'audio' }) },
        { text: 'Video Call', onPress: () => navigation.navigate('Calling', { user: partnerInfo, callType: 'video' }) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // ── Three-dot menu ────────────────────────────────────────────────────────
  const handleBlockUser = () => {
    Alert.alert('Block User', `Are you sure you want to block ${partnerInfo.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            await userService.blockUser(userId);
            Alert.alert('Success', 'User blocked successfully.');
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.message || 'Failed to block user');
          }
        }
      }
    ]);
    setMenuModalVisible(false);
  };

  const handleReportUser = () => {
    setMenuModalVisible(false);
    setReportModalVisible(true);
  };

  const submitReport = async () => {
    if (!reportReason) {
      Alert.alert('Error', 'Please provide a reason');
      return;
    }
    try {
      await userService.reportUser(userId, { reason: reportReason, description: reportDesc });
      setReportModalVisible(false);
      Alert.alert('Success', 'Report submitted successfully');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to submit report');
    }
  };

  const MENU_OPTIONS = [
    { icon: 'notifications-off-outline', label: isMuted ? 'Unmute Notifications' : 'Mute Notifications', action: () => { setIsMuted(!isMuted); setMenuModalVisible(false); } },
    { icon: 'trash-outline',             label: 'Clear Chat',       action: () => { clearMessages(); setMenuModalVisible(false); } },
    { icon: 'person-remove-outline',     label: 'Unmatch',          action: () => { Alert.alert('Unmatch', `Are you sure you want to unmatch ${partnerInfo.name}?`, [{ text: 'Yes', style: 'destructive', onPress: () => navigation.goBack() }, { text: 'Cancel', style: 'cancel' }]); setMenuModalVisible(false); } },
    { icon: 'ban-outline',               label: 'Block User',       action: handleBlockUser },
    { icon: 'flag-outline',              label: 'Report',           action: handleReportUser },
  ];

  // ── Header ────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Icon name="chevron-back" size={26} color="#000" />
      </TouchableOpacity>

      <View style={styles.headerUser}>
        <FastImage source={{ uri: partnerInfo.image }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{partnerInfo.name}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, !partnerInfo.isOnline && { backgroundColor: '#A0A0A0' }]} />
            <Text style={styles.statusText}>{partnerInfo.isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.headerActions}>
        {/* Coin balance badge */}
        <View style={styles.coinBadge}>
          <Icon name="logo-bitcoin" size={14} color="#FFD700" style={{ marginRight: 2 }} />
          <Text style={styles.coinBadgeText}>{wallet.coins}</Text>
        </View>

        {/* Single call button — tap to choose voice or video */}
        <TouchableOpacity style={styles.iconBtn} onPress={handleCallPress}>
          <Icon name="call-outline" size={20} color="#E94057" />
        </TouchableOpacity>

        {/* Three-dot menu */}
        <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuModalVisible(true)}>
          <Icon name="ellipsis-vertical" size={20} color="#444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Gift Modal ────────────────────────────────────────────────────────────
  const renderGiftModal = () => {
    return (
      <Modal visible={giftModalVisible} transparent animationType="slide" onRequestClose={() => setGiftModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => !sendingGift && setGiftModalVisible(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.modalTitle}>Send a Gift</Text>
              {sendingGift && <ActivityIndicator color="#E94057" />}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.modalSub}>Balance: </Text>
              <Icon name="logo-bitcoin" size={14} color="#FFD700" style={{ marginRight: 2 }} />
              <Text style={styles.modalSubBold}>{wallet.coins} coins</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.giftScrollContainer}>
              {gifts.map((gift) => {
                const cost = gift.coinCost || gift.price || 0;
                const afford = wallet.coins >= cost;

                return (
                  <TouchableOpacity 
                    key={gift.id} 
                    style={[styles.giftCardHorizontal, (!afford || sendingGift) && styles.giftCardDisabled]} 
                    onPress={() => handleSendGift(gift)} 
                    disabled={!afford || sendingGift} 
                    activeOpacity={0.75}
                  >
                    <View style={styles.giftIconWrap}>
                      <Icon name={gift.icon || 'gift-outline'} size={32} color={afford ? '#E94057' : '#999'} />
                    </View>
                    <Text style={styles.giftCardLabel} numberOfLines={1}>{gift.name}</Text>
                    <View style={styles.giftCardCostRow}>
                      <Icon name="logo-bitcoin" size={11} color={afford ? '#FFD700' : '#C0C0C0'} />
                      <Text style={[styles.giftCardCost, !afford && { color: '#C0C0C0' }]}>{cost}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ── Send Coins Modal ──────────────────────────────────────────────────────
  const renderCoinsModal = () => (
    <Modal visible={coinsModalVisible} transparent animationType="slide" onRequestClose={() => setCoinsModalVisible(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCoinsModalVisible(false)}>
        <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Send Coins</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Text style={styles.modalSub}>Your balance: </Text>
            <Icon name="logo-bitcoin" size={14} color="#FFD700" style={{ marginRight: 2 }} />
            <Text style={styles.modalSubBold}>{wallet.coins} coins</Text>
          </View>
          <TextInput style={styles.amountInput} placeholder="Enter amount" placeholderTextColor="#A0A0A0" keyboardType="numeric" value={coinInputText} onChangeText={setCoinInputText} />
          <TouchableOpacity style={[styles.modalActionBtn, !coinInputText && styles.modalActionBtnDisabled]} onPress={handleTransferCoins} disabled={!coinInputText}>
            <Icon name="paper-plane-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.modalActionBtnText}>Send to {partnerInfo.name}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ── Three-dot menu modal ──────────────────────────────────────────────────
  const renderMenuModal = () => (
    <Modal visible={menuModalVisible} transparent animationType="slide" onRequestClose={() => setMenuModalVisible(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuModalVisible(false)}>
        <View style={styles.menuSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHandle} />
          <Text style={styles.menuTitle}>{partnerInfo.name}</Text>
          {MENU_OPTIONS.map((opt, i) => (
            <TouchableOpacity key={i} style={[styles.menuRow, opt.label === 'Block User' && styles.menuRowDanger, opt.label === 'Report' && styles.menuRowDanger]} onPress={opt.action} activeOpacity={0.7}>
              <Icon name={opt.icon} size={20} color={opt.label === 'Block User' || opt.label === 'Report' ? '#DC2626' : '#333'} style={{ marginRight: 14 }} />
              <Text style={[styles.menuRowText, (opt.label === 'Block User' || opt.label === 'Report') && styles.menuRowTextDanger]}>{opt.label}</Text>
              <Icon name="chevron-forward" size={16} color="#CCC" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ── Report Modal ──────────────────────────────────────────────────────────
  const renderReportModal = () => (
    <Modal visible={reportModalVisible} transparent animationType="slide" onRequestClose={() => setReportModalVisible(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setReportModalVisible(false)}>
        <TouchableOpacity style={styles.modalSheet} activeOpacity={1}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Report User</Text>
          <TextInput 
            style={styles.amountInput} 
            placeholder="Reason (e.g., Harassment)" 
            placeholderTextColor="#A0A0A0" 
            value={reportReason} 
            onChangeText={setReportReason} 
          />
          <TextInput 
            style={[styles.amountInput, { height: 100, textAlignVertical: 'top' }]} 
            placeholder="Description (optional)" 
            placeholderTextColor="#A0A0A0" 
            multiline 
            value={reportDesc} 
            onChangeText={setReportDesc} 
          />
          <TouchableOpacity style={[styles.modalActionBtn, !reportReason && styles.modalActionBtnDisabled]} onPress={submitReport} disabled={!reportReason}>
            <Text style={styles.modalActionBtnText}>Submit Report</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <BottomSheetContainer height={SCREEN_HEIGHT * 0.90} onClose={() => navigation.goBack()} containerStyle={styles.containerStyle}>
      <KeyboardAvoidingView style={styles.containerInside} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}>
        {renderHeader()}
        {renderGiftModal()}
        {renderCoinsModal()}
        {renderMenuModal()}
        {renderReportModal()}

        {loadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E94057" />
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble item={item} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            inverted={true}
            onContentSizeChange={scrollToEnd}
            ListHeaderComponent={
              <View style={styles.dateSeparator}>
                <View style={styles.line} />
                <Text style={styles.dateText}>Today</Text>
                <View style={styles.line} />
              </View>
            }
          />
        )}

        {/* ── Indicators ── */}
        {chatQuota ? (
          chatQuota.freeRemaining > 0 && (
            <View style={styles.freeMsgBanner}>
              <Icon name="chatbubble-ellipses-outline" size={13} color="#E94057" style={{ marginRight: 5 }} />
              <Text style={styles.freeMsgText}>Free messages left: <Text style={styles.freeMsgCount}>{chatQuota.freeRemaining}</Text></Text>
            </View>
          )
        ) : (
          isFemale && freeMessagesLeft > 0 && (
            <View style={styles.freeMsgBanner}>
              <Icon name="chatbubble-ellipses-outline" size={13} color="#E94057" style={{ marginRight: 5 }} />
              <Text style={styles.freeMsgText}>Free messages left: <Text style={styles.freeMsgCount}>{freeMessagesLeft}</Text></Text>
            </View>
          )
        )}
        {warningText && (
          <View style={styles.warningBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="information-circle-outline" size={13} color="#B45309" style={{ marginRight: 5 }} />
              <Text style={styles.warningText}>{warningText}</Text>
            </View>
            {showTopUp && (
              <TouchableOpacity style={styles.topupBtn} onPress={() => setDepositModalVisible(true)}>
                <Text style={styles.topupBtnText}>Top up</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Actions bar ── */}
        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionChip} onPress={() => setGiftModalVisible(true)}>
            <Icon name="gift-outline" size={14} color="#E94057" />
            <Text style={styles.actionChipText}>Gift</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionChip} onPress={() => setCoinsModalVisible(true)}>
            <Icon name="logo-bitcoin" size={14} color="#FFD700" />
            <Text style={styles.actionChipText}>Send Coins</Text>
          </TouchableOpacity>
        </View>

        {/* ── Input row ── */}
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, !canSend && styles.inputWrapperDisabled]}>
            <TextInput
              style={styles.input}
              placeholder="Your message"
              placeholderTextColor="#A0A0A0"
              value={inputText}
              onChangeText={setInputText}
              editable={canSend}
            />
            <TouchableOpacity style={styles.stickerIcon}>
              <Icon name="happy-outline" size={24} color="#A0A0A0" />
            </TouchableOpacity>
          </View>
          {inputText.trim() ? (
            <TouchableOpacity style={[styles.sendButton, !canSend && styles.sendButtonDisabled]} onPress={handleSend} disabled={!canSend}>
              <Icon name="send" size={20} color={canSend ? '#E94057' : '#C0C0C0'} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.microphoneButton}>
              <Icon name="mic" size={24} color="#E94057" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </BottomSheetContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  containerStyle: { backgroundColor: 'rgba(0,0,0,0.5)' },
  containerInside: { flex: 1 },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  backBtn: {
    width: 34, height: 34,
    justifyContent: 'center', alignItems: 'center',
  },
  headerUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  avatar: { width: 38, height: 38, borderRadius: 19, flexShrink: 0 },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { ...TYPOGRAPHY.h3, fontSize: 16, color: '#000', marginBottom: 0, flexShrink: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E', marginRight: 4 },
  statusText: { fontSize: 11, color: '#A0A0A0' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },

  coinBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFF0F3', paddingHorizontal: 7, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, borderColor: '#FFD6DE',
  },
  coinBadgeText: { fontSize: 11, fontWeight: '700', color: '#E94057' },

  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1, borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
  },

  // ── Message list ─────────────────────────────────────────────────────────
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  dateSeparator: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#F0F0F0' },
  dateText: { fontSize: 12, color: '#A0A0A0', marginHorizontal: 16 },

  // ── Banners ──────────────────────────────────────────────────────────────
  freeMsgBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF0F3', paddingHorizontal: 16, paddingVertical: 5,
    borderTopWidth: 1, borderTopColor: '#FFD6DE',
  },
  freeMsgText: { fontSize: 12, color: '#E94057' },
  freeMsgCount: { fontWeight: '700' },
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#FDE68A',
  },
  warningText: { fontSize: 12, color: '#B45309', fontWeight: '500' },
  topupBtn: { backgroundColor: '#E94057', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  topupBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  // ── Actions bar ──────────────────────────────────────────────────────────
  actionsBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 6, gap: 8,
    backgroundColor: '#FAFAFA', borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  actionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#FFF0F3', borderWidth: 1, borderColor: '#FFD6DE',
  },
  actionChipCashout: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  actionChipText: { fontSize: 12, fontWeight: '600', color: '#E94057' },

  // ── Input row ────────────────────────────────────────────────────────────
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    height: 46, borderRadius: 23, borderWidth: 1, borderColor: '#F0F0F0',
    paddingHorizontal: 12, marginRight: 10,
  },
  inputWrapperDisabled: { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0', opacity: 0.7 },
  input: { flex: 1, fontSize: 14, color: '#000', paddingRight: 8 },
  stickerIcon: { padding: 2 },
  microphoneButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  sendButton: {
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFF0F3', borderRadius: 22,
  },
  sendButtonDisabled: { backgroundColor: '#F0F0F0', opacity: 0.6 },

  // ── Shared modal ─────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 36,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#E0E0E0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#777' },
  modalSubBold: { fontWeight: '700', color: '#E94057' },

  // ── Gift grid ────────────────────────────────────────────────────────────
  giftGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start', 
    gap: 12,
    marginTop: 8 
  },
  giftCard: {
    width: (SCREEN_WIDTH - 48 - 24) / 3, // ScreenWidth - Padding - Gap
    alignItems: 'center', 
    paddingVertical: 16,
    borderRadius: 18, 
    backgroundColor: '#FFF0F3',
    borderWidth: 1.5, 
    borderColor: '#FFD6DE',
  },
  giftCardDisabled: { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0', opacity: 0.55 },
  giftCardEmoji: { fontSize: 32, marginBottom: 8, textAlign: 'center' },
  giftCardLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 4, textAlign: 'center' },
  giftCardCostRow: { flexDirection: 'row', alignItems: 'center', gap: 3, justifyContent: 'center' },
  giftCardCost: { fontSize: 12, fontWeight: '700', color: '#E94057' },

  // ── Coins/cashout input ───────────────────────────────────────────────────
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

  // ── Three-dot menu sheet ──────────────────────────────────────────────────
  menuSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40,
  },
  menuTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 18, textAlign: 'center' },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  menuRowDanger: {},
  menuRowText: { fontSize: 15, color: '#222', fontWeight: '500' },
  menuRowTextDanger: { color: '#DC2626' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftScrollContainer: {
    paddingRight: 24,
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
  },
  giftCardHorizontal: {
    width: 110,
    alignItems: 'center', 
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 20, 
    backgroundColor: '#FFF0F3',
    borderWidth: 1.5, 
    borderColor: '#FFD6DE',
    shadowColor: '#E94057',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  giftIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
});
