import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { Button } from '../../../components/common/Button';

export const MatchPopup = ({ visible, user, currentUserImage, onSayHello, onKeepSwiping }) => {
  if (!user) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.cardsContainer}>
             {/* Left Card - MATCH */}
             <View style={[styles.cardWrapper, styles.leftCard]}>
               <FastImage source={{ uri: currentUserImage }} style={styles.cardImage} />
               <View style={styles.heartBadge}>
                   <Text style={{color: '#E94057', fontSize: 24}}>♥</Text>
               </View>
             </View>
             
             {/* Right Card - USER */}
             <View style={[styles.cardWrapper, styles.rightCard]}>
               <FastImage source={{ uri: user.image }} style={styles.cardImage} />
               <View style={[styles.heartBadge, styles.heartBadgeRight]}>
                   <Text style={{color: '#E94057', fontSize: 24}}>♥</Text>
               </View>
             </View>
          </View>

          <Text style={styles.title}>It's a match, {user.name}!</Text>
          <Text style={styles.subtitle}>
            Start a conversation now with each other
          </Text>

          <View style={styles.buttonsContainer}>
            <Button 
              title="Say hello" 
              onPress={onSayHello} 
              variant="solid"
              style={styles.sayHelloButton}
              textStyle={styles.buttonText}
            />
            <TouchableOpacity style={styles.keepSwipingButton} onPress={onKeepSwiping}>
              <Text style={styles.keepSwipingText}>Keep swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  cardsContainer: {
    width: 250,
    height: 300,
    position: 'relative',
    marginBottom: 60,
  },
  cardWrapper: {
    width: 160,
    height: 240,
    borderRadius: 24,
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    backgroundColor: '#fff',
  },
  leftCard: {
    left: -20,
    bottom: 0,
    transform: [{ rotate: '-10deg' }],
    zIndex: 2,
  },
  rightCard: {
    right: -20,
    top: 0,
    transform: [{ rotate: '10deg' }],
    zIndex: 1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  heartBadge: {
    position: 'absolute',
    bottom: 20,
    right: -10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  heartBadgeRight: {
    top: 20,
    left: -10,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#E94057',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 16,
    color: '#5b5b5b',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    marginBottom: 50,
    lineHeight: 24,
  },
  buttonsContainer: {
    width: '100%',
  },
  sayHelloButton: {
    borderRadius: 16,
    height: 56,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  keepSwipingButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepSwipingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E94057',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
});
