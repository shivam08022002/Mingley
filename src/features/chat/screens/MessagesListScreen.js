import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Platform, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Image as FastImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MessageItem } from '../components/MessageItem';
import { useChatStore } from '../../../store/useChatStore';
import { decodeEmoji } from '../../../utils/stringUtils';
import { useFocusEffect } from '@react-navigation/native';
import { callService } from '../../../services/apiServices';
import { BottomSheetContainer } from '../../../components/common/BottomSheetContainer';

const TITLE_FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const TITLE_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';

// ─── Story bubble ─────────────────────────────────────────────────────────────
const StoryBubble = React.memo(({ story, onPress }) => {
  const ringColor = story.isOwn ? '#DDD' : story.seen ? '#DDD' : '#E94057';

  return (
    <TouchableOpacity style={sStyles.bubble} onPress={onPress} activeOpacity={0.8}>
      <View style={[sStyles.ring, { borderColor: ringColor }]}>
        <FastImage source={{ uri: story.image }} style={sStyles.avatar} />
        {story.isOwn && (
          <View style={sStyles.addBadge}>
            <Icon name="add" size={12} color="#fff" />
          </View>
        )}
      </View>
      <Text style={sStyles.name} numberOfLines={1}>{story.name}</Text>
    </TouchableOpacity>
  );
});

