import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MessageItem } from '../components/MessageItem';
import { useChatStore } from '../../../store/useChatStore';
import { decodeEmoji } from '../../../utils/stringUtils';

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

  const {
    chats,
    fetchChats,
    receivedSuperchats,
    sentSuperchats,
    fetchReceivedSuperchats,
    fetchSentSuperchats,
    respondToSuperchat,
  } = useChatStore();

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchChats();
    } else {
      if (superchatTab === 'received') fetchReceivedSuperchats();
      else fetchSentSuperchats();
    }
  }, [activeTab, superchatTab, fetchChats, fetchReceivedSuperchats, fetchSentSuperchats]);

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
            navigation.navigate('Chat', { user, chatId: item.chatId });
          }
        }}
        activeOpacity={0.8}
      >
        <FastImage source={{ uri: user.avatar || 'https://via.placeholder.com/150' }} style={styles.superchatAvatar} />
        <View style={styles.superchatInfo}>
          <View style={styles.superchatHeaderRow}>
            <Text style={styles.superchatName}>{decodeEmoji(user.fullName || 'User')}</Text>
            <View style={styles.amountBadge}>
              <Icon name="flash" size={10} color="#8A2BE2" />
              <Text style={styles.amountBadgeText}>{item.coinAmount || 500}</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: '#8A2BE2',
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
