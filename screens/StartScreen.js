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
      
      <View style={styles.lable}>
        {/* PNG с надписью Floatopia */}
        <Image
          source={require('../assets/Floatopia.png')}
          style={styles.titleGif}
        />
      </View>
      
      {/* Отображение баланса */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>Баланс: {balance} валюты</Text>
      </View>
      
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
    alignItems: 'center',
    marginTop: -110,
  },
  titleGif: {
    width: 500,
    height: 100,
    resizeMode: 'contain',
    marginTop: 150,
    marginBottom: 40,
  },
  lable: {
    flex: 1,
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(255, 225, 198, 0.65)',
    paddingHorizontal: 70,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonImage: {
    width: 140,
    height: 60,
    resizeMode: 'contain',
  },
  balanceContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
