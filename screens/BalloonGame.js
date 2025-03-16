// BalloonGame.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Alert } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

// Компонент, отображающий анимированный шар с помощью Lottie.
// Убедитесь, что файл MainScene.json (анимация шара без заднего фона)
// находится в папке assets.
const AnimatedBalloon = ({ position }) => {
  return (
    <View style={[styles.balloonContainer, { left: position[0], top: position[1] }]}>
      <LottieView
        source={require('../assets/MainScene.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
};

// Система движения: перемещает все шары вверх с учётом их скорости.
const MoveBalloons = (entities, { time }) => {
  let newEntities = { ...entities };
  Object.keys(newEntities).forEach(key => {
    const entity = newEntities[key];
    if (entity && entity.type === 'balloon') {
      // Смещение по Y: скорость умножается на delta времени (делим на 10 для подстройки)
      entity.position = [
        entity.position[0],
        entity.position[1] - entity.speed * (time.delta / 10)
      ];
      // Если шар полностью вышел за верх, удаляем его
      if (entity.position[1] < -80) {
        delete newEntities[key];
      }
    }
  });
  return newEntities;
};

// Система спавна: с некоторой вероятностью создаёт новый шар внизу экрана.
const SpawnBalloons = (entities, { time, dispatch }) => {
  // Можно регулировать вероятность появления шаров (чем больше – тем их больше)
  if (Math.random() < 0.05) {
    const balloonId = `balloon-${new Date().getTime()}-${Math.random()}`;
    const xPos = Math.random() * (width - 80);
    const speed = 2 + Math.random() * 3;
    entities[balloonId] = {
      type: 'balloon',
      position: [xPos, height],
      speed: speed,
      renderer: <AnimatedBalloon />,
    };
  }
  return entities;
};

// Система обработки нажатий: проверяет, попал ли тап в область шара, и если да – удаляет шар и отправляет событие "pop".
const HandleTouches = (entities, { touches, dispatch }) => {
  let newEntities = { ...entities };
  touches.filter(t => t.type === 'press').forEach(t => {
    const { pageX, pageY } = t.event;
    Object.keys(newEntities).forEach(key => {
      const entity = newEntities[key];
      if (entity && entity.type === 'balloon') {
        const [x, y] = entity.position;
        const size = 80; // Размер анимированного шара
        if (
          pageX >= x &&
          pageX <= x + size &&
          pageY >= y &&
          pageY <= y + size
        ) {
          delete newEntities[key];
          dispatch({ type: 'pop' });
        }
      }
    });
  });
  return newEntities;
};

export default function BalloonGame() {
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);
  const [gameEngine, setGameEngine] = useState(null);

  // Обработка событий от систем (например, событие "pop" для начисления очков)
  const onEvent = (e) => {
    if (e.type === 'pop') {
      setScore(prev => prev + 1);
    }
  };

  // Пример завершения игры через 60 секунд с показом диалога и опцией перезапуска
  useEffect(() => {
    const timer = setTimeout(() => {
      setRunning(false);
      Alert.alert("Game Over", `Ваш счёт: ${score}`, [
        {
          text: "Restart",
          onPress: () => {
            setScore(0);
            setRunning(true);
            gameEngine.swap({}); // очищаем все сущности
          }
        }
      ]);
    }, 60000);
    return () => clearTimeout(timer);
  }, [score, running]);

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <GameEngine
        ref={(ref) => { setGameEngine(ref); }}
        style={styles.gameContainer}
        systems={[SpawnBalloons, MoveBalloons, HandleTouches]}
        entities={{}}
        running={running}
        onEvent={onEvent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB', // голубое небо
  },
  gameContainer: {
    flex: 1,
  },
  score: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    color: '#fff',
  },
  balloonContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: 'transparent',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
