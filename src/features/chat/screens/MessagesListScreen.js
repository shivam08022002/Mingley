import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { AvatarList } from '../components/AvatarList';
import { MessageItem } from '../components/MessageItem';

const MOCK_ACTIVITIES = [
  { id: '1', name: 'You', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80' },
  { id: '2', name: 'Emma', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80' },
  { id: '3', name: 'Ava', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
  { id: '4', name: 'Sophia', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
];

const MOCK_MESSAGES = [
  { id: '1', name: 'Emelie', lastMessage: 'Sticker 😍', time: '23 min', unread: 1, hasActivity: true, image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80' },
  { id: '2', name: 'Abigail', isTyping: true, lastMessage: '', time: '27 min', unread: 2, hasActivity: false, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
  { id: '3', name: 'Elizabeth', lastMessage: 'Ok, see you then.', time: '33 min', unread: 0, hasActivity: true, image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80' },
  { id: '4', name: 'Penelope', lastMessage: 'You: Hey! What\'s up, long time..', time: '50 min', unread: 0, hasActivity: false, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { id: '5', name: 'Chloe', lastMessage: 'You: Hello how are you?', time: '55 min', unread: 0, hasActivity: false, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
  { id: '6', name: 'Grace', lastMessage: 'You: Great I will write later', time: '1 hour', unread: 0, hasActivity: true, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' },
];

export const MessagesListScreen = ({ navigation }) => {
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

      <AvatarList data={MOCK_ACTIVITIES} />

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
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 24,
    color: '#000000',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.m,
  },
});
