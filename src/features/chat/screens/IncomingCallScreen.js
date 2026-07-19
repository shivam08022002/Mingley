import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { callService } from '../../../services/apiServices';
import { signalRService } from '../../../services/signalRService';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80';

// route.params: { callId, callType, caller: { id, fullName, avatar }, timeoutIn }
export const IncomingCallScreen = ({ navigation, route }) => {
  const { callId, callType, caller, timeoutIn = 30 } = route.params;
  const pulse = useRef(new Animated.Value(1)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Auto-dismiss if the caller hangs up / call times out before we answer
    const unsubEnded = signalRService.on('CallEnded', (data) => {
      if (data.callId === callId) navigation.goBack();
    });

    timeoutRef.current = setTimeout(() => {
      navigation.goBack();
    }, timeoutIn * 1000);

    return () => {
      unsubEnded?.();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAccept = () => {
    clearTimeout(timeoutRef.current);
    navigation.replace('Calling', {
      user: { id: caller.id, name: caller.fullName, image: caller.avatar || FALLBACK_AVATAR },
      callType,
      callId,
      isIncoming: true,
    });
  };

  const handleDecline = async () => {
    clearTimeout(timeoutRef.current);
    try { await callService.declineCall(callId); } catch (e) { /* no-op */ }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <FastImage source={{ uri: caller.avatar || FALLBACK_AVATAR }} style={StyleSheet.absoluteFillObject} contentFit="cover" blurRadius={20} />
      <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.incomingLabel}>Incoming {callType === 'video' ? 'video' : 'audio'} call</Text>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <FastImage source={{ uri: caller.avatar || FALLBACK_AVATAR }} style={styles.avatar} contentFit="cover" />
          </Animated.View>
          <Text style={styles.name}>{caller.fullName}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={handleDecline} activeOpacity={0.85}>
            <Icon name="call" size={30} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
            <Text style={styles.actionLabel}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={handleAccept} activeOpacity={0.85}>
            <Icon name="call" size={30} color="#FFF" />
            <Text style={styles.actionLabel}>Accept</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 60 },
  topSection: { alignItems: 'center', marginTop: 40 },
  incomingLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 30, letterSpacing: 1 },
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  name: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 20, fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 40 },
  actionBtn: { alignItems: 'center', justifyContent: 'center', width: 84, height: 84, borderRadius: 42 },
  declineBtn: { backgroundColor: '#E94057' },
  acceptBtn: { backgroundColor: '#10B981' },
  actionLabel: { color: '#FFF', fontSize: 12, fontWeight: '600', marginTop: 6 },
});
