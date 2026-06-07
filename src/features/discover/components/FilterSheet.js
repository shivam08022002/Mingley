import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Switch,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useFilterStore } from '../store/useFilterStore';
import { useChatStore } from '../../../store/useChatStore';
import { userService, subscriptionService } from '../../../services/apiServices';
import { BottomSheetContainer } from '../../../components/common/BottomSheetContainer';
import * as Location from 'expo-location';
import { useProfileStore } from '../../profile/store/useProfileStore';
import { useTheme } from '../../../theme/ThemeContext';

const { height, width } = Dimensions.get('window');

// ─── Simple single-thumb slider ────────────────────────────────────────────
const SingleSlider = React.memo(({ value, min, max, onChange }) => {
  const { theme } = useTheme();
  const [trackWidth, setTrackWidth] = useState(300);
  const dragStartValue = useRef(value);

  const valueRef = useRef(value);
  const minRef = useRef(min);
  const maxRef = useRef(max);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
    minRef.current = min;
    maxRef.current = max;
    onChangeRef.current = onChange;
  });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartValue.current = Math.max(minRef.current, Math.min(maxRef.current, valueRef.current));
      },
      onPanResponderMove: (_, gs) => {
        if (trackWidth <= 0) return;
        const deltaVal = (gs.dx / trackWidth) * (maxRef.current - minRef.current);
        const newVal = Math.max(minRef.current, Math.min(maxRef.current, Math.round(dragStartValue.current + deltaVal)));
        onChangeRef.current(newVal);
      },
    })
  ).current;

  const clampedValue = Math.max(min, Math.min(max, value));
  const denom = max - min > 0 ? max - min : 1;
  const pos = ((clampedValue - min) / denom) * trackWidth;

  return (
    <View
      style={sl.container}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width || 300)}
    >
      <View style={[sl.track, { backgroundColor: theme.isDark ? '#333333' : '#F0F0F0' }]} />
      <View style={[sl.fill, { left: 0, width: pos, backgroundColor: theme.accent }]} />
      <View {...pan.panHandlers} style={[
        sl.thumb,
        {
          left: pos - 12,
          backgroundColor: theme.accent,
          borderColor: theme.isDark ? '#1A1A1A' : '#FFFFFF'
        }
      ]} />
    </View>
  );
});

// ─── Dual-thumb range slider ────────────────────────────────────────────────
const RangeSlider = React.memo(({ min, max, low, high, onChangeLow, onChangeHigh }) => {
  const { theme } = useTheme();
  const [trackWidth, setTrackWidth] = useState(300);
  const dragStartLow = useRef(low);
  const dragStartHigh = useRef(high);

  const lowRef = useRef(low);
  const highRef = useRef(high);
  const minRef = useRef(min);
  const maxRef = useRef(max);
  const onChangeLowRef = useRef(onChangeLow);
  const onChangeHighRef = useRef(onChangeHigh);

  useEffect(() => {
    lowRef.current = low;
    highRef.current = high;
    minRef.current = min;
    maxRef.current = max;
    onChangeLowRef.current = onChangeLow;
    onChangeHighRef.current = onChangeHigh;
  });

  const panLow = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartLow.current = Math.max(minRef.current, Math.min(maxRef.current, lowRef.current));
      },
      onPanResponderMove: (_, gs) => {
        if (trackWidth <= 0) return;
        const deltaVal = (gs.dx / trackWidth) * (maxRef.current - minRef.current);
        const newVal = Math.max(minRef.current, Math.min(highRef.current - 2, Math.round(dragStartLow.current + deltaVal)));
        onChangeLowRef.current(newVal);
      },
    })
  ).current;

  const panHigh = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartHigh.current = Math.max(minRef.current, Math.min(maxRef.current, highRef.current));
      },
      onPanResponderMove: (_, gs) => {
        if (trackWidth <= 0) return;
        const deltaVal = (gs.dx / trackWidth) * (maxRef.current - minRef.current);
        const newVal = Math.max(lowRef.current + 2, Math.min(maxRef.current, Math.round(dragStartHigh.current + deltaVal)));
        onChangeHighRef.current(newVal);
      },
    })
  ).current;

  const clampedLow = Math.max(min, Math.min(max, low));
  const clampedHigh = Math.max(min, Math.min(max, high));
  const denom = max - min > 0 ? max - min : 1;
  const lowPos = ((clampedLow - min) / denom) * trackWidth;
  const highPos = ((clampedHigh - min) / denom) * trackWidth;

  return (
    <View
      style={sl.container}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width || 300)}
    >
      <View style={[sl.track, { backgroundColor: theme.isDark ? '#333333' : '#F0F0F0' }]} />
      <View style={[sl.fill, { left: lowPos, width: highPos - lowPos, backgroundColor: theme.accent }]} />
      <View {...panLow.panHandlers} style={[
        sl.thumb,
        {
          left: lowPos - 12,
          backgroundColor: theme.accent,
          borderColor: theme.isDark ? '#1A1A1A' : '#FFFFFF'
        }
      ]} />
      <View {...panHigh.panHandlers} style={[
        sl.thumb,
        {
          left: highPos - 12,
          backgroundColor: theme.accent,
          borderColor: theme.isDark ? '#1A1A1A' : '#FFFFFF'
        }
      ]} />
    </View>
  );
});


