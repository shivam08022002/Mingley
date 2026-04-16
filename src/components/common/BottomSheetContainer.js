import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Platform, 
  Animated, 
  PanResponder, 
  StatusBar 
} from 'react-native';
import Svg, { Path, Rect, Defs, Filter, FeFlood, FeColorMatrix, FeOffset, FeGaussianBlur, FeBlend, G } from 'react-native-svg';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * A responsive bottom sheet container with SVG background and indicator.
 * Handles entrance animation and pan-to-dismiss.
 * @param {number} height - The height of the drawer.
 * @param {React.ReactNode} children - The content of the drawer.
 * @param {function} onClose - Callback for closing the drawer.
 * @param {object} containerStyle - Optional style for the outer view.
 */
export const BottomSheetContainer = ({ children, containerStyle, height = 505, onClose }) => {
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 120,
    }).start();
  }, [panY]);

  const handleDismiss = () => {
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 1) {
          handleDismiss();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 120,
          }).start();
        }
      },
    })
  ).current;

  // SVG Path with larger border radius (60px) and refined hump
  // M0 60 -> start of curve
  // C0 26.8 26.8 0 60 0 -> Top left corner
  // ... middle hump logic ...
  // C315 0 375 26.8 375 60 -> Top right corner
  const svgPath = `M0 60C0 26.8 26.8 0 60 0L156 0C158.6 0 161.1 0.7 163.3 2.1C177.8 11.5 196.3 11.6 210.9 2.5L211.7 2.1C213.8 0.7 216.4 0 218.9 0L315 0C348.1 0 375 26.8 375 60V${height}H0V60Z`;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Animated.View 
        style={[
          styles.containerWrapper, 
          { transform: [{ translateY: panY }] }
        ]}
      >
        {/* Indicator SVG with a gap from the container - now acts as the pan handle */}
        <View {...panResponder.panHandlers} style={styles.indicatorContainer}>
          <Svg width="60" height="28" viewBox="0 0 55 0" fill="none">
            <G filter="url(#filter0_d_309_5420)">
              <Path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M14 9.0219C14 5.14381 17.1435 2 21.0215 2C23.2659 2 25.6126 2 27.3371 2C29.1179 2 31.6124 2 33.9835 2C37.8589 2 41 5.14166 41 9.01709C41 9.13673 40.9242 9.24322 40.8111 9.28234L39.1697 9.85037C31.3028 12.5728 22.7335 12.4718 14.933 9.56467L14.1828 9.28509C14.0729 9.24413 14 9.13919 14 9.0219Z" 
                fill="white"
              />
            </G>
            <Rect x="21" y="5" width="13" height="3" rx="1.5" fill="#E8E6EA"/>
            <Defs>
              <Filter id="filter0_d_309_5420" x="0" y="0" width="55" height="37.821" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <FeFlood floodOpacity="0" result="BackgroundImageFix"/>
                <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <FeOffset dy="12"/>
                <FeGaussianBlur stdDeviation="7"/>
                <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/>
                <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_309_5420"/>
                <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_309_5420" result="shape"/>
              </Filter>
            </Defs>
          </Svg>
        </View>

        {/* Main Container SVG with dynamic height */}
        <View style={[styles.container, { height }]}>
          <View style={StyleSheet.absoluteFill}>
            <Svg width={width} height={height} viewBox={`0 0 375 ${height}`} preserveAspectRatio="none">
              <Path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d={svgPath}
                fill="white"
              />
            </Svg>
          </View>

          <View style={styles.content}>
            {children}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    backgroundColor: '#00000060',
  },
  containerWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  indicatorContainer: {
    width: '100%',
    top: 5,
    alignItems: 'center',
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  container: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    width: '100%',
    flex: 1,
    paddingTop: 50, // Matches the larger curve start
    paddingHorizontal: 25, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
});
