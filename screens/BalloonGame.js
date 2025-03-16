// Match3BalloonsSwipeGameAnimated.js
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  ImageBackground,
  Alert,
  PanResponder,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


// Включаем LayoutAnimation для Android
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const ROWS = 6;
const COLS = 6;
const COLORS = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const boardScale = 0.9;
const boardWidth = windowWidth * boardScale;
const cellSize = boardWidth / COLS;
const boardHeight = cellSize * ROWS;
const boardMarginTop = (windowHeight - boardHeight) / 2;

// Шар занимает всю ячейку
const balloonSize = cellSize;

// Целевая точка для анимации исчезновения (область счёта)
const scoreTarget = { x: windowWidth / 2 - balloonSize / 2, y: 30 };

// Компонент объёмного шара
const ThreeDBalloon = ({ color, size }) => {
  const gradients = {
    red: ['#ffcccc', '#ff0000'],
    green: ['#ccffcc', '#00aa00'],
    blue: ['#ccccff', '#0000ff'],
    yellow: ['#ffffcc', '#ffff00'],
    purple: ['#e6ccff', '#8000ff'],
    orange: ['#ffe6cc', '#ff8000'],
  };

  return (
    <LinearGradient
      colors={gradients[color] || [color, color]}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 5,
        transform: [{ perspective: 1000 }, { rotateX: '10deg' }],
      }}
    >
      <View style={{
        width: size * 0.6,
        height: size * 0.6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: size,
      }}/>
    </LinearGradient>
  );
};

// Компонент ячейки с обработкой свайпа
const BalloonCell = ({ row, col, color, size, onSwipe }) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const threshold = 20; // минимальное смещение для распознавания свайпа
        if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
        let direction = null;
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }
        onSwipe(row, col, direction);
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        position: 'absolute',
        left: col * cellSize,
        top: row * cellSize,
        width: size,
        height: size,
      }}
    >
      {color && <ThreeDBalloon color={color} size={size} />}
    </View>
  );
};

// Компонент для анимации улёта шарика
const FlyingBalloon = ({ initialX, initialY, color, size, onComplete }) => {
  const animValue = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  // Запускаем анимацию сразу при монтировании
  Animated.timing(animValue, {
    toValue: scoreTarget,
    duration: 500,
    useNativeDriver: false,
  }).start(() => {
    if (onComplete) onComplete();
  });

  return (
    <Animated.View style={{
      position: 'absolute',
      width: size,
      height: size,
      transform: animValue.getTranslateTransform(),
    }}>
      <ThreeDBalloon color={color} size={size} />
    </Animated.View>
  );
};

// Генерация игрового поля
function generateBoard() {
  const board = [];
  for (let row = 0; row < ROWS; row++) {
    const rowArr = [];
    for (let col = 0; col < COLS; col++) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      rowArr.push(color);
    }
    board.push(rowArr);
  }
  return board;
}

// Поиск совпадений по горизонтали и вертикали
function findMatches(board) {
  const matches = new Set();

  // По горизонтали
  for (let row = 0; row < ROWS; row++) {
    let matchLength = 1;
    for (let col = 0; col < COLS; col++) {
      const current = board[row][col];
      const next = col < COLS - 1 ? board[row][col + 1] : null;
      if (current && current === next) {
        matchLength++;
      } else {
        if (matchLength >= 3) {
          for (let k = 0; k < matchLength; k++) {
            matches.add(`${row},${col - k}`);
          }
        }
        matchLength = 1;
      }
    }
  }

  // По вертикали
  for (let col = 0; col < COLS; col++) {
    let matchLength = 1;
    for (let row = 0; row < ROWS; row++) {
      const current = board[row][col];
      const next = row < ROWS - 1 ? board[row + 1][col] : null;
      if (current && current === next) {
        matchLength++;
      } else {
        if (matchLength >= 3) {
          for (let k = 0; k < matchLength; k++) {
            matches.add(`${row - k},${col}`);
          }
        }
        matchLength = 1;
      }
    }
  }

  return matches;
}

// Удаление совпадений из доски
function removeMatches(board, matches) {
  matches.forEach(pos => {
    const [row, col] = pos.split(',').map(Number);
    board[row][col] = null;
  });
}

