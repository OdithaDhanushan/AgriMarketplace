import React, { createContext, useContext, useState } from 'react';

const MOCK_CART_ITEMS = [
  {
    id: 'cart-tomatoes',
    name: 'Vine Tomatoes',
    category: 'Vegetables',
    unit: 'kg',
    unitPrice: 280,
    quantity: 2,
    farmer: 'Nimali Perera',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500',
  },
  {
    id: 'cart-papaya',
    name: 'Sweet Papaya',
    category: 'Fruits',
    unit: 'kg',
    unitPrice: 190,
    quantity: 1,
    farmer: 'Saman Jayawardena',
    image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500',
  },
];

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(MOCK_CART_ITEMS);

  const addToCart = (product, quantity = 1) => {
    setItems((currentItems) => {
      const productId = product.id || product._id;
      const existingIndex = currentItems.findIndex(
        (item) => item.id === productId || (item.name && item.name === product.name)
      );

      if (existingIndex > -1) {
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      const newItem = {
        id: productId || `item-${Date.now()}`,
        name: product.name || product.cropName || 'Fresh Produce',
        category: product.category || 'Vegetables',
        unit: product.unit || 'kg',
        unitPrice: Number(product.price ?? product.unitPrice ?? product.sellingPricePerKg ?? 0),
        quantity: Math.max(1, quantity),
        farmer: product.farmer || 'Local Farm',
        image: product.image || product.photoUrl || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500',
      };

      return [newItem, ...currentItems];
    });
  };

  const updateQuantity = (id, amount) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const [orders, setOrders] = useState([]);

  const addOrder = (order) => {
    const formattedOrder = {
      id: order.id || `SK${Math.floor(1000 + Math.random() * 9000)}`,
      items: order.items || [],
      itemName: order.itemName || (order.items?.[0]?.name || 'Fresh Produce'),
      quantity: order.quantity || order.items?.reduce((s, i) => s + (Number(i.quantity) || 1), 0) || 1,
      unit: order.unit || order.items?.[0]?.unit || 'kg',
      total: Number(order.total || order.totalAmount || 0),
      subtotal: Number(order.subtotal || 0),
      deliveryFee: Number(order.deliveryFee || 0),
      deliveryAddress: order.deliveryAddress || order.address || '24 Flower Road, Colombo 07',
      paymentMethod: order.paymentMethod || 'Cash on Delivery',
      date: order.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };
    setOrders((current) => [formattedOrder, ...current]);
    return formattedOrder;
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        totalCount,
        orders,
        addOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
