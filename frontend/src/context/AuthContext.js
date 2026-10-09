import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Sahan Perera',
    email: 'sahan@gmail.com',
    phone: '+94 77 123 4567',
    address: '24 Flower Road, Colombo 07',
    role: 'Buyer',
    isLoggedIn: true,
  });

  const updateEmail = (newEmail) => {
    if (newEmail && newEmail.trim()) {
      setUser((current) => ({
        ...current,
        email: newEmail.trim().toLowerCase(),
      }));
    }
  };

  const updateUser = (data) => {
    setUser((current) => ({
      ...current,
      ...data,
      email: data.email ? data.email.trim().toLowerCase() : current.email,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        updateEmail,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
