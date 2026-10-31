import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Size } from '../services/api';
import { toast } from 'react-hot-toast';

interface CartItem extends Product {
  quantity: number;
  selectedSize?: Size;
  selectedColor?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: Size, color?: string) => void;
  removeFromCart: (productId: string | number, sizeId?: string | number, color?: string) => void;
  updateQuantity: (productId: string | number, quantity: number, sizeId?: string | number, color?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('essence_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('essence_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, size?: Size, color?: string) => {
    const existing = cart.find(item => 
      item.id === product.id && 
      item.selectedSize === size && 
      item.selectedColor === color
    );

    if (existing) {
      toast.success(`Increased ${product.name} quantity`, {
  position: "bottom-right",
});
    } else {
      console.log(product);
      toast.success(`${product.name} added to cart`, {
  position: "bottom-right",
});
    }

    setCart(prev => {
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.selectedSize=== size && item.selectedColor === color)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
  };

  const removeFromCart = (productId: string | number, size?: string | number, color?: string) => {
    const itemToRemove = cart.find(item => item.id === productId && item.selectedSize === size && item.selectedColor === color);
    if (itemToRemove) {
      toast.error(`${itemToRemove.name} removed from cart`);
    }
    setCart(prev => prev.filter(item => 
      !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (productId: string | number, quantity: number, size?: string | number, color?: string) => {
    if (quantity < 1) return removeFromCart(productId, size, color);
    setCart(prev =>
      prev.map(item => (
        (item.id === productId && item.selectedSize === size && item.selectedColor === color) 
          ? { ...item, quantity } 
          : item
      ))
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.error('Cart cleared');
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.offer_price??item.price) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
