import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { GradientButton } from '../../../components/common/GradientButton';

export const NotificationsPermissionScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <FastImage 
            source={require('../../../assets/notification-icon.png')} 
            style={styles.image}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>

        <Text style={styles.title}>Enable notification's</Text>
        <Text style={styles.subtitle}>
          Get push-notification when you get the match or receive a message.
        </Text>

        <GradientButton
          title="I want to be notified"
          onPress={() => navigation.navigate('Home')} // Navigation to main flow after setup
          colors={['#E4415C', '#E4415C']}
          style={styles.actionButton}
        />
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
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
  },
  skipText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#E4415C',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontSize: 28,
    color: '#000000',
    marginBottom: SPACING.m,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: '#5b5b5b',
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 60,
  },
  actionButton: {
    borderRadius: 16,
    width: '100%',
  },
});
