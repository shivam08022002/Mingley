import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MatchesGridItem } from '../components/MatchesGridItem';

const MOCK_MATCHES = [
  { id: '1', name: 'Leilani', age: 19, section: 'Today', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80' },
  { id: '2', name: 'Annabelle', age: 20, section: 'Today', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=500&q=80' },
  { id: '3', name: 'Reagan', age: 24, section: 'Today', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80' },
  { id: '4', name: 'Hadley', age: 25, section: 'Today', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80' },
  { id: '5', name: 'Sophia', age: 22, section: 'Yesterday', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80' },
  { id: '6', name: 'Isabella', age: 21, section: 'Yesterday', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80' },
];

export const MatchesScreen = () => {
  // Using memo to separate lists by section
  const { today, yesterday } = useMemo(() => {
    return {
      today: MOCK_MATCHES.filter(m => m.section === 'Today'),
      yesterday: MOCK_MATCHES.filter(m => m.section === 'Yesterday'),
    };
  }, []);

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Matches</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Icon name="swap-vertical" size={24} color="#E4415C" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        This is a list of people who have liked you and your matches.
      </Text>
    </View>
  );

  const SectionSeparator = ({ title }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.line} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.line} />
    </View>
  );

  const renderItem = ({ item }) => <MatchesGridItem match={item} onPress={() => {}} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* 
        We use FlatList instead of SectionList for easier grid support.
        Actually FlatList with ListHeaderComponent and custom list logic handles grid better.
      */}
      <FlatList
        data={[]} 
        ListHeaderComponent={() => (
          <>
            <ListHeader />
            <SectionSeparator title="Today" />
            <FlatList
              data={today}
              renderItem={renderItem}
              keyExtractor={i => i.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
            />
            <SectionSeparator title="Yesterday" />
            <FlatList
              data={yesterday}
              renderItem={renderItem}
              keyExtractor={i => i.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
            />
          </>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: SPACING.m,
    paddingBottom: 20,
  },
  headerContainer: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.l,
    paddingHorizontal: SPACING.s,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: '#000000',
    fontSize: 40,
  },
  sortButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: '#5b5b5b',
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.l,
    paddingHorizontal: SPACING.s,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodySecondary,
    color: '#5b5b5b',
    marginHorizontal: SPACING.l,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
