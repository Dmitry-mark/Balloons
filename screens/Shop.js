// screens/Shop.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ImageBackground,
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const products = [
  {
    id: '1',
    name: 'Shevrole Camaro',
    price: 1000,
    image: require('../assets/car1.png'),
  },
  {
    id: '2',
    name: 'BMW M3',
    price: 1500,
    image: require('../assets/car2.png'),
  },
  {
    id: '3',
    name: 'Mustang Shelbi, l',
    price: 2000,
    image: require('../assets/car3.png'),
  },
];

// Функция для заполнения последней строки, если элементов нечётное число
const formatData = (data, numColumns) => {
  const numberOfFullRows = Math.floor(data.length / numColumns);
  let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns);
  while (numberOfElementsLastRow !== 0 && numberOfElementsLastRow !== numColumns) {
    data.push({ id: `blank-${numberOfElementsLastRow}`, empty: true });
    numberOfElementsLastRow++;
  }
  return data;
};

export default function ShopScreen({ navigation }) {
  const [balance, setBalance] = useState(0);
  const [purchasedProducts, setPurchasedProducts] = useState([]);

  // Загружаем баланс из AsyncStorage при монтировании экрана
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const balanceStr = await AsyncStorage.getItem('balance');
        setBalance(balanceStr ? parseInt(balanceStr, 10) : 0);
      } catch (error) {
        console.error("Ошибка при загрузке баланса: ", error);
      }
    };
    loadBalance();
  }, []);

  // Функция для обновления баланса в AsyncStorage
  const updateBalance = async (newBalance) => {
    try {
      await AsyncStorage.setItem('balance', newBalance.toString());
    } catch (error) {
      console.error("Ошибка при обновлении баланса: ", error);
    }
  };

  // Логика покупки товара
  const handlePurchase = (item) => {
    // Если товар уже куплен, ничего не делаем
    if (purchasedProducts.includes(item.id)) return;

    if (balance < item.price) {
      Alert.alert("Недостаточно средств", "У вас недостаточно Balloonies для покупки этого товара.");
      return;
    }
    const newBalance = balance - item.price;
    setBalance(newBalance);
    updateBalance(newBalance);
    setPurchasedProducts([...purchasedProducts, item.id]);
  };

  // Логика продажи товара (возврат средств)
  const handleSell = (item) => {
    if (!purchasedProducts.includes(item.id)) return;
    const newBalance = balance + item.price;
    setBalance(newBalance);
    updateBalance(newBalance);
    setPurchasedProducts(purchasedProducts.filter(id => id !== item.id));
  };

  const formattedProducts = formatData([...products], 2);

  const renderItem = ({ item }) => {
    if (item.empty) {
      return <View style={[styles.card, styles.invisibleCard]} />;
    }
    const isPurchased = purchasedProducts.includes(item.id);
    return (
      <View style={styles.card}>
        <Image source={item.image} style={styles.productImage} />
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>{item.price} Balloonies</Text>
        {isPurchased ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.purchasedButton]} disabled={true}>
              <Text style={styles.buttonText}>куплено</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.sellButton]} onPress={() => handleSell(item)}>
              <Text style={styles.buttonText}>продать</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handlePurchase(item)}
          >
            <Text style={styles.buttonText}>Купить</Text>
          </TouchableOpacity>
        )}
      </View>
    );
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

      {/* Стрелочка для возврата на главный экран */}
      <TouchableOpacity 
        style={styles.backArrow}
        onPress={() => navigation.navigate('StartScreen')}
      >
        <Image 
          source={require('../assets/arrow.png')}
          style={styles.arrowImage}
        />
      </TouchableOpacity>

      <View style={styles.container}>
        <FlatList 
          key={'2'} // фиксированный ключ для двух колонок
          data={formattedProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
        />
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
  // Стиль для стрелочки (кнопки возврата)
  backArrow: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 2,
  },
  arrowImage: {
    width: 50,
    height: 40,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    padding: 10,
    marginTop: 100, // отступ сверху
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'rgba(255, 225, 198, 0.65)',
    borderRadius: 20,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    width: '47%', // две карточки в ряду
  },
  invisibleCard: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
  },
  productName: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#ff7b00',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  purchasedButton: {
    backgroundColor: 'green',
  },
  sellButton: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
