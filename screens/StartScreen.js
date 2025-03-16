// screens/StartScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import LottieView from 'lottie-react-native';

export default function StartScreen({ navigation }) {
  return (
    <ImageBackground 
      source={require('../assets/background.png')}
      style={styles.background}
    >
      {/* Lottie-анимация на заднем фоне */}
      <LottieView
        source={require('../assets/Animation.json')} 
        autoPlay
        loop
        style={styles.lottieBackground}
      />
      
      <View style={styles.container}>
        {/* GIF с названием игры выше по экрану */}
        <Image
          source={require('../assets/Floatopia.png')}
          style={styles.titleGif}
        />

        {/* Кнопка старта игры */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BalloonGame')}
        >
          <Text style={styles.buttonText}>Начать игру</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1,
  },
  lottieBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    // Убираем вертикальное центрирование, чтобы можно было «поднять» GIF
    alignItems: 'center',
  },
  // GIF с названием игры
  titleGif: {
    width: 300,
    height: 80,
    resizeMode: 'contain',
    marginTop: 300,            // поднимаем выше
    marginBottom: 40,         // отступ снизу, // убираем фон
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
