// BalloonGame.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Image, 
  ImageBackground 
} from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';

const ROWS = 10;
const COLS = 10;
const COLORS = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const cellSize = windowWidth / COLS; // ширина ячейки по ширине экрана
const boardWidth = windowWidth;
const boardHeight = cellSize * ROWS;
// Вычисляем отступ, чтобы поле было центрировано по вертикали
const boardMarginTop = (windowHeight - boardHeight) / 2;

//
// Генерация матрицы с шариками
//
function generateBoard() {
  let board = [];
  for (let row = 0; row < ROWS; row++) {
    let rowArr = [];
    for (let col = 0; col < COLS; col++) {
      let color = COLORS[Math.floor(Math.random() * COLORS.length)];
      rowArr.push(color);
    }
    board.push(rowArr);
  }
  return board;
}

//
// Поиск кластера (группы) смежных шариков одного цвета (DFS)
//
function getCluster(board, row, col) {
  let color = board[row][col];
  if (!color) return [];
  let stack = [[row, col]];
  let cluster = [];
  let visited = {};
  visited[row + ',' + col] = true;
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (stack.length > 0) {
    let pos = stack.pop();
    let r = pos[0], c = pos[1];
    cluster.push([r, c]);
    for (let i = 0; i < directions.length; i++) {
      let dr = directions[i][0], dc = directions[i][1];
      let nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        if (!visited[nr + ',' + nc] && board[nr][nc] === color) {
          visited[nr + ',' + nc] = true;
          stack.push([nr, nc]);
        }
      }
    }
  }
  return cluster;
}

//
// Удаление шариков из найденного кластера
//
function removeCluster(board, cluster) {
  cluster.forEach(function(pair) {
    let r = pair[0], c = pair[1];
    board[r][c] = null;
  });
}

//
// Гравитация: шарики "падают" вниз
//
function applyGravity(board) {
  for (let col = 0; col < COLS; col++) {
    let writeRow = ROWS - 1;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] !== null) {
        board[writeRow][col] = board[row][col];
        writeRow--;
      }
    }
    for (let row = writeRow; row >= 0; row--) {
      board[row][col] = null;
    }
  }
}

//
// Сдвиг столбцов влево, если столбец пустой
//
function shiftLeft(board) {
  let writeCol = 0;
  for (let col = 0; col < COLS; col++) {
    let isEmpty = true;
    for (let row = 0; row < ROWS; row++) {
      if (board[row][col] !== null) {
        isEmpty = false;
        break;
      }
    }
    if (!isEmpty) {
      if (writeCol !== col) {
        for (let row = 0; row < ROWS; row++) {
          board[row][writeCol] = board[row][col];
          board[row][col] = null;
        }
      }
      writeCol++;
    }
  }
}

//
// Проверка наличия допустимых ходов (есть ли рядом два шарика одного цвета)
//
function checkNoMoves(board) {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      let color = board[row][col];
      if (color) {
        if (col < board[row].length - 1 && board[row][col + 1] === color) return false;
        if (row < board.length - 1 && board[row + 1][col] === color) return false;
      }
    }
  }
  return true;
}

//
// Система проверки окончания игры
//
function GameOverSystem(entities, { time }) {
  if (entities.board && !entities.board._gameOverChecked) {
    if (checkNoMoves(entities.board.board)) {
      entities.board._gameOverChecked = true;
      if (entities.gameOverCallback) {
        entities.gameOverCallback(true);
      }
    }
  }
  return entities;
}

//
// Система физики: обновление движка Matter.js и удаление шариков, ушедших за экран
//
function PhysicsSystem(entities, { time }) {
  let engine = entities.physics.engine;
  Matter.Engine.update(engine, time.delta);
  for (let key in entities) {
    if (entities[key].body && entities[key].renderer === PhysicsBallRenderer) {
      let pos = entities[key].body.position;
      if (pos.y - entities[key].radius > windowHeight) {
        delete entities[key];
      }
    }
  }
  return entities;
}

