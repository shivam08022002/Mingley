import { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Alert, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MatchesGridItem } from '../components/MatchesGridItem';
import { useNavigation } from '@react-navigation/native';
import { useMatchesStore } from '../store/useMatchesStore';
import { discoverService } from '../../../services/apiServices';

const TITLE_FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const TITLE_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';

export const MatchesScreen = () => {
  const navigation = useNavigation();
  const { matches, fetchMatches, removeMatch, isLoading } = useMatchesStore();
  const [likes, setLikes] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  useEffect(() => {
    fetchMatches();
    fetchLikes();
  }, [fetchMatches]);

  const fetchLikes = async () => {
    setLoadingLikes(true);
    try {
      const res = await discoverService.getLikesFeed();
      setLikes(res.data?.users || []);
    } catch (e) {
      console.error('Fetch likes error:', e);
    } finally {
      setLoadingLikes(false);
    }
  };

  const { today, yesterday } = useMemo(() => {
    // If API doesn't provide dates, we just put everything in 'today' for now
    // In a real app, we'd compare m.matchedAt with current date
    return {
      today: matches,
      yesterday: [],
    };
  }, [matches]);

  // ── Decline / Chat ────────────────────────────────────────────────────────
  const handleChat = (match) => {
    const user = match.user || match;
    navigation.navigate('Chat', { user, chatId: match.chatId });
  };

  const handleDecline = (match) => {
    const user = match.user || match;
    Alert.alert(
      'Remove Match',
      `Remove ${user.fullName || user.name} from your matches?`,
      [
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeMatch(match.matchId || match.id || match._id),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleShowDetails = (item) => {
    const user = item.user || item;
    navigation.navigate('UserProfile', { user, isFromMatches: true });
  };

  const handleLikeProfile = (user) => {
    navigation.navigate('UserProfile', { user, isFromLikes: true });
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const SectionSeparator = ({ title, count }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.line} />
      <Text style={styles.sectionTitle}>{title} {count > 0 ? `· ${count}` : ''}</Text>
      <View style={styles.line} />
    </View>
  );

  const renderLikeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.likeCard} 
      onPress={() => handleLikeProfile(item)}
      activeOpacity={0.8}
    >
      <FastImage source={{ uri: item.avatar || item.image }} style={styles.likeCardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.likeCardGradient}
      />
      <View style={styles.likeCardInfo}>
        <Text style={styles.likeCardName} numberOfLines={1}>{item.fullName || item.name}</Text>
        <Text style={styles.likeCardSub}>{item.age ? `${item.age} · ` : ''}{item.location?.city || 'Near you'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Matches</Text>
            <TouchableOpacity style={styles.sortButton}>
              <Icon name="options-outline" size={22} color="#E94057" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            People who have liked you and your matches.
          </Text>
        </View>

        {/* ── Who Likes You ── */}
        <View style={styles.likesSection}>
          <Text style={styles.likesHeading}>Who Likes You</Text>
          {loadingLikes && likes.length === 0 ? (
            <ActivityIndicator color="#E94057" style={{ marginVertical: 30 }} />
          ) : likes.length === 0 ? (
            <View style={styles.emptyLikesBox}>
              <Text style={styles.emptyLikesText}>No new likes yet. Keep swiping!</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={likes}
              keyExtractor={(item) => item.id || item._id}
              renderItem={renderLikeItem}
              contentContainerStyle={styles.likesList}
              snapToInterval={156} // card width + margin
              decelerationRate="fast"
            />
          )}
        </View>

        {/* ── Today ── */}
        {isLoading && matches.length === 0 ? (
          <ActivityIndicator size="large" color="#E94057" style={{ marginTop: 40 }} />
        ) : today.length > 0 && (
          <>
            <SectionSeparator title="Today" count={today.length} />
            <View style={styles.grid}>
              {today.map((item) => (
                <View key={item.matchId || item.id || item._id} style={styles.gridCell}>
                  <MatchesGridItem
                    match={item}
                    onPress={() => handleShowDetails(item)}
                    onChat={handleChat}
                    onDecline={handleDecline}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Yesterday ── */}
        {yesterday.length > 0 && (
          <>
            <SectionSeparator title="Yesterday" count={yesterday.length} />
            <View style={styles.grid}>
              {yesterday.map((item) => (
                <View key={item.matchId || item.id || item._id} style={styles.gridCell}>
                  <MatchesGridItem
                    match={item}
                    onPress={() => handleShowDetails(item)}
                    onChat={handleChat}
                    onDecline={handleDecline}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        {matches.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="heart-dislike-outline" size={48} color="#DDD" />
            <Text style={styles.emptyText}>No matches yet</Text>
            <Text style={styles.emptySubText}>Keep swiping to find your match!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 30 },

  // Header
  headerContainer: { marginTop: SPACING.l, marginBottom: SPACING.m, paddingHorizontal: SPACING.l },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  title: { ...TYPOGRAPHY.h1, color: '#1F1F1F', fontSize: 28, fontWeight: '500', fontFamily: TITLE_FONT },
  sortButton: {
    width: 42, height: 42, borderRadius: 14,
    borderWidth: 1, borderColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center',
  },
  subtitle: { ...TYPOGRAPHY.body, color: '#7E7E7E', lineHeight: 20, fontSize: 13, fontFamily: TITLE_FONT },

  // Section
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: SPACING.m, paddingHorizontal: SPACING.l,
  },
  line: { flex: 1, height: 1, backgroundColor: '#F0F0F0' },
  sectionTitle: { fontSize: 12, color: '#AAA', marginHorizontal: 12, fontWeight: '600' },

  // Grid (2 columns, manual)
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.s,
  },
  gridCell: { width: '50%' },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#CCC', marginTop: 16 },
  emptySubText: { fontSize: 13, color: '#CCC', marginTop: 6 },
  
  // Likes Section
  likesSection: { marginVertical: SPACING.m },
  likesHeading: { ...TYPOGRAPHY.h2, fontSize: 18, color: '#222', paddingHorizontal: SPACING.l, marginBottom: 15, fontWeight: '500', fontFamily: TITLE_FONT },
  likesList: { paddingHorizontal: SPACING.l, paddingBottom: 10 },
  likeCard: { 
    width: 140, height: 180, marginRight: 16, borderRadius: 20, 
    overflow: 'hidden', backgroundColor: '#F5F5F5',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  likeCardImage: { width: '100%', height: '100%' },
  likeCardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  likeCardInfo: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  likeCardName: { color: '#FFF', fontSize: 14, fontWeight: '800', marginBottom: 2 },
  likeCardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  emptyLikesBox: { 
    marginHorizontal: SPACING.l, padding: 20, backgroundColor: '#FAFAFA', 
    borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#DDD',
    alignItems: 'center',
  },
  emptyLikesText: { color: '#999', fontSize: 14, fontStyle: 'italic' },
});
