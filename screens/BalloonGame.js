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
import LottieView from 'lottie-react-native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const balloonSize = windowWidth * 0.3; // Размер объекта ~30% ширины экрана
const COLORS = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
const SPAWN_INTERVAL = 800; // интервал появления объектов (в мс)

// Начальная вероятность появления бомбы
const INITIAL_BOMB_PROBABILITY = 0.05;

//
// Компонент обычного шара
//
// Компонент обычного шара
const Balloon = ({ id, x, color, duration, onPop, onGameOver, onRemove }) => {
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [popped, setPopped] = useState(false);
  const poppedRef = useRef(false); // Новый ref для отслеживания, был ли шар лопнут

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: -balloonSize,
      duration: duration,
      useNativeDriver: true,
    }).start(() => {
      // Если шар не был лопнут, завершаем игру
      if (!poppedRef.current) {
        onGameOver();
      }
      onRemove(id);
    });
  }, []);

  const handlePress = () => {
    if (poppedRef.current) return;
    setPopped(true);
    poppedRef.current = true; // Обновляем ref сразу
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


//
// Компонент бомбы с Lottie-анимацией взрыва
//
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
    // При необходимости можно остановить текущую анимацию: translateY.stopAnimation();
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
  const [objects, setObjects] = useState([]); // хранит и шары, и бомбы
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // время в секундах с начала игры

  // Для актуального доступа к времени используем ref
  const elapsedTimeRef = useRef(0);
  const objectId = useRef(0);
  const spawnInterval = useRef(null);

  // Обновляем время каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      elapsedTimeRef.current += 1;
      setElapsedTime(elapsedTimeRef.current);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Функция спавна объектов с динамическими параметрами
  const spawnObject = () => {
    const x = Math.random() * (windowWidth - balloonSize);
    const id = objectId.current++;
    // Увеличиваем вероятность появления бомбы с течением времени (максимум 0.5)
    const currentBombProbability = Math.min(0.5, INITIAL_BOMB_PROBABILITY + elapsedTimeRef.current * 0.005);
    // Уменьшаем длительность анимации (объекты летают быстрее), но не ниже определённого минимума
    const minDuration = Math.max(1000, 3000 - elapsedTimeRef.current * 50);
    const maxDuration = Math.max(2000, 6000 - elapsedTimeRef.current * 50);
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

  // Интервал спавна объектов (используем постоянный интервал, параметры объектов вычисляются динамически)
  useEffect(() => {
    if (!gameOver) {
      spawnInterval.current = setInterval(spawnObject, SPAWN_INTERVAL);
    }
    return () => clearInterval(spawnInterval.current);
  }, [gameOver]);

  const handlePop = () => {
    setScore(prev => prev + 10);
  };

  const handleGameOver = () => {
    setGameOver(true);
    setObjects([]);
    clearInterval(spawnInterval.current);
  };

  const handleRemove = (id) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
  };

  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    setObjects([]);
    objectId.current = 0;
    elapsedTimeRef.current = 0;
    setElapsedTime(0);
  };

  return (
    <ImageBackground 
      source={require('../assets/background.png')}
      style={styles.background}
    >
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
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
        style={styles.exitButton}
        onPress={() => {
          if (navigation) {
            navigation.navigate('StartScreen');
          } else {
            Alert.alert('Exit', 'Вернуться в меню');
          }
        }}
      >
        <Text style={styles.exitButtonText}>Exit</Text>
      </TouchableOpacity>
      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.gameOverBox}>
            <Text style={styles.gameOverText}>Game Over</Text>
            <TouchableOpacity style={styles.button} onPress={restartGame}>
              <Text style={styles.buttonText}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {
              if (navigation) {
                navigation.navigate('StartScreen');
              } else {
                Alert.alert('Exit', 'Вернуться в меню');
              }
            }}>
              <Text style={styles.buttonText}>Go back to the menu</Text>
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
  scoreContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  scoreText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  exitButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 10,
    borderRadius: 5,
    zIndex: 20,
  },
  exitButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  gameOverBox: {
    width: windowWidth * 0.8,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4287f5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