//
// Система обработки касаний: при нажатии на группу шариков – удаляем их и создаём для них физические объекты с импульсом
//
function TouchSystem(entities, { touches }) {
  let boardEntity = entities.board;
  if (!boardEntity) return entities;
  let board = boardEntity.board;
  touches.filter(t => t.type === 'press').forEach(t => {
    let event = t.event;
    let x = event.pageX;
    let y = event.pageY;
    // Корректируем координаты, учитывая отступ сверху
    let adjustedY = y - boardMarginTop;
    let col = Math.floor(x / cellSize);
    let row = Math.floor(adjustedY / cellSize);
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS && board[row][col] !== null) {
      let cluster = getCluster(board, row, col);
      if (cluster.length >= 2) {
        let color = board[row][col];
        removeCluster(board, cluster);
        boardEntity.score += cluster.length * cluster.length;
        if (entities.scoreUpdateCallback) {
          entities.scoreUpdateCallback(boardEntity.score);
        }
        applyGravity(board);
        shiftLeft(board);
        // Для каждого шарика из кластера создаём физическое тело с импульсом (старая физика)
        cluster.forEach(cell => {
          let r = cell[0], c = cell[1];
          let ballX = c * cellSize + cellSize / 2;
          let ballY = r * cellSize + cellSize / 2 + boardMarginTop;
          let radius = (cellSize - 2) / 2;
          let ballBody = Matter.Bodies.circle(ballX, ballY, radius, {
            restitution: 0.6,
            friction: 0.9,
          });
          Matter.World.add(entities.physics.world, [ballBody]);
          let id = 'popped_' + r + '_' + c + '_' + Date.now() + Math.random();
          entities[id] = {
            body: ballBody,
            radius: radius,
            color: color,
            renderer: PhysicsBallRenderer,
          };
          Matter.Body.applyForce(ballBody, ballBody.position, {
            x: (Math.random() - 0.5) * 0.05,
            y: -Math.random() * 0.1,
          });
        });
      }
    }
  });
  return entities;
}

//
// Рендерер для физически моделируемого шарика (Matter.js)
//
function PhysicsBallRenderer(props) {
  let body = props.body;
  let radius = props.radius;
  return (
    <Image
      source={require('../assets/balloon.png')}
      style={{
        position: 'absolute',
        left: body.position.x - radius,
        top: body.position.y - radius,
        width: radius * 2,
        height: radius * 2,
        tintColor: props.color || 'white',
      }}
    />
  );
}

//
// Рендерер для статической доски (неподвижные шарики)
//
function BoardRenderer(props) {
  let board = props.board;
  let balloons = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      let color = board[row][col];
      if (color) {
        let left = col * cellSize;
        let top = row * cellSize;
        balloons.push(
          <Image
            key={'balloon-' + row + '-' + col}
            source={require('../assets/balloon.png')}
            style={[
              styles.balloon,
              {
                left: left,
                top: top,
                width: cellSize - 2,
                height: cellSize - 2,
                tintColor: color,
              },
            ]}
          />
        );
      }
    }
  }
  return (
    <View style={[styles.boardContainer, { width: boardWidth, height: boardHeight, marginTop: boardMarginTop }]}>
      {balloons}
    </View>
  );
}

//
// Основной компонент игры
//
function BalloonGame(props) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Изначальные entities для GameEngine
  const [entities, setEntities] = useState({
    board: {
      board: generateBoard(),
      score: 0,
      renderer: props => <BoardRenderer {...props} />,
    },
    scoreUpdateCallback: newScore => {
      setScore(newScore);
    },
    gameOverCallback: isOver => {
      setGameOver(isOver);
    },
    physics: {
      engine: Matter.Engine.create(),
      world: null,
    },
  });

  // Инициализируем физическую среду
  useEffect(() => {
    entities.physics.world = entities.physics.engine.world;
  }, []);

  return (
    <ImageBackground 
      source={require('../assets/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Счёт располагается чуть выше игрового поля по центру */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      <GameEngine
        style={styles.gameContainer}
        systems={[TouchSystem, PhysicsSystem, GameOverSystem]}
        entities={entities}
        running={!gameOver}
      />
      <TouchableOpacity
        style={styles.exitButton}
        onPress={() => {
          if (props.navigation) {
            props.navigation.navigate('StartScreen');
          }
        }}
      >
        <Text style={styles.exitButtonText}>Exit</Text>
      </TouchableOpacity>
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over</Text>
          <TouchableOpacity
            style={styles.exitGameOverButton}
            onPress={() => {
              if (props.navigation) {
                props.navigation.navigate('StartScreen');
              }
            }}
          >
            <Text style={styles.exitButtonText}>Exit to Main</Text>
          </TouchableOpacity>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  gameContainer: { 
    flex: 1 
  },
  boardContainer: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'transparent', // прозрачный квадрат для шариков
    borderWidth: 2,
    borderColor: 'white',
  },
  balloon: {
    position: 'absolute',
    backgroundColor: 'transparent',
    // Эффект объёма через тень
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
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
  gameOverOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: windowWidth, 
    height: windowHeight, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 30 
  },
  gameOverText: { 
    color: 'white', 
    fontSize: 32, 
    marginBottom: 20 
  },
  exitGameOverButton: { 
    backgroundColor: 'rgba(255,255,255,0.7)', 
    padding: 15, 
    borderRadius: 5 
  },
});

export default BalloonGame;
