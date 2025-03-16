// screens/StartScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image
} from 'react-native';
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
      
      <View style={styles.lable}>
        {/* PNG с надписью Floatopia (можно задать другой marginTop при необходимости) */}
        <Image
          source={require('../assets/Floatopia.png')}
          style={styles.titleGif}
        />
      </View>
        {/* Кнопка с полупрозрачным фоном и иконкой внутри */}
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BalloonGame')}
        >
          <Image
            source={require('../assets/play.png')}
            style={styles.buttonImage}
          />
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
  content: {
    flex: 1,
    alignItems: 'center', // Горизонтальное центрирование элементов
    marginTop: -110,
    // Если нужно отцентрировать и по вертикали, добавьте justifyContent: 'center'
  },
  // Надпись Floatopia
  titleGif: {
    width: 500,
    height: 100,
    resizeMode: 'contain',
    marginTop: 150,  // Отступ сверху, чтобы поднять надпись
    marginBottom: 40,
  },
  lable: {
    flex: 1,
    alignItems: 'center',
  },
  // Стиль кнопки
  button: {
    backgroundColor: 'rgba(255, 225, 198, 0.65)', // Полупрозрачный оранжевый
    paddingHorizontal: 70,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop:-20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Изображение внутри кнопки
  buttonImage: {
    width: 140,
    height: 60,
    resizeMode: 'contain',
  },
});
