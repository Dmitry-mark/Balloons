// screens/StartScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

export default function StartScreen({ navigation }) {
  const [balance, setBalance] = useState(0);

  const loadBalance = async () => {
    try {
      const balanceStr = await AsyncStorage.getItem('balance');
      setBalance(balanceStr ? parseInt(balanceStr, 10) : 0);
    } catch (error) {
      console.error("Ошибка при загрузке баланса: ", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadBalance();
    }, [])
  );

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

      {/* Блок с логотипом/названием игры */}
      <View style={styles.labelContainer}>
        <Image
          source={require('../assets/Boombloon.png')}
          style={styles.titleGif}
        />
      </View>

      {/* Блок с балансом (абсолютное позиционирование) */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>Score: {balance}</Text>
      </View>

      {/* Блок с кнопками (центр экрана) */}
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
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Shop')}
        >
          <Image
            source={require('../assets/Shop2.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Rules')}
        >
          <Image
            source={require('../assets/Rules.png')}
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

  // Логотип / название игры
  labelContainer: {
    marginTop: 150,
    alignItems: 'center',
  },
  titleGif: {
    width: 500,
    height: 100,
    resizeMode: 'contain',
  },

  // Блок с балансом (абсолютное позиционирование)
  balanceContainer: {
    position: 'absolute',
    top: 300,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'rgb(255, 123, 0)',
    textShadowColor: 'rgba(4, 4, 4, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },

  // Контейнер для кнопок ентр экрана)
  content: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -150,
  },
  button: {
    backgroundColor: 'rgba(255, 225, 198, 0.65)',
    paddingHorizontal: 70,
    paddingVertical: 5,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10, // Отступ между кнопками
  },
  buttonImage: {
    width: 150,
    height: 60,
    resizeMode: 'contain',
  },
});
