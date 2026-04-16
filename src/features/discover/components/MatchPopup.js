import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { GradientButton } from '../../../components/common/GradientButton';

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

          <Text style={styles.title}>It's a match, Jake!</Text>
          <Text style={styles.subtitle}>
            Start a conversation now with each other
          </Text>

          <View style={styles.buttonsContainer}>
            <GradientButton 
              title="Say hello" 
              onPress={onSayHello} 
              colors={['#E94057', '#E94057']} 
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
    backgroundColor: 'rgba(255,255,255,0.95)',
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
    width: 140,
    height: 200,
    borderRadius: 16,
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: '#fff',
  },
  leftCard: {
    left: 0,
    bottom: 0,
    transform: [{ rotate: '-10deg' }],
    zIndex: 2,
  },
  rightCard: {
    right: 0,
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
    bottom: -15,
    left: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  heartBadgeRight: {
    top: -15,
    left: 45,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 32,
    color: '#E94057',
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: '#5b5b5b',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    gap: SPACING.m,
  },
  keepSwipingButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepSwipingText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#E94057',
  },
});
