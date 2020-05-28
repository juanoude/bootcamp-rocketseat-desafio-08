import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import hasProduct from '../utils/hasProduct';

export interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // const clear = false;

      // if (clear) {
      //   await AsyncStorage.clear();
      // } else {
      const storage = await AsyncStorage.getItem('@GoMarketplace:products');
      if (storage) {
        const parsedStorage = JSON.parse(storage);
        setProducts(parsedStorage);
        // }
      }
    }
    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const index = products.findIndex(product => product.id === id);
      products[index].quantity += 1;

      setProducts(state => [...state]);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(product => product.id === id);
      products[index].quantity -= 1;

      setProducts(state => [...state]);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      if (!hasProduct(products, product)) {
        const newProduct = {
          ...product,
          quantity: 1,
        };

        setProducts(oldProducts => [...oldProducts, newProduct]);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      } else {
        increment(product.id);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
