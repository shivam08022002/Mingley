import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';

export const ChatBubble = ({ item }) => {
  const isMine = item.isMine;

  return (
    <View style={[styles.container, isMine ? styles.containerMine : styles.containerTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs]}>
          {item.text}
        </Text>
      </View>
      <View style={[styles.footer, isMine ? styles.footerMine : styles.footerTheirs]}>
        <Text style={styles.time}>{item.time}</Text>
        {isMine && (
           <Icon 
             name={item.read ? 'checkmark-done' : 'checkmark'} 
             size={16} 
             color="#E4415C" 
             style={styles.checkIcon} 
           />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.s,
    maxWidth: '80%',
  },
  containerMine: {
    alignSelf: 'flex-end',
  },
  containerTheirs: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  bubbleMine: {
    backgroundColor: '#FFF0F3', // Light pink
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 0,
  },
  bubbleTheirs: {
    backgroundColor: '#F5F5F5', // Light gray
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 16,
  },
  text: {
    ...TYPOGRAPHY.body,
    lineHeight: 22,
  },
  textMine: {
    color: '#000000',
  },
  textTheirs: {
    color: '#000000',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  footerMine: {
    justifyContent: 'flex-end',
  },
  footerTheirs: {
    justifyContent: 'flex-start',
  },
  time: {
    ...TYPOGRAPHY.caption,
    color: '#A0A0A0',
  },
  checkIcon: {
    marginLeft: 4,
  },
});
