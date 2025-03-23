20// screens/Shop.js
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
import { useFocusEffect } from '@react-navigation/native';

const products = [
  {
    id: '1',
    name: 'Little monkey',
    price: 1200,
    image: require('../assets/animal1.png'),
  },
  {
    id: '2',
    name: 'Little donkey',
    price: 1800,
    image: require('../assets/animal2.png'),
  },
  {
    id: '3',
    name: 'Little capybara',
    price: 2200,
    image: require('../assets/animal3.png'),
  },
  {
    id: '4',
    name: 'Little beaver',
    price: 2600,
    image: require('../assets/animal4.png'),
  },
  {
    id: '5',
    name: 'Little crow',
    price: 3000,
    image: require('../assets/animal5.png'),
  },
  {
    id: '6',
    name: 'Wolf',
    price: 3400,
    image: require('../assets/animal6.png'),
  },
  {
    id: '7',
    name: 'Little hare',
    price: 3800,
    image: require('../assets/animal7.png'),
  },
  {
    id: '8',
    name: 'Little bear',
    price: 4200,
    image: require('../assets/animal8.png'),
  },
  {
    id: '9',
    name: 'Eagle',
    price: 4600,
    image: require('../assets/animal9.png'),
  },
  {
    id: '10',
    name: 'Little fox',
    price: 5000,
    image: require('../assets/animal10.png'),
  }
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

  // Загружаем баланс при монтировании экрана
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const balanceStr = await AsyncStorage.getItem('balance');
        setBalance(balanceStr ? parseInt(balanceStr, 10) : 0);
      } catch (error) {
        console.error("Error loading balance: ", error);
      }
    };
    loadBalance();
  }, []);

  // Загружаем купленные товары при каждом фокусе экрана
  useFocusEffect(
    React.useCallback(() => {
      const loadPurchasedProducts = async () => {
        try {
          const purchasedStr = await AsyncStorage.getItem('purchasedProducts');
          if (purchasedStr) {
            setPurchasedProducts(JSON.parse(purchasedStr));
          }
        } catch (error) {
          console.error("Error when loading purchased items: ", error);
        }
      };
      loadPurchasedProducts();
    }, [])
  );

  // Сохраняем список купленных товаров в AsyncStorage при его изменении
  useEffect(() => {
    const savePurchasedProducts = async () => {
      try {
        await AsyncStorage.setItem('purchasedProducts', JSON.stringify(purchasedProducts));
      } catch (error) {
        console.error("Error saving purchased items: ", error);
      }
    };
    savePurchasedProducts();
  }, [purchasedProducts]);

  // Функция для обновления баланса в AsyncStorage
  const updateBalance = async (newBalance) => {
    try {
      await AsyncStorage.setItem('balance', newBalance.toString());
    } catch (error) {
      console.error("Error updating balance: ", error);
    }
  };

  // Логика покупки товара
  const handlePurchase = (item) => {
    if (purchasedProducts.includes(item.id)) return;

    if (balance < item.price) {
      Alert.alert("Insufficient funds", "You don't have enough Score to purchase this product.");
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
        <View style={styles.imageWrapper}>
  <Image source={item.image} style={styles.productImage} />
</View>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>{item.price} Score</Text>
        {isPurchased ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.purchasedButton]} disabled={true}>
              <Text style={styles.buttonText}>Purchased</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.sellButton]} onPress={() => handleSell(item)}>
              <Text style={styles.buttonText}>Sell</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handlePurchase(item)}
          >
            <Text style={styles.buttonText}>Buy</Text>
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
      <LottieView
        source={require('../assets/Animation.json')}
        autoPlay
        loop
        style={styles.lottieBackground}
      />
      <View style={styles.headerContainer}>
              <Image
                          source={require('../assets/Shop.png')}
                          style={styles.headerTitle}
                        />
            </View>

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
          key={'2'}
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
  backArrow: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 2,
  },
  arrowImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    padding: 10,
    marginTop: 20,
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
    width: '47%',
  },
  invisibleCard: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  imageWrapper: {
    width: '100%',
    height: 160, // Фиксированная высота для всех фото
    overflow: 'hidden',
    borderRadius: 20, // Если хотите скругление, можно убрать или изменить
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    borderRadius: 20,
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
  headerContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    width: 400,
    height: 100,
    resizeMode: 'contain',
  },
});
