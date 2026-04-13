import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';

export const AvatarList = ({ data }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
      <LinearGradient
        colors={['#FF6B8B', '#8A2387']} // Mock gradient ring similar to Instagram stories
        style={styles.gradientRing}
      >
        <View style={styles.imageWrapper}>
          <FastImage source={{ uri: item.image }} style={styles.image} />
        </View>
      </LinearGradient>
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activities</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.l,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontSize: 24,
    color: '#000000',
    marginBottom: SPACING.m,
    paddingHorizontal: SPACING.xl,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.m,
  },
  itemContainer: {
    alignItems: 'center',
    width: 70,
  },
  gradientRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  name: {
    ...TYPOGRAPHY.bodySecondary,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
