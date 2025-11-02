import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/api.js';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balanceWarning, setBalanceWarning] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await API.get('/auth/profile');
      const userData = response.data;
      setUser(userData);
      
      // Check for balance warning
      if (userData.balance <= 0) {
        setBalanceWarning(true);
      } else {
        setBalanceWarning(false);
      }
      
      return userData;
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      setBalanceWarning(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (newBalance) => {
    try {
      const response = await API.put('/auth/balance', { balance: newBalance });
      const updatedUser = response.data;
      setUser(updatedUser);
      
      // Update balance warning
      if (updatedUser.balance <= 0) {
        setBalanceWarning(true);
      } else {
        setBalanceWarning(false);
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    return await fetchUser();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    balanceWarning,
    fetchUser,
    updateBalance,
    refreshUser,
    setUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