import { useSubscriptionStore } from '../../subscription/store/useSubscriptionStore';

const FALLBACK_INTERESTS = [
  { id: '1', name: 'Photography', icon: 'camera-outline' },
  { id: '2', name: 'Shopping', icon: 'bag-handle-outline' },
  { id: '3', name: 'Karaoke', icon: 'mic-outline' },
  { id: '4', name: 'Yoga', icon: 'body-outline' },
  { id: '5', name: 'Cooking', icon: 'restaurant-outline' },
  { id: '6', name: 'Tennis', icon: 'tennisball-outline' },
  { id: '7', name: 'Run', icon: 'walk-outline' },
  { id: '8', name: 'Swimming', icon: 'water-outline' },
  { id: '9', name: 'Art', icon: 'color-palette-outline' },
  { id: '10', name: 'Traveling', icon: 'airplane-outline' },
  { id: '11', name: 'Extreme', icon: 'bicycle-outline' },
  { id: '12', name: 'Music', icon: 'musical-notes-outline' },
  { id: '13', name: 'Drink', icon: 'wine-outline' },
  { id: '14', name: 'Video games', icon: 'game-controller-outline' },
  { id: '15', name: 'Movies', icon: 'film-outline' },
  { id: '16', name: 'Reading', icon: 'book-outline' },
  { id: '17', name: 'Gym', icon: 'barbell-outline' },
  { id: '18', name: 'Coffee', icon: 'cafe-outline' },
  { id: '19', name: 'Hiking', icon: 'compass-outline' },
  { id: '20', name: 'Coding', icon: 'code-slash-outline' },
  { id: '21', name: 'Pets', icon: 'paw-outline' },
  { id: '22', name: 'Foodie', icon: 'pizza-outline' },
];

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ─── Main FilterSheet ───────────────────────────────────────────────────────
export const FilterSheet = React.memo(({ visible, onClose, onApply }) => {
  const {
    interestedIn, setInterestedIn,
    location, setLocation,
    distance, setDistance,
    ageRange, setAgeRange,
    onlineStatus, setOnlineStatus,
    nearbyOnly, setNearbyOnly,
    verifiedOnly, setVerifiedOnly,
    interests, toggleInterest,
    relationshipType, setRelationshipType,
    reset,
  } = useFilterStore();
  const { theme } = useTheme();
  const PINK = '#E94057';

  const [allInterests, setAllInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [isTravelMode, setIsTravelMode] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [localDistance, setLocalDistance] = useState(distance);
  const [localAgeRange, setLocalAgeRange] = useState(ageRange);

  useEffect(() => {
    setLocalDistance(distance);
  }, [distance]);

  useEffect(() => {
    setLocalAgeRange(ageRange);
  }, [ageRange]);

  const debouncedSetDistance = useCallback(
    debounce((val) => {
      setDistance(val);
    }, 200),
    [setDistance]
  );

  const debouncedSetAgeRange = useCallback(
    debounce((val) => {
      setAgeRange(val);
    }, 200),
    [setAgeRange]
  );

  useEffect(() => {
    const fetchInterestsAndPreferences = async () => {
      setLoadingInterests(true);
      try {
        const [intRes, meRes] = await Promise.all([
          userService.getInterests(),
          userService.getMe()
        ]);

        const apiInterests = intRes.data?.interests || intRes.interests;
        setAllInterests(apiInterests && apiInterests.length > 0 ? apiInterests : FALLBACK_INTERESTS);

        const user = meRes.data || meRes;
        if (user?.location) {
          setUserLocation(user.location.city ? `${user.location.city}, ${user.location.country || ''}` : '');
        }
        setIsTravelMode(user?.isTravelMode || false);

        // Fetch subscription status to enforce limits
        let userIsActive = false;
        let userPlan = null;
        try {
          const statusRes = await subscriptionService.getStatus();
          const activeStatus = statusRes.data || statusRes;
          userIsActive = activeStatus?.isActive || activeStatus?.status === 'active';
          userPlan = userIsActive ? activeStatus?.planName?.toLowerCase() : null;
        } catch (subErr) {
          console.error('Fetch subscription status error in filter:', subErr);
        }

        const hasPlatinum = userPlan === 'platinum' || userPlan === 'vip';
        const hasGoldOrPlatinum = userPlan === 'gold' || userPlan === 'platinum' || userPlan === 'vip';

        // Sync filter store with backend preferences
        const pref = meRes.data?.preference;
        if (pref) {
          useFilterStore.setState({
            interestedIn: pref.interestedIn || 'both',
            distance: pref.maxDistance || 50,
            ageRange: [pref.minAge || 18, pref.maxAge || 40],
            relationshipType: pref.relationshipType || 'both',
            nearbyOnly: hasPlatinum ? (pref.nearbyOnly || false) : false,
            onlineStatus: hasGoldOrPlatinum ? (pref.onlineOnly || false) : false,
            verifiedOnly: userIsActive ? (pref.verifiedOnly || false) : false,
            location: pref.location || ''
          });
        }
      } catch (error) {
        console.error('Fetch filter data error:', error);
      } finally {
        setLoadingInterests(false);
      }
    };
    if (visible) fetchInterestsAndPreferences();
  }, [visible]);

  const { currentStatus, fetchStatus } = useSubscriptionStore();
  const isPremium = currentStatus?.isActive || false;
  const planLower = currentStatus?.planName?.toLowerCase() || '';
  const isVip = currentStatus?.isActive && planLower.includes('vip');
  const isPlatinum = currentStatus?.isActive && planLower.includes('platinum');
  const isGold = currentStatus?.isActive && planLower.includes('gold');
  const hasNearbyAccess = isPlatinum || isVip;
  const hasOnlineAccess = isGold || isPlatinum || isVip;
  const navigation = useNavigation();

  useEffect(() => {
    if (visible) {
      fetchStatus();
    }
  }, [visible, fetchStatus]);

  const handleUpgradePrompt = (feature) => {
    Alert.alert(
      '🔒 Premium Feature',
      `Upgrade to a premium plan to use ${feature}.`,
      [
        {
          text: 'Upgrade Now',
          onPress: () => {
            onClose();
            navigation.navigate('SubscriptionPlans');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Swipe-down on handle → close
  const swipeDownPan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => gs.dy > 4,
    onPanResponderRelease: (_, gs) => {
      if (gs.dy > 60) onClose();
    },
  });

  const handleApply = useCallback(async () => {
    try {
      const {
        interestedIn, distance, ageRange, onlineStatus,
        verifiedOnly, nearbyOnly, relationshipType, location
      } = useFilterStore.getState();

      await userService.updatePreferences({
        interestedIn,
        minAge: ageRange[0],
        maxAge: ageRange[1],
        maxDistance: distance,
        relationshipType,
        nearbyOnly,
        onlineOnly: onlineStatus,
        verifiedOnly,
        location
      });
      if (onApply) {
        onApply();
      }
      onClose();
    } catch (error) {
      console.error('Update preferences error:', error);
      onClose(); // Still close if it fails, or show alert
    }
  }, [onClose, onApply]);
  const handleClear = useCallback(() => reset(), [reset]);

  const detectGPSLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to detect your location.');
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geo) {
        const city = geo.city || geo.subregion || geo.district || 'Unknown City';
        const country = geo.country || 'India';
        await updateManualLocation(city, country, loc.coords.latitude, loc.coords.longitude);
      } else {
        Alert.alert('Error', 'Could not resolve location coordinates.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to detect current location.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const updateManualLocation = async (city, country, lat, lng) => {
    try {
      await userService.updateLocation({ lat, lng, city, country });
      setUserLocation(`${city}, ${country}`);
      await useProfileStore.getState().fetchProfile();
      setLocation(`${city}, ${country}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update location.');
    }
  };


  const handleTravelModePress = async () => {
    if (isTravelMode) {
      try {
        await userService.setTravelMode({ enabled: false });
        setIsTravelMode(false);
        const meRes = await userService.getMe();
        const user = meRes.data || meRes;
        if (user?.location) {
          setUserLocation(user.location.city ? `${user.location.city}, ${user.location.country || ''}` : '');
          setLocation(user.location.city ? `${user.location.city}, ${user.location.country || ''}` : '');
        }
        await useProfileStore.getState().fetchProfile();
        Alert.alert('Travel Mode Off', 'Back to your home location.');
      } catch (err) {
        Alert.alert('Error', 'Failed to disable Travel Mode');
      }
    } else {
      // Close filter sheet then open the full Travel Mode modal in Settings
      onClose();
      navigation.navigate('Settings', { openTravelMode: true });
    }
  };

  const pickLocation = () => {
    Alert.alert(
      'Update Location',
      'How would you like to update your current location?',
      [
        { text: 'Detect GPS Location', onPress: () => detectGPSLocation() },
        { text: 'Select Mumbai', onPress: () => updateManualLocation('Mumbai', 'India', 19.0760, 72.8777) },
        { text: 'Select Delhi', onPress: () => updateManualLocation('Delhi', 'India', 28.7041, 77.1025) },
        { text: 'Select Bangalore', onPress: () => updateManualLocation('Bangalore', 'India', 12.9716, 77.5946) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BottomSheetContainer 
        height={height * 0.85} 
        onClose={onClose}
        containerStyle={s.containerStyle}
        contentStyle={s.contentStyle}
      >

        <ScrollView contentContainerStyle={{ paddingBottom: 45 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.headerRow}>
            <Text style={[s.title, { color: theme.textPrimary }]}>Filters</Text>
            <TouchableOpacity onPress={handleClear}>
              <Text style={[s.clearBtn, { color: theme.isDark ? theme.accent : PINK }]}>Clear all</Text>
            </TouchableOpacity>
          </View>

          {/* ─ Interested In ─ */}
          <Section label="Interested in">
            <View style={s.segRow}>
              {['girls', 'boys', 'both'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    s.seg, 
                    { backgroundColor: theme.isDark ? theme.cardBackground : '#F6F6F6' },
                    interestedIn === opt && (theme.isDark 
                      ? { borderColor: theme.accent, backgroundColor: 'rgba(201, 150, 63, 0.12)' }
                      : s.segActive)
                  ]}
                  onPress={() => setInterestedIn(opt)}
                >
                  <Text style={[
                    s.segText, 
                    { color: theme.textSecondary },
                    interestedIn === opt && { color: theme.isDark ? theme.accent : PINK, fontWeight: '700' }
                  ]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          {/* ─ Location ─ */}
          <Section label="Location">
            <View style={s.locationContainer}>
              <TouchableOpacity 
                style={[
                  s.locationRow, 
                  { 
                    backgroundColor: theme.cardBackground, 
                    borderColor: theme.isDark ? theme.cardBorder : '#F0F0F0' 
                  }
                ]} 
                onPress={pickLocation} 
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <ActivityIndicator size="small" color={theme.isDark ? theme.accent : '#E94057'} style={{ marginRight: 6 }} />
                ) : (
                  <Icon name={isTravelMode ? "airplane-outline" : "location-outline"} size={18} color={theme.isDark ? theme.accent : '#E94057'} />
                )}
                <Text style={[
                  s.locationText, 
                  { color: theme.textPrimary },
                  !userLocation && s.placeholderText
                ]}>
                  {userLocation || 'Select Location'}
                </Text>
                {isTravelMode && (
                  <View style={[s.travelBadge, theme.isDark && { backgroundColor: theme.accent }]}>
                    <Text style={s.travelBadgeText}>Travel Mode</Text>
                  </View>
                )}
                <Icon name="chevron-forward" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  s.travelModeBtn, 
                  { 
                    borderColor: theme.isDark ? theme.accent : '#E94057', 
                    backgroundColor: isTravelMode ? (theme.isDark ? theme.accent : '#E94057') : 'transparent' 
                  }
                ]} 
                onPress={handleTravelModePress}
              >
                <Icon 
                  name="airplane" 
                  size={16} 
                  color={isTravelMode ? '#FFF' : (theme.isDark ? theme.accent : '#E94057')} 
                  style={!isTravelMode && { transform: [{ rotate: '45deg' }] }} 
                />
                <Text style={[
                  s.travelModeBtnText, 
                  { color: theme.isDark ? theme.accent : '#E94057' },
                  isTravelMode && s.travelModeBtnTextActive
                ]}>
                  {isTravelMode ? 'Disable Travel Mode' : 'Enable Travel Mode'}
                </Text>
              </TouchableOpacity>
            </View>
          </Section>

          {/* ─ Distance ─ */}
          <Section label={`Distance  •  ${localDistance} km`}>
            <SingleSlider 
              value={localDistance} 
              min={1} max={200} 
              onChange={(val) => {
                setLocalDistance(val);
                debouncedSetDistance(val);
              }} 
            />
            <View style={s.sliderLabels}>
              <Text style={s.sliderHint}>1 km</Text>
              <Text style={s.sliderHint}>200 km</Text>
            </View>
          </Section>

          {/* ─ Age Range ─ */}
          <Section label={`Age Range  •  ${localAgeRange[0]}–${localAgeRange[1]}`}>
            <RangeSlider
              min={18} max={60}
              low={localAgeRange[0]} high={localAgeRange[1]}
              onChangeLow={(v) => {
                const newRange = [v, localAgeRange[1]];
                setLocalAgeRange(newRange);
                debouncedSetAgeRange(newRange);
              }}
              onChangeHigh={(v) => {
                const newRange = [localAgeRange[0], v];
                setLocalAgeRange(newRange);
                debouncedSetAgeRange(newRange);
              }}
            />
            <View style={s.sliderLabels}>
              <Text style={s.sliderHint}>18</Text>
              <Text style={s.sliderHint}>60</Text>
            </View>
          </Section>

          {/* ─ Relationship Type ─ */}
          <Section label="Relationship Type">
            <View style={s.segRow}>
              {['casual', 'serious', 'both'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    s.seg, 
                    { backgroundColor: theme.isDark ? theme.cardBackground : '#F6F6F6' },
                    relationshipType === opt && (theme.isDark 
                      ? { borderColor: theme.accent, backgroundColor: 'rgba(201, 150, 63, 0.12)' }
                      : s.segActive)
                  ]}
                  onPress={() => setRelationshipType(opt)}
                >
                  <Text style={[
                    s.segText, 
                    { color: theme.textSecondary },
                    relationshipType === opt && { color: theme.isDark ? theme.accent : PINK, fontWeight: '700' }
                  ]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          {/* ─ Interests ─ */}
          <Section label="Interests">
            {loadingInterests ? (
              <View style={{ height: 100, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={theme.isDark ? theme.accent : '#E94057'} size="large" />
              </View>
            ) : (
              <View style={s.chipsWrap}>
                {allInterests.map((item) => {
                  const active = interests.includes(item.name);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        s.chip,
                        { 
                          backgroundColor: theme.cardBackground, 
                          borderColor: theme.isDark ? theme.cardBorder : '#E8E6EA' 
                        },
                        active && (theme.isDark 
                          ? { borderColor: theme.accent, backgroundColor: 'rgba(201,150,63,0.12)' }
                          : s.chipActive)
                      ]}
                      onPress={() => toggleInterest(item.name)}
                    >
                      {item.icon && (
                        <Icon
                          name={item.icon}
                          size={14}
                          color={active ? (theme.isDark ? theme.accent : PINK) : '#666'}
                          style={{ marginRight: 6 }}
                        />
                      )}
                      <Text style={[
                        s.chipText, 
                        { color: theme.textSecondary },
                        active && { color: theme.isDark ? theme.accent : PINK, fontWeight: '700' }
                      ]}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Section>

          {/* ─ Nearby Users ─ */}
          <Section label="Nearby Users">
            <View style={[s.toggleRow, { backgroundColor: theme.cardBackground }]}>
              <View style={s.toggleLabelRow}>
                <Icon name="navigate-outline" size={16} color={theme.isDark ? theme.accent : '#E94057'} style={{ marginRight: 6 }} />
                <Text style={[s.toggleLabel, { color: theme.textPrimary }]}>Show only nearby users</Text>
                {!hasNearbyAccess && (
                  <View style={[s.upgradePill, { backgroundColor: '#4FACFE', marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2 }]}>
                    <Text style={[s.upgradePillText, { fontSize: 9 }]}>Platinum</Text>
                  </View>
                )}
              </View>
              <Switch
                value={nearbyOnly}
                onValueChange={(val) => {
                  if (val && !hasNearbyAccess) {
                    handleUpgradePrompt('Nearby Users');
                  } else {
                    setNearbyOnly(val);
                  }
                }}
                trackColor={{ false: '#767577', true: theme.isDark ? theme.accent : '#FFB3BF' }}
                thumbColor={nearbyOnly ? (theme.isDark ? theme.accent : '#E94057') : '#fff'}
              />
            </View>
          </Section>

          {/* ─ Online Now ─ */}
          <Section label="Online Now">
            <View style={[s.toggleRow, { backgroundColor: theme.cardBackground }]}>
              <View style={s.toggleLabelRow}>
                <Icon name="radio-button-on" size={14} color="#22C55E" style={{ marginRight: 6 }} />
                <Text style={[s.toggleLabel, { color: theme.textPrimary }]}>Show only online users</Text>
                {!hasOnlineAccess && (
                  <View style={[s.upgradePill, { backgroundColor: '#F59E0B', marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2 }]}>
                    <Text style={[s.upgradePillText, { fontSize: 9 }]}>Gold</Text>
                  </View>
                )}
              </View>
              <Switch
                value={onlineStatus}
                onValueChange={(val) => {
                  if (val && !hasOnlineAccess) {
                    handleUpgradePrompt('Online Now');
                  } else {
                    setOnlineStatus(val);
                  }
                }}
                trackColor={{ false: '#767577', true: theme.isDark ? theme.accent : '#FFB3BF' }}
                thumbColor={onlineStatus ? (theme.isDark ? theme.accent : '#E94057') : '#fff'}
              />
            </View>
          </Section>

          {/* ─ Verified Only (Premium-locked) ─ */}
          <Section label="Verified Profiles">
            {isPremium ? (
              <View style={[s.toggleRow, { backgroundColor: theme.cardBackground }]}>
                <View style={s.toggleLabelRow}>
                  <Icon name="shield-checkmark" size={15} color="#3B82F6" style={{ marginRight: 6 }} />
                  <Text style={[s.toggleLabel, { color: theme.textPrimary }]}>Show verified profiles only</Text>
                </View>
                <Switch
                  value={verifiedOnly}
                  onValueChange={setVerifiedOnly}
                  trackColor={{ false: '#767577', true: theme.isDark ? theme.accent : '#FFB3BF' }}
                  thumbColor={verifiedOnly ? (theme.isDark ? theme.accent : '#E94057') : '#fff'}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  s.lockedRow, 
                  { 
                    backgroundColor: theme.isDark ? theme.cardBackground : '#FFF8F0', 
                    borderColor: theme.isDark ? theme.cardBorder : '#FDE68A' 
                  }
                ]}
                onPress={() => handleUpgradePrompt('Verified Profiles')}
                activeOpacity={0.8}
              >
                <View style={s.lockedLeft}>
                  <Icon name="lock-closed" size={17} color="#F59E0B" style={{ marginRight: 8 }} />
                  <View>
                    <Text style={[s.lockedLabel, { color: theme.textPrimary }]}>Show verified profiles only</Text>
                    <Text style={s.lockedHint}>Upgrade to unlock</Text>
                  </View>
                </View>
                <View style={s.upgradePill}>
                  <Icon name="star" size={11} color="#fff" style={{ marginRight: 3 }} />
                  <Text style={s.upgradePillText}>Premium</Text>
                </View>
              </TouchableOpacity>
            )}
          </Section>

          {/* Apply */}
          <TouchableOpacity style={s.applyBtn} onPress={handleApply}>
            <LinearGradient
              colors={theme.isDark ? ['#F6DCA0', '#D4AF37'] : ['#E94057', '#8A2387']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.applyGradient}
            >
              <Text style={[s.applyText, theme.isDark && { color: '#0A0A0A', fontWeight: '800' }]}>Apply Filters</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetContainer>
    </Modal>
  );
});

// Small section wrapper
const Section = ({ label, children }) => {
  const { theme } = useTheme();
  return (
    <View style={s.section}>
      <Text style={[s.sectionLabel, { color: theme.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const PINK = '#E94057';
const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';

const s = StyleSheet.create({
  containerStyle: {
    paddingTop: 16,
    paddingHorizontal: 0,
  },
  contentStyle: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111',
    fontFamily: FONT_MED,
  },
  clearBtn: {
    fontSize: 14,
    color: PINK,
    fontWeight: '600',
    fontFamily: FONT_MED,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    fontFamily: FONT_MED,
    letterSpacing: 0.3,
  },

  // Segment
  segRow: { flexDirection: 'row', gap: 8 },
  seg: {
    flex: 1, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F6F6F6', borderWidth: 1.5, borderColor: 'transparent',
  },
  segActive: { backgroundColor: '#FFF0F3', borderColor: PINK },
  segText: { fontSize: 14, color: '#666', fontFamily: FONT },
  segTextActive: { color: PINK, fontWeight: '700' },

  // Location
  locationContainer: {
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FAFAFA', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  locationText: { flex: 1, fontSize: 15, color: '#222', fontFamily: FONT },
  placeholderText: { color: '#AAA' },
  travelBadge: {
    backgroundColor: '#E94057',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  travelBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONT_MED,
  },
  travelModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E94057',
    backgroundColor: 'transparent',
    gap: 6,
  },
  travelModeBtnActive: {
    backgroundColor: '#E94057',
  },
  travelModeBtnText: {
    fontSize: 14,
    color: '#E94057',
    fontWeight: '700',
    fontFamily: FONT_MED,
  },
  travelModeBtnTextActive: {
    color: '#FFF',
  },

  // Slider labels
  sliderLabels: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 4,
  },
  sliderHint: { fontSize: 11, color: '#AAA' },

  // Chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E8E6EA',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#FFF0F3',
    borderColor: PINK,
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONT,
    fontWeight: '500',
  },
  chipTextActive: {
    color: PINK,
    fontWeight: '700',
  },

  // Toggle rows
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleLabel: { fontSize: 14, color: '#333', fontFamily: FONT },

  // Premium-locked row
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  lockedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lockedLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: FONT,
    fontWeight: '500',
  },
  lockedHint: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 1,
  },
  upgradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  upgradePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    fontFamily: FONT_MED,
  },

  // Apply
  applyBtn: { marginTop: 28, borderRadius: 16, overflow: 'hidden' },
  applyGradient: {
    height: 54, justifyContent: 'center', alignItems: 'center',
  },
  applyText: { fontSize: 16, fontWeight: '800', color: '#fff', fontFamily: FONT_MED },
});

// Slider styles
const sl = StyleSheet.create({
  container: {
    height: 36, justifyContent: 'center',
    position: 'relative', marginVertical: 6,
  },
  track: {
    height: 6, backgroundColor: '#F0F0F0',
    borderRadius: 3, width: '100%',
  },
  fill: {
    position: 'absolute', height: 6,
    backgroundColor: PINK, borderRadius: 3,
    top: 15,
  },
  thumb: {
    position: 'absolute', width: 24, height: 24, borderRadius: 12,
    backgroundColor: PINK, borderWidth: 3, borderColor: '#fff',
    shadowColor: PINK, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4, elevation: 5, top: 6,
  },
});
