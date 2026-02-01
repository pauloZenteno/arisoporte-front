import React, { createContext, useState, useEffect, useContext } from 'react';
import { validateStartupSession, clearSession, getUserInfo } from '../services/authService';

const AuthContext = createContext();

// Mapa de corrección de IDs (Backup)
const HARDCODED_SELLER_RELATIONS = {
  'b8QWwNJYxAGr5gER': 'NZ9DezJWqMQOnRE3', // Karen 
  '5m2XOBMXzJ4NZkwr': 'lK20zbAk4JRDVEa1', // Paola 
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadStorageData();
  }, []);

  const patchUser = (user) => {
    if (!user || !user.id) return user;
    if (!user.sellerId && HARDCODED_SELLER_RELATIONS[user.id]) {
        user.sellerId = HARDCODED_SELLER_RELATIONS[user.id];
    }
    return user;
  };

  const loadStorageData = async () => {
    try {
      const isValid = await validateStartupSession();
      
      if (isValid) {
        let user = await getUserInfo();
        user = patchUser(user);
        
        if (user) {
            setUserProfile(user);
            setIsAuthenticated(true);
        } else {
            await signOut();
        }
      } else {
        await signOut();
      }
    } catch (e) {
      await signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (userData) => {
    const userToSet = patchUser(userData);

    if (userToSet && userToSet.id) {
        setUserProfile(userToSet);
        setIsAuthenticated(true);
    } else {
        console.error("Error: Datos de usuario inválidos en signIn.");
    }
  };

  const signOut = async () => {
    try {
        await clearSession();
    } catch (error) {
        // Error silencioso
    }
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, userProfile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);