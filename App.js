// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StartScreen from './screens/StartScreen';
import BalloonGame from './screens/BalloonGame';

const Stack = createStackNavigator();

function App() {
  return React.createElement(
    NavigationContainer,
    null,
    React.createElement(
      Stack.Navigator,
      { initialRouteName: 'StartScreen' },
      React.createElement(Stack.Screen, {
        name: 'StartScreen',
        component: StartScreen,
        options: { headerShown: false },
      }),
      React.createElement(Stack.Screen, {
        name: 'BalloonGame',
        component: BalloonGame,
        options: { headerShown: false },
      })
    )
  );
}

export default App;
