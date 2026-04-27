import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Dimensions, Modal, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MatchesGridItem } from '../components/MatchesGridItem';

const { width } = Dimensions.get('window');

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_MATCHES_INITIAL = [
  { id: '1', name: 'Leilani',   age: 19, section: 'Today',     image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80' },
  { id: '2', name: 'Annabelle', age: 20, section: 'Today',     image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=500&q=80' },
  { id: '3', name: 'Reagan',    age: 24, section: 'Today',     image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80' },
  { id: '4', name: 'Hadley',    age: 25, section: 'Today',     image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80' },
  { id: '5', name: 'Sophia',    age: 22, section: 'Yesterday', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80' },
  { id: '6', name: 'Isabella',  age: 21, section: 'Yesterday', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80' },
];

export const MatchesScreen = () => {
  const [matches, setMatches] = useState(MOCK_MATCHES_INITIAL);

  const { today, yesterday } = useMemo(() => ({
    today:     matches.filter((m) => m.section === 'Today'),
    yesterday: matches.filter((m) => m.section === 'Yesterday'),
  }), [matches]);

  // ── Accept / Reject ───────────────────────────────────────────────────────
  const handleAccept = (match) => {
    Alert.alert('Matched!', `You accepted ${match.name}. Say hello!`, [{ text: 'OK' }]);
  };

  const handleReject = (match) => {
    Alert.alert(
      'Remove Match',
      `Remove ${match.name} from your matches?`,
      [
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setMatches((prev) => prev.filter((m) => m.id !== match.id)),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderItem = ({ item }) => (
    <MatchesGridItem
      match={item}
      onPress={() => {}}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  );

  const SectionSeparator = ({ title, count }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.line} />
      <Text style={styles.sectionTitle}>{title} {count > 0 ? `· ${count}` : ''}</Text>
      <View style={styles.line} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Matches</Text>
            <TouchableOpacity style={styles.sortButton}>
              <Icon name="swap-vertical" size={22} color="#E94057" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            People who have liked you and your matches.
          </Text>
        </View>

        {/* ── Today ── */}
        {today.length > 0 && (
          <>
            <SectionSeparator title="Today" count={today.length} />
            <View style={styles.grid}>
              {today.map((item) => (
                <View key={item.id} style={styles.gridCell}>
                  <MatchesGridItem
                    match={item}
                    onPress={() => {}}
                    onAccept={handleAccept}
                    onReject={handleReject}
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
                <View key={item.id} style={styles.gridCell}>
                  <MatchesGridItem
                    match={item}
                    onPress={() => {}}
                    onAccept={handleAccept}
                    onReject={handleReject}
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
  title: { ...TYPOGRAPHY.h1, color: '#000', fontSize: 36 },
  sortButton: {
    width: 42, height: 42, borderRadius: 14,
    borderWidth: 1, borderColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center',
  },
  subtitle: { ...TYPOGRAPHY.body, color: '#888', lineHeight: 20, fontSize: 13 },

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
});
