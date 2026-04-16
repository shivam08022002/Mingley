import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useFilterStore } from '../store/useFilterStore';
import { BottomSheetContainer } from '../../../components/common/BottomSheetContainer';

const { height, width } = Dimensions.get('window');
const SLIDER_TRACK = width - 48 - 8; // sheet padding * 2

// ─── Simple single-thumb slider ────────────────────────────────────────────
const SingleSlider = React.memo(({ value, min, max, onChange }) => {
  const pct = (value - min) / (max - min);
  const thumbPos = pct * SLIDER_TRACK;
  const [drag, setDrag] = useState(thumbPos);

  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setDrag(thumbPos),
    onPanResponderMove: (_, gs) => {
      const nx = Math.max(0, Math.min(SLIDER_TRACK, thumbPos + gs.dx));
      setDrag(nx);
      const nv = Math.round(min + (nx / SLIDER_TRACK) * (max - min));
      onChange(nv);
    },
  });

  const pos = (value - min) / (max - min) * SLIDER_TRACK;

  return (
    <View style={sl.container}>
      <View style={sl.track} />
      <View style={[sl.fill, { width: pos }]} />
      <View {...pan.panHandlers} style={[sl.thumb, { left: pos - 12 }]} />
    </View>
  );
});

// ─── Dual-thumb range slider ────────────────────────────────────────────────
const RangeSlider = React.memo(({ min, max, low, high, onChangeLow, onChangeHigh }) => {
  const toPos = (v) => ((v - min) / (max - min)) * SLIDER_TRACK;
  const lowPos = toPos(low);
  const highPos = toPos(high);

  const panLow = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gs) => {
      const nx = Math.max(0, Math.min(highPos - 20, lowPos + gs.dx));
      onChangeLow(Math.round(min + (nx / SLIDER_TRACK) * (max - min)));
    },
  });

  const panHigh = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gs) => {
      const nx = Math.max(lowPos + 20, Math.min(SLIDER_TRACK, highPos + gs.dx));
      onChangeHigh(Math.round(min + (nx / SLIDER_TRACK) * (max - min)));
    },
  });

  return (
    <View style={sl.container}>
      <View style={sl.track} />
      <View style={[sl.fill, { left: lowPos, width: highPos - lowPos }]} />
      <View {...panLow.panHandlers} style={[sl.thumb, { left: lowPos - 12 }]} />
      <View {...panHigh.panHandlers} style={[sl.thumb, { left: highPos - 12 }]} />
    </View>
  );
});

