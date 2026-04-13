import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { styles } from '../onboarding.styles';
import { COLORS } from '../../../constants/theme';

export const Pagination = ({ data, scrollX }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.paginationContainer}>
      {data.map((_, i) => {
        const animatedStyle = useAnimatedStyle(() => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = interpolate(
            scrollX.value,
            inputRange,
            [8, 8, 8],
            Extrapolation.CLAMP
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolation.CLAMP
          );

          return {
            width: dotWidth,
            opacity,
            backgroundColor: opacity > 0.5 ? '#FF4b72' : '#E0E0E0',
          };
        });

        return <Animated.View style={[styles.dot, animatedStyle]} key={i.toString()} />;
      })}
    </View>
  );
};
