import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, NativeModules } from 'react-native';

const { CocoVisionModule } = NativeModules;

export default function HomeScreen({navigation}) {

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.clickeableContainer}
        onPress={() => navigation.navigate('LiveClassificationScreen')}>
        <Text style={styles.clickeableText}>Clasificación "en vivo"</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.clickeableContainer}
        onPress={() => navigation.navigate('OnDemandClassificationScreen')}>
        <Text style={styles.clickeableText}>Clasificación "on demand"</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.clickeableContainer}
        onPress={() => CocoVisionModule.testModuleStatus("hello", "world") }>
        <Text style={styles.clickeableText}>OpenCV template match</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 15
  },
  clickeableContainer: {
    backgroundColor: '#ff34b3',
    width: '100%',
    alignItems: 'center',
    borderRadius: 5,
    padding: 25
  },
  clickeableText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  }
});