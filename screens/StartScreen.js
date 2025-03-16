// screens/StartScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export default function StartScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Lottie-анимация на заднем фоне */}
      <LottieView
        source={require('../assets/Animation.json')} 
        autoPlay
        loop
        style={styles.lottieBackground}
      />

      {/* Заголовок/название игры */}
      <Text style={styles.title}>Balloons Game</Text>

      {/* Меню - кнопка старта игры */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('BalloonGame')} // переход к экрану игры
      >
        <Text style={styles.buttonText}>Начать игру</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Чтобы анимация шла "под" элементы, фон сделаем прозрачным
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
