import React, { useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Carousel from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import { Button } from '../../../components/common/Button';
import { Pagination } from '../components/Pagination';
import { styles } from '../onboarding.styles';

const { width, height } = Dimensions.get('window');

const CAROUSEL_DATA = [
  {
    id: '1',
    title: 'Algorithm',
    description: 'Users going through a vetting process to ensure you never match with bots.',
    image: require('../../../assets/girl1.png'),
  },
  {
    id: '2',
    title: 'Matches',
    description: 'We match you with people that have a large array of similar interests.',
    image: require('../../../assets/girl2.png'),
  },
  {
    id: '3',
    title: 'Premium',
    description: 'Sign up today and enjoy the first month of premium benefits on us.',
    image: require('../../../assets/girl3.png'),
  },
];

export const CarouselScreen = ({ navigation }) => {
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = ({ item }) => (
    <View style={styles.slideCard}>
      <FastImage
        source={item.image}
        style={styles.slideImage}
        width={width * 0.95}
        resizeMode={FastImage.resizeMode.cover}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.carouselContainer}>
      <Carousel
        width={width }
        height={height * 0.55}
        data={CAROUSEL_DATA}
        onSnapToItem={setActiveIndex}
        onProgressChange={(_, absoluteProgress) => {
          scrollX.value = absoluteProgress * width;
        }}
        renderItem={renderItem}
        loop={true}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.80,
          parallaxScrollingOffset: 140,
        }}
        style={{ alignSelf: 'center' }}
      />

      {/* Text below carousel – changes with active slide */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{CAROUSEL_DATA[activeIndex].title}</Text>
        <Text style={styles.description}>
          {CAROUSEL_DATA[activeIndex].description}
        </Text>
      </View>

      <View style={styles.footer}>
        <Pagination data={CAROUSEL_DATA} scrollX={scrollX} />

        <Button
          title="Create an account"
          onPress={() => navigation.navigate('Welcome')}
          style={styles.createAccountBtn}
          textStyle={styles.createAccountBtnText}
          variant="solid"
        />

        <View style={styles.signInContainer}>
          <Text style={styles.alreadyText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
