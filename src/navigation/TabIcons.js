import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

const ICON_W = 52;
const ICON_H = 42;
const VIEWBOX = '0 0 60 48';

// Tab 1 — Discover (two stacked cards — updated SVG, no top bar)
export const DiscoverTabIcon = React.memo(({ focused }) => {
  const fill = focused ? '#E94057' : '#ADAFBB';
  return (
    <View style={styles.wrap}>
      {focused && <View style={styles.bar} />}
      <Svg width={ICON_W} height={ICON_H} viewBox={VIEWBOX} fill="none">
        {/* Right card (upright) */}
        <Rect
          x="27.499" y="16.4976" width="13" height="18" rx="2"
          fill={fill} stroke="#F3F3F3" strokeWidth="0.8"
        />
        {/* Left card (rotated -15°) */}
        <Rect
          x="18.3916" y="16.4893" width="13" height="18" rx="2"
          transform="rotate(-15 18.3916 16.4893)"
          fill={fill} stroke="#F3F3F3" strokeWidth="0.8"
        />
      </Svg>
    </View>
  );
});

// Tab 2 — Matches (heart + notification dot)
export const MatchesTabIcon = React.memo(({ focused }) => {
  const fill = focused ? '#E94057' : '#ADAFBB';
  return (
    <View style={styles.wrap}>
      {focused && <View style={styles.bar} />}
      <Svg width={ICON_W} height={ICON_H} viewBox={VIEWBOX} fill="none">
        <Path
          d="M25.5 16C22.4624 16 20 18.4625 20 21.5C20 27 26.5 32 30 33.1631C33.5 32 40 27 40 21.5C40 18.4625 37.5375 16 34.5 16C32.6398 16 30.9953 16.9235 30 18.3369C29.0047 16.9235 27.3601 16 25.5 16Z"
          fill={fill} stroke={fill}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <Circle
          cx="38" cy="18" r="5"
          fill={focused ? '#E94057' : '#C8C8C8'}
          stroke="#F3F3F3" strokeWidth="2"
        />
      </Svg>
    </View>
  );
});

// Tab 3 — Messages (speech bubble with lines)
export const MessagesTabIcon = React.memo(({ focused }) => {
  const fill = focused ? '#E94057' : '#ADAFBB';
  return (
    <View style={styles.wrap}>
      {focused && <View style={styles.bar} />}
      <Svg width={ICON_W} height={ICON_H} viewBox={VIEWBOX} fill="none">
        <Path
          d="M40 24C40 29.5229 35.5229 34 30 34C27.0133 34 20 34 20 34C20 34 20 26.5361 20 24C20 18.4771 24.4771 14 30 14C35.5229 14 40 18.4771 40 24Z"
          fill={fill} stroke={fill}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <Path d="M25 21H34" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <Path d="M25 25H34" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <Path d="M25 29H30" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </View>
  );
});

// Tab 4 — Profile (person silhouette)
export const ProfileTabIcon = React.memo(({ focused }) => {
  const fill = focused ? '#E94057' : '#ADAFBB';
  return (
    <View style={styles.wrap}>
      {focused && <View style={styles.bar} />}
      <Svg width={ICON_W} height={ICON_H} viewBox={VIEWBOX} fill="none">
        <Path
          d="M30 22C31.933 22 33.5 20.433 33.5 18.5C33.5 16.567 31.933 15 30 15C28.067 15 26.5 16.567 26.5 18.5C26.5 20.433 28.067 22 30 22Z"
          fill={fill} stroke={fill}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <Path
          d="M21 32.4V33H39V32.4C39 30.1598 39 29.0397 38.5641 28.184C38.1806 27.4314 37.5686 26.8195 36.816 26.436C35.9603 26 34.8402 26 32.6 26H27.4C25.1598 26 24.0397 26 23.1841 26.436C22.4314 26.8195 21.8195 27.4314 21.436 28.184C21 29.0397 21 30.1598 21 32.4Z"
          fill={fill} stroke={fill}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  bar: {
    position: 'absolute',
    top: -10,
    width: 30,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#E94057',
  },
});