export const MessagesListScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'superchat'
  const [superchatTab, setSuperchatTab] = useState('received'); // 'received' or 'sent'
  const [stories, setStories] = useState([]); // Will be empty until API integrated
  const [storyViewer, setStoryViewer] = useState(null);

  const [callHistoryModalVisible, setCallHistoryModalVisible] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const {
    chats,
    fetchChats,
    receivedSuperchats,
    sentSuperchats,
    fetchReceivedSuperchats,
    fetchSentSuperchats,
    respondToSuperchat,
  } = useChatStore();
  const currentUser = useChatStore((s) => s.user);

  const handleShowCallHistory = async () => {
    setCallHistoryModalVisible(true);
    setLoadingHistory(true);
    try {
      const res = await callService.getCallHistory();
      setCallHistory(res.data?.calls || res.calls || res.data?.history || res.history || []);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch call history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'messages') {
        fetchChats();
      } else {
        if (superchatTab === 'received') fetchReceivedSuperchats();
        else fetchSentSuperchats();
      }
    }, [activeTab, superchatTab, fetchChats, fetchReceivedSuperchats, fetchSentSuperchats])
  );


  const handleStoryPress = (story) => {
    if (story.isOwn) {
      Alert.alert('Add Story', 'Camera roll / record video (mock)', [{ text: 'OK' }]);
      return;
    }
    setStories((prev) => prev.map((s) => s.id === story.id ? { ...s, seen: true } : s));
    setStoryViewer(story);
  };
  const ListHeader = () => (
    <View>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.headerCallHistoryBtn} onPress={handleShowCallHistory}>
          <Icon name="time-outline" size={24} color="#E94057" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'messages' && styles.tabButtonActive]}
          onPress={() => setActiveTab('messages')}
        >
          <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'superchat' && styles.tabButtonActive]}
          onPress={() => setActiveTab('superchat')}
        >
          <Text style={[styles.tabText, activeTab === 'superchat' && styles.tabTextActive]}>Superchat</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'messages' ? (
        <>
          <View style={styles.searchContainer}>
            <Icon name="search-outline" size={20} color="#A0A0A0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#A0A0A0"
            />
          </View>

          <View style={styles.storiesContainer}>
            <Text style={styles.sectionTitleActivities}>Activities</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={stories}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <StoryBubble story={item} onPress={() => handleStoryPress(item)} />}
              contentContainerStyle={styles.storiesRow}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </>
      ) : (
        <View style={styles.superchatSubTabContainer}>
          <TouchableOpacity
            style={[styles.subTabButton, superchatTab === 'received' && styles.subTabButtonActive]}
            onPress={() => setSuperchatTab('received')}
          >
            <Text style={[styles.subTabText, superchatTab === 'received' && styles.subTabTextActive]}>Received</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTabButton, superchatTab === 'sent' && styles.subTabButtonActive]}
            onPress={() => setSuperchatTab('sent')}
          >
            <Text style={[styles.subTabText, superchatTab === 'sent' && styles.subTabTextActive]}>Sent</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {activeTab === 'messages' ? 'Recent Messages' : (superchatTab === 'received' ? 'Received Superchats' : 'Sent Superchats')}
      </Text>
    </View>
  );

  const handleRespondToSuperchat = async (id, userName) => {
    Alert.prompt(
      `Reply to ${userName}`,
      'Type your response to accept this Superchat:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: async (text) => {
            if (!text) return;
            try {
              await respondToSuperchat(id, text);
              Alert.alert('Success', 'Response sent successfully!');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to respond to Superchat');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const renderSuperchatItem = ({ item }) => {
    const isReceived = superchatTab === 'received';
    const user = isReceived 
      ? { fullName: item.fromUserName, avatar: item.fromUserAvatar, id: item.fromUserId }
      : { fullName: item.toUserName, avatar: item.toUserAvatar, id: item.toUserId };
    
    // Check if the user has already responded
    const isResponded = item.isResponded;

    return (
      <TouchableOpacity
        style={[styles.superchatItem, isResponded && { opacity: 0.7 }]}
        onPress={() => {
          if (isReceived && !isResponded) {
            handleRespondToSuperchat(item.id, decodeEmoji(user.fullName || 'User'));
          } else {
            // Do not open chat screen. Show message in alert directly from the outside.
            Alert.alert(
              'Superchat Details',
              `User: ${decodeEmoji(user.fullName || 'User')}\n\nMessage: "${item.message || 'Sent a Superchat!'}"\nValue: ${item.coinAmount || 500} coins`
            );
          }
        }}
        activeOpacity={0.8}
      >
        <FastImage source={{ uri: user.avatar || 'https://via.placeholder.com/150' }} style={styles.superchatAvatar} />
        <View style={styles.superchatInfo}>
          <View style={styles.superchatHeaderRow}>
            <Text style={styles.superchatName}>{decodeEmoji(user.fullName || 'User')}</Text>
            <View style={styles.amountBadge}>
              <Icon name="flash" size={10} color="#7C3AED" />
              <Text style={styles.amountBadgeText}>{item.coinAmount || 500} coins</Text>
            </View>
          </View>
          <Text style={styles.superchatMessage} numberOfLines={1}>
            {decodeEmoji(item.message || 'Sent a Superchat!')}
          </Text>
          <Text style={styles.superchatTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          {isResponded && (
            <Text style={{ fontSize: 11, color: '#22C55E', marginTop: 4, fontWeight: '600' }}>
              ✓ Responded
            </Text>
          )}
        </View>
        {isReceived && !isResponded && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getMessagePreview = (lastMessage) => {
    if (!lastMessage) return 'New match! Say hello 👋';
    if (lastMessage.messageType === 'GIFT') return `Sent a ${lastMessage.giftName || 'gift'} 🎁`;
    if (lastMessage.messageType === 'COINS') return `Sent ${lastMessage.coinAmount} coins 💰`;
    return lastMessage.content || '';
  };

  // ── Call History Modal ──────────────────────────────────────────────────
  const renderCallHistoryModal = () => (
    <Modal visible={callHistoryModalVisible} transparent animationType="fade" onRequestClose={() => setCallHistoryModalVisible(false)}>
      <BottomSheetContainer onClose={() => setCallHistoryModalVisible(false)} height={600}>
        <View style={{ flex: 1, width: '100%' }}>
          <View style={styles.txHeader}>
            <Text style={styles.txHeaderTitle}>Call History</Text>
          </View>
          {loadingHistory ? (
            <ActivityIndicator color="#E94057" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={callHistory}
              keyExtractor={(item, index) => item.id || String(index)}
              contentContainerStyle={styles.txList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.txEmpty}>No call history found.</Text>}
              renderItem={({ item }) => {
                const isOutgoing = item.direction === 'outgoing';
                const otherUser = isOutgoing ? item.receiver : item.caller;
                const otherName = otherUser?.fullName || 'User';
                const otherAvatar = otherUser?.avatar || 'https://via.placeholder.com/150';
                const callDate = item.createdAt ? new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent';
                const isVideo = item.callType === 'video';
                return (
                  <View style={styles.txItem}>
                    <FastImage 
                      source={{ uri: otherAvatar }} 
                      style={styles.callHistoryAvatar} 
                    />
                    <View style={styles.txLeft}>
                      <Text style={styles.txTitle}>{decodeEmoji(otherName)}</Text>
                      <View style={styles.callSubRow}>
                        <Icon 
                          name={isOutgoing ? 'arrow-up-outline' : 'arrow-down-outline'} 
                          size={12} 
                          color={isOutgoing ? '#E94057' : '#059669'} 
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.txDate}>
                          {isOutgoing ? 'Outgoing' : 'Incoming'} • {callDate}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.txRight}>
                      <View style={styles.callTypeAndStatus}>
                        <Icon 
                          name={isVideo ? 'videocam-outline' : 'call-outline'} 
                          size={16} 
                          color="#666" 
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[
                          styles.callStatusText,
                          item.status === 'active' && { color: '#059669' },
                          item.status === 'declined' && { color: '#DC2626' },
                          item.status === 'missed' && { color: '#DC2626' },
                          item.status === 'ended' && { color: '#666' }
                        ]}>
                          {item.status || 'Ended'}
                        </Text>
                      </View>
                      {item.coinsDeducted > 0 && (
                        <Text style={styles.coinsDeductedText}>
                          -{item.coinsDeducted} coins
                        </Text>
                      )}
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </BottomSheetContainer>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={activeTab === 'messages' ? chats : (superchatTab === 'received' ? receivedSuperchats : sentSuperchats)}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeader}
        renderItem={activeTab === 'messages' ? ({ item }) => (
          <MessageItem
            item={{
              id: item.chatId,
              name: item.user?.fullName || 'User',
              image: item.user?.avatar || 'https://via.placeholder.com/150',
              lastMessage: getMessagePreview(item.lastMessage),
              time: item.lastMessage ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              unread: item.unreadCount || 0,
              hasActivity: item.user?.isOnline || false,
            }}
            onPress={() => navigation.navigate('Chat', { user: item.user, chatId: item.chatId })}
          />
        ) : renderSuperchatItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={activeTab === 'superchat' && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No superchats found</Text>
          </View>
        )}
      />

      {/* ── Story viewer overlay ── */}
      {!!storyViewer && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}>
          <TouchableOpacity style={svStyles.overlay} activeOpacity={1} onPress={() => setStoryViewer(null)}>
            <FastImage source={{ uri: storyViewer.image }} style={svStyles.fullImage} resizeMode="cover" />
            <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={svStyles.topGradient} />
            <View style={svStyles.topRow}>
              <FastImage source={{ uri: storyViewer.image }} style={svStyles.tinyAvatar} />
              <Text style={svStyles.name}>{storyViewer.name}</Text>
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); setStoryViewer(null); }} style={{ marginLeft: 'auto', padding: 8 }}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={svStyles.progressBar}>
              <View style={svStyles.progressFill} />
            </View>
          </TouchableOpacity>
        </View>
      )}
      {renderCallHistoryModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    marginBottom: SPACING.l,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: '#1F1F1F',
    fontSize: 28,
    fontWeight: '500',
    fontFamily: TITLE_FONT,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingHorizontal: SPACING.m,
  },
  searchIcon: {
    marginRight: SPACING.s,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: '#000000',
    height: '100%',
  },
  sectionTitleActivities: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: '#1F1F1F',
    fontWeight: '500',
    fontFamily: TITLE_FONT,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: '#1F1F1F',
    fontWeight: '500',
    fontFamily: TITLE_FONT,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.m,
  },
  storiesContainer: {
    marginBottom: SPACING.l,
  },
  storiesRow: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.l,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    elevation: 2,
  },
  tabText: {
    ...TYPOGRAPHY.body,
    fontFamily: TITLE_FONT,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#E94057',
  },
  superchatSubTabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.m,
    gap: 12,
  },
  subTabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  subTabButtonActive: {
    backgroundColor: '#E94057',
    borderColor: '#E94057',
  },
  subTabText: {
    ...TYPOGRAPHY.caption,
    color: '#666',
    fontWeight: '600',
  },
  subTabTextActive: {
    color: '#FFFFFF',
  },
  superchatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 12,
  },
  superchatAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  superchatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  amountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  superchatInfo: {
    flex: 1,
  },
  superchatName: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  superchatMessage: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  superchatTime: {
    ...TYPOGRAPHY.caption,
    color: '#AAA',
  },
  pendingBadge: {
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    ...TYPOGRAPHY.caption,
    color: '#E94057',
    fontWeight: '700',
    fontSize: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: '#AAA',
  },
  headerCallHistoryBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txHeader: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  txHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#111', fontFamily: TITLE_MED },
  txList: { paddingVertical: 16 },
  txEmpty: { textAlign: 'center', color: '#999', marginTop: 40, fontFamily: TITLE_FONT },
  txItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  txLeft: { flex: 1, marginLeft: 12 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txTitle: { fontSize: 15, fontWeight: '600', color: '#222', fontFamily: TITLE_MED, marginBottom: 2 },
  txDate: { fontSize: 12, color: '#888', fontFamily: TITLE_FONT },
  callHistoryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  callSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTypeAndStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
    fontFamily: TITLE_MED,
  },
  coinsDeductedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    fontFamily: TITLE_MED,
  },
});

const sStyles = StyleSheet.create({
  bubble: { alignItems: 'center', marginRight: 14, width: 64 },
  ring: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2.5, padding: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  addBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#E94057', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  name: { fontSize: 11, color: '#555', marginTop: 5, textAlign: 'center', maxWidth: 64 },
});

const svStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000' },
  fullImage: { ...StyleSheet.absoluteFill },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  topRow: {
    position: 'absolute', top: 52, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  tinyAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#fff' },
  name: { fontSize: 15, fontWeight: '700', color: '#fff' },
  progressBar: {
    position: 'absolute', top: 44, left: 10, right: 10,
    height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)',
  },
  progressFill: { width: '40%', height: '100%', backgroundColor: '#fff', borderRadius: 2 },
});
