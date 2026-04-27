import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MessageItem } from '../components/MessageItem';

const MOCK_STORIES = [
  { id: 'mine', name: 'Your Story', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', isOwn: true, hasStory: false },
  { id: 's1',   name: 'Leilani',   image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', hasStory: true,  seen: false },
  { id: 's2',   name: 'Annabelle', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80', hasStory: true,  seen: false },
  { id: 's3',   name: 'Reagan',    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', hasStory: true,  seen: true  },
  { id: 's4',   name: 'Hadley',    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', hasStory: true,  seen: true  },
  { id: 's5',   name: 'Sophia',    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', hasStory: false, seen: false },
];

const MOCK_MESSAGES = [
  { id: '1', name: 'Emelie', lastMessage: 'Sticker 😍', time: '23 min', unread: 1, hasActivity: true, image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80' },
  { id: '2', name: 'Abigail', isTyping: true, lastMessage: '', time: '27 min', unread: 2, hasActivity: false, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
  { id: '3', name: 'Elizabeth', lastMessage: 'Ok, see you then.', time: '33 min', unread: 0, hasActivity: true, image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80' },
  { id: '4', name: 'Penelope', lastMessage: 'You: Hey! What\'s up, long time..', time: '50 min', unread: 0, hasActivity: false, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { id: '5', name: 'Chloe', lastMessage: 'You: Hello how are you?', time: '55 min', unread: 0, hasActivity: false, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
  { id: '6', name: 'Grace', lastMessage: 'You: Great I will write later', time: '1 hour', unread: 0, hasActivity: true, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' },
];

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
  const [stories, setStories] = useState(MOCK_STORIES);
  const [storyViewer, setStoryViewer] = useState(null);

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
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="options-outline" size={24} color="#E94057" />
        </TouchableOpacity>
      </View>

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

      <Text style={styles.sectionTitle}>Messages</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={MOCK_MESSAGES}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <MessageItem
            item={item}
            onPress={() => navigation.navigate('Chat', { user: item })}
          />
        )}
        showsVerticalScrollIndicator={false}
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
    color: '#000000',
    fontSize: 40,
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
    fontSize: 24,
    color: '#000000',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 24,
    color: '#000000',
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
  fullImage: { ...StyleSheet.absoluteFillObject },
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
