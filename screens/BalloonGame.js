// BalloonPopGameWithBombExplosion.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ImageBackground, 
  Image, 
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const balloonSize = windowWidth * 0.3; // Размер объекта ~30% ширины экрана
const COLORS = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
const SPAWN_INTERVAL = 800; // интервал появления объектов (в мс)
const INITIAL_BOMB_PROBABILITY = 0.05;
const LEVEL_DURATION = 10000; // длительность уровня в мс (например, 10 секунд)

const Balloon = ({ id, x, color, duration, onPop, onGameOver, onRemove }) => {
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [popped, setPopped] = useState(false);
  const poppedRef = useRef(false);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: -balloonSize,
      duration: duration,
      useNativeDriver: true,
    }).start(() => {
      if (!poppedRef.current) {
        onGameOver();
      }
      onRemove(id);
    });
  }, []);

  const handlePress = () => {
    if (poppedRef.current) return;
    setPopped(true);
    poppedRef.current = true;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPop();      
      onRemove(id);
    });
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={{
        position: 'absolute',
        left: x,
        transform: [{ translateY }, { scale }],
        opacity,
      }}>
        <Image 
          source={require('../assets/balloon.png')}
          style={{ 
            width: balloonSize, 
            height: balloonSize,
            tintColor: color,
          }}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const Bomb = ({ id, x, duration, onGameOver, onRemove }) => {
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: -balloonSize,
      duration: duration,
      useNativeDriver: true,
    }).start(() => {
      if (!exploded) onRemove(id);
    });
  }, []);

  const handlePress = () => {
    if (exploded) return;
    setExploded(true);
    // При необходимости можно остановить текущую анимацию
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={{
        position: 'absolute',
        left: x,
        transform: [{ translateY }, { scale }],
        opacity,
      }}>
        {exploded ? (
          <LottieView
            source={require('../assets/explosion.json')}
            style={{ width: balloonSize, height: balloonSize }}
            autoPlay
            loop={false}
            onAnimationFinish={() => {
              onGameOver();
              onRemove(id);
            }}
          />
        ) : (
          <Image 
            source={require('../assets/bomb.png')}
            style={{ width: balloonSize, height: balloonSize }}
          />
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default function BalloonPopGameWithBombExplosion({ navigation }) {
  const [objects, setObjects] = useState([]); // объекты (шары и бомбы)
  const [score, setScore] = useState(0); // заработанная валюта за сессию
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false); // новое состояние для победы
  const [elapsedTime, setElapsedTime] = useState(0); // время игры в секундах
  const [level, setLevel] = useState(1); // уровень сложности

  // Для актуального доступа к времени используем ref
  const elapsedTimeRef = useRef(0);
  const objectId = useRef(0);
  const spawnInterval = useRef(null);

  // Обновление времени каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      elapsedTimeRef.current += 1;
      setElapsedTime(elapsedTimeRef.current);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Функция завершения игры при проигрыше
  const handleGameOver = async () => {
    if (gameOver) return;
    setGameOver(true);
    clearInterval(spawnInterval.current);
    try {
      const currentBalanceStr = await AsyncStorage.getItem('balance');
      const currentBalance = currentBalanceStr ? parseInt(currentBalanceStr, 10) : 0;
      const newBalance = currentBalance + score;
      await AsyncStorage.setItem('balance', newBalance.toString());
    } catch (error) {
      console.error("Ошибка при обновлении баланса: ", error);
    }
    setObjects([]);
  };

  // Функция завершения игры с победой
  const winGame = async () => {
    if (gameOver) return;
    setGameOver(true);
    setWin(true);
    clearInterval(spawnInterval.current);
    try {
      const currentBalanceStr = await AsyncStorage.getItem('balance');
      const currentBalance = currentBalanceStr ? parseInt(currentBalanceStr, 10) : 0;
      const newBalance = currentBalance + score;
      await AsyncStorage.setItem('balance', newBalance.toString());
    } catch (error) {
      console.error("Ошибка при обновлении баланса: ", error);
    }
    setObjects([]);
  };

  // Прогрессия уровней: каждые LEVEL_DURATION мс повышаем уровень до 50 и вызываем победу
  useEffect(() => {
    if (!gameOver) {
      const levelTimer = setInterval(() => {
        setLevel(prevLevel => {
          if (prevLevel < 49) {
            return prevLevel + 1;
          } else if (prevLevel === 49) {
            winGame();
            return 50;
          }
          return prevLevel;
        });
      }, LEVEL_DURATION);
      return () => clearInterval(levelTimer);
    }
  }, [gameOver]);

  // Функция спавна объектов с динамическими параметрами, зависящими от уровня
  const spawnObject = () => {
    const x = Math.random() * (windowWidth - balloonSize);
    const id = objectId.current++;
    // Используем уровень для увеличения сложности
    const currentBombProbability = Math.min(0.5, INITIAL_BOMB_PROBABILITY + level * 0.01);
    const minDuration = Math.max(1000, 3000 - level * 50);
    const maxDuration = Math.max(2000, 6000 - level * 50);
    const duration = Math.floor(Math.random() * (maxDuration - minDuration)) + minDuration;
    
    let type = 'balloon';
    if (Math.random() < currentBombProbability) {
      type = 'bomb';
    }
    if (type === 'balloon') {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const newObject = { id, x, type, color, duration };
      setObjects(prev => [...prev, newObject]);
    } else {
      const newObject = { id, x, type, duration };
      setObjects(prev => [...prev, newObject]);
    }
  };

  // Интервал спавна объектов
  useEffect(() => {
    if (!gameOver) {
      spawnInterval.current = setInterval(spawnObject, SPAWN_INTERVAL);
    }
    return () => clearInterval(spawnInterval.current);
  }, [gameOver, level]);

  const handlePop = () => {
    // За каждый лопнутый шар начисляем 10 единиц валюты
    setScore(prev => prev + 10);
  };

  const handleRemove = (id) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
  };

  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    setWin(false);
    setObjects([]);
    objectId.current = 0;
    elapsedTimeRef.current = 0;
    setElapsedTime(0);
    setLevel(1); // Сброс уровня при перезапуске
  };

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

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
          Score: {score} | Level: {level}
        </Text>
      </View>

      {objects.map(obj => {
        if (obj.type === 'balloon') {
          return (
            <Balloon 
              key={obj.id}
              id={obj.id}
              x={obj.x}
              color={obj.color}
              duration={obj.duration}
              onPop={handlePop}
              onGameOver={handleGameOver}
              onRemove={handleRemove}
            />
          );
        } else if (obj.type === 'bomb') {
          return (
            <Bomb 
              key={obj.id}
              id={obj.id}
              x={obj.x}
              duration={obj.duration}
              onGameOver={handleGameOver}
              onRemove={handleRemove}
            />
          );
        }
        return null;
      })}

      <TouchableOpacity
        style={styles.backArrow}
        onPress={() => {
          if (navigation) {
            navigation.navigate('StartScreen');
          } else {
            Alert.alert('Exit', 'Вернуться в меню');
          }
        }}
      >
        <Image 
                  source={require('../assets/arrow.png')}
                  style={styles.arrowImage}
                />
      </TouchableOpacity>

      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.gameOverBox}>
            <Image
              source={win ? require('../assets/win.png') : require('../assets/Over.png')}
              style={styles.gameOverImage}
            />
            <TouchableOpacity style={styles.overlayButton} onPress={restartGame}>
              <Image
                source={require('../assets/Restart.png')}
                style={styles.overlayButtonImage}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.overlayButton} onPress={() => {
              if (navigation) {
                navigation.navigate('StartScreen');
              } else {
                Alert.alert('Exit', 'Вернуться в меню');
              }
            }}>
              <Image
                source={require('../assets/Menu.png')}
                style={styles.overlayButtonImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  backArrow: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 2,
  },
  scoreContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  scoreText: {
    color: 'rgb(255, 123, 0)',
    fontSize: 28,
    fontWeight: 'bold',
  },
  exitButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(255, 225, 198, 0.65)',
    padding: 10,
    borderRadius: 20,
    zIndex: 20,
  },
  exitButtonImage: {
    width: 60,
    height: 30,
    resizeMode: 'contain',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  gameOverBox: {
    width: windowWidth * 0.8,
    backgroundColor: 'rgba(255, 225, 198, 0.65)',
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  gameOverImage: {
    width: 250,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  overlayButton: {
    marginVertical: 10,
  },
  overlayButtonImage: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
    backgroundColor: 'rgba(253, 169, 59, 0.82)',
    borderRadius: 25,
    padding: 5,
  },
  arrowImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
});