// ─── Main FilterSheet ───────────────────────────────────────────────────────
export const FilterSheet = React.memo(({ visible, onClose }) => {
  const {
    interestedIn, setInterestedIn,
    location, setLocation,
    distance, setDistance,
    ageRange, setAgeRange,
    onlineStatus, setOnlineStatus,
    verifiedOnly, setVerifiedOnly,
    interests, toggleInterest,
    relationshipType, setRelationshipType,
    reset,
    ALL_INTERESTS,
  } = useFilterStore();

  // Swipe-down on handle → close
  const swipeDownPan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => gs.dy > 4,
    onPanResponderRelease: (_, gs) => {
      if (gs.dy > 60) onClose();
    },
  });

  const handleApply = useCallback(() => onClose(), [onClose]);
  const handleClear = useCallback(() => reset(), [reset]);

  const pickLocation = () => {
    Alert.alert('Choose Location', '', [
      { text: 'Mumbai, India', onPress: () => setLocation('Mumbai, India') },
      { text: 'Delhi, India', onPress: () => setLocation('Delhi, India') },
      { text: 'Bangalore, India', onPress: () => setLocation('Bangalore, India') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BottomSheetContainer 
        height={height * 0.65} 
        onClose={onClose}
        containerStyle={s.containerStyle}
      >

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={s.headerRow}>
              <Text style={s.title}>Filters</Text>
              <TouchableOpacity onPress={handleClear}>
                <Text style={s.clearBtn}>Clear all</Text>
              </TouchableOpacity>
            </View>

            {/* ─ Interested In ─ */}
            <Section label="Interested in">
              <View style={s.segRow}>
                {['girls', 'boys', 'both'].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[s.seg, interestedIn === opt && s.segActive]}
                    onPress={() => setInterestedIn(opt)}
                  >
                    <Text style={[s.segText, interestedIn === opt && s.segTextActive]}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Section>

            {/* ─ Location ─ */}
            <Section label="Location">
              <TouchableOpacity style={s.locationRow} onPress={pickLocation}>
                <Icon name="location-outline" size={18} color="#E94057" />
                <Text style={s.locationText}>{location}</Text>
                <Icon name="chevron-forward" size={18} color="#CCC" />
              </TouchableOpacity>
            </Section>

            {/* ─ Distance ─ */}
            <Section label={`Distance  •  ${distance} km`}>
              <SingleSlider value={distance} min={1} max={150} onChange={setDistance} />
              <View style={s.sliderLabels}>
                <Text style={s.sliderHint}>1 km</Text>
                <Text style={s.sliderHint}>150 km</Text>
              </View>
            </Section>

            {/* ─ Age Range ─ */}
            <Section label={`Age Range  •  ${ageRange[0]}–${ageRange[1]}`}>
              <RangeSlider
                min={18} max={60}
                low={ageRange[0]} high={ageRange[1]}
                onChangeLow={(v) => setAgeRange([v, ageRange[1]])}
                onChangeHigh={(v) => setAgeRange([ageRange[0], v])}
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
                    style={[s.seg, relationshipType === opt && s.segActive]}
                    onPress={() => setRelationshipType(opt)}
                  >
                    <Text style={[s.segText, relationshipType === opt && s.segTextActive]}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Section>

            {/* ─ Interests ─ */}
            <Section label="Interests">
              <View style={s.chipsWrap}>
                {ALL_INTERESTS.map((item) => {
                  const active = interests.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[s.chip, active && s.chipActive]}
                      onPress={() => toggleInterest(item)}
                    >
                      <Text style={[s.chipText, active && s.chipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Section>

            {/* ─ Online Now ─ */}
            <Section label="Online Now">
              <View style={s.toggleRow}>
                <Text style={s.toggleLabel}>Show only online users</Text>
                <Switch
                  value={onlineStatus}
                  onValueChange={setOnlineStatus}
                  trackColor={{ false: '#E0E0E0', true: '#FFB3BF' }}
                  thumbColor={onlineStatus ? '#E94057' : '#fff'}
                />
              </View>
            </Section>

            {/* ─ Verified Only ─ */}
            <Section label="Verified Profiles">
              <View style={s.toggleRow}>
                <Text style={s.toggleLabel}>Show verified profiles only</Text>
                <Switch
                  value={verifiedOnly}
                  onValueChange={setVerifiedOnly}
                  trackColor={{ false: '#E0E0E0', true: '#FFB3BF' }}
                  thumbColor={verifiedOnly ? '#E94057' : '#fff'}
                />
              </View>
            </Section>

            {/* Apply */}
            <TouchableOpacity style={s.applyBtn} onPress={handleApply}>
              <LinearGradient
                colors={['#E94057', '#8A2387']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.applyGradient}
              >
                <Text style={s.applyText}>Apply Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </BottomSheetContainer>
    </Modal>
  );
});

// Small section wrapper
const Section = ({ label, children }) => (
  <View style={s.section}>
    <Text style={s.sectionLabel}>{label}</Text>
    {children}
  </View>
);

// ─── Styles ─────────────────────────────────────────────────────────────────
const PINK = '#E94057';
const FONT_MED = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium';
const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';

const s = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    // legacy
  },
  handle: {},
  handleWrap: {},
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111', fontFamily: FONT_MED },
  clearBtn: { fontSize: 13, color: PINK, fontWeight: '600' },
  section: { marginTop: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10, fontFamily: FONT_MED },

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
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FAFAFA', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  locationText: { flex: 1, fontSize: 15, color: '#222', fontFamily: FONT },

  // Slider labels
  sliderLabels: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 4,
  },
  sliderHint: { fontSize: 11, color: '#AAA' },

  // Chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  chipActive: { backgroundColor: '#FFF0F3', borderColor: PINK },
  chipText: { fontSize: 13, color: '#666', fontFamily: FONT },
  chipTextActive: { color: PINK, fontWeight: '700' },

  // Toggle
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  toggleLabel: { fontSize: 14, color: '#333', fontFamily: FONT },

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
    backgroundColor: PINK, borderRadius: 3, left: 0,
  },
  thumb: {
    position: 'absolute', width: 24, height: 24, borderRadius: 12,
    backgroundColor: PINK, borderWidth: 3, borderColor: '#fff',
    shadowColor: PINK, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4, elevation: 5, top: 6,
  },
});
