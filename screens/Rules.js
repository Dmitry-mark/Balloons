// screens/Rules.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView
} from 'react-native';
import LottieView from 'lottie-react-native';

export default function RulesScreen({ navigation }) {
  return (
    <ImageBackground 
      source={require('../assets/background.png')}
      style={styles.background}
    >
      {/* Фоновая Lottie-анимация */}
      <LottieView
        source={require('../assets/Animation.json')}
        autoPlay
        loop
        style={styles.lottieBackground}
      />

      {/* Заголовок экрана */}
      <View style={styles.headerContainer}>
        <Image
                    source={require('../assets/Rules2.png')}
                    style={styles.headerTitle}
                  />
      </View>

      {/* Текст правил в прокручиваемом контейнере */}
      <ScrollView contentContainerStyle={styles.rulesContainer}>
        <Text style={styles.ruleText}>
        1. Tap on the balls to earn points.
        </Text>
        <Text style={styles.ruleText}>
        2. The more balls you pop in one go, the higher your score.
        </Text>
        <Text style={styles.ruleText}>
        3. Be careful - there are bombs among the balls that you will lose by clicking on
        </Text>
        <Text style={styles.ruleText}>
        4. Try to reach new records and improve your score!
        </Text>
        <Text style={styles.ruleText}>
        5. You can use the points you earn to purchase items in the store.
        </Text>
      </ScrollView>

      {/* Кнопка для возврата назад */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Image
                      source={require('../assets/Back.png')}
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
  headerContainer: {
    marginTop: 90,
    alignItems: 'center',
  },
  headerTitle: {
    width: 500,
    height: 100,
    resizeMode: 'contain',
  },
  rulesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: 50,
    backgroundColor: 'rgba(92, 92, 92, 0.6)', // темный полупрозрачный фон
    borderRadius: 10,
  },
  ruleText: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 20,
    lineHeight: 28,
  },
  backButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(255, 225, 198, 0.65)',
    paddingHorizontal: 70,
    paddingVertical: 10,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgb(255, 123, 0)',
  },
  buttonImage: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
});
