import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get('/orders');
      if (Array.isArray(res.data)) {
        const mappedOrders = res.data.map((o) => ({
          id: o.orderNumber ? o.orderNumber.replace('#', '') : (o._id ? o._id.slice(-6).toUpperCase() : `ORD-${Date.now()}`),
          _id: o._id,
          items: (o.items || []).map((it) => ({
            id: it._id || `it-${Math.random()}`,
            name: it.productName || it.name || 'Fresh Item',
            unitPrice: it.pricePerKg || it.unitPrice || 0,
            quantity: it.quantity || 1,
            unit: it.unit || 'kg',
            image: it.image || '',
            farmer: it.farmer || 'Local Farm',
          })),
          itemName: o.items?.[0]?.productName || o.items?.[0]?.name || 'Fresh Produce',
          quantity: o.items?.reduce((s, i) => s + (Number(i.quantity) || 1), 0) || 1,
          unit: o.items?.[0]?.unit || 'kg',
          total: Number(o.totalAmount || 0),
          subtotal: Math.max(0, Number(o.totalAmount || 0) - Number(o.deliveryFee || 0)),
          deliveryFee: Number(o.deliveryFee || 0),
          deliveryAddress: o.deliveryAddress || '24 Flower Road, Colombo 07',
          paymentMethod: o.paymentMethod || 'Cash on Delivery',
          date: o.createdAt
            ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: o.status || 'Confirmed',
          otpCode: o.otpCode,
          createdAt: o.createdAt || new Date().toISOString(),
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.log('Error fetching backend orders:', err?.message);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  const addOrder = async (order) => {
    const orderCode = order.id || `SK${Math.floor(1000 + Math.random() * 9000)}`;
    const formattedOrder = {
      id: orderCode,
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

    // Optimistically update local state
    setOrders((current) => [formattedOrder, ...current]);

    // Persist to backend MongoDB
    try {
      const payload = {
        orderNumber: `#${orderCode}`,
        items: (order.items || []).map((it) => ({
          productName: it.name || it.productName || 'Fresh Item',
          name: it.name || it.productName || 'Fresh Item',
          quantity: Number(it.quantity) || 1,
          pricePerKg: Number(it.unitPrice || it.price || 0),
          unitPrice: Number(it.unitPrice || it.price || 0),
          unit: it.unit || 'kg',
          image: it.image || '',
          farmer: it.farmer || '',
        })),
        totalAmount: Number(order.total || order.totalAmount || 0),
        deliveryFee: Number(order.deliveryFee || 0),
        deliveryAddress: order.deliveryAddress || '24 Flower Road, Colombo 07',
        paymentMethod: order.paymentMethod || 'Cash on Delivery',
        otpCode: order.otpCode || '1234',
        status: 'Confirmed',
      };
      await api.post('/orders', payload);
    } catch (err) {
      console.log('Error saving order to backend:', err?.message);
    }

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
        loadingOrders,
        fetchOrders,
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
