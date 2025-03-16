// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StartScreen from './screens/StartScreen';
import BalloonGame from './screens/BalloonGame';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="BalloonGame" component={BalloonGame} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
