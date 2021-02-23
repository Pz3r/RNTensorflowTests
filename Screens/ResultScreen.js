import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function ResultScreen({ route }) {
  
  const { prediction } = route.params;
  return (
    <View style={styles.container}>
      <Text>{JSON.stringify(prediction)}</Text>
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  result: {
    alignItems: 'center'
  } 
});