// Применение гравитации и заполнение пустых мест новыми шарами
function applyGravity(board) {
  for (let col = 0; col < COLS; col++) {
    let emptySpots = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        emptySpots++;
      } else if (emptySpots > 0) {
        board[row + emptySpots][col] = board[row][col];
        board[row][col] = null;
      }
    }
    for (let row = 0; row < emptySpots; row++) {
      board[row][col] = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
  }
}

export default function Match3BalloonsSwipeGameAnimated({ navigation }) {
  const [board, setBoard] = useState(generateBoard());
  const [score, setScore] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [flyingBalloons, setFlyingBalloons] = useState([]); // шарики, которые анимируются при исчезновении

  // Обработка свайпа в ячейке
  const handleSwipe = (row, col, direction) => {
    if (processing) return;
    let targetRow = row;
    let targetCol = col;
    if (direction === 'left') targetCol = col - 1;
    if (direction === 'right') targetCol = col + 1;
    if (direction === 'up') targetRow = row - 1;
    if (direction === 'down') targetRow = row + 1;
    if (targetRow < 0 || targetRow >= ROWS || targetCol < 0 || targetCol >= COLS) return;
    swapCells([row, col], [targetRow, targetCol]);
  };

  // Обмен двух ячеек с анимацией (LayoutAnimation)
  const swapCells = (cell1, cell2) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const [row1, col1] = cell1;
    const [row2, col2] = cell2;
    const newBoard = board.map(row => row.slice());
    [newBoard[row1][col1], newBoard[row2][col2]] = [newBoard[row2][col2], newBoard[row1][col1]];
    setBoard(newBoard);
    setProcessing(true);
    const matches = findMatches(newBoard);
    if (matches.size > 0) {
      processMatches(newBoard, matches);
    } else {
      // Если совпадений нет — возвращаем обмен
      setTimeout(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBoard(board);
        setProcessing(false);
      }, 300);
    }
  };

  // Обработка совпадений с анимацией улёта шаров
  const processMatches = (currentBoard, matches) => {
    // Для каждого совпавшего шара запускаем анимацию улёта
    const animations = [];
    matches.forEach(pos => {
      const [row, col] = pos.split(',').map(Number);
      // Если в доске уже нет шара (может быть, уже удалён) — пропускаем
      if (!currentBoard[row][col]) return;
      animations.push({ row, col, color: currentBoard[row][col] });
    });

    if (animations.length > 0) {
      // Добавляем анимированные шарики поверх доски
      setFlyingBalloons(prev => [...prev, ...animations]);
      // Даем время на анимацию (500 мс), затем обновляем доску
      setTimeout(() => {
        // Удаляем совпадения из доски, применяем гравитацию и обновляем счёт
        removeMatches(currentBoard, matches);
        applyGravity(currentBoard);
        setScore(prev => prev + animations.length * 10);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBoard(currentBoard);
        setProcessing(false);
        // Удаляем анимированные шарики
        setFlyingBalloons([]);
      }, 600);
    } else {
      setProcessing(false);
    }
  };

  // Отрисовка игрового поля
  const renderBoard = () => {
    const cells = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const color = board[row][col];
        cells.push(
          <BalloonCell 
            key={`cell-${row}-${col}`}
            row={row}
            col={col}
            color={color}
            size={balloonSize}
            onSwipe={handleSwipe}
          />
        );
      }
    }
    return (
      <View style={[styles.boardContainer, { width: boardWidth, height: boardHeight, marginTop: boardMarginTop }]}>
        {cells}
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('../assets/background.png')}
      style={styles.background}
    >
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      {renderBoard()}
      {/* Отрисовываем анимированные шарики, которые исчезают */}
      {flyingBalloons.map((balloon, index) => (
        <FlyingBalloon
          key={`flying-${index}`}
          initialX={balloon.col * cellSize}
          initialY={balloon.row * cellSize + boardMarginTop}
          color={balloon.color}
          size={balloonSize}
          onComplete={() => {}}
        />
      ))}
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1
  },
  boardContainer: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
  },
  scoreContainer: { 
    position: 'absolute', 
    top: boardMarginTop - 50, 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    zIndex: 10 
  },
  scoreText: { 
    color: 'white', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  exitButton: { 
    position: 'absolute', 
    top: 40, 
    left: 20, 
    backgroundColor: 'rgba(255,255,255,0.7)', 
    padding: 10, 
    borderRadius: 5, 
    zIndex: 20 
  },
  exitButtonText: { 
    color: 'black', 
    fontWeight: 'bold' 
  },
});
