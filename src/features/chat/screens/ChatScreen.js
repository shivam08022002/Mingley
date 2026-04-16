import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { ChatBubble } from '../components/ChatBubble';
import { BottomSheetContainer } from '../../../components/common/BottomSheetContainer';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Mock conversation logic
const INITIAL_MESSAGES = [
  { id: '1', text: 'Hi Jake, how are you? I saw on the app that we\'ve crossed paths several times this week 😁', time: '2:55 PM', isMine: false },
  { id: '2', text: 'Haha truly! Nice to meet you Grace! What about a cup of coffee today evening? ☕', time: '3:02 PM', isMine: true, read: true },
  { id: '3', text: 'Sure, let\'s do it! 😉', time: '3:10 PM', isMine: false },
  { id: '4', text: 'Great I will write later the exact time and place. See you soon!', time: '3:12 PM', isMine: true, read: true },
];

export const ChatScreen = ({ navigation, route }) => {
  const { user } = route?.params || { user: { name: 'Grace', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=150&q=80' } };
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

      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.callButton} 
          onPress={() => navigation.navigate('Calling', { user })}
        >
           <Icon name="call" size={22} color="#E94057" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
           <Icon name="ellipsis-vertical" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <BottomSheetContainer 
      height={SCREEN_HEIGHT * 0.90} 
      onClose={() => navigation.goBack()}
      containerStyle={styles.containerStyle}
    >
      <KeyboardAvoidingView 
        style={styles.containerInside}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
      >
        {renderHeader()}
        
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
              <Icon name="send" size={20} color="#E94057" />
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

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  containerInside: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6, // Matches children padding
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  headerUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    ...TYPOGRAPHY.h3,
    fontSize: 18,
    color: '#000000',
    marginBottom: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E94057',
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  dateText: {
    fontSize: 12,
    color: '#A0A0A0',
    marginHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingHorizontal: 12,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    paddingRight: 8,
  },
  stickerIcon: {
    padding: 2,
  },
  microphoneButton: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    borderRadius: 23,
  },
});
