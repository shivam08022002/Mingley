import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { ChatBubble } from '../components/ChatBubble';

// Mock conversation logic
const INITIAL_MESSAGES = [
  { id: '1', text: 'Hi Jake, how are you? I saw on the app that we\'ve crossed paths several times this week 😁', time: '2:55 PM', isMine: false },
  { id: '2', text: 'Haha truly! Nice to meet you Grace! What about a cup of coffee today evening? ☕', time: '3:02 PM', isMine: true, read: true },
  { id: '3', text: 'Sure, let\'s do it! 😉', time: '3:10 PM', isMine: false },
  { id: '4', text: 'Great I will write later the exact time and place. See you soon!', time: '3:12 PM', isMine: true, read: true },
];

export const ChatScreen = ({ navigation, route }) => {
  const { user } = route?.params || { user: { name: 'Grace', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' } };
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: inputText,
        time: 'Now',
        isMine: true,
        read: false,
      }
    ]);
    setInputText('');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
         <Icon name="chevron-back" size={28} color="#000" />
      </TouchableOpacity>
      
      <View style={styles.headerUser}>
        <FastImage source={{ uri: user.image }} style={styles.avatar} />
        <View style={styles.userInfo}>
           <Text style={styles.userName}>{user.name}</Text>
           <View style={styles.statusRow}>
             <View style={styles.statusDot} />
             <Text style={styles.statusText}>Online</Text>
           </View>
        </View>
      </View>

      <TouchableOpacity style={styles.menuButton}>
         <Icon name="ellipsis-vertical" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ChatBubble item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.dateSeparator}>
               <View style={styles.line} />
               <Text style={styles.dateText}>Today</Text>
               <View style={styles.line} />
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
             <TextInput 
               style={styles.input}
               placeholder="Your message"
               placeholderTextColor="#A0A0A0"
               value={inputText}
               onChangeText={setInputText}
             />
             <TouchableOpacity style={styles.stickerIcon}>
               <Icon name="happy-outline" size={24} color="#A0A0A0" />
             </TouchableOpacity>
          </View>
          
          {inputText.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Icon name="send" size={20} color="#E4415C" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.microphoneButton}>
              <Icon name="mic" size={24} color="#E4415C" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.m,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    ...TYPOGRAPHY.h2,
    fontSize: 24,
    color: '#000000',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E4415C',
    marginRight: 4,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: '#A0A0A0',
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.l,
    paddingBottom: SPACING.xl,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: '#A0A0A0',
    marginHorizontal: SPACING.m,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingHorizontal: SPACING.m,
    marginRight: SPACING.m,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: '#000000',
    paddingRight: SPACING.s,
  },
  stickerIcon: {
    padding: 4,
  },
  microphoneButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    borderRadius: 25,
  },
});
