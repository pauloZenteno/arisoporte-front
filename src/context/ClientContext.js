import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getClientsFiltered, updateClientStatus, updateClient } from '../services/clientService';
import { getQuotes } from '../services/quoteService';
import { getUserInfo } from '../services/authService';
import { AdminRoleEnum } from '../utils/constants';

const ClientContext = createContext();

// --- MAPA DE RESTRICCIÓN ESTRICTA ---
const STRICT_USER_FILTERS = {
  // ID USUARIO (Paola)      ->    SELLER ID (Paola)
  '5m2XOBMXzJ4NZkwr':              'lK20zbAk4JRDVEa1',
  
  // ID USUARIO (Karen)      ->    SELLER ID (Karen)
  'b8QWwNJYxAGr5gER':              'NZ9DezJWqMQOnRE3'
};

export const ClientProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);

  const [demos, setDemos] = useState([]);
  const [loadingDemos, setLoadingDemos] = useState(false);
  const [demoPage, setDemoPage] = useState(1);
  const [hasMoreDemos, setHasMoreDemos] = useState(true);
  
  // 1. DEMOS: Se queda en 'TrialEndsAt' (Por Vencer)
  const [activeDemoFilter, setActiveDemoFilter] = useState({ 
    sortParam: 'TrialEndsAt', 
    isDescending: false, 
    sellerId: null 
  });

  const [actives, setActives] = useState([]);
  const [loadingActives, setLoadingActives] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [hasMoreActives, setHasMoreActives] = useState(true);
  
  // 2. ACTIVOS: Cambiado a 'BusinessName' (Alfabético) por defecto
  const [activeActiveFilter, setActiveActiveFilter] = useState({ 
    sortParam: 'BusinessName', 
    isDescending: false, 
    sellerId: null 
  });

  const [inactives, setInactives] = useState([]);
  const [loadingInactives, setLoadingInactives] = useState(false);
  const [inactivePage, setInactivePage] = useState(1);
  const [hasMoreInactives, setHasMoreInactives] = useState(true);
  
  // 3. INACTIVOS: Cambiado a 'BusinessName' (Alfabético) por defecto
  const [activeInactiveFilter, setActiveInactiveFilter] = useState({ 
    sortParam: 'BusinessName', 
    isDescending: false, 
    sellerId: null 
  });

  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quotePage, setQuotePage] = useState(1);
  const [hasMoreQuotes, setHasMoreQuotes] = useState(true);

  const PAGE_SIZE = 10;

  const appendUnique = (prevItems, newItems) => {
    const existingIds = new Set(prevItems.map(item => item.id));
    const uniqueNew = newItems.filter(item => !existingIds.has(item.id));
    return [...prevItems, ...uniqueNew];
  };

  // --- FETCH GENERICO BLINDADO ---
  const fetchGeneric = async (category, page, filters, explicitUser = null) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return { newItems: [], totalCount: 0, success: false };

    let currentUser = explicitUser || userProfile;
    if (!currentUser) {
        currentUser = await getUserInfo();
    }

    const isSeller = currentUser?.roleId === AdminRoleEnum.Seller;
    const sellerId = currentUser?.sellerId;
    const currentUserId = currentUser?.id;

    let strictSellerId = null;
    if (currentUserId && STRICT_USER_FILTERS[currentUserId]) {
        strictSellerId = STRICT_USER_FILTERS[currentUserId];
    }

    let params = {
      pageNumber: page,
      pageSize: PAGE_SIZE,
      sortParam: 'BusinessName',
      isDescending: false,
      filterActives: true, 
      ...filters 
    };

    if (strictSellerId) {
        params.sellerId = strictSellerId;
    } else if (isSeller && sellerId) {
        params.sellerId = sellerId;
    }

    Object.keys(params).forEach(key => (params[key] === null || params[key] === undefined) && delete params[key]);

    try {
      const result = await getClientsFiltered(params);
      let newItems = Array.isArray(result) ? result : (result.items || result.data || []);
      
      // FILTRADO FINAL EN FRONTEND (DOBLE SEGURIDAD)
      if (strictSellerId) {
          newItems = newItems.filter(item => {
              if (!item.sellerId) return false;
              return String(item.sellerId) === String(strictSellerId);
          });
      } else if (isSeller && sellerId) {
          newItems = newItems.filter(item => item.sellerId === sellerId);
      }

      return { newItems, totalCount: result.totalCount || 0, success: true }; 
    } catch (error) {
      return { newItems: [], totalCount: 0, success: false };
    }
  };

  const fetchDemos = async (page = 1, filters = activeDemoFilter, shouldRefresh = false, explicitUser = null) => {
    if (loadingDemos || (!hasMoreDemos && !shouldRefresh)) return;
    setLoadingDemos(true);
    const apiFilters = { sortParam: filters.sortParam, isDescending: filters.isDescending, sellerId: filters.sellerId, statuses: 1, types: true, filterActives: true };
    
    const { newItems, success } = await fetchGeneric('demos', page, apiFilters, explicitUser);
    
    if (shouldRefresh || page === 1) {
      setDemos(newItems);
      setDemoPage(1);
      setHasMoreDemos(success && newItems.length >= PAGE_SIZE);
    } else if (success && newItems.length > 0) {
      setDemos(prev => appendUnique(prev, newItems));
      setDemoPage(page);
      setHasMoreDemos(newItems.length >= PAGE_SIZE);
    } else {
      setHasMoreDemos(false);
    }
    setLoadingDemos(false);
  };

  const fetchActives = async (page = 1, filters = activeActiveFilter, shouldRefresh = false, explicitUser = null) => {
    if (loadingActives || (!hasMoreActives && !shouldRefresh)) return;
    setLoadingActives(true);
    
    // NOTA: Si filters.sortParam ya es 'BusinessName', se usa tal cual.
    let finalSort = filters.sortParam === 'TrialEndsAt' ? 'CreatedAt' : filters.sortParam;
    
    const apiFilters = { statuses: 1, types: false, sortParam: finalSort, isDescending: filters.isDescending, sellerId: filters.sellerId, filterActives: true };
    
    const { newItems, success } = await fetchGeneric('actives', page, apiFilters, explicitUser);
    
    if (shouldRefresh || page === 1) {
      setActives(newItems);
      setActivePage(1);
      setHasMoreActives(success && newItems.length >= PAGE_SIZE);
    } else if (success && newItems.length > 0) {
      setActives(prev => appendUnique(prev, newItems));
      setActivePage(page);
      setHasMoreActives(newItems.length >= PAGE_SIZE);
    } else {
      setHasMoreActives(false);
    }
    setLoadingActives(false);
  };

  const fetchInactives = async (page = 1, filters = activeInactiveFilter, shouldRefresh = false, explicitUser = null) => {
    if (loadingInactives || (!hasMoreInactives && !shouldRefresh)) return;
    setLoadingInactives(true);

    let finalSort = filters.sortParam === 'TrialEndsAt' ? 'CreatedAt' : filters.sortParam;
    
    const apiFilters = { statuses: 2, sortParam: finalSort, isDescending: filters.isDescending, sellerId: filters.sellerId, filterActives: true };
    
    const { newItems, success } = await fetchGeneric('inactives', page, apiFilters, explicitUser);
    
    if (shouldRefresh || page === 1) {
      setInactives(newItems);
      setInactivePage(1);
      setHasMoreInactives(success && newItems.length >= PAGE_SIZE);
    } else if (success && newItems.length > 0) {
      setInactives(prev => appendUnique(prev, newItems));
      setInactivePage(page);
      setHasMoreInactives(newItems.length >= PAGE_SIZE);
    } else {
      setHasMoreInactives(false);
    }
    setLoadingInactives(false);
  };

  const fetchQuotes = async (page = 1, shouldRefresh = false) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return;
    if (loadingQuotes || (!hasMoreQuotes && !shouldRefresh)) return;

    setLoadingQuotes(true);
    try {
      const data = await getQuotes(page, PAGE_SIZE, 'Id', true); 
      const items = Array.isArray(data) ? data : (data.items || data.data || []);
      if (shouldRefresh || page === 1) {
          setQuotes(items);
          setQuotePage(1);
          setHasMoreQuotes(items.length >= PAGE_SIZE);
      } else {
          setQuotes(prev => appendUnique(prev, items));
          setQuotePage(page);
          setHasMoreQuotes(items.length >= PAGE_SIZE);
      }
    } catch (error) {
      if (page === 1) setQuotes([]); 
    } finally {
      setLoadingQuotes(false);
    }
  };

  const applyDemoFilter = (newSortParam, isDesc, newSellerId) => {
    const newFilters = { ...activeDemoFilter, sortParam: newSortParam ?? activeDemoFilter.sortParam, isDescending: isDesc ?? activeDemoFilter.isDescending, sellerId: newSellerId !== undefined ? newSellerId : activeDemoFilter.sellerId };
    setActiveDemoFilter(newFilters);
    setHasMoreDemos(true); 
    fetchDemos(1, newFilters, true);
  };

  const applyInactiveFilter = (newSortParam, isDesc, newSellerId) => {
    const newFilters = { ...activeInactiveFilter, sortParam: newSortParam ?? activeInactiveFilter.sortParam, isDescending: isDesc ?? activeInactiveFilter.isDescending, sellerId: newSellerId !== undefined ? newSellerId : activeInactiveFilter.sellerId };
    setActiveInactiveFilter(newFilters);
    setHasMoreInactives(true); 
    fetchInactives(1, newFilters, true);
  };

  const applyActiveFilter = (newSortParam, isDesc, newSellerId) => {
    const newFilters = { ...activeActiveFilter, sortParam: newSortParam ?? activeActiveFilter.sortParam, isDescending: isDesc ?? activeActiveFilter.isDescending, sellerId: newSellerId !== undefined ? newSellerId : activeActiveFilter.sellerId };
    setActiveActiveFilter(newFilters);
    setHasMoreActives(true); 
    fetchActives(1, newFilters, true);
  };

  const reactivateClient = async (clientId) => {
    try {
      await updateClientStatus(clientId, 1, false);
      Alert.alert('Éxito', 'Cliente reactivado correctamente');
      fetchInactives(1, activeInactiveFilter, true);
      fetchActives(1, activeActiveFilter, true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo reactivar al cliente');
    }
  };

  const suspendClient = async (clientId) => {
    try {
      await updateClientStatus(clientId, 2, false);
      Alert.alert('Éxito', 'Cliente suspendido correctamente');
      fetchActives(1, activeActiveFilter, true);
      fetchInactives(1, activeInactiveFilter, true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo suspender al cliente');
    }
  };

  const activateDemo = async (client) => {
    try {
      const updatedClientData = { ...client, isTrial: false };
      await updateClient(client.id, updatedClientData);
      Alert.alert('Éxito', 'El cliente ha sido activado correctamente');
      fetchDemos(1, activeDemoFilter, true);
      fetchActives(1, activeActiveFilter, true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo activar al cliente');
    }
  };

  const loadInitialData = async (explicitUser = null) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return;

    let currentUser = explicitUser;
    
    if (currentUser) {
        setUserProfile(currentUser);
    } else {
        try {
            currentUser = await getUserInfo();
            if (currentUser) setUserProfile(currentUser);
        } catch (e) {}
    }

    await Promise.all([
        fetchDemos(1, activeDemoFilter, true, currentUser),
        fetchActives(1, activeActiveFilter, true, currentUser), 
        fetchInactives(1, activeInactiveFilter, true, currentUser),
        fetchQuotes(1, true)
    ]);
  };

  useEffect(() => {
    const init = async () => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            loadInitialData(); 
        }
    };
    init();
  }, []);

  return (
    <ClientContext.Provider value={{ 
      userProfile, setUserProfile,
      loadInitialData,
      demos, loadingDemos, hasMoreDemos, fetchDemos: () => fetchDemos(demoPage + 1), refreshDemos: () => fetchDemos(1, activeDemoFilter, true), applyDemoFilter, activeDemoFilter,
      actives, loadingActives, hasMoreActives, fetchActives: () => fetchActives(activePage + 1), refreshActives: () => fetchActives(1, activeActiveFilter, true), applyActiveFilter, activeActiveFilter,
      inactives, loadingInactives, hasMoreInactives, fetchInactives: () => fetchInactives(inactivePage + 1), refreshInactives: () => fetchInactives(1, activeInactiveFilter, true), applyInactiveFilter, activeInactiveFilter,
      quotes, loadingQuotes, hasMoreQuotes, fetchQuotes: () => fetchQuotes(quotePage + 1), refreshQuotes: () => fetchQuotes(1, true),
      reactivateClient,
      suspendClient,
      activateDemo
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => useContext(ClientContext);