import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FilterSheet } from '../components/FilterSheet';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export const FilterScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <FilterSheet 
        visible={true} 
        onClose={() => navigation.goBack()} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
