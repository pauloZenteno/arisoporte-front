import React, { createContext, useState, useEffect, useContext } from 'react';
import { validateStartupSession, clearSession, getUserInfo, setUserInfo as saveUserInfoStorage } from '../services/authService';

const AuthContext = createContext();

const HARDCODED_SELLER_RELATIONS = {
  'b8QWwNJYxAGr5gER': 'NZ9DezJWqMQOnRE3', // Karen 
  '5m2XOBMXzJ4NZkwr': 'lK20zbAk4JRDVEa1', // Paola 
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadStorageData();
  }, []);

  const patchUser = (userData) => {
    if (!userData || !userData.id) return userData;
    const patched = { ...userData };
    if (!patched.sellerId && HARDCODED_SELLER_RELATIONS[patched.id]) {
        patched.sellerId = HARDCODED_SELLER_RELATIONS[patched.id];
    }
    return patched;
  };

  const loadStorageData = async () => {
    try {
      const isValid = await validateStartupSession();
      
      if (isValid) {
        let userData = await getUserInfo();
        if (userData) {
            const patchedUser = patchUser(userData);
            setUser(patchedUser);
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
        await saveUserInfoStorage(userToSet);
        setUser(userToSet);
        setIsAuthenticated(true);
    } else {
        console.error("Error: Datos de usuario inválidos en signIn.");
    }
  };

  const signOut = async () => {
    try {
        await clearSession();
    } catch (error) {
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoading, 
      isAuthenticated, 
      user, 
      userProfile: user, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);