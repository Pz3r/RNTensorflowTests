import * as React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../Screens/HomeScreen';
import ResultScreen from '../Screens/ResultScreen';
import LiveClassificationScreen from '../Screens/ImageClassification/LiveClassificationScreen';
import OnDemandClassificationScreen from '../Screens/ImageClassification/OnDemandClassificationScreen';

export default function MainNavigation() {

  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="OnDemandClassificationScreen" component={OnDemandClassificationScreen} />
        <Stack.Screen name="LiveClassificationScreen" component={LiveClassificationScreen} />        
        <Stack.Screen name="ResultScreen" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}