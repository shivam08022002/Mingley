import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');

export const GalleryScreen = ({ navigation, route }) => {
  const images = route?.params?.images || [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1080&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1080&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1080&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1080&q=80',
  ];
  const [activeIndex, setActiveIndex] = useState(route?.params?.initialIndex || 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#E4415C" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainImageContainer}>
        <FastImage 
          source={{ uri: images[activeIndex] }} 
          style={styles.mainImage} 
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>

      <View style={styles.thumbnailContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailScroll}>
          {images.map((img, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => setActiveIndex(index)}
              style={[
                styles.thumbnailWrapper,
                activeIndex === index && styles.activeThumbnail
              ]}
            >
              <FastImage 
                source={{ uri: img }} 
                style={styles.thumbnailImage} 
                resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.m,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImageContainer: {
    flex: 1,
    width: '100%',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailContainer: {
    paddingVertical: SPACING.l,
    backgroundColor: '#FFFFFF',
  },
  thumbnailScroll: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.m,
    alignItems: 'center',
  },
  thumbnailWrapper: {
    width: 70,
    height: 70,
    borderRadius: 16,
    overflow: 'hidden',
    opacity: 0.5,
  },
  activeThumbnail: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